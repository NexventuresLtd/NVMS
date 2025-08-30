import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Briefcase,
  FolderOpen,
  MessageSquare,
  Megaphone,
  Wallet,
  Users,
  Settings,
  LogOut,
  User,
  BarChart3,
  ChevronLeft,
} from "lucide-react";
import authApi from "../services/authApi";

interface SidebarProps {
  isOpen: boolean;
  isExpanded: boolean;
  isMobile: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  isExpanded,
  isMobile,
  onClose,
  onToggle,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Portfolio Admin", href: "/admin/portfolio", icon: Briefcase },
    { name: "Public Portfolio", href: "/portfolio", icon: FolderOpen },
    { name: "Projects", href: "/projects", icon: BarChart3 },
    { name: "Wallet", href: "/wallet", icon: Wallet, disabled: true },
    {
      name: "Messages",
      href: "/messages",
      icon: MessageSquare,
      disabled: true,
    },
    { name: "Bulletin", href: "/bulletin", icon: Megaphone, disabled: true },
    { name: "Team", href: "/team", icon: Users, disabled: true },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    authApi.logout();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg transform transition-all duration-300 ease-in-out ${
          isMobile
            ? `w-64 ${isOpen ? "translate-x-0" : "-translate-x-full"}`
            : `${isExpanded ? "w-64" : "w-16"} translate-x-0`
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo and Toggle Button */}
          <div className="flex items-center justify-between h-16 px-4 bg-primary-600">
            <Link
              to="/dashboard"
              className={`flex items-center ${
                !isExpanded && !isMobile ? "justify-center w-full" : ""
              }`}
            >
              {isExpanded || isMobile ? (
                <h1 className="text-2xl font-bold text-white">NVMS</h1>
              ) : (
                <h1 className="text-xl font-bold text-white">N</h1>
              )}
            </Link>
            {(isExpanded || isMobile) && (
              <button
                onClick={isMobile ? onClose : onToggle}
                className="p-2 rounded-md text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <span className="sr-only">
                  {isMobile ? "Close" : "Collapse"} sidebar
                </span>
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            {!isExpanded && !isMobile && (
              <button
                onClick={onToggle}
                className="absolute top-4 -right-3 p-1 rounded-full bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-white shadow-md"
              >
                <ChevronLeft className="h-4 w-4 transform rotate-180" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-6 space-y-1 overflow-y-auto overflow-x-hidden">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center ${
                    isExpanded || isMobile
                      ? "px-4 py-3"
                      : "px-2 py-3 justify-center"
                  } text-sm font-medium rounded-lg transition-colors group relative ${
                    item.disabled
                      ? "text-gray-400 cursor-not-allowed"
                      : isActive(item.href)
                      ? "bg-primary-50 text-primary-700 border-r-2 border-primary-500"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  onClick={(e) => {
                    if (item.disabled) {
                      e.preventDefault();
                      return;
                    }
                    if (isMobile) {
                      onClose();
                    }
                  }}
                  title={!isExpanded && !isMobile ? item.name : ""}
                >
                  <Icon
                    className={`h-5 w-5 flex-shrink-0 ${
                      isExpanded || isMobile ? "mr-3" : ""
                    }`}
                  />
                  {(isExpanded || isMobile) && (
                    <>
                      {item.name}
                      {item.disabled && (
                        <span className="ml-auto text-xs text-gray-400">
                          Soon
                        </span>
                      )}
                    </>
                  )}

                  {/* Tooltip for collapsed state */}
                  {!isExpanded && !isMobile && (
                    <div className="absolute left-16 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                      {item.name}
                      {item.disabled && (
                        <span className="ml-1 text-gray-300">(Soon)</span>
                      )}
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div
            className={`border-t border-gray-200 ${
              isExpanded || isMobile ? "p-4" : "p-2"
            }`}
          >
            {isExpanded || isMobile ? (
              <>
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      Admin User
                    </p>
                    <p className="text-xs text-gray-500">
                      admin@nexventures.net
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <button className="flex items-center w-full px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900">
                    <Settings className="h-4 w-4 mr-3" />
                    Settings
                  </button>
                  <button
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-center">
                  <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="space-y-1">
                  <button
                    className="flex items-center justify-center w-full p-2 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 group relative"
                    title="Settings"
                  >
                    <Settings className="h-4 w-4" />
                    <div className="absolute left-12 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                      Settings
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                  </button>
                  <button
                    className="flex items-center justify-center w-full p-2 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 group relative"
                    onClick={handleLogout}
                    title="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                    <div className="absolute left-12 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                      Sign out
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
