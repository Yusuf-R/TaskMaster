# TaskMaster

A full-stack task management system that allows users to create, update, and delete tasks. Users can organize tasks by priority and set deadlines.

## Features

- User registration and authentication
- Create, read, update, and delete tasks
- Set task priorities (low, medium, high)
- Set task deadlines
- Filter tasks by priority or due date
- Search tasks by keywords
- Secure password hashing
- JWT-based authentication

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Validation**: express-validator

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/TaskMaster.git
   cd TaskMaster
   ```

2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Create a `.env` file in the backend directory:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/taskmaster
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Tasks

- `GET /api/tasks` - Get all tasks (with filtering options)
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/:id` - Get a specific task
- `PATCH /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

## Query Parameters for Tasks

- `priority` - Filter by priority (low, medium, high)
- `status` - Filter by status (pending, in-progress, completed)
- `sortBy` - Sort by field (e.g., deadline:desc)
- `search` - Search tasks by keyword
- `limit` - Number of tasks per page
- `skip` - Number of tasks to skip (for pagination)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
