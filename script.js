// Configuration constants
const MAX_TEXT_LENGTH = 100; // Maximum characters allowed
const CHUNK_SIZE = 5; // Number of frames to process in each chunk
const FPS = 24; // Frames per second
const FRAME_DELAY = Math.floor(1000 / FPS); // Delay between frames in ms
const CLEANUP_DELAY = 5000; // Delay before cleaning up resources
const MAX_FRAMES = 120; // Maximum number of frames (5 seconds at 24fps)
const WORKER_COUNT = navigator.hardwareConcurrency > 1 ? 2 : 1;

const textInput = document.getElementById('textInput');
const generateButton = document.getElementById('generateButton');
const downloadButton = document.getElementById('downloadButton');
const animationDiv = document.getElementById('animation');
const speedInput = document.getElementById('speedInput');
const fontSizeInput = document.getElementById('fontSizeInput');
const fontColorInput = document.getElementById('fontColorInput');
const backspaceInput = document.getElementById('backspaceInput');
const pauseDurationInput = document.getElementById('pauseDurationInput');
const fontFamilyInput = document.getElementById('fontFamilyInput');
const backgroundInput = document.getElementById('backgroundInput');
const paddingInput = document.getElementById('paddingInput');

let generatedGIFUrl = null;
let isGenerating = false;

function createTypingAnimation(text) {
    animationDiv.innerHTML = '';
    animationDiv.style.fontSize = `${fontSizeInput.value}px`;
    animationDiv.style.color = fontColorInput.value;
    animationDiv.style.fontFamily = fontFamilyInput.value;

    let index = 0;
    let isDeleting = false;

    const type = () => {
        if (!isDeleting) {
            if (index < text.length) {
                animationDiv.textContent += text[index];
                index++;
                setTimeout(type, parseFloat(speedInput.value) * 1000);
            } else if (backspaceInput.checked) {
                isDeleting = true;
                setTimeout(type, parseFloat(pauseDurationInput.value) * 1000);
            } else {
                finishTyping();
            }
        } else {
            if (index > 0) {
                animationDiv.textContent = animationDiv.textContent.slice(0, -1);
                index--;
                setTimeout(type, parseFloat(speedInput.value) * 1000);
            } else {
                isDeleting = false;
                finishTyping();
            }
        }
    };

    type();

    async function finishTyping() {
        downloadButton.style.display = 'inline-block';
        downloadButton.textContent = 'Preparing GIF generation...';
        downloadButton.style.pointerEvents = 'none';
    
        try {
            generatedGIFUrl = await generateGIF((progress) => {
                downloadButton.textContent = `Generating GIF (${Math.round(progress * 100)}%)...`;
            });
            
            downloadButton.href = generatedGIFUrl;
            downloadButton.download = 'typing-animation.gif';
            downloadButton.textContent = 'Download as GIF';
            downloadButton.style.pointerEvents = 'auto';
        } catch (error) {
            console.error('GIF generation failed:', error);
            downloadButton.textContent = 'Generation failed. Try again.';
            setTimeout(() => {
                downloadButton.style.display = 'none';
            }, 3000);
        }
    }
}

