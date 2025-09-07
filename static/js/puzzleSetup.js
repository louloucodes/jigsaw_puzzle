import { createDropHandler, addDragDropListeners } from './dragDrop.js';
import { calculateLayout } from './layout.js'; // NEW: Import layout helper

/**
 * Sets up the puzzle based on coordinate data.
 */
export function setupPuzzle(config) {
    const { puzzleBoard, piecesTray, piecesMetadata, imageWidth, imageHeight, ROWS, COLS, IMAGE_FILENAME } = config;

    // --- NEW: Calculate responsive layout ---
    const { boardWidth, boardHeight } = calculateLayout(imageWidth, imageHeight);
    const scale = boardWidth / imageWidth; // The scale factor we applied

    // Clear any existing content
    const completionMessage = piecesTray.querySelector('#completion-message');
    puzzleBoard.innerHTML = '';
    piecesTray.innerHTML = '';
    if (completionMessage) {
        piecesTray.appendChild(completionMessage);
    }

    // Set the puzzle board dimensions to the new calculated size
    puzzleBoard.style.width = `${boardWidth}px`;
    puzzleBoard.style.height = `${boardHeight}px`;

    // Set the pieces tray to be the same size
    piecesTray.style.width = `${boardWidth}px`;
    piecesTray.style.height = `${boardHeight}px`;

    // --- Create the final image overlay and add to board ---
    const finalImage = new Image();
    finalImage.src = `/uploads/${IMAGE_FILENAME}`;
    finalImage.className = 'final-image-overlay';
    puzzleBoard.appendChild(finalImage);

    // --- Add Cheat Mode Logic here ---
    const cheatToggle = document.getElementById('cheat-toggle');
    const cheatImage = new Image();
    cheatImage.src = `/uploads/${IMAGE_FILENAME}`;
    cheatImage.className = 'cheat-image-bg';
    puzzleBoard.appendChild(cheatImage);

    // Reset checkbox state and board class on new puzzle setup
    cheatToggle.checked = false;
    puzzleBoard.classList.remove('cheat-mode-on');

    cheatToggle.addEventListener('change', () => {
        puzzleBoard.classList.toggle('cheat-mode-on');
    });

    // Create the drop handler once, passing the new scale factor
    const handleDrop = createDropHandler(config, scale);

    // Add drop listeners to the board and tray
    addDragDropListeners(puzzleBoard, handleDrop);
    addDragDropListeners(piecesTray, handleDrop);

    // Calculate scaled piece dimensions
    const pieceWidth = boardWidth / COLS;
    const pieceHeight = boardHeight / ROWS;

    // Create pieces from metadata and add to tray
    piecesMetadata.forEach(pieceData => {
        const piece = document.createElement('img');
        piece.id = pieceData.id;
        piece.src = `/output/${pieceData.id}.png`;
        piece.className = 'puzzle-piece';
        piece.draggable = true;

        // Set the piece's dimensions based on the new scale
        piece.style.width = `${pieceWidth}px`;
        piece.style.height = `${pieceHeight}px`;

        // Store the original final coordinates on the piece itself
        piece.dataset.finalX = pieceData.final_x;
        piece.dataset.finalY = pieceData.final_y;

        // Randomize position within the tray
        const randomTop = Math.random() * (boardHeight - pieceHeight);
        const randomLeft = Math.random() * (boardWidth - pieceWidth);

        piece.style.top = `${randomTop}px`;
        piece.style.left = `${randomLeft}px`;

        addDragDropListeners(piece, handleDrop);
        piecesTray.appendChild(piece);
    });
}