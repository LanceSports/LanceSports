import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  isSignedIn?: boolean;
  onLogout?: () => void;
  userData?: any;
}

export function Navbar({ isSignedIn = false, onLogout, userData }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: 'Football Leagues', to: '/football-leagues' },
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
        <div className="hidden md:flex items-center space-x-4">
          {isSignedIn ? (
            <>
              {/* User Profile */}
              <div className="flex items-center space-x-3 bg-white/10 rounded-full px-4 py-2">
                {userData?.avatar_url ? (
                  <img
                    src={userData.avatar_url}
                    alt={userData.name || userData.username || userData.displayName || 'User'}
                    className="w-8 h-8 rounded-full border-2 border-white/20"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {(userData?.name || userData?.username || userData?.displayName || 'U').charAt(0)}
                    </span>
                  </div>
                )}
                <div className="text-sm">
                  <p className="font-medium text-white">
                    {userData?.name || userData?.username || userData?.displayName || 'User'}
                  </p>
                </div>
              </div>
              <Button
                onClick={onLogout}
                variant="outline"
                className="text-green-600 border-white bg-white hover:bg-green-50"
              >
                Logout
              </Button>
            </>
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
                <>
                  {/* Mobile User Profile */}
                  <div className="flex items-center space-x-3 bg-white/10 rounded-lg px-3 py-2 mb-3">
                    {userData?.avatar_url ? (
                      <img
                        src={userData.avatar_url}
                        alt={userData.name || userData.username || userData.displayName || 'User'}
                        className="w-10 h-10 rounded-full border-2 border-white/20"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                              <span className="text-white text-sm font-medium">
                        {(userData?.name || userData?.username || userData?.displayName || 'U').charAt(0)}
                      </span>
                      </div>
                    )}
                    <div className="text-sm">
                      <p className="font-medium text-white">
                        {userData?.name || userData?.username || userData?.displayName || 'User'}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={onLogout}
                    variant="outline"
                    className="text-green-600 border-white bg-white hover:bg-green-50 w-full"
                  >
                    Logout
                  </Button>
                </>
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