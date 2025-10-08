import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from './ui/drawer';
import { Button } from './ui/button';
import { X, Home, Trophy, Calendar, User, Globe } from 'lucide-react';
import { Link,useNavigate } from 'react-router-dom';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isSignedIn?: boolean;
  onLoginClick?: () => void;
  onLogout?: () => void;
}

export function NavigationDrawer({
  isOpen,
  onClose,
  isSignedIn = false,
  onLoginClick,
  onLogout
}: NavigationDrawerProps) {
  const navItems = [
    { name: 'Home', to: '/', icon: Home },
    { name: 'Premier League', to: '/premier-league', icon: Trophy },
    {name: 'Champions League', to:'/champions-league', icon: Trophy },
    { name: 'Fixtures', to: '/football-leagues', icon: Globe },
  ];

  const handleItemClick = () => {
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose} direction="left">
      <DrawerContent className="glass-dark border-white/20 backdrop-blur-xl">
        <DrawerHeader className="border-b border-white/10 glass-green-dark">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-green-300">
                LanceSports
              </DrawerTitle>
              <DrawerDescription className="text-green-400 text-sm">
                Navigation menu for LanceSports
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-green-400 hover:bg-white/5 transition-all duration-200"
              >
                <X size={20} />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex flex-col p-6 space-y-4">
          {/* Navigation Items */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.to}
                  onClick={handleItemClick}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-green-300 transition-all duration-200 group glass-hover"
                >
                  <IconComponent 
                    size={20} 
                    className="text-green-400 group-hover:text-green-300" 
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="border-t border-white/10 my-4"></div>

          {/* User Section */}
          <div className="space-y-3">
            {isSignedIn && (
              <div className="flex items-center space-x-3 p-3 glass-green-dark rounded-lg glass-glow">
                <User size={20} className="text-green-400" />
                <span className="text-green-300">Welcome back!</span>
              </div>
            )}

            {/* Login/Logout Button */}
            <div className="pt-2">
              {isSignedIn ? (
                <Button 
                  onClick={() => {
                    onLogout?.();
                    onClose();
                  }}
                  variant="outline" 
                  className="w-full text-green-300 border-white/10 glass-dark hover:glass-green-dark transition-all duration-200"
                >
                  Logout
                </Button>
              ) : (
                <Button 
                  onClick={() => {
                    onLoginClick?.();
                    onClose();
                  }}
                  className="w-full glass-green-dark text-white hover:bg-green-700/80 transition-all duration-200 glass-glow"
                >
                  Login
                </Button>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="pt-4 space-y-2">
            <h4 className="text-green-300 mb-3">Quick Links</h4>
            <div className="space-y-2 text-sm">
              <a 
                href="#live-scores" 
                onClick={handleItemClick}
                className="block p-2 text-gray-400 hover:text-green-400 transition-all duration-200 rounded-lg hover:bg-white/10"
              >
                Live Scores
              </a>
              <a 
                href="#news" 
                onClick={handleItemClick}
                className="block p-2 text-gray-400 hover:text-green-400 transition-all duration-200 rounded-lg hover:bg-white/10"
              >
                Sports News
              </a>
              <a 
                href="#standings" 
                onClick={handleItemClick}
                className="block p-2 text-gray-400 hover:text-green-400 transition-all duration-200 rounded-lg hover:bg-white/10"
              >
                League Standings
              </a>
              <a 
                href="#highlights" 
                onClick={handleItemClick}
                className="block p-2 text-gray-400 hover:text-green-400 transition-all duration-200 rounded-lg hover:bg-white/10"
              >
                Match Highlights
              </a>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}