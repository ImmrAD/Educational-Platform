const { google } = require('googleapis');
const path = require('path');

// Configure Google Drive API
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, '../credentials.json'),
    scopes: SCOPES
});

const drive = google.drive({ version: 'v3', auth });

const uploadToGoogleDrive = async (file, filename) => {
    try {
        const fileMetadata = {
            name: filename,
            parents: [process.env.GOOGLE_DRIVE_FOLDER_ID] // Folder ID where files will be uploaded
        };

        const media = {
            mimeType: file.mimetype,
            body: file.buffer
        };

        const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id, webViewLink'
        });

        return response.data.webViewLink; // Return the shareable link
    } catch (error) {
        console.error('Error uploading to Google Drive:', error);
        throw new Error('Failed to upload file to Google Drive');
    }
};

const deleteFromGoogleDrive = async (fileId) => {
    try {
        await drive.files.delete({
            fileId: fileId
        });
    } catch (error) {
        console.error('Error deleting from Google Drive:', error);
        throw new Error('Failed to delete file from Google Drive');
    }
};

module.exports = {
    uploadToGoogleDrive,
    deleteFromGoogleDrive
};