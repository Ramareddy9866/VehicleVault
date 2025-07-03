# VehicleVault

VehicleVault is a full‑stack web app for managing vehicle maintenance. Users can register securely, add and monitor multiple vehicles, log service histories, set automated reminders with email alerts, and find nearby service centers via an interactive map—plus save favorites. The platform features a modern, responsive Material‑UI interface.

---

## Features

- User authentication (register, login, password reset)
- Manage vehicles and service records
- Set and receive service reminders
- Find and mark preferred nearby service centers (with map)
- Responsive, modern UI (Material-UI)
- Email notifications for reminders and password resets

---

## Project Structure

```
VehicleVault/
  ├── Backend/      # Node.js/Express backend API
  └── Frontend/     # React frontend (Create React App)
```

---

## Prerequisites

- Node.js (v16+ recommended)
- npm (v8+ recommended)
- MongoDB (local or cloud, e.g., MongoDB Atlas)

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd VehicleVault
```

---

### 2. Backend Setup

```bash
cd Backend
npm install
```

#### Environment Variables

Create a `.env` file in the `Backend/` directory with the following (example):

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password_or_app_password
FRONTEND_URL=http://localhost:3000
```

#### Start the Backend Server

```bash
npm run dev
```

The backend will run on [http://localhost:5000](http://localhost:5000) by default.

---

### 3. Frontend Setup

```bash
cd ../Frontend
npm install
```

#### Environment Variables

Create a `.env` file in the `Frontend/` directory with the following (example):

```
REACT_APP_API_URL=http://localhost:5000
```

#### Start the Frontend

```bash
npm start
```

The frontend will run on [http://localhost:3000](http://localhost:3000) by default.

---

## Usage

- Register a new user or log in.
- Add your vehicles and service records.
- Set reminders and receive email notifications.
- Find nearby service centers using the map and mark your preferred center.

---

## Tech Stack

- **Frontend:** React, Material-UI, React Router, Axios, Leaflet (maps)
- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT, Nodemailer
- **Other:** Email notifications, cron jobs for reminders

---
