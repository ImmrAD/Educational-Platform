import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar({ userRole, setIsAuthenticated, setUserRole }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    setIsAuthenticated(false);
    setUserRole(null);
    navigate('/login');
  };

  const renderNavLinks = () => {
    const commonLinks = [
      <Link key="home" to="/" className="text-white hover:text-cyan-400">Home</Link>,
      <Link key="courses" to="/courses" className="text-white hover:text-cyan-400">Courses</Link>,
      <Link key="about" to="/about" className="text-white hover:text-cyan-400">About</Link>,
      <Link key="contact" to="/contact" className="text-white hover:text-cyan-400">Contact</Link>
    ];

    const roleSpecificLinks = {
      student: [
        <Link key="dashboard" to="/dashboard" className="text-white hover:text-cyan-400">My Dashboard</Link>
      ],
      teacher: [
        <Link key="dashboard" to="/dashboard" className="text-white hover:text-cyan-400">My Dashboard</Link>,
        <Link key="upload" to="/upload-materials" className="text-white hover:text-cyan-400">Upload Materials</Link>
      ],
      admin: [
        <Link key="dashboard" to="/admin-dashboard" className="text-white hover:text-cyan-400">Admin Dashboard</Link>,
        <Link key="manage-users" to="/manage-users" className="text-white hover:text-cyan-400">Manage Users</Link>,
        <Link key="analytics" to="/analytics" className="text-white hover:text-cyan-400">Analytics</Link>
      ]
    };

    return [...commonLinks, ...(roleSpecificLinks[userRole] || [])];
  };

  return (
    <nav className="bg-black bg-opacity-90 p-4 fixed w-full top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-cyan-400 text-2xl font-bold font-mono">Educate</Link>
        <div className="flex space-x-6 items-center">
          {renderNavLinks()}
          <button
            onClick={handleLogout}
            className="text-white hover:text-red-500 ml-4"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;