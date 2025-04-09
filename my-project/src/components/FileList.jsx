import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const FileList = () => {
  const { id } = useParams();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [fileOperations, setFileOperations] = useState({});
  const [operationError, setOperationError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role);
      } catch (error) {
        console.error('Error parsing token:', error);
        setError('Invalid authentication token. Please log in again.');
        return;
      }
    } else {
      setError('Authentication token missing. Please log in.');
      return;
    }

    fetchFiles();
  }, [id]);

  const handleFileOperation = (fileId, operation, isLoading) => {
    setFileOperations(prev => ({
      ...prev,
      [fileId]: { ...prev[fileId], [operation]: isLoading }
    }));
  };

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3001/api/files/subject/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch files');
      }

      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error('Error fetching files:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete ${fileName}?`)) {
      return;
    }

    handleFileOperation(fileId, 'deleting', true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3001/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to delete file');
      }

      setFiles(prevFiles => prevFiles.filter(file => file._id !== fileId));
      setOperationError(null);
    } catch (error) {
      console.error('Delete error:', error);
      setOperationError(`Failed to delete ${fileName}: ${error.message}`);
      setTimeout(() => setOperationError(null), 5000);
    } finally {
      handleFileOperation(fileId, 'deleting', false);
    }
  };

  const handleDownload = async (fileId, fileName) => {
    handleFileOperation(fileId, 'downloading', true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3001/files/download/${fileId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to download file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setOperationError(null);
    } catch (error) {
      console.error('Download error:', error);
      setOperationError(`Failed to download ${fileName}: ${error.message}`);
      setTimeout(() => setOperationError(null), 5000);
    } finally {
      handleFileOperation(fileId, 'downloading', false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500 text-white p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl text-white mb-4">Uploaded Files</h2>

      {operationError && (
        <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50">
          {operationError}
        </div>
      )}

      {files.length === 0 ? (
        <p className="text-white">No files uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => (
            <div key={file._id} className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-4 text-white">
              <h3 className="text-lg font-semibold mb-2">{file.originalName}</h3>
              <p className="text-sm mb-1">Type: {file.fileType}</p>
              <p className="text-sm mb-1">Size: {(file.fileSize / 1024).toFixed(2)} KB</p>
              <p className="text-sm mb-2">Uploaded by: {file.uploadedBy?.username || 'Unknown'}</p>
              <div className="flex justify-between items-center mt-4 space-x-2">
                <button
                  onClick={() => handleDownload(file._id, file.originalName)}
                  disabled={fileOperations[file._id]?.downloading}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {fileOperations[file._id]?.downloading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Downloading...</span>
                    </>
                  ) : 'Download'}
                </button>
                {(userRole === 'teacher' || userRole === 'admin') && (
                  <button
                    onClick={() => handleDelete(file._id, file.originalName)}
                    disabled={fileOperations[file._id]?.deleting}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {fileOperations[file._id]?.deleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Deleting...</span>
                      </>
                    ) : 'Delete'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileList;