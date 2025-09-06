import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X, Sun, Moon, Monitor, LogOut, Settings } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Avatar } from '../ui/Avatar';
import { useTheme } from './ThemeProvider';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../ui/Toast';
import { cn } from '../../lib/utils';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isUserMenuOpen && !(event.target as Element).closest('.user-menu')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  const navigation = [
    { name: 'Services', href: '/services' },
    { name: 'Products', href: '/products' },
    { name: 'Appointments', href: '/appointments' },
    { name: 'Barbers', href: '/barbers' },
    { name: 'Shop', href: '/shop' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    addToast({
      type: 'success',
      title: 'Logged out successfully',
      description: 'You have been signed out of your account.'
    });
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const themeIcons = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  };

  const ThemeIcon = themeIcons[theme];

  return (
    <header className={cn(
      'sticky top-0 z-40 w-full transition-all duration-300',
      isScrolled 
        ? 'glass shadow-lg' 
        : 'bg-transparent'
    )}>
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="hidden sm:block text-xl font-serif font-bold gradient-text">
                BarberCraft
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-accent',
                  location.pathname === item.href
                    ? 'text-accent'
                    : 'text-muted-foreground'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="h-9 w-9 p-0"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const themes: Theme[] = ['light', 'dark', 'system'];
                const currentIndex = themes.indexOf(theme);
                const nextTheme = themes[(currentIndex + 1) % themes.length];
                setTheme(nextTheme);
              }}
              className="h-9 w-9 p-0"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} theme`}
            >
              <ThemeIcon className="h-4 w-4" />
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/cart')}
              className="relative h-9 w-9 p-0"
              aria-label="Shopping cart (2 items)"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center" aria-hidden="true">
                2
              </span>
            </Button>

            {/* Book Now Button */}
            <Button
              onClick={() => navigate('/booking')}
              className="hidden sm:inline-flex"
            >
              Book Now
            </Button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative user-menu">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="h-9 w-9 p-0"
                >
                  <User className="h-4 w-4" />
                </Button>
                
                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-xl shadow-lg z-50">
                    <div className="p-4 border-b border-border">
                      <p className="text-sm font-medium text-foreground">{user?.username}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user?.role?.toLowerCase()}</p>
                    </div>
                    <div className="p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigate('/profile');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full justify-start"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Profile Settings
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="w-full justify-start text-destructive hover:text-destructive"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
                className="h-9 w-9 p-0"
              >
                <User className="h-4 w-4" />
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden h-9 w-9 p-0"
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="border-t py-4 animate-slide-down">
            <form onSubmit={handleSearch}>
              <Input
                type="search"
                placeholder="Search services, barbers, products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
                autoFocus
              />
            </form>
          </div>
        )}

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4 animate-slide-down">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    'text-base font-medium transition-colors hover:text-accent',
                    location.pathname === item.href
                      ? 'text-accent'
                      : 'text-foreground'
                  )}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t">
                <Button
                  onClick={() => {
                    navigate('/booking');
                    setIsMenuOpen(false);
                  }}
                  className="w-full"
                >
                  Book Appointment
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}