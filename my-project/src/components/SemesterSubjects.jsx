import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // Use Link for navigation

const SemesterSubjects = () => {
  const { semesterId } = useParams(); // Get the semester ID from the URL params
  const [engsubjects, setEngsubjects] = useState([]);
  const [loading, setLoading] = useState(true); // State to track loading status

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/engsubjects?sem=${semesterId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setEngsubjects(data);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      } finally {
        setLoading(false); // Set loading to false once the fetch is complete
      }
    };
    fetchSubjects();
  }, [semesterId]);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Video Background */}
      <video autoPlay loop muted className="absolute inset-0 w-full h-full object-cover z-0">
        <source src="/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="relative z-10 flex flex-col h-full p-8">
        <h1 className="text-4xl mb-6 text-white">Subjects for Semester {semesterId}</h1>
        {loading ? ( // Show loading state
          <p className="text-white">Loading subjects...</p>
        ) : engsubjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {engsubjects.map((subject) => (
              <Link key={subject._id} to={`/subject/${subject._id}`}>
                <div className="course-card p-6 rounded-lg shadow-md transition-all bg-gray-800 hover:bg-gray-700">
                  <h2 className="text-2xl font-semibold mb-4 text-white">{subject.title}</h2>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-white">No subjects available for this semester.</p>
        )}
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

export default SemesterSubjects;
