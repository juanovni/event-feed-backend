
import prisma from "../../prisma/client";
import bcryptjs from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../../config/jwt";
import { RegisterDto } from "../../dtos/user/register.dto";
import { sendVerificationCode } from "../verification/verification.service";

const validatePassword = (password: unknown) => {
  if (typeof password !== "string" || [...password].length < 15 || Buffer.byteLength(password, "utf8") > 72) {
    throw new Error("La contraseña debe tener al menos 15 caracteres y no superar 72 bytes.");
  }
  if (!/[0-9]/.test(password) || !/\p{Ll}/u.test(password) || !/\p{Lu}/u.test(password)) {
    throw new Error("La contraseña debe incluir al menos un número, una letra minúscula y una mayúscula.");
  }
};

export const preRegisterService = async (email: string, password: string) => {
  validatePassword(password);
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

  validatePassword(password);

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
