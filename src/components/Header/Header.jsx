import { CiMenuBurger } from "react-icons/ci";
import { 
  Search, 
  X, 
  Sun, 
  Moon, 
  Bell,
  User
} from "lucide-react";
import demo from "../../assets/images/default-user.png";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../../Context/ContextApt";
import { useTheme } from "../../Context/ThemeContext";

function Header({ onToggleSidebar, onSearch }) {
  const { userData, loading, error } = useUser();
  const { isDark, toggleTheme } = useTheme();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleSearchToggle = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchQuery("");
      onSearch?.("");
    }
  };

  const handleCloseSearch = () => {
    setShowSearch(false);
    setSearchQuery("");
    onSearch?.("");
  };

  return (
    <>
      {/* Mobile Search Overlay */}
      {isMobile && showSearch && (
        <div className="fixed inset-0 bg-background-primary z-[10000] md:hidden transition-all duration-300">
          <div className="flex items-center gap-3 p-4 border-b border-border-primary">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearch}
                autoFocus
                className="w-full pl-10 pr-4 py-3 border border-border-secondary rounded-lg bg-background-primary text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-colors duration-300"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-text-tertiary" />
              </div>
            </div>

            <button
              onClick={handleCloseSearch}
              className="p-2 rounded-lg hover:bg-background-secondary transition-colors duration-300"
              aria-label="Close search"
            >
              <X className="w-5 h-5 text-text-secondary" />
            </button>
          </div>
          
          {/* Search Results/Suggestions can go here */}
          <div className="p-4">
            <p className="text-text-tertiary text-center">
              Type to search...
            </p>
          </div>
        </div>
      )}

      {/* Main Header */}
      <header className="w-full h-16 bg-background-primary border-b border-border-primary flex items-center justify-between px-4 sm:px-6 sticky top-0 z-[9999] transition-colors duration-300">
        
        {/* Left Section - Menu & Title */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="text-2xl p-2 rounded-lg hover:bg-background-secondary transition-colors duration-300 flex-shrink-0"
            aria-label="Toggle Sidebar"
          >
            <CiMenuBurger className="text-text-primary" />
          </button>
          
          <h1 className="text-xl font-semibold tracking-wide text-text-primary hidden sm:block truncate">
            Dashboard
          </h1>

          {/* Mobile Title */}
          <h1 className="text-lg font-semibold text-text-primary sm:hidden truncate">
            Dash
          </h1>
        </div>

        {/* Center Section - Search Bar (Desktop) */}
        {!isMobile && (
          <div className="flex-1 max-w-2xl mx-4 hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-border-secondary rounded-lg bg-background-primary text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-colors duration-300"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-text-tertiary" />
              </div>
            </div>
          </div>
        )}

        {/* Right Section - Actions & User */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Mobile Search Toggle */}
          {isMobile && (
            <button
              onClick={handleSearchToggle}
              className="p-2 rounded-lg hover:bg-background-secondary transition-colors duration-300 md:hidden"
              aria-label="Toggle search"
            >
              <Search className="w-5 h-5 text-text-secondary" />
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-background-secondary transition-colors duration-300"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-accent-warning" />
            ) : (
              <Moon className="w-5 h-5 text-text-secondary" />
            )}
          </button>

          {/* Notifications */}
          <button
            className="p-2 rounded-lg hover:bg-background-secondary transition-colors duration-300 relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-text-secondary" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-danger rounded-full border border-background-primary"></span>
          </button>

          {/* User Profile */}
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-background-tertiary rounded-full animate-pulse"></div>
              <div className="hidden sm:block space-y-1">
                <div className="w-16 h-3 bg-background-tertiary rounded animate-pulse"></div>
                <div className="w-12 h-2 bg-background-tertiary rounded animate-pulse"></div>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:block text-accent-danger text-sm">
                Error
              </div>
              <div className="w-8 h-8 bg-accent-danger/20 rounded-full flex items-center justify-center">
                <span className="text-accent-danger text-sm font-bold">!</span>
              </div>
            </div>
          ) : (
            <Link 
              to="/me" 
              className="flex items-center gap-2 sm:gap-3 hover:bg-background-secondary rounded-lg p-1 transition-colors duration-300 min-w-0"
            >
              <div className="text-right hidden sm:block min-w-0">
                <p className="text-sm font-medium text-text-primary truncate max-w-[120px]">
                  {userData?.user?.name || 'User'}
                </p>
                <p className="text-xs text-text-tertiary truncate max-w-[120px]">
                  {userData?.user?.role || 'Admin'}
                </p>
              </div>
              <div className="relative flex-shrink-0">
                {userData?.user?.photo ? (
                  <img
                    src={userData.user.photo}
                    alt="User Avatar"
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-border-secondary"
                  />
                ) : (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-accent-primary/20 border-2 border-border-secondary flex items-center justify-center">
                    <User className="w-4 h-4 text-accent-primary" />
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-accent-success rounded-full border-2 border-background-primary"></div>
              </div>
            </Link>
          )}
        </div>
      </header>
    </>
  );
}

export default Header;