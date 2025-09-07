document.addEventListener('DOMContentLoaded', function() {
    // --- CONFIGURATION ---
    // Get config from the script tag's data attributes
    const configScript = document.getElementById('puzzle-config');
    const ROWS = parseInt(configScript.dataset.rows);
    const COLS = parseInt(configScript.dataset.cols);
    
    // --- DOM ELEMENTS ---
    const gameContainer = document.getElementById('game-container');
    const puzzleBoard = document.getElementById('puzzle-board');
    const piecesTray = document.getElementById('pieces-tray');

    // --- DYNAMIC SIZING (New Logic) ---
    // Calculate the available width for the puzzle board (half the container width minus gaps)
    const containerWidth = gameContainer.offsetWidth;
    const boardContainerWidth = (containerWidth / 2) - 40; // Account for gaps/padding
    const PIECE_WIDTH = boardContainerWidth / COLS;
    let PIECE_HEIGHT; // Will be set after the first image loads

    // --- STATE ---
    let correctlyPlacedPieces = 0;

    // --- FUNCTIONS ---

    /**
     * Sets the grid layout for the puzzle board and pieces tray based on the configuration.
     */
    function setupGridLayout() {
        const tempImg = new Image();
        tempImg.src = `/output/piece_0_0.png`;
        tempImg.onload = () => {
            const aspectRatio = tempImg.height / tempImg.width;
            PIECE_HEIGHT = PIECE_WIDTH * aspectRatio;

            // Set board dimensions
            puzzleBoard.style.width = `${COLS * PIECE_WIDTH}px`;
            puzzleBoard.style.height = `${ROWS * PIECE_HEIGHT}px`;
            puzzleBoard.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;
            puzzleBoard.style.gridTemplateRows = `repeat(${ROWS}, 1fr)`;

            // Set tray grid layout
            piecesTray.style.gridTemplateColumns = `repeat(2, ${PIECE_WIDTH}px)`;
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
            // Dynamically set piece size
            piece.style.width = `${PIECE_WIDTH}px`;
            piece.style.height = `${PIECE_HEIGHT}px`;
            
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
        const draggedPiece = document.getElementById(draggedPieceId);
        const dropTarget = e.target;

        // Check if the drop is valid (correct piece in the correct slot)
        if (dropTarget.className === 'piece-slot' && dropTarget.id === draggedPieceId) {
            
            // --- New: Create and insert a placeholder in the tray ---
            // Check if the piece came from the tray
            if (draggedPiece.parentElement.id === 'pieces-tray') {
                const placeholder = document.createElement('div');
                placeholder.className = 'tray-placeholder';
                // --- New: Dynamically size the placeholder ---
                placeholder.style.width = `${PIECE_WIDTH}px`;
                placeholder.style.height = `${PIECE_HEIGHT}px`;
                // Insert the placeholder right before the piece we are moving
                draggedPiece.parentElement.insertBefore(placeholder, draggedPiece);
            }
            
            // Make the piece no longer draggable
            draggedPiece.draggable = false;
            
            // Clear the slot and append the piece
            dropTarget.innerHTML = '';
            dropTarget.appendChild(draggedPiece);

            // Check for puzzle completion
            correctlyPlacedPieces++;
            if (correctlyPlacedPieces === ROWS * COLS) {
                handlePuzzleCompletion();
            }
        }
    }

    // --- New: Puzzle Completion Handler ---
    /**
     * Handles the visual changes when the puzzle is successfully completed.
     */
    function handlePuzzleCompletion() {
        console.log("Congratulations! Puzzle Complete!");

        // --- New: Add a class to the main container to trigger CSS transitions ---
        document.getElementById('game-container').classList.add('puzzle-complete');
        
        // Go through each slot on the board
        const slots = puzzleBoard.getElementsByClassName('piece-slot');
        for (const slot of slots) {
            const piece = slot.getElementsByTagName('img')[0];
            if (piece) {
                // Swap the image source to the flat version
                piece.src = piece.src.replace('.png', '_flat.png');
            }
        }
    }


    // --- INITIALIZATION ---
    // Wait for the image to load before initializing the puzzle pieces
    const tempImg = new Image();
    tempImg.src = `/output/piece_0_0.png`;
    tempImg.onload = () => {
        const aspectRatio = tempImg.height / tempImg.width;
        PIECE_HEIGHT = PIECE_WIDTH * aspectRatio;
        
        // Now that we have all sizes, set up the grid and create the pieces
        puzzleBoard.style.width = `${COLS * PIECE_WIDTH}px`;
        puzzleBoard.style.height = `${ROWS * PIECE_HEIGHT}px`;
        puzzleBoard.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;
        puzzleBoard.style.gridTemplateRows = `repeat(${ROWS}, 1fr)`;
        piecesTray.style.gridTemplateColumns = `repeat(2, ${PIECE_WIDTH}px)`;

        initializePuzzle();
    };
});