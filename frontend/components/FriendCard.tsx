import { Card,CardContent } from "./ui/card"
import { UserRound } from "lucide-react"
import { DropdownMenu,DropdownMenuTrigger,DropdownMenuContent,DropdownMenuItem } from "./ui/dropdown-menu"
import { Button } from "./ui/button"
import { MoreHorizontal } from "lucide-react"
interface Friend {
  id : number,
  name : string,
  email : string,
  totalOwed : number,
  totalOwes : number
}
const FriendCard = ({ friend } : {friend : Friend}) => (
  <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <UserRound className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">{friend.name}</h3>
            <p className="text-sm text-muted-foreground">{friend.email}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {friend.totalOwed > 0 && (
            <div className="text-sm font-medium text-green-500">
              Owes you ${friend.totalOwed.toFixed(2)}
            </div>
          )}
          {friend.totalOwes > 0 && (
            <div className="text-sm font-medium text-red-500">
              You owe ${friend.totalOwes.toFixed(2)}
            </div>
          )}
          {friend.totalOwed === 0 && friend.totalOwes === 0 && (
            <div className="text-sm font-medium text-muted-foreground">
              All settled up
            </div>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Add Expense</DropdownMenuItem>
              <DropdownMenuItem>Settle Up</DropdownMenuItem>
              <DropdownMenuItem className="text-red-500">Remove Friend</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </CardContent>
  </Card>
)
export default FriendCard;