import { Dashboard } from "@/components/dashboard"
async function getInitialDashboardData() {
  try {
    // Fetch data from your API endpoints
    // In a real app, these would be separate fetch calls to your backend
    const recentExpensesPromise = fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/expenses/recent`, {
      // headers: { // REMOVED Header
      //   'Cookie': `auth_token=${token}`
      // },
      // This makes the request happen during build/SSR
      cache: 'no-store'
    })

    const balanceSummaryPromise = fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/expenses/summary`, {
      // headers: { // REMOVED Header
      //   'Cookie': `auth_token=${token}`
      // },
      cache: 'no-store'
    })

    // Wait for all requests to complete
    const [recentExpensesRes, balanceSummaryRes] = await Promise.all([
      recentExpensesPromise,
      balanceSummaryPromise
    ])

    // If any request failed, return empty data
    if (!recentExpensesRes.ok || !balanceSummaryRes.ok) {
      console.error('Failed to fetch dashboard data')
      return {
        expenses: [],
        balances: { youOwe: 0, youAreOwed: 0 },
        recentActivity: []
      }
    }

    // Parse response JSON
    const expenses = await recentExpensesRes.json()
    const balances = await balanceSummaryRes.json()

    return {
      expenses: expenses.slice(0, 5), // Just the 5 most recent
      balances,
      recentActivity: expenses.slice(0, 10) // Recent activity
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return {
      expenses: [],
      balances: { youOwe: 0, youAreOwed: 0 },
      recentActivity: []
    }
  }
}

async function Home() {
  // Fetch the initial data on the server
  const initialData = await getInitialDashboardData()
  
  return (
    <>
      <Dashboard initialData={initialData} />
    </>
  );
}

export default Home;
