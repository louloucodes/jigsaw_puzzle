import { checkPuzzleCompletion } from './script.js';

// --- STATE ---
let draggedPiece = null;
let offsetX = 0;
let offsetY = 0;
let highestZ = 100; // For stacking pieces

// --- DRAG & DROP EVENT HANDLERS ---

function handleDragStart(e) {
    draggedPiece = e.target;
    
    // Calculate the mouse offset within the piece
    const rect = draggedPiece.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    // Bring the dragged piece to the top
    highestZ++;
    draggedPiece.style.zIndex = highestZ;

    e.dataTransfer.setData('text/plain', draggedPiece.id);
    e.dataTransfer.effectAllowed = 'move';

    // Use a timeout to hide the original piece after the browser has created the drag image
    setTimeout(() => {
        draggedPiece.style.opacity = '0.5';
    }, 0);
}

function handleDragEnd(e) {
    if (draggedPiece) {
        draggedPiece.style.opacity = '1';
        draggedPiece = null;
    }
}

function handleDragOver(e) {
    e.preventDefault(); // Necessary to allow dropping.
}

/**
 * NEW: Coordinate-based drop handler factory.
 */
export function createDropHandler(config, scale) { // MODIFIED: Accept scale
    const { puzzleBoard, piecesTray, imageWidth, imageHeight, ROWS, COLS } = config;
    const SNAP_RADIUS = 30; // How close in pixels to snap

    return function handleDrop(e) {
        e.preventDefault();
        if (!draggedPiece) return;

        const boardRect = puzzleBoard.getBoundingClientRect();
        const dropX = e.clientX;
        const dropY = e.clientY;

        // Check if the drop is within the puzzle board area
        if (dropX > boardRect.left && dropX < boardRect.right && dropY > boardRect.top && dropY < boardRect.bottom) {
            // --- Dropping on the Board ---
            puzzleBoard.appendChild(draggedPiece);

            // FIX: Use the original offsetX/Y from handleDragStart, not a recalculated one.
            // This correctly calculates the piece's top-left corner relative to the board.
            let newX = e.clientX - boardRect.left - offsetX;
            let newY = e.clientY - boardRect.top - offsetY;

            // Get the piece's correct final position and scale it
            const finalX = parseInt(draggedPiece.dataset.finalX) * scale;
            const finalY = parseInt(draggedPiece.dataset.finalY) * scale;

            // Check distance for snapping
            const distance = Math.sqrt(Math.pow(newX - finalX, 2) + Math.pow(newY - finalY, 2));

            if (distance < SNAP_RADIUS) {
                // Snap to place (using scaled coordinates)
                draggedPiece.style.left = `${finalX}px`;
                draggedPiece.style.top = `${finalY}px`;
                draggedPiece.style.transform = 'rotate(0deg)';
                draggedPiece.draggable = false;
                draggedPiece.classList.add('is-placed');
                checkPuzzleCompletion(config);
            } else {
                // Drop in place
                draggedPiece.style.left = `${newX}px`;
                draggedPiece.style.top = `${newY}px`;
                draggedPiece.style.transform = 'rotate(0deg)';
            }
        } else {
            // --- Dropping back on the Tray ---
            piecesTray.appendChild(draggedPiece);
            const trayRect = piecesTray.getBoundingClientRect();
            const pieceRect = draggedPiece.getBoundingClientRect();

            // Give it a new random position in the tray
            const randomTop = Math.random() * (trayRect.height - pieceRect.height);
            const randomLeft = Math.random() * (trayRect.width - pieceRect.width);

            draggedPiece.style.top = `${randomTop}px`;
            draggedPiece.style.left = `${randomLeft}px`;
        }
    }
}

/**
 * Attaches the necessary drag-and-drop listeners to elements.
 */
export function addDragDropListeners(element, handleDrop) {
    if (element.classList.contains('puzzle-piece')) {
        element.addEventListener('dragstart', handleDragStart);
        element.addEventListener('dragend', handleDragEnd);
    }
    // The board and tray are the primary drop targets
    if (element.id === 'puzzle-board' || element.id === 'pieces-tray') {
        element.addEventListener('dragover', handleDragOver);
        element.addEventListener('drop', handleDrop);
    }
}