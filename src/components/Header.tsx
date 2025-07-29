import React from "react";
import { Menu, Search, Bell } from "lucide-react";

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 sm:px-6">
      <div className="flex items-center flex-1">
        <button
          type="button"
          className="text-gray-500 focus:outline-none md:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="ml-2 md:ml-0">
          <h1 className="text-lg font-semibold text-gray-900">
            Mini Market POS
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        {/* <div className="relative hidden md:block">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="py-2 pl-10 pr-3 text-sm bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-60"
            placeholder="Search products, transactions..."
          />
        </div> */}

        {/* <button className="relative p-1 text-gray-500 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <Bell className="w-6 h-6" />
          <span className="absolute top-0 right-0 block w-2 h-2 bg-red-500 rounded-full"></span>
        </button> */}

        <button className="flex items-center text-sm focus:outline-none">
          <img
            className="w-8 h-8 rounded-full"
            src="https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=80"
            alt="User"
          />
        </button>
      </div>
    </header>
  );
};

export default Header;
