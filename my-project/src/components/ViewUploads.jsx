import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ViewUploads() {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    setError('Please log in to view your uploads');
                    window.location.href = '/login';
                    return;
                }
                const response = await axios.get('http://localhost:3001/files/teacher-uploads', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setFiles(response.data);
                setLoading(false);
            } catch (error) {
                if (error.response?.status === 403) {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userRole');
                    setError('Your session has expired. Please log in again.');
                    window.location.href = '/login';
                } else {
                    setError(error.response?.data?.error || 'Error fetching files');
                }
                setLoading(false);
            }
        };

        fetchFiles();
    }, []);

    const handleDownload = async (fileId) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`http://localhost:3001/files/download/${fileId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'document'); // You can set the filename here
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert(error.response?.data?.error || 'Error downloading file');
        }
    };

    const handleDelete = async (fileId) => {
        if (!window.confirm('Are you sure you want to delete this file?')) return;

        try {
            const token = localStorage.getItem('authToken');
            await axios.delete(`http://localhost:3001/files/${fileId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setFiles(files.filter(file => file._id !== fileId));
        } catch (error) {
            alert(error.response?.data?.error || 'Error deleting file');
        }
    };

    if (loading) return <div className="text-center p-4">Loading...</div>;
    if (error) return <div className="text-center text-red-500 p-4">{error}</div>;

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">My Uploaded Files</h2>
            {files.length === 0 ? (
                <p className="text-center text-gray-500">No files uploaded yet</p>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {files.map((file) => (
                        <div key={file._id} className="border rounded-lg p-4 bg-white shadow">
                            <h3 className="font-semibold mb-2">{file.originalName}</h3>
                            <p className="text-sm text-gray-600 mb-2">Subject: {file.subject?.title || 'N/A'}</p>
                            <p className="text-sm text-gray-600 mb-2">Upload Date: {new Date(file.uploadDate).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-600 mb-4">File Size: {(file.fileSize / 1024).toFixed(2)} KB</p>
                            <div className="flex justify-between">
                                <button
                                    onClick={() => handleDownload(file._id)}
                                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                >
                                    Download
                                </button>
                                <button
                                    onClick={() => handleDelete(file._id)}
                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ViewUploads;