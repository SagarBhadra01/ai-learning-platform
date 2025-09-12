<div align="center">
  <br />
  <h1>
    <b>
      LearnSphere: AI Learning Platform
    </b>
  </h1>
  <p>
    A full-stack, AI-powered web application for generating and consuming educational courses.
  </p>
</div>

---

## 🚀 About The Project

LearnSphere is a modern learning platform where users can generate complete, structured courses on any topic using AI. The application features a React-based frontend for a dynamic user experience and a robust Node.js/Express backend to handle course generation, user data, and gamification elements like XP and streaks.

### ✨ Features

*   **AI Course Generation:** Dynamically create comprehensive courses on any topic with specified difficulty levels.
*   **Secure User Authentication:** Managed by Clerk for robust and easy-to-implement user sign-up, sign-in, and profile management.
*   **Interactive Learning:** Courses include structured chapters, lessons with rich HTML content, and quizzes to test knowledge.
*   **Gamified Experience:** Earn XP, level up, maintain daily streaks, and compete on a global leaderboard.
*   **RESTful API:** A well-defined backend API to manage courses, user progress, and AI interactions.
*   **Modern Tech Stack:** Built with React, Vite, and Tailwind CSS on the frontend, and Node.js, Express, and MongoDB on the backend.

## 🛠️ Built With

This project is a full-stack application composed of a frontend and a backend.

### Frontend

*   [React](https://reactjs.org/)
*   [Vite](https://vitejs.dev/)
*   [TypeScript](https://www.typescriptlang.org/)
*   [Tailwind CSS](https://tailwindcss.com/)
*   [Clerk](https://clerk.com/) for Authentication
*   [Axios](https://axios-http.com/)
*   [Lucide React](https://lucide.dev/) for icons

### Backend

*   [Node.js](https://nodejs.org/)
*   [Express](https://expressjs.com/)
*   [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
*   [Google Gemini API](https://ai.google.dev/) for AI content generation
*   [dotenv](https://www.npmjs.com/package/dotenv) for environment variables
*   [CORS](https://www.npmjs.com/package/cors)

## 🏁 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have Node.js and npm installed on your machine.
*   [Node.js](https://nodejs.org/) (v18.x or later recommended)
*   [MongoDB](https://www.mongodb.com/try/download/community) instance (local or cloud-based like MongoDB Atlas)

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/SagarBhadra01/ai-learning-platform.git
    cd ai-learning-platform
    ```

2.  **Setup the Backend:**
    ```sh
    cd backend
    npm install
    ```
    Create a `.env` file in the `backend` directory and add your environment variables:
    ```env
    PORT=5001
    MONGO_URI=your_mongodb_connection_string
    GEMINI_API_KEY=your_google_gemini_api_key
    # Add Clerk API keys
    CLERK_SECRET_KEY=your_clerk_secret_key
    ```

3.  **Setup the Frontend:**
    ```sh
    cd ../frontend
    npm install
    ```
    Create a `.env.local` file in the `frontend` directory and add your Clerk and Gemini API keys:
    ```env
    VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
    VITE_GEMINI_API_KEY=your_frontend_gemini_api_key
    ```

### Running the Application

1.  **Start the Backend Server:**
    From the `backend` directory, run:
    ```sh
    npm run dev
    ```
    The server will start, typically on `http://localhost:5001`.

2.  **Start the Frontend Development Server:**.
    From the `frontend` directory, run:
    ```sh
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## 📂 Project Structure

```
ai-learning-platform/
├── backend/         # Node.js, Express, MongoDB API
│   ├── models/
│   ├── node_modules/
│   ├── .env
│   ├── package.json
│   └── server.js
└── frontend/        # React, Vite, TypeScript UI
    ├── public/
    ├── src/
    ├── .env.local
    ├── index.html
    ├── package.json
    └── vite.config.ts
```
