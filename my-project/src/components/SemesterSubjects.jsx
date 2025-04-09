import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const SemesterSubjects = () => {
  const { semesterId } = useParams();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileOperations, setFileOperations] = useState({});
  const [operationError, setOperationError] = useState(null);

  const handleFileOperation = (fileId, operation, isLoading) => {
    setFileOperations(prev => ({
      ...prev,
      [fileId]: { ...prev[fileId], [operation]: isLoading }
    }));
  };

  const handleDownload = async (file) => {
    handleFileOperation(file._id, 'downloading', true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3001/files/download/${file._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      setOperationError(`Failed to download ${file.originalName}: ${error.message}`);
      setTimeout(() => setOperationError(null), 5000);
    } finally {
      handleFileOperation(file._id, 'downloading', false);
    }
  };

  const handleDelete = async (file) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    handleFileOperation(file._id, 'deleting', true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3001/files/${file._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Delete failed');
      }

      setSubjects(prevSubjects =>
        prevSubjects.map(s => ({
          ...s,
          files: s.files.filter(f => f._id !== file._id)
        }))
      );
    } catch (error) {
      console.error('Delete error:', error);
      setOperationError(`Failed to delete ${file.originalName}: ${error.message}`);
      setTimeout(() => setOperationError(null), 5000);
    } finally {
      handleFileOperation(file._id, 'deleting', false);
    }
  };

  useEffect(() => {
    const fetchSubjects = async () => {
      const token = localStorage.getItem('authToken');

      if (!token) {
        setError('Authentication token is missing. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:3001/api/visibility/${semesterId}`, {
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
  }, [semesterId]);

  return (
    <div className="relative w-screen h-screen overflow-y-auto bg-gray-900">
      <video autoPlay loop muted className="fixed inset-0 w-full h-full object-cover z-0 opacity-30">
        <source src="/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-white">Semester {semesterId} Subjects</h1>

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

        {operationError && (
          <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50">
            {operationError}
          </div>
        )}

        {!loading && !error && subjects.length === 0 && (
          <p className="text-white text-lg">No subjects available for this semester.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subjects.map((subject) => (
            <div key={subject.code} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <div className="p-6">
                <h2 className="text-2xl font-semibold text-white mb-4">{subject.name}</h2>
                <p className="text-gray-400 mb-2">Subject Code: {subject.code}</p>

                <div className="mt-6">
                  <h3 className="text-lg font-medium text-white mb-3">Modules</h3>
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
                  <h3 className="text-lg font-medium text-white mb-3">Course Materials</h3>
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
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleDownload(file)}
                              disabled={fileOperations[file._id]?.downloading}
                              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                              {fileOperations[file._id]?.downloading ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  <span>Downloading...</span>
                                </>
                              ) : (
                                'Download'
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(file)}
                              disabled={fileOperations[file._id]?.deleting}
                              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                              {fileOperations[file._id]?.deleting ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  <span>Deleting...</span>
                                </>
                              ) : (
                                'Delete'
                              )}
                            </button>
                          </div>
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
                  View Materials
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SemesterSubjects;
