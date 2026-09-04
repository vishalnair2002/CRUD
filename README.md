# Student Records Management System (CRUD App)

## Overview
A full-stack CRUD application for managing student records, built with
an ASP.NET Core Web API backend and an Angular frontend. The backend
uses Entity Framework Core with a code-first, migration-based database,
so student data is persisted in a real database rather than in-memory
or hardcoded data.

Each student record includes: name, student ID, email, phone, major,
year, grade, and a photo upload. Beyond basic CRUD operations, the app
also supports exporting student data to Excel and PDF, and includes a
grade-based grouping endpoint for simple reporting.

## Architecture
- **Backend** (`/Backend`) — ASP.NET Core Web API
  - `Controllers/StudentsController.cs` — exposes CRUD endpoints for
    student records
  - `Models/Student.cs` — the Student data model
  - `Data/ApplicationDbContext.cs` — Entity Framework Core database
    context
  - `Migrations/` — Entity Framework Core migrations for the database
    schema
- **Frontend** (`/Frontend`) — Angular application
  - `src/app/student.service.ts` — service that calls the backend API
  - `src/app/student.ts` — the Student model on the frontend
  - `src/app/app.module.ts` / `app.routes.ts` — app configuration and
    routing
  - Displays, creates, updates, and deletes student records through the
    API

## How to run
**Backend:**
```bash
cd Backend
dotnet restore
dotnet run
```

**Frontend:**
```bash
cd Frontend
npm install
ng serve
```
The frontend expects the API at `http://localhost:5201/api/students` by
default (see `student.service.ts`) — make sure the backend is running on
that port before starting the frontend, or update the URL if you run
the backend elsewhere.

## Tech
C#, ASP.NET Core Web API, Entity Framework Core, Angular, TypeScript
