import * as React from 'react';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import TitleBar from './components/TitleBar';
import Courses from './components/Courses';
import About from './components/About';
import Contact from './components/Contact';
import Dashboard from './components/Dashboard';
import CourseDetail from './components/CourseDetail';
import SemesterSubjects from './components/SemesterSubjects';
import SubjectDetail from './components/SubjectDetail';
import LandingPage from './components/LandingPage';
import UploadMaterials from './components/UploadMaterials';
import ManageSubjects from './components/ManageSubjects';
import AdminDashboard from './components/AdminDashboard';
import ViewUploads from './components/ViewUploads';
import Analytics from './components/Analytics';
import ManageUsers from './components/ManageUsers';
import FileUpload from './components/FileUpload';
import StudentHome from './components/StudentHome';
import FileList from './components/FileList';
import PasswordInput from './components/PasswordInput';
import Navbar from './components/Navbar';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUserRole = localStorage.getItem('userRole');
    if (token) {
      setIsAuthenticated(true);
      setUserRole(storedUserRole);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('userRole');
    setIsAuthenticated(false);
    setUserRole(null);
  };

  return (
    <Router>
      <div>
        <Routes>
          {isAuthenticated ? (
            <>
              <Route path="/" element={
                <>
                  <TitleBar handleLogout={handleLogout} />
                  <Dashboard userRole={userRole} />
                </>
              } />
              <Route path="/courses" element={<><TitleBar handleLogout={handleLogout} /><Courses /></>} />
              <Route path="/about" element={<><TitleBar handleLogout={handleLogout} /><About /></>} />
              <Route path="/contact" element={<><TitleBar handleLogout={handleLogout} /><Contact /></>} />
              <Route path="/upload-materials" element={
                userRole === 'teacher' || userRole === 'admin' ? 
                <><TitleBar handleLogout={handleLogout} /><UploadMaterials /></> : 
                <Navigate to="/" />
              } />
              <Route path="/manage-subjects" element={<><TitleBar handleLogout={handleLogout} /><ManageSubjects /></>} />
              <Route path="/view-uploads" element={
                userRole === 'teacher' || userRole === 'admin' ? 
                <><TitleBar handleLogout={handleLogout} /><ViewUploads /></> : 
                <Navigate to="/" />
              } />
              <Route path="/manage-users" element={
                userRole === 'admin' ? 
                <><TitleBar handleLogout={handleLogout} /><ManageUsers /></> : 
                <Navigate to="/" />
              } />
              <Route path="/system-settings" element={
                userRole === 'admin' ? 
                <><TitleBar handleLogout={handleLogout} /><AdminDashboard /></> : 
                <Navigate to="/" />
              } />
              <Route path="/analytics" element={
                userRole === 'admin' ? 
                <><TitleBar handleLogout={handleLogout} /><Analytics /></> : 
                <Navigate to="/" />
              } />
              <Route path="/courses/:id" element={<><TitleBar handleLogout={handleLogout} /><CourseDetail /></>} />
              <Route path="/Dashboard/sem/:semesterId" element={<><TitleBar handleLogout={handleLogout} /><SemesterSubjects /></>} />
              <Route path="/semester/:semesterId" element={<><TitleBar handleLogout={handleLogout} /><SemesterSubjects /></>} />
              <Route path="/subject/:id" element={<><TitleBar handleLogout={handleLogout} /><SubjectDetail /></>} />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          ) : (
            <>
              <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />} />
              <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />} />
              <Route path="/" element={<LandingPage />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
