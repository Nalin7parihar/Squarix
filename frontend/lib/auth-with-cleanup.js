import { useAuth } from "./auth-context";
import { useExpense } from "./expense-context";

// Custom hook that combines auth and expense context for logout with cleanup
export const useAuthWithCleanup = () => {
  const auth = useAuth();
  const { clearExpenses } = useExpense();

  const logoutWithCleanup = async () => {
    try {
      // Call the original logout function
      await auth.logout();
      // Clear all expense data
      clearExpenses();
    } catch (error) {
      console.error('Logout with cleanup error:', error);
      // Still clear expenses even if logout API fails
      clearExpenses();
    }
  };

  return {
    ...auth,
    logout: logoutWithCleanup, // Override the logout function
  };
};
