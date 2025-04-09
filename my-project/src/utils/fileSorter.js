import axios from 'axios';

class FileSorter {
  constructor() {
    this.keywordCache = new Map();
  }

  async sortFile(fileName) {
    if (!fileName) {
      return ['GEN', 'General'];
    }

    const fileNameWithoutExt = fileName.toLowerCase().split('.')[0];

    // Check cache first
    if (this.keywordCache.has(fileNameWithoutExt)) {
      return this.keywordCache.get(fileNameWithoutExt);
    }

    try {
      const response = await axios.post('http://localhost:3001/api/files/sort', {
        fileName: fileNameWithoutExt
      });

      const result = response.data;
      this.keywordCache.set(fileNameWithoutExt, result);
      return result;
    } catch (error) {
      console.error('Error sorting file:', error);
      return ['GEN', 'General'];
    }
  }
}

export default new FileSorter();