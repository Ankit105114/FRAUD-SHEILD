import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogIn, Shield } from "lucide-react";
import { apiService } from "@/lib/api";

const SubmitTransaction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    transactionId: "",
    amount: "",
    merchant: "",
    location: "",
    ipAddress: "",
  });

  // Debug initial state
  console.log('Component mounted with initial formData:', formData);

  // Check authentication status on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData && userData !== 'null' && userData !== 'undefined') {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch {
        // Invalid JSON, clear corrupted data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted! Event:', e);
    console.log('Current form data at submission:', formData);
    setIsLoading(true);

    try {
      // Get JWT token and user data from localStorage
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      console.log('Token:', token);
      console.log('UserData:', userData);
      console.log('UserData type:', typeof userData);

      if (!token || !userData) {
        console.log('No token or userData found - user not authenticated');
        toast({
          title: "Authentication required",
          description: "Please login first to submit transactions",
          variant: "destructive",
        });
        return;
      }

      // Check if userData is the string "undefined" (corrupted data)
      if (userData === 'undefined' || userData === 'null') {
        console.warn('Corrupted userData found, clearing localStorage');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
        toast({
          title: "Session expired",
          description: "Please login again",
          variant: "destructive",
        });
        return;
      }

      let currentUser;
      try {
        console.log('Attempting to parse userData:', userData);
        currentUser = JSON.parse(userData);
        console.log('Parsed user:', currentUser);
        setUser(currentUser); // Update component state
      } catch (parseError) {
        console.error('Error parsing user data:', parseError);
        console.error('userData value:', userData);
        console.error('userData type:', typeof userData);

        // Clear corrupted data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);

        toast({
          title: "Authentication error",
          description: "Please login again - session data corrupted",
          variant: "destructive",
        });
        return;
      }

      console.log('User is authenticated:', currentUser);
      console.log('User email:', currentUser.email);
      console.log('User role:', currentUser.role);

      // Debug form state before validation
      console.log('Form data state:', formData);
      console.log('Form data values:', {
        transactionId: formData.transactionId,
        amount: formData.amount,
        merchant: formData.merchant,
        location: formData.location,
        ipAddress: formData.ipAddress
      });

      // Validate form data before submission
      console.log('Starting validation with formData:', formData);

      if (!formData.transactionId || !formData.transactionId.trim()) {
        console.log('Validation failed: Transaction ID is empty');
        toast({
          title: "Validation Error",
          description: "Transaction ID is required",
          variant: "destructive",
        });
        return;
      }

      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        console.log('Validation failed: Amount is invalid', {
          amount: formData.amount,
          parsed: parseFloat(formData.amount)
        });
        toast({
          title: "Validation Error",
          description: "Amount must be a positive number",
          variant: "destructive",
        });
        return;
      }

      if (!formData.merchant || !formData.merchant.trim()) {
        console.log('Validation failed: Merchant is empty');
        toast({
          title: "Validation Error",
          description: "Merchant is required",
          variant: "destructive",
        });
        return;
      }

      if (!formData.location || !formData.location.trim()) {
        console.log('Validation failed: Location is empty');
        toast({
          title: "Validation Error",
          description: "Location is required",
          variant: "destructive",
        });
        return;
      }

      // Validate IP address format
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (!formData.ipAddress || !formData.ipAddress.trim() || !ipRegex.test(formData.ipAddress.trim())) {
        console.log('Validation failed: IP address is invalid', {
          ipAddress: formData.ipAddress,
          trimmed: formData.ipAddress.trim(),
          regexTest: ipRegex.test(formData.ipAddress.trim())
        });
        toast({
          title: "Validation Error",
          description: "Please provide a valid IP address (e.g., 192.168.1.1)",
          variant: "destructive",
        });
        return;
      }

      // Validate email format for userId
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(currentUser.email)) {
        console.log('Validation failed: User email is invalid', {
          email: currentUser.email,
          regexTest: emailRegex.test(currentUser.email)
        });
        toast({
          title: "Validation Error",
          description: "Invalid user email format",
          variant: "destructive",
        });
        return;
      }

      console.log('All validations passed!');

      // Prepare transaction data
      const transactionData = {
        transactionId: formData.transactionId,
        userId: currentUser.email,  // ✅ Use logged-in user's email
        amount: parseFloat(formData.amount),
        merchant: formData.merchant,
        location: formData.location,
        ipAddress: formData.ipAddress,
        channel: "Web App"
      };

      // Debug logging
      console.log('Transaction data being sent:', transactionData);
      console.log('Form data:', formData);
      console.log('User email:', currentUser.email);
      console.log('Amount as number:', parseFloat(formData.amount));
      console.log('Amount type:', typeof parseFloat(formData.amount));

      // Send to backend API
      console.log('About to make API call to:', '/api/transactions/submit');
      console.log('Request headers:', {
        'Authorization': `Bearer ${token?.substring(0, 20)}...`, // Partial token for security
        'Content-Type': 'application/json'
      });
      console.log('Request body:', JSON.stringify(transactionData, null, 2));

      const response = await apiService.submitTransaction(transactionData, token);

      console.log('API call successful, response:', response);

      // Validate response structure
      if (!response || !response.data || !response.data.transaction) {
        throw new Error('Invalid response from server');
      }

      toast({
        title: "Transaction Submitted",
        description: `Status: ${response.data.transaction.status} | Risk Score: ${response.data.transaction.riskScore}`,
      });

      // Clear form
      setFormData({
        transactionId: "",
        amount: "",
        merchant: "",
        location: "",
        ipAddress: "",
      });

      // Show fraud analysis results
      if (response.data.transaction.fraudReasons && response.data.transaction.fraudReasons.length > 0) {
        toast({
          title: "Fraud Detection Alert",
          description: `Reasons: ${response.data.transaction.fraudReasons.join(', ')}`,
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Transaction submission error:', error);

      // Provide specific error messages
      let errorMessage = "Please check your data and try again";

      if (error instanceof Error) {
        if (error.message.includes('Authentication required') || error.message.includes('login')) {
          errorMessage = "Please login first to submit transactions";
        } else if (error.message.includes('Invalid response')) {
          errorMessage = "Server returned invalid response. Please try again.";
        } else if (error.message.includes('Network')) {
          errorMessage = "Network error. Please check your connection.";
        } else if (error.message.includes('Transaction ID already exists')) {
          errorMessage = "This transaction ID already exists. Please use a different one.";
        } else if (error.message.includes('400')) {
          errorMessage = "Please check your transaction data. Make sure all fields are filled correctly.";
        }
      }

      toast({
        title: "Submission failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    console.log(`Updating field ${field} with value:`, value);
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      console.log('New form data state:', newData);
      return newData;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Submit Transaction</h1>
            <p className="text-muted-foreground">
              Submit a transaction for real-time fraud detection analysis
            </p>
          </div>

          {!isAuthenticated ? (
            // Show login prompt if not authenticated
            <Card className="p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
              </div>

              <h2 className="text-2xl font-semibold mb-4">Authentication Required</h2>
              <p className="text-muted-foreground mb-6">
                You need to login to submit transactions for fraud analysis.
              </p>

              <div className="space-y-4">
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full"
                  size="lg"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Login to Continue
                </Button>

                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <button
                    onClick={() => navigate('/signup')}
                    className="text-primary hover:underline"
                  >
                    Sign up here
                  </button>
                </p>
              </div>
            </Card>
          ) : (
            // Show transaction form if authenticated
            <div className="space-y-6">
              {/* Debug Panel - Remove this in production */}
              <Card className="p-4 bg-muted/50">
                <h3 className="font-semibold mb-2 text-sm">🔍 Debug Panel (Current Form State)</h3>
                <div className="text-xs space-y-1">
                  <div>Transaction ID: "{formData.transactionId}"</div>
                  <div>Amount: "{formData.amount}"</div>
                  <div>Merchant: "{formData.merchant}"</div>
                  <div>Location: "{formData.location}"</div>
                  <div>IP Address: "{formData.ipAddress}"</div>
                  <div>Is Authenticated: {isAuthenticated ? '✅ Yes' : '❌ No'}</div>
                  {user && <div>User Email: {user.email}</div>}
                </div>
              </Card>

              <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="transactionId">Transaction ID</Label>
                      <Input
                        id="transactionId"
                        value={formData.transactionId}
                        onChange={(e) => handleInputChange("transactionId", e.target.value)}
                        placeholder="TXN_001"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => handleInputChange("amount", e.target.value)}
                        placeholder="100.00"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="merchant">Merchant</Label>
                      <Input
                        id="merchant"
                        value={formData.merchant}
                        onChange={(e) => handleInputChange("merchant", e.target.value)}
                        placeholder="Amazon, PayPal, etc."
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        placeholder="New York, US"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ipAddress">IP Address</Label>
                      <Input
                        id="ipAddress"
                        value={formData.ipAddress}
                        onChange={(e) => handleInputChange("ipAddress", e.target.value)}
                        placeholder="192.168.1.1"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing Transaction...
                      </>
                    ) : (
                      "Submit for Fraud Analysis"
                    )}
                  </Button>
                </form>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SubmitTransaction;
