from flask import Flask, render_template

# Initialize the Flask application
app = Flask(__name__)

# Define the route for the home page
@app.route('/')
def index():
    """
    Renders the home page (index.html), which contains the image upload form.
    """
    return render_template('index.html')

# This block allows you to run the app directly using 'python app.py'
if __name__ == '__main__':
    app.run(debug=True)