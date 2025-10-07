import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, ArrowLeft, User, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'user' | 'admin' | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const role = searchParams.get('role') as 'user' | 'admin';
    if (role) {
      setSelectedRole(role);
    } else {
      // If no role specified, redirect to role selection
      navigate('/');
    }
  }, [searchParams, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Real API call to backend
      const response = await apiService.login({ email, password });

      // Debug logging
      console.log('Login response:', response);
      console.log('Response data:', response.data);
      console.log('User object:', response.data.user);
      console.log('User role:', response.data.user?.role);

      // Validate response structure
      if (!response.data || !response.data.user || !response.data.token) {
        throw new Error('Invalid response structure from server');
      }

      // Validate user object has required properties
      if (!response.data.user.role) {
        console.warn('User object missing role property:', response.data.user);
        response.data.user.role = 'user'; // Default to user role
      }

      // Store JWT token in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      toast({
        title: "Login successful",
        description: `Welcome back${response.data.user.role === 'admin' ? ' Admin' : ''}`,
      });

      // Redirect based on role
      if (response.data.user.role === 'admin') {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error('Login error:', error);

      // More detailed error handling
      let errorMessage = "Please check your credentials and try again";

      if (error instanceof Error) {
        if (error.message.includes('401')) {
          errorMessage = "Invalid email or password";
        } else if (error.message.includes('Network')) {
          errorMessage = "Network error. Please check your connection.";
        } else if (error.message.includes('500')) {
          errorMessage = "Server error. Please try again later.";
        }
      }

      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5 p-4">
      <Card className="w-full max-w-md p-8 animate-in fade-in zoom-in duration-500">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow">
            {selectedRole === 'admin' ? (
              <Settings className="h-7 w-7 text-primary-foreground" />
            ) : (
              <Shield className="h-7 w-7 text-primary-foreground" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {selectedRole === 'admin' ? 'Admin Login' : 'User Login'}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={selectedRole === 'admin' ? 'secondary' : 'outline'}>
                {selectedRole === 'admin' ? 'Administrator' : 'Standard User'}
              </Badge>
              <p className="text-sm text-muted-foreground">Login to your account</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
