import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext"; // Adjust path as needed

const TopNav = ({ Maintitle, title, buttonTitle, navLinks, onSearch }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 px-4 sm:px-6 py-4 rounded-md shadow-sm bg-white dark:bg-gray-800 transition-colors duration-300">
      
      {/* Left Side - Title and Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full lg:w-auto">
        <div className="flex items-center gap-3">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            {Maintitle}
          </h1>
          <div className="h-6 border-l border-gray-300 dark:border-gray-600 hidden sm:block"></div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 flex-wrap gap-1">
          {navLinks.map((link, index) => (
            <div key={index} className="flex items-center gap-1">
              {link.path === "/" ? (
                <Link
                  to={link.path}
                  className="hover:text-gray-800 dark:hover:text-gray-200 transition flex items-center gap-1"
                >
                  <HomeIcon />
                  <span className="hidden xs:inline"> - </span>
                </Link>
              ) : (
                <Link
                  to={link.path}
                  className="hover:text-gray-800 dark:hover:text-gray-200 transition"
                >
                  {link.label} -
                </Link>
              )}
            </div>
          ))}
          <span className="text-gray-700 dark:text-gray-300 font-medium">
            {title}
          </span>
        </div>
      </div>

      {/* Right Side - Search, Theme Toggle, and Button */}
      <div className="flex items-center gap-3 w-full lg:w-auto">
        {/* Search Bar */}
        <div className="flex-1 lg:flex-none">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              onChange={(e) => onSearch?.(e.target.value)}
              className="w-full lg:w-64 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors duration-300"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300 flex-shrink-0"
          aria-label="Toggle theme"
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>

        {/* Action Button */}
        {typeof buttonTitle === "string" && (
          <button className="flex items-center gap-2 bg-violet-600 text-white font-semibold text-sm px-3 py-2 sm:px-4 sm:py-2 rounded-md hover:bg-violet-700 transition-colors duration-300 whitespace-nowrap flex-shrink-0">
            <PlusIcon />
            <span className="hidden sm:inline">{buttonTitle}</span>
          </button>
        )}
      </div>
    </div>
  );
};

// Icon Components
const HomeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4 text-gray-500 dark:text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4"
    />
  </svg>
);

const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const SearchIcon = () => (
  <svg
    className="h-5 w-5 text-gray-400 dark:text-gray-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const SunIcon = () => (
  <svg
    className="w-5 h-5 text-yellow-500"
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path
      fillRule="evenodd"
      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
      clipRule="evenodd"
    />
  </svg>
);

const MoonIcon = () => (
  <svg
    className="w-5 h-5 text-gray-700 dark:text-gray-300"
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
  </svg>
);

export default TopNav;