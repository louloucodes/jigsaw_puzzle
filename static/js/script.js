document.addEventListener('DOMContentLoaded', function() {
    // --- CONFIGURATION ---
    // Get config from the script tag's data attributes
    const configScript = document.getElementById('puzzle-config');
    const ROWS = parseInt(configScript.dataset.rows);
    const COLS = parseInt(configScript.dataset.cols);
    // --- New: Get the original image filename ---
    const IMAGE_FILENAME = configScript.dataset.imageFilename;
    
    // --- DOM ELEMENTS ---
    const gameContainer = document.getElementById('game-container');
    const puzzleBoard = document.getElementById('puzzle-board');
    const piecesTray = document.getElementById('pieces-tray');

    // --- DYNAMIC SIZING ---
    // This is the single source of truth for sizing.
    // It calculates piece size based on the available space for the board.
    const containerWidth = gameContainer.offsetWidth;
    const boardContainerWidth = (containerWidth / 2) - 40; // Account for gaps/padding
    const PIECE_WIDTH = boardContainerWidth / COLS;
    let PIECE_HEIGHT; // Will be set after the first image loads to get the aspect ratio.

    // --- STATE ---
    let correctlyPlacedPieces = 0;

    /**
     * Creates and populates the puzzle board with empty slots and the pieces tray with shuffled pieces.
     * This function now assumes PIECE_WIDTH and PIECE_HEIGHT are already calculated.
     */
    function initializePuzzle() {
        let pieces = [];
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                pieces.push(`piece_${r}_${c}`);
            }
        }
        pieces.sort(() => Math.random() - 0.5);

        // Create and add the shuffled pieces to the tray
        for (const pieceId of pieces) {
            const piece = document.createElement('img');
            piece.src = `/output/${pieceId}.png`;
            piece.id = pieceId;
            piece.className = 'puzzle-piece';
            piece.draggable = true;
            
            // **Crucially, set the size of each piece before adding it to the DOM**
            piece.style.width = `${PIECE_WIDTH}px`;
            piece.style.height = `${PIECE_HEIGHT}px`;
            
            piece.addEventListener('dragstart', handleDragStart);
            piecesTray.appendChild(piece);
        }

        // Create and add the empty slots to the board
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const slot = document.createElement('div');
                slot.id = `piece_${r}_${c}`; 
                slot.className = 'piece-slot';
                slot.addEventListener('dragover', handleDragOver);
                slot.addEventListener('drop', handleDrop);
                puzzleBoard.appendChild(slot);
            }
        }
    }

    // --- DRAG & DROP EVENT HANDLERS ---
    function handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.id);
    }

    function handleDragOver(e) {
        e.preventDefault();
    }

    function handleDrop(e) {
        e.preventDefault();
        
        const draggedPieceId = e.dataTransfer.getData('text/plain');
        const draggedPiece = document.getElementById(draggedPieceId);
        const dropTarget = e.target;

        if (dropTarget.className === 'piece-slot' && dropTarget.id === draggedPieceId) {
            
            if (draggedPiece.parentElement.id === 'pieces-tray') {
                const placeholder = document.createElement('div');
                placeholder.className = 'tray-placeholder';
                // Set placeholder size to match the pieces
                placeholder.style.width = `${PIECE_WIDTH}px`;
                placeholder.style.height = `${PIECE_HEIGHT}px`;
                draggedPiece.parentElement.insertBefore(placeholder, draggedPiece);
            }
            
            draggedPiece.draggable = false;
            dropTarget.innerHTML = '';
            dropTarget.appendChild(draggedPiece);

            correctlyPlacedPieces++;
            if (correctlyPlacedPieces === ROWS * COLS) {
                handlePuzzleCompletion();
            }
        }
    }

    // --- Puzzle Completion Handler (New, Simpler Logic) ---
    function handlePuzzleCompletion() {
        console.log("Congratulations! Puzzle Complete!");
        gameContainer.classList.add('puzzle-complete');
        
        // 1. Create a new image element for the final, complete image.
        const finalImage = new Image();
        finalImage.src = `/uploads/${IMAGE_FILENAME}`; // Use the original uploaded image
        finalImage.className = 'final-image-overlay';

        // 2. Make the puzzle board a positioning context for the overlay.
        puzzleBoard.style.position = 'relative';
        
        // 3. Add the final image to the puzzle board. It will be invisible at first.
        puzzleBoard.appendChild(finalImage);

        // 4. Use a timeout to trigger the fade-in effect.
        setTimeout(() => {
            finalImage.classList.add('visible');
        }, 10);
    }

    // --- INITIALIZATION ---
    // We must calculate the final piece height before we can build the puzzle.
    // We do this by loading one piece image in memory to get its aspect ratio.
    const tempImg = new Image();
    tempImg.src = `/output/piece_0_0.png`; // Load the first piece to check aspect ratio
    tempImg.onload = () => {
        // 1. Calculate the final PIECE_HEIGHT
        const aspectRatio = tempImg.height / tempImg.width;
        PIECE_HEIGHT = PIECE_WIDTH * aspectRatio;
        
        // 2. Set the dimensions of the board container
        puzzleBoard.style.width = `${COLS * PIECE_WIDTH}px`;
        puzzleBoard.style.height = `${ROWS * PIECE_HEIGHT}px`;
        puzzleBoard.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;
        puzzleBoard.style.gridTemplateRows = `repeat(${ROWS}, 1fr)`;
        
        // --- Corrected: Make the tray dimensions match the board ---
        // The tray will have the same grid structure as the board to ensure it has the same size.
        piecesTray.style.width = `${COLS * PIECE_WIDTH}px`;
        piecesTray.style.height = `${ROWS * PIECE_HEIGHT}px`;
        piecesTray.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;
        piecesTray.style.gridTemplateRows = `repeat(${ROWS}, 1fr)`;

        // 3. Now that all sizes are known, create and display the puzzle pieces.
        initializePuzzle();
    };
});