function generateGIF(onProgress) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const frameCanvas = document.createElement('canvas');
        const frameCtx = frameCanvas.getContext('2d');
        
        canvas.width = 320;
        canvas.height = 180;
        frameCanvas.width = canvas.width;
        frameCanvas.height = canvas.height;

        const gif = new GIF({
            workers: WORKER_COUNT,
            quality: 5,
            repeat: 0,
            workerScript: './gif/gif.worker.js',
            width: canvas.width,
            height: canvas.height,
            dither: false,
        });

        const backgroundColor = backgroundInput.value;
        const padding = parseInt(paddingInput.value);
        const fontSize = parseInt(fontSizeInput.value);
        const text = textInput.value;
        const font = fontFamilyInput.value;
        const typingSpeed = parseFloat(speedInput.value) * 1000;
        const pauseDuration = parseFloat(pauseDurationInput.value) * 1000;

        // Calculate frames needed for typing animation
        const framesPerChar = Math.max(1, Math.round((typingSpeed / FRAME_DELAY)));
        const frames = [];

        function generateFrameStates() {
            // Typing frames
            for (let i = 0; i <= text.length; i++) {
                // Add multiple frames for each character to maintain 24fps
                for (let f = 0; f < framesPerChar; f++) {
                    frames.push({ text: text.slice(0, i), isTyping: true });
                }
            }

            if (backspaceInput.checked) {
                // Pause frames
                const pauseFrames = Math.round(pauseDuration / FRAME_DELAY);
                for (let i = 0; i < pauseFrames; i++) {
                    frames.push({ text: text, isPause: true });
                }

                // Backspace frames
                for (let i = text.length; i >= 0; i--) {
                    for (let f = 0; f < framesPerChar; f++) {
                        frames.push({ text: text.slice(0, i), isDeleting: true });
                    }
                }
            }

            // Limit total frames
            if (frames.length > MAX_FRAMES) {
                const ratio = MAX_FRAMES / frames.length;
                const newFrames = [];
                for (let i = 0; i < frames.length; i += Math.ceil(1 / ratio)) {
                    newFrames.push(frames[i]);
                }
                frames.length = 0;
                frames.push(...newFrames);
            }
        }

        function renderFrame(frameData) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = backgroundColor;
            context.fillRect(0, 0, canvas.width, canvas.height);

            const textAreaWidth = canvas.width - (padding * 2);
            const textAreaHeight = canvas.height - (padding * 2);

            context.font = `${fontSize}px ${font}`;
            context.fillStyle = fontColorInput.value;
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            
            // Word wrap
            const words = frameData.text.split(' ');
            const lines = [];
            let currentLine = words[0] || '';

            for (let i = 1; i < words.length; i++) {
                const testLine = currentLine + ' ' + words[i];
                const metrics = context.measureText(testLine);
                
                if (metrics.width > textAreaWidth && i > 0) {
                    lines.push(currentLine);
                    currentLine = words[i];
                } else {
                    currentLine = testLine;
                }
            }
            lines.push(currentLine);

            const lineHeight = fontSize * 1.2;
            const totalHeight = lines.length * lineHeight;
            let y = (canvas.height - totalHeight) / 2 + lineHeight / 2;

            lines.forEach(line => {
                context.fillText(line, canvas.width / 2, y);
                y += lineHeight;
            });

            frameCtx.clearRect(0, 0, frameCanvas.width, frameCanvas.height);
            frameCtx.drawImage(canvas, 0, 0);

            gif.addFrame(frameCanvas, { copy: true, delay: FRAME_DELAY });
        }

        async function processFramesInChunks() {
            generateFrameStates();
            
            for (let i = 0; i < frames.length; i += CHUNK_SIZE) {
                const chunk = frames.slice(i, i + CHUNK_SIZE);
                chunk.forEach(frameData => renderFrame(frameData));
                onProgress?.(i / frames.length);
                await new Promise(resolve => setTimeout(resolve, 0));
            }

            onProgress?.(1);
            return new Promise((resolve, reject) => {
                gif.on('finished', blob => {
                    const url = URL.createObjectURL(blob);
                    frames.length = 0;
                    resolve(url);
                });

                gif.on('error', reject);
                gif.render();
            });
        }

        processFramesInChunks()
            .then(resolve)
            .catch(reject)
            .finally(() => {
                canvas.remove();
                frameCanvas.remove();
                gif.abort();
            });
    });
}

function downloadGIF(blobUrl) {
    if (!blobUrl) return;
    
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = 'typing-animation.gif';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    setTimeout(() => {
        if (generatedGIFUrl) {
            URL.revokeObjectURL(generatedGIFUrl);
            generatedGIFUrl = null;
        }
    }, CLEANUP_DELAY);
}

generateButton.addEventListener('click', async () => {
    const text = textInput.value.trim();
    if (!text) {
        alert('Please enter some text.');
        return;
    }

    if (text.length > MAX_TEXT_LENGTH) {
        alert(`Text is too long. Maximum length is ${MAX_TEXT_LENGTH} characters.`);
        return;
    }

    if (isGenerating) {
        return;
    }

    isGenerating = true;
    generateButton.disabled = true;
    generateButton.textContent = 'Generating...';

    if (generatedGIFUrl) {
        URL.revokeObjectURL(generatedGIFUrl);
        generatedGIFUrl = null;
        downloadButton.style.display = 'none';
    }

    try {
        await createTypingAnimation(text);
    } catch (error) {
        console.error('Animation creation failed:', error);
        alert('Failed to generate animation. Please try again with shorter text or fewer effects.');
    } finally {
        isGenerating = false;
        generateButton.disabled = false;
        generateButton.textContent = 'Generate GIF';
    }
});

downloadButton.addEventListener('click', (event) => {
    event.preventDefault();
    if (generatedGIFUrl) {
        downloadGIF(generatedGIFUrl);
    }
});
