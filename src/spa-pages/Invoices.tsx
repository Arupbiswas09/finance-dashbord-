import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { UserProfile } from "@/components/UserProfile";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Download, Send, Search, Brain, Bell } from "lucide-react";
import { LanguageChangeDropdown } from "@/components/LanguageChangeDropdown";
import { useOrganizationColors } from "@/hooks/useOrganizationColors";

const Invoices = () => {
  const orgColors = useOrganizationColors();
  const customersData = [
    { client: "ABC Corp", amount: "$12,500", dueDate: "2024-01-15", status: "overdue", missingDoc: true },
    { client: "XYZ Ltd", amount: "$8,750", dueDate: "2024-01-20", status: "pending", missingDoc: false },
    { client: "Tech Solutions", amount: "$15,200", dueDate: "2024-01-25", status: "paid", missingDoc: false },
    { client: "Global Inc", amount: "$6,300", dueDate: "2024-01-30", status: "pending", missingDoc: true },
  ];

  const suppliersData = [
    { client: "Office Supplies Co", amount: "$2,400", dueDate: "2024-01-18", status: "pending", missingDoc: true },
    { client: "Software Licenses Inc", amount: "$4,800", dueDate: "2024-01-22", status: "overdue", missingDoc: false },
    { client: "Consulting Services", amount: "$3,200", dueDate: "2024-01-28", status: "paid", missingDoc: false },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "overdue": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const aiSuggestions = [
    "ABC Corp payment has no invoice - please provide supporting documentation",
    "XYZ Ltd payment is approaching due date - consider sending a reminder",
    "Office Supplies Co invoice shows pricing discrepancy - verify with supplier",
  ];

  const InvoiceTable = ({ data, type }: { data: any[], type: string }) => (
    <div className="space-y-2 md:space-y-3">
      {data.map((item, index) => (
        <div
          key={index}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 md:p-4 border rounded-lg hover:bg-accent/50 transition-all duration-200 gap-3 sm:gap-4"
        >
          <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
            <div className="flex-1 sm:flex-none">
              <p className="font-semibold text-sm md:text-base">{item.client}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Due: {item.dueDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
            <span className="font-mono font-semibold text-sm md:text-base">{item.amount}</span>
            <Badge className={`${getStatusColor(item.status)} font-medium text-xs`}>
              {item.status}
            </Badge>
            {item.missingDoc && (
              <div className="flex items-center gap-1 text-destructive">
                <AlertCircle className="h-3 w-3 md:h-4 md:w-4" />
                <span className="text-xs">Missing doc</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Send className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-[112px] shrink-0 items-center justify-between px-12 bg-white">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-1" />
            <div>
              <h1 className="text-[32px] font-normal text-gray-900 leading-tight mb-1.5">Outstanding Invoices</h1>
              <p className="text-base text-black font-normal">Effortlessly track and manage invoices with Yuki integration</p>
            </div>
          </div>

          {/* User actions */}
          <div className="flex items-center">
            <LanguageChangeDropdown />
            <Button
              variant="secondary"
              size="icon"
              className="relative hover:bg-gray-50 rounded-full w-8 h-8 ml-2"
              style={{ 
                backgroundColor: '#FFFFFF',
                borderColor: '#E5E7EB'
              }}
            >
              <Bell className="h-4 w-4" style={{ color: '#4B5563' }} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: '#EF4444' }}></span>
            </Button>
            <div className="ml-4">
              <UserProfile />
            </div>
          </div>
        </header>

        {/* Border line with padding */}
        <div className="px-12 bg-white">
          <div className="border-b border-gray-300"></div>
        </div>

        {/* Main content */}
        <main className="flex-1 bg-white p-10">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="text-sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button 
                  className="text-sm text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: orgColors.primary }}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Reminders
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Main Invoice Tables */}
              <div className="lg:col-span-2">
                <Card className="shadow-lg rounded-xl">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <CardTitle className="text-lg md:text-xl font-semibold">Invoice Overview</CardTitle>
                      <div className="relative w-full md:w-auto">
                        <Search className="absolute left-3 top-1/2 h-3 w-3 md:h-4 md:w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Search invoices..."
                          className="pl-9 md:pl-10 w-full md:w-64 lg:w-80 rounded-full text-xs md:text-sm"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="customers" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 rounded-lg p-1">
                        <TabsTrigger
                          value="customers"
                          className="rounded-md text-xs md:text-sm"
                        >
                          Customers
                        </TabsTrigger>
                        <TabsTrigger
                          value="suppliers"
                          className="rounded-md text-xs md:text-sm"
                        >
                          Suppliers
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="customers" className="mt-4 md:mt-6">
                        <InvoiceTable data={customersData} type="customers" />
                      </TabsContent>

                      <TabsContent value="suppliers" className="mt-4 md:mt-6">
                        <InvoiceTable data={suppliersData} type="suppliers" />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>

              {/* AI Suggestions Panel */}
              <div className="space-y-4 md:space-y-6">
                <Card className="shadow-lg rounded-xl">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                      <CardTitle className="text-base md:text-lg lg:text-xl font-semibold">AI Suggestions</CardTitle>
                    </div>
                    <CardDescription className="text-xs md:text-sm">Smart insights for your invoices</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 md:space-y-4">
                    {aiSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="p-3 md:p-4 bg-muted/50 rounded-lg border-l-4 border-primary"
                      >
                        <div className="flex items-start gap-2 md:gap-3">
                          <AlertCircle className="h-3 w-3 md:h-4 md:w-4 text-destructive mt-0.5 flex-shrink-0" />
                          <p className="text-xs md:text-sm">{suggestion}</p>
                        </div>
                      </div>
                    ))}

                    <div className="pt-2 md:pt-4">
                      <h4 className="font-semibold text-sm md:text-base mb-2 md:mb-3">Quick Actions</h4>
                      <div className="space-y-2">
                        {[
                          "Generate payment reminder",
                          "Request missing documents",
                          "Schedule follow-up",
                        ].map((action, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-xs md:text-sm"
                          >
                            {action}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Summary Stats */}
                <Card className="shadow-lg rounded-xl">
                  <CardHeader>
                    <CardTitle className="text-base md:text-lg lg:text-xl font-semibold">Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 md:space-y-4">
                    {[
                      { label: "Total Outstanding", value: "$42,750", color: "text-foreground" },
                      { label: "Overdue Amount", value: "$17,300", color: "text-destructive" },
                      { label: "Missing Documents", value: "3", color: "text-destructive", isBadge: true },
                      { label: "This Month", value: "$89,200", color: "text-green-600 dark:text-green-400" },
                    ].map((stat, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-xs md:text-sm text-muted-foreground">{stat.label}</span>
                        {stat.isBadge ? (
                          <Badge variant="destructive" className="text-xs">{stat.value}</Badge>
                        ) : (
                          <span className={`font-mono font-semibold text-sm md:text-base ${stat.color}`}>{stat.value}</span>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Invoices;