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

    // Get monthly expenses (using the filter endpoint with 'month' timeFilter)
    console.log(`Fetching monthly expenses from: ${API_URL}/api/transactions/filter?timeFilter=month`);
    const monthlyDataPromise = fetch(`${API_URL}/api/transactions/filter?timeFilter=month`, {
      headers,
      credentials: 'include',
      cache: 'no-store',
      next: { revalidate: 0 }
    });

    // Wait for all requests to complete
    const [recentExpensesRes, balanceSummaryRes, monthlyDataRes] = await Promise.all([
      recentExpensesPromise,
      balanceSummaryPromise,
      monthlyDataPromise
    ]);

    console.log(`Expenses response status: ${recentExpensesRes.status}`);
    console.log(`Summary response status: ${balanceSummaryRes.status}`);
    console.log(`Monthly data response status: ${monthlyDataRes.status}`);

    // Handle each response individually for better error handling
    let expenses = [];
    let recentActivity = [];
    let balances = { youOwe: 0, youAreOwed: 0 };
    let monthlyData = { total: 0, count: 0 };
    let pendingSettlements = 0;

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

    if (monthlyDataRes.ok) {
      const monthlyTransactions = await monthlyDataRes.json();
      console.log("Monthly transactions data received:", monthlyTransactions);
      
      // Calculate total of monthly transactions
      const transactions = monthlyTransactions.transactions || [];
      const monthlyTotal = transactions.reduce((sum: number, txn: any) => sum + (txn.amount || 0), 0);
      
      // Count pending settlements (unsettled transactions)
      const youOwe = monthlyTransactions.youOwe || [];
      const owedToYou = monthlyTransactions.owedToYou || [];
      pendingSettlements = youOwe.length + owedToYou.length;
      
      monthlyData = {
        total: monthlyTotal,
        count: transactions.length
      };
    } else {
      const errorText = await monthlyDataRes.text().catch(() => 'Could not read error response');
      console.error('Failed to fetch monthly data:', monthlyDataRes.status, errorText);
    }

    const resultData = { 
      expenses, 
      balances, 
      recentActivity, 
      monthlyData, 
      pendingSettlements 
    };
    console.log("Returning initial data:", resultData);
    return resultData;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    // Return default empty state on error
    return {
      expenses: [],
      balances: { youOwe: 0, youAreOwed: 0 },
      recentActivity: [],
      monthlyData: { total: 0, count: 0 },
      pendingSettlements: 0
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
