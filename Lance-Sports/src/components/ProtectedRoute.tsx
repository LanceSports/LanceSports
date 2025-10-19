import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from './hooks/useSession';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isSignedIn } = useSession();
  const location = useLocation();

  // Check both the hook state and localStorage as a fallback
  const localStorageSignedIn = localStorage.getItem('lancesports_signed_in') === 'true';
  const isAuthenticated = isSignedIn || localStorageSignedIn;

  // Debug logging
  console.log('🔒 ProtectedRoute check:', {
    isSignedIn,
    localStorageSignedIn,
    isAuthenticated,
    pathname: location.pathname
  });

  if (!isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to signin');
    // Redirect to signin page with the current location as state
    // so we can redirect back after successful login
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  console.log('✅ Authenticated, allowing access');
  return <>{children}</>;
}
