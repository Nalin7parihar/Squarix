import { Dashboard } from "@/components/dashboard"
import { cookies } from 'next/headers'
import { API_URL } from '@/lib/config'

async function getInitialDashboardData() {
  console.log("Attempting to fetch dashboard data...");
  try {
    // Get authentication cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    
    // Prepare headers with authentication
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Cookie'] = `token=${token.value}`;
    }
    
    // Fetch data from API endpoints with proper credentials
    console.log(`Fetching expenses from: ${API_URL}/api/expenses/getExpenses`);
    const recentExpensesPromise = fetch(`${API_URL}/api/expenses/getExpenses`, {
      headers,
      credentials: 'include',
      cache: 'no-store',
      next: { revalidate: 0 }
    });

    console.log(`Fetching summary from: ${API_URL}/api/transactions/getSummary`);
    const balanceSummaryPromise = fetch(`${API_URL}/api/transactions/getSummary`, {
      headers,
      credentials: 'include',
      cache: 'no-store', 
      next: { revalidate: 0 }
    });

    // Wait for all requests to complete
    const [recentExpensesRes, balanceSummaryRes] = await Promise.all([
      recentExpensesPromise,
      balanceSummaryPromise
    ]);

    console.log(`Expenses response status: ${recentExpensesRes.status}`);
    console.log(`Summary response status: ${balanceSummaryRes.status}`);

    // Handle each response individually for better error handling
    let expenses = [];
    let recentActivity = [];
    let balances = { youOwe: 0, youAreOwed: 0 };

    if (recentExpensesRes.ok) {
      const expensesData = await recentExpensesRes.json();
      console.log("Expenses data received:", expensesData);
      expenses = expensesData.expenses?.slice(0, 5) || [];
      recentActivity = expensesData.expenses?.slice(0, 10) || [];
    } else {
      const errorText = await recentExpensesRes.text().catch(() => 'Could not read error response');
      console.error('Failed to fetch expenses:', recentExpensesRes.status, errorText);
    }

    if (balanceSummaryRes.ok) {
      const balancesData = await balanceSummaryRes.json();
      console.log("Balances data received:", balancesData);
      balances = {
        youOwe: balancesData.totalYouOwe || 0,
        youAreOwed: balancesData.totalYouAreOwed || 0
      };
    } else {
      const errorText = await balanceSummaryRes.text().catch(() => 'Could not read error response');
      console.error('Failed to fetch balance summary:', balanceSummaryRes.status, errorText);
    }

    const resultData = { expenses, balances, recentActivity };
    console.log("Returning initial data:", resultData);
    return resultData;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    // Return default empty state on error
    return {
      expenses: [],
      balances: { youOwe: 0, youAreOwed: 0 },
      recentActivity: []
    };
  }
}

async function Home() {
  // Fetch the initial data on the server
  console.log("Home component rendering, calling getInitialDashboardData...");
  const initialData = await getInitialDashboardData();
  console.log("Home component received initialData:", initialData);

  return (
    <>
      <Dashboard initialData={initialData} />
    </>
  );
}

export default Home;
