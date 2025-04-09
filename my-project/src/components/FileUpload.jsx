import React, { useState, useCallback } from 'react';
import axios from 'axios';
import fileSorter from '../utils/fileSorter';

const FileUpload = ({ subjectId, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const allowedTypes = {
    'application/pdf': 'PDF',
    'application/msword': 'DOC',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
    'image/jpeg': 'JPG/JPEG',
    'image/png': 'PNG'
  };

  const resetStates = useCallback(() => {
    setFile(null);
    setError('');
    setMessage('');
    setUploadProgress(0);
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!allowedTypes[selectedFile.type]) {
        setError(`Invalid file type. Please upload ${Object.values(allowedTypes).join(', ')} files only.`);
        setFile(null);
        e.target.value = null;
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size too large. Maximum size is 10MB.');
        setFile(null);
        e.target.value = null;
        return;
      }
      setFile(selectedFile);
      setError('');
      setMessage('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('subjectId', subjectId);
    
    try {
      const [category, categoryName] = await fileSorter.sortFile(file.name);
      formData.append('category', category);
      formData.append('categoryName', categoryName);

      setUploading(true);
      setUploadProgress(0);
      setError('');
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token missing. Please log in again.');
      }

      const response = await axios.post('http://localhost:3001/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
        timeout: 30000 // 30 seconds timeout
      });

      setMessage('File uploaded successfully!');
      resetStates();
      e.target.reset();

      // Trigger parent component updates if onUploadSuccess prop exists
      if (response.data && onUploadSuccess && typeof onUploadSuccess === 'function') {
        onUploadSuccess(response.data);
      }
    } catch (error) {
      let errorMessage = 'Error uploading file';
      if (error.response) {
        errorMessage = error.response.data?.error || error.response.data?.message || errorMessage;
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      setError(errorMessage);
      setMessage('');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 bg-black bg-opacity-75 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-white">Upload Course Material</h3>
      <form onSubmit={handleUpload} className="space-y-4">
        <div className="flex flex-col space-y-4">
          <div className="relative">
            <input
              type="file"
              onChange={handleFileChange}
              className="text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-white hover:file:bg-cyan-600 cursor-pointer"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              disabled={uploading}
            />
            <p className="text-xs text-gray-400 mt-1">
              Allowed types: {Object.values(allowedTypes).join(', ')} (Max size: 10MB)
            </p>
          </div>
          
          {uploading && (
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-cyan-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
              <p className="text-sm text-gray-300 mt-1">{uploadProgress}% uploaded</p>
            </div>
          )}

          <button
            type="submit"
            disabled={uploading || !file}
            className="px-4 py-2 bg-cyan-500 text-white rounded-full hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2"
          >
            {uploading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Uploading...</span>
              </>
            ) : 'Upload'}
          </button>
        </div>

        {error && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-2 rounded-lg">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-green-500 bg-opacity-10 border border-green-500 text-green-500 px-4 py-2 rounded-lg">
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default FileUpload;