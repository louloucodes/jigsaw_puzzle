import os
import json
from flask import Flask, render_template, request, redirect, url_for, send_from_directory
from werkzeug.utils import secure_filename
from slicer import slice_image

# Initialize the Flask application
app = Flask(__name__)

# --- Configuration ---
# FIX: Use absolute paths for folder configuration
basedir = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.join(basedir, 'uploads')
OUTPUT_FOLDER = os.path.join(basedir, 'output')

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
    # Clean up old puzzle pieces before starting a new session
    if os.path.exists(app.config['OUTPUT_FOLDER']):
        for f in os.listdir(app.config['OUTPUT_FOLDER']):
            os.remove(os.path.join(app.config['OUTPUT_FOLDER'], f))
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'image' not in request.files:
        return redirect(request.url)
    file = request.files['image']
    if file.filename == '':
        return redirect(request.url)
    if file and allowed_file(file.filename):
        # Secure the filename to prevent directory traversal attacks
        filename = secure_filename(file.filename)
        # Save the uploaded file to the uploads folder
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(image_path)

        try:
            rows = int(request.form.get('rows', 4))
            cols = int(request.form.get('cols', 4))

            # FIX: Correct the argument order to match the slicer.py function definition
            pieces_metadata, img_width, img_height = slice_image(
                image_path=image_path, 
                output_dir=app.config['OUTPUT_FOLDER'], 
                rows=rows, 
                cols=cols
            )

            # Pass all data to the puzzle template
            return render_template('puzzle.html', 
                                   rows=rows, 
                                   cols=cols, 
                                   image_filename=filename,
                                   pieces_metadata=json.dumps(pieces_metadata),
                                   image_width=img_width,      # NEW
                                   image_height=img_height)    # NEW
        except Exception as e:
            # Handle potential errors during slicing
            print(f"Error processing image: {e}")
            return redirect(url_for('index'))
    
    return redirect(url_for('index')) # Redirect if file type is not allowed

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