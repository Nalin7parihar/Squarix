import mongoose from "mongoose";
import bcrypt from "bcrypt";
import "dotenv/config";
import Users from "../model/user.model.js";
import Friend from "../model/friends.model.js";
import Expense from "../model/expense.model.js";
import Transactions from "../model/transaction.model.js";
import Group from "../model/group.model.js";
import connectDB from "../config/mongoDB.js";

// Connect to MongoDB
connectDB();

// Categories for expenses and transactions
const categories = [
  "Food",
  "Transportation",
  "Housing",
  "Utilities",
  "Entertainment",
  "Healthcare",
  "Shopping",
  "Travel",
  "Groceries",
  "Dining",
  "Services"
];

// Function to generate a random date within the last 3 months
const getRandomDate = () => {
  const now = new Date();
  const threeMonthsAgo = new Date(now);
  threeMonthsAgo.setMonth(now.getMonth() - 3);
  
  return new Date(
    threeMonthsAgo.getTime() + Math.random() * (now.getTime() - threeMonthsAgo.getTime())
  );
};

// Function to get random element from array
const getRandomElement = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

// Function to get random amount (between 10 and 500)
const getRandomAmount = (min = 10, max = 500) => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
};

// Clear existing data
const clearDatabase = async () => {
  try {
    await Users.deleteMany({});
    await Friend.deleteMany({});
    await Expense.deleteMany({});
    await Transactions.deleteMany({});
    await Group.deleteMany({});
    console.log("🗑️ Database cleared");
  } catch (error) {
    console.error("Error clearing database:", error);
    process.exit(1);
  }
};

// Seed data
const seedDatabase = async () => {
  try {
    // -------- Create Users --------
    console.log("🌱 Creating users...");
    
    // Hash the password (using the same for all test users)
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    const users = await Users.insertMany([
      { name: "John Smith", email: "john@example.com", password: hashedPassword },
      { name: "Jane Doe", email: "jane@example.com", password: hashedPassword },
      { name: "Robert Johnson", email: "robert@example.com", password: hashedPassword },
      { name: "Sarah Williams", email: "sarah@example.com", password: hashedPassword },
      { name: "Michael Brown", email: "michael@example.com", password: hashedPassword },
      { name: "Emily Davis", email: "emily@example.com", password: hashedPassword }
    ]);
    
    console.log(`✅ Created ${users.length} users`);

    // -------- Create Friend Relationships --------
    console.log("🌱 Creating friend relationships...");
    
    const friendships = [];
    
    // Make everyone friends with each other (both directions)
    for (let i = 0; i < users.length; i++) {
      for (let j = 0; j < users.length; j++) {
        // Skip self-relationships
        if (i !== j) {
          friendships.push({
            user: users[i]._id,
            friend: users[j]._id,
            transactions: []
          });
        }
      }
    }
    
    const friends = await Friend.insertMany(friendships);
    console.log(`✅ Created ${friends.length} friend relationships`);

    // Update users with their friend references
    for (let i = 0; i < users.length; i++) {
      const userFriends = friends.filter(f => f.user.equals(users[i]._id));
      await Users.findByIdAndUpdate(users[i]._id, {
        friends: userFriends.map(f => f._id)
      });
    }
    
    // -------- Create Groups --------
    console.log("🌱 Creating groups...");
    
    const groups = await Group.insertMany([
      {
        name: "House Roommates",
        members: [users[0]._id, users[1]._id, users[2]._id],
        createdBy: users[0]._id,
        totalExpense: 0,
        expenses: []
      },
      {
        name: "Trip to Vegas",
        members: [users[1]._id, users[3]._id, users[4]._id, users[5]._id],
        createdBy: users[1]._id,
        totalExpense: 0,
        expenses: []
      },
      {
        name: "Weekly Dinner",
        members: [users[0]._id, users[2]._id, users[4]._id],
        createdBy: users[4]._id,
        totalExpense: 0,
        expenses: []
      }
    ]);
    
    console.log(`✅ Created ${groups.length} groups`);

    // Update users with their group references
    for (const group of groups) {
      for (const memberId of group.members) {
        await Users.findByIdAndUpdate(memberId, {
          $push: { groups: group._id }
        });
      }
    }

    // -------- Create Transactions --------
    console.log("🌱 Creating transactions...");
    
    const transactions = [];
    
    // Create random transactions between friends
    for (let i = 0; i < 35; i++) {
      const sender = getRandomElement(users);
      let receiver;
      
      // Find a valid friend (not the sender)
      do {
        receiver = getRandomElement(users);
      } while (sender._id.equals(receiver._id));
      
      const amount = getRandomAmount();
      const category = getRandomElement(categories);
      const isSettled = Math.random() > 0.5; // 50% chance of being settled
      
      transactions.push({
        amount,
        date: getRandomDate(),
        description: `Payment for ${category.toLowerCase()}`,
        category,
        senderId: sender._id,
        receiverId: receiver._id,
        isSettled
      });
    }
    
    const createdTransactions = await Transactions.insertMany(transactions);
    console.log(`✅ Created ${createdTransactions.length} transactions`);

    // Update friend relationships with transaction references
    for (const transaction of createdTransactions) {
      const friendship = await Friend.findOne({
        user: transaction.senderId,
        friend: transaction.receiverId
      });

      if (friendship) {
        friendship.transactions.push(transaction._id);
        await friendship.save();
      }
      
      // Also update users' transaction lists
      await Users.findByIdAndUpdate(transaction.senderId, {
        $push: { transactions: transaction._id }
      });
      
      await Users.findByIdAndUpdate(transaction.receiverId, {
        $push: { transactions: transaction._id }
      });
    }

    // -------- Create Expenses --------
    console.log("🌱 Creating expenses...");
    
    const expenses = [];
    
    // Create non-group expenses
    for (let i = 0; i < 15; i++) {
      const sender = getRandomElement(users);
      
      // Create 2-5 participants for this expense
      const participantCount = Math.floor(Math.random() * 4) + 2;
      const participants = [];
      const totalAmount = getRandomAmount(50, 200);
      const sharePerPerson = parseFloat((totalAmount / participantCount).toFixed(2));
      
      const userIds = users.map(u => u._id.toString());
      const shuffledUsers = [...userIds].sort(() => 0.5 - Math.random());
      
      // Add sender as first participant (who paid)
      participants.push({
        user: sender._id,
        share: 0, // They paid, so they don't owe anything
        isSettled: true
      });
      
      // Add remaining participants
      for (let j = 0; j < participantCount - 1; j++) {
        const participantId = new mongoose.Types.ObjectId(shuffledUsers[j]);
        
        // Skip if it's the sender
        if (participantId.equals(sender._id)) {
          continue;
        }
        
        participants.push({
          user: participantId,
          share: sharePerPerson,
          isSettled: Math.random() > 0.7 // 30% chance of being settled
        });
      }
      
      expenses.push({
        title: `${getRandomElement(categories)} expense`,
        amount: totalAmount,
        senderId: sender._id,
        participants,
        category: getRandomElement(categories),
        createdAt: getRandomDate(),
        isGroupExpense: false
      });
    }
    
    // Create group expenses
    for (const group of groups) {
      const expenseCount = Math.floor(Math.random() * 5) + 1; // 1-5 expenses per group
      
      for (let i = 0; i < expenseCount; i++) {
        const sender = getRandomElement(group.members.map(id => ({ _id: id })));
        const totalAmount = getRandomAmount(100, 500);
        const sharePerPerson = parseFloat((totalAmount / group.members.length).toFixed(2));
        
        const participants = group.members.map(memberId => {
          return {
            user: memberId,
            share: memberId.equals(sender._id) ? 0 : sharePerPerson, // Payer doesn't owe
            isSettled: Math.random() > 0.5 // 50% chance of being settled
          };
        });
        
        const expense = {
          title: `Group ${getRandomElement(categories).toLowerCase()} for ${group.name}`,
          amount: totalAmount,
          senderId: sender._id,
          participants,
          groupId: group._id,
          isGroupExpense: true,
          category: getRandomElement(categories),
          createdAt: getRandomDate()
        };
        
        expenses.push(expense);
      }
    }
    
    const createdExpenses = await Expense.insertMany(expenses);
    console.log(`✅ Created ${createdExpenses.length} expenses`);

    // Update groups with their expense references and total expenses
    for (const expense of createdExpenses) {
      if (expense.isGroupExpense) {
        await Group.findByIdAndUpdate(expense.groupId, {
          $push: { expenses: expense._id },
          $inc: { totalExpense: expense.amount }
        });
      }
      
      // Update sender's expenses list
      await Users.findByIdAndUpdate(expense.senderId, {
        $push: { expenses: expense._id }
      });
    }

    console.log("✅ Database seeding completed successfully!");
    
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    // Disconnect from the database
    await mongoose.disconnect();
    console.log("📡 Disconnected from MongoDB");
  }
};

// Run the seeding process
const runSeed = async () => {
  try {
    await clearDatabase();
    await seedDatabase();
    process.exit(0);
  } catch (error) {
    console.error("Fatal error during seeding:", error);
    process.exit(1);
  }
};

runSeed();