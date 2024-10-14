import React from 'react';
import { Link } from 'react-router-dom';

const TitleBar = ({ handleLogout }) => {
  return (
    <div className="flex justify-between items-center p-4 bg-black bg-opacity-500 backdrop-filter backdrop-blur-lg border-b border-black neon-border">
      <h1 className="text-2xl font-mono font-bold text-cyan-300">
        Edu-cate!
      </h1>
      <nav className="space-x-4">
        <Link to="/" className="text-white hover:text-cyan-300">Home</Link>
        <Link to="/courses" className="text-white hover:text-cyan-300">Courses</Link>
        <Link to="/about" className="text-white hover:text-cyan-300">About</Link>
        <Link to="/contact" className="text-white hover:text-cyan-300">Contact</Link>
        <button onClick={handleLogout} className="text-white hover:text-cyan-300">Logout</button>
      </nav>
    </div>
  );
};

// This handleLogout function should be in the parent component
// It is now correctly passed down as a prop
export default TitleBar;
