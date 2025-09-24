# Dayflow 📅

A comprehensive full-stack web application that consolidates tasks, events, and calendars into a unified, intuitive interface. Built with modern web technologies, it offers drag-and-drop functionality, calendar integrations, task imports, collaboration tools, and natural language processing for seamless productivity management.

![Dayflow](https://img.shields.io/badge/Dayflow-v1.0.0-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=flat-square&logo=postgresql)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript)

## ✨ Features

### 🎯 Core Functionality

- **Unified Calendar View**: Weekly grid with hourly time blocks, color-coded events and tasks
- **Task Management**: Comprehensive CRUD operations with subtasks, categories, and priority levels
- **Drag-and-Drop**: Seamlessly move tasks to calendar slots with conflict detection
- **Smart Scheduling**: Intelligent suggestions for optimal time slots based on availability

### 🔗 Integrations

- **Calendar Sync**: OAuth2 integration with Google Calendar, Microsoft Outlook, Apple Calendar, and Fastmail
- **Task Imports**: One-click import from Notion, ClickUp, Linear, and Todoist
- **Real-time Sync**: Bidirectional synchronization with external services

### 👥 Collaboration

- **Shared Resources**: Invite collaborators to tasks and events with role-based permissions
- **User Profiles**: Profile icons in sidebar for easy switching between collaborators
- **Distinct Display**: Shared events labeled with participant names (e.g., "John:Sara")

### 🚀 Advanced Features

- **Natural Language Processing**: Create tasks with phrases like "Lunch with Sarah at 1 PM tomorrow"
- **Recurring Tasks/Events**: RRULE support for daily, weekly, and monthly patterns
- **Smart Suggestions**: AI-powered scheduling recommendations
- **Conflict Detection**: Automatic prevention of double-bookings

### 🎨 User Experience

- **Dark Theme**: Modern, minimalistic dark mode by default
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Category Colors**: Vibrant color-coding (Work=blue, Family=green, Personal=orange, Travel=purple)
- **Week Navigation**: Intuitive controls with format "January – Mon 20 → Fri 24"

## 🛠️ Tech Stack

### Frontend

- **React 18+** with TypeScript for type-safe component development
- **TailwindCSS** for utility-first styling and responsive design
- **shadcn/ui** for accessible, customizable UI components
- **Framer Motion** for smooth animations and transitions
- **React Query** for server state management and caching
- **Zustand** for client-side state management

### Backend

- **Node.js** with Express.js for robust API development
- **TypeScript** for type safety across the entire backend
- **PostgreSQL** with TypeORM for reliable data persistence
- **Passport.js** for OAuth2 authentication strategies
- **JWT** for secure token-based authentication

### Development Tools

- **Vite** for fast development and optimized builds
- **ESLint** for code quality and consistency
- **Prettier** for automated code formatting

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+ database server

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/daily-planner.git
cd daily-planner
```

### 2. Database Setup

```bash
# Install PostgreSQL and create database
createdb daily_planner

# Or use psql:
psql -c "CREATE DATABASE daily_planner;"
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cat > .env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=daily_planner
JWT_SECRET=your_jwt_secret_key_here
PORT=3000

# Optional: OAuth2 keys for integrations
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
EOF

# Run database migrations
npm run migration:run

# Start development server
npm run dev
```

### 4. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 5. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## 🚀 Usage

### Getting Started

1. **Register/Login**: Create an account or sign in
2. **Create Tasks**: Use the sidebar to add tasks with natural language
3. **Schedule Events**: Drag tasks to calendar slots or create events directly
4. **Connect Integrations**: Link your external calendars and task services

### Key Workflows

#### Task Management

```typescript
// Create task with NLP
"Lunch with Sarah at 1 PM tomorrow"

// Or use the UI components
<TaskItem /> // Individual task with subtasks
<TaskList /> // Filtered task lists
```

#### Calendar Integration

```typescript
// Connect Google Calendar
<CalendarSettings /> // OAuth2 flow
// Events sync automatically
```

#### Collaboration

```typescript
// Invite collaborators
<InviteCollaborator /> // Send invitations
// Shared events display distinctly
```

## 🏗️ Architecture & Components

For detailed technical documentation, see [AGENTS.md](./AGENTS.md).

### System Overview

```
Frontend (React SPA) ↔ Backend (Express API) ↔ PostgreSQL
     ↓                        ↓                        ↓
  Components              Routes/Services          Entities
  State Mgmt              Authentication           Migrations
  UI Library              Integrations             Relationships
```

### Key Components

#### Backend Architecture

- **`data-source.ts`**: TypeORM configuration and database connection
- **`index.ts`**: Express server setup with middleware and routes
- **`middleware/auth.ts`**: JWT authentication middleware
- **`routes/`**: RESTful API endpoints for all features
- **`entities/`**: Database models with relationships
- **`services/`**: Business logic (NLP, scheduling, integrations)

#### Frontend Architecture

- **`vite.config.ts`**: Build configuration with path aliases
- **`main.tsx`**: React application bootstrap
- **`App.tsx`**: Root component with layout structure
- **`lib/api.ts`**: React Query hooks for API interactions
- **`store/appStore.ts`**: Zustand store for global state
- **`components/`**: Modular UI components organized by feature

### Data Flow

1. User interactions trigger React Query mutations
2. API calls to Express routes with JWT authentication
3. Business logic in services processes requests
4. TypeORM entities handle database operations
5. Responses update React Query cache and UI

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Follow the existing code style and TypeScript conventions
4. Write tests for new functionality
5. Ensure all tests pass: `npm test`

### Code Style

- Use TypeScript for all new code
- Follow ESLint configuration
- Use meaningful commit messages
- Document complex logic with comments

### Pull Request Process

1. Update documentation for any new features
2. Ensure CI/CD checks pass
3. Request review from maintainers
4. Address feedback and merge

### Areas for Contribution

- **UI/UX Improvements**: Enhanced animations, accessibility features
- **New Integrations**: Additional calendar/task service providers
- **Performance Optimization**: Caching, lazy loading, bundle splitting
- **Mobile App**: React Native companion application
- **AI Features**: Enhanced NLP, predictive scheduling

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies and best practices
- Inspired by productivity tools like Google Calendar and Todoist
- Thanks to the open-source community for amazing libraries

---

**Happy planning!** 🎯📝📅
