// src/utils/api.js
export const createSubject = async (subjectData) => {
    try {
      const response = await fetch('http://localhost:3001/api/engsubjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subjectData),
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error creating subject:', error);
      throw error; // Re-throw the error for further handling
    }
  };
  