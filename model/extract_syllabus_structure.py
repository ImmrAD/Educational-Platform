import fitz
import re
import json
from collections import defaultdict

def clean_text(text):
    # Remove extra whitespace and normalize text
    return ' '.join(text.split())

def extract_module_content(lines, start_idx):
    content = []
    i = start_idx
    while i < len(lines) and not (re.match(r'^FEC\d{3}$', lines[i].strip()) or 'Module' in lines[i]):
        line = clean_text(lines[i].strip())
        if line and not line.startswith('Teaching'):
            content.append(line)
        i += 1
    return ' '.join(content), i

pdf_path = "FE-Final-Syllabus-approved-by-AC-on-26th-July-2019.pdf"
doc = fitz.open(pdf_path)

lines = []
for page in doc:
    lines.extend(page.get_text().split('\n'))

syllabus = defaultdict(lambda: defaultdict(list))

current_semester = None
current_subject_code = None
current_subject = None
current_subject_keywords = []

print("🔍 Scanning for syllabus structure...\n")

i = 0
while i < len(lines):
    line = lines[i].strip()

    # Match Semester lines
    if re.match(r"Semester\s+[IVXLC]+", line, re.IGNORECASE):
        current_semester = line.strip().title()
        print(f"📘 Found Semester: {current_semester}")
        i += 1
        continue

    # Match Subject codes like FEC101
    if re.match(r'^FEC\d{3}$', line):
        current_subject_code = line
        current_subject_keywords = []
        
        # Look ahead for subject title and course objectives
        j = i + 1
        while j < min(i + 10, len(lines)):
            next_line = lines[j].strip()
            if re.match(r'^FEC\d{3}$', next_line):
                break
            if next_line and not next_line.startswith('Teaching'):
                current_subject_keywords.append(clean_text(next_line))
            j += 1
            
        subject_title = current_subject_keywords[0] if current_subject_keywords else ''
        current_subject = f"{current_subject_code} - {subject_title}"
        print(f"📗 Found Subject: {current_subject}")
        i = j
        continue

    # Try to capture Module and its content
    if "Module" in line and current_subject and current_semester:
        module_content, next_i = extract_module_content(lines, i + 1)
        
        if module_content:
            module_data = {
                "module": "Module",
                "topic": module_content,
                "subject_keywords": current_subject_keywords
            }
            syllabus[current_semester][current_subject].append(module_data)
            print(f"✅ Found Module under {current_subject}: {module_content[:100]}...")
        
        i = next_i
        continue

    i += 1

# Save result
output_path = "syllabus_structure.json"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(syllabus, f, indent=2)

print(f"\n✅ Syllabus structure saved to: {output_path}")
