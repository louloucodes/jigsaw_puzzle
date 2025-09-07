import { setupPuzzle } from './puzzleSetup.js';

/**
 * NEW: Checks the entire board to see if all pieces are in their correct slots.
 * This is called after every successful drop.
 */
export function checkPuzzleCompletion(config) {
    const { ROWS, COLS, puzzleBoard } = config;
    
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const slotId = `piece_${r}_${c}`;
            const slot = document.getElementById(slotId);
            
            // If a slot is empty or contains the wrong piece, the puzzle is not complete.
            if (slot.children.length === 0 || slot.children[0].id !== slotId) {
                return; // Exit early, puzzle is not solved.
            }
        }
    }

    // If the loop completes, all pieces are in the correct place.
    handlePuzzleCompletion(config);
}

/**
 * Handles the visual changes when the puzzle is successfully completed.
 */
function handlePuzzleCompletion(config) {
    console.log("Congratulations! Puzzle Complete!");
    config.gameContainer.classList.add('puzzle-complete');
    
    const finalImage = new Image();
    finalImage.src = `/uploads/${config.IMAGE_FILENAME}`;
    finalImage.className = 'final-image-overlay';

    config.puzzleBoard.style.position = 'relative';
    config.puzzleBoard.appendChild(finalImage);

    setTimeout(() => {
        finalImage.classList.add('visible');
    }, 10);

    // Make all pieces non-draggable
    const pieces = document.querySelectorAll('.puzzle-piece');
    pieces.forEach(p => p.draggable = false);
}

// --- Main Execution ---
document.addEventListener('DOMContentLoaded', function() {
    // Handle page reload
    const navigationEntries = performance.getEntriesByType("navigation");
    if (navigationEntries.length > 0 && navigationEntries[0].type === 'reload') {
        window.location.href = '/';
        return;
    }

    // --- CONFIGURATION ---
    const configScript = document.getElementById('puzzle-config');
    const config = {
        ROWS: parseInt(configScript.dataset.rows),
        COLS: parseInt(configScript.dataset.cols),
        IMAGE_FILENAME: configScript.dataset.imageFilename,
        gameContainer: document.getElementById('game-container'),
        puzzleBoard: document.getElementById('puzzle-board'),
        piecesTray: document.getElementById('pieces-tray')
    };
    
    // Start the puzzle setup process
    setupPuzzle(config);
});