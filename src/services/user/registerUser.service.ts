import prisma from "../../prisma/client";
import bcryptjs from "bcryptjs";

import {
  generateAccessToken,
  generateRefreshToken,

} from "../../config/jwt";
import { RegisterDto } from "../../dtos/user/register.dto";

export const registerService = async (data: RegisterDto) => {
  const {
    name,
    lastName,
    email,
    password,
    birthdate,
    gender,
    categories, // array de IDs
  } = data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("El correo ya está registrado");
  }

  if (!categories || categories.length < 3) {
    throw new Error("Debes seleccionar al menos 3 categorías");
  }

  const hashedPassword = bcryptjs.hashSync(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      lastName,
      email,
      password: hashedPassword,
      birthdate: new Date(birthdate),
      gender,
      username: email.split("@")[0],
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