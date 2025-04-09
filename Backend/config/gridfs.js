const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

let bucket;

// Initialize GridFS bucket
const initBucket = () => {
    if (!bucket && mongoose.connection.db) {
        bucket = new GridFSBucket(mongoose.connection.db, {
            bucketName: 'uploads'
        });
    }
    return bucket;
};

mongoose.connection.once('open', () => {
    initBucket();
});

// Upload file to GridFS
const uploadToGridFS = (file) => {
    return new Promise((resolve, reject) => {
        const currentBucket = initBucket();
        if (!currentBucket) {
            return reject(new Error('GridFS bucket not initialized'));
        }
        const filename = `${Date.now()}-${file.originalname}`;
        const uploadStream = bucket.openUploadStream(filename);

        const bufferStream = require('stream').Readable.from(file.buffer);
        bufferStream.pipe(uploadStream)
            .on('error', (error) => reject(error))
            .on('finish', () => resolve({
                fileId: uploadStream.id,
                filename: filename
            }));
    });
};

// Delete file from GridFS
const deleteFromGridFS = (fileId) => {
    return new Promise((resolve, reject) => {
        bucket.delete(new mongoose.Types.ObjectId(fileId), (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
};

// Get file stream from GridFS
const getFileStream = (fileId) => {
    const currentBucket = initBucket();
    if (!currentBucket) {
        throw new Error('GridFS bucket not initialized');
    }
    return currentBucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
};

module.exports = {
    uploadToGridFS,
    deleteFromGridFS,
    getFileStream
};