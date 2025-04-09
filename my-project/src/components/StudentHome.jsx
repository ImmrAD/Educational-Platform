import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const StudentHome = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      const token = localStorage.getItem('authToken');

      if (!token) {
        setError('Authentication token is missing. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:3001/api/visibility/all', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const text = await response.text();

        if (!response.ok) {
          console.error('Backend returned an error response:', text);
          throw new Error(`Error ${response.status}: ${text}`);
        }

        let data;
        try {
          data = JSON.parse(text);
        } catch (jsonError) {
          console.error('Response is not valid JSON:', text);
          throw new Error('Server returned invalid JSON. Check backend response.');
        }

        if (!data.subjects || !Array.isArray(data.subjects)) {
          throw new Error('Subjects data is missing or malformed.');
        }

        setSubjects(data.subjects);
      } catch (err) {
        console.error('Error fetching subjects:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold">{error}</p>
          <p className="mt-2">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  // Group subjects by semester
  const subjectsBySemester = subjects.reduce((acc, subject) => {
    const sem = subject.sem || 'Unassigned';
    if (!acc[sem]) {
      acc[sem] = [];
    }
    acc[sem].push(subject);
    return acc;
  }, {});

  return (
    <div className="relative w-screen h-screen overflow-y-auto bg-gray-900">
      <video autoPlay loop muted className="fixed inset-0 w-full h-full object-cover z-0 opacity-30">
        <source src="/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-white">Course Materials</h1>

        {Object.entries(subjectsBySemester).map(([semester, semesterSubjects]) => (
          <div key={semester} className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-6">Semester {semester}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {semesterSubjects.map((subject) => (
                <div key={subject.code} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
                  <div className="p-6">
                    <h3 className="text-2xl font-semibold text-white mb-4">{subject.name}</h3>
                    <p className="text-gray-400 mb-2">Subject Code: {subject.code}</p>

                    <div className="mt-6">
                      <h4 className="text-lg font-medium text-white mb-3">Modules</h4>
                      <div className="space-y-2">
                        {subject.modules && subject.modules.length > 0 ? (
                          subject.modules.map((module) => (
                            <div key={module['Module No']} className="bg-gray-700 p-3 rounded">
                              <p className="text-white">
                                <span className="font-medium">Module {module['Module No']}:</span>{' '}
                                {module['Module Name']}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-400">No modules listed for this subject.</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="text-lg font-medium text-white mb-3">Course Materials</h4>
                      <div className="space-y-2">
                        {subject.files && subject.files.length > 0 ? (
                          subject.files.map((file) => (
                            <div key={file._id} className="bg-gray-700 p-3 rounded flex justify-between items-center">
                              <div>
                                <p className="text-white font-medium">{file.originalName}</p>
                                <p className="text-gray-400 text-sm">
                                  Size: {(file.fileSize / 1024).toFixed(2)} KB | 
                                  Uploaded: {new Date(file.uploadDate).toLocaleDateString()}
                                </p>
                              </div>
                              <button
                                onClick={() => window.location.href = `http://localhost:3001/files/download/${file._id}`}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-300"
                              >
                                Download
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-400">No files available for this subject.</p>
                        )}
                      </div>
                    </div>

                    <Link
                      to={`/subject/${subject.code}`}
                      className="inline-block mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-300"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentHome;