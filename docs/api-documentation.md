# Project Management System — API Documentation

Base URL: `http://localhost:5000/api`

> All `/projects` endpoints require a valid JWT in the `Authorization: Bearer <token>` header.

---

## Authentication

### Register
`POST /auth/register`

**Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```
**Response `201`:**
```json
{ "success": true, "data": { "id": 1, "fullName": "John Doe", "email": "john@example.com", "token": "<jwt>" } }
```

---

### Login
`POST /auth/login`

**Body:**
```json
{ "email": "john@example.com", "password": "password123" }
```
**Response `200`:**
```json
{ "success": true, "data": { "id": 1, "fullName": "John Doe", "email": "john@example.com", "token": "<jwt>" } }
```

---

### Logout
`POST /auth/logout`

**Response `200`:**
```json
{ "success": true, "message": "Logged out successfully" }
```

---

## Projects

All project endpoints are **protected** — include `Authorization: Bearer <token>`.

### Project Object
| Field         | Type                                      | Notes                       |
|---------------|-------------------------------------------|-----------------------------|
| `id`          | `number`                                  | Auto-generated              |
| `name`        | `string`                                  | 1–100 chars, required       |
| `description` | `string \| null`                          | Optional, max 500 chars     |
| `status`      | `NOT_STARTED \| IN_PROGRESS \| COMPLETED` | Default: `NOT_STARTED`      |
| `startDate`   | `ISO 8601 string \| null`                 | Optional                    |
| `endDate`     | `ISO 8601 string \| null`                 | Optional; must be ≥ startDate |
| `createdAt`   | `ISO 8601 string`                         | Auto-set                    |
| `updatedAt`   | `ISO 8601 string`                         | Auto-updated                |
| `userId`      | `number`                                  | Owner's user ID             |

---

### Create Project
`POST /projects`

**Body:**
```json
{
  "name": "Website Redesign",
  "description": "Full overhaul of the company website",
  "status": "IN_PROGRESS",
  "startDate": "2026-06-01T00:00:00Z",
  "endDate": "2026-08-31T00:00:00Z"
}
```
Only `name` is required. All other fields are optional.

**Response `201`:**
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": { /* Project Object */ }
}
```

---

### Get All Own Projects
`GET /projects`

Returns all projects belonging to the authenticated user, ordered by `createdAt` descending.

**Query Parameters (all optional):**
| Param    | Type                                      | Description                                                        |
|----------|-------------------------------------------|--------------------------------------------------------------------|
| `search` | `string`                                  | Case-insensitive match on project `name` or `description`          |
| `status` | `NOT_STARTED \| IN_PROGRESS \| COMPLETED` | Filter by exact project status                                     |

**Examples:**
```
GET /api/projects?search=website
GET /api/projects?status=IN_PROGRESS
GET /api/projects?search=design&status=NOT_STARTED
```

**Response `200`:**
```json
{
  "success": true,
  "count": 2,
  "data": [ /* Array of Project Objects */ ]
}
```

---

### Get Single Project
`GET /projects/:id`

**Response `200`:**
```json
{
  "success": true,
  "data": { /* Project Object */ }
}
```

**Errors:**
- `400` — Invalid ID (non-numeric)
- `404` — Project not found or not owned by user

---

### Update Project
`PUT /projects/:id`

All body fields are **optional** — only provided fields are updated (partial update).

**Body:**
```json
{
  "name": "New Name",
  "status": "COMPLETED",
  "description": "Updated description",
  "startDate": "2026-07-01T00:00:00Z",
  "endDate": "2026-09-30T00:00:00Z"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Project updated successfully",
  "data": { /* Updated Project Object */ }
}
```

**Errors:**
- `400` — Validation error (e.g., invalid status, endDate before startDate)
- `404` — Project not found or not owned by user

---

### Delete Project
`DELETE /projects/:id`

**Response `200`:**
```json
{ "success": true, "message": "Project deleted successfully" }
```

**Errors:**
- `400` — Invalid ID
- `404` — Project not found or not owned by user

---

## Tasks

All task endpoints are **protected** — include `Authorization: Bearer <token>`.

### Task Object
| Field         | Type                                      | Notes                                      |
|---------------|-------------------------------------------|--------------------------------------------|
| `id`          | `number`                                  | Auto-generated                             |
| `title`       | `string`                                  | 1–100 chars, required                      |
| `description` | `string \| null`                          | Optional, max 500 chars                    |
| `priority`    | `LOW \| MEDIUM \| HIGH`                   | Default: `MEDIUM`                          |
| `status`      | `PENDING \| IN_PROGRESS \| COMPLETED`     | Default: `PENDING`                         |
| `dueDate`     | `ISO 8601 string \| null`                 | Optional                                   |
| `projectId`   | `number`                                  | Associated project ID                      |
| `userId`      | `number`                                  | Creator's user ID                          |
| `createdAt`   | `ISO 8601 string`                         | Auto-set                                   |
| `updatedAt`   | `ISO 8601 string`                         | Auto-updated                               |

