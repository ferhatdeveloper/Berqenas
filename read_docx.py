import sys
sys.path.insert(0, r'C:\Users\FERHAT\AppData\Local\Programs\Python\Python311\Lib\site-packages')

try:
    from docx import Document
except ImportError:
    print("python-docx not installed, installing now...")
    import subprocess
    subprocess.check_call([r'C:\Users\FERHAT\AppData\Local\Programs\Python\Python311\python.exe', '-m', 'pip', 'install', 'python-docx'])
    from docx import Document

# Read the DOCX file
doc = Document('chatgpt.docx')

# Extract all text
full_text = []
for para in doc.paragraphs:
    full_text.append(para.text)

# Print the content
print('\n'.join(full_text))
