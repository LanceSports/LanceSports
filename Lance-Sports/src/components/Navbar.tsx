import { Link,useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Menu, X, AlignLeft } from 'lucide-react';
import { useState } from 'react';
import { NavigationDrawer } from './NavigationDrawer';

interface NavbarProps {
  onLoginClick?: () => void;
  isSignedIn?: boolean;
  onLogout?: () => void;
  userData?: any;
}

export function Navbar({ onLoginClick, isSignedIn = false, onLogout, userData }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
const navigate = useNavigate();
  const navItems = [
    { name: 'All Leagues', to: '/football-leagues' },
    { name: 'Premier League', to: '/premier-league' },
    { name: 'Champions League', to: '/champions-league' },
    { name: 'League Standings', to: '/league-standings' },
    { name: 'Betting Odds', to: '/odds-general' },
    {name: 'Afcon', to: '/afcon'},
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
              <Link to="/">LanceSports</Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.to}
                className="hover:text-white/80 transition-all duration-200 px-3 py-2 rounded-lg hover:bg-white/10"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center space-x-4">
            {isSignedIn ? (
              <>
                {/* User Profile */}
                <div className="flex items-center space-x-3 glass px-3 py-1 rounded-full">
                  {userData?.avatar_url ? (
                    <img
                      src={userData.avatar_url}
                      alt={userData.name || 'User'}
                      className="w-8 h-8 rounded-full border border-white/20"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {(userData?.name || userData?.username || 'U').charAt(0)}
                      </span>
                    </div>
                  )}
                  <span className="text-sm text-white">
                    {userData?.name || userData?.username || 'User'}
                  </span>
                </div>
                <Button
                  onClick={onLogout}
                  variant="outline"
                  className="text-green-600 border-white/30 bg-white/90 hover:bg-white backdrop-blur-sm transition-all duration-200"
                >
                  Logout
                </Button>
              </>
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
                <Link
                  key={item.name}
                  to={item.to}
                  className="hover:text-white/80 transition-all duration-200 px-3 py-2 rounded-lg hover:bg-white/10"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-3 space-y-2">
                {isSignedIn ? (
                  <>
                    {/* Mobile User Profile */}
                    <div className="flex items-center space-x-3 glass px-3 py-2 rounded-lg mb-2">
                      {userData?.avatar_url ? (
                        <img
                          src={userData.avatar_url}
                          alt={userData.name || 'User'}
                          className="w-10 h-10 rounded-full border border-white/20"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {(userData?.name || userData?.username || 'U').charAt(0)}
                          </span>
                        </div>
                      )}
                      <span className="text-sm text-white">
                        {userData?.name || userData?.username || 'User'}
                      </span>
                    </div>
                    <Button
                      onClick={onLogout}
                      variant="outline"
                      className="text-green-300 border-gray-300 bg-gray-100 hover:bg-gray-200 w-full"
                    >
                      Logout
                    </Button>
                  </>
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
