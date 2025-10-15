  import { createRoot } from "react-dom/client";
  import App from "./components/App";
  import IntroPage from "./components/index";
  import "./index.css"; 
  import { GoogleOAuthProvider } from "@react-oauth/google";

  createRoot(document.getElementById("root")!).render( <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          <IntroPage />
        </GoogleOAuthProvider>);
  