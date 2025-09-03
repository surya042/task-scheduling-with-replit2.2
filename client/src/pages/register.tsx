import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle, ShieldQuestion, User, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

const registrationSchema = z.object({
  role: z.enum(["admin", "user"]),
  adminUniqueNumber: z.string().optional(),
}).refine((data) => {
  if (data.role === "user" && !data.adminUniqueNumber) {
    return false;
  }
  return true;
}, {
  message: "Admin unique number is required for users",
  path: ["adminUniqueNumber"],
});

type RegistrationForm = z.infer<typeof registrationSchema>;

export default function Register() {
  const [generatedAdminNumber, setGeneratedAdminNumber] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      role: "user",
      adminUniqueNumber: "",
    },
  });

  const watchedRole = form.watch("role");

  const generateAdminNumber = () => {
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.floor(Math.random() * 9000) + 1000;
    const adminNumber = `ADM-${random}-${timestamp}`;
    setGeneratedAdminNumber(adminNumber);
  };

  const onSubmit = async (data: RegistrationForm) => {
    setIsSubmitting(true);
    try {
      let submitData = { ...data };
      
      if (data.role === "admin") {
        submitData.adminUniqueNumber = generatedAdminNumber;
      }

      await apiRequest("POST", "/api/auth/register", submitData);
      
      toast({
        title: "Registration Complete",
        description: "Your account has been set up successfully!",
      });
      
      // Redirect based on role
      if (data.role === "admin") {
        setLocation("/admin");
      } else {
        setLocation("/dashboard");
      }
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full">
        <Card className="shadow-lg border border-border">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <CheckCircle className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl font-bold">TaskFlow</CardTitle>
            </div>
            <CardDescription>Complete your account setup</CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">Role</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="space-y-3"
                        >
                          <div className="flex items-center space-x-3 cursor-pointer">
                            <RadioGroupItem value="admin" id="admin" data-testid="radio-admin" />
                            <Label htmlFor="admin" className="flex items-center space-x-2 cursor-pointer">
                              <ShieldQuestion className="h-4 w-4 text-primary" />
                              <span>Admin</span>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3 cursor-pointer">
                            <RadioGroupItem value="user" id="user" data-testid="radio-user" />
                            <Label htmlFor="user" className="flex items-center space-x-2 cursor-pointer">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>User</span>
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {watchedRole === "admin" && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Admin Unique Number</Label>
                    <div className="flex space-x-2">
                      <Input
                        value={generatedAdminNumber}
                        placeholder="Generated automatically"
                        readOnly
                        className="flex-1"
                        data-testid="input-admin-number"
                      />
                      <Button
                        type="button"
                        onClick={generateAdminNumber}
                        variant="outline"
                        size="icon"
                        data-testid="button-generate"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This number will be used by users to link to your admin account
                    </p>
                  </div>
                )}
                
                {watchedRole === "user" && (
                  <FormField
                    control={form.control}
                    name="adminUniqueNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admin Unique Number</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter admin's unique number"
                            data-testid="input-user-admin-number"
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Enter the unique number provided by your admin
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || (watchedRole === "admin" && !generatedAdminNumber)}
                  data-testid="button-complete-setup"
                >
                  {isSubmitting ? "Setting up..." : "Complete Setup"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
