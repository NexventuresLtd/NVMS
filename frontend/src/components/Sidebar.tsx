import React from "react";
import { Link, useLocation } from "react-router-dom";
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
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Portfolio Admin", href: "/admin/portfolio", icon: Briefcase },
    { name: "Public Portfolio", href: "/portfolio", icon: FolderOpen },
    { name: "Projects", href: "/projects", icon: BarChart3, disabled: true },
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

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-primary-600">
            <Link to="/dashboard" className="flex items-center">
              <h1 className="text-2xl font-bold text-white">NVMS</h1>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
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
                    onClose();
                  }}
                >
                  <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                  {item.name}
                  {item.disabled && (
                    <span className="ml-auto text-xs text-gray-400">Soon</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">admin@nexventures.net</p>
              </div>
            </div>

            <div className="space-y-1">
              <button className="flex items-center w-full px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900">
                <Settings className="h-4 w-4 mr-3" />
                Settings
              </button>
              <button className="flex items-center w-full px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900">
                <LogOut className="h-4 w-4 mr-3" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
