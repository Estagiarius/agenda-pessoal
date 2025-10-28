import fitz  # PyMuPDF
import os

def extract_text_from_pdf(pdf_path: str):
    """
    Extracts text from a given PDF file.

    Args:
        pdf_path (str): The file path to the PDF.

    Returns:
        str: The extracted text, or an error message if something goes wrong.
    """
    if not os.path.exists(pdf_path):
        return "Erro: Arquivo não encontrado."

    try:
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text
    except Exception as e:
        return f"Erro ao processar o PDF: {e}"

# For testing purposes
if __name__ == '__main__':
    # Create a dummy PDF for testing
    test_pdf_path = "dummy_test.pdf"
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 72), "Este é um teste de extração de texto de um PDF.")
    page.insert_text((50, 92), "A segunda linha contém mais informações.")
    doc.save(test_pdf_path)
    doc.close()

    print(f"--- Testando extração de texto do PDF: '{test_pdf_path}' ---")
    extracted_text = extract_text_from_pdf(test_pdf_path)
    print("Texto extraído:")
    print(extracted_text)

    # Clean up the dummy file
    os.remove(test_pdf_path)
    print(f"\nArquivo de teste '{test_pdf_path}' removido.")
