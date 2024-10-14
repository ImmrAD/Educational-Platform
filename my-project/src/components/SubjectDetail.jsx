import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const SubjectDetail = () => {
  const { id } = useParams(); // Get the subject ID from the URL params
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true); // State to track loading status

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/engsubjects/${id}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setSubject(data);
      } catch (error) {
        console.error('Error fetching subject:', error);
      } finally {
        setLoading(false); // Set loading to false once the fetch is complete
      }
    };
    fetchSubject();
  }, [id]);

  if (loading) {
    return <p className="text-white">Loading subject details...</p>; // Loading state
  }

  if (!subject) {
    return <p className="text-white">Subject not found.</p>; // Error state
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Video Background */}
      <video autoPlay loop muted className="absolute inset-0 w-full h-full object-cover z-0">
        <source src="/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="relative z-10 flex flex-col h-full p-8">
        <h1 className="text-4xl mb-6 text-white">{subject.title}</h1>
        <p className="text-lg text-white mb-4">Semester: {subject.sem}</p>

        <h2 className="text-2xl text-white mb-4">Resources:</h2>
        {subject.resources.length > 0 ? (
          <ul className="list-disc list-inside text-white">
            {subject.resources.map((resource) => (
              <li key={resource.link} className="mb-2">
                <a href={resource.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                  {resource.title} ({resource.type})
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-white">No resources available for this subject.</p>
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

export default SubjectDetail;
