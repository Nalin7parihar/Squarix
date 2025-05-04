import { Card,CardContent,CardHeader,CardDescription,CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import {motion} from 'framer-motion';

const PeopleCard = ({ title, description, isLoading, friends, type, handleSettleUp }: any) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-9 w-24" />
            </div>
          ))}
        </div>
      ) : friends.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-muted-foreground">{type === "you-owe" ? "You don't owe anyone money." : "No one owes you money."}</p>
        </div>
      ) : (
        friends.map((friend: any, index: number) => (
          <motion.div
            key={`${friend.transactionId || friend.id}-${index}`}
            className="flex items-center justify-between rounded-lg p-3 transition-all duration-200 hover:bg-muted/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 transition-transform duration-200 hover:scale-110">
                
                <AvatarFallback>{friend.name.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{friend.name}</p>
                <p className={`text-sm ${type === "you-owe" ? "text-red-500" : "text-green-500"}`}>
                  {type === "you-owe" ? `You owe $${friend.balance.toFixed(2)}` : `Owes you $${friend.balance.toFixed(2)}`}
                </p>
              </div>
            </div>
            <Button
              onClick={() => handleSettleUp(friend)}
              className={type === "you-owe" ? "bg-primary/90 hover:bg-primary hover:scale-105" : "hover:bg-primary/10 hover:text-primary hover:scale-105"}
              variant={type === "you-owe" ? undefined : "outline"}
            >
              {type === "you-owe" ? "Pay Now" : "Request"}
            </Button>
          </motion.div>
        ))
      )}
    </CardContent>
  </Card>
)
export default PeopleCard;