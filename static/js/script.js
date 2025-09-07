import { setupPuzzle } from './puzzleSetup.js';

/**
 * Checks if all puzzle pieces are in their correct final positions.
 */
export function checkPuzzleCompletion(config) {
    const { piecesMetadata } = config;
    const placedPieces = document.querySelectorAll('.puzzle-piece.is-placed');

    if (placedPieces.length === piecesMetadata.length) {
        handlePuzzleCompletion(config);
    }
}

/**
 * Handles the visual celebration when the puzzle is completed.
 */
export function handlePuzzleCompletion(config) {
    const { gameContainer, puzzleBoard } = config;

    // Find the overlay image we created during setup
    const finalImage = puzzleBoard.querySelector('.final-image-overlay');

    // Add classes to trigger the completion animations
    if (finalImage) {
        finalImage.classList.add('visible');
    }
    gameContainer.classList.add('puzzle-complete');

    // Make all pieces non-draggable to prevent interference
    const pieces = document.querySelectorAll('.puzzle-piece');
    pieces.forEach(p => p.draggable = false);
}

// --- Main Execution ---
document.addEventListener('DOMContentLoaded', function() {
    // The reload check has already been performed.

    // --- CONFIGURATION ---
    const configScript = document.getElementById('puzzle-config');

    // --- FIX: Only run puzzle logic if we are on the puzzle page ---
    if (configScript) {
        const config = {
            ROWS: parseInt(configScript.dataset.rows),
            COLS: parseInt(configScript.dataset.cols),
            IMAGE_FILENAME: configScript.dataset.imageFilename,
            piecesMetadata: JSON.parse(configScript.dataset.piecesMetadata),
            imageWidth: parseInt(configScript.dataset.imageWidth),
            imageHeight: parseInt(configScript.dataset.imageHeight),
            gameContainer: document.getElementById('game-container'),
            puzzleBoard: document.getElementById('puzzle-board'),
            piecesTray: document.getElementById('pieces-tray')
        };
        
        // Start the puzzle setup process
        setupPuzzle(config);
    }
});