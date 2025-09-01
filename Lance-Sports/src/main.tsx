  import React from 'react';
  import { createRoot } from "react-dom/client";
  import { GoogleOAuthProvider } from '@react-oauth/google';
  import App from "./App.tsx";
  import "./index.css";

  // Get Google Client ID from environment variable or use a placeholder
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
  
  // Debug: Log the client ID to console
  console.log('Google Client ID loaded:', GOOGLE_CLIENT_ID);
  console.log('Environment variable exists:', !!import.meta.env.VITE_GOOGLE_CLIENT_ID);

  createRoot(document.getElementById("root")!).render(
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  );
  