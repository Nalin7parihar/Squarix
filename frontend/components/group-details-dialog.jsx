"use client";

import React, { useState, useEffect } from "react";
import { useGroups } from "@/lib/group-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users,
  DollarSign,
  Calendar,
  User,
  MapPin,
  FileText,
  Clock,
  AlertCircle,
} from "lucide-react";

export default function GroupDetailsDialog({ group, children }) {
  const [open, setOpen] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [expenseError, setExpenseError] = useState(null);
  const { getGroupExpenses } = useGroups();

  const fetchGroupExpenses = async () => {
    if (!group?._id) return;

    try {
      setLoadingExpenses(true);
      setExpenseError(null);
      const groupExpenses = await getGroupExpenses(group._id);
      setExpenses(groupExpenses.expenses);
    } catch (error) {
      setExpenseError(error.message);
      console.error("Error fetching group expenses:", error);
    } finally {
      setLoadingExpenses(false);
    }
  };

  useEffect(() => {
    if (open && group?._id) {
      fetchGroupExpenses();
    }
  }, [open, group?._id]);
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "?"
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getTotalGroupExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const getExpensesByCategory = () => {
    const categories = {};
    expenses.forEach((expense) => {
      categories[expense.category] =
        (categories[expense.category] || 0) + expense.amount;
    });
    return categories;
  };
  const getMemberExpenses = () => {
    const memberExpenses = {};
    expenses.forEach((expense) => {
      const memberName = expense.senderId?.name || "Unknown";
      memberExpenses[memberName] =
        (memberExpenses[memberName] || 0) + expense.amount;
    });
    return memberExpenses;
  };

  if (!group) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {group.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Group Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Group Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Members:
                  </span>
                  <span className="font-medium">
                    {group.members?.length || 0}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Total Expenses:
                  </span>
                  <span className="font-medium">
                    {formatCurrency(getTotalGroupExpenses())}
                  </span>
                </div>{" "}
              </div>
              {group.description && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Description:
                    </span>
                  </div>
                  <p className="text-sm">{group.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="expenses" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>

            {/* Expenses Tab */}
            <TabsContent value="expenses" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Group Expenses</span>
                    {loadingExpenses && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 animate-spin" />
                        Loading...
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {expenseError ? (
                    <div className="flex items-center gap-2 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      {expenseError}
                    </div>
                  ) : expenses.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No expenses found for this group</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {expenses.map((expense) => (
                        <div
                          key={expense._id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1">
                            {" "}
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{expense.title}</h4>
                              <Badge variant="outline" className="text-xs">
                                {expense.category}
                              </Badge>
                            </div>{" "}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                Paid by {expense.senderId?.name || "Unknown"}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-lg">
                              {formatCurrency(expense.amount)}
                            </div>{" "}
                            <div className="text-xs text-muted-foreground">
                              {expense.participants?.length || 0} people
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Members Tab */}
            <TabsContent value="members" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Group Members</CardTitle>
                </CardHeader>
                <CardContent>
                  {group.members?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No members in this group</p>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {group.members?.map((member) => (
                        <div
                          key={member._id}
                          className="flex items-center gap-3 p-3 border rounded-lg"
                        >
                          <Avatar>
                            <AvatarFallback>
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-medium">{member.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {member.email}
                            </p>
                          </div>
                          {member._id === group.createdBy && (
                            <Badge variant="secondary">Admin</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Summary Tab */}
            <TabsContent value="summary" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Expenses by Category */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Expenses by Category
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Object.keys(getExpensesByCategory()).length === 0 ? (
                      <p className="text-muted-foreground text-sm">
                        No expenses to categorize
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {Object.entries(getExpensesByCategory()).map(
                          ([category, amount]) => (
                            <div
                              key={category}
                              className="flex justify-between items-center"
                            >
                              <span className="text-sm">{category}</span>
                              <span className="font-medium">
                                {formatCurrency(amount)}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Expenses by Member */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Expenses by Member
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Object.keys(getMemberExpenses()).length === 0 ? (
                      <p className="text-muted-foreground text-sm">
                        No member expenses
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {Object.entries(getMemberExpenses()).map(
                          ([member, amount]) => (
                            <div
                              key={member}
                              className="flex justify-between items-center"
                            >
                              <span className="text-sm">{member}</span>
                              <span className="font-medium">
                                {formatCurrency(amount)}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Total Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Group Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(getTotalGroupExpenses())}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Expenses
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {expenses.length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Number of Expenses
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {group.members?.length || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Group Members
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
