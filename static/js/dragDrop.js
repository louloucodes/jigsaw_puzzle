import { handlePuzzleCompletion } from './script.js';

// --- STATE ---
// This needs to be managed here or passed around. Let's keep it modular.
let correctlyPlacedPieces = 0;

// --- DRAG & DROP EVENT HANDLERS ---

function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.id);
}

function handleDragOver(e) {
    e.preventDefault();
}

/**
 * This is a factory function. It creates the handleDrop function
 * with all the necessary context (like piece sizes and puzzle dimensions).
 */
export function createDropHandler(config) {
    const { ROWS, COLS, PIECE_WIDTH, PIECE_HEIGHT, puzzleBoard } = config;

    return function handleDrop(e) {
        e.preventDefault();
        
        const draggedPieceId = e.dataTransfer.getData('text/plain');
        const draggedPiece = document.getElementById(draggedPieceId);
        const dropTarget = e.target;

        // Check if the drop is valid
        if (dropTarget.className === 'piece-slot' && dropTarget.id === draggedPieceId) {
            
            // If piece came from the tray, leave a placeholder
            if (draggedPiece.parentElement.id === 'pieces-tray') {
                const placeholder = document.createElement('div');
                placeholder.className = 'tray-placeholder';
                placeholder.style.width = `${PIECE_WIDTH}px`;
                placeholder.style.height = `${PIECE_HEIGHT}px`;
                draggedPiece.parentElement.insertBefore(placeholder, draggedPiece);
            }
            
            draggedPiece.draggable = false;
            dropTarget.innerHTML = '';
            dropTarget.appendChild(draggedPiece);

            correctlyPlacedPieces++;
            if (correctlyPlacedPieces === ROWS * COLS) {
                handlePuzzleCompletion(puzzleBoard, config.IMAGE_FILENAME);
            }
        }
    }
}

/**
 * Attaches the drag-and-drop listeners to a piece.
 */
export function addDragListeners(piece) {
    piece.addEventListener('dragstart', handleDragStart);
}

/**
 * Attaches the drop listeners to a slot.
 */
export function addDropListeners(slot, handleDrop) {
    slot.addEventListener('dragover', handleDragOver);
    slot.addEventListener('drop', handleDrop);
}