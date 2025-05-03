# 💸 Squarix - Effortless Expense Splitting

Squarix is a full-stack web application designed to help users track shared expenses with friends and groups, making it easy to see who owes whom and settle debts without awkward conversations.  
I built this project as an inspiration to master backend development and build a scalable, real-world MERN-based platform.

---

## 🔥 Features

🧾 **Expense Tracking**  
• Add individual or group expenses with description, amount, category, date, and payer details.  

👥 **Friend Management**  
• Add friends via email and view balances with each person.  

👨‍👩‍👧‍👦 **Group Management**  
• Create groups, manage members, and track group-level expenses.  

🧮 **Smart Splitting**  
• Automatically splits expenses between participants.  

📊 **Real-Time Balances**  
• View total owed/owing and detailed balances with friends/groups.  

✅ **Settlement**  
• Mark expenses or complete balances as settled.  

📬 **Payment Requests**  
• Send reminders or requests to settle debts.  

📈 **Dashboard**  
• Quick snapshot of your balance, recent activity, and pending settlements.  

🕒 **Activity Feed**  
• Chronological list of all expense-related actions.  

🔐 **Authentication**  
• Secure JWT-based login and signup.  

🧾 **Receipt Upload**  
• Attach images to expenses using Cloudinary.

---

## 🛠 Tech Stack

### 🧠 Backend
- Node.js  
- Express.js  
- MongoDB + Mongoose  
- JWT (Authentication)  
- Cloudinary (Image uploads)  
- Bcrypt (Password hashing)

### 🎨 Frontend
- Next.js (React Framework)  
- TypeScript  
- Tailwind CSS  
- Shadcn/UI (Component library)  
- date-fns (Date utilities)  
- Sonner (Toast notifications)  
- Context API (State Management)  
- Fetch API (Data fetching)

---

## ⚙️ Getting Started

### 📦 Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file with:
```env
PORT=5000
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret_key>
CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
CLOUDINARY_API_KEY=<your_cloudinary_api_key>
CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
```

4. (Optional) Seed the database:
```bash
npm run seed
```

5. Start the backend server:
```bash
npm start
# or
npm run dev
```

---

### 💻 Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

4. Start the frontend server:
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 📁 Project Structure

```
Squarix/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── utils/
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   └── context/
```

---

## 🧑‍💻 Developed By

**Nalin Parihar**  
[GitHub](https://github.com/) • [LinkedIn](https://www.linkedin.com/)
