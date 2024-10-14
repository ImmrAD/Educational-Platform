import React, { useState } from 'react';

const Contact = () => {
  const [message, setMessage] = useState('');
  const [isSuggestion, setIsSuggestion] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:3001/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, isSuggestion }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setSuccess(true);
      setMessage('');
      setIsSuggestion(false);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="relative p-8">
        <h1 className="text-4xl font-bold text-center text-white mb-8 neon-text">
          Contact Us
        </h1>

        {/* Content with black background and padding */}
        <div className="bg-black bg-opacity-700 p-6 rounded-lg">
          <form onSubmit={handleSubmit}>
            <textarea
              rows="5"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message here..."
              className="w-full p-2 border border-white rounded mb-4 text-white bg-transparent" // Updated here
              required
            />
            <div className="mb-4 text-gray-200">
              <label>
                <input
                  type="checkbox"
                  checked={isSuggestion}
                  onChange={() => setIsSuggestion(!isSuggestion)}
                  className="mr-2"
                />
                Is this a suggestion?
              </label>
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Send Message
            </button>
          </form>
          {success && <p className="text-green-500 mt-4">Message sent successfully!</p>}
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
      </div>

      {/* CSS for Neon Effects */}
      <style jsx>{`
        .neon-text {
          text-shadow: 0 0 5px #00ffff, 0 0 10px #00ffff, 0 0 15px #00ffff, 0 0 20px #00ffff;
        }
      `}</style>
    </div>
  );
};

export default Contact;
