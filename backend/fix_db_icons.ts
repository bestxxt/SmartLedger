import { prisma } from './src/prisma';

const iconMap: Record<string, string> = {
  'icon_01.png': 'retro-coffee.png',
  'icon_02.png': 'retro-dining.png',
  'icon_03.png': 'retro-drinks.png',
  'icon_04.png': 'retro-snacks.png',
  'icon_05.png': 'retro-train.png',
  'icon_06.png': 'retro-taxi.png',
  'icon_07.png': 'retro-transit.png',
  'icon_08.png': 'retro-flight.png',
  'icon_09.png': 'retro-housing.png',
  'icon_10.png': 'retro-utilities.png',
  'icon_11.png': 'retro-groceries.png',
  'icon_12.png': 'retro-telecom.png',
  'icon_13.png': 'retro-shopping.png',
  'icon_14.png': 'retro-movies.png',
  'icon_15.png': 'retro-music.png',
  'icon_16.png': 'retro-hobbies.png',
  'icon_17.png': 'retro-salary.png',
  'icon_18.png': 'retro-investments.png',
  'icon_19.png': 'retro-bonus.png',
  'icon_20.png': 'retro-medical.png',
  'icon_21.png': 'retro-education.png',
  'icon_22.png': 'retro-book.png',
  'icon_23.png': 'retro-gift.png',
  'icon_24.png': 'retro-tool.png',
  'icon_25.png': 'retro-misc.png'
};

async function main() {
  const categories = await prisma.category.findMany();
  for (const cat of categories) {
    if (cat.imageUrl && cat.imageUrl.includes('icon_')) {
      const match = cat.imageUrl.match(/icon_\d+\.png/);
      if (match && iconMap[match[0]]) {
        const newUrl = `/icons/${iconMap[match[0]]}`;
        await prisma.category.update({
          where: { id: cat.id },
          data: { imageUrl: newUrl }
        });
        console.log(`Updated category ${cat.name}: ${newUrl}`);
      }
    }
  }

  const transactions = await prisma.transaction.findMany();
  for (const tx of transactions) {
    if (tx.imageUrl && tx.imageUrl.includes('icon_')) {
      const match = tx.imageUrl.match(/icon_\d+\.png/);
      if (match && iconMap[match[0]]) {
        const newUrl = `/icons/${iconMap[match[0]]}`;
        await prisma.transaction.update({
          where: { id: tx.id },
          data: { imageUrl: newUrl }
        });
        console.log(`Updated transaction ${tx.id}: ${newUrl}`);
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
