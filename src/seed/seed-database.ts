import prisma from '../prisma/client';
import { initialData } from './seed';

async function main() {
  // 1. Borrar registros 
  await prisma.eventInterest.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();

  const { users, categories, events } = initialData;

  // Users
  await prisma.user.createMany({
    data: users
  });

  // Categories
  const categoriesData = categories.map((name) => ({ name }));
  await prisma.category.createMany({
    data: categoriesData
  });

  const categoriesDB = await prisma.category.findMany();
  const categoriesMap = categoriesDB.reduce((map, category) => {
    map[category.name] = category.id;
    return map;
  }, {} as Record<string, string>); //<string=shirt, string=categoryID>

  events.forEach(async (event) => {

    const { category, ...rest } = event;

    let userName = 'nicanorec';
    if (event.category === 'Bar') {
      userName = 'cantobar.ec';
    }
    const user = await prisma.user.findFirst({
      select: { id: true },
      where: { username: userName }
    });

    if (!user) throw new Error("No se encontró el usuario");

    const dbProduct = await prisma.event.create({
      data: {
        ...rest,
        userId: user?.id,
        categoryId: categoriesMap[category]
      }
    })
  });

  console.log('Seed ejecutado correctamente');
}


(() => {

  if (process.env.NODE_ENV === 'production') return;

  main();
})();