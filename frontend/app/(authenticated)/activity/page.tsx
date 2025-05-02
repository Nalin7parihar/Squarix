"use client"

import { useState, useEffect } from "react"
import { ExpenseList } from "@/components/expense-list"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"
import { 
  ArrowDownUp, 
  Calendar as CalendarIcon,
  Filter, 
  MoreHorizontal, 
  RefreshCcw, 
  Search, 
  X 
} from "lucide-react"
import { format } from "date-fns"
import { useExpenses } from "@/contexts"

export default function ActivityPage() {
  const { filterExpenses, getExpenses, expenses } = useExpenses()
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState<string[]>([])
  const [timePeriod, setTimePeriod] = useState<string>("all")
  const [date, setDate] = useState<Date>()
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false)

  // Load initial expenses only once
  useEffect(() => {
    if (!hasInitiallyLoaded) {
      const loadExpenses = async () => {
        setIsLoading(true)
        try {
          await getExpenses()
        } catch (error) {
          console.error('Error loading expenses:', error)
        } finally {
          setIsLoading(false)
          setHasInitiallyLoaded(true)
        }
      }
      loadExpenses()
    }
  }, [getExpenses, hasInitiallyLoaded])

  // Only filter expenses if we actually have expenses
  const shouldFilterExpenses = expenses.length > 0

  // Handle tab changes
  useEffect(() => {
    if (!shouldFilterExpenses) return
    
    const loadExpenses = async () => {
      setIsLoading(true)
      try {
        if (activeTab === 'all') {
          await getExpenses()
        } else {
          await filterExpenses({ type: activeTab })
        }
      } catch (error) {
        console.error('Error filtering expenses:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadExpenses()
  }, [activeTab, filterExpenses, getExpenses, shouldFilterExpenses])

  // Handle time period changes
  useEffect(() => {
    if (timePeriod === 'all' || !shouldFilterExpenses) {
      // Reset to all expenses if time period is 'all'
      if (timePeriod === 'all' && shouldFilterExpenses) {
        getExpenses()
      }
      return
    }
    
    const loadExpenses = async () => {
      setIsLoading(true)
      try {
        await filterExpenses({ timePeriod })
      } catch (error) {
        console.error('Error filtering expenses:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadExpenses()
  }, [timePeriod, filterExpenses, getExpenses, shouldFilterExpenses])

  // Handle date selection
  useEffect(() => {
    if (!date || !shouldFilterExpenses) return
    
    const loadExpenses = async () => {
      setIsLoading(true)
      try {
        await filterExpenses({ date: date.toISOString() })
      } catch (error) {
        console.error('Error filtering expenses:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadExpenses()
  }, [date, filterExpenses, shouldFilterExpenses])

  const addFilter = (filter: string) => {
    if (!filters.includes(filter)) {
      setFilters([...filters, filter])
    }
  }

  const removeFilter = (filter: string) => {
    setFilters(filters.filter(f => f !== filter))
  }

  const handleRefresh = async () => {
    if (!shouldFilterExpenses) return
    
    setIsLoading(true)
    try {
      await getExpenses()
    } catch (error) {
      console.error('Error refreshing expenses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Rest of your component remains the same
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <h1 className="text-3xl font-bold tracking-tight">Activity</h1>
        <p className="text-muted-foreground">Track and manage all your shared expenses</p>
      </div>
      
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center px-4 md:px-6">
          <div className="flex flex-wrap gap-2 items-center">
            {filters.map(filter => (
              <Badge key={filter} variant="secondary" className="px-2 py-1">
                {filter}
                <button 
                  className="ml-2 rounded-full hover:bg-muted" 
                  onClick={() => removeFilter(filter)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {filters.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters([])}
                className="h-8 px-2 text-xs"
              >
                Clear all
              </Button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <Select
              value={timePeriod}
              onValueChange={setTimePeriod}
            >
              <SelectTrigger className="w-full md:w-[150px] h-10">
                <SelectValue placeholder="Time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="6months">Last 6 months</SelectItem>
                <SelectItem value="year">Last year</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 px-3"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter By</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => addFilter("Past 30 days")}>
                  Past 30 days
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => addFilter("You owe")}>
                  You owe
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => addFilter("Owed to you")}>
                  Owed to you
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <ArrowDownUp className="mr-2 h-4 w-4" />
                  Newest first
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ArrowDownUp className="mr-2 h-4 w-4 rotate-180" />
                  Oldest first
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10"
              onClick={handleRefresh}
              disabled={!shouldFilterExpenses}
            >
              <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        
        <div className="px-4 md:px-6">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b">
              <TabsList className="w-full justify-start h-12 bg-transparent p-0">
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-4 h-12 border-b-2 border-transparent"
                >
                  All Expenses
                </TabsTrigger>
                <TabsTrigger 
                  value="youowe" 
                  className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-4 h-12 border-b-2 border-transparent"
                >
                  You Owe
                </TabsTrigger>
                <TabsTrigger 
                  value="owedtoyou" 
                  className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-4 h-12 border-b-2 border-transparent"
                >
                  Owed To You
                </TabsTrigger>
                <TabsTrigger 
                  value="settled" 
                  className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-4 h-12 border-b-2 border-transparent"
                >
                  Settled
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="w-full pt-6">
              <TabsContent value="all" className="mt-0 animate-in fade-in-50 duration-300 w-full">
                <ExpenseList isLoading={isLoading} />
              </TabsContent>
              
              <TabsContent value="youowe" className="mt-0 animate-in fade-in-50 duration-300 w-full">
                <ExpenseList 
                  isLoading={isLoading}
                  title="Expenses You Owe"
                  description="Expenses where you need to pay others"
                />
              </TabsContent>
              
              <TabsContent value="owedtoyou" className="mt-0 animate-in fade-in-50 duration-300 w-full">
                <ExpenseList 
                  isLoading={isLoading}
                  title="Expenses Owed To You"
                  description="Expenses where others need to pay you"
                />
              </TabsContent>
              
              <TabsContent value="settled" className="mt-0 animate-in fade-in-50 duration-300 w-full">
                <ExpenseList 
                  isLoading={isLoading}
                  title="Settled Expenses"
                  description="Expenses that have been fully settled"
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}