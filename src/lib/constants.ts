// 定义所有的 income 类别数组
export const main_income_categories = [
    'Salary', // 工资
    'Bonus', // 奖金
    'Investment', // 理财盈利
    'Business', // 生意收入
    'Rental', // 租金收入
    'Freelance', // 兼职外快
    'Part-time', // 兼职外快
    'Dividends', // 分红
    'Gifts', // 礼物
    'Reimbursement', // 报销
    'Subsidy', // 补贴
    'Lottery', // 中奖
    'Grants', // 资助
    'Royalties', // 版税
    'Second-hand Sale', // 二手闲置
    'Borrowing', // 借入
    'Charity', // 慈善捐助
    'Other' // 其他
];

// 定义所有的主要支出类别
export const main_expense_categories = [
    'Housing',       // 居家生活
    'Food',          // 食品餐饮
    'Transportation', // 交通出行
    'Education',     // 文化教育
    'Healthcare',    // 健康医疗
    'Entertainment', // 休闲娱乐
    'Shopping',      // 购物消费
    'Social',        // 人情往来
    'Other'          // 其他
];

// 定义所有的支出子类别数组
export const sub_expense_categories = [
    'Rent/Mortgage', // 房租还贷
    'Utilities', // 水电气
    'Property Management', // 物业费
    'Cleaning', // 家政清洁
    'Home Supplies', // 日常家居
    'Home Improvement', // 装修装饰
    'General Meals', // 一般餐饮
    'Breakfast', // 早餐
    'Lunch', // 午餐
    'Dinner', // 晚餐
    'Snacks', // 休闲零食
    'Beverages', // 饮料酒水
    'Groceries', // 生鲜食品、粮油调味
    'Dining Out', // 请客吃饭
    'Taxi', // 打车
    'Public Transit', // 公共交通
    'Parking', // 停车费
    'Fuel', // 加油
    'Car Maintenance', // 保养修车
    'Train', // 火车
    'Flight', // 飞机
    'Tuition', // 学费
    'Training', // 培训
    'Books', // 书报杂志
    'Exams', // 考试
    'Hospital', // 医院
    'Medicine', // 买药
    'Health Supplements', // 滋补保健
    'Travel', // 旅游度假
    'Movies & Music', // 电影唱歌
    'Sports', // 运动健身
    'Massage', // 足浴按摩
    'Games', // 棋牌桌游
    'Bars', // 酒吧
    'Shows', // 演出
    'Personal Care', // 个护美妆
    'Electronics', // 手机数码
    'Virtual Services', // 虚拟充值
    'Appliances', // 生活电器
    'Accessories', // 配饰腕表
    'Baby Products', // 母婴玩具
    'Clothing', // 服饰运动
    'Pet Supplies', // 宠物用品
    'Office Supplies', // 办公用品
    'Gifts', // 礼物
    'Red Packets', // 红包
    'Family Support', // 孝敬长辈
    'Lending', // 借出
    'Tips', // 打赏
    'Fines', // 罚款赔偿
    'Investment Expenses', // 理财支出
    'Charity', // 慈善捐助
    'Miscellaneous', // 杂项
    'Other'          // 其他
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

