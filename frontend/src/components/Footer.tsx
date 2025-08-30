import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} Nexventures Management System. All
            rights reserved.
          </div>
          <div className="text-sm text-gray-500">
            Built with ❤️ by Nexventures
          </div>
        </div>
      </div>
    </footer>
  );
};
