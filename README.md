# Interactive Calculator

A responsive, dependency-free calculator built with vanilla HTML, CSS, and JavaScript for the Pynexia training assignment. It features a dark navy interface, a dual-line display, teal operation accents, and full mouse, touch, and keyboard support.

## Features

- **Core Arithmetic**: Addition (`+`), subtraction (`−`), multiplication (`×`), and division (`÷`) implemented with explicit JavaScript arithmetic (no `eval()`).
- **Floating-Point Precision**: Normalizes decimal operations (e.g., `0.1 + 0.2 = 0.3` and `1.5 + 2.25 = 3.75`).
- **Input Validation**: Allows only a single decimal point per operand and safely wraps long numbers inside the display panel.
- **Error Handling**: Displays a clear `Cannot divide by 0` error state on division by zero and locks further input until reset with `AC` (`Escape`).
- **Editing Controls**: `AC` resets the entire calculation state; `⌫` (Backspace) deletes the last digit of the current input.
- **Accessible & Responsive**: Built with CSS Grid, visible hover, pressed, and `:focus-visible` states, `Tab`/`Space` keyboard accessibility, and mobile-optimized layout (`<= 420px`).

## Keyboard Shortcuts

| Key(s) | Action |
| :--- | :--- |
| `0` – `9` | Enter digit |
| `.` | Enter decimal point (one per number) |
| `+`, `-`, `*`, `/` | Addition, subtraction, multiplication, division |
| `Enter` or `=` | Calculate result |
| `Backspace` | Delete last digit of current input |
| `Escape` | Reset calculator (`AC`) |
| `Tab` / `Shift + Tab` | Move focus between calculator buttons |
| `Space` | Activate the currently focused button |

## Run Locally

No build tools or external dependencies are required.

1. **Open directly in a browser**:
   Double-click `index.html` or open it from your browser (`File > Open File...`).

2. **Or serve with a local static server**:
   ```bash
   # Using Node.js (npx)
   npx serve .

   # Or using Python
   python -m http.server 8080
   ```
   Then open `http://localhost:8080` in your browser.

