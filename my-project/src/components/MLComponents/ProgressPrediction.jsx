import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProgressPrediction = ({ userId, courseId }) => {
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPrediction = async () => {
            try {
                const response = await axios.get(`/api/progress/predict/${userId}/${courseId}`);
                setPrediction(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch progress prediction');
                setLoading(false);
            }
        };

        fetchPrediction();
    }, [userId, courseId]);

    if (loading) return <div className="flex justify-center items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Learning Progress Prediction</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700">Predicted Score</h3>
                    <p className="text-3xl font-bold text-blue-600">
                        {prediction?.predictedScore ? `${Math.round(prediction.predictedScore)}%` : 'N/A'}
                    </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700">Risk Level</h3>
                    <div className={`text-xl font-bold ${prediction?.riskLevel === 'low' ? 'text-green-500' : prediction?.riskLevel === 'medium' ? 'text-yellow-500' : 'text-red-500'}`}>
                        {prediction?.riskLevel?.toUpperCase() || 'N/A'}
                    </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700">Recommended Daily Study Time</h3>
                    <p className="text-2xl font-bold text-purple-600">
                        {prediction?.recommendedPace ? `${prediction.recommendedPace} hours` : 'N/A'}
                    </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700">Expected Completion</h3>
                    <p className="text-xl font-bold text-indigo-600">
                        {prediction?.expectedCompletionTime ? new Date(prediction.expectedCompletionTime).toLocaleDateString() : 'N/A'}
                    </p>
                </div>
            </div>

            <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Recommendations</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                    {prediction?.riskLevel === 'high' && (
                        <li className="text-red-500">Consider increasing your study time and seeking additional help</li>
                    )}
                    {prediction?.recommendedPace > 2 && (
                        <li>Try to dedicate more time to difficult topics</li>
                    )}
                    <li>Maintain consistent study habits for better progress</li>
                </ul>
            </div>
        </div>
    );
};

export default ProgressPrediction;