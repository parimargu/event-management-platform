# Event Management Platform

## Project Structure

The project is divided into two main applications:

- **Backend**: Python FastAPI application.
- **Frontend**: React application (Vite).

### Directory Structure

```
event_management_platform_1/
├── backend/
│   ├── app/
│   │   ├── api/          # API endpoints (Auth, Users, Events, Registrations)
│   │   ├── core/         # Core configuration (Database, Security)
│   │   ├── models/       # Database models (User, Event, Registration)
│   │   └── main.py       # Application entry point
│   ├── requirements.txt  # Python dependencies
│   ├── run.py            # Script to run the server
│   └── seed_admin.py     # Script to create an Admin user
├── frontend/
│   ├── src/
│   │   ├── api/          # Axios client configuration
│   │   ├── context/      # Auth context provider
│   │   ├── pages/        # React pages (Login, Register, Dashboard, EventCreate)
│   │   ├── App.jsx       # Main component with Routing
│   │   └── main.jsx      # Entry point
│   ├── package.json      # Node dependencies
│   └── vite.config.js    # Vite configuration
└── README.md
```

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 18+

### Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Create a virtual environment (optional but recommended):
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Run the server:
    ```bash
    python run.py
    ```
    The API will be available at `http://localhost:8000`.
    Swagger UI documentation: `http://localhost:8000/docs`.

### Frontend Setup

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

## Integration

The Frontend application is pre-configured to communicate with the Backend API running at `http://localhost:8000/api/v1`.
- **API Client**: `frontend/src/api/axios.js` handles the base URL and JWT token injection.
- **CORS**: The Backend is configured to accept requests from `http://localhost:5173` and `http://localhost:3000`.

## User Roles & Admin Creation

The platform supports three roles:
1.  **Admin**: Full access, approves managers.
2.  **Event Manager**: Creates events (requires approval).
3.  **Regular User**: Registers for events.

### Creating an Admin User

To create an initial Admin user, run the provided seed script from the `backend` directory:

```bash
python seed_admin.py
```

This will create an admin user with the following credentials:
- **Email**: `admin@example.com`
- **Password**: `admin123`

### Using the Admin Role

1.  **Login**: Go to the frontend login page and sign in with the admin credentials.
2.  **Dashboard**: The Admin dashboard will show a list of "Pending Manager Approvals".
3.  **Approve Managers**: When a user registers with the "Event Manager" role, they will appear in this list. Click "Approve" to grant them event creation privileges.

### Creating Other Users

- **Regular User**: Sign up via the "Register" page. Select "Regular User".
- **Event Manager**: Sign up via the "Register" page. Select "Event Manager". You will need to wait for an Admin to approve your account before you can create events.
