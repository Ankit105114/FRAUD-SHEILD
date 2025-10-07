import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  Users,
  AlertTriangle,
  TrendingUp,
  Search,
  Ban,
  CheckCircle,
  XCircle,
  FileText,
  Activity,
  Clock
} from "lucide-react";
import { apiService } from "@/lib/api";

interface BlacklistedUser {
  _id: string;
  email: string;
  name: string;
  reason: string;
  blacklistedAt: string;
  reportedBy: string;
  status: 'active' | 'inactive';
  fraudCount: number;
}

interface FraudReport {
  _id: string;
  userId: string;
  userEmail: string;
  transactionCount: number;
  fraudScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  reportedAt: string;
  reason: string;
}

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState<'blacklist' | 'reports' | 'analytics'>('blacklist');
  const [blacklistedUsers, setBlacklistedUsers] = useState<BlacklistedUser[]>([]);
  const [fraudReports, setFraudReports] = useState<FraudReport[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check admin authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/');
      return;
    }

    try {
      const user = JSON.parse(userData);
      if (user.role !== 'admin') {
        toast({
          title: "Access Denied",
          description: "Admin privileges required",
          variant: "destructive",
        });
        navigate('/');
        return;
      }
    } catch {
      navigate('/');
    }
  }, [navigate, toast]);

  // Load blacklisted users
  useEffect(() => {
    if (activeTab === 'blacklist') {
      loadBlacklistedUsers();
    } else if (activeTab === 'reports') {
      loadFraudReports();
    }
  }, [activeTab]);

  const loadBlacklistedUsers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:3001/api/admin/blacklisted-users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBlacklistedUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error loading blacklisted users:', error);
      toast({
        title: "Error",
        description: "Failed to load blacklisted users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadFraudReports = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:3001/api/admin/fraud-reports', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFraudReports(data.reports || []);
      }
    } catch (error) {
      console.error('Error loading fraud reports:', error);
      toast({
        title: "Error",
        description: "Failed to load fraud reports",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnblacklistUser = async (userId: string, email: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:3001/api/admin/unblacklist/${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `User ${email} has been removed from blacklist`,
        });
        loadBlacklistedUsers();
      }
    } catch (error) {
      console.error('Error unblacklisting user:', error);
      toast({
        title: "Error",
        description: "Failed to remove user from blacklist",
        variant: "destructive",
      });
    }
  };

  const filteredBlacklistedUsers = blacklistedUsers.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFraudReports = fraudReports.filter(report =>
    report.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Admin Panel</h1>
          </div>
          <p className="text-muted-foreground">
            Manage users, monitor fraud patterns, and oversee system security
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8">
          {[
            { id: 'blacklist', label: 'Blacklisted Users', icon: Ban },
            { id: 'reports', label: 'Fraud Reports', icon: FileText },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
          ].map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              onClick={() => setActiveTab(tab.id as any)}
              className="flex items-center gap-2"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${activeTab === 'blacklist' ? 'users' : 'reports'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'blacklist' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Blacklisted Users</h2>
              <Badge variant="destructive">
                {filteredBlacklistedUsers.length} Users
              </Badge>
            </div>

            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : filteredBlacklistedUsers.length === 0 ? (
              <Card className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-muted-foreground">No blacklisted users found</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredBlacklistedUsers.map((user) => (
                  <Card key={user._id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                          <Ban className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{user.name}</h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-sm text-red-600 mt-1">
                            Reason: {user.reason}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Badge variant={user.status === 'active' ? 'destructive' : 'secondary'}>
                            {user.status}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {user.fraudCount} fraud incidents
                          </p>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnblacklistUser(user._id, user.email)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Fraud Reports</h2>
              <Badge variant="secondary">
                {filteredFraudReports.length} Reports
              </Badge>
            </div>

            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : filteredFraudReports.length === 0 ? (
              <Card className="p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No fraud reports found</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredFraudReports.map((report) => (
                  <Card key={report._id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                          report.riskLevel === 'high' ? 'bg-red-100 dark:bg-red-900' :
                          report.riskLevel === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900' :
                          'bg-green-100 dark:bg-green-900'
                        }`}>
                          <AlertTriangle className={`h-6 w-6 ${
                            report.riskLevel === 'high' ? 'text-red-600 dark:text-red-400' :
                            report.riskLevel === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-green-600 dark:text-green-400'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-semibold">{report.userEmail}</h3>
                          <p className="text-sm text-muted-foreground">
                            {report.transactionCount} transactions • Risk Score: {report.fraudScore}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Reason: {report.reason}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <Badge variant={
                          report.riskLevel === 'high' ? 'destructive' :
                          report.riskLevel === 'medium' ? 'secondary' : 'outline'
                        }>
                          {report.riskLevel.toUpperCase()}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(report.reportedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">System Analytics</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">1,234</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Safe Transactions</p>
                    <p className="text-2xl font-bold">8,567</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fraud Alerts</p>
                    <p className="text-2xl font-bold">47</p>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Transaction submitted: TXN_789123</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">User reported for suspicious activity</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Fraud detection model updated</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
