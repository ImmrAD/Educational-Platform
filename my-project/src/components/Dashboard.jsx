import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = ({ userRole }) => {
  const [typedText, setTypedText] = useState('');
  const [engsubjects, setEngsubjects] = useState([]);
  const message = `Welcome to Edu-cate! (${userRole})`;
  const cardColors = ['#FF5733', '#33FF57', '#3357FF'];

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`http://localhost:3001/api/engsubjects`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setEngsubjects(data);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };

    fetchSubjects();
  }, []);

  useEffect(() => {
    let currentIndex = 0;
    let typingInterval;
    let clearingInterval;

    const typeText = () => {
      if (currentIndex < message.length) {
        setTypedText(message.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => {
          currentIndex = message.length;
          clearingInterval = setInterval(clearText, 150);
        }, 2000);
      }
    };

    const clearText = () => {
      if (currentIndex > 0) {
        setTypedText(message.slice(0, currentIndex - 1));
        currentIndex--;
      } else {
        clearInterval(clearingInterval);
        setTimeout(() => {
          currentIndex = 0;
          typingInterval = setInterval(typeText, 150);
        }, 1000);
      }
    };

    typingInterval = setInterval(typeText, 150);
    
    return () => {
      clearInterval(typingInterval);
      clearInterval(clearingInterval);
    };
  }, [message]);

  const renderStudentDashboard = () => {
    const uniqueSemesters = [...new Set(engsubjects.map(subject => subject.sem))];
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-8 mt-12 overflow-y-auto h-full">
        {uniqueSemesters.length > 0 ? (
          uniqueSemesters.map((semester, index) => (
            <Link key={semester} to={`/Dashboard/sem/${semester}`}>
              <div
                className="course-card p-6 rounded-lg shadow-md transition-all"
                style={{ backgroundColor: 'black', minHeight: '150px' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = cardColors[index % cardColors.length];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'black';
                }}
              >
                <h2 className="text-2xl font-semibold mb-4 text-white">Semester {semester}</h2>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-white">No semesters available</p>
        )}
      </div>
    );
  };

  const renderTeacherDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-8 mt-12">
      <Link to="/upload-materials" className="course-card p-6 rounded-lg shadow-md bg-black hover:bg-green-600 transition-all">
        <h2 className="text-2xl font-semibold mb-4 text-white">Upload Materials</h2>
        <p className="text-gray-300">Share educational resources</p>
      </Link>
      <Link to="/manage-subjects" className="course-card p-6 rounded-lg shadow-md bg-black hover:bg-blue-600 transition-all">
        <h2 className="text-2xl font-semibold mb-4 text-white">Manage Subjects</h2>
        <p className="text-gray-300">Create and update subject content</p>
      </Link>
      <Link to="/view-uploads" className="course-card p-6 rounded-lg shadow-md bg-black hover:bg-purple-600 transition-all">
        <h2 className="text-2xl font-semibold mb-4 text-white">View Uploads</h2>
        <p className="text-gray-300">Manage your uploaded content</p>
      </Link>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-8 mt-12">
      <Link to="/manage-users" className="course-card p-6 rounded-lg shadow-md bg-black hover:bg-red-600 transition-all">
        <h2 className="text-2xl font-semibold mb-4 text-white">Manage Users</h2>
        <p className="text-gray-300">Manage user accounts and permissions</p>
      </Link>
      <Link to="/system-settings" className="course-card p-6 rounded-lg shadow-md bg-black hover:bg-yellow-600 transition-all">
        <h2 className="text-2xl font-semibold mb-4 text-white">System Settings</h2>
        <p className="text-gray-300">Configure platform settings and features</p>
      </Link>
      <Link to="/analytics" className="course-card p-6 rounded-lg shadow-md bg-black hover:bg-indigo-600 transition-all">
        <h2 className="text-2xl font-semibold mb-4 text-white">Analytics</h2>
        <p className="text-gray-300">View platform usage and performance metrics</p>
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          <span className="typing-text">{typedText}</span>
          <span className="cursor">|</span>
        </h1>
        {userRole === 'student' && renderStudentDashboard()}
        {userRole === 'teacher' && renderTeacherDashboard()}
        {userRole === 'admin' && renderAdminDashboard()}
      </div>
    </div>
  );
};

export default Dashboard;
