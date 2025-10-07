import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Activity,
  Users,
  DollarSign,
  Clock,
  RefreshCw,
  LogOut,
  Settings,
  User
} from "lucide-react";
import { apiService } from "@/lib/api";

interface DashboardStats {
  totalTransactions: number;
  fraudDetected: number;
  safeTransactions: number;
  detectionRate: number;
  totalUsers: number;
  totalVolume: number;
  activeAlerts: number;
}

interface RecentTransaction {
  id: string;
  transactionId: string;
  amount: number;
  merchant: string;
  status: 'safe' | 'fraud' | 'reviewing';
  riskScore: number;
  createdAt: string;
  userEmail: string;
}

interface LiveAlert {
  id: string;
  type: 'fraud_detected' | 'high_risk' | 'system_alert';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  transactionId?: string;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalTransactions: 0,
    fraudDetected: 0,
    safeTransactions: 0,
    detectionRate: 0,
    totalUsers: 0,
    totalVolume: 0,
    activeAlerts: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [liveAlerts, setLiveAlerts] = useState<LiveAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check authentication and load user data
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      if (parsedUser.role === 'admin') {
        navigate('/admin');
        return;
      }
    } catch {
      navigate('/');
      return;
    }

    loadDashboardData();
  }, [navigate]);

  // Set up real-time data refresh
  useEffect(() => {
    const interval = setInterval(() => {
      loadDashboardData();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Load dashboard stats
      const dashboardResponse = await apiService.getDashboard(token);
      setStats(dashboardResponse.stats || stats);

      // Load recent transactions
      const transactionsResponse = await apiService.getTransactions(token);
      setRecentTransactions(transactionsResponse.transactions?.slice(0, 5) || []);

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    loadDashboardData();
    toast({
      title: "Dashboard Updated",
      description: "Data refreshed successfully",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
  };

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span>Loading dashboard...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header with User Info and Controls */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Real-time fraud detection overview
              <span className="ml-2 text-xs text-muted-foreground">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* User Profile */}
            {user && (
              <Card className="p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                    <AvatarFallback>
                      {user.name?.split(' ').map((n: string) => n[0]).join('') || user.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block">
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              </Card>
            )}

            <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Live Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-glow">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <Badge variant="secondary" className="text-xs">
                Live
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Transactions</p>
              <p className="text-3xl font-bold">{stats.totalTransactions.toLocaleString()}</p>
              <p className="text-xs text-success mt-1">+12.5% from yesterday</p>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-destructive to-warning">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <Badge variant="destructive" className="text-xs">
                {stats.fraudDetected > 0 ? 'Alert' : 'Safe'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Fraud Detected</p>
              <p className="text-3xl font-bold">{stats.fraudDetected}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.detectionRate}% detection rate
              </p>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-success to-success">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <Badge variant="secondary" className="text-xs">
                Live
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Safe Transactions</p>
              <p className="text-3xl font-bold">{stats.safeTransactions.toLocaleString()}</p>
              <p className="text-xs text-success mt-1">+13.1% from yesterday</p>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <Badge variant="secondary" className="text-xs">
                {stats.detectionRate > 99 ? 'Excellent' : 'Good'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Detection Rate</p>
              <p className="text-3xl font-bold">{stats.detectionRate}%</p>
              <p className="text-xs text-success mt-1">+0.3% improvement</p>
            </div>
          </Card>
        </div>

        {/* Live Recent Transactions */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Transactions</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span>Live Updates</span>
              </div>
            </div>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No transactions yet</p>
              <p className="text-sm">Submit your first transaction to see it here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="font-mono font-medium text-sm">
                      {transaction.transactionId}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.merchant}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatTimeAgo(transaction.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="font-semibold">
                      {formatCurrency(transaction.amount)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={transaction.status === 'safe' ? 'secondary' : transaction.status === 'fraud' ? 'destructive' : 'outline'}
                        className="text-xs"
                      >
                        {transaction.status}
                      </Badge>
                      {transaction.riskScore > 0 && (
                        <span className="text-xs text-muted-foreground">
                          Risk: {transaction.riskScore}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate('/submit')}
              >
                <Shield className="h-4 w-4 mr-2" />
                Submit New Transaction
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate('/analytics')}
              >
                <Activity className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Summary
            </h3>
            {user && (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Name:</span>
                  <span className="font-medium">{user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <span className="font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Member Since:</span>
                  <span className="font-medium">
                    {new Date(user.registrationDate || Date.now()).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Last Login:</span>
                  <span className="font-medium">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </span>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
