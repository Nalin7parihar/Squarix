"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Search, Users, UserPlus } from "lucide-react";
import { toast } from "sonner";

export default function ExpenseList({ onRefresh }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchExpenses();
  }, [onRefresh]);

  const fetchExpenses = async () => {
    try {
      const data = await api.getExpenses();
      setExpenses(data.expenses || []);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast.error("Error", {
        description: "Failed to fetch expenses",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = expenses.filter(
    (expense) =>
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-8">Loading expenses...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search expenses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {filteredExpenses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No expenses found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredExpenses.map((expense) => (
            <Card key={expense.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {expense.description}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{expense.category}</Badge>
                    <span className="text-lg font-semibold">
                      ${expense.amount}
                    </span>
                  </div>
                </div>
                <CardDescription>
                  {new Date(expense.date).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {expense.splitType === "group" && expense.groupName && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Split with {expense.groupName} group
                      </span>
                    )}
                    {expense.splitType === "friends" &&
                      expense.splitWith &&
                      expense.splitWith.length > 0 && (
                        <span className="flex items-center gap-1">
                          <UserPlus className="h-3 w-3" />
                          Split with {expense.splitWith.length} friend(s)
                        </span>
                      )}
                    {expense.splitType === "none" && (
                      <span className="text-muted-foreground">
                        Personal expense
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
