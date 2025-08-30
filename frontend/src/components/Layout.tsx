import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { Footer } from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true); // Controls mobile visibility
  const [sidebarExpanded, setSidebarExpanded] = useState(true); // Controls desktop expanded/collapsed
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false); // Close sidebar on mobile by default
      } else {
        setSidebarOpen(true); // Always visible on desktop
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarExpanded(false);
    }
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarExpanded(!sidebarExpanded);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        isExpanded={sidebarExpanded}
        isMobile={isMobile}
        onClose={closeSidebar}
        onToggle={toggleSidebar}
      />
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          isMobile ? "" : sidebarExpanded ? "lg:pl-64" : "lg:pl-16"
        }`}
      >
        <TopBar onMenuClick={toggleSidebar} />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
};
