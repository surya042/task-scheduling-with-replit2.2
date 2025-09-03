import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShieldQuestion, Users, PlusCircle, ClipboardCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/layout/navbar";
import TaskForm from "@/components/forms/task-form";
import type { User, Task } from "@shared/schema";

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("users");

  // Redirect check
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      toast({
        title: "Unauthorized",
        description: "Admin access required. Redirecting...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [user, authLoading, toast]);

  // Fetch linked users
  const { data: linkedUsers = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!user && user.role === "admin",
    retry: false,
  });

  // Fetch admin tasks
  const { data: adminTasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/admin/tasks"],
    enabled: !!user && user.role === "admin",
    retry: false,
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: any }) => {
      await apiRequest("PATCH", `/api/tasks/${taskId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tasks"] });
      toast({
        title: "Task Updated",
        description: "Task has been updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  const handleTaskReview = async (taskId: string, isComplete: boolean, remark: string) => {
    updateTaskMutation.mutate({
      taskId,
      updates: {
        isAdminSeen: isComplete,
        adminRemark: remark,
      },
    });
  };

  const getTaskStatusBadge = (task: Task) => {
    if (task.isAdminSeen) {
      return <Badge className="bg-chart-2 text-foreground">Completed</Badge>;
    }
    if (task.isFinished && task.evidenceText) {
      return <Badge className="bg-chart-3 text-foreground">Pending Review</Badge>;
    }
    if (new Date(task.deadline) < new Date()) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    return <Badge variant="secondary">Active</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <div className="w-64 bg-card border-r border-border">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-8">
              <ShieldQuestion className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground">Admin Panel</span>
            </div>
            
            <nav className="space-y-2">
              <Button
                variant={activeTab === "users" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("users")}
                data-testid="button-users-tab"
              >
                <Users className="h-4 w-4 mr-3" />
                User Management
              </Button>
              <Button
                variant={activeTab === "assign" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("assign")}
                data-testid="button-assign-tab"
              >
                <PlusCircle className="h-4 w-4 mr-3" />
                Assign Tasks
              </Button>
              <Button
                variant={activeTab === "review" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("review")}
                data-testid="button-review-tab"
              >
                <ClipboardCheck className="h-4 w-4 mr-3" />
                Review Evidence
              </Button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Users Tab */}
            <TabsContent value="users">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground mb-2">User Management</h1>
                <p className="text-muted-foreground">Manage users linked to your admin account</p>
              </div>
              
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Linked Users</CardTitle>
                    <Badge variant="outline" data-testid="text-admin-id">
                      Admin ID: {user.adminUniqueNumber}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    </div>
                  ) : linkedUsers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No users linked to your account yet
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {linkedUsers.map((linkedUser: User) => (
                        <div key={linkedUser.id} className="flex items-center justify-between p-4 border border-border rounded-lg" data-testid={`card-user-${linkedUser.id}`}>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={linkedUser.profileImageUrl || undefined} />
                              <AvatarFallback>
                                {(linkedUser.firstName?.[0] || '') + (linkedUser.lastName?.[0] || '')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground" data-testid={`text-username-${linkedUser.id}`}>
                                {linkedUser.firstName} {linkedUser.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">{linkedUser.email}</p>
                            </div>
                          </div>
                          <Badge className="bg-chart-2 text-foreground">Active</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Assign Tasks Tab */}
            <TabsContent value="assign">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground mb-2">Assign New Task</h1>
                <p className="text-muted-foreground">Create and assign tasks to your team members</p>
              </div>
              
              <div className="max-w-2xl">
                <TaskForm linkedUsers={linkedUsers} />
              </div>
            </TabsContent>

            {/* Review Evidence Tab */}
            <TabsContent value="review">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground mb-2">Evidence Review</h1>
                <p className="text-muted-foreground">Review task submissions and mark them as complete</p>
              </div>
              
              {tasksLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : adminTasks.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No tasks have been created yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {adminTasks.map((task: Task) => (
                    <Card key={task.id} data-testid={`card-task-${task.id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="mb-2" data-testid={`text-task-name-${task.id}`}>
                              {task.taskName}
                            </CardTitle>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span data-testid={`text-assigned-to-${task.id}`}>
                                Assigned to: {linkedUsers.find((u: User) => u.id === task.assignedTo)?.firstName || 'Unknown'}
                              </span>
                              <span data-testid={`text-deadline-${task.id}`}>
                                Deadline: {new Date(task.deadline).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          {getTaskStatusBadge(task)}
                        </div>
                      </CardHeader>
                      
                      {(task.evidenceText || task.evidenceFiles?.length) && (
                        <CardContent>
                          {task.evidenceText && (
                            <div className="mb-4">
                              <h4 className="font-medium text-foreground mb-2">Evidence Description</h4>
                              <p className="text-muted-foreground" data-testid={`text-evidence-${task.id}`}>
                                {task.evidenceText}
                              </p>
                            </div>
                          )}
                          
                          {task.evidenceFiles && task.evidenceFiles.length > 0 && (
                            <div className="mb-4">
                              <h4 className="font-medium text-foreground mb-2">Uploaded Files</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {task.evidenceFiles.map((file, index) => (
                                  <div key={index} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                                    <a href={file} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                      File {index + 1}
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {!task.isAdminSeen && task.evidenceText && (
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                  Admin Remarks
                                </label>
                                <textarea
                                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                                  rows={3}
                                  placeholder="Add your review comments..."
                                  onChange={(e) => {
                                    // Store remark in component state or ref
                                    task.adminRemark = e.target.value;
                                  }}
                                  data-testid={`textarea-remark-${task.id}`}
                                />
                              </div>
                              
                              <Button
                                onClick={() => handleTaskReview(task.id, true, task.adminRemark || "")}
                                disabled={updateTaskMutation.isPending}
                                data-testid={`button-approve-${task.id}`}
                              >
                                {updateTaskMutation.isPending ? "Saving..." : "Mark as Complete"}
                              </Button>
                            </div>
                          )}
                          
                          {task.adminRemark && task.isAdminSeen && (
                            <div className="bg-muted rounded-lg p-3">
                              <h5 className="text-sm font-medium text-foreground mb-1">Admin Feedback:</h5>
                              <p className="text-sm text-muted-foreground" data-testid={`text-admin-remark-${task.id}`}>
                                {task.adminRemark}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
