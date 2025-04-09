import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ManageSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState({ title: '', sem: '', resources: [] });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'teacher' && userRole !== 'admin') {
      navigate('/');
      return;
    }
    fetchSubjects();
  }, [navigate]);

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3001/api/engsubjects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch subjects');
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      setError('Error fetching subjects');
      console.error('Error:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSubject(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/engsubjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(newSubject),
      });

      if (!response.ok) throw new Error('Failed to create subject');
      
      const data = await response.json();
      setSubjects(prev => [...prev, data]);
      setNewSubject({ title: '', sem: '', resources: [] });
      setSuccess('Subject added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Error creating subject');
      console.error('Error:', error);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/engsubjects/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete subject');
      
      setSubjects(prev => prev.filter(subject => subject._id !== id));
      setSuccess('Subject deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Error deleting subject');
      console.error('Error:', error);
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-900">
      <video autoPlay loop muted className="absolute inset-0 w-full h-full object-cover opacity-30">
        <source src="/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">Manage Subjects</h1>

        {/* Add Subject Form */}
        <div className="bg-white bg-opacity-10 rounded-lg p-6 mb-8 backdrop-blur-sm">
          <h2 className="text-2xl font-semibold text-white mb-4">Add New Subject</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white mb-2">Subject Title</label>
              <input
                type="text"
                name="title"
                value={newSubject.title}
                onChange={handleInputChange}
                placeholder="Enter subject title"
                className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-white mb-2">Semester</label>
              <input
                type="text"
                name="sem"
                value={newSubject.sem}
                onChange={handleInputChange}
                placeholder="Enter semester (e.g., 1, 2, 3...)"
                className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Add Subject
            </button>
          </form>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-500 text-white p-4 rounded mb-6 animate-fade-in">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-500 text-white p-4 rounded mb-6 animate-fade-in">
            {error}
          </div>
        )}

        {/* Subjects List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <div
              key={subject._id}
              className="bg-white bg-opacity-10 rounded-lg p-6 text-white backdrop-blur-sm hover:bg-opacity-20 transition-all"
            >
              <h3 className="text-xl font-semibold mb-2">{subject.title}</h3>
              <p className="mb-4">Semester: {subject.sem}</p>
              <div className="flex justify-between items-center">
                <button
                  onClick={() => handleDelete(subject._id)}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                >
                  Delete
                </button>
                <span className="text-gray-400 text-sm">
                  {subject.resources?.length || 0} resources
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageSubjects;