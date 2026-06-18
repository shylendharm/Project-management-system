# Database Schema

This document details the database schema for the Project Management System. The project uses PostgreSQL with Prisma ORM.

## Models

### `User`
Stores user authentication and profile information.
- `id` (Int): Primary Key, auto-incremented.
- `fullName` (String): Full name of the user.
- `email` (String): Unique email address used for login.
- `password` (String): Hashed password.
- `role` (Enum `Role`): The access level of the user (`ADMIN` or `USER`). Default is `USER`.
- `createdAt` (DateTime): Timestamp of when the user was created.
- `updatedAt` (DateTime): Timestamp of the last update.
- **Relations:** 
  - One-to-Many with `Project`
  - One-to-Many with `Task`
  - One-to-Many with `AuditLog`

### `Project`
Represents a project container that holds tasks.
- `id` (Int): Primary Key, auto-incremented.
- `name` (String): Project name.
- `description` (String, Optional): Detailed description of the project.
- `status` (Enum `ProjectStatus`): Current state of the project (`NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`).
- `startDate` (DateTime, Optional): When the project starts.
- `endDate` (DateTime, Optional): Expected completion date.
- `userId` (Int): Foreign Key to `User`. The user who created the project.
- `createdAt` (DateTime): Timestamp of creation.
- `updatedAt` (DateTime): Timestamp of the last update.
- **Relations:** 
  - One-to-Many with `Task`
  - Belongs to `User`

### `Task`
Represents a specific task assigned to a project.
- `id` (Int): Primary Key, auto-incremented.
- `title` (String): Title/summary of the task.
- `description` (String, Optional): Details of the task.
- `priority` (Enum `TaskPriority`): Importance level (`LOW`, `MEDIUM`, `HIGH`). Default is `MEDIUM`.
- `status` (Enum `TaskStatus`): Current progress (`PENDING`, `IN_PROGRESS`, `COMPLETED`). Default is `PENDING`.
- `dueDate` (DateTime, Optional): Task deadline.
- `projectId` (Int): Foreign Key to `Project`.
- `userId` (Int): Foreign Key to `User`.
- `createdAt` (DateTime): Timestamp of creation.
- `updatedAt` (DateTime): Timestamp of the last update.
- **Relations:** 
  - Belongs to `Project`
  - Belongs to `User`

### `AuditLog`
Tracks administrative and critical user actions for security and compliance.
- `id` (Int): Primary Key, auto-incremented.
- `action` (String): The action performed (e.g., "LOGIN", "DELETE_USER").
- `details` (String, Optional): Additional context or JSON string representing the action details.
- `userId` (Int): Foreign Key to `User` who performed the action.
- `createdAt` (DateTime): Timestamp of when the log was created.
- **Relations:**
  - Belongs to `User`

## Enums
- **`Role`**: `ADMIN`, `USER`
- **`ProjectStatus`**: `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`
- **`TaskPriority`**: `LOW`, `MEDIUM`, `HIGH`
- **`TaskStatus`**: `PENDING`, `IN_PROGRESS`, `COMPLETED`
