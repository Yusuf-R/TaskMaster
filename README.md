# 🚀 TaskMaster

<div align="center">

![TaskMaster Logo](src/assets/task.ico)

[![Node.js](https://img.shields.io/badge/Node.js-v14+-green.svg)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-green.svg)](https://www.mongodb.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

### 🌟 Modern Task Management System | 3MTT Capstone Project

*A powerful, intuitive task management solution showcasing full-stack development expertise*

[🚀 Features](#features) &nbsp;&nbsp;|&nbsp;&nbsp; [💻 Demo](#live-demo) &nbsp;&nbsp;|&nbsp;&nbsp; [🛠️ Installation](#installation) &nbsp;&nbsp;|&nbsp;&nbsp; [📚 Documentation](#api-documentation)

</div>

---

## 📋 About The Project

TaskMaster is a comprehensive task management system developed as a capstone project for the 3MTT Software Development Course. This project demonstrates the practical application of modern web development technologies and best practices learned throughout the course.

### 🎓 Academic Context
This project serves as the culmination of our learning journey in the 3MTT Software Development Course, showcasing:
- Full-stack development capabilities
- Modern web development best practices
- Secure user authentication and authorization
- RESTful API design principles
- Responsive and intuitive UI/UX design

## ✨ Features

🔐 **User Management**
- Secure user registration and authentication
- JWT-based session management
- Password encryption with bcrypt

📝 **Task Management**
- Create, read, update, and delete tasks
- Priority levels (low, medium, high)
- Deadline setting and tracking
- Status tracking (pending, in-progress, completed)

🔍 **Advanced Features**
- Real-time search functionality
- Multi-parameter filtering
- Priority-based task organization
- Responsive design for all devices
- Intuitive drag-and-drop interface

## 🛠️ Tech Stack

### Frontend
- ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
- ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
- ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

### Backend
- ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
- ![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)
- ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)

### Security & Tools
- JWT Authentication
- Bcrypt Encryption
- Express Validator
- RESTful API Design

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/TaskMaster.git
   cd TaskMaster
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment**
   ```bash
   # Create .env file in backend directory
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Start development servers**
   ```bash
   # Terminal 1: Backend
   npm run dev
   
   # Terminal 2: Frontend
   cd ../frontend
   npm start
   ```

## 📚 API Documentation

### 🔐 Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |

### 📝 Task Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/:id` | Get task by ID |
| PATCH | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

### 🔍 Query Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| priority | Filter by priority | `?priority=high` |
| status | Filter by status | `?status=pending` |
| search | Search tasks | `?search=meeting` |
| sortBy | Sort results | `?sortBy=deadline:desc` |

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- 3MTT Software Development Course Instructors
- The open-source community
- All contributors and testers

---

<div align="center">

Made with ❤️ by [Your Name] | [Portfolio](your-portfolio-link)

</div>
