const textInput = document.getElementById('textInput');
const generateButton = document.getElementById('generateButton');
const downloadButton = document.getElementById('downloadButton');
const animationDiv = document.getElementById('animation');
const speedInput = document.getElementById('speedInput');
const fontSizeInput = document.getElementById('fontSizeInput');
const fontColorInput = document.getElementById('fontColorInput');
const backspaceInput = document.getElementById('backspaceInput');
const pauseDurationInput = document.getElementById('pauseDurationInput');

let gif;
let generatedGIFUrl = null;

// Updated to apply the selected font family
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
                setTimeout(type, parseFloat(speedInput.value) * 1000); // Adjusted typing speed
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
                setTimeout(type, parseFloat(speedInput.value) * 1000); // Adjusted backspace speed
            } else {
                isDeleting = false;
                finishTyping();
            }
        }
    };

    type();

    async function finishTyping() {
        downloadButton.style.display = 'inline-block';
        downloadButton.textContent = 'Generating GIF...';
        downloadButton.style.pointerEvents = 'none';
    
        generatedGIFUrl = await generateGIF();
    
        downloadButton.href = generatedGIFUrl;
        downloadButton.download = 'typing-animation.gif';
        downloadButton.textContent = 'Download as GIF';
        downloadButton.style.pointerEvents = 'auto';
    }
    
}

// Updated to include background color and padding for the GIF
function generateGIF() {
    return new Promise((resolve) => {
        const gif = new GIF({
            workers: 2,
            quality: 10,
            repeat: 0,
            workerScript: './gif/gif.worker.js',
            width: 320, // Reduced resolution
            height: 180, // Reduced resolution
        });

        const backgroundColor = document.getElementById('backgroundInput').value;
        const padding = parseInt(document.getElementById('paddingInput').value);
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const fontSize = parseInt(fontSizeInput.value);
        const text = textInput.value;
        const font = fontFamilyInput.value;
        const delay = parseFloat(speedInput.value) * 1000; // Use user-defined speed for delay

        canvas.width = 320; // Fixed width for optimization
        canvas.height = 180; // Fixed height for optimization

        // Draw typing frames
        for (let i = 1; i <= text.length; i++) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = backgroundColor;
            context.fillRect(0, 0, canvas.width, canvas.height);

            context.font = `${fontSize}px ${font}`;
            context.fillStyle = fontColorInput.value;
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(text.slice(0, i), canvas.width / 2, canvas.height / 2);

            const frameCanvas = document.createElement('canvas');
            frameCanvas.width = canvas.width;
            frameCanvas.height = canvas.height;
            const frameCtx = frameCanvas.getContext('2d');
            frameCtx.drawImage(canvas, 0, 0);

            gif.addFrame(frameCanvas, { copy: true, delay });
        }

        // Draw backspace frames if enabled
        if (backspaceInput.checked) {
            for (let i = text.length; i > 0; i--) {
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.fillStyle = backgroundColor;
                context.fillRect(0, 0, canvas.width, canvas.height);

                context.font = `${fontSize}px ${font}`;
                context.fillStyle = fontColorInput.value;
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillText(text.slice(0, i - 1), canvas.width / 2, canvas.height / 2);

                const frameCanvas = document.createElement('canvas');
                frameCanvas.width = canvas.width;
                frameCanvas.height = canvas.height;
                const frameCtx = frameCanvas.getContext('2d');
                frameCtx.drawImage(canvas, 0, 0);

                gif.addFrame(frameCanvas, { copy: true, delay });
            }
        }

        gif.on('finished', (blob) => {
            console.log('GIF generated successfully.');
            const url = URL.createObjectURL(blob);
            resolve(url);
        });

        gif.on('abort', () => console.log('GIF generation aborted.'));
        gif.on('error', (err) => console.error('GIF generation failed:', err));

        gif.render();
    });
}

function downloadGIF(blobUrl) {
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = 'typing-animation.gif';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Cleanup after a brief delay to avoid race condition
    setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
    }, 5000);
}

generateButton.addEventListener('click', async () => {
    const text = textInput.value;
    if (text) {
        // Disable the button for 10 seconds to prevent spamming
        generateButton.disabled = true;
        generateButton.textContent = 'Wait for 10 seconds...';
        setTimeout(() => {
            generateButton.disabled = false;
            generateButton.textContent = 'Generate GIF';
        }, 10000);

        // Clear previous GIF if exists
        if (generatedGIFUrl) {
            URL.revokeObjectURL(generatedGIFUrl);
            generatedGIFUrl = null;
            downloadButton.style.display = 'none';
        }

        await createTypingAnimation(text);
    }
});

downloadButton.addEventListener('click', (event) => {
    event.preventDefault();
    if (generatedGIFUrl) {
        console.log('Downloading GIF:', generatedGIFUrl);
        downloadGIF(generatedGIFUrl);
    }
});
