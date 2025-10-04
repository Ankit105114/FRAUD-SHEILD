import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Activity, TrendingUp, Lock, Zap, BarChart3 } from "lucide-react";
import { Navbar } from "@/components/Navbar";

const Landing = () => {
  const features = [
    {
      icon: Shield,
      title: "Advanced Fraud Detection",
      description: "Real-time transaction monitoring with AI-powered risk scoring",
    },
    {
      icon: Activity,
      title: "Live Monitoring",
      description: "Track suspicious activities as they happen with instant alerts",
    },
    {
      icon: TrendingUp,
      title: "Predictive Analytics",
      description: "Identify patterns and prevent fraud before it occurs",
    },
    {
      icon: Lock,
      title: "Secure Infrastructure",
      description: "Bank-grade security with end-to-end encryption",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Process thousands of transactions per second",
    },
    {
      icon: BarChart3,
      title: "Detailed Reports",
      description: "Comprehensive analytics and fraud network visualization",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent" />
        <div className="container mx-auto px-4 py-24 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-6 animate-in fade-in slide-in-from-bottom-3 duration-700">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Enterprise-Grade Protection</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              <span className="bg-gradient-to-r from-primary via-accent to-primary-glow bg-clip-text text-transparent">
                Detect Fraud
              </span>
              <br />
              Before It Happens
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200">
              Protect your business with intelligent fraud detection powered by advanced algorithms and real-time analytics
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
              <Link to="/signup">
                <Button size="lg" className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 text-lg px-8">
                  Start Free Trial
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "99.9%", label: "Detection Rate" },
              { value: "<100ms", label: "Response Time" },
              { value: "1M+", label: "Transactions/Day" },
              { value: "$50M+", label: "Fraud Prevented" },
            ].map((stat, index) => (
              <div key={index} className="animate-in fade-in zoom-in duration-700" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-accent to-accent-glow bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Stop Fraud</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools and insights to protect your business
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-8 border-border"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-glow">
                    <feature.icon className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-glow to-accent opacity-10" />
        <div className="container mx-auto px-4 relative">
          <Card className="max-w-4xl mx-auto p-12 text-center border-2 border-primary/20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to <span className="bg-gradient-to-r from-accent to-accent-glow bg-clip-text text-transparent">Secure</span> Your Business?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of businesses protecting their transactions with FraudShield
            </p>
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 text-lg px-12">
                Get Started Now
              </Button>
            </Link>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Landing;
