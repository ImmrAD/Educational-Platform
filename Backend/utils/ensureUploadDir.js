const fs = require('fs');
const path = require('path');

function ensureUploadDirectory() {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    
    if (!fs.existsSync(uploadDir)) {
        try {
            fs.mkdirSync(uploadDir, { recursive: true });
            console.log('Upload directory created successfully');
        } catch (error) {
            console.error('Error creating upload directory:', error);
            throw error;
        }
    }
    
    // Ensure the directory has proper permissions
    try {
        fs.accessSync(uploadDir, fs.constants.W_OK);
    } catch (error) {
        console.error('Upload directory is not writable:', error);
        throw new Error('Upload directory is not writable');
    }
    
    return uploadDir;
}

module.exports = ensureUploadDirectory;