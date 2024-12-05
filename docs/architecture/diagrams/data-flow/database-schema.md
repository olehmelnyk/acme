# Database Schema Architecture

This diagram illustrates our database schema and relationships.

## Schema Diagram

```mermaid
erDiagram
    User {
        string id PK
        string email
        string name
        datetime createdAt
        datetime updatedAt
    }

    Profile {
        string id PK
        string userId FK
        string avatar
        string bio
        json settings
    }

    Organization {
        string id PK
        string name
        string slug
        datetime createdAt
    }

    Team {
        string id PK
        string orgId FK
        string name
        string type
    }

    UserOrg {
        string userId FK
        string orgId FK
        string role
        datetime joinedAt
    }

    User ||--o{ Profile : has
    User ||--o{ UserOrg : belongs_to
    Organization ||--o{ UserOrg : has_members
    Organization ||--o{ Team : has
```

## Description

Our database schema is designed with these key entities:

1. **User Management**

   - Users and their profiles
   - Authentication data
   - User preferences

2. **Organization Structure**

   - Organizations and teams
   - Member relationships
   - Role assignments

3. **Relationships**
   - One-to-one: User-Profile
   - One-to-many: Org-Teams
   - Many-to-many: Users-Organizations

## Implementation Details

- Uses PostgreSQL as primary database
- Implements row-level security
- Includes audit logging
- Supports soft deletes
- Maintains referential integrity
