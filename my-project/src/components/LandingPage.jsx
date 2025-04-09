import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-black">
      {/* Video Background */}
      <video
        className="absolute inset-0 w-full h-full object-cover opacity-50"
        autoPlay
        loop
        muted
      >
        <source src="/background.mp4" type="video/mp4" />
      </video>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 text-cyan-400 neon-text animate-pulse">
            Edu-cate!
          </h1>
          <p className="text-2xl mb-8 text-gray-300">
            Empowering Education Through Technology
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3 bg-cyan-500 text-white rounded-full hover:bg-cyan-600 transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-3 bg-transparent border-2 border-cyan-500 text-cyan-500 rounded-full hover:bg-cyan-500 hover:text-white transition-colors"
            >
              Register
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-16">
          <div className="feature-card p-6 rounded-lg bg-black bg-opacity-50 border border-cyan-500 hover:border-cyan-400 transition-all">
            <h3 className="text-xl font-bold mb-3 text-cyan-400">For Students</h3>
            <p className="text-gray-300">Access quality educational content, track your progress, and engage with interactive learning materials.</p>
          </div>
          <div className="feature-card p-6 rounded-lg bg-black bg-opacity-50 border border-cyan-500 hover:border-cyan-400 transition-all">
            <h3 className="text-xl font-bold mb-3 text-cyan-400">For Teachers</h3>
            <p className="text-gray-300">Create and manage courses, monitor student progress, and deliver engaging content efficiently.</p>
          </div>
          <div className="feature-card p-6 rounded-lg bg-black bg-opacity-50 border border-cyan-500 hover:border-cyan-400 transition-all">
            <h3 className="text-xl font-bold mb-3 text-cyan-400">For Admins</h3>
            <p className="text-gray-300">Comprehensive platform management, user oversight, and content moderation tools.</p>
          </div>
        </div>
      </div>

      {/* Neon Effect Styles */}
      <style jsx="true">{`
        .neon-text {
          text-shadow: 0 0 5px #00FFFF, 0 0 10px #00FFFF, 0 0 15px #00FFFF, 0 0 20px #00FFFF;
        }
        .feature-card {
          backdrop-filter: blur(10px);
        }
      `}</style>
    </div>
  );
};

export default LandingPage;