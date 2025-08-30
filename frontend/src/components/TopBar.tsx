import React from "react";
import { Menu, Bell, Search } from "lucide-react";
import { Input } from "./ui/Input";

interface TopBarProps {
  onMenuClick: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            onClick={onMenuClick}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>

          {/* Search bar */}
          <div className="hidden md:block md:ml-6 md:max-w-xs md:w-full">
            <Input
              type="text"
              placeholder="Search..."
              className="w-full"
              startIcon={<Search className="h-4 w-4 text-gray-400" />}
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg">
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" />
          </button>

          {/* Page title for mobile */}
          <div className="lg:hidden">
            <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
          </div>
        </div>
      </div>
    </header>
  );
};
