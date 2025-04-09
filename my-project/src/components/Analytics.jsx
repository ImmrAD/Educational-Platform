import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Analytics = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    usersByRole: { student: 0, teacher: 0, admin: 0 },
    totalFiles: 0,
    totalSubjects: 0,
    popularSubjects: [],
    recentUploads: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch users statistics
        const usersResponse = await axios.get('http://localhost:3001/users', { headers });
        const users = usersResponse.data;
        const usersByRole = users.reduce((acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {});

        // Fetch files statistics
        const filesResponse = await axios.get('http://localhost:3001/files/stats', { headers });
        const filesStats = filesResponse.data;

        setStats({
          totalUsers: users.length,
          usersByRole,
          totalFiles: filesStats.totalFiles,
          totalSubjects: filesStats.totalSubjects,
          popularSubjects: filesStats.popularSubjects,
          recentUploads: filesStats.recentUploads
        });
        setLoading(false);
      } catch (error) {
        setError('Error fetching analytics: ' + error.message);
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <div className="text-white text-center p-4">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-white mb-6">Platform Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-2">Total Users</h2>
          <p className="text-4xl font-bold text-cyan-400">{stats.totalUsers}</p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-2">Total Files</h2>
          <p className="text-4xl font-bold text-green-400">{stats.totalFiles}</p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-2">Total Subjects</h2>
          <p className="text-4xl font-bold text-purple-400">{stats.totalSubjects}</p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-2">User Distribution</h2>
          <div className="space-y-2">
            <p className="text-sm text-gray-300">Students: <span className="text-blue-400 font-bold">{stats.usersByRole.student || 0}</span></p>
            <p className="text-sm text-gray-300">Teachers: <span className="text-green-400 font-bold">{stats.usersByRole.teacher || 0}</span></p>
            <p className="text-sm text-gray-300">Admins: <span className="text-red-400 font-bold">{stats.usersByRole.admin || 0}</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold text-white mb-4">Popular Subjects</h2>
          <div className="space-y-4">
            {stats.popularSubjects.map((subject, index) => (
              <div key={subject._id} className="flex justify-between items-center">
                <span className="text-gray-300">{subject.title}</span>
                <span className="text-cyan-400 font-bold">{subject.accessCount} views</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold text-white mb-4">Recent Uploads</h2>
          <div className="space-y-4">
            {stats.recentUploads.map((file, index) => (
              <div key={file._id} className="flex justify-between items-center">
                <span className="text-gray-300">{file.originalName}</span>
                <span className="text-xs text-gray-400">{new Date(file.uploadDate).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;