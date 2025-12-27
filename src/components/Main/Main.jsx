import React, { useState, useEffect } from "react";
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
import { Outlet } from "react-router";

function Main({ user }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 750);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 750);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <div className="min-h-screen flex flex-col bg-background-primary text-text-primary transition-colors duration-300">
      {/* Header */}
      <Header onToggleSidebar={toggleSidebar} />

      {/* Main layout */}
      <div className="relative overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`sidebar fixed z-50 border-r border-border-primary bg-background-primary transition-all duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={toggleSidebar}
            user={user}
          />
        </aside>

        {/* Content area */}
        <main className={`flex-1 overflow-y-auto pt-4 px-4 md:px-6 transition-all duration-300  bg-background-primary text-text-primary ${isSidebarOpen ? "xl:ml-64" : "xl:ml-0"
          }`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Main;