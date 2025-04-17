import { Card,CardHeader,CardDescription,CardTitle,CardContent } from "./ui/card"
const SummaryCard = ({ title, description, amount, gradient}: any) => (
  <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
    <CardHeader
  className={`bg-gradient-to-r ${gradient} p-6 space-y-2 rounded-xl`}
>
  <CardTitle className="text-xl">{title}</CardTitle>
  <CardDescription className="text-base">{description}</CardDescription>
</CardHeader>

    <CardContent className="pt-6">
      <div className="text-3xl font-bold">${amount.toFixed(2)}</div>
      <p className="text-sm text-muted-foreground">Across {title === "You Owe" ? "1 friend" : "2 friends"}</p>
    </CardContent>
  </Card>
)
export default SummaryCard;