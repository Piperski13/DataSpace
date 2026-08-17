# DataSpace

DataSpace is a full-stack SaaS-style application for managing workspaces, collections, records, and files.

The project focuses on practical backend engineering concepts including layered architecture, authentication, authorization, PostgreSQL, real-time communication, Redis, and automated testing.

## Features

* User registration and authentication
* Email OTP verification
* Password reset via email
* Session-based authentication
* Workspace management
* Public/private workspace visibility
* Collection management
* Record management
* File uploads
* User administration
* Real-time global chat
* Redis-backed chat rate limiting
* Server-side validation and authorization
* Centralized error handling

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

* **Routes** handle routing and middleware.
* **Controllers** handle HTTP requests and responses.
* **Services** contain business logic and domain rules.
* **Repositories** handle database access.
* **PostgreSQL** provides persistent storage.

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

* Node.js
* Express
* Passport.js
* bcrypt
* Nodemailer
* Multer
* Socket.IO

### Database & Infrastructure

* PostgreSQL
* `pg`
* Redis

### Frontend

* EJS
* Vanilla JavaScript
* HTML
* CSS

### Testing

* Postman
* Newman

## Project Structure

```text
src/
├── controllers/
├── services/
├── repositories/
├── routes/
├── middleware/
├── errors/
├── views/
├── public/
└── ...

db/
├── populatedb.js
└── ...

tests/
└── ...

server.js
package.json
```

## Getting Started

### Prerequisites

The application currently requires:

* Node.js
* PostgreSQL
* Redis

### Installation

Clone the repository and install dependencies:

```bash
npm install
```

Create a PostgreSQL database and configure the application using the required environment variables.

The current local development setup also requires Redis to be running.

Initialize the database:

```bash
node db/populatedb
```

Start the development server:

```bash
npm run dev
```

> **Note:** The current development setup requires manual configuration of PostgreSQL, Redis, and environment variables. This setup will be simplified as the application is prepared for deployment.

## Environment Variables

The application uses environment variables for configuration and secrets, including:

* PostgreSQL connection details
* Session configuration
* Redis configuration
* Email configuration
* Password reset configuration
* Authentication secrets

See the example environment configuration for the required variables.

**Never commit real secrets or credentials to the repository.**

## Testing

API functionality can be tested using the included Postman collection and Newman.

Run the automated test suite with the project's configured Newman command.

## Current Status

DataSpace is currently running as a server-rendered full-stack application using Express and EJS.

The application has completed its major backend refactor and currently includes authentication, authorization, workspace/collection/record management, file uploads, real-time chat, Redis rate limiting, and automated API testing.

The next focus is making the application easier to configure, run, and deploy in a production environment.
