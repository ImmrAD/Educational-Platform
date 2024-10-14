import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/login';
import Register from './components/register';
import TitleBar from './components/TitleBar';
import Courses from './components/courses';
import About from './components/About';
import Contact from './components/contact';
import Dashboard from './components/Dashboard';
import CourseDetail from './components/CourseDetail';
import SemesterSubjects from './components/SemesterSubjects'; // Ensure correct path
import SubjectDetail from './components/SubjectDetail'; // Ensure correct path for SubjectDetail

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    console.log('Logging out...');
    setIsAuthenticated(false); // Update state to reflect logout
  };

  return (
    <Router>
      <div>
        {isAuthenticated ? (
          <>
            <TitleBar handleLogout={handleLogout} />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/Dashboard/sem/:semesterId" element={<SemesterSubjects />} />
              
              {/* Route for the list of subjects */}
              <Route path="/semester/:semesterId" element={<SemesterSubjects />} />

              {/* Route for a specific subject's details */}
              <Route path="/subject/:id" element={<SubjectDetail />} />
            </Routes>
          </>
        ) : (
          <Routes>
            <Route path="/" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;
