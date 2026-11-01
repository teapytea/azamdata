import { createFileRoute } from "@tanstack/react-router"
import {
  Home01Icon,
  CreditCardIcon,
  Activity01Icon,
  ContactIcon,
  Database01Icon,
  Invoice01Icon,
  PenTool01Icon,
  Delete01Icon,
  HelpCircleIcon,
  Settings01Icon,
  Search02Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  ArrowRight01Icon,
  MoreHorizontalCircle01Icon,
  UserGroupIcon,
  Package01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export const Route = createFileRoute("/dashboard-3")({
  component: DashboardPage,
})

const barChartData = [
  { date: "Apr 1", balance: 4000 },
  { date: "Apr 2", balance: 3000 },
  { date: "Apr 3", balance: 5000 },
  { date: "Apr 4", balance: 4500 },
  { date: "Apr 5", balance: 6000 },
  { date: "Apr 6", balance: 5500 },
  { date: "Apr 7", balance: 7000 },
  { date: "Apr 8", balance: 6500 },
  { date: "Apr 9", balance: 4000 },
  { date: "Apr 10", balance: 4500 },
  { date: "Apr 11", balance: 5000 },
  { date: "Apr 12", balance: 4800 },
  { date: "Apr 13", balance: 6000 },
  { date: "Apr 14", balance: 7500 },
  { date: "Apr 15", balance: 8000 },
  { date: "Apr 16", balance: 4000 },
  { date: "Apr 17", balance: 3500 },
  { date: "Apr 18", balance: 3800 },
  { date: "Apr 19", balance: 5500 },
  { date: "Apr 20", balance: 6000 },
  { date: "Apr 21", balance: 4500 },
  { date: "Apr 22", balance: 5000 },
  { date: "Apr 23", balance: 5500 },
  { date: "Apr 24", balance: 4000 },
  { date: "Apr 25", balance: 3500 },
  { date: "Apr 26", balance: 6000 },
  { date: "Apr 27", balance: 5000 },
  { date: "Apr 28", balance: 5500 },
  { date: "Apr 29", balance: 7000 },
  { date: "Apr 30", balance: 6500 },
  { date: "May 1", balance: 8000 },
  { date: "May 2", balance: 7500 },
  { date: "May 3", balance: 6000 },
  { date: "May 4", balance: 5500 },
  { date: "May 5", balance: 4000 },
  { date: "May 6", balance: 4500 },
  { date: "May 7", balance: 5000 },
  { date: "May 8", balance: 6000 },
  { date: "May 9", balance: 7500 },
  { date: "May 10", balance: 8000 },
  { date: "May 11", balance: 6500 },
  { date: "May 12", balance: 6000 },
  { date: "May 13", balance: 7000 },
  { date: "May 14", balance: 8500 },
]

const transactions = [
  {
    id: 1,
    type: "Tax Refund",
    description: "2024 Income Tax Refund",
    amount: "+$542.00",
    date: "Dec 20",
    icon: "mastercard",
    positive: true,
  },
  {
    id: 2,
    type: "Freelance Payment",
    description: "Payment for Invoice #INV-4421 - Website redesign project",
    amount: "-$800.00",
    date: "Dec 14",
    icon: "paypal",
    positive: false,
  },
  {
    id: 3,
    type: "Salary Payment",
    description: "Monthly salary - Acme Corporation SRL, Payroll November 2025",
    amount: "-$2500.00",
    date: "Dec 01",
    icon: "visa",
    positive: false,
  },
]

const BrandIcon = ({ type }: { type: string }) => {
  if (type === "mastercard") {
    return (
      <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="12" r="6" fill="#EA001B" />
        <circle cx="16" cy="12" r="6" fill="#FFA200" fillOpacity="0.8" />
      </svg>
    )
  }
  if (type === "paypal") {
    return (
      <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.5 4.5H14.5C16.5 4.5 18 5.5 18 7.5C18 9.5 16.5 11.5 14.5 11.5H11.5L10.5 17.5H7.5L8.5 11.5L9.5 4.5H7.5Z" fill="#003087" />
        <path d="M10.5 11.5H14.5C15.5 11.5 16.5 10.5 16.5 9.5C16.5 8.5 15.5 7.5 14.5 7.5H11.5L10.5 11.5Z" fill="#009CDE" />
      </svg>
    )
  }
  if (type === "visa") {
    return (
      <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.5 8.5L9.5 15.5H7.5L8.5 8.5H10.5ZM15.5 8.5C16.5 8.5 17.5 9 17.5 10V10.5H15.5V10C15.5 9.8 15.2 9.5 14.5 9.5C14 9.5 13.5 9.8 13.5 10C13.5 10.2 13.8 10.5 14.5 10.5C15.5 10.8 16.5 11 16.5 12.5C16.5 14 15.5 15.5 13.5 15.5C12.5 15.5 11.5 15 11.5 14V13.5H13.5V14C13.5 14.2 13.8 14.5 14.5 14.5C15 14.5 15.5 14.2 15.5 14C15.5 13.8 15.2 13.5 14.5 13.5C13.5 13.2 12.5 13 12.5 11.5C12.5 10 13.5 8.5 15.5 8.5ZM6.5 8.5L5 13.5L4.5 8.5H2.5L4 15.5H6L8 8.5H6.5ZM21.5 8.5L20 15.5H18L19.5 8.5H21.5Z" fill="#1434CB" />
      </svg>
    )
  }
  return null
}

const payments = [
  { id: 1, status: "Success", email: "ken99@yahoo.com", amount: "$316.00" },
  { id: 2, status: "Success", email: "Abe45@gmail.com", amount: "$242.00" },
  { id: 3, status: "Processing", email: "Monserrat44@gmail.com", amount: "$837.00" },
  { id: 4, status: "Success", email: "Silas22@gmail.com", amount: "$874.00" },
  { id: 5, status: "Failed", email: "carmella@hotmail.com", amount: "$721.00" },
]

function DashboardPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full bg-muted/20">
        <AppSidebar />
        <div className="flex w-full flex-col">
          <header className="flex h-14 items-center gap-2 border-b bg-background px-4 lg:h-[60px] lg:px-6">
            <SidebarTrigger className="-ml-1" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-semibold">Home</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <main className="flex-1 p-4 lg:p-6 space-y-6">
            {/* Top Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Checking Account */}
              <Card className="shadow-sm">
                <CardContent className="p-6 flex items-center gap-6">
                  <div className="relative size-16">
                    <svg className="size-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="18" cy="18" r="14" fill="none" className="stroke-muted/30" strokeWidth="5" />
                      <circle cx="18" cy="18" r="14" fill="none" className="stroke-blue-600" strokeWidth="5" strokeDasharray="88" strokeDashoffset="22" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-base">Checking account</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Current balance</p>
                    <div className="flex items-center justify-between pt-1">
                      <p className="text-2xl font-bold tracking-tight">$25,895.00</p>
                      <Badge variant="secondary" className="rounded-full bg-green-50 text-green-600 hover:bg-green-50 border-transparent px-2 py-0.5 text-[10px] font-bold">+1.25%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue */}
              <Card className="shadow-sm">
                <CardContent className="p-6 flex items-center gap-6">
                  <div className="relative size-16">
                    <svg className="size-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="18" cy="18" r="14" fill="none" className="stroke-muted/30" strokeWidth="5" />
                      <circle cx="18" cy="18" r="14" fill="none" className="stroke-blue-600" strokeWidth="5" strokeDasharray="88" strokeDashoffset="66" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-base">Revenue</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Current balance</p>
                    <div className="flex items-center justify-between pt-1">
                      <p className="text-2xl font-bold tracking-tight">$8,325.00</p>
                      <Badge variant="secondary" className="rounded-full bg-green-50 text-green-600 hover:bg-green-50 border-transparent px-2 py-0.5 text-[10px] font-bold">+1.25%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Middle Section */}
            <div className="grid gap-4 md:grid-cols-3">
              {/* Balance Overview */}
              <Card className="md:col-span-2 shadow-sm">
                <CardHeader>
                  <CardTitle>Balance overview</CardTitle>
                  <CardDescription>A clear snapshot of your current account balance over the last months.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{ balance: { label: "Balance", color: "hsl(var(--primary))" } }} className="h-[250px] w-full">
                    <BarChart data={barChartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={10} minTickGap={32} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="balance" fill="#60a5fa" radius={[2, 2, 0, 0]} barSize={8} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Transactions */}
              <Card className="shadow-sm flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full border p-1">
                      <HugeiconsIcon icon={Activity01Icon} className="size-4 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-base">Transactions</CardTitle>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 text-xs">
                    Last month <HugeiconsIcon icon={ArrowRight01Icon} className="ml-1 size-3" />
                  </Button>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between pt-4">
                  <div className="space-y-6">
                    {transactions.map((t) => (
                      <div key={t.id} className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex items-center justify-center size-7">
                            <BrandIcon type={t.icon} />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">{t.type}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2 pr-4">{t.description}</p>
                          </div>
                        </div>
                        <div className="text-right space-y-1 shrink-0">
                          <p className={cn("text-sm font-medium", t.positive ? "text-green-600" : "text-foreground")}>
                            {t.amount}
                          </p>
                          <p className="text-xs text-muted-foreground">{t.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="secondary" className="w-full mt-6 bg-muted/50">View all</Button>
                </CardContent>
              </Card>
            </div>

            {/* Payments Table */}
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Payments</CardTitle>
                    <CardDescription>Manage your payments.</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">View all</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between py-4">
                  <Input placeholder="Filter emails..." className="max-w-sm h-9 bg-transparent" autoComplete="off" name="email-filter" />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9">
                        Columns <HugeiconsIcon icon={ArrowDown01Icon} className="ml-2 size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Status</DropdownMenuItem>
                      <DropdownMenuItem>Email</DropdownMenuItem>
                      <DropdownMenuItem>Amount</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12 text-center"><Checkbox checked={false} /></TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Email <HugeiconsIcon icon={ArrowDown01Icon} className="inline size-3 ml-1" /></TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="text-center"><Checkbox checked={false} /></TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "size-1.5 rounded-full",
                                payment.status === "Success" ? "bg-green-500" :
                                payment.status === "Processing" ? "bg-yellow-500" : "bg-red-500"
                              )} />
                              {payment.status}
                            </div>
                          </TableCell>
                          <TableCell>{payment.email}</TableCell>
                          <TableCell className="text-right">{payment.amount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex items-center justify-end space-x-2 py-4">
                  <div className="flex-1 text-sm text-muted-foreground">
                    0 of {payments.length} row(s) selected.
                  </div>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm" disabled>Previous</Button>
                    <Button variant="outline" size="sm">Next</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

function AppSidebar() {
  return (
    <Sidebar className="border-r bg-background">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="hover:bg-transparent cursor-default">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-zinc-900 text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
                  <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                  <path d="M18 14h-8" />
                  <path d="M15 18h-5" />
                  <path d="M10 6h8v4h-8V6Z" />
                </svg>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Faiz UI</span>
                <span className="truncate text-xs text-muted-foreground">Enterprise</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive>
                  <HugeiconsIcon icon={Home01Icon} />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <HugeiconsIcon icon={CreditCardIcon} />
                  <span>Accounts</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <HugeiconsIcon icon={Package01Icon} />
                  <span>Transactions</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <HugeiconsIcon icon={Activity01Icon} />
                  <span>Activity</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <HugeiconsIcon icon={UserGroupIcon} />
                  <span>Contacts</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Tools & support</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <HugeiconsIcon icon={Database01Icon} />
                  <span>Data library</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <HugeiconsIcon icon={Invoice01Icon} />
                  <span>Reports</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <HugeiconsIcon icon={SparklesIcon} />
                  <span>Word Assistant</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <HugeiconsIcon icon={Delete01Icon} />
                  <span>Trash</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <HugeiconsIcon icon={HelpCircleIcon} />
                  <span>Help</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 space-y-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <HugeiconsIcon icon={Settings01Icon} />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <HugeiconsIcon icon={HelpCircleIcon} />
              <span>Get help</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <HugeiconsIcon icon={Search02Icon} />
              <span>Search</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs overflow-hidden">
              <img src="https://github.com/shadcn.png" alt="shadcn" className="size-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-none">shadcn</span>
              <span className="text-xs text-muted-foreground">m@example.com</span>
            </div>
          </div>
          <HugeiconsIcon icon={ArrowUp01Icon} className="size-4 text-muted-foreground" />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
