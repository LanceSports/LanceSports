# LanceSports - Sports Broadcasting Platform

A comprehensive sports broadcasting and live match management application built with React, TypeScript, and Vite.

## Features

- 🏈 Live match management with real-time score tracking
- 📊 Event logging and timeline management
- 🎥 Sports slideshow with upcoming events
- 🔐 Google OAuth authentication
- 📱 Responsive design for all devices

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure Google OAuth:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Go to Credentials > Create Credentials > OAuth 2.0 Client ID
   - Set authorized JavaScript origins to `http://localhost:3000`
   - Copy your Client ID

3. **Set up environment variables:**
   Create a `.env` file in the root directory:

   ```
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## Usage

- Visit `http://localhost:3000` to see the landing page
- Click "Login" to sign in with Google
- Navigate to "Premier League" for live match management
- Use the match setup and live overlay features

## Tech Stack

- React 18 + TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Radix UI for components
- Google OAuth for authentication
