
import prisma from "../../prisma/client";
import bcryptjs from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../../config/jwt";
import { RegisterDto } from "../../dtos/user/register.dto";
import { sendVerificationCode } from "../verification/verification.service";

export const preRegisterService = async (email: string, password: string) => {
  const existing = await prisma.user.findUnique({ where: { email } });

  const hashedPassword = bcryptjs.hashSync(password, 10);

  // 🟡 CASO 1: Usuario existe pero NO ha verificado
  if (existing && !existing.isVerified) {
    // 👉 Opcional: actualizar password (por si lo cambió)
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        password: hashedPassword,
      },
    });

    await sendVerificationCode(existing.email);

    return {
      message: "Ya tenías un registro pendiente. Te reenviamos el código.",
      userId: existing.id,
    };
  }

  // 🔴 CASO 2: Usuario ya registrado completamente
  if (existing && existing.isVerified) {
    throw new Error("El correo ya está registrado");
  }

  // 🟢 CASO 3: Usuario nuevo
  const user = await prisma.user.create({
    data: {
      name: '',
      email,
      password: hashedPassword,
      username: email.split("@")[0],
      isVerified: false,
    },
  });

  await sendVerificationCode(user.email);

  return {
    message: "Código enviado al correo",
    userId: user.id,
  };
};

export const completeRegisterService = async (data: RegisterDto) => {
  const {
    name,
    lastName,
    email,
    password,
    birthdate,
    phone,
    gender,
    categories, // array de IDs
  } = data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    throw new Error("El usuario no existe");
  }

  if (!categories || categories.length < 3) {
    throw new Error("Debes seleccionar al menos 3 categorías");
  }

  const hashedPassword = bcryptjs.hashSync(password, 10);

  const user = await prisma.user.update({
    where: { email },
    data: {
      name,
      lastName: lastName || null,
      phone: phone || null,
      birthdate: new Date(birthdate),
      gender,
      password: hashedPassword,
      username: email.split("@")[0],
      isVerified: true,
      categories: {
        connect: categories.map((id: string) => ({ id })),
      },
    },
    include: {
      categories: true,
    },
  });

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
};