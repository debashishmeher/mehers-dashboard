import { NavLink } from "react-router-dom";
import { useState } from "react";
import { RiCoupon2Fill } from "react-icons/ri";
import { FaAddressCard, FaHandshake, FaStar, FaWhatsapp } from "react-icons/fa";
import { IoHomeOutline } from "react-icons/io5";
import { FiChevronDown } from "react-icons/fi";
import Cookies from 'js-cookie';
import { useUser } from "../../Context/ContextApt";
import { MdOutlinePermMedia } from "react-icons/md";
import { IoIosFlash } from "react-icons/io";
import { FerrisWheel } from "lucide-react";
import "./Sidebar.css"

function Sidebar({ onToggleSidebar }) {
  const [openMenu, setOpenMenu] = useState(null);

  const menuItems = [
    { to: "/", icon: <IoHomeOutline />, label: "Home" },
    {
      to: "/whatsapp",
      icon: <FaWhatsapp />,
      label: "WhatsApp",
      subItems: [
        { to: "/whatsapp/registration", label: "Registration Info" },
        { to: "/whatsapp/templates", label: "Templates" },
      ]
    },
  ].filter(Boolean);

  const toggleHandler = () => {
    if (window.innerWidth < 750) {
      onToggleSidebar();
    }
  };

  const handleMenuClick = (item, e) => {
    if (item.subItems) {
      e.preventDefault();
      setOpenMenu(openMenu === item.to ? null : item.to);
      return;
    }
    toggleHandler();
  };

  const handleLogout = async () => {
    Cookies.remove('authToken');
    window.location.href = "/login";
  };

  return (
    <aside
      className="sticky top-0 w-64 bg-background-primary border-r border-border-primary flex flex-col shadow-sm transition-colors duration-300"
      style={{ height: 'calc(100vh - 4rem)' }}
    >
      <nav className="flex-1 px-3 py-4 overflow-y-auto navbar">

        <div className="flex flex-col gap-1.5 sidebar-scrollbar">
          {menuItems.map((item) => (
            <div key={item.to} className="flex flex-col group">
              <NavLink
                to={item.to}
                onClick={(e) => handleMenuClick(item, e)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ease-out ${isActive
                    ? "bg-gradient-to-r from-accent-primary/10 to-accent-primary/20 text-accent-primary shadow-sm"
                    : "text-text-secondary hover:bg-background-secondary hover:text-text-primary"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <span className={`text-lg p-1 rounded-md transition-all ${isActive
                        ? "text-accent-primary bg-accent-primary/10"
                        : "text-text-tertiary group-hover:bg-background-tertiary"
                        }`}>
                        {item.icon}
                      </span>
                      <span className="relative">
                        {item.label}
                      </span>
                    </div>

                    {item.subItems && (
                      <FiChevronDown
                        className={`transform transition-transform duration-200 ${openMenu === item.to
                          ? "rotate-180 text-accent-primary"
                          : "text-text-tertiary group-hover:text-text-secondary"
                          }`}
                        size={18}
                      />
                    )}
                  </>
                )}
              </NavLink>

              {item.subItems && openMenu === item.to && (
                <div className="ml-10 mt-1 mb-2 flex flex-col gap-1 animate-fadeIn">
                  {item.subItems.map((sub) => (
                    <NavLink
                      key={sub.to}
                      to={sub.to}
                      onClick={toggleHandler}
                      className={({ isActive }) =>
                        `text-sm px-3 py-1.5 rounded-lg transition-all duration-150 ${isActive
                          ? "bg-accent-primary/10 text-accent-primary font-medium pl-4 border-l-2 border-accent-primary"
                          : "text-text-tertiary hover:bg-background-secondary hover:pl-4 hover:border-l-2 hover:border-border-secondary"
                        }`
                      }
                    >
                      {sub.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-border-primary">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-accent-danger/10 hover:bg-accent-danger/20 text-accent-danger px-4 py-2 rounded-md transition-all duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1"
            />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;