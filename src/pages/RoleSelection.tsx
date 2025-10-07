import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, User, Settings, ArrowRight } from "lucide-react";

const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState<'user' | 'admin' | null>(null);
  const navigate = useNavigate();

  const handleRoleSelect = (role: 'user' | 'admin') => {
    setSelectedRole(role);
    // Store selected role in sessionStorage for the login flow
    sessionStorage.setItem('selectedRole', role);
    navigate(`/login?role=${role}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5 p-4">
      <Card className="w-full max-w-2xl p-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow">
              <Shield className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-4">Welcome to FraudShield</h1>
          <p className="text-xl text-muted-foreground mb-2">
            Advanced Fraud Detection System
          </p>
          <p className="text-muted-foreground">
            Choose your access level to continue
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* User Role Card */}
          <Card
            className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
              selectedRole === 'user'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => setSelectedRole('user')}
          >
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-2">User Access</h3>
              <p className="text-muted-foreground mb-4">
                Submit transactions for real-time fraud analysis and view your transaction history.
              </p>

              <div className="space-y-2 text-sm text-left">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Submit transactions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>View fraud analysis results</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Real-time dashboard updates</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Admin Role Card */}
          <Card
            className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
              selectedRole === 'admin'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => setSelectedRole('admin')}
          >
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                  <Settings className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-2">Admin Access</h3>
              <p className="text-muted-foreground mb-4">
                Manage system, monitor fraud patterns, and oversee all transactions and users.
              </p>

              <div className="space-y-2 text-sm text-left">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>View all transactions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Manage blacklisted users</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Generate fraud reports</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Real-time system monitoring</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {selectedRole && (
          <div className="text-center">
            <Button
              onClick={() => handleRoleSelect(selectedRole)}
              size="lg"
              className="w-full max-w-sm"
            >
              Continue as {selectedRole === 'user' ? 'User' : 'Admin'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            By continuing, you agree to our{" "}
            <a href="#" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default RoleSelection;
