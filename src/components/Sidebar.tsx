import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, Package, Tag, ShoppingCart, BarChart2, 
  Truck, Clock, Settings, X 
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home className="w-5 h-5" /> },
    { name: 'Products', path: '/products', icon: <Package className="w-5 h-5" /> },
    { name: 'Categories', path: '/categories', icon: <Tag className="w-5 h-5" /> },
    { name: 'Sales', path: '/sales', icon: <ShoppingCart className="w-5 h-5" /> },
    { name: 'Inventory', path: '/inventory', icon: <BarChart2 className="w-5 h-5" /> },
    { name: 'Suppliers', path: '/suppliers', icon: <Truck className="w-5 h-5" /> },
    { name: 'Transactions', path: '/transactions', icon: <Clock className="w-5 h-5" /> },
    { name: 'Settings', path: '/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <>
      <div
        className={`fixed inset-0 z-20 transition-opacity ease-linear duration-300 bg-gray-600 bg-opacity-75 ${
          isOpen ? 'opacity-100 md:hidden' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleSidebar}
      ></div>
      
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transition duration-300 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-md">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <span className="ml-2 text-xl font-semibold">MarketPOS</span>
          </div>
          <button
            className="md:hidden"
            onClick={toggleSidebar}
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        
        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 text-sm rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      toggleSidebar();
                    }
                  }}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="flex items-center p-4 mt-auto border-t border-gray-200">
          <div className="flex-shrink-0">
            <img
              className="w-8 h-8 rounded-full"
              src="https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=80"
              alt="User"
            />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">Admin User</p>
            <p className="text-xs text-gray-500">admin@minimarket.com</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;