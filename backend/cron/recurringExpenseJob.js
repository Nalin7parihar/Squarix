import cron from 'node-cron';
import Expense from '../model/expense.model.js';
import { recurringExpense } from '../model/recurringExpense.model.js';
const getNextDate = (date,frequency) => {
  const nextDate = new Date(date);
  switch (frequency) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    default:
      throw new Error('Invalid frequency');
  }
  return nextDate.toISOString().split("T")[0]; // Return in YYYY-MM-DD format
}

const recurringExpenseJob = () => {
  
  cron.schedule('0 0 * * *', async () => {
  const today = new Date().toISOString().split("T")[0];
  
  const expenses = await recurringExpense.find({autoAdd : true, nextDueDate: {$lte : today}});
  if(!expenses || expenses.length === 0) {
    console.log("No recurring expenses to process");
    return;
  }
  for (const exp of expenses) {
      await Expense.create({
        senderId : exp.senderId,
        title : exp.title,
        amount : exp.amount,
        category : exp.category,
        createdAt : new Date(),
        participants : exp.participants,
        isGroupExpense: exp.isGroupExpense,
        groupId: exp.groupId,
        reciept: exp.reciept,
      })
      exp.nextDueDate = getNextDate(exp.nextDueDate,exp.frequency);
      await exp.save();
   }
   console.log('Cron job done!');
});
};


export default recurringExpenseJob;
