import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Shield, AlertTriangle, CheckCircle2, TrendingUp, Activity } from "lucide-react";

const Dashboard = () => {
  const stats = [
    {
      title: "Total Transactions",
      value: "12,458",
      change: "+12.5%",
      icon: Activity,
      gradient: "from-accent to-accent-glow",
    },
    {
      title: "Fraud Detected",
      value: "23",
      change: "-8.2%",
      icon: AlertTriangle,
      gradient: "from-destructive to-warning",
    },
    {
      title: "Safe Transactions",
      value: "12,435",
      change: "+13.1%",
      icon: CheckCircle2,
      gradient: "from-success to-success",
    },
    {
      title: "Detection Rate",
      value: "99.8%",
      change: "+0.3%",
      icon: Shield,
      gradient: "from-primary to-primary-glow",
    },
  ];

  const recentTransactions = [
    { id: "TXN001", amount: "$2,450.00", status: "safe", time: "2 mins ago" },
    { id: "TXN002", amount: "$890.50", status: "reviewing", time: "5 mins ago" },
    { id: "TXN003", amount: "$15,200.00", status: "fraud", time: "8 mins ago" },
    { id: "TXN004", amount: "$450.00", status: "safe", time: "12 mins ago" },
    { id: "TXN005", amount: "$3,200.00", status: "safe", time: "15 mins ago" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "safe":
        return "bg-success/10 text-success";
      case "fraud":
        return "bg-destructive/10 text-destructive";
      case "reviewing":
        return "bg-warning/10 text-warning";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Real-time fraud detection overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm font-medium text-success">{stat.change}</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Fraud Funnel */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Fraud Detection Funnel</h2>
          <div className="space-y-4">
            {[
              { stage: "New Transactions", count: 12458, percentage: 100, color: "bg-accent" },
              { stage: "Under Review", count: 156, percentage: 1.25, color: "bg-warning" },
              { stage: "Flagged as Suspicious", count: 45, percentage: 0.36, color: "bg-destructive" },
              { stage: "Confirmed Fraud", count: 23, percentage: 0.18, color: "bg-destructive" },
            ].map((stage, index) => (
              <div key={index} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{stage.stage}</span>
                  <span className="text-sm text-muted-foreground">
                    {stage.count} ({stage.percentage}%)
                  </span>
                </div>
                <div className="h-12 bg-muted rounded-lg overflow-hidden">
                  <div
                    className={`h-full ${stage.color} transition-all duration-1000 flex items-center px-4 text-white font-semibold`}
                    style={{ width: `${stage.percentage * 10}%`, minWidth: "80px" }}
                  >
                    {stage.count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Recent Transactions</h2>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="font-mono font-medium">{transaction.id}</div>
                  <div className="text-muted-foreground">{transaction.time}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="font-semibold">{transaction.amount}</div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
