import prisma from "../../prisma/client";
import { UpdateUserDto } from "../../dtos/user/update.dt";

export const updateUserService = async (userId: string, data: UpdateUserDto) => {
  try {
    const {
      categories,
      birthdate,
      ...rest
    } = data;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...rest,
        description: data.description,
        birthdate: birthdate ? new Date(birthdate) : undefined,

        // relación con categorías (many-to-many)
        categories: categories
          ? {
            set: categories.map((id) => ({ id })),
          }
          : undefined,
      },
      include: {
        categories: true,
      },
    });

    return updatedUser;
  } catch (error) {
    console.error("Error en updateUserService:", error);
    throw new Error("Error actualizando el usuario");
  }
};