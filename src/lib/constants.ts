// Define all income categories
export const main_income_categories = [
    'Salary',
    'Bonus',
    'Investment',
    'Business',
    'Rental',
    'Freelance',
    'Part-time',
    'Dividends',
    'Gifts',
    'Reimbursement',
    'Subsidy',
    'Lottery',
    'Grants',
    'Royalties',
    'Second-hand Sale',
    'Borrowing',
    'Charity',
    'Other'
];

// Define all main expense categories
export const main_expense_categories = [
    'Housing',
    'Food',
    'Transportation',
    'Education',
    'Healthcare',
    'Entertainment',
    'Shopping',
    'Social',
    'Other'
];

// Define all sub-expense categories
export const sub_expense_categories = [
    'Rent/Mortgage',
    'Utilities',
    'Property Management',
    'Cleaning',
    'Home Supplies',
    'Home Improvement',
    'General Meals',
    'Breakfast',
    'Lunch',
    'Dinner',
    'Snacks',
    'Beverages',
    'Groceries',
    'Dining Out',
    'Taxi',
    'Public Transit',
    'Parking',
    'Fuel',
    'Car Maintenance',
    'Train',
    'Flight',
    'Tuition',
    'Training',
    'Books',
    'Exams',
    'Hospital',
    'Medicine',
    'Health Supplements',
    'Travel',
    'Movies & Music',
    'Sports',
    'Massage',
    'Games',
    'Bars',
    'Shows',
    'Personal Care',
    'Electronics',
    'Virtual Services',
    'Appliances',
    'Accessories',
    'Baby Products',
    'Clothing',
    'Pet Supplies',
    'Office Supplies',
    'Gifts',
    'Red Packets',
    'Family Support',
    'Lending',
    'Tips',
    'Fines',
    'Investment Expenses',
    'Charity',
    'Miscellaneous',
    'Other'
];

/**
 * Returns main income categories as comma-separated string.
 */
export function getIncomeCategoriesString(): string {
  return main_income_categories.join(', ');
}

/**
 * Returns main expense categories as comma-separated string.
 */
export function getExpenseCategoriesString(): string {
  return main_expense_categories.join(', ');
}

