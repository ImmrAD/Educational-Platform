import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import FileList from './FileList';
import axiosInstance from '../utils/axiosConfig';

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axiosInstance.get(`/api/engsubjects/${id}`);
        console.log('Fetched course:', response.data);
        setCourse(response.data);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!course) return <div>Course not found</div>;

  return (
    <div className='relative w-screen h-screen overflow-hidden'>
      <video
        autoPlay
        loop
        muted
        className='absolute inset-0 w-full h-full object-cover'>
        <source src='/background.mp4' type='video/mp4' />
        Your Browser does not support the video tag.
      </video>

      <div className="relative p-8">
        <h1 className="text-4xl font-bold text-center text-white mb-8 neon-text animate-pulse">
          {course.title}
        </h1>
        <h1 className='text-2xl font-mono font-bold text-green-200'>
          {course.description}
        </h1>

        <div className='bg-black bg-opacity-700 p-6 rounded-lg mt-8'>
          <h2 className="text-xl text-white mb-4">Course Materials</h2>
          <FileList />
        </div>

        <div className='bg-black bg-opacity-700 p-6 rounded-lg mt-8'>
          <h2 className="text-xl text-white mb-4">Additional Resources</h2>
          <ul className="space-y-4">
            {course.resources && course.resources.map((resource, index) => (
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

      <style>{`
        .neon-text {
          text-shadow: 0 0 5px #00ffff, 0 0 10px #00ffff, 0 0 15px #00ffff, 0 0 20px #00ffff;
        }
      `}</style>
    </div>
  );
};

export default CourseDetail;
