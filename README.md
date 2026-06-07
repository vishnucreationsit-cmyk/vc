# Employee Attendance & Payroll Management System (LeatherWorks Pro)

A complete full-stack web application designed for a leather manufacturing company to manage employee attendance, automatic payroll calculations, and order tracking.

## Tech Stack

### Backend
- **Java 17** & **Spring Boot 3.2**
- **Spring Data JPA** & **Hibernate**
- **Spring Security** with **JWT** for authentication
- **MySQL 8.0** Database
- **Maven** Build Tool

### Frontend
- **React.js** (Vite)
- **Tailwind CSS** for styling (Custom Leather Branding)
- **React Router** for navigation
- **Axios** for API requests
- **Context API** for state management
- **Lucide React** for icons

## Core Features

1. **Role-Based Access Control**:
   - ADMIN (Owner): Full access to employees, payroll, and all settings.
   - MANAGER: Can approve leaves, view attendance, and manage orders.
   - EMPLOYEE: Can check in/out, view own attendance/payroll, and apply for leaves.

2. **Daily Attendance with Late Arrival Logic**:
   - Geolocation-based check-in.
   - **On Time**: Check-in before or at 9:00 AM.
   - **Late**: Check-in between 9:01 AM and 10:00 AM.
   - **Very Late**: Check-in after 10:00 AM.
   - Automatic calculation of `minutes_late` and total hours worked.

3. **Automated Payroll**:
   - One-click monthly payroll generation.
   - **Late Deductions**: Every 3 late arrivals result in 1 day of salary deduction.
   - **Overtime**: Automatically calculated for hours worked beyond 9 hours/day at 1.5x pay rate.

4. **Order Management**: Track orders for leather bags, wallets, belts, and custom items through various stages (Pending -> In Progress -> Completed).

## Setup Instructions (Local Development)

### Prerequisites
- Java 17 JDK
- Maven
- Node.js (v18+)
- MySQL Server 8.0+

### Database Setup
1. Log into MySQL: `mysql -u root -p`
2. Create the database: `CREATE DATABASE leather_attendance_db;`
3. Update `backend/src/main/resources/application.properties` with your MySQL username and password.

### Running the Backend
1. Navigate to the backend directory: `cd backend`
2. Run the application: `./mvnw spring-boot:run` (or use your IDE to run `AttendanceSystemApplication.java`).
3. The server will start on `http://localhost:8080`.
4. *Note: Spring Data JPA will automatically create the tables on startup.*

### Running the Frontend
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. The app will be available at `http://localhost:5173`.

## Environment Variables (Production)

**Backend:**
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `JWT_SECRET` (Must be at least a 256-bit Base64 encoded string)

**Frontend:**
- `VITE_API_BASE_URL` (e.g., `https://api.yourdomain.com`)

## Deployment Instructions

### Backend (Oracle Cloud Free Tier / Render)

**Option 1: Oracle Cloud Free Tier (VM)**
1. Provision a free ARM VM instance (Ubuntu).
2. SSH into the instance and install Java 17 and MySQL.
3. Build the JAR locally: `mvn clean package -DskipTests`
4. Upload `target/attendance-system-0.0.1-SNAPSHOT.jar` to the VM using SCP.
5. Run the app using `nohup java -jar attendance-system-0.0.1-SNAPSHOT.jar > app.log 2>&1 &`.
6. Configure the Oracle Cloud network security list to allow traffic on port `8080`.

**Option 2: Render (Web Service)**
1. Push the code to a GitHub repository.
2. Create a new Web Service on Render, pointing to the repository.
3. Set the Root Directory to `backend`.
4. Build Command: `mvn clean package -DskipTests`
5. Start Command: `java -jar target/attendance-system-0.0.1-SNAPSHOT.jar`
6. Add the required Environment Variables in the Render dashboard.

### Frontend (Vercel)
1. Push the code to a GitHub repository.
2. Log into Vercel and "Add New Project".
3. Import the repository.
4. Set the Framework Preset to `Vite`.
5. Set the Root Directory to `frontend`.
6. Add the `VITE_API_BASE_URL` environment variable pointing to your deployed backend URL.
7. Click Deploy.

## API Documentation (Key Endpoints)

- `POST /api/auth/login`: Authenticate and receive JWT.
- `POST /api/attendance/check-in`: Register daily check-in (requires lat/lng).
- `POST /api/attendance/check-out`: Register check-out and calculate total hours.
- `POST /api/payroll/generate-monthly`: Generate salaries for all active employees.
- `GET /api/dashboard/today-stats`: Get summary of today's attendance.

## License
MIT License
