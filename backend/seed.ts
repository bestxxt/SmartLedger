import { prisma } from './src/prisma';

const ICONS = [
  '/icons/retro-coffee.png', '/icons/retro-dining.png', '/icons/retro-drinks.png', 
  '/icons/retro-snacks.png', '/icons/retro-train.png', '/icons/retro-taxi.png', 
  '/icons/retro-transit.png', '/icons/retro-flight.png', '/icons/retro-housing.png', 
  '/icons/retro-utilities.png', '/icons/retro-groceries.png', '/icons/retro-telecom.png', 
  '/icons/retro-shopping.png', '/icons/retro-movies.png', '/icons/retro-music.png', 
  '/icons/retro-hobbies.png', '/icons/retro-salary.png', '/icons/retro-investments.png', 
  '/icons/retro-bonus.png', '/icons/retro-medical.png', '/icons/retro-education.png', 
  '/icons/retro-book.png', '/icons/retro-gift.png', '/icons/retro-tool.png', '/icons/retro-misc.png'
];

const EXPENSE_CATEGORIES = ['Dining', 'Groceries', 'Transport', 'Shopping', 'Entertainment', 'Housing', 'Utilities', 'Medical', 'Education'];
const INCOME_CATEGORIES = ['Salary', 'Bonus', 'Investments', 'Gift'];

async function main() {
  const user = await prisma.user.findFirst();
  
  if (!user) {
    console.error('No users found. Please register a user first.');
    return;
  }

  console.log(`Seeding 100 transactions for user: ${user.email}...`);

  const now = new Date();
  const transactions = [];
  
  for (let i = 0; i < 100; i++) {
    // random date in the last 60 days
    const date = new Date(now.getTime() - Math.floor(Math.random() * 60 * 24 * 60 * 60 * 1000));
    const isExpense = Math.random() > 0.2;
    const type = isExpense ? 'expense' : 'income';
    const categoryList = isExpense ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    const category = categoryList[Math.floor(Math.random() * categoryList.length)];
    const amount = parseFloat((Math.random() * 495 + 5).toFixed(2));
    const imageUrl = ICONS[Math.floor(Math.random() * ICONS.length)];
    
    transactions.push({
      userId: user.id,
      amount,
      type,
      category,
      timestamp: date,
      note: `Generated ${category} transaction`,
      currency: 'USD',
      imageUrl,
    });
  }

  for (const tx of transactions) {
    await prisma.transaction.create({ data: tx });
  }

  console.log('Successfully seeded 100 transactions.');
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
