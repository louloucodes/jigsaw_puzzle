/**
 * Calculates the optimal dimensions for the puzzle board and tray to fit on the screen.
 * @param {number} imageWidth - The original width of the puzzle image.
 * @param {number} imageHeight - The original height of the puzzle image.
 * @returns {object} An object containing the calculated { boardWidth, boardHeight }.
 */
export function calculateLayout(imageWidth, imageHeight) {
    // Define padding and gaps to account for them in calculations
    const PADDING = 40; // Combined padding for body and container
    const GAP = 20;     // Gap between board and tray

    // --- NEW: Calculate height of elements above the puzzle ---
    let extraHeight = 0;
    const title = document.querySelector('h1');
    const controls = document.querySelector('.puzzle-controls');

    if (title) {
        const titleStyle = getComputedStyle(title);
        extraHeight += title.offsetHeight + parseInt(titleStyle.marginTop) + parseInt(titleStyle.marginBottom);
    }
    if (controls) {
        const controlsStyle = getComputedStyle(controls);
        extraHeight += controls.offsetHeight + parseInt(controlsStyle.marginTop) + parseInt(controlsStyle.marginBottom);
    }
    // --- End of new section ---

    // Calculate the available screen space, accounting for other elements
    const availableWidth = window.innerWidth - PADDING;
    const availableHeight = window.innerHeight - PADDING - extraHeight;

    // We need to fit two elements (board and tray) side-by-side
    const totalContentWidth = (imageWidth * 2) + GAP;
    const totalContentHeight = imageHeight;

    // Calculate the scale ratio needed to fit the content
    const widthScale = availableWidth / totalContentWidth;
    const heightScale = availableHeight / totalContentHeight;

    // Use the smaller of the two ratios to ensure everything fits
    const scale = Math.min(widthScale, heightScale, 1); // Use '1' to prevent upscaling

    // Calculate the final dimensions for the board
    const boardWidth = Math.floor(imageWidth * scale);
    const boardHeight = Math.floor(imageHeight * scale);

    return { boardWidth, boardHeight };
}