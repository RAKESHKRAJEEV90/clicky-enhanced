# Clicky (Tauri Version)

Clicky is a native companion application for desktop environments (Windows/Linux/macOS), ported from the original macOS-only Clicky app. It uses Tauri, React, and TypeScript to provide a seamless, native-feeling desktop experience with AI capabilities.

## How It Works (AI Integration)

Clicky is designed to be a flexible AI companion that can run either fully offline or powered by the cloud, depending on your preferences:

- **Local AI (Ollama):** You can connect Clicky to a locally running instance of [Ollama](https://ollama.com/). This allows you to run powerful models entirely on your own hardware. It ensures complete privacy and requires no internet connection once your models are downloaded.
- **Cloud AI:** For more complex tasks, you can use cloud-hosted models (like Claude or OpenAI).
- **Model Selection:** The application features an intuitive UI right within the main window that allows you to seamlessly switch between your local Ollama models and Cloud models on the fly.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Rust](https://www.rust-lang.org/tools/install) (required for Tauri)
- Platform-specific build tools (C++ build tools on Windows, standard build tools on Linux)

## Getting Started

### 1. Install Dependencies

First, install the necessary Node.js dependencies:

```bash
npm install
```

### 2. Run in Development Mode

To start the application in development mode with hot-module replacement (HMR), run:

```bash
npm run tauri dev
```
This command will compile the Rust backend, launch the frontend development server, and open the desktop application window.

### 3. Build for Production

To build an optimized release version of the application, run:

```bash
npm run tauri build
```
The built executable or installer will be generated inside the `src-tauri/target/release/bundle` directory (depending on your OS).

## Packaging & Distribution

Tauri v2 allows you to compile this single codebase into installable packages for multiple platforms.

### Windows
To generate Windows installers (`.msi` and `.exe` setup files):
1. You must run the build command on a **Windows** machine.
2. Run: `npm run tauri build`
3. The installers will be located in `src-tauri/target/release/bundle/msi/` and `nsis/`.

### Linux
To generate Linux packages (`.AppImage` and `.deb`):
1. You must run the build command on a **Linux** machine (or WSL with GUI support).
2. Run: `npm run tauri build`
3. The packages will be located in `src-tauri/target/release/bundle/appimage/` and `deb/`.

### Mobile (Android & iOS)
Tauri v2 supports native mobile compilation. 
*Note: Android requires Android Studio/NDK. iOS requires a Mac with Xcode.*

1. Initialize mobile platforms (only needed once):
   ```bash
   npm run tauri android init
   npm run tauri ios init
   ```
2. To build the applications:
   - **Android**: `npm run tauri android build` (Generates `.apk` and `.aab` files)
   - **iOS**: `npm run tauri ios build` (Generates an Xcode project to build your `.ipa` or deploy to the App Store)

### Browser (Web)
Because the frontend is built with React and Vite, you can easily host it as a standard web application.
*Note: Native Tauri APIs (like file system access or global shortcuts) will not work in the browser context.*

1. Run the standard Vite build:
   ```bash
   npm run build
   ```
2. The production-ready web files will be output to the `dist` directory.
3. You can deploy the `dist` folder to any static hosting provider like Vercel, Netlify, Cloudflare Pages, or GitHub Pages.

## Recommended IDE Setup
## Acknowledgments

A special thanks to the original creator of **Clicky** for the inspiration and foundation. This project is a cross-platform version derived directly from the original macOS-only Clicky application.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
