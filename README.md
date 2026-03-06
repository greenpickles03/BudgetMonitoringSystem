# 💼 Budget Monitoring System

A full-stack personal budget monitoring application built with Spring Boot and React TypeScript.

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend (Port 3000)            │
│  ┌──────────┐  ┌──────────┐  ┌─────────┐  ┌──────────┐ │
│  │Dashboard │  │ Budgets  │  │Transactions│ │Categories│ │
│  └──────────┘  └──────────┘  └─────────┘  └──────────┘ │
│           Axios HTTP Client + JWT Token                  │
└─────────────────────────────────────────────────────────┘
                           │
                    REST API (Port 8080)
                           │
┌─────────────────────────────────────────────────────────┐
│              Spring Boot Backend (Port 8080)             │
│  ┌────────────┐  ┌───────────┐  ┌──────────────────┐   │
│  │Controllers │  │  Services │  │JWT Security Filter│   │
│  └────────────┘  └───────────┘  └──────────────────┘   │
│  ┌────────────────────────────────────────────────────┐ │
│  │    Spring Data JPA + Hibernate                     │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│            PostgreSQL Database (Port 5432)               │
│  users │ categories │ budgets │ transactions             │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Features

- 🔐 **JWT Authentication** - Secure registration and login
- 📊 **Dashboard** - Monthly income/expense summary with charts
- 💰 **Budget Management** - Create and track budgets with progress visualization
- 💳 **Transaction Tracking** - Record income and expense transactions
- 🏷️ **Category Management** - Custom categories with icons and colors
- 📈 **Analytics** - Pie charts and bar charts for spending insights
- 🔒 **Role-Based Access** - User/Admin roles

## 📁 Project Structure

```
BudgetMonitoringSystem/
├── backend/                          # Spring Boot application
│   ├── src/main/java/com/budgetmonitor/
│   │   ├── config/                   # Security, OpenAPI, App config
│   │   ├── controller/               # REST controllers
│   │   ├── dto/                      # Request/Response DTOs
│   │   ├── entity/                   # JPA entities
│   │   ├── exception/                # Exception handling
│   │   ├── repository/               # Spring Data JPA repositories
│   │   ├── security/                 # JWT filter & service
│   │   └── service/                  # Business logic
│   ├── src/test/                     # JUnit tests
│   └── pom.xml
├── frontend/                         # React TypeScript application
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   ├── context/                  # React Context (Auth)
│   │   ├── pages/                    # Page components
│   │   ├── services/                 # Axios API services
│   │   └── types/                    # TypeScript type definitions
│   └── package.json
└── docker-compose.yml
```

## 🗄️ Database Schema

```sql
-- Users
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Categories
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(10),
    color VARCHAR(20),
    type VARCHAR(20) NOT NULL,   -- INCOME | EXPENSE
    user_id BIGINT REFERENCES users(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Budgets
CREATE TABLE budgets (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    amount DECIMAL(15,2) NOT NULL,
    spent_amount DECIMAL(15,2) DEFAULT 0,
    category_id BIGINT REFERENCES categories(id),
    user_id BIGINT REFERENCES users(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    period VARCHAR(20) NOT NULL,  -- WEEKLY|MONTHLY|QUARTERLY|YEARLY|CUSTOM
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Transactions
CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    type VARCHAR(20) NOT NULL,   -- INCOME | EXPENSE
    category_id BIGINT REFERENCES categories(id),
    budget_id BIGINT REFERENCES budgets(id),
    user_id BIGINT REFERENCES users(id),
    transaction_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/users/me` | Get current user profile |
| GET | `/api/categories` | List user categories |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/{id}` | Update category |
| DELETE | `/api/categories/{id}` | Delete category |
| GET | `/api/budgets` | List user budgets |
| POST | `/api/budgets` | Create budget |
| PUT | `/api/budgets/{id}` | Update budget |
| DELETE | `/api/budgets/{id}` | Delete budget |
| GET | `/api/transactions` | List transactions |
| POST | `/api/transactions` | Create transaction |
| PUT | `/api/transactions/{id}` | Update transaction |
| DELETE | `/api/transactions/{id}` | Delete transaction |
| GET | `/api/dashboard/summary` | Dashboard analytics |

## 🛠️ Prerequisites

- **Java 17+**
- **Maven 3.8+**
- **Node.js 18+**
- **PostgreSQL 13+**
- **Docker & Docker Compose** (optional)

## 🚀 Running the Application

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/greenpickles03/BudgetMonitoringSystem.git
cd BudgetMonitoringSystem

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
```

### Option 2: Manual Setup

#### 1. Set up PostgreSQL
```sql
CREATE DATABASE budget_monitor_db;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE budget_monitor_db TO postgres;
```

#### 2. Start Backend
```bash
cd backend
mvn spring-boot:run

# API running at http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
# OpenAPI docs: http://localhost:8080/api-docs
```

#### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev

# App running at http://localhost:3000
```

## 🧪 Running Tests

```bash
# Backend unit and integration tests
cd backend
mvn test

# Run specific test class
mvn test -Dtest=AuthServiceTest
mvn test -Dtest=BudgetServiceTest
mvn test -Dtest=TransactionServiceTest
mvn test -Dtest=AuthControllerTest
```

## 📖 API Documentation

Once the backend is running, access the interactive Swagger UI at:
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/api-docs

## 🔐 Security

- Passwords are hashed using **BCrypt**
- API endpoints are secured with **JWT Bearer tokens**
- CORS is configured for `localhost:3000` and `localhost:5173`
- Token expiration: 24 hours

## 🛠️ Technologies Used

### Backend
- **Java 17**
- **Spring Boot 3.2**
- **Spring Security** + JWT
- **Spring Data JPA** + Hibernate
- **PostgreSQL** (production) / H2 (testing)
- **SpringDoc OpenAPI 2.3** (Swagger)
- **Lombok**
- **JUnit 5** + Mockito

### Frontend
- **React 18** + TypeScript
- **React Router 6**
- **TailwindCSS 3**
- **Axios**
- **React Hook Form**
- **Recharts** (charts)
- **Vite** (build tool)