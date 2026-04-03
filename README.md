# OpenBranch Note

**Manual conversation logger with branching visualization. No AI — you type both sides.**

A nonlinear conversation logger where you manually enter both prompts and responses, with git-style branching and merging.

## Features

- **Turn-based input** — Alternate between typing prompts and responses manually
- **Branch** — Edit any message to fork a new branch and explore a different direction
- **Merge** — Combine insights from multiple branches into one thread
- **Graph visualization** — See the shape of your conversation as a git-style commit graph
- **Timeline view** — Type `/show today` or `/show yesterday` to review your day's conversations
- **Dark / Light mode** — Toggle with one click

## Tech Stack

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) + [Tailwind CSS](https://tailwindcss.com/)
- Deployed on [Netlify](https://www.netlify.com/)
- All data stored in `localStorage` — no server, no sign-up

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## License

MIT

---

[GitHub](https://github.com/eldensari/openbranch-note)
