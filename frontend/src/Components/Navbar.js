import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Package,
  User,
  LogOut,
  UserPlus,
  Truck,
  BadgeDollarSign,
  Menu,
  Bell,
  ShoppingCart,
} from 'lucide-react';

const Navbar = ({ token, userType, setToken, setUserType }) => {
  const navigate = useNavigate();
  const isLoggedIn = !!token;
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
      setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    setToken('');
    setUserType('');
    navigate('/');
  };

  const handleNavigate = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  const quickbillRedirectPath =
    userType?.toLowerCase() === 'admin' ? '/admin-panel' : '/dashboard';

  if (!isLoggedIn) return null;

  let navLinks = [];

  const lowerUserType = userType?.toLowerCase();

  if (lowerUserType === 'admin') {
    navLinks = [
      {
        label: 'Admin Dashboard',
        path: '/admin-panel',
        icon: <LayoutDashboard size={18} className="mr-2" />,
      },
      {
        label: 'Create User',
        path: '/register-customer',
        icon: <UserPlus size={18} className="mr-2" />,
      },
      {
        label: 'Return Requests',
        path: '/requests',
        icon: <FileText size={18} className="mr-2" />,
      },
      {
        label: 'Create Bill',
        path: '/bill-form',
        icon: <PlusCircle size={18} className="mr-2" />,
      },
      {
        label: 'Vendors',
        path: '/vendors',
        icon: <Truck size={18} className="mr-2" />,
      },
      {
        label: 'Add Items',
        path: '/add-items',
        icon: <ShoppingCart size={18} className="mr-2" />,
      },
      {
        label: 'View Products',
        path: '/view-products',
        icon: <Package size={18} className="mr-2" />,
      },
      {
        label: 'Agents',
        path: '/agents',
        icon: <BadgeDollarSign size={18} className="mr-2" />,
      },
      {
        label: 'Notifications',
        path: '/notifications',
        icon: <Bell size={18} className="mr-2" />,
      },
      {
        label: 'My Profile',
        path: '/myprofile',
        icon: <User size={18} className="mr-2" />,
      },
    ];
  } else if (['customer', 'agent', 'vendor'].includes(lowerUserType)) {
    navLinks = [
      {
        label: 'Dashboard',
        path:
          lowerUserType === 'customer'
            ? '/customer-dashboard'
            : lowerUserType === 'agent'
              ? '/agent-dashboard'
              : '/vendor-dashboard',
        icon: <LayoutDashboard size={18} className="mr-2" />,
      },
      {
        label: 'Chatbox',
        path: '/chatbox',
        icon: <User size={18} className="mr-2" />,
      },
    ];
  } else {
    // For editors
    navLinks = [
      {
        label: 'Dashboard',
        path: '/dashboard',
        icon: <LayoutDashboard size={18} className="mr-2" />,
      },
      {
        label: 'Create User',
        path: '/register-customer',
        icon: <UserPlus size={18} className="mr-2" />,
      },
      {
        label: 'Create Bill',
        path: '/bill-form',
        icon: <PlusCircle size={18} className="mr-2" />,
      },
      {
        label: 'Vendors',
        path: '/vendors',
        icon: <Truck size={18} className="mr-2" />,
      },
      {
        label: 'Add Items',
        path: '/add-items',
        icon: <ShoppingCart size={18} className="mr-2" />,
      },
      {
        label: 'View Products',
        path: '/view-products',
        icon: <Package size={18} className="mr-2" />,
      },
      {
        label: 'Agents',
        path: '/agents',
        icon: <BadgeDollarSign size={18} className="mr-2" />,
      },
      {
        label: 'Notifications',
        path: '/notifications',
        icon: <Bell size={18} className="mr-2" />,
      },
      {
        label: 'My Profile',
        path: '/myprofile',
        icon: <User size={18} className="mr-2" />,
      },
    ];
  }

  return (
    <>
      {/* ✅ Desktop Sidebar */}
      {isDesktop && (
        <div className="fixed top-0 left-0 h-screen w-64 bg-white shadow-md z-40 flex flex-col justify-between border-r border-gray-200">
          <div>
            <div
              className="text-3xl font-extrabold text-black-500 px-6 py-5 cursor-pointer tracking-wide"
              onClick={() => handleNavigate(quickbillRedirectPath)}
            >
              QUICKBILL
            </div>
            <div className="text-gray-400 uppercase text-xs font-semibold px-6 pt-2 pb-1 tracking-wider">
              MENU
            </div>
            <nav className="flex flex-col px-2 space-y-1">
              {navLinks.map((link, idx) => (
                <button
                  key={idx}
                  onClick={() => handleNavigate(link.path)}
                  className="flex items-center text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md px-4 py-2 transition"
                >
                  {link.icon}
                  {link.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="px-4 pb-6">
            <button
              onClick={handleLogout}
              className="flex items-center w-full text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-md px-4 py-2 transition"
            >
              <LogOut size={18} className="mr-3" />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* ✅ Mobile Top Navbar */}
      {!isDesktop && (
        <div className="fixed top-0 left-0 right-0 h-16 bg-white shadow-md z-50 flex items-center justify-between px-4 border-b border-gray-200">
          {/* Hamburger Menu (Left) */}
          <div className="relative">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu size={24} className="text-gray-700" />
            </button>
            {mobileMenuOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                {navLinks.map((link, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleNavigate(link.path)}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                  >
                    {link.icon}
                    {link.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title Centered */}
          <div
            className="text-2xl font-extrabold text-black-500 cursor-pointer"
            onClick={() => handleNavigate(quickbillRedirectPath)}
          >
            QUICKBILL
          </div>

          {/* Logout Button Right */}
          <button
            onClick={handleLogout}
            className="text-red-500 hover:text-red-600 font-semibold text-sm flex items-center"
          >
            <LogOut size={20} />
          </button>
        </div>
      )}
    </>
  );
};

export default Navbar;
