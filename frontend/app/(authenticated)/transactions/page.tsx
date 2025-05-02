import { Metadata } from "next";
import TransactionDetails from "@/components/transaction-details";

export const metadata: Metadata = {
  title: "Transactions | Squarix",
  description: "View and manage your transactions",
};

export default function TransactionsPage() {
  return (
    <main className="container mx-auto py-6">
      <TransactionDetails />
    </main>
  );
}