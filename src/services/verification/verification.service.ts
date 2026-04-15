import prisma from "../../prisma/client";
import { sendVerificationEmail } from "../notification/email.service";
import { email } from 'zod';

const CODE_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 3;

const generateCode = (): string =>
  Math.floor(1000 + Math.random() * 9000).toString();

export const sendVerificationCode = async (email: string) => {

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, username: true, name: true, email: true },
  });

  if (!user) throw new Error("Usuario no encontrado");

  // Invalidar códigos anteriores pendientes del mismo usuario
  await prisma.verificationCode.deleteMany({
    where: { userId: user.id, usedAt: null },
  });

  const code = generateCode();
  const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);

  await prisma.verificationCode.create({
    data: { userId: user.id, code, expiresAt },
  });

  await sendVerificationEmail(email, user.username, code);

  return { message: "Código enviado al correo registrado" };
};

export const verifyCode = async (email: string, inputCode: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) throw new Error("Usuario no encontrado");

  const record = await prisma.verificationCode.findFirst({
    where: { userId: user.id, usedAt: null },
    orderBy: { createdAt: "desc" },
  });

  // ── Caso: no existe ningún código activo
  if (!record) {
    throw new Error("No hay un código de verificación activo. Solicita uno nuevo.");
  }

  // ── Caso: expirado
  if (new Date() > record.expiresAt) {
    await prisma.verificationCode.delete({ where: { id: record.id } });
    throw new Error("El código ha expirado. Solicita uno nuevo.");
  }

  // ── Caso: demasiados intentos
  if (record.attempts >= MAX_ATTEMPTS) {
    await prisma.verificationCode.delete({ where: { id: record.id } });
    throw new Error("Demasiados intentos fallidos. Solicita un nuevo código.");
  }

  // ── Caso: código incorrecto → incrementar intentos
  if (record.code !== inputCode) {
    const remaining = MAX_ATTEMPTS - record.attempts - 1;

    await prisma.verificationCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });

    if (remaining === 0) {
      await prisma.verificationCode.delete({ where: { id: record.id } });
      throw new Error("Código incorrecto. Has agotado todos los intentos. Solicita uno nuevo.");
    }

    throw new Error(`Código incorrecto. Te quedan ${remaining} intento(s).`);
  }

  // ── Éxito: marcar como usado
  await prisma.verificationCode.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  return { verified: true, message: "Código verificado correctamente" };
};