import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ListChecks, CheckCircle2, AlertTriangle, ShieldQuestion } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import Navbar from "@/components/layout/navbar";
import TaskCalendar from "@/components/calendar/task-calendar";
import EvidenceForm from "@/components/forms/evidence-form";
import type { Task } from "@shared/schema";

export default function UserDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("calendar");

  // Redirect check
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "user")) {
      toast({
        title: "Unauthorized",
        description: "User access required. Redirecting...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [user, authLoading, toast]);

  // Fetch user tasks
  const { data: userTasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/user/tasks"],
    enabled: !!user && user.role === "user",
    retry: false,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== "user") {
    return null;
  }

  const getTaskStats = () => {
    const active = userTasks.filter((task: Task) => !task.isAdminSeen && new Date(task.deadline) >= new Date()).length;
    const completed = userTasks.filter((task: Task) => task.isAdminSeen).length;
    const overdue = userTasks.filter((task: Task) => !task.isAdminSeen && new Date(task.deadline) < new Date()).length;
    
    return { active, completed, overdue };
  };

  const getTaskStatusBadge = (task: Task) => {
    if (task.isAdminSeen) {
      return <Badge className="bg-chart-2 text-foreground">Admin Approved</Badge>;
    }
    if (task.isFinished && task.evidenceText) {
      return <Badge className="bg-chart-3 text-foreground">Pending Review</Badge>;
    }
    if (new Date(task.deadline) < new Date()) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    return <Badge variant="secondary">In Progress</Badge>;
  };

  const stats = getTaskStats();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <div className="w-64 bg-card border-r border-border">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-8">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground">User Panel</span>
            </div>
            
            <nav className="space-y-2 mb-8">
              <Button
                variant={activeTab === "calendar" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("calendar")}
                data-testid="button-calendar-tab"
              >
                <Calendar className="h-4 w-4 mr-3" />
                Task Calendar
              </Button>
              <Button
                variant={activeTab === "tasks" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("tasks")}
                data-testid="button-tasks-tab"
              >
                <ListChecks className="h-4 w-4 mr-3" />
                My Tasks
              </Button>
            </nav>
            
            {/* Stats */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-foreground" data-testid="text-active-tasks">
                  {stats.active}
                </div>
                <div className="text-sm text-muted-foreground">Active Tasks</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="text-chart-2" data-testid="text-completed-tasks">{stats.completed}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Overdue</span>
                  <span className="text-destructive" data-testid="text-overdue-tasks">{stats.overdue}</span>
                </div>
              </div>
            </div>
            
            {/* Role Change Button */}
            <div className="mt-6">
              <Link href="/register">
                <Button variant="outline" className="w-full justify-start" data-testid="button-change-role">
                  <ShieldQuestion className="h-4 w-4 mr-3" />
                  Setup Admin Account
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Calendar Tab */}
            <TabsContent value="calendar">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground mb-2">Task Calendar</h1>
                <p className="text-muted-foreground">View your assigned tasks in calendar format</p>
              </div>
              
              <TaskCalendar tasks={userTasks} />
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground mb-2">My Tasks</h1>
                <p className="text-muted-foreground">View and manage your assigned tasks</p>
              </div>
              
              {tasksLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : userTasks.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No tasks assigned yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {userTasks.map((task: Task) => (
                    <Card key={task.id} className={new Date(task.deadline) < new Date() && !task.isAdminSeen ? "border-destructive" : ""} data-testid={`card-task-${task.id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="mb-2" data-testid={`text-task-name-${task.id}`}>
                              {task.taskName}
                            </CardTitle>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span data-testid={`text-deadline-${task.id}`}>
                                Due: {new Date(task.deadline).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          {getTaskStatusBadge(task)}
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        {task.description && (
                          <p className="text-muted-foreground mb-4" data-testid={`text-description-${task.id}`}>
                            {task.description}
                          </p>
                        )}
                        
                        {/* Overdue Warning */}
                        {new Date(task.deadline) < new Date() && !task.isAdminSeen && (
                          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4">
                            <div className="flex items-center space-x-2">
                              <AlertTriangle className="h-4 w-4 text-destructive" />
                              <span className="text-sm font-medium text-destructive">This task is overdue!</span>
                            </div>
                            <p className="text-sm text-destructive/80 mt-1">
                              Please complete and submit your evidence as soon as possible.
                            </p>
                          </div>
                        )}
                        
                        {/* Admin Feedback */}
                        {task.adminRemark && task.isAdminSeen && (
                          <div className="bg-muted rounded-lg p-3 mb-4">
                            <h5 className="text-sm font-medium text-foreground mb-1">Admin Feedback:</h5>
                            <p className="text-sm text-muted-foreground" data-testid={`text-admin-feedback-${task.id}`}>
                              {task.adminRemark}
                            </p>
                          </div>
                        )}
                        
                        {/* Task completion status */}
                        {task.isAdminSeen ? (
                          <div className="flex items-center space-x-2">
                            <CheckCircle2 className="h-4 w-4 text-chart-2" />
                            <span className="text-sm font-medium text-chart-2">Task Completed & Approved</span>
                          </div>
                        ) : (
                          <EvidenceForm task={task} />
                        )}
                      </CardContent>
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
