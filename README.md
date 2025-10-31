<div align="center">

# 🌐 Proxy Scraper Pro

### Professional Desktop SOCKS5 Proxy Harvester

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Electron](https://img.shields.io/badge/Electron-27+-9FEAF9.svg?logo=electron)](https://www.electronjs.org/)
[![Node](https://img.shields.io/badge/Node-18+-green.svg?logo=node.js)](https://nodejs.org/)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)](https://github.com/vKAYFv/proxy-scraper-pro)

*Harvest fresh SOCKS5 proxies from 50+ sources with a stunning neon-glass interface*

![Proxy Scraper Pro UI](docs/screenshot.png)

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Build](#-build) • [Contributing](#-contributing)

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🚀 **Performance**
- **Mass Collection Engine** – Concurrent scraping from 50+ curated sources
- **Intelligent Deduplication** – Real-time in-memory filtering
- **Geonode API Integration** – Premium proxy feed support
- **Multi-threaded Architecture** – Optimized for speed

</td>
<td width="50%">

### 🎨 **User Experience**
- **Neon-Glass UI** – Modern glassmorphic design
- **Real-time Telemetry** – Live progress tracking
- **One-Click Export** – Instant `.txt` file generation
- **Auto-Refresh Mode** – Set-and-forget automation

</td>
</tr>
<tr>
<td width="50%">

### 🔒 **Security**
- **Context Isolation** – Secure renderer process
- **No Node Integration** – Sandboxed environment
- **Safe IPC Bridge** – Controlled preload exposure

</td>
<td width="50%">

### 📦 **Distribution**
- **Electron Builder** – Professional packaging
- **Signed Installers** – Windows NSIS support
- **Auto-Update Ready** – Version management built-in

</td>
</tr>
</table>

---

## 🎯 What Makes It Different?

| Feature | Proxy Scraper Pro | Traditional Scrapers |
|---------|-------------------|---------------------|
| **Concurrent Sources** | 50+ simultaneous | 5-10 sequential |
| **UI/UX** | Modern glassmorphic | Basic terminal/GUI |
| **Auto-Refresh** | ✅ Built-in | ❌ Manual only |
| **Deduplication** | ✅ Real-time | ⚠️ Post-processing |
| **Export Format** | Clean `.txt` | Mixed formats |
| **Cross-Platform** | ✅ Windows/Mac/Linux | ⚠️ Limited |

---

## 🚀 Installation

### Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.x or newer ([Download](https://nodejs.org/))
- **npm** (included with Node.js)
- **Git** ([Download](https://git-scm.com/))

### Quick Start

```bash
# Clone the repository
git clone https://github.com/vKAYFv/proxy-scraper-pro.git

# Navigate to project directory
cd proxy-scraper-pro

# Install dependencies
npm install

# Run in development mode
npm run dev
```

### Alternative: Direct Download

Download the latest release from the [Releases](https://github.com/vKAYFv/proxy-scraper-pro/releases) page.

---

## 🎮 Usage

### Basic Workflow

1. **Launch the application**
   ```bash
   npm run dev
   ```

2. **Start scraping**
   - Click the **"Grab Proxies"** button
   - Watch real-time progress in the telemetry panel
   - Monitor source count, total proxies, and elapsed time

3. **Enable automation** *(optional)*
   - Toggle **"Auto Refresh"** to scrape every 30 minutes
   - Perfect for continuous monitoring workflows

4. **Export results**
   - Click **"Export List"** to save proxies
   - Output format: `socks5_proxies_max_YYYY-MM-DD_HH-MM-SS.txt`
   - One proxy per line, ready for immediate use

### Advanced Configuration

Edit `main.js` to customize:

```javascript
// Adjust auto-refresh interval (default: 30 minutes)
const AUTO_REFRESH_INTERVAL = 30 * 60 * 1000;

// Add custom proxy sources
const customSources = [
  'https://your-custom-source.com/proxies.txt'
];
```

---

## 🛠 Build & Distribution

### Development Build

```bash
# Start with hot-reload and DevTools
npm run dev
```

### Production Build

```bash
# Create distributable packages
npm run build
```

**Output locations:**

```
dist/
├── win-unpacked/              # Portable Windows build
├── Proxy Scraper Pro Setup.exe   # Windows installer (NSIS)
├── mac/                       # macOS application bundle
└── linux-unpacked/            # Linux AppImage
```

### Build Customization

Modify `package.json` under the `build` section:

```json
"build": {
  "appId": "com.yourcompany.proxyscraperpro",
  "productName": "Proxy Scraper Pro",
  "win": {
    "target": ["nsis", "portable"],
    "icon": "icons/icon.ico"
  }
}
```

---

## 📁 Project Architecture

```
proxy-scraper-pro/
│
├── 📄 main.js              # Electron main process & scrape coordinator
├── 📄 preload.js           # Secure IPC bridge (contextIsolation)
├── 📄 renderer.js          # Frontend logic & state management
├── 📄 index.html           # Glassmorphic UI structure
├── 🎨 styles.css           # Custom theme & component styles
│
├── 🖼️ icons/               # Application icons
│   ├── icon.png            # Source icon (1024x1024)
│   └── icon.ico            # Windows icon (multi-size)
│
├── 📚 docs/                # Documentation assets
│   └── screenshot.png      # UI showcase
│
├── 📦 package.json         # Dependencies & build config
├── 📋 package-lock.json    # Lockfile for reproducible builds
└── 📖 README.md            # You are here!
```

### Key Components

| File | Purpose |
|------|---------|
| `main.js` | Orchestrates scraping, manages IPC, handles file operations |
| `preload.js` | Exposes safe APIs to renderer (no Node.js exposure) |
| `renderer.js` | UI state, progress updates, export triggers |
| `index.html` | Neon-glass layout with Tailwind utilities |
| `styles.css` | Custom animations, gradients, glassmorphism |

---

## 🔧 Tech Stack

<div align="center">

| Technology | Purpose | Version |
|------------|---------|---------|
| ![Electron](https://img.shields.io/badge/Electron-9FEAF9?style=for-the-badge&logo=electron&logoColor=white) | Desktop framework | 27+ |
| ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white) | HTTP client | Latest |
| ![Tailwind](https://img.shields.io/badge/Tailwind-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) | Utility-first CSS | 3.x |
| ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white) | Runtime | 18+ |

</div>

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### 1. Fork & Clone

```bash
git clone https://github.com/vKAYFv/proxy-scraper-pro.git
cd proxy-scraper-pro
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Follow existing code style
- Add comments for complex logic
- Test thoroughly before committing

### 3. Submit Pull Request

- Describe your changes clearly
- Reference any related issues
- Ensure all tests pass

### Contribution Ideas

- 🌍 Add new proxy sources
- 🎨 UI/UX improvements
- 🐛 Bug fixes and optimizations
- 📚 Documentation enhancements
- 🌐 Localization (i18n)

---

## 📊 Roadmap

- [ ] **Proxy Testing** – Built-in speed/anonymity checks
- [ ] **Filtering Options** – Country, speed, protocol filters
- [ ] **History Tracking** – View past scrape sessions
- [ ] **Cloud Sync** – Save lists to cloud storage
- [ ] **Custom Schedules** – Flexible auto-refresh timing
- [ ] **API Mode** – Headless CLI for automation

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License - Copyright (c) 2025 Your Name

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files...
```

---

## 🙏 Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- Powered by [Axios](https://axios-http.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide](https://lucide.dev/)

---

## 📮 Support

- 🐛 **Bug Reports**: [Open an issue](https://github.com/vKAYFv/proxy-scraper-pro/issues)
- 💡 **Feature Requests**: [Start a discussion](https://github.com/vKAYFv/proxy-scraper-pro/discussions)

---

<div align="center">

**⭐ Star this repo if you find it useful! ⭐**

Made with 💙 by [vKAYFv](https://github.com/vKAYFv)

[⬆ Back to Top](#-proxy-scraper-pro)

</div>