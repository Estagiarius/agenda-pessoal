# Import necessary modules
import webbrowser
import os

# Get the absolute path to the directory where this script is located
# __file__ is a special variable that holds the path to the current script
script_dir = os.path.abspath(os.path.dirname(__file__))

# Construct the absolute path to the index.html file
# It's assumed that index.html is in the same directory as this script
html_file_name = "index.html"
html_file_path = os.path.join(script_dir, html_file_name)

# Create a file URI by prefixing with "file://"
# This is necessary for webbrowser.open() to correctly interpret local file paths
file_uri = "file://" + html_file_path

# Open the HTML file in the default web browser
print(f"Attempting to open: {file_uri}")
try:
    webbrowser.open(file_uri)
    print("Browser launch attempted.")
except Exception as e:
    print(f"An error occurred: {e}")

# As an example, create a dummy index.html if it doesn't exist,
# so the script can be tested.
# In a real scenario, index.html should already exist.
if not os.path.exists(html_file_path):
    print(f"Creating dummy {html_file_name} for testing purposes.")
    with open(html_file_path, "w") as f:
        f.write("<h1>Hello World!</h1><p>This is a test page.</p>")
    print(f"{html_file_name} created.")
else:
    print(f"{html_file_name} already exists.")
