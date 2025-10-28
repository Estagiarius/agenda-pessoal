import requests
from bs4 import BeautifulSoup

def search_web(url: str):
    """
    Fetches the content from a URL and returns the clean text.

    Args:
        url (str): The URL to scrape.

    Returns:
        str: The clean text content of the webpage, or an error message.
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()  # Raise an exception for bad status codes

        soup = BeautifulSoup(response.content, 'html.parser')

        # Remove script and style elements
        for script_or_style in soup(['script', 'style']):
            script_or_style.decompose()

        # Get text and clean it up
        text = soup.get_text()
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        clean_text = '\n'.join(chunk for chunk in chunks if chunk)

        # Truncate to a reasonable length for the LLM context
        return clean_text[:2000]

    except requests.exceptions.RequestException as e:
        return f"Erro ao acessar a URL: {e}"
    except Exception as e:
        return f"Ocorreu um erro ao processar a página: {e}"


# Example for testing
if __name__ == '__main__':
    print("--- Teste 1: Buscando a página principal do Maritaca AI ---")
    test_url_1 = "https://maritaca.ai/"
    print(search_web(test_url_1))

    print("\n--- Teste 2: Testando uma URL inválida ---")
    test_url_2 = "http://invalid-url-for-testing.com"
    print(search_web(test_url_2))
