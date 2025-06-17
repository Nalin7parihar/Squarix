// Mock data
const mockGroups = [
  {
    id: 1,
    name: "Weekend Trip",
    description: "Cabin rental and activities",
    memberCount: 4,
    totalExpenses: 1250.5,
    members: [
      { id: 1, name: "John Doe", email: "john@example.com" },
      { id: 2, name: "Jane Smith", email: "jane@example.com" },
      { id: 3, name: "Mike Johnson", email: "mike@example.com" },
      { id: 4, name: "Sarah Wilson", email: "sarah@example.com" },
    ],
  },
  {
    id: 2,
    name: "Roommates",
    description: "Shared apartment expenses",
    memberCount: 3,
    totalExpenses: 2840.75,
    members: [
      { id: 1, name: "John Doe", email: "john@example.com" },
      { id: 5, name: "Alex Brown", email: "alex@example.com" },
      { id: 6, name: "Emma Davis", email: "emma@example.com" },
    ],
  },
  {
    id: 3,
    name: "Office Lunch",
    description: "Weekly team lunches",
    memberCount: 6,
    totalExpenses: 680.3,
    members: [
      { id: 1, name: "John Doe", email: "john@example.com" },
      { id: 7, name: "Tom Wilson", email: "tom@example.com" },
      { id: 8, name: "Lisa Garcia", email: "lisa@example.com" },
    ],
  },
]

const mockExpenses = [
  {
    id: 1,
    description: "Dinner at Italian Restaurant",
    amount: 120.5,
    category: "food",
    date: "2024-01-15",
    splitType: "friends",
    splitWith: ["Jane Smith", "Mike Johnson"],
    receipt: null,
  },
  {
    id: 2,
    description: "Grocery Shopping",
    amount: 85.3,
    category: "food",
    date: "2024-01-14",
    splitType: "group",
    groupName: "Roommates",
    splitWith: ["Alex Brown", "Emma Davis"],
    receipt: null,
  },
  {
    id: 3,
    description: "Uber to Airport",
    amount: 45.0,
    category: "transport",
    date: "2024-01-13",
    splitType: "friends",
    splitWith: ["Sarah Wilson"],
    receipt: null,
  },
  {
    id: 4,
    description: "Movie Tickets",
    amount: 60.0,
    category: "entertainment",
    date: "2024-01-12",
    splitType: "group",
    groupName: "Weekend Trip",
    splitWith: ["Jane Smith", "Mike Johnson", "Sarah Wilson"],
    receipt: null,
  },
  {
    id: 5,
    description: "Coffee Shop",
    amount: 25.75,
    category: "food",
    date: "2024-01-11",
    splitType: "none",
    splitWith: [],
    receipt: null,
  },
]

const mockFriends = [
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    sharedExpenses: 180.5,
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    sharedExpenses: 180.5,
  },
  {
    id: 4,
    name: "Sarah Wilson",
    email: "sarah@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    sharedExpenses: 105.0,
  },
  {
    id: 5,
    name: "Alex Brown",
    email: "alex@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    sharedExpenses: 85.3,
  },
]

const mockTransactions = [
  {
    id: 1,
    description: "Dinner split",
    amount: 40.17,
    type: "owe",
    otherUser: "Jane Smith",
    status: "pending",
    date: "2024-01-15",
    note: "Fancy Italian restaurant downtown",
    expenseId: 1,
    expenseTitle: "Dinner at Italian Restaurant",
  },
  {
    id: 2,
    description: "Grocery split",
    amount: 28.43,
    type: "owed",
    otherUser: "Alex Brown",
    status: "pending",
    date: "2024-01-14",
    note: "Weekly grocery shopping at Whole Foods",
    expenseId: 2,
    expenseTitle: "Grocery Shopping",
  },
  {
    id: 3,
    description: "Movie tickets",
    amount: 15.0,
    type: "owe",
    otherUser: "Sarah Wilson",
    status: "settled",
    date: "2024-01-12",
    note: "",
    expenseId: 4,
    expenseTitle: "Movie Tickets",
  },
  {
    id: 4,
    description: "Coffee",
    amount: 12.88,
    type: "owed",
    otherUser: "Tom Wilson",
    status: "pending",
    date: "2024-01-11",
    note: "Morning coffee at Starbucks",
    expenseId: null,
    expenseTitle: null,
  },
]

