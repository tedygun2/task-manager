# Task Management System

A fullstack task management application with React + Material UI frontend and Java Spring Boot backend.

## Tech Stack

### Backend
- Java 17 + Spring Boot 3.x
- PostgreSQL
- Spring Security + JWT
- Spring Data JPA
- SpringDoc OpenAPI (Swagger UI)

### Frontend
- React 18 + Vite
- Material UI (MUI) v5
- React Router v6
- Axios
- Recharts

### Infrastructure
- Docker + Docker Compose
- Nginx

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api
- Swagger UI: http://localhost:8080/swagger-ui.html

### Local Development

#### Backend

```bash
cd backend

# Run with Maven
./mvnw spring-boot:run

# Run tests
./mvnw test
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login, returns JWT

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/{id}` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/{id}` - Update task
- `PATCH /api/tasks/{id}/status` - Update task status only
- `DELETE /api/tasks/{id}` - Delete task
- `GET /api/tasks/stats` - Get task statistics

## Project Structure

```
seek/
├── backend/
│   ├── src/main/java/com/taskmanager/
│   │   ├── config/          # Security, CORS, OpenAPI config
│   │   ├── controller/      # REST controllers
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── entity/          # JPA entities
│   │   ├── exception/       # Custom exceptions & handlers
│   │   ├── repository/      # Spring Data repositories
│   │   ├── service/         # Business logic
│   │   └── security/        # JWT utilities, auth filters
│   ├── src/test/java/       # Unit tests
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Main pages
│   │   ├── services/        # API calls
│   │   ├── context/         # Auth context
│   │   └── test/            # Unit tests
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Features

- User authentication (register/login)
- CRUD operations for tasks
- Task status management (TODO, IN_PROGRESS, COMPLETED)
- Filter tasks by status
- Task statistics with charts
- Responsive design
- JWT-based security

## Environment Variables

### Backend
- `DATABASE_URL` - PostgreSQL connection URL
- `DATABASE_USERNAME` - Database username
- `DATABASE_PASSWORD` - Database password
- `JWT_SECRET` - Secret key for JWT token generation

### Frontend
- `VITE_API_URL` - Backend API URL (default: `/api`)
