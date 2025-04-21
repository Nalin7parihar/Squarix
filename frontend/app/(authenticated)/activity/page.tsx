"use client"

import { useState } from "react"
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

export default function ActivityPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [filters, setFilters] = useState<string[]>([])
  const [timePeriod, setTimePeriod] = useState("all")
  
  const handleRefresh = () => {
    setIsLoading(true)
    // Simulate data loading
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)
  }
  
  const addFilter = (filter: string) => {
    if (!filters.includes(filter)) {
      setFilters([...filters, filter])
    }
  }
  
  const removeFilter = (filter: string) => {
    setFilters(filters.filter(f => f !== filter))
  }
  
  return (
    <div className="container mx-auto max-w-5xl py-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Activity</h1>
        <p className="text-muted-foreground">Track and manage all your shared expenses</p>
      </div>
      
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
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
            >
              <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        
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
          
          <TabsContent value="all" className="pt-6 animate-in fade-in-50 duration-300">
            <ExpenseList isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="youowe" className="pt-6 animate-in fade-in-50 duration-300">
            <Card>
              <CardHeader>
                <CardTitle>Expenses You Owe</CardTitle>
                <CardDescription>Expenses where you need to pay others</CardDescription>
              </CardHeader>
              <CardContent className="h-48 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-muted-foreground">No expenses found</p>
                  <p className="text-sm text-muted-foreground">You don't owe anyone right now.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="owedtoyou" className="pt-6 animate-in fade-in-50 duration-300">
            <ExpenseList isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="settled" className="pt-6 animate-in fade-in-50 duration-300">
            <Card>
              <CardHeader>
                <CardTitle>Settled Expenses</CardTitle>
                <CardDescription>Expenses that have been fully settled</CardDescription>
              </CardHeader>
              <CardContent className="h-48 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-muted-foreground">No settled expenses found</p>
                  <p className="text-sm text-muted-foreground">Settled expenses will appear here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}