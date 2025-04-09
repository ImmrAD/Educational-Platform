const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const natural = require('natural');
const fitz = require('fitz');
const FileSorter = require('../../model/file_sorter');

class SubjectClassifier {
    static async extractTextFromPDF(filePath) {
        if (!filePath || !fs.existsSync(filePath)) {
            throw new Error('Invalid PDF file path');
        }

        let doc = null;
        try {
            doc = fitz.open(filePath);
            let text = '';
            for (let page of doc) {
                text += page.getText();
            }
            return text;
        } catch (error) {
            console.error('Error extracting text from PDF:', error);
            throw new Error('Failed to extract text from PDF');
        } finally {
            if (doc) {
                try {
                    doc.close();
                } catch (error) {
                    console.error('Error closing PDF document:', error);
                }
            }
        }
    }

    static async predictSubject(text) {
        if (!text || typeof text !== 'string') {
            throw new Error('Invalid input text for subject prediction');
        }

        return new Promise((resolve, reject) => {
            try {
                const classifier = new natural.BayesClassifier();
                
                // Enhanced training data with more examples
                classifier.addDocument('programming basics variables functions algorithms loops conditionals', 'Programming Fundamentals');
                classifier.addDocument('data structures arrays linked lists trees graphs algorithms complexity', 'Data Structures');
                classifier.addDocument('database management system sql queries normalization acid transactions', 'Database Systems');
                classifier.addDocument('computer networks protocols tcp/ip routing switching networking security', 'Computer Networks');
                classifier.addDocument('operating system process management memory scheduling deadlock synchronization', 'Operating Systems');
                classifier.addDocument('engineering mathematics calculus algebra matrices differentiation integration', 'Engineering Mathematics');
                classifier.addDocument('physics mechanics quantum optics semiconductors waves thermodynamics', 'Engineering Physics');
                classifier.addDocument('chemistry organic inorganic physical analytical biochemistry', 'Engineering Chemistry');
                classifier.train();

                const pythonProcess = spawn('python', [
                    path.join(__dirname, '..', '..', 'model', 'predict_subject.py'),
                    text
                ]);

                let output = '';
                let errorOutput = '';

                pythonProcess.stdout.on('data', (data) => {
                    output += data.toString();
                });

                pythonProcess.stderr.on('data', (data) => {
                    errorOutput += data.toString();
                    console.error(`Python Error: ${data}`);
                });

                pythonProcess.on('error', (error) => {
                    console.error('Failed to start Python process:', error);
                    resolve(classifier.classify(text));
                });

                const timeout = setTimeout(() => {
                    pythonProcess.kill();
                    console.warn('Python process timed out, using fallback classification');
                    resolve(classifier.classify(text));
                }, 30000); // 30 seconds timeout

                pythonProcess.on('close', (code) => {
                    clearTimeout(timeout);
                    if (code !== 0 || errorOutput) {
                        console.warn('Python model failed, using fallback classification');
                        resolve(classifier.classify(text));
                        return;
                    }
                    const match = output.match(/Predicted Classification:\s*(.+)/);
                    if (match) {
                        resolve(match[1].trim());
                    } else {
                        resolve(classifier.classify(text));
                    }
                });
            } catch (error) {
                console.error('Error in subject prediction:', error);
                reject(error);
            }
        });
    }

    static async organizeFile(filePath, uploadDir) {
        if (!filePath || !uploadDir) {
            throw new Error('File path and upload directory are required');
        }

        if (!fs.existsSync(filePath)) {
            throw new Error('Source file does not exist');
        }

        try {
            const fileName = path.basename(filePath);
            const sorter = new FileSorter();
            const [subjectCode, subjectName] = await sorter.sort_file(filePath);
            
            let subject = subjectName || 'General';
            const subjectDir = path.join(uploadDir, subject.toLowerCase().replace(/\s+/g, '_'));
            
            try {
                await fs.promises.mkdir(subjectDir, { recursive: true });
            } catch (error) {
                throw new Error(`Failed to create subject directory: ${error.message}`);
            }

            const newPath = path.join(subjectDir, fileName);
            try {
                await fs.promises.rename(filePath, newPath);
            } catch (error) {
                throw new Error(`Failed to move file: ${error.message}`);
            }

            return {
                newPath,
                subject: path.basename(subjectDir),
                subjectCode
            };
        } catch (error) {
            console.error('Error organizing file:', error);
            throw error;
        }
    }
}

module.exports = SubjectClassifier;