const mockSummary = {
  totalExpenses: 336.55,
  youOwe: 55.17,
  youAreOwed: 41.31,
}

// Simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const api = {
  // Groups
  async getGroups() {
    await delay(500)
    return { groups: mockGroups }
  },

  async createGroup(groupData) {
    await delay(500)
    const newGroup = {
      id: mockGroups.length + 1,
      ...groupData,
      memberCount: 1,
      totalExpenses: 0,
      members: [{ id: 1, name: "John Doe", email: "john@example.com" }],
    }
    mockGroups.push(newGroup)
    return newGroup
  },

  async addMemberToGroup(groupId, memberData) {
    await delay(500)
    return { success: true }
  },

  async getGroupExpenses(groupId) {
    await delay(500)
    return { expenses: mockExpenses.slice(0, 3) }
  },

  async addGroupExpense(groupId, expenseData) {
    await delay(500)
    return { success: true }
  },

  // Friends
  async getFriends() {
    await delay(500)
    return { friends: mockFriends }
  },

  async addFriend(friendData) {
    await delay(500)
    const newFriend = {
      id: mockFriends.length + 1,
      name: friendData.email.split("@")[0],
      email: friendData.email,
      avatar: "/placeholder.svg?height=40&width=40",
      sharedExpenses: 0,
    }
    mockFriends.push(newFriend)
    return newFriend
  },

  async getFriendExpenses(friendId) {
    await delay(500)
    return { expenses: mockExpenses.slice(0, 2) }
  },

  // Expenses
  async getExpenses() {
    await delay(500)
    return { expenses: mockExpenses }
  },

  async addExpense(expenseData) {
    await delay(500)
    const newExpense = {
      id: mockExpenses.length + 1,
      ...expenseData,
      splitWith:
        expenseData.splitType === "friends"
          ? mockFriends.filter((f) => expenseData.selectedFriends?.includes(f.id.toString())).map((f) => f.name)
          : [],
      groupName:
        expenseData.splitType === "group"
          ? mockGroups.find((g) => g.id.toString() === expenseData.selectedGroup)?.name
          : null,
    }
    mockExpenses.push(newExpense)
    return newExpense
  },

  async getExpenseSummary() {
    await delay(500)
    return mockSummary
  },

  async filterExpenses(filters) {
    await delay(500)
    return { expenses: mockExpenses }
  },

  // Transactions
  async getTransactions() {
    await delay(500)
    return { transactions: mockTransactions }
  },
  async addTransaction(transactionData) {
    await delay(500)
    const newTransaction = {
      id: mockTransactions.length + 1,
      description: transactionData.description,
      amount: transactionData.amount,
      type: "owe", // Default to owe for new transactions
      otherUser: mockFriends.find(f => f.id == transactionData.receiverId)?.name || "Unknown",
      status: "pending",
      date: new Date().toISOString().split('T')[0],
      note: "",
      expenseId: transactionData.expenseId || null,
      expenseTitle: transactionData.expenseId ? 
        mockExpenses.find(e => e.id == transactionData.expenseId)?.description || null : null,
    }
    mockTransactions.push(newTransaction)
    return { success: true, transaction: newTransaction }
  },

  async settleTransaction(transactionId) {
    await delay(500)
    const transaction = mockTransactions.find((t) => t.id === transactionId)
    if (transaction) {
      transaction.status = "settled"
    }
    return { success: true }
  },
  async requestPayment(transactionId, requestData) {
    await delay(500)
    return { success: true }
  },

  async updateTransaction(transactionId, updateData) {
    await delay(500)
    const transaction = mockTransactions.find((t) => t.id === transactionId)
    if (transaction) {
      Object.assign(transaction, updateData)
    }
    return { success: true }
  },

  async deleteTransaction(transactionId) {
    await delay(500)
    const index = mockTransactions.findIndex((t) => t.id === transactionId)
    if (index !== -1) {
      mockTransactions.splice(index, 1)
    }
    return { success: true }
  },
}
