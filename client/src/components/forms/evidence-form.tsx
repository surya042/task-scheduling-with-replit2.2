import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CloudUpload, NotebookPen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { updateTaskSchema } from "@shared/schema";
import type { Task } from "@shared/schema";
import { z } from "zod";

const evidenceFormSchema = updateTaskSchema.extend({
  evidenceText: z.string().min(1, "Evidence description is required"),
  isFinished: z.boolean().default(false),
});

type EvidenceFormData = z.infer<typeof evidenceFormSchema>;

interface EvidenceFormProps {
  task: Task;
}

export default function EvidenceForm({ task }: EvidenceFormProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<EvidenceFormData>({
    resolver: zodResolver(evidenceFormSchema),
    defaultValues: {
      evidenceText: task.evidenceText || "",
      isFinished: task.isFinished || false,
    },
  });

  const submitEvidenceMutation = useMutation({
    mutationFn: async (data: EvidenceFormData) => {
      const formData = new FormData();
      formData.append("evidenceText", data.evidenceText);
      formData.append("isFinished", data.isFinished.toString());
      
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`${response.status}: ${text}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/tasks"] });
      toast({
        title: "Evidence Submitted",
        description: "Your evidence has been submitted for review",
      });
      setSelectedFiles([]);
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
        description: "Failed to submit evidence",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const onSubmit = (data: EvidenceFormData) => {
    submitEvidenceMutation.mutate(data);
  };

  // Don't show form if already submitted and reviewed
  if (task.isAdminSeen) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="isFinished"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid={`checkbox-finished-${task.id}`}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Mark as Finished</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <h4 className="font-medium text-foreground">Submit Evidence</h4>
          
          <FormField
            control={form.control}
            name="evidenceText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={3}
                    placeholder="Describe your completed work..."
                    className="resize-none"
                    data-testid={`textarea-evidence-${task.id}`}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div>
            <FormLabel className="text-sm font-medium text-foreground mb-2 block">
              Upload Files
            </FormLabel>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-ring transition-colors cursor-pointer">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id={`file-upload-${task.id}`}
                accept="image/*,video/*,.pdf,.doc,.docx"
                data-testid={`input-files-${task.id}`}
              />
              <label htmlFor={`file-upload-${task.id}`} className="cursor-pointer">
                <CloudUpload className="h-8 w-8 text-muted-foreground mb-2 mx-auto" />
                <p className="text-sm text-muted-foreground mb-1">
                  <span className="font-medium text-primary">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  Images, documents, videos (max 50MB)
                </p>
              </label>
            </div>
            
            {selectedFiles.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground mb-1">Selected files:</p>
                <ul className="text-xs text-muted-foreground">
                  {selectedFiles.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <Button
            type="submit"
            disabled={submitEvidenceMutation.isPending}
            data-testid={`button-submit-evidence-${task.id}`}
          >
            <NotebookPen className="h-4 w-4 mr-2" />
            {submitEvidenceMutation.isPending ? "Submitting..." : "Submit Evidence"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
