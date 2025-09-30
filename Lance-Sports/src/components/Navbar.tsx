import { useState } from 'react';
import { Button } from './ui/button';
import { Menu, X, AlignLeft } from 'lucide-react';
import { NavigationDrawer } from './NavigationDrawer';

interface NavbarProps {
  onLoginClick?: () => void;
  isSignedIn?: boolean;
  onLogout?: () => void;
}

export function Navbar({ onLoginClick, isSignedIn = false, onLogout }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navItems = [
    { name: 'Football Leagues', to: '/football-leagues' },
    { name: 'PSL', to: '#psl' }, // Update these later if needed
    { name: 'Rugby', to: '#rugby' },
    { name: 'Cricket', to: '#cricket' },
  ];

  return (
    <>
      <nav className="glass-green-dark text-white px-4 py-3 transition-all duration-200 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Drawer Toggle Button & Logo */}
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDrawerOpen(true)}
              className="text-white hover:bg-white/10 transition-all duration-200"
            >
              <AlignLeft size={20} />
            </Button>
            <div className="text-xl font-semibold">
              LanceSports
            </div>
          </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.to}
              className="hover:text-white/80 transition-all duration-200 px-3 py-2 rounded-lg hover:bg-white/10"
            >
              {item.name}
            </a>
          ))}
        </div>

        {/* Desktop Controls */}
        <div className="hidden md:flex items-center space-x-2">
          {isSignedIn ? (
            <Button 
              onClick={onLogout}
              variant="outline" 
              className="text-green-600 border-white/30 bg-white/90 hover:bg-white backdrop-blur-sm transition-all duration-200"
            >
              Logout
            </Button>
          ) : (
            <Button 
              onClick={onLoginClick}
              variant="outline" 
              className="text-green-600 border-white/30 bg-white/90 hover:bg-white backdrop-blur-sm transition-all duration-200"
            >
              Login
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white hover:bg-white/10 transition-all duration-200"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-white/20 glass-dark rounded-b-lg">
          <div className="flex flex-col space-y-3 pt-4">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.to}
                className="hover:text-white/80 transition-all duration-200 px-3 py-2 rounded-lg hover:bg-white/10"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
            <div className="pt-2 space-y-2">
              {isSignedIn ? (
                <Button 
                  onClick={onLogout}
                  variant="outline" 
                  className="text-green-300 border-gray-300 bg-gray-100 hover:bg-gray-200 w-full"
                >
                  Logout
                </Button>
              ) : (
                <Button 
                  onClick={onLoginClick}
                  variant="outline" 
                  className="text-green-300 border-gray-300 bg-gray-100 hover:bg-gray-200 w-full"
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      </nav>

      {/* Navigation Drawer */}
      <NavigationDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        isSignedIn={isSignedIn}
        onLoginClick={onLoginClick}
        onLogout={onLogout}
      />
    </>
  );
}