// Scroll-bound video frame animation engine
const canvas = document.getElementById('scroll-canvas');
const context = canvas.getContext('2d');
const preloader = document.getElementById('preloader');
const progressBar = document.getElementById('progress-bar');
const scrollTextOverlay = document.getElementById('scroll-text-overlay');

const frameCount = 24;
const images = [];
let loadedCount = 0;

// Setup image path generator (padding frame numbers, e.g. frame_01.png, frame_02.png)
const currentFramePath = index => `./images/frame_${index.toString().padStart(2, '0')}.png`;

// Interpolation (lerp) values for smooth transitions
let scrollProgress = 0;
let currentFrameIdx = 1;
let targetFrameIdx = 1;
let scrollSpacerHeight = 0;

// Preload all 24 PNG frames
function preloadImages() {
    for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        img.src = currentFramePath(i);
        img.onload = () => {
            loadedCount++;
            const percent = Math.round((loadedCount / frameCount) * 100);
            if (progressBar) {
                progressBar.style.width = `${percent}%`;
            }

            if (loadedCount === frameCount) {
                setTimeout(initApp, 400); // Small delay for completion effect
            }
        };
        img.onerror = () => {
            console.error(`Failed to load image at: ${img.src}`);
            loadedCount++; // Increment anyway to not block the loader on errors
        };
        images.push(img);
    }
}

// Initialize application after assets load
function initApp() {
    if (preloader) {
        preloader.classList.add('fade-out');
    }
    
    // Set initial canvas size and draw first frame
    resizeCanvas();
    drawFrame(1);
    
    // Set up scroll triggers and start animation loops
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', resizeCanvas);

    // Initial handleScroll trigger to set correct opacity of overlay
    handleScroll();

    // Run the animation rendering loop
    tick();
}

// Aspect ratio cover function (similar to CSS object-fit: cover)
function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    context.scale(dpr, dpr);

    // Update scroll spacer height in JS context
    const scrollSpacer = document.querySelector('.scroll-spacer');
    if (scrollSpacer) {
        scrollSpacerHeight = scrollSpacer.offsetHeight;
    }

    // Redraw current frame with new proportions
    drawFrame(Math.round(currentFrameIdx));
}

// Draw a specific frame onto the canvas
function drawFrame(index) {
    const img = images[index - 1];
    if (!img || !img.complete) return;

    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight;

    // Calculate dimensions to maintain aspect ratio (cover option)
    const imgRatio = img.width / img.height;
    const canvasRatio = canvasWidth / canvasHeight;

    let drawWidth, drawHeight, drawX, drawY;

    if (canvasRatio > imgRatio) {
        // Canvas is wider than image
        drawWidth = canvasWidth;
        drawHeight = canvasWidth / imgRatio;
        drawX = 0;
        drawY = (canvasHeight - drawHeight) / 2;
    } else {
        // Canvas is taller than image
        drawWidth = canvasHeight * imgRatio;
        drawHeight = canvasHeight;
        drawX = (canvasWidth - drawWidth) / 2;
        drawY = 0;
    }

    context.clearRect(0, 0, canvasWidth, canvasHeight);
    context.drawImage(img, drawX, drawY, drawWidth, drawHeight);
}

// Handle scroll inputs
function handleScroll() {
    const scrollTop = window.scrollY;
    
    // Update scrollProgress for the frame animation (0 to 1 across the spacer)
    if (scrollSpacerHeight > 0) {
        scrollProgress = Math.min(1, scrollTop / scrollSpacerHeight);
    } else {
        scrollProgress = 0;
    }
    
    // Map scroll progress to a target frame index (1 to 24)
    targetFrameIdx = 1 + scrollProgress * (frameCount - 1);

    // Handle scroll-trigger fade for the scroll-text-overlay
    if (scrollTextOverlay && scrollSpacerHeight > 0) {
        // Fade limit is 30% of the scroll animation section (scroll-spacer)
        const fadeLimit = 0.3 * scrollSpacerHeight;
        
        // Compute opacity: starts at 1 at scrollTop=0, fades to 0 at scrollTop=fadeLimit
        const opacity = Math.max(0, 1 - (scrollTop / fadeLimit));
        scrollTextOverlay.style.opacity = opacity;
        
        // Optimize rendering by toggling visibility
        if (opacity <= 0) {
            scrollTextOverlay.style.visibility = 'hidden';
        } else {
            scrollTextOverlay.style.visibility = 'visible';
        }
    }
}

// Render loop for smooth lerping
function tick() {
    // Smooth lerp interpolation: frame index catches up to scroll target
    const diff = targetFrameIdx - currentFrameIdx;
    
    // If differences are tiny, snap it
    if (Math.abs(diff) > 0.001) {
        currentFrameIdx += diff * 0.12; // Adjust speed (higher = faster response)
        drawFrame(Math.round(currentFrameIdx));
    }

    requestAnimationFrame(tick);
}

// Start preloading
preloadImages();
