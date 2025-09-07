import { setupPuzzle } from './puzzleSetup.js';

/**
 * Handles the visual changes when the puzzle is successfully completed.
 * Exported so it can be called from the dragDrop module.
 */
export function handlePuzzleCompletion(puzzleBoard, imageFilename) {
    console.log("Congratulations! Puzzle Complete!");
    document.getElementById('game-container').classList.add('puzzle-complete');
    
    const finalImage = new Image();
    finalImage.src = `/uploads/${imageFilename}`;
    finalImage.className = 'final-image-overlay';

    puzzleBoard.style.position = 'relative';
    puzzleBoard.appendChild(finalImage);

    setTimeout(() => {
        finalImage.classList.add('visible');
    }, 10);
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