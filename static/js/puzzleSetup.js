import { createDropHandler, addDragDropListeners } from './dragDrop.js';

/**
 * Calculates piece and board sizes and creates all puzzle elements.
 */
export function setupPuzzle(config) {
    const { ROWS, COLS, gameContainer, puzzleBoard, piecesTray } = config;

    const tempImg = new Image();
    tempImg.src = `/output/piece_0_0.png`;
    tempImg.onload = () => {
        const aspectRatio = tempImg.height / tempImg.width;

        // --- Sizing Calculation (remains the same) ---
        const availableWidth = (gameContainer.offsetWidth / 2) - 40;
        const availableHeight = window.innerHeight - 150;
        const widthConstrainedPieceWidth = availableWidth / COLS;
        const widthConstrainedTotalHeight = ROWS * (widthConstrainedPieceWidth * aspectRatio);
        const heightConstrainedPieceHeight = availableHeight / ROWS;
        const heightConstrainedPieceWidth = heightConstrainedPieceHeight / aspectRatio;

        let PIECE_WIDTH, PIECE_HEIGHT;
        if (widthConstrainedTotalHeight <= availableHeight) {
            PIECE_WIDTH = widthConstrainedPieceWidth;
        } else {
            PIECE_WIDTH = heightConstrainedPieceWidth;
        }
        PIECE_HEIGHT = PIECE_WIDTH * aspectRatio;
        
        // --- Apply Sizes and Create Elements ---
        const totalWidth = COLS * PIECE_WIDTH;
        const totalHeight = ROWS * PIECE_HEIGHT;

        [puzzleBoard, piecesTray].forEach(el => {
            el.style.width = `${totalWidth}px`;
            el.style.height = `${totalHeight}px`;
            el.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;
            el.style.gridTemplateRows = `repeat(${ROWS}, 1fr)`;
        });

        // Create the universal drop handler
        const handleDrop = createDropHandler(config);
        // Make the tray itself a drop target
        addDragDropListeners(piecesTray, handleDrop);

        // Create and add pieces to the tray
        let pieces = [];
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                pieces.push(`piece_${r}_${c}`);
            }
        }
        pieces.sort(() => Math.random() - 0.5);

        for (const pieceId of pieces) {
            const piece = document.createElement('img');
            piece.src = `/output/${pieceId}.png`;
            piece.id = pieceId;
            piece.className = 'puzzle-piece';
            piece.draggable = true; // Pieces are always draggable
            piece.style.width = `${PIECE_WIDTH}px`;
            piece.style.height = `${PIECE_HEIGHT}px`;
            addDragDropListeners(piece, handleDrop);
            piecesTray.appendChild(piece);
        }

        // Create and add slots to the board
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const slot = document.createElement('div');
                slot.id = `piece_${r}_${c}`; 
                slot.className = 'piece-slot';
                addDragDropListeners(slot, handleDrop);
                puzzleBoard.appendChild(slot);
            }
        }
    };
}