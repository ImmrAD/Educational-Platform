const path = require('path');
const natural = require('../Backend/node_modules/natural');
const fs = require('fs');

class FileSorter {
    constructor(syllabusFile = path.join(__dirname, 'syllabus_structure_new.json')) {
        this.syllabusFile = syllabusFile;
        if (!fs.existsSync(syllabusFile)) {
            throw new Error(`Syllabus file not found: ${syllabusFile}`);
        }
        try {
            const syllabusContent = fs.readFileSync(syllabusFile, 'utf8');
            this.syllabus = JSON.parse(syllabusContent);
            if (!this.syllabus['First Year Engineering']) {
                throw new Error('Invalid syllabus structure: missing First Year Engineering data');
            }
        } catch (error) {
            if (error instanceof SyntaxError) {
                throw new Error(`Invalid JSON in syllabus file: ${error.message}`);
            }
            throw new Error(`Error loading syllabus file: ${error.message}`);
        }
        this.moduleKeywords = this.extractModuleKeywords();
        this.tokenizer = new natural.WordTokenizer();
        this.keywordCache = new Map();
    }

    extractModuleKeywords() {
        const moduleKeywords = {};
        try {
            const firstYear = this.syllabus['First Year Engineering'];
            
            for (const semester of ['Semester I', 'Semester II']) {
                if (!firstYear[semester]) continue;
                
                for (const subject of firstYear[semester]) {
                    const subjectCode = subject['Subject Code'];
                    const subjectName = subject['Subject Name'];
                    if (!subjectCode || !subjectName) continue;
                    
                    moduleKeywords[subjectCode] = [];
                    
                    // Add subject name keywords
                    const subjectNameWords = subjectName.toLowerCase().split(/[\s-]+/);
                    moduleKeywords[subjectCode].push(...subjectNameWords);
                    
                    if (Array.isArray(subject.Modules)) {
                        for (const module of subject.Modules) {
                            if (module['Module Name']) {
                                const keywords = module['Module Name']
                                    .toLowerCase()
                                    .split(/[\s-]+/)
                                    .filter(word => word.length > 2);
                                moduleKeywords[subjectCode].push(...keywords);
                            }
                        }
                    }
                    
                    // Remove duplicates and add common variations
                    moduleKeywords[subjectCode] = [...new Set(moduleKeywords[subjectCode])];
                    // Add common variations (e.g., 'physics' for 'physics-i')
                    moduleKeywords[subjectCode].forEach(keyword => {
                        if (keyword.endsWith('-i') || keyword.endsWith('-ii')) {
                            moduleKeywords[subjectCode].push(keyword.slice(0, -2));
                        }
                    });
                }
            }
            return moduleKeywords;
        } catch (error) {
            console.error('Error extracting module keywords:', error);
            return {};
        }
    }

    async sort_file(filePath) {
        if (!filePath) {
            throw new Error('File path is required');
        }

        return new Promise((resolve) => {
            try {
                const fileName = path.basename(filePath).toLowerCase();
                const fileNameWithoutExt = path.parse(fileName).name;
                
                if (!fileNameWithoutExt) {
                    resolve(['GEN', 'General']);
                    return;
                }

                // Check cache first
                if (this.keywordCache.has(fileNameWithoutExt)) {
                    resolve(this.keywordCache.get(fileNameWithoutExt));
                    return;
                }
                
                // Improved tokenization to handle special characters
                const tokens = fileNameWithoutExt
                    .replace(/[-_]/g, ' ')
                    .split(/\s+/)
                    .filter(token => token.length > 1);

                if (tokens.length === 0) {
                    resolve(['GEN', 'General']);
                    return;
                }

                let maxScore = 0;
                let bestMatch = ['GEN', 'General'];
                const tokenSet = new Set(tokens.map(t => t.toLowerCase()));
                
                for (const [subjectCode, keywords] of Object.entries(this.moduleKeywords)) {
                    if (!keywords || keywords.length === 0) continue;
                    
                    const keywordSet = new Set(keywords.map(k => k.toLowerCase()));
                    let score = 0;
                    
                    for (const token of tokenSet) {
                        // Improved matching logic
                        if (token.length < 2) continue;
                        
                        // Direct match
                        if (keywordSet.has(token)) {
                            score += 2;
                            continue;
                        }
                        
                        // Partial match
                        for (const keyword of keywordSet) {
                            if (keyword.includes(token) || token.includes(keyword)) {
                                score += 1;
                                break;
                            }
                        }
                    }
                    
                    if (score > maxScore) {
                        maxScore = score;
                        bestMatch = [subjectCode, this.getSubjectName(subjectCode)];
                    }
                }
                
                this.keywordCache.set(fileNameWithoutExt, bestMatch);
                resolve(bestMatch);
            } catch (error) {
                console.error('Error sorting file:', error);
                resolve(['GEN', 'General']);
            }
        });
    }

    getSubjectName(code) {
        if (!code) return 'General';
        
        try {
            const firstYear = this.syllabus['First Year Engineering'];
            for (const semester of ['Semester I', 'Semester II']) {
                if (!firstYear[semester]) continue;
                
                const subject = firstYear[semester].find(s => s['Subject Code'] === code);
                if (subject && subject['Subject Name']) {
                    return subject['Subject Name'];
                }
            }
            return 'General';
        } catch (error) {
            console.error('Error getting subject name:', error);
            return 'General';
        }
    }
}

module.exports = FileSorter;

// Example usage
const sorter = new FileSorter();
sorter.sort_file('quantum_physics_notes.pdf')
    .then(([subjectCode, subjectName]) => {
        console.log(`File should be sorted under: ${subjectCode} - ${subjectName}`);
    });