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

// Updated to use seconds instead of milliseconds
function createTypingAnimation(text) {
    animationDiv.innerHTML = '';
    animationDiv.style.fontSize = `${fontSizeInput.value}px`;
    animationDiv.style.color = fontColorInput.value;

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
                downloadButton.disabled = false;
            }
        } else {
            if (index > 0) {
                animationDiv.textContent = animationDiv.textContent.slice(0, -1);
                index--;
                setTimeout(type, parseFloat(speedInput.value) * 1000);
            } else {
                isDeleting = false;
                downloadButton.disabled = false;
            }
        }
    };

    type();
}

// Function to generate GIF
function generateGIF() {
    const gif = new GIF({
        workers: 2,
        quality: 10,
        repeat: 0 // Loop the GIF infinitely
    });

    const frames = animationDiv.textContent.split('').map((char, i) => {
        const frame = document.createElement('div');
        frame.textContent = animationDiv.textContent.slice(0, i + 1);
        frame.style.fontSize = `${fontSizeInput.value}px`;
        frame.style.color = fontColorInput.value;
        frame.style.textAlign = 'center';
        frame.style.margin = '20px 0';
        return frame;
    });

    frames.forEach(frame => {
        gif.addFrame(frame, { delay: parseInt(speedInput.value) });
    });

    gif.on('finished', function(blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'typing-animation.gif';
        a.click();
    });

    gif.render();
}

// Event listeners
generateButton.addEventListener('click', () => {
    const text = textInput.value;
    if (text) {
        createTypingAnimation(text);
    }
});

downloadButton.addEventListener('click', generateGIF);