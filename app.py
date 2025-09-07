import os
from flask import Flask, render_template, request, redirect, url_for, send_from_directory
from werkzeug.utils import secure_filename
from slicer import slice_image # Import our function from slicer.py

# Initialize the Flask application
app = Flask(__name__)

# --- Configuration ---
# Define the path for user-uploaded images
UPLOAD_FOLDER = 'uploads'
# Define the path for the generated puzzle pieces
OUTPUT_FOLDER = 'output'
# Allowed file extensions for upload
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'heic'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['OUTPUT_FOLDER'] = OUTPUT_FOLDER

# --- Helper Function ---
def allowed_file(filename):
    """Checks if the uploaded file has an allowed extension."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# --- Routes ---

@app.route('/')
def index():
    """Renders the home page (index.html) with the upload form."""
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    """Handles the image upload, slices it, and redirects to the puzzle page."""
    if 'image' not in request.files:
        return redirect(request.url) # Redirect back if no file part
    
    file = request.files['image']
    
    if file.filename == '':
        return redirect(request.url) # Redirect back if no file selected

    if file and allowed_file(file.filename):
        # Secure the filename to prevent directory traversal attacks
        filename = secure_filename(file.filename)
        # Save the uploaded file to the uploads folder
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(image_path)

        # Get rows and columns from the form
        rows = int(request.form.get('rows', 4))
        cols = int(request.form.get('cols', 4))

        # Call our slicer function to process the image
        slice_image(image_path, app.config['OUTPUT_FOLDER'], rows, cols)

        # --- Updated: Pass the original filename to the puzzle route ---
        return redirect(url_for('puzzle', rows=rows, cols=cols, filename=filename))

    return redirect(request.url) # Redirect if file type is not allowed

# --- Updated: The puzzle route now accepts the filename ---
@app.route('/puzzle/<int:rows>/<int:cols>/<path:filename>')
def puzzle(rows, cols, filename):
    """Renders the puzzle page, passing config and the original image filename."""
    return render_template('puzzle.html', rows=rows, cols=cols, image_filename=filename)

# --- New: Add a route to serve the original uploaded images ---
@app.route('/uploads/<path:filename>')
def get_upload_file(filename):
    """Serves files from the 'uploads' directory."""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/output/<path:filename>')
def get_output_file(filename):
    """Serves the generated puzzle piece images to the browser."""
    return send_from_directory(app.config['OUTPUT_FOLDER'], filename)

# This block allows you to run the app directly using 'python app.py'
if __name__ == '__main__':
    # Ensure the upload and output directories exist
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(OUTPUT_FOLDER, exist_ok=True)
    app.run(debug=True)