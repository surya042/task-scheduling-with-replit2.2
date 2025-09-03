import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NotebookPen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { insertTaskSchema } from "@shared/schema";
import type { User } from "@shared/schema";
import { z } from "zod";

const taskFormSchema = insertTaskSchema.extend({
  deadline: z.string().min(1, "Deadline is required"),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  linkedUsers: User[];
}

export default function TaskForm({ linkedUsers }: TaskFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      taskName: "",
      description: "",
      assignedTo: "",
      deadline: "",
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      console.log("Creating task with data:", data);
      const payload = {
        ...data,
        deadline: new Date(data.deadline).toISOString(),
      };
      console.log("Sending payload:", payload);
      return await apiRequest("POST", "/api/admin/tasks", payload);
    },
    onSuccess: (result) => {
      console.log("Task created successfully:", result);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/tasks"] });
      toast({
        title: "Task Assigned Successfully!",
        description: "The task has been assigned to the user and they will see it in their dashboard.",
      });
      form.reset();
    },
    onError: (error) => {
      console.error("Task creation error:", error);
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
        title: "Failed to Create Task",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TaskFormData) => {
    console.log("Form submitted with data:", data);
    console.log("Form errors:", form.formState.errors);
    console.log("Form is valid:", form.formState.isValid);
    createTaskMutation.mutate(data);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="taskName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter task name" data-testid="input-task-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="assignedTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign to User</FormLabel>
                  {linkedUsers.length === 0 ? (
                    <div className="p-3 text-sm text-muted-foreground bg-muted rounded-md">
                      No linked users found. Users need to register with your admin unique number to appear here.
                    </div>
                  ) : (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-assign-user">
                          <SelectValue placeholder="Select a user" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {linkedUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.firstName && user.lastName 
                              ? `${user.firstName} ${user.lastName}` 
                              : user.email || `User ${user.id.slice(-4)}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deadline</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" data-testid="input-deadline" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      rows={4}
                      placeholder="Provide additional details about the task..."
                      className="resize-none"
                      data-testid="textarea-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex space-x-4">
              <Button
                type="submit"
                disabled={createTaskMutation.isPending || linkedUsers.length === 0}
                data-testid="button-schedule-task"
              >
                <NotebookPen className="h-4 w-4 mr-2" />
                {createTaskMutation.isPending ? "Scheduling..." : "Schedule Task"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  console.log("Reset form clicked");
                  form.reset();
                }}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
            </div>
            
            {/* Debug info during development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-3 bg-muted rounded text-xs">
                <div>Form Valid: {form.formState.isValid ? 'Yes' : 'No'}</div>
                <div>Linked Users: {linkedUsers.length}</div>
                <div>Form Values: {JSON.stringify(form.getValues())}</div>
                {Object.keys(form.formState.errors).length > 0 && (
                  <div>Errors: {JSON.stringify(form.formState.errors)}</div>
                )}
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
