import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Assuming you're using react-router for navigation

const Dashboard = () => {
  const [typedText, setTypedText] = useState('');
  const [engsubjects, setEngsubjects] = useState([]); // State to hold fetched data
  const message = "Welcome to Edu-cate!";
  const cardColors = ['#FF5733', '#33FF57', '#3357FF']; // Example card colors for hover effect

  useEffect(() => {
    // Fetch subjects from the backend API
    const fetchSubjects = async () => {
      try {
        // Fetch all subjects (no specific semester filter)
        const response = await fetch(`http://localhost:3001/api/engsubjects`);
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
  }, []); // Empty array means it will run only once on component mount

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

  // Create an array of unique semesters from subjects
  const uniqueSemesters = [...new Set(engsubjects.map(subject => subject.sem))];

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Video Background */}
      <video autoPlay loop muted className="absolute inset-0 w-full h-full object-cover z-0">
        <source src="/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="relative z-10 flex flex-col h-full">
        {/* Typing Effect with Neon Outline */}
        <div className="absolute top-8 left-0 right-0 flex items-start justify-center z-10">
          <h1 className="text-4xl font-mono font-bold text-center neon-text">
            <span className="text-white">{typedText}</span>
          </h1>
        </div>

        {/* Grid of Semesters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-8 mt-12 overflow-y-auto h-full">
          {uniqueSemesters.length > 0 ? (
            uniqueSemesters.map((semester, index) => (
              <Link key={semester} to={`/Dashboard/sem/${semester}`}>
                <div
                  className="course-card p-6 rounded-lg shadow-md transition-all"
                  style={{ backgroundColor: 'black', minHeight: '150px' }} // Ensure a minimum height
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
            <p className="text-white">No semesters available</p> // Display message if no semesters
          )}
        </div>
      </div>

      {/* Neon Effect */}
      <style>
        {`
          .neon-text {
            text-shadow: 0 0 5px #00FFFF, 0 0 10px #00FFFF, 0 0 15px #00FFFF, 0 0 20px #00FFFF;
          }
        `}
      </style>
    </div>
  );
};

export default Dashboard;
