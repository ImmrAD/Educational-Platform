import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/subjects/${id}`);
        console.log('Fetched course:', response.data); // Log the fetched course
        setCourse(response.data.subject);
      } catch (err) {
        console.error('Error fetching course:', err); // Log the error
        setError(err.message);
      } finally {
        setLoading(false); // Disable loading in both success and error cases
      }
    };

    fetchCourse();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!course) return <div>Course not found</div>;

  return (
    <div className='relative w-screen h-screen overflow-hidden'>
      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        className='absolute inset-0 w-full h-full object-cover'>
        <source src='/background.mp4' type='video/mp4' />
        Your Browser does not support the video tag.
      </video>

      <div className="relative p-8">
        {/* Animated Title */}
        <h1 className="text-4xl font-bold text-center text-white mb-8 neon-text animate-pulse">
          {course.title}
        </h1>
        <h1 className='text-2xl font-mono font-bold text-green-200'>
          {course.description}
        </h1>

        {/* Content with black background and padding */}
        <div className='bg-black bg-opacity-700 p-6 rounded-lg'>
          <h2 className="text-xl text-white mb-4">Resources</h2>
          <ul className="space-y-4">
            {course.resources.map((resource, index) => (
              <li key={index} className="text-white">
                <h3 className="font-bold">{resource.title}</h3>
                <p>Type: {resource.type}</p>
                <a
                  href={resource.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline hover:text-blue-600">
                  Access Resource
                </a>
              </li>
            ))}
          </ul>
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

export default CourseDetail;
