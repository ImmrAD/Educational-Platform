import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ContentRecommendation = ({ userId }) => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const response = await axios.get(`/api/recommendations/${userId}`);
                setRecommendations(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch content recommendations');
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [userId]);

    if (loading) return <div className="flex justify-center items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Recommended Content</h2>
            
            <div className="space-y-4">
                {recommendations.map((item, index) => (
                    <div key={item.contentId} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700">{item.title}</h3>
                                <p className="text-gray-600 mt-1">{item.description}</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    item.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                    item.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {item.difficulty}
                                </span>
                                <span className="text-sm text-gray-500 mt-2">Relevance: {Math.round(item.score * 100)}%</span>
                            </div>
                        </div>
                        
                        <div className="mt-3 flex justify-between items-center">
                            <div className="text-sm text-gray-500">
                                Estimated time: {item.estimatedTime} mins
                            </div>
                            <button 
                                onClick={() => window.location.href = `/content/${item.contentId}`}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Start Learning
                            </button>
                        </div>
                    </div>
                ))}

                {recommendations.length === 0 && (
                    <div className="text-center text-gray-600 py-8">
                        No recommendations available at this time.
                        <br />
                        Try exploring more content to get personalized suggestions.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContentRecommendation;