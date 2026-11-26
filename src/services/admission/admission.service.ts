import prisma from "../../prisma/client";

async function isManager(userId: string, eventId: string) {
  const [user, event] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { role: true } }),
    prisma.event.findUnique({ where: { id: eventId }, select: { userId: true } }),
  ]);
  return !!event && (user?.role === "admin" || (user?.role === "publisher" && event.userId === userId));
}

export async function inviteStaff(actorId: string, eventId: string, email: string) {
  if (!await isManager(actorId, eventId)) throw new Error("No autorizado.");
  if (typeof email !== "string" || !email.trim()) throw new Error("Correo inválido.");
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() }, select: { id: true } });
  if (!user) throw new Error("La persona debe tener una cuenta registrada.");
  return prisma.eventAccessAssignment.upsert({
    where: { eventId_userId: { eventId, userId: user.id } },
    create: { eventId, userId: user.id },
    update: { status: "pending", revokedAt: null, acceptedAt: null },
    select: { id: true, status: true },
  });
}

export async function listStaff(actorId: string, eventId: string) {
  if (!await isManager(actorId, eventId)) throw new Error("No autorizado.");
  return prisma.eventAccessAssignment.findMany({
    where: { eventId },
    select: { id: true, status: true, user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function revokeStaff(actorId: string, eventId: string, assignmentId: string) {
  if (!await isManager(actorId, eventId)) throw new Error("No autorizado.");
  const result = await prisma.eventAccessAssignment.updateMany({
    where: { id: assignmentId, eventId, status: { in: ["pending", "accepted"] } },
    data: { status: "revoked", revokedAt: new Date() },
  });
  if (!result.count) throw new Error("Asignación no encontrada.");
}

export async function getAssignments(userId: string) {
  return prisma.eventAccessAssignment.findMany({
    where: { userId, status: { in: ["pending", "accepted"] } },
    select: { id: true, status: true, event: { select: { id: true, title: true, eventDate: true, user: { select: { name: true, username: true } } } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function acceptAssignment(userId: string, id: string) {
  const result = await prisma.eventAccessAssignment.updateMany({
    where: { id, userId, status: "pending" },
    data: { status: "accepted", acceptedAt: new Date() },
  });
  if (!result.count) throw new Error("Invitación no encontrada.");
}

export async function listPasses(userId: string, accessId: string) {
  if (accessId.startsWith("attendance-")) {
    const eventId = accessId.slice("attendance-".length);
    const attendance = await prisma.eventAttendance.findUnique({
      where: { userId_eventId: { userId, eventId } },
      include: { event: { select: { title: true, cost: true, eventTicketTypes: { select: { price: true } } } } },
    });
    if (!attendance) throw new Error("Acceso no encontrado.");
    const hasFreeAccess = attendance.event.eventTicketTypes.length
      ? attendance.event.eventTicketTypes.some(type => type.price === 0)
      : attendance.event.cost === 0;
    if (!hasFreeAccess) throw new Error("Acceso no encontrado.");
    await prisma.admissionPass.createMany({
      data: [{ eventId, userId, attendanceId: attendance.id }],
      skipDuplicates: true,
    });
    return prisma.admissionPass.findMany({
      where: { userId, attendanceId: attendance.id },
      select: { id: true, token: true, redeemedAt: true },
    });
  }
  const ticket = await prisma.ticket.findFirst({
    where: { id: accessId, userId, isPaid: true },
    include: { TicketItem: true },
  });
  if (!ticket) throw new Error("Entrada no encontrada.");
  const data = ticket.TicketItem.flatMap(item => Array.from({ length: item.quantity }, (_, unitIndex) => ({
    eventId: item.eventId, userId, ticketItemId: item.id, unitIndex,
  })));
  if (data.length) await prisma.admissionPass.createMany({ data, skipDuplicates: true });
  const passes = await prisma.admissionPass.findMany({
    where: { userId, ticketItemId: { in: ticket.TicketItem.map(item => item.id) } },
    select: { id: true, token: true, redeemedAt: true, unitIndex: true, ticketItemId: true },
    orderBy: [{ ticketItemId: "asc" }, { unitIndex: "asc" }],
  });
  const typeIds = ticket.TicketItem.map(item => item.eventTicketTypeId).filter((id): id is string => id !== null);
  const types = await prisma.eventTicketType.findMany({ where: { id: { in: typeIds } }, select: { id: true, name: true } });
  return passes.map(pass => {
    const item = ticket.TicketItem.find(entry => entry.id === pass.ticketItemId);
    return { ...pass, name: types.find(type => type.id === item?.eventTicketTypeId)?.name ?? "Entrada" };
  });
}

export async function redeemPass(actorId: string, eventId: string, token: string) {
  const allowed = await isManager(actorId, eventId) || !!await prisma.eventAccessAssignment.findFirst({
    where: { userId: actorId, eventId, status: "accepted" }, select: { id: true },
  });
  if (!allowed) throw new Error("No autorizado.");
  if (typeof token !== "string" || !/^[0-9a-f-]{36}$/i.test(token)) {
    await prisma.admissionScan.create({ data: { eventId, actorId, result: "invalid" } });
    return { status: "invalid" };
  }
  return prisma.$transaction(async tx => {
    const pass = await tx.admissionPass.findUnique({
      where: { token },
      include: { ticketItem: { include: { ticket: { select: { isPaid: true } } } } },
    });
    if (!pass || pass.eventId !== eventId || (pass.ticketItem && !pass.ticketItem.ticket.isPaid)) {
      await tx.admissionScan.create({ data: { eventId, actorId, result: "invalid" } });
      return { status: "invalid" };
    }
    const changed = await tx.admissionPass.updateMany({
      where: { id: pass.id, redeemedAt: null },
      data: { redeemedAt: new Date(), redeemedBy: actorId },
    });
    const current = await tx.admissionPass.findUnique({ where: { id: pass.id }, select: { redeemedAt: true } });
    const status = changed.count ? "redeemed" : "already_redeemed";
    await tx.admissionScan.create({ data: { eventId, actorId, passId: pass.id, result: status } });
    const type = pass.ticketItem?.eventTicketTypeId
      ? await tx.eventTicketType.findUnique({ where: { id: pass.ticketItem.eventTicketTypeId }, select: { name: true } })
      : null;
    return { status, redeemedAt: current?.redeemedAt, ticketName: type?.name ?? "Entrada" };
  });
}

export async function scanHistory(actorId: string, eventId: string) {
  if (!await isManager(actorId, eventId)) throw new Error("No autorizado.");
  return prisma.admissionScan.findMany({
    where: { eventId },
    select: { id: true, result: true, createdAt: true, actor: { select: { name: true, username: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}
