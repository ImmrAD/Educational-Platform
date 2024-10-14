import React from 'react';

const About = () => {
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
          About Edu-cate
        </h1>

        {/* Content with black background and padding */}
        <div className="bg-black bg-opacity-700 p-6 rounded-lg">
          <p className="mb-4 text-gray-200">
            Edu-cate is a platform designed to provide comprehensive learning resources for students of IT Engineering. 
            Our mission is to make quality education accessible to everyone.
          </p>

          <h2 className="text-3xl font-semibold mb-2 text-white">Our Vision</h2>
          <p className="mb-4 text-gray-300">
            We envision a world where education is not a privilege but a fundamental right for all. 
            Our goal is to empower individuals through knowledge and skills that help them thrive in their careers and lives.
          </p>

          <h2 className="text-3xl font-semibold mb-2 text-white">What We Offer</h2>
          <ul className="list-disc list-inside mb-4 text-gray-200">
            <li>Comprehensive courses across various subjects.</li>
            <li>Interactive learning experiences.</li>
            <li>Expert instructors and mentors.</li>
            <li>A community of learners to support each other.</li>
          </ul>

          <h2 className="text-3xl font-semibold mb-2 text-white">Join Us</h2>
          <p className="text-gray-300">
            Whether you are a student looking to enhance your knowledge or an educator wishing to share your expertise, 
            Edu-cate welcomes you. Join us in our journey to transform education!
          </p>
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

export default About;
