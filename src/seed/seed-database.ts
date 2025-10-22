import prisma from '../prisma/client';
import { initialData } from './seed';

async function main() {
  // 1. Borrar registros previos
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const { users, categories } = initialData;

  // Users
  await prisma.user.createMany({
    data: users
  });

  // Categories
  const categoriesData = categories.map((name) => ({ name }));
  await prisma.category.createMany({
    data: categoriesData
  });

  console.log('Seed ejecutado correctamente');
}


(() => {

  if (process.env.NODE_ENV === 'production') return;

  main();
})();