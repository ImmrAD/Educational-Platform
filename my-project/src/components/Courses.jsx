import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Courses = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cardColors, setCardColors] = useState([]);

  // Generate random hex color
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/subjects/visible');
        if (response.data && Array.isArray(response.data)) {
          setSubjects(response.data);
          setLoading(false);

          // Generate random colors for each card
          const colors = response.data.map(() => getRandomColor());
          setCardColors(colors);
        } else {
          throw new Error('Invalid response format from server');
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="relative p-8">
        {/* Animated Title */}
        <h1 className="text-4xl font-bold text-center text-white mb-8 neon-text animate-pulse">
          Available Courses
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {subjects.map((subject, index) => (
            <Link key={subject._id} to={`/courses/${subject._id}`}>
              <div
                className="course-card p-6 rounded-lg shadow-md transition-all"
                style={{
                  backgroundColor: 'black', // Default color
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = cardColors[index]; // Change whole card's color
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'black'; // Reset to default
                }}
              >
                <h2 className="text-2xl font-semibold mb-4 text-white">
                  {subject.title}
                </h2>
                <p className="text-gray-300 mb-4">{subject.description}</p>
                <p className="text-sm text-gray-400">Author: {subject.author}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CSS for Neon Effects and Hover Styles */}
      <style>{`
        .neon-text {
          text-shadow: 0 0 5px #00ffff, 0 0 10px #00ffff, 0 0 15px #00ffff, 0 0 20px #00ffff;
        }

        .course-card:hover {
          cursor: pointer;
          color: white; /* Ensure text color stays white */
        }

        .course-card {
          transition: background-color 0.3s ease; /* Smooth background color transition */
        }

        .course-card h2,
        .course-card p {
          transition: color 0.3s ease; /* Smooth text color transition */
        }
      `}</style>
    </div>
  );
};

export default Courses;
