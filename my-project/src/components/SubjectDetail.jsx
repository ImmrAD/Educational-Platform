import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import FileList from './FileList';

const SubjectDetail = () => {
  const { code } = useParams();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`http://localhost:3001/api/subjects/visible?subjectCode=${code}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch subject details');
        }

        const data = await response.json();
        const subjectData = data.subjects.find(s => s.code === code);
        if (!subjectData) {
          throw new Error('Subject not found');
        }
        setSubject(subjectData);
      } catch (error) {
        setError(error.message);
        console.error('Error fetching subject:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubject();
  }, [code]);

  return (
    <div className="relative w-screen h-screen overflow-y-auto bg-gray-900">
      <video autoPlay loop muted className="fixed inset-0 w-full h-full object-cover z-0 opacity-30">
        <source src="/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {loading && (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {!loading && !error && subject && (
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h1 className="text-4xl font-bold mb-4 text-white">{subject.name}</h1>
            <p className="text-gray-400 mb-6">Subject Code: {subject.code}</p>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">Modules</h2>
              <div className="space-y-3">
                {subject.modules.map((module) => (
                  <div key={module['Module No']} className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-xl font-medium text-white mb-2">
                      Module {module['Module No']}: {module['Module Name']}
                    </h3>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">Course Materials</h2>
              <FileList />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectDetail;