---

### Create Task
`POST /tasks`

**Body:**
```json
{
  "title": "Design Database Schema",
  "description": "Create schema with Prisma and migrate",
  "priority": "HIGH",
  "status": "PENDING",
  "dueDate": "2026-06-20T12:00:00Z",
  "projectId": 1
}
```
`title` and `projectId` are required.

**Response `201`:**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": { /* Task Object */ }
}
```

**Errors:**
- `400` — Validation error
- `404` — Project not found or access denied

---

### Get All Tasks
`GET /tasks`

Returns all tasks belonging to the authenticated user across all projects, with optional filters.

**Query Parameters (all optional):**
| Param      | Type                                    | Description                                                  |
|------------|-----------------------------------------|--------------------------------------------------------------|
| `search`   | `string`                                | Case-insensitive match on task `title` or `description`      |
| `status`   | `PENDING \| IN_PROGRESS \| COMPLETED`   | Filter by exact task status                                  |
| `priority` | `LOW \| MEDIUM \| HIGH`                 | Filter by exact task priority                                |

**Examples:**
```
GET /api/tasks?search=schema
GET /api/tasks?status=PENDING
GET /api/tasks?priority=HIGH
GET /api/tasks?status=IN_PROGRESS&priority=HIGH
GET /api/tasks?search=design&status=PENDING&priority=MEDIUM
```

**Response `200`:**
```json
{
  "success": true,
  "count": 5,
  "data": [ /* Array of Task Objects */ ]
}
```

---

### Get Tasks by Project
`GET /tasks/project/:projectId`

Returns all tasks within a specific project. Also supports the same optional query filters.

**Query Parameters (all optional):**
| Param      | Type                                    | Description                                                  |
|------------|-----------------------------------------|--------------------------------------------------------------|
| `search`   | `string`                                | Case-insensitive match on task `title` or `description`      |
| `status`   | `PENDING \| IN_PROGRESS \| COMPLETED`   | Filter by exact task status                                  |
| `priority` | `LOW \| MEDIUM \| HIGH`                 | Filter by exact task priority                                |

**Examples:**
```
GET /api/tasks/project/1?status=PENDING
GET /api/tasks/project/1?priority=HIGH&search=fix
```

**Response `200`:**
```json
{
  "success": true,
  "count": 1,
  "data": [ /* Array of Task Objects */ ]
}
```

**Errors:**
- `400` — Invalid ID
- `404` — Project not found or access denied

---

### Get Single Task
`GET /tasks/:id`

**Response `200`:**
```json
{
  "success": true,
  "data": { /* Task Object */ }
}
```

**Errors:**
- `400` — Invalid ID
- `404` — Task not found or access denied

---

### Update Task
`PUT /tasks/:id`

**Body:**
```json
{
  "title": "New Task Title",
  "status": "IN_PROGRESS",
  "priority": "LOW",
  "description": "Updated description",
  "dueDate": "2026-06-25T18:00:00Z"
}
```
All body fields are optional.

**Response `200`:**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": { /* Updated Task Object */ }
}
```

**Errors:**
- `400` — Validation error
- `404` — Task not found or access denied

---

### Mark Task Complete
`PUT /tasks/:id/complete`

Quick endpoint to mark a task's status as `COMPLETED`. No body required.

**Response `200`:**
```json
{
  "success": true,
  "message": "Task marked as completed",
  "data": { /* Task Object with status COMPLETED */ }
}
```

**Errors:**
- `400` — Invalid ID
- `404` — Task not found or access denied

---

### Delete Task
`DELETE /tasks/:id`

**Response `200`:**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

**Errors:**
- `400` — Invalid ID
- `404` — Task not found or access denied

---

## Dashboard

All dashboard endpoints are **protected** — include `Authorization: Bearer <token>`.

### Get Dashboard Statistics
`GET /dashboard` or `GET /dashboard/stats`

Returns aggregated stats for projects and tasks belonging to the authenticated user.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "totalProjects": 2,
    "totalTasks": 8,
    "completedTasks": 3,
    "pendingTasks": 4,
    "projectsInProgress": 1
  }
}
```

**Errors:**
- `401` — Unauthorized (missing or invalid token)

---

## Status & Error Codes

| Code | Meaning                                        |
|------|------------------------------------------------|
| 200  | OK                                             |
| 201  | Created                                        |
| 400  | Bad Request (validation error or invalid ID)   |
| 401  | Unauthorized (missing or invalid token)        |
| 404  | Not Found                                      |
| 429  | Too Many Requests (rate limiter)               |
| 500  | Internal Server Error                          |

**Validation error shape (`400`):**
```json
{
  "success": false,
  "errors": [
    { "path": ["fieldName"], "message": "Human-readable error message", "code": "..." }
  ]
}
```
