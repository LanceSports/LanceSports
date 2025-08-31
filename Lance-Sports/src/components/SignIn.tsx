import React from 'react';
import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';

interface SignInProps {
  onSignIn: (userData?: any) => void;
}

export function SignIn({ onSignIn }: SignInProps) {
  const [isLoading, setIsLoading] = useState(false);

  const login = useGoogleLogin({
    onSuccess: async (response) => {
      setIsLoading(true);
      try {
        console.log('Google OAuth successful:', response);
        
        // Get user info from Google
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${response.access_token}`,
          },
        }).then((res) => res.json());
        
        console.log('User info:', userInfo);
        
        // Call the onSignIn callback with user data
        onSignIn(userInfo);
      } catch (error) {
        console.error('Failed to get user info:', error);
        onSignIn(); // Fallback to basic sign in
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google OAuth failed:', error);
      setIsLoading(false);
    },
  });

  const handleGoogleSignIn = () => {
    login();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600 rounded-full mb-4">
            <span className="text-white text-2xl">L</span>
          </div>
          <h1 className="text-3xl text-green-800 mb-2">LanceSports</h1>
          <p className="text-green-600">Welcome back to the future of sports</p>
        </div>

        {/* Sign In Form */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <h2 className="text-2xl text-center text-gray-800">Welcome to LanceSports</h2>
            <p className="text-center text-gray-600 text-sm">Sign in with your Google account to get started</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Google Sign In */}
            <div className="text-center space-y-4">
              <p className="text-gray-600 text-sm">
                Sign in with your Google account to access LanceSports
              </p>
              
              <Button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 flex items-center justify-center gap-3 text-base font-medium"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </>
                )}
              </Button>
            </div>

            {/* Privacy Notice */}
            <div className="text-center pt-4">
              <p className="text-xs text-gray-500">
                By signing in, you agree to our{' '}
                <button className="text-green-600 hover:text-green-700 underline">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button className="text-green-600 hover:text-green-700 underline">
                  Privacy Policy
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}