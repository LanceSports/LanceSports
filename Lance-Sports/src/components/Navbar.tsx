import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  isSignedIn?: boolean;
  onLogout?: () => void;
}

export function Navbar({ isSignedIn = false, onLogout }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: 'Premier League', to: '/premier-league' },
    { name: 'PSL', to: '#psl' }, // Update these later if needed
    { name: 'Rugby', to: '#rugby' },
    { name: 'Cricket', to: '#cricket' },
  ];

  return (
    <nav className="bg-green-600 text-white px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        <div className="text-xl font-semibold"><a href="/">LanceSports</a></div>
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.to}
              className="hover:text-green-200 transition-colors duration-200"
            >
              {item.name}
            </Link>
          ))}
        </div>
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
            <Link
              to="/signin"
              className="text-green-600 border-white bg-white hover:bg-green-50 px-4 py-2 rounded"
            >
              Login
            </Link>
          )}
        </div>
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
      {isMenuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-green-500">
          <div className="flex flex-col space-y-3 pt-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.to}
                className="hover:text-green-200 transition-colors duration-200 px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
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
                <Link
                  to="/signin"
                  className="text-green-600 border-white bg-white hover:bg-green-50 px-4 py-2 rounded w-full text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}