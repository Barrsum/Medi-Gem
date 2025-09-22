# MEDI-GEM: AI-Powered Medical Appointment Platform

MEDI-GEM is a modern, feature-rich web application designed to streamline the patient-doctor appointment process. It features a sleek, glassmorphic dark-theme UI and leverages the power of NVIDIA's Nemotron for an AI-powered medical assistant chat. The platform supports distinct roles for Users (Patients), Doctors, and Admins, each with a tailored dashboard and specific permissions.

![MEDI-GEM Demo](/public/image.png)
*(Suggestion: Use a screen recorder like GIPHY Capture or LICEcap to create a GIF showcasing the user login, booking an appointment, and the doctor approving it. Replace the placeholder link above.)*

## ✨ Features

### 👤 For Users (Patients)
*   **Secure Authentication:** Safe and secure signup and login functionality.
*   **AI Medical Assistant:** Chat in real-time with an AI assistant (powered by NVIDIA Nemotron) for general medical queries.
*   **Intuitive Appointment Booking:**
    *   Select from a list of available doctors.
    *   Use an interactive calendar to request an appointment day.
*   **Dynamic Dashboard:** View the real-time status of all appointments (`Pending`, `Approved`, `Rejected`, `Reschedule Proposed`).
*   **Interactive Rescheduling:** Accept or reject new appointment times proposed by the doctor.
*   **Medical Profile Management:** Update personal and medical information (blood group, allergies, past illnesses).
*   **Mock Report Upload:** Simulate uploading medical reports to a cloud service (filenames are stored in Firestore).

### 👨‍⚕️ For Doctors
*   **Role-Specific Dashboard:** A dedicated dashboard showing only appointments assigned to them.
*   **At-a-Glance Stats:** View key metrics like the number of pending requests and appointments scheduled for the day.
*   **Complete Appointment Management:**
    *   **Approve:** Confirm an appointment and assign a specific time.
    *   **Reschedule:** Propose a new date and time with an optional note to the patient.
    *   **Reject:** Decline an appointment request.
*   **Patient Profile Access:** View the detailed medical profile and uploaded report names for any patient with a scheduled appointment.
*   **Doctor Profile Editing:** Set a public display name, specialty, and bio to be visible to patients.

### ⚙️ For Admins
*   **User Management Dashboard:** View a list of all users in the system.
*   **Powerful Role Control:** Dynamically assign or change the role of any user (`user`, `doctor`, `admin`) via a simple dropdown.
*   **System-Wide Profile Access:** Ability to view the medical profile of any user in the system for administrative purposes.

## 🛠️ Tech Stack

*   **Frontend:** [Vite](https://vitejs.dev/), [React](https://reactjs.org/)
*   **Backend as a Service (BaaS):** [Firebase](https://firebase.google.com/)
    *   **Authentication:** Firebase Auth
    *   **Database:** Firestore (NoSQL)
*   **AI Model Proxy Server:** [Node.js](https://nodejs.org/), [Express](https://expressjs.com/)
*   **AI:** [NVIDIA Nemotron](https://developer.nvidia.com/nemotron-3-8b) via NVIDIA API Catalog, [OpenAI SDK](https://www.npmjs.com/package/openai) (for API compatibility)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Routing:** [React Router DOM](https://reactrouter.com/)
*   **UI Components:** [React Day Picker](https://react-day-picker.js.org/), [React Markdown](https://github.com/remarkjs/react-markdown)

## 🚀 Getting Started

Follow these instructions to get a local copy up and running.

### Prerequisites

*   **Node.js & npm:** Make sure you have Node.js (v18 or higher) and npm installed. You can download it [here](https://nodejs.org/).
*   **Firebase Account:** You will need a Google account to create a Firebase project.
*   **NVIDIA API Key:** You need to get an API key for the Nemotron model from the [NVIDIA API Catalog](https://build.nvidia.com/explore/discover). You may need to join a waitlist.

### 1. Firebase Project Setup

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Click **"Add project"** and give it a name (e.g., "medi-gem").
3.  Once the project is created, navigate to the **Project Overview** page. Click the web icon (`</>`) to register a new web app.
4.  Give the app a nickname and click **"Register app"**.
5.  Firebase will provide you with a `firebaseConfig` object. **Copy this object.** We will use it in the environment variables setup.
6.  In the left sidebar, go to **Build > Authentication**. Click **"Get started"** and enable the **Email/Password** provider.
7.  In the left sidebar, go to **Build > Firestore Database**. Click **"Create database"**, start in **Test mode**, and choose a location.
8.  **Crucial Step:** Manually set up the initial user roles.
    *   Go to your Firestore Database and create a collection named `users`.
    *   After you sign up your first few users in the app, their UIDs will appear in the Authentication tab.
    *   Find the document in the `users` collection that corresponds to the user you want to be an **admin**. Edit that document and change the `role` field from `"user"` to `"admin"`.
    *   Do the same for another user to make them a **doctor**.

### 2. Installation & Environment Variables

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/medi-gem.git
    cd medi-gem
    ```

2.  **Frontend Setup:**
    *   Install dependencies:
        ```bash
        npm install
        ```
    *   Create an environment file. In the root `medi-gem` directory, create a file named `.env.local`.
    *   Paste your Firebase config into it, prefixed with `VITE_`:
        ```.env
        VITE_API_KEY="AIzaSy...YOUR_KEY...cqc"
        VITE_AUTH_DOMAIN="med-gem-e7e83.firebaseapp.com"
        VITE_PROJECT_ID="med-gem-e7e83"
        VITE_STORAGE_BUCKET="med-gem-e7e83.appspot.com"
        VITE_MESSAGING_SENDER_ID="963667494364"
        VITE_APP_ID="1:96366...YOUR_ID...b19"
        ```

3.  **Backend AI Server Setup:**
    *   Navigate to the server directory and install dependencies:
        ```bash
        cd server
        npm install
        ```
    *   Create an environment file. In the `server` directory, create a file named `.env`.
    *   Add your NVIDIA API key:
        ```.env
        NVIDIA_API_KEY="nvapi-YOUR_NVIDIA_API_KEY_HERE"
        ```

4.  **Important:** Ensure `.env.local` and `server/.env` are listed in your `.gitignore` file to keep your secrets safe!

### 3. Running the Project

You must run both the frontend and backend servers simultaneously in separate terminal windows.

1.  **Start the Backend AI Server:**
    *   Open a terminal in the `server` directory.
    ```bash
    cd server
    node server.js
    ```
    *   You should see the output: `MEDI-GEM AI server listening on http://localhost:3001`

2.  **Start the Frontend Development Server:**
    *   Open a second terminal in the **root** `medi-gem` directory.
    ```bash
    npm run dev
    ```
    *   Your application should now be running at `http://localhost:5173`.

## 📂 Project Structure

```
medi-gem/
├── server/                 # Node.js/Express AI Proxy Server
│   ├── .env                # Server environment variables (API Key)
│   ├── package.json
│   └── server.js           # The Express server logic
│
├── src/                    # React application source
│   ├── components/         # Reusable React components (Modals, Routes, etc.)
│   ├── context/            # React Context (AuthContext)
│   ├── pages/              # Top-level page components (Dashboards, Login)
│   ├── App.jsx             # Main application component with routing
│   ├── firebase.js         # Firebase initialization
│   └── main.jsx            # Application entry point
│
├── .env.local              # Frontend environment variables (Firebase config)
└── package.json
```

## 🔮 Future Improvements

*   **Doctor Availability:** A system for doctors to set their working hours and block off unavailable dates.
*   **Email Notifications:** Use Firebase Functions to trigger email reminders for upcoming appointments.
*   **Real File Uploads:** Integrate Firebase Storage to handle actual medical report uploads.
*   **Doctor's Calendar View:** Implement a full calendar view on the doctor's dashboard showing all approved appointments.

---