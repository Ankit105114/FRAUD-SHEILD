import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { BarChart3, PieChart, TrendingUp, MapPin } from "lucide-react";

const Analytics = () => {
  const fraudByRegion = [
    { region: "North America", cases: 145, percentage: 42 },
    { region: "Europe", cases: 98, percentage: 28 },
    { region: "Asia", cases: 67, percentage: 19 },
    { region: "Other", cases: 38, percentage: 11 },
  ];

  const channelData = [
    { channel: "Web App", transactions: 8234, fraud: 15 },
    { channel: "Mobile App", transactions: 3456, fraud: 6 },
    { channel: "API", transactions: 768, fraud: 2 },
  ];

  const timelineData = [
    { month: "Jan", fraud: 18, safe: 3240 },
    { month: "Feb", fraud: 22, safe: 3680 },
    { month: "Mar", fraud: 19, safe: 3920 },
    { month: "Apr", fraud: 25, safe: 4100 },
    { month: "May", fraud: 21, safe: 4380 },
    { month: "Jun", fraud: 23, safe: 4620 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Analytics</h1>
          <p className="text-muted-foreground">Comprehensive fraud detection insights</p>
        </div>

        {/* Fraud by Region */}
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="h-5 w-5 text-accent" />
            <h2 className="text-2xl font-bold">Fraud Distribution by Region</h2>
          </div>
          <div className="space-y-4">
            {fraudByRegion.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{item.region}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.cases} cases ({item.percentage}%)
                  </span>
                </div>
                <div className="h-8 bg-muted rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-destructive to-warning transition-all duration-1000 flex items-center justify-end px-4 text-white font-semibold text-sm"
                    style={{ width: `${item.percentage}%` }}
                  >
                    {item.percentage}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Channel Analysis */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="h-5 w-5 text-accent" />
              <h2 className="text-2xl font-bold">Channel Analysis</h2>
            </div>
            <div className="space-y-4">
              {channelData.map((item, index) => (
                <div key={index} className="p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{item.channel}</span>
                    <span className="text-sm text-muted-foreground">
                      {((item.fraud / item.transactions) * 100).toFixed(2)}% fraud rate
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Total</div>
                      <div className="font-semibold">{item.transactions.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Fraud</div>
                      <div className="font-semibold text-destructive">{item.fraud}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Segmentation */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <PieChart className="h-5 w-5 text-accent" />
              <h2 className="text-2xl font-bold">Customer Segmentation</h2>
            </div>
            <div className="space-y-4">
              {[
                { segment: "Low Risk", count: 8234, color: "bg-success" },
                { segment: "Medium Risk", count: 892, color: "bg-warning" },
                { segment: "High Risk", count: 156, color: "bg-destructive" },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className={`h-4 w-4 rounded-full ${item.color}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{item.segment}</span>
                      <span className="text-sm text-muted-foreground">{item.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Timeline */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-accent" />
            <h2 className="text-2xl font-bold">6-Month Fraud Trend</h2>
          </div>
          <div className="h-64 flex items-end justify-between gap-4">
            {timelineData.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col gap-1">
                  <div
                    className="w-full bg-gradient-to-t from-success to-success rounded-t-lg"
                    style={{ height: `${(item.safe / 50)}px` }}
                  />
                  <div
                    className="w-full bg-gradient-to-t from-destructive to-warning rounded-t-lg"
                    style={{ height: `${item.fraud * 2}px` }}
                  />
                </div>
                <span className="text-sm font-medium">{item.month}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-success" />
              <span>Safe Transactions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-destructive" />
              <span>Fraud Cases</span>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Analytics;
