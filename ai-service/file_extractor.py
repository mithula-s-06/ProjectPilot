import io
import xml.etree.ElementTree as ET
import zipfile

def extract_text_from_file(file_bytes: bytes, content_type: str, file_name: str) -> str:
    """
    Extracts readable text from various file formats (PDF, Docx, Images, Plain Text).
    Handles dependencies dynamically to prevent crashes if certain libraries are missing.
    """
    if not file_bytes:
        return ""

    content_type = (content_type or "").lower().strip()
    file_name = (file_name or "").lower().strip()

    # 1. Plain Text / JSON / MD files
    if "text" in content_type or file_name.endswith(('.txt', '.md', '.json', '.csv', '.xml', '.html', '.js', '.py', '.java', '.css')):
        try:
            return file_bytes.decode('utf-8', errors='ignore')
        except Exception as e:
            print(f"Plain text decoding failed: {e}")
            return ""

    # 2. PDF Documents
    if "pdf" in content_type or file_name.endswith('.pdf'):
        try:
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            text = ""
            for page in reader.pages:
                text += (page.extract_text() or "") + "\n"
            return text.strip()
        except ImportError:
            print("pypdf library not installed. PDF extraction skipped.")
            return ""
        except Exception as e:
            print(f"PDF extraction failed: {e}")
            return ""

    # 3. Word Documents (DOCX)
    if "wordprocessingml" in content_type or file_name.endswith('.docx'):
        try:
            with zipfile.ZipFile(io.BytesIO(file_bytes)) as docx:
                xml_content = docx.read('word/document.xml')
                root = ET.fromstring(xml_content)
                ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
                texts = [node.text for node in root.findall('.//w:t', ns) if node.text]
                return " ".join(texts).strip()
        except Exception as e:
            print(f"Word DOCX extraction failed: {e}")
            return ""

    # 4. Images (PNG, JPG, JPEG) - running OCR
    if "image" in content_type or file_name.endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff')):
        # Try EasyOCR
        try:
            import easyocr
            # Initialize reader (English language)
            reader = easyocr.Reader(['en'], gpu=False, verbose=False)
            results = reader.readtext(file_bytes)
            extracted_words = [res[1] for res in results]
            if extracted_words:
                return " ".join(extracted_words).strip()
        except ImportError:
            print("easyocr not installed. Trying pytesseract...")
        except Exception as e:
            print(f"EasyOCR extraction failed: {e}")

        # Try Pytesseract as fallback
        try:
            import pytesseract
            from PIL import Image
            img = Image.open(io.BytesIO(file_bytes))
            return pytesseract.image_to_string(img).strip()
        except ImportError:
            print("pytesseract library not installed. OCR skipped.")
            return ""
        except Exception as e:
            print(f"Pytesseract OCR extraction failed: {e}")
            return ""

    return ""
