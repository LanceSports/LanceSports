import React from 'react';
import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { supabase } from '../lib/supabase';

interface SignInProps {
  onSignIn: (userData?: any, redirectTo?: string) => void;
}

export function SignIn({ onSignIn }: SignInProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Test Supabase connection on component mount
  React.useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.from('users').select('count').limit(1);
        if (error) {
          console.error('❌ Supabase connection test failed:', error);
        } else {
          console.log('✅ Supabase connection test successful');
        }
      } catch (err) {
        console.error('❌ Supabase connection error:', err);
      }
    };
    
    testConnection();
  }, []);

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
        console.log('User info structure:', {
          name: userInfo.name,
          username: userInfo.username,
          displayName: userInfo.displayName,
          email: userInfo.email,
          sub: userInfo.sub,
          picture: userInfo.picture
        });
        
        // For now, let's use a simpler approach without Supabase OAuth
        // We'll just use the Google user info directly
        console.log('✅ Using Google user info directly');
        
        // Create a simple user object with the data we need
        const userData = {
          id: userInfo.sub, // Use Google ID as unique identifier
          google_id: userInfo.sub,
          name: userInfo.name,
          username: userInfo.name,
          email: userInfo.email,
          avatar_url: userInfo.picture,
          picture: userInfo.picture,
          displayName: userInfo.name
        };
        
        // Try to save to Supabase users table (optional)
        try {
          const { data, error } = await supabase
            .from('users')
            .upsert({
              id: userInfo.sub, // Use Google ID
              google_id: userInfo.sub,
              username: userInfo.name,
              email: userInfo.email,
              avatar_url: userInfo.picture,
              last_sign_in: new Date().toISOString(),
            }, {
              onConflict: 'id' // Use Google ID as conflict key
            });
          
          if (error) {
            console.error('Error saving user to users table:', error);
          } else {
            console.log('✅ User data saved to users table:', data);
          }
        } catch (dbError) {
          console.error('❌ Database error:', dbError);
        }
        
        setIsSuccess(true);
        // Show success message briefly before redirecting
        setTimeout(() => {
          onSignIn(userData, '/');
        }, 1500);
      } catch (error) {
        console.error('Failed to authenticate:', error);
        // Create a basic user object even if there's an error
        const fallbackUserData = {
          id: 'fallback',
          name: 'User',
          email: 'user@example.com',
          avatar_url: null
        };
        onSignIn(fallbackUserData, '/premier-league');
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google OAuth failed:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-green-700 rounded-full mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">L</span>
          </div>
          <h1 className="text-4xl font-bold text-green-800 mb-2">LanceSports</h1>
          <p className="text-green-600 text-lg">The future of sports broadcasting</p>
        </div>

        {/* Sign In Form */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="space-y-3 pb-6">
            <h2 className="text-2xl font-bold text-center text-gray-800">Join LanceSports</h2>
            <p className="text-center text-gray-600">Get started with live sports, match management, and more</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Google Sign In */}
            <div className="text-center space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-blue-800 text-sm font-medium mb-2">
                  🚀 Quick & Secure Access
                </p>
                <p className="text-blue-700 text-xs">
                  One-click sign-in with your Google account. No passwords to remember.
                </p>
              </div>
              
              <Button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading || isSuccess}
                className={`w-full py-4 flex items-center justify-center gap-3 text-base font-semibold transition-all duration-200 ${
                  isSuccess 
                    ? 'bg-green-500 text-white cursor-default' 
                    : isLoading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
                }`}
              >
                                 {isSuccess ? (
                   <>
                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                       <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                     </svg>
                     Redirecting to Premier League...
                   </>
                 ) : isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-blue-600">Setting up your account...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </>
                )}
              </Button>
            </div>

            {/* Features Preview */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 text-sm font-medium mb-3">What you'll get access to:</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Live match management
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Real-time scores
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Sports slideshow
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Event timeline
                </div>
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="text-center pt-2">
              <p className="text-xs text-gray-500">
                By continuing, you agree to our{' '}
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