import { useState } from 'react';
import { Button } from './ui/button';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  onLoginClick?: () => void;
  isSignedIn?: boolean;
  onLogout?: () => void;
}

export function Navbar({ onLoginClick, isSignedIn = false, onLogout }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: 'Premier League', href: '#premier-league' },
    { name: 'PSL', href: '#psl' },
    { name: 'Rugby', href: '#rugby' },
    { name: 'Cricket', href: '#cricket' }
  ];

  return (
    <nav className="bg-green-600 text-white px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="text-xl font-semibold">
          LanceSports
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            // puts each nav item in a link structure 
            <a
              key={item.name}
              href={item.href}
              className="hover:text-green-200 transition-colors duration-200"
            >
              {item.name}
            </a>
          ))}
        </div>

        {/* Desktop Auth Button */}
        <div className="hidden md:block">
          {isSignedIn ? (
            <Button 
              onClick={onLogout}
              variant="outline" 
              className="text-green-600 border-white bg-white hover:bg-green-50"
            >
              Logout
            </Button>
          ) : (
            <Button 
              onClick={onLoginClick}
              variant="outline" 
              className="text-green-600 border-white bg-white hover:bg-green-50"
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
            className="text-white hover:bg-green-700"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-green-500">
          <div className="flex flex-col space-y-3 pt-4">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="hover:text-green-200 transition-colors duration-200 px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
            <div className="pt-2">
              {isSignedIn ? (
                <Button 
                  onClick={onLogout}
                  variant="outline" 
                  className="text-green-600 border-white bg-white hover:bg-green-50 w-full"
                >
                  Logout
                </Button>
              ) : (
                <Button 
                  onClick={onLoginClick}
                  variant="outline" 
                  className="text-green-600 border-white bg-white hover:bg-green-50 w-full"
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}