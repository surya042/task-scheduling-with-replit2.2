# Task Scheduling Application

A collaborative task scheduling application built to streamline communication and task management between an Admin and a team of Users. The application features distinct dashboards for each user role, providing a secure and efficient way to assign, track, and complete tasks.

## 🚀 Overview

This project was developed using Replit's powerful AI tools, which accelerated the coding and development process. The application is designed with two primary user roles (Admin and User), each with a unique set of functionalities tailored to their specific needs.

## ✨ Features

### User Features
- **Secure Authentication**: Users can register and log in to the application
- **Role-Based Registration**: Users must register with a unique Admin ID to be linked to their team's administrator
- **Task Management**: Users can view all assigned tasks and their deadlines on a calendar interface
- **Evidence Submission**: Submit evidence of task completion including:
  - Text descriptions
  - File uploads (images, documents, or videos)
- **Status Tracking**: Task status changes only after Admin review and approval of submitted evidence

### Admin Features
- **Secure Authentication**: Admins can register and log in with their own unique Admin ID
- **User Oversight**: View a list of all users registered under their unique ID
- **Task Assignment**: Assign new tasks to specific users with defined deadlines
- **Evidence Review**: Review all submitted evidence and provide feedback/remarks
- **Task Completion**: Mark tasks as officially completed after verifying user evidence

## 🛠️ Technology Stack

- **Platform**: Replit
- **AI Assistant**: Replit AI
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js
- **Database**: Real-time database (Firebase Firestore or Replit's built-in database)

## 🚀 Getting Started

This project is designed to run on Replit. Choose one of the following methods to get started:

### Method 1: Fork on Replit (Recommended)
1. Visit the [Replit project page](https://replit.com/@surya042/task-scheduling-with-replit22)
2. Click "Fork" to create your own copy
3. Click the "Run" button to start the application

### Method 2: Clone and Import
1. **Clone the repository**:
   ```bash
   git clone https://github.com/surya042/task-scheduling-with-replit2.2.git
   ```

2. **Open in Replit**:
   - Go to [Replit](https://replit.com)
   - Click "Create Repl"
   - Choose "Import from GitHub"
   - Paste the repository URL

3. **Run the Application**:
   - Replit's integrated environment handles dependencies automatically
   - Simply click the **Run** button to start the application

## 📖 Usage Guide

### For Admins

1. **Registration**:
   - Register with a unique Admin ID
   - This ID will be used by team members to link to your account

2. **Managing Users**:
   - View all users registered under your Admin ID
   - Monitor user activity and task progress

3. **Task Assignment**:
   - Create new tasks with specific deadlines
   - Assign tasks to individual users
   - Set priority levels and detailed descriptions

4. **Evidence Review**:
   - Review submitted evidence from users
   - Add remarks and feedback
   - Approve or request revisions
   - Mark tasks as completed

### For Users

1. **Registration**:
   - Register using your Admin's unique ID
   - Complete your profile setup

2. **Task Management**:
   - View assigned tasks on the calendar interface
   - Check deadlines and priority levels
   - Track task status updates

3. **Task Completion**:
   - Submit evidence when tasks are completed
   - Upload supporting files (images, documents, videos)
   - Add detailed descriptions
   - Wait for Admin approval

## 🏗️ Project Structure

```
task-scheduling-with-replit2.2/
├── index.js                # Main server file
├── package.json           # Node.js dependencies
├── public/                # Static files
│   ├── css/
│   │   └── style.css     # Main stylesheet
│   ├── js/
│   │   ├── admin.js      # Admin dashboard logic
│   │   ├── user.js       # User dashboard logic
│   │   └── auth.js       # Authentication logic
│   └── uploads/          # User uploaded files
├── views/                # HTML templates
│   ├── index.html        # Landing page
│   ├── login.html        # Login page
│   ├── register.html     # Registration page
│   ├── admin-dashboard.html
│   ├── user-dashboard.html
│   └── calendar.html     # Calendar view
├── routes/               # API routes
│   ├── auth.js          # Authentication routes
│   ├── admin.js         # Admin functionality
│   └── user.js          # User functionality
├── database/            # Database configuration
│   └── db.js           # Database setup
├── .replit             # Replit configuration
└── README.md           # Project documentation
```

## 🔐 Authentication Flow

1. **Admin Registration**: Create account with unique Admin ID
2. **User Registration**: Register using Admin's ID for team linking
3. **Role-Based Access**: Different dashboards based on user role
4. **Secure Sessions**: Maintained throughout user interaction

## 📊 Key Workflows

### Task Assignment Workflow
```
Admin creates task → Assigns to user → User receives notification → 
Task appears on user calendar → User works on task → User submits evidence → 
Admin reviews evidence → Admin approves/requests changes → Task marked complete
```

### Evidence Submission Workflow
```
User completes task → Uploads evidence (files + description) → 
Admin receives notification → Admin reviews submission → 
Admin provides feedback → Status updated → User notified of decision
```


## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Report Bugs**: Open an issue describing the problem
2. **Suggest Features**: Propose new functionality
3. **Submit Pull Requests**: 
   - Fork the repository
   - Create a feature branch
   - Make your changes
   - Submit a pull request

### Development Guidelines
- Follow JavaScript ES6+ standards
- Comment your code clearly
- Test all user flows before submitting
- Ensure responsive design works on mobile


## 🔮 Future Enhancements

- [ ] Email notifications for task assignments and approvals
- [ ] Mobile app development
- [ ] Advanced calendar features (recurring tasks, reminders)
- [ ] Team chat functionality
- [ ] Task templates and categories
- [ ] Performance analytics and reporting
- [ ] Integration with external calendar applications
- [ ] Bulk task assignment features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Author

**Surya** - [@surya042](https://github.com/surya042)

## 🙏 Acknowledgments

- **Replit AI** for accelerating the development process
- **Replit Platform** for providing an excellent cloud development environment
- Contributors and beta testers for valuable feedback

## 🔗 Links

- **GitHub Repository**: [https://github.com/surya042/task-scheduling-with-replit2.2](https://github.com/surya042/task-scheduling-with-replit2.2)
- **Issues**: [Report bugs or request features](https://github.com/surya042/task-scheduling-with-replit2.2/issues)

---

**Built with ❤️ using Replit and Replit AI**
