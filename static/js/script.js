document.addEventListener('DOMContentLoaded', function() {
    // --- CONFIGURATION ---
    // Get config from the script tag's data attributes
    const configScript = document.getElementById('puzzle-config');
    const ROWS = parseInt(configScript.dataset.rows);
    const COLS = parseInt(configScript.dataset.cols);
    const PIECE_WIDTH = 100; // Should match target_piece_width in slicer.py

    // --- DOM ELEMENTS ---
    const puzzleBoard = document.getElementById('puzzle-board');
    const piecesTray = document.getElementById('pieces-tray');

    // --- STATE ---
    let draggedPiece = null;

    // --- FUNCTIONS ---

    /**
     * Sets the grid layout for the puzzle board and pieces tray based on the configuration.
     */
    function setupGridLayout() {
        // Calculate the aspect ratio from the first piece to set the board height correctly
        const tempImg = new Image();
        tempImg.src = `/output/piece_0_0.png`; // Assumes Flask serves the output folder
        tempImg.onload = () => {
            const aspectRatio = tempImg.height / tempImg.width;
            const pieceHeight = PIECE_WIDTH * aspectRatio;

            puzzleBoard.style.width = `${COLS * PIECE_WIDTH}px`;
            puzzleBoard.style.height = `${ROWS * pieceHeight}px`;
            puzzleBoard.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;
            puzzleBoard.style.gridTemplateRows = `repeat(${ROWS}, 1fr)`;

            // Change the pieces tray to have a 2-column grid
            piecesTray.style.gridTemplateColumns = `repeat(2, 1fr)`;
        };
    }

    /**
     * Creates and populates the puzzle board with empty slots and the pieces tray with shuffled pieces.
     */
    function initializePuzzle() {
        let pieces = [];
        // Create a list of all piece names
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                pieces.push(`piece_${r}_${c}`);
            }
        }

        // Shuffle the pieces for the tray
        pieces.sort(() => Math.random() - 0.5);

        // Create and add the shuffled pieces to the tray
        for (const pieceId of pieces) {
            const piece = document.createElement('img');
            piece.src = `/output/${pieceId}.png`;
            piece.id = pieceId;
            piece.className = 'puzzle-piece';
            piece.draggable = true;
            
            // Add drag event listeners to the piece
            piece.addEventListener('dragstart', handleDragStart);
            
            piecesTray.appendChild(piece);
        }

        // Create and add the empty slots to the board
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const slot = document.createElement('div');
                // The slot's ID must match the piece that belongs there
                slot.id = `piece_${r}_${c}`; 
                slot.className = 'piece-slot';

                // Add drop event listeners to the slot
                slot.addEventListener('dragover', handleDragOver);
                slot.addEventListener('drop', handleDrop);

                puzzleBoard.appendChild(slot);
            }
        }
    }

    // --- DRAG & DROP EVENT HANDLERS ---

    /**
     * Stores the ID of the piece being dragged.
     */
    function handleDragStart(e) {
        // The 'dataTransfer' object holds the data being dragged
        e.dataTransfer.setData('text/plain', e.target.id);
    }

    /**
     * Prevents the default browser behavior to allow a drop.
     */
    function handleDragOver(e) {
        e.preventDefault(); // This is necessary to signal that this element is a valid drop target.
    }

    /**
     * Handles the logic when a piece is dropped onto a slot.
     */
    function handleDrop(e) {
        e.preventDefault();
        
        const draggedPieceId = e.dataTransfer.getData('text/plain');
        const dropTarget = e.target;

        // Check if the dropped piece's ID matches the slot's ID
        if (dropTarget.className === 'piece-slot' && dropTarget.id === draggedPieceId) {
            const piece = document.getElementById(draggedPieceId);
            
            // Make the piece no longer draggable and remove it from the tray
            piece.draggable = false;
            
            // Clear the slot and append the piece
            dropTarget.innerHTML = '';
            dropTarget.appendChild(piece);
        }
    }

    // --- INITIALIZATION ---
    setupGridLayout();
    initializePuzzle();
});