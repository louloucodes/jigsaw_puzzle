import { checkPuzzleCompletion } from './script.js';

// --- STATE ---
// A global variable to hold the piece being dragged. This is key to the fix.
let draggedPiece = null;

// --- DRAG & DROP EVENT HANDLERS ---

function handleDragStart(e) {
    // Set the global variable to the element being dragged.
    draggedPiece = e.target;
    
    // Use dataTransfer to signal a drag is happening, but the primary
    // reference is our `draggedPiece` variable.
    e.dataTransfer.setData('text/plain', draggedPiece.id);
    e.dataTransfer.effectAllowed = 'move';

    // --- FIX: Immediately detach the piece from the DOM ---
    // This makes its original slot truly empty right away.
    // We use a timeout to ensure this happens after the drag operation has officially started.
    setTimeout(() => {
        draggedPiece.style.display = 'none';
    }, 0);
}

function handleDragEnd(e) {
    // This event fires when the drag is over (dropped or cancelled).
    // We make the piece visible again and clear our global reference.
    if (draggedPiece) {
        draggedPiece.style.display = 'block';
        draggedPiece = null;
    }
}

function handleDragOver(e) {
    e.preventDefault(); // Necessary to allow dropping.
}

/**
 * This is a factory function. It creates a universal handleDrop function.
 */
export function createDropHandler(config) {
    const { piecesTray } = config;

    return function handleDrop(e) {
        e.preventDefault();
        if (!draggedPiece) return; // If nothing is being dragged, do nothing.

        let dropTarget = e.target;
        let destinationContainer;

        // Determine the actual container we are dropping into.
        if (dropTarget.classList.contains('puzzle-piece')) {
            destinationContainer = dropTarget.parentElement;
        } else if (dropTarget.classList.contains('piece-slot') || dropTarget.id === 'pieces-tray') {
            destinationContainer = dropTarget;
        } else {
            return; // Invalid drop target
        }

        // --- Simplified Logic based on your rules ---
        if (destinationContainer.id === 'pieces-tray') {
            destinationContainer.appendChild(draggedPiece);
        } else if (destinationContainer.classList.contains('piece-slot') && destinationContainer.children.length === 0) {
            destinationContainer.appendChild(draggedPiece);
        }

        // After any valid move, check if the puzzle is complete.
        checkPuzzleCompletion(config);
    }
}

/**
 * Attaches the necessary drag-and-drop listeners to elements.
 */
export function addDragDropListeners(element, handleDrop) {
    if (element.classList.contains('puzzle-piece')) {
        element.addEventListener('dragstart', handleDragStart);
        element.addEventListener('dragend', handleDragEnd); // Add the dragend listener
    }
    if (element.classList.contains('piece-slot') || element.id === 'pieces-tray') {
        element.addEventListener('dragover', handleDragOver);
        element.addEventListener('drop', handleDrop);
    }
}