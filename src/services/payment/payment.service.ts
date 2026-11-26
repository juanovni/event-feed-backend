import { randomUUID } from "crypto";
import prisma from "../../prisma/client";

type PurchaseItem = { eventId: string; eventTicketTypeId: string; quantity: number };

function configuration() {
  const { PAYPHONE_TOKEN, PAYPHONE_STORE_ID, PAYPHONE_RESPONSE_URL, TICKET_TAX_RATE } = process.env;
  const taxRate = Number(TICKET_TAX_RATE);
  if (!PAYPHONE_TOKEN || !PAYPHONE_STORE_ID || !PAYPHONE_RESPONSE_URL ||
      !TICKET_TAX_RATE || !Number.isFinite(taxRate) || taxRate < 0 || taxRate > 1) {
    throw new Error("La configuración de pagos está incompleta.");
  }
  const responseUrl = new URL(PAYPHONE_RESPONSE_URL);
  if (responseUrl.protocol !== "https:" &&
      !(responseUrl.protocol === "http:" && responseUrl.hostname === "localhost")) {
    throw new Error("La URL de respuesta de pagos no es válida.");
  }
  return { token: PAYPHONE_TOKEN, storeId: PAYPHONE_STORE_ID, responseUrl: responseUrl.href, taxRate };
}

async function requestPayphone(path: string, token: string, body: object) {
  const response = await fetch(`https://pay.payphonetodoesposible.com/api/button/${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error("PayPhone no pudo procesar la solicitud.");
  return await response.json() as Record<string, any>;
}

export async function quotePayment(items: PurchaseItem[]) {
  const config = configuration();
  if (!Array.isArray(items) || !items.length || items.length > 20 ||
      items.some(item => !item || typeof item.eventId !== "string" ||
        typeof item.eventTicketTypeId !== "string" ||
        !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 50) ||
      new Set(items.map(item => item.eventTicketTypeId)).size !== items.length ||
      new Set(items.map(item => item.eventId)).size !== 1) {
    throw new Error("La selección de entradas no es válida.");
  }
  const types = await prisma.eventTicketType.findMany({
    where: { id: { in: items.map(item => item.eventTicketTypeId) } },
    include: { event: true },
  });
  const lines = items.map(item => {
    const type = types.find(entry => entry.id === item.eventTicketTypeId);
    if (!type || type.eventId !== item.eventId || type.event.eventDate <= new Date() ||
        (type.validUntil && type.validUntil < new Date()) || type.quantity < item.quantity ||
        !Number.isFinite(type.price) || type.price < 0) {
      throw new Error("Una entrada no está disponible.");
    }
    return { name: type.name, quantity: item.quantity, amount: Math.round(type.price * 100) * item.quantity };
  });
  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);
  const tax = Math.round(subtotal * config.taxRate);
  return { lines, subtotal, tax, total: subtotal + tax, taxRate: config.taxRate, currency: "USD" };
}

export async function preparePayment(userId: string, items: PurchaseItem[], expectedTotal?: number) {
  const config = configuration();
  if (!Array.isArray(items) || items.length === 0 || items.length > 20 ||
      items.some(item => !item || typeof item.eventId !== "string" ||
        typeof item.eventTicketTypeId !== "string" ||
        !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 50) ||
      new Set(items.map(item => item.eventTicketTypeId)).size !== items.length ||
      new Set(items.map(item => item.eventId)).size !== 1) {
    throw new Error("La selección de entradas no es válida.");
  }

  const paymentId = randomUUID();
  const purchase = await prisma.$transaction(async tx => {
    const types = await tx.eventTicketType.findMany({
      where: { id: { in: items.map(item => item.eventTicketTypeId) } },
      include: { event: true },
    });
    if (types.length !== items.length) throw new Error("Una entrada no existe.");
    let subtotal = 0;
    for (const item of [...items].sort((a, b) => a.eventTicketTypeId.localeCompare(b.eventTicketTypeId))) {
      const type = types.find(entry => entry.id === item.eventTicketTypeId);
      if (!type || type.eventId !== item.eventId || type.event.eventDate <= new Date() ||
          (type.validUntil && type.validUntil < new Date()) || !Number.isFinite(type.price) || type.price < 0) {
        throw new Error("Una entrada no está disponible.");
      }
      const updated = await tx.eventTicketType.updateMany({
        where: { id: type.id, quantity: { gte: item.quantity } },
        data: { quantity: { decrement: item.quantity } },
      });
      if (updated.count !== 1) throw new Error("No quedan suficientes entradas.");
      subtotal += Math.round(type.price * 100) * item.quantity;
    }
    const tax = Math.round(subtotal * config.taxRate);
    if (expectedTotal !== undefined && (!Number.isSafeInteger(expectedTotal) || expectedTotal !== subtotal + tax)) {
      throw new Error("El precio cambió. Actualiza el resumen antes de continuar.");
    }
    const ticket = await tx.ticket.create({
      data: {
        userId, subTotal: subtotal / 100, tax: tax / 100, total: (subtotal + tax) / 100,
        itemsInOrder: items.reduce((sum, item) => sum + item.quantity, 0),
        TicketItem: { create: items.map(item => ({
          eventId: item.eventId,
          eventTicketTypeId: item.eventTicketTypeId,
          quantity: item.quantity,
          price: types.find(type => type.id === item.eventTicketTypeId)!.price,
        })) },
        payment: { create: { id: paymentId } },
      },
    });
    return { ticket, subtotal, tax };
  });

  if (purchase.subtotal === 0) {
    await finalizePayment(paymentId, userId, null);
    return { status: "approved", ticketId: purchase.ticket.id };
  }

  const response = await requestPayphone("Prepare", config.token, {
    amount: purchase.subtotal + purchase.tax,
    amountWithTax: purchase.subtotal,
    amountWithoutTax: 0,
    tax: purchase.tax,
    currency: "USD",
    clientTransactionId: paymentId,
    storeId: config.storeId,
    responseUrl: config.responseUrl,
    reference: `Ticket ${purchase.ticket.id}`,
  });
  const paymentUrl = new URL(response.payWithCard);
  if (paymentUrl.protocol !== "https:" || paymentUrl.hostname !== "pay.payphonetodoesposible.com") {
    throw new Error("La dirección de pago no es válida.");
  }
  return { paymentUrl: paymentUrl.href };
}

async function finalizePayment(paymentId: string, userId: string, transactionId: string | null) {
  return prisma.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${paymentId}))`;
    const attempt = await tx.paymentAttempt.findUnique({
      where: { id: paymentId },
      include: { ticket: { include: { TicketItem: true } } },
    });
    if (!attempt || attempt.ticket.userId !== userId) throw new Error("Compra no encontrada.");
    if (attempt.status === "approved") return { status: "approved", ticketId: attempt.ticketId };
    if (attempt.status !== "pending") throw new Error("La compra ya no está pendiente.");
    await tx.paymentAttempt.update({ where: { id: paymentId }, data: { status: "approved", providerId: transactionId } });
    await tx.ticket.update({ where: { id: attempt.ticketId }, data: { isPaid: true, paidAt: new Date(), transactionId } });
    for (const eventId of new Set(attempt.ticket.TicketItem.map(item => item.eventId))) {
      const created = await tx.eventAttendance.createMany({ data: [{ eventId, userId }], skipDuplicates: true });
      if (created.count) await tx.event.update({ where: { id: eventId }, data: { attendees: { increment: 1 } } });
    }
    return { status: "approved", ticketId: attempt.ticketId };
  });
}

export async function confirmPayment(userId: string, id: unknown, clientTransactionId: unknown) {
  if (typeof clientTransactionId !== "string" || !/^[0-9a-f-]{36}$/i.test(clientTransactionId) ||
      !/^\d+$/.test(String(id)) || !Number.isSafeInteger(Number(id)) || Number(id) <= 0) {
    throw new Error("Datos de pago inválidos.");
  }
  const attempt = await prisma.paymentAttempt.findUnique({
    where: { id: clientTransactionId }, include: { ticket: true },
  });
  if (!attempt || attempt.ticket.userId !== userId) throw new Error("Compra no encontrada.");
  if (attempt.status === "approved") {
    if (attempt.providerId !== String(id)) throw new Error("Transacción incorrecta.");
    return { status: "approved", ticketId: attempt.ticketId };
  }
  if (attempt.status !== "pending") return { status: attempt.status };
  const config = configuration();
  const result = await requestPayphone("V2/Confirm", config.token, {
    id: Number(id), clientTxId: clientTransactionId,
  });
  if (result.clientTransactionId !== clientTransactionId ||
      String(result.transactionId) !== String(id) ||
      result.amount !== Math.round(attempt.ticket.total * 100) || result.currency !== "USD") {
    throw new Error("Los datos del pago no coinciden con la compra.");
  }
  if (result.statusCode === 3 && result.transactionStatus === "Approved") {
    return finalizePayment(clientTransactionId, userId, String(id));
  }
  if (result.statusCode === 2 && result.transactionStatus === "Canceled") {
    await prisma.$transaction(async tx => {
      const changed = await tx.paymentAttempt.updateMany({
        where: { id: clientTransactionId, status: "pending" }, data: { status: "canceled" },
      });
      if (changed.count) {
        const items = await tx.ticketItem.findMany({ where: { ticketId: attempt.ticketId } });
        for (const item of items) {
          if (item.eventTicketTypeId) await tx.eventTicketType.update({
            where: { id: item.eventTicketTypeId }, data: { quantity: { increment: item.quantity } },
          });
        }
      }
    });
    return { status: "canceled" };
  }
  throw new Error("El estado del pago no es definitivo.");
}
