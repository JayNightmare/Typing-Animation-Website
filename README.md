# Typing Animation Generator

A web-based tool to create customizable typing animation GIFs. Users can input text, adjust animation settings, and download the resulting GIF.

## Features

- **Live Preview**: See the typing animation in real-time.
- **Customizable Options**:
  - Font family, size, and color.
  - Animation speed and optional backspace animation.
  - Pause duration for backspace animations.
  - GIF background color and internal padding.
- **GIF Download**: Generate and download the typing animation as a GIF.

## Technologies Used

- **HTML**: For the structure of the webpage.
- **CSS**: For modern and responsive styling.
- **JavaScript**: For animation logic and GIF generation.
- **gif.js**: A library for creating GIFs in the browser.

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Open the `index.html` file in your browser.

## Usage

1. Open the webpage in your browser.
2. Type your desired text in the input area.
3. Customize the animation using the available options:
   - **Text Options**: Font family, size, and color.
   - **Animation Options**: Speed, backspace animation, and pause duration.
   - **GIF Options**: Background color and padding.
4. Click the **Generate Animation** button to preview the animation.
5. Once the animation is generated, click **Download as GIF** to save it.

## File Structure

```
Typing Animation/
├── index.html         # Main HTML file
├── style.css          # Styling for the webpage
├── script.js          # JavaScript logic for animation and GIF generation
├── gif/
│   ├── gif.js         # GIF generation library
│   └── gif.worker.js  # Web Worker for gif.js
```

## Customization Options

### Text Options
- **Font Family**: Choose from popular fonts like Roboto, Arial, Courier New, etc.
- **Font Size**: Set the size of the text in pixels.
- **Font Color**: Pick a color for the text.

### Animation Options
- **Animation Speed**: Adjust the typing speed (seconds per character).
- **Backspace Animation**: Enable or disable backspace animation.
- **Pause Duration**: Set the pause duration before backspacing (if enabled).

### GIF Options
- **Background Color**: Set the background color of the GIF.
- **Internal Padding**: Add padding around the text in the GIF.

## Responsive Design

The tool is fully responsive and works well on both desktop and mobile devices.

## Known Issues

- Generating very large GIFs may cause performance issues on low-end devices.
- Fonts must be loaded before starting the animation to avoid rendering delays.

## Future Enhancements

- Add support for exporting animations as MP4 or WebM.
- Improve performance for large text inputs.
- Add more font and color customization options.

## License

This project is licensed under the MIT License. See the LICENSE file for details.