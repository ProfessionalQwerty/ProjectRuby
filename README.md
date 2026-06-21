# PRISM App (Open Source)

Desktop shell and web UI for PRISM — the Agentic Development Environment.

The **intelligence engine** (graph indexing, orchestration, datalog) is proprietary and runs on the cloud. This repo contains only the client.

## Deploy targets

| Target | This folder | Remote |
|--------|-------------|--------|
| **Website** | `prism-app/` root | Vercel |
| **Open source** | `prism-app/` | GitHub `ProfessionalQwerty/ProjectRuby` |
| **Desktop installers** | GitHub Releases | Built by `.github/workflows/release.yml` |
| **npm installer** | `scripts/install-prism.mjs` | via `npx github:ProfessionalQwerty/ProjectRuby` |

Before pushing to GitHub, run:

```powershell
npm run verify-boundary
```

## Quick start (development)

```powershell
cd prism-app
npm install
cp ui/.env.example ui/.env.local
# Edit ui/.env.local — set VITE_API_URL to your Hugging Face engine URL

npm run dev
```

- Web UI: http://localhost:5173
- Electron opens automatically after Vite is ready

## Install desktop app (recommended)

Requires Node.js 18+. Downloads PRISM from GitHub Releases and creates a desktop shortcut on Windows, macOS, and Linux.

```bash
npx --yes github:ProfessionalQwerty/ProjectRuby
```

Launch later from your desktop shortcut, or run the installed PRISM executable directly.

## Build desktop installer locally

```powershell
npm run generate-icons   # once, from prism_logo_cut_stone_final.png
npm run dist
```

Installers output to `prism-app/release/`.

## Release (CI)

```powershell
git tag v0.1.1
git push origin v0.1.1
```

GitHub Actions builds Windows, macOS, and Linux installers plus portable zip/tar archives used by the npm install script.

## Environment variables (UI)

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | Cloud engine URL (Hugging Face Space) |
| `VITE_PRISM_CLIENT_KEY` | Must match `PRISM_CLIENT_API_KEY` on engine |
| `VITE_HF_ACCESS_TOKEN` | HF read token — only if engine Space is **private** |
| `VITE_DOWNLOAD_BASE_URL` | Base URL for direct installer downloads |

## Code signing (Windows)

Apply for free OSS signing at [SignPath Foundation](https://signpath.org/). See [docs/SIGNPATH.md](docs/SIGNPATH.md) for GitHub Actions setup.

## Structure

```
prism-app/
├── ui/           React workspace + marketing site
├── desktop/      Electron main/preload
├── scripts/      install-prism.mjs (npx entry)
├── build/        App icons for electron-builder
└── release/      Built installers (gitignored)
```

## License

MIT — see [LICENSE](LICENSE).
