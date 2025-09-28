import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader } from './ui/card';
import { ThemeToggle } from './ThemeToggle';

interface SignInProps {
  onSignIn: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export function SignIn({ onSignIn, isDarkMode = false, onToggleDarkMode }: SignInProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would authenticate the user
    console.log('Sign in attempt:', { username, password });
    onSignIn();
  };

  const handleGoogleSignIn = () => {
    // In a real app, this would handle Google OAuth
    console.log('Google sign in attempt');
    onSignIn();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-green-950 dark:to-gray-900 flex items-center justify-center p-4 transition-colors duration-200">
      {/* Theme Toggle - positioned absolutely in top right */}
      <div className="absolute top-4 right-4">
        <ThemeToggle 
          isDark={isDarkMode} 
          onToggle={onToggleDarkMode || (() => {})}
          className="glass dark:glass-dark hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-200"
        />
      </div>

      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 glass-green dark:glass-green-dark rounded-full mb-4 glass-glow glass-shimmer">
            <span className="text-white text-2xl">L</span>
          </div>
          <h1 className="text-3xl text-green-800 dark:text-green-300 mb-2">LanceSports</h1>
          <p className="text-green-600 dark:text-green-400">Welcome back to the future of sports</p>
        </div>

        {/* Sign In Form */}
        <Card className="glass-card dark:glass-card-dark border-white/20 glass-glow">
          <CardHeader className="space-y-1 pb-4">
            <h2 className="text-2xl text-center text-gray-800 dark:text-gray-100">Sign In</h2>
            <p className="text-center text-gray-600 dark:text-gray-300 text-sm">Enter your credentials to access your account</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-700 dark:text-gray-200">Username:</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="glass dark:glass-dark border-white/20 dark:border-white/10 focus:border-green-500 focus:ring-green-500 transition-all duration-200"
                  placeholder="Enter your username"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-200">Password:</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass dark:glass-dark border-white/20 dark:border-white/10 focus:border-green-500 focus:ring-green-500 transition-all duration-200"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full glass-green dark:glass-green-dark text-white hover:bg-green-600/80 dark:hover:bg-green-700/80 py-2.5 transition-all duration-200 glass-glow"
              >
                Submit
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/20 dark:border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="glass dark:glass-dark px-3 py-1 rounded-full text-gray-500 dark:text-gray-400">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In */}
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full glass dark:glass-dark text-white hover:bg-blue-600/20 dark:hover:bg-blue-700/20 py-2.5 flex items-center justify-center gap-2 border border-blue-500/30 transition-all duration-200"
            >
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
              Sign up with Google
            </Button>

            {/* Additional Links */}
            <div className="text-center space-y-2 pt-2">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Don't have an account?{' '}
                <button className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 underline">
                  Sign up
                </button>
              </p>
              <button className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 underline">
                Forgot your password?
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}