import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { ExpenseProvider } from "@/lib/expense-context";
import { TransactionProvider } from "@/lib/transaction-context";
import { FriendsProvider } from "@/lib/friend-context";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Squarix",
  description: "Share expenses smartly with friends and groups",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <FriendsProvider>
              <ExpenseProvider>
                <TransactionProvider>
                  {children}
                  <Toaster richColors position="top-right" />
                </TransactionProvider>
              </ExpenseProvider>
            </FriendsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
