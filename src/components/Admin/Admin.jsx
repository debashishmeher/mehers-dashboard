import React, { useState, useEffect } from "react";
import "./Admin.css"
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
import { Outlet } from "react-router";

function Admin({user}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 750);

  // Toggle function for sidebar
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  // Set sidebar visibility based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 750) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize); // Attach listener

    return () => window.removeEventListener("resize", handleResize); // Cleanup
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header onToggleSidebar={toggleSidebar} />

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`sidebar  relative z-[99999] border-r border-gray-200 bg-white transition-all duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={toggleSidebar}
            user={user}
          />
        </aside>

        {/* Content area */}
        <main className={`flex-1 overflow-y-auto transition-all duration-300 ${isSidebarOpen ? "ml-[250px]" : "ml-0"}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Admin;