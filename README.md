# DataSpace

DataSpace is a full-stack SaaS-style application for managing workspaces, collections, records, and files.

The project focuses on practical backend engineering concepts including layered architecture, authentication, authorization, PostgreSQL, real-time communication, Redis, and automated testing.

## Features

- User registration and authentication
- Email OTP verification
- Password reset via email
- Session-based authentication
- Workspace management
- Public/private workspace visibility
- Collection management
- Record management
- File uploads
- User administration
- Real-time global chat
- Redis-backed chat rate limiting
- Server-side validation and authorization
- Centralized error handling
- Database migrations and seeding
- Dockerized development environment

## Architecture

The backend follows a layered architecture:

```text
Routes
  ↓
Controllers
  ↓
Services
  ↓
Repositories
  ↓
PostgreSQL
```

- **Routes** handle routing and middleware.
- **Controllers** handle HTTP requests and responses.
- **Services** contain business logic and domain rules.
- **Repositories** handle database access.
- **PostgreSQL** provides persistent storage.

Expected application errors are represented by custom error classes and handled consistently through centralized error middleware.

## Domain Model

```text
User
 └── Workspace
      └── Collection
           └── Record
                └── Files
```

## Tech Stack

### Backend

- Node.js
- Express
- Passport.js
- bcrypt
- Nodemailer
- Multer
- Socket.IO

### Database & Infrastructure

- PostgreSQL 16
- `pg`
- Redis 7
- Docker
- Docker Compose

### Frontend

- EJS
- Vanilla JavaScript
- HTML
- CSS

### Testing

- Postman
- Newman

## Project Structure

```text
DataSpace/
├── config/
├── controllers/
├── db/
├── errors/
├── middleware/
├── model/
├── public/
├── routes/
├── services/
├── tests/
├── utils/
├── views/
├── app.js
├── server.js
├── Dockerfile
├── docker-compose.yml
├── docker-entrypoint.sh
├── .dockerignore
├── .env.example
├── package.json
└── package-lock.json
```

## Getting Started

### Prerequisites

The recommended development setup requires:

- Docker Desktop
- Git

Node.js, PostgreSQL, and Redis do not need to be installed separately when using Docker Compose.

### Installation

Clone the repository and create the environment file:

```bash
cp .env.example .env
```

Configure the required environment variables in .env.

### Run with Docker Compose

Build the application image and start all required services:

```bash
docker compose up --build
```

Docker Compose starts:

DataSpace application
PostgreSQL database
Redis

The services communicate with each other through the Docker Compose network using their service names.

The application is available at:

http://localhost:3000
Database Initialization

When the application container starts, the Docker entrypoint automatically:

Runs pending database migrations.
Seeds the initial administrator account.
Starts the DataSpace application.

Therefore, a fresh environment can be initialized with:

```bash
docker compose up --build
```

without manually installing or configuring PostgreSQL or Redis.

Stop the Application

```bash
docker compose down
```

## Environment Variables

The application uses environment variables for configuration and secrets, including:

- PostgreSQL connection details
- Session configuration
- Redis configuration
- Email configuration
- Password reset configuration
- Authentication secrets

```text
When running with Docker Compose, the application connects to PostgreSQL and Redis using their Docker Compose service names rather than `localhost`.
```

For example:

```bash
DB_HOST=postgres
REDIS_URL=redis://redis:6379
```

**localhost** refers to the current container, while postgres and redis resolve to the corresponding services on the Docker Compose network.

See the example environment configuration for the required variables.

**Never commit real secrets or credentials to the repository.**

## Testing

API functionality can be tested using the included Postman collection and Newman.

Run the automated test suite with the project's configured Newman command.

## Current Status

DataSpace is currently running as a Dockerized, server-rendered full-stack application using Express and EJS.

The application has completed its major backend refactor and currently includes:

- Authentication and authorization
- Workspace, collection, and record management
- File uploads
- Real-time global chat
- Redis-backed chat rate limiting
- PostgreSQL database migrations
- Database seeding
- Dockerized application environment
- Dockerized PostgreSQL and Redis
- Automated API testing

### Next Steps

The next phase focuses on:

- CI/CD
- Cloud deployment
- Production configuration
- Security hardening
- Expanded automated testing
- API development
- React + TypeScript frontend
