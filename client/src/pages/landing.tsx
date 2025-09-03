import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Calendar, Users, FileText } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-foreground">TaskFlow</span>
            </div>
            <Button onClick={handleLogin} data-testid="button-login">
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Streamline Your Team's
              <span className="text-primary block">Task Management</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              TaskFlow is a powerful role-based task scheduling application that enables 
              seamless task assignment, progress tracking, and evidence submission 
              between admins and team members.
            </p>
            <Button onClick={handleLogin} size="lg" className="text-lg px-8 py-3" data-testid="button-get-started">
              Get Started
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Everything You Need for Effective Task Management
            </h2>
            <p className="text-lg text-muted-foreground">
              Designed for teams that value transparency, accountability, and efficiency
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Role-Based Access</CardTitle>
                <CardDescription>
                  Clear separation between admin and user roles with appropriate permissions and workflows
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <Calendar className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Smart Calendar View</CardTitle>
                <CardDescription>
                  Visual calendar interface helps users track deadlines and organize their workload effectively
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <FileText className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Evidence System</CardTitle>
                <CardDescription>
                  Comprehensive evidence upload system supporting documents, images, and videos with admin review
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Transform Your Team's Productivity?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of teams already using TaskFlow to streamline their workflow
          </p>
          <Button onClick={handleLogin} size="lg" className="text-lg px-8 py-3" data-testid="button-start-free">
            Start Free Today
          </Button>
        </div>
      </div>
    </div>
  );
}
