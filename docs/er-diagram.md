# Entity-Relationship (ER) Diagram

This document illustrates the data relationships within the Project Management System.

```mermaid
erDiagram
    User {
        Int id PK
        String fullName
        String email
        String password
        Role role
        DateTime createdAt
        DateTime updatedAt
    }
    
    Project {
        Int id PK
        String name
        String description
        ProjectStatus status
        DateTime startDate
        DateTime endDate
        Int userId FK
        DateTime createdAt
        DateTime updatedAt
    }
    
    Task {
        Int id PK
        String title
        String description
        TaskPriority priority
        TaskStatus status
        DateTime dueDate
        Int projectId FK
        Int userId FK
        DateTime createdAt
        DateTime updatedAt
    }
    
    AuditLog {
        Int id PK
        String action
        String details
        Int userId FK
        DateTime createdAt
    }

    User ||--o{ Project : "owns"
    User ||--o{ Task : "created by"
    User ||--o{ AuditLog : "performs"
    Project ||--o{ Task : "contains"
```

### Visual Diagram

![ER Diagram](https://kroki.io/mermaid/svg/eJytU8tqwzAQvOcrFt_zA74FQiGkFNMkH7C1NmZbWTKrFSEk-fdi11Vqu1DTVgc9dqRhZiSRrBkrwXoBAHAIJHDppm3bOAU2UGxTZafCroJjtPYJaxrXqUa242KDIZy8mFR_9pZAvL0fX6PSnmuCUgiVzEqnUGzMF-jW9YX4Vyp1jmT3jVxDoRRulL1LUE-5U9QYIHTDVExQFG1XU4icGQCtohhINgYetn92vMfwNseustpZflvCQtgL6xmafjJAf4jCRJr4bT5CHFr-3yBW0bA--mpOGFgOLKc0FNmG3-m7Le4f5npdLv0lPcYcMn9yIZts6O4uh6xngpfzdE-ylUPWkBy91D3TJ_2YzDtFdiF7B-kqD1w=)
