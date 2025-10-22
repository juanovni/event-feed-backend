import prisma from "../../prisma/client";

export const getUsers = async () => {
  return prisma.user.findMany({
    select: { id: true, name: true, email: true, createdAt: true },
  });
};
