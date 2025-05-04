"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  DollarSign,
  LineChart,
  MessageSquare,
  Plus,
  Users,
  Utensils,
  ShoppingBag,
  LogIn
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts"

// Replace the entire features array with this simplified version
const features = [
  {
    icon: Users,
    title: "Split Expenses Easily",
    description: "Add expenses and split them equally or with custom amounts among friends and roommates.",
  },
  {
    icon: CreditCard,
    title: "Settle Debts Quickly",
    description: "Send and receive payments directly through the app or mark debts as settled manually.",
  },
  {
    icon: LineChart,
    title: "Balance History",
    description: "View your balance history over time to understand how your shared expenses have evolved.",
  },
  {
    icon: MessageSquare,
    title: "Comments & Reminders",
    description: "Add comments to expenses and send friendly reminders for pending payments.",
  },
]

// Remove the testimonials section entirely by replacing the entire LandingPage component with this streamlined version
function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  // Remove the automatic redirection to allow access to landing page when logged in
  // Only the buttons will conditionally redirect

  // Handle Get Started button clicks to check auth status first
  const handleGetStartedClick = (e: React.MouseEvent) => {
    if (isAuthenticated) {
      e.preventDefault()
      router.push('/dashboard')
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-bold">
            <DollarSign className="h-6 w-6 text-primary" />
            <span>Squarix</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden gap-6 md:flex">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              How It Works
            </Link>
            <Link
              href="#faq"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              FAQ
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle Menu"
              className="mr-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn("transition-all", isMenuOpen ? "hidden" : "block")}
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn("transition-all", isMenuOpen ? "block" : "hidden")}
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </Button>
          </div>

          {/* Auth Buttons */}
          <div className="hidden gap-2 md:flex">
            <Button asChild>
              <Link 
                href={isAuthenticated ? '/dashboard' : '/auth'} 
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:shadow-md hover:shadow-primary/20"
              >
                <LogIn className="h-4 w-4" />
                {isAuthenticated ? 'Dashboard' : 'Login'}
              </Link>
            </Button>

            <Button asChild>
              <Link 
                href={isAuthenticated ? '/dashboard' : '/auth?tab=signup'} 
                className="flex items-center bg-gradient-to-r from-primary to-primary/80 hover:shadow-md hover:shadow-primary/20"
              >
                {isAuthenticated ? 'Dashboard' : 'Sign Up'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="container pb-4 md:hidden"
          >
            <nav className="flex flex-col gap-4">
              <Link
                href="#features"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link
                href="#faq"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                FAQ
              </Link>
              <div className="flex gap-2 pt-2">
                <Button asChild>
                  <Link 
                    href={isAuthenticated ? '/dashboard' : '/auth'} 
                    className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:shadow-md hover:shadow-primary/20"
                  >
                    <LogIn className="h-4 w-4" />
                    {isAuthenticated ? 'Dashboard' : 'Login'}
                  </Link>
                </Button>

                <Button asChild>
                  <Link 
                    href={isAuthenticated ? '/dashboard' : '/auth?tab=signup'} 
                    className="w-full bg-gradient-to-r from-primary to-primary/80"
                  >
                    {isAuthenticated ? 'Dashboard' : 'Sign Up'}
                  </Link>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/50 z-0"></div>

          {/* Background Elements */}
          <div className="absolute left-1/3 top-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[100px]" />
          <div className="absolute right-1/3 bottom-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-primary/20 blur-[100px]" />
          <div className="absolute right-1/4 top-1/3 -z-10 h-[300px] w-[300px] rounded-full bg-primary/5 blur-[80px]" />

          <div className="container relative z-10">
            <div className="grid gap-12 md:grid-cols-2 md:gap-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col justify-center space-y-8"
              >
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                    Split expenses <span className="text-primary">effortlessly</span> with friends
                  </h1>
                  <p className="text-xl text-muted-foreground">
                    Track shared expenses, settle debts, and maintain friendships without the awkward money talk.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    asChild
                    size="lg"
                    className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/20"
                  >
                    <Link 
                      href={isAuthenticated ? '/dashboard' : '/auth?tab=signup'}
                      onClick={handleGetStartedClick}
                    >
                      {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="hover:bg-primary/10 hover:text-primary">
                    <Link href="#how-it-works">How It Works</Link>
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>No credit card required</span>
                  <span className="mx-2">•</span>
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Free for basic use</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative mx-auto w-full max-w-md"
              >
                <div className="relative z-10 overflow-hidden rounded-2xl border bg-card shadow-2xl shadow-primary/10">
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent"></div>
                  <div className="p-6">
                    <div className="mb-6 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-10 w-10 border-2 border-background">
                          <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
                          <AvatarFallback>NP</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">Nalin Parihar</p>
                          <p className="text-xs text-muted-foreground">Dashboard</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="gap-1">
                        <Plus className="h-3.5 w-3.5" />
                        Add
                      </Button>
                    </div>

                    <div className="mb-6 space-y-4">
                      <div className="rounded-lg bg-muted/50 p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <h3 className="font-medium">Total Balance</h3>
                          <span className="text-lg font-bold">$245.00</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">You are owed</span>
                          <span className="font-medium text-green-500">$320.00</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">You owe</span>
                          <span className="font-medium text-red-500">$75.00</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-medium">Recent Expenses</h3>
                        <div className="rounded-md bg-muted/30 p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                <Utensils className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">Dinner</p>
                                <p className="text-xs text-muted-foreground">with Alex, Taylor</p>
                              </div>
                            </div>
                            <p className="text-green-500">+$57.50</p>
                          </div>
                        </div>
                        <div className="rounded-md bg-muted/30 p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                <ShoppingBag className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">Groceries</p>
                                <p className="text-xs text-muted-foreground">with Taylor</p>
                              </div>
                            </div>
                            <p className="text-red-500">-$41.45</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-primary to-primary/80">Settle Up</Button>
                  </div>
                </div>

                <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/20 blur-3xl"></div>
                <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl"></div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20">
          <div className="container">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need to manage shared expenses
              </h2>
              <p className="text-muted-foreground">
                Squarix makes it easy to split bills, track expenses, and settle up with friends and roommates.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:shadow-primary/5 hover:-translate-y-1"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-all duration-300 group-hover:bg-primary/20">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="relative py-20">
          <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-background"></div>
          <div className="container relative">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">How Squarix Works</h2>
              <p className="text-muted-foreground">
                Get started in minutes and say goodbye to awkward money conversations.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative flex flex-col items-center text-center"
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-3xl font-bold text-primary-foreground shadow-lg shadow-primary/20">
                    {index + 1}
                  </div>
                  <h3 className="mb-2 text-xl font-bold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>

                  {index < steps.length - 1 && (
                    <div className="absolute left-1/2 top-8 hidden h-0.5 w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-border to-transparent md:block" />
                  )}
                </motion.div>
              ))}
            </div>

            <div className="mt-16 flex justify-center">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/20"
              >
                <Link 
                  href={isAuthenticated ? '/dashboard' : '/auth?tab=signup'}
                  onClick={handleGetStartedClick}
                >
                  {isAuthenticated ? 'Go to Dashboard' : 'Start Splitting Expenses'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20">
          <div className="container">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">
                Find answers to common questions about Squarix and how it works.
              </p>
            </div>

            <div className="mx-auto max-w-3xl">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container">
            <div className="relative overflow-hidden rounded-2xl p-8 md:p-12">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-background"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,theme(colors.primary.DEFAULT)/10,transparent_70%)]"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,theme(colors.primary.DEFAULT)/10,transparent_70%)]"></div>

              <div className="relative mx-auto max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  Ready to simplify your shared expenses?
                </h2>
                <p className="mb-8 text-muted-foreground">
                  Join thousands of users who have made splitting bills with friends and roommates easier than ever.
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <Button
                    asChild
                    size="lg"
                    className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/20"
                  >
                    <Link 
                      href={isAuthenticated ? '/dashboard' : '/auth?tab=signup'}
                      onClick={handleGetStartedClick}
                    >
                      {isAuthenticated ? 'Go to Dashboard' : 'Sign Up for Free'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="hover:bg-primary/10 hover:text-primary">
                    <Link href={isAuthenticated ? '/dashboard' : '/auth'}>
                      {isAuthenticated ? 'Dashboard' : 'Login'}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2 text-lg font-bold">
              <DollarSign className="h-6 w-6 text-primary" />
              <span>Squarix</span>
            </div>

            <nav className="flex gap-6">
              <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground">
                Features
              </Link>
              <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground">
                How It Works
              </Link>
              <Link href="#faq" className="text-sm text-muted-foreground hover:text-foreground">
                FAQ
              </Link>
            </nav>

            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Squarix. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// How it works steps
const steps = [
  {
    title: "Create an Account",
    description: "Sign up for free in seconds and start managing your shared expenses right away.",
  },
  {
    title: "Add Friends & Expenses",
    description: "Connect with friends and start recording your shared expenses as they happen.",
  },
  {
    title: "Settle Up Easily",
    description: "Pay or receive money and keep track of who owes what with automatic balance calculations.",
  },
]

// FAQ data
const faqs = [
  {
    question: "Is Squarix free to use?",
    answer:
      "Yes, Squarix is completely free for basic use. We offer all core features at no cost, with optional premium features available for power users.",
  },
  {
    question: "How does Squarix calculate who owes what?",
    answer:
      "Our app uses a sophisticated algorithm to simplify debts within your group. Instead of everyone paying small amounts to multiple people, we optimize who pays whom to minimize the number of transactions needed.",
  },
  {
    question: "Can I split expenses unequally?",
    answer:
      "You can split expenses equally, by percentages, by shares, or by exact amounts. This is perfect for situations where not everyone owes the same amount.",
  },
  {
    question: "How do I settle a debt with someone?",
    answer:
      "You can record cash payments directly in the app, or use our integrated payment options. Once a payment is recorded, balances are automatically updated.",
  },
  {
    question: "Can I use Squarix for group trips or events?",
    answer:
      "Yes! Squarix is perfect for group trips, events, or any situation where multiple people are sharing expenses. You can create separate groups for different occasions.",
  },
  {
    question: "Is my financial information secure?",
    answer:
      "We take security very seriously. All your data is encrypted, and we never store complete payment information on our servers. We use industry-standard security practices to protect your information.",
  },
]
export default LandingPage;