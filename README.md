# radiohack-app

A minimal Electron application with TypeScript

## How It Works

The application is a screen cropping and OCR (Optical Character Recognition) tool. It operates as follows:

1. Launch the application, and a darkened screen will appear.
2. Press `Alt+R` to initiate the screen cropping process.
3. Use the mouse to select a region on the screen, similar to the Windows Snipping Tool.
4. The application captures a screenshot of the selected region and sends it to the backend OCR service (Radiohack Backend) for processing.
5. The OCR service extracts text from the image and returns the resulting text to the application.
6. The extracted text is saved to the system clipboard, ready to be pasted wherever needed.

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ pnpm install
```

### Development

```bash
$ pnpm dev
```

### Build

```bash
# For Windows
$ pnpm build:win

# For macOS
$ pnpm build:mac

# For Linux
$ pnpm build:linux
```

## Installation

The application is currently focused on Windows. The installation process is straightforward:

1. Download the setup `.exe` file from the [GitHub release link](https://github.com/your-repo/releases).
2. Execute the downloaded `.exe` file.
3. Follow the installation prompts. Please note that the application is not signed, so you may need to bypass security warnings by selecting options such as "Keep" and "Run anyway".

## How to Use

1. Launch the application.
2. Press `Alt+R` to initiate the screen cropping and OCR process.
3. Select the desired region on the screen using the mouse.
4. The application will process the selected region and copy the extracted text to the clipboard.
5. Press `ESC` at any time to exit the application.

### Hotkeys

- `Alt+R`: Start screen cropping and OCR process.
- `ESC`: Exit the application.

### Note

The Radiohack Backend must be installed to provide OCR processing. Please refer to the separate instructions for installing the Radiohack Backend.
