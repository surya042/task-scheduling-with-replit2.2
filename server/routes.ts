import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertTaskSchema, updateTaskSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|mp4|mov|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User registration route
  app.post("/api/auth/register", isAuthenticated, async (req: any, res) => {
    try {
      const { role, adminUniqueNumber } = req.body;
      const userId = req.user.claims.sub;
      
      let linkedAdminId = null;
      let userAdminNumber = null;
      
      if (role === "admin") {
        // Generate unique admin number
        userAdminNumber = `ADM-${Math.floor(Math.random() * 9000) + 1000}-${Date.now().toString().slice(-4)}`;
      } else if (role === "user" && adminUniqueNumber) {
        // Find admin by unique number
        const admin = await storage.getUserByAdminNumber(adminUniqueNumber);
        if (!admin) {
          return res.status(400).json({ message: "Invalid admin unique number" });
        }
        linkedAdminId = admin.id;
      }
      
      const updatedUser = await storage.updateUserRole(
        userId,
        role,
        userAdminNumber || undefined,
        linkedAdminId || undefined
      );
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Get linked users (Admin only)
  app.get("/api/admin/users", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const linkedUsers = await storage.getLinkedUsers(userId);
      res.json(linkedUsers);
    } catch (error) {
      console.error("Error fetching linked users:", error);
      res.status(500).json({ message: "Failed to fetch linked users" });
    }
  });

  // Create task (Admin only)
  app.post("/api/admin/tasks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const taskData = insertTaskSchema.parse({
        ...req.body,
        assignedBy: userId,
      });
      
      const task = await storage.createTask(taskData);
      res.json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  // Get tasks for admin review
  app.get("/api/admin/tasks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const tasks = await storage.getTasksByAdmin(userId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching admin tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  // Get user tasks
  app.get("/api/user/tasks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tasks = await storage.getTasksByUser(userId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching user tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  // Update task (for evidence submission and admin review)
  app.patch("/api/tasks/:taskId", isAuthenticated, upload.array("files"), async (req: any, res) => {
    try {
      const { taskId } = req.params;
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Check permissions
      const isTaskOwner = task.assignedTo === userId;
      const isTaskAdmin = task.assignedBy === userId;
      
      if (!isTaskOwner && !isTaskAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      let updateData: any = {};
      
      if (isTaskOwner) {
        // User submitting evidence
        updateData = updateTaskSchema.parse(req.body);
        
        // Handle file uploads
        if (req.files && req.files.length > 0) {
          const fileUrls = req.files.map((file: any) => `/uploads/${file.filename}`);
          updateData.evidenceFiles = fileUrls;
        }
      } else if (isTaskAdmin) {
        // Admin reviewing task
        updateData = updateTaskSchema.parse(req.body);
      }
      
      const updatedTask = await storage.updateTask(taskId, updateData);
      res.json(updatedTask);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  // Serve uploaded files
  app.use("/uploads", express.static("uploads"));

  const httpServer = createServer(app);
  return httpServer;
}
