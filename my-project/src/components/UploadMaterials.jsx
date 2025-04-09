import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';

function UploadMaterials() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const navigate = useNavigate();



  const onDrop = useCallback((acceptedFiles) => {
    const validFiles = acceptedFiles.filter(file => {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!allowedTypes.includes(file.type)) {
        setError(`${file.name}: Invalid file type. Only PDF, DOC, DOCX, JPEG, and PNG files are allowed.`);
        return false;
      }
      
      if (file.size > maxSize) {
        setError(`${file.name}: File size exceeds 10MB limit`);
        return false;
      }
      
      return true;
    });

    setFiles(prevFiles => [...prevFiles, ...validFiles]);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    multiple: true
  });

  const removeFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      setError('Please select files to upload');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('You must be logged in to upload files');
        navigate('/login');
        return;
      }

      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);


        try {
          const response = await axios.post('http://localhost:3001/api/files/upload', formData, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(prev => ({
                ...prev,
                [file.name]: progress
              }));
            }
          });
          return { fileName: file.name, success: true };
        } catch (error) {
          if (error.response?.status === 403) {
            if (error.response.data?.error === 'Only teachers can upload files') {
              setError('You do not have permission to upload files. Only teachers and admins can upload.');
              navigate('/');
              return { fileName: file.name, success: false, error: 'Permission denied' };
            } else if (error.response.data?.error === 'Invalid or expired token') {
              setError('Your session has expired. Please log in again.');
              localStorage.removeItem('authToken');
              localStorage.removeItem('userRole');
              setIsAuthenticated(false);
              setUserRole(null);
              navigate('/login');
              return { fileName: file.name, success: false, error: 'Session expired' };
            }
          }
          return { fileName: file.name, success: false, error: error.response?.data?.error || 'Upload failed' };
        }
      });

      const results = await Promise.all(uploadPromises);
      const failures = results.filter(result => !result.success);

      if (failures.length > 0) {
        setError(`Failed to upload: ${failures.map(f => f.fileName).join(', ')}`);
      } else {
        alert('All files uploaded successfully!');
        navigate('/courses');
      }
    } catch (error) {
      setError('Error uploading files');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Upload Course Materials</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-8">

          <div>
            <div {...getRootProps()} className={`mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}`}>
              <div className="space-y-1 text-center">
                <input {...getInputProps()} />
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <p className="pl-1">
                    {isDragActive ? 'Drop the files here' : 'Drag and drop files here, or click to select files'}
                  </p>
                </div>
                <p className="text-xs text-gray-500">
                  PDF, DOC, DOCX, JPEG, PNG up to 10MB
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Files will be automatically categorized by subject using AI
                </p>
              </div>
            </div>

            {files.length > 0 && (
              <ul className="mt-4 divide-y divide-gray-200">
                {files.map((file, index) => (
                  <li key={index} className="py-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">{file.name}</span>
                      {uploadProgress[file.name] > 0 && (
                        <div className="ml-4 w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${uploadProgress[file.name]}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="ml-4 text-sm font-medium text-red-600 hover:text-red-500"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
          >
            {loading ? 'Uploading...' : 'Upload Files'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UploadMaterials;