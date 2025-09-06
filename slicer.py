import os
from PIL import Image, ImageDraw
import pillow_heif
from pathlib import Path
import argparse

# Register the HEIC opener with Pillow
pillow_heif.register_heif_opener()

def slice_image(image_path: str, output_dir: str, rows: int, cols: int):
    """
    Slices an image into a grid of pieces and saves them to an output directory.

    Args:
        image_path (str): The path to the input image.
        output_dir (str): The directory to save the puzzle pieces.
        rows (int): The number of rows to slice the image into.
        cols (int): The number of columns to slice the image into.
    """
    try:
        # Open the image
        img = Image.open(image_path)
        img_width, img_height = img.size

        # Calculate the width and height of each piece
        piece_width = img_width // cols
        piece_height = img_height // rows

        # Create the output directory if it doesn't exist
        Path(output_dir).mkdir(parents=True, exist_ok=True)

        # Use nested loops to iterate through the grid
        for r in range(rows):
            for c in range(cols):
                # Calculate the coordinates for the piece to be cropped
                left = c * piece_width
                top = r * piece_height
                right = left + piece_width
                bottom = top + piece_height

                # Crop the image to get the piece
                piece = img.crop((left, top, right, bottom))

                # --- Add a bevel effect to the piece ---
                draw = ImageDraw.Draw(piece)
                # Draw light lines on top and left for a highlight effect
                draw.line([(0, 0), (piece.width, 0)], fill="white", width=2)  # Top
                draw.line([(0, 0), (0, piece.height)], fill="white", width=2) # Left
                # Draw dark lines on bottom and right for a shadow effect
                draw.line([(0, piece.height - 1), (piece.width - 1, piece.height - 1)], fill="#808080", width=2) # Bottom
                draw.line([(piece.width - 1, 0), (piece.width - 1, piece.height - 1)], fill="#808080", width=2) # Right

                # Save the piece with a predictable name
                piece_filename = f"piece_{r}_{c}.png"
                piece.save(os.path.join(output_dir, piece_filename))
        
        print(f"Successfully sliced image into {rows * cols} pieces.")

    except FileNotFoundError:
        print(f"Error: The file was not found at '{image_path}'")
    except Exception as e:
        print(f"An error occurred: {e}")


# This block allows you to test the script directly from the command line
if __name__ == "__main__":
    # Define paths relative to the project root
    project_root = Path(__file__).parent
    default_image_path = project_root / "static" / "images" / "2024-10-29-autumn-leaves.HEIC"
    output_path = project_root / "output"

    # --- Command-Line Argument Parsing ---
    parser = argparse.ArgumentParser(description="Slices an image into a grid of puzzle pieces.")
    
    # Add optional arguments with a relative default path
    parser.add_argument("--image_path", 
                        default=default_image_path, 
                        help="The path to the image file to slice.")
    parser.add_argument("--rows", type=int, default=4, help="The number of rows for the puzzle.")
    parser.add_argument("--cols", type=int, default=4, help="The number of columns for the puzzle.")
    
    args = parser.parse_args()
    # --- End of Argument Parsing ---
    
    print(f"Slicing image: {args.image_path} into {args.rows} rows and {args.cols} columns.")
    slice_image(args.image_path, output_path, args.rows, args.cols)