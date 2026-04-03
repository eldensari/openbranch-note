# OpenBranch Note

Manual conversation logger with branching visualization. No AI — you type both sides.

## Commands

```bash
npm run dev        # start Vite dev server on port 5173
npm run build      # build to dist/
npm run preview    # preview production build
```

## Architecture

- **Stack**: React 19 + Vite 6 + Tailwind CSS 4 + Netlify (static site only)
- **No external UI libraries** - all components built with React + inline styles
- **No routing library** - single-page app, conversation switching via sidebar
- **No state management library** - pure React hooks (useState, useEffect, useRef)
- **No LLM/AI** - user manually types both prompts and responses (turn-based)
- **Persistence**: localStorage with `ob:` namespace prefix (via `src/lib/storage.js`)

### File Structure

```
src/
  App.jsx              # Monolithic main component: UI, state, handlers
  main.jsx             # React entry point
  index.css            # Tailwind import + custom scrollbar hiding
  lib/
    storage.js         # localStorage wrapper (ob: namespace)
  assets/
    herb.svg           # Logo icon
public/
  favicon.svg          # Herb emoji SVG favicon
```

### Data Model

Git-like commit/branch/HEAD system (not real git):
- **Commit**: `{ id, parentId, mergeIds[], branch, ts, prompt, response }`
- **Conversation**: `{ id, title, commits[], headId, branch, parentRef, u }`
- **Branches**: Named branches (main, branch-0, ...) tracked by `commit.branch`
- **HEAD**: `headId` tracks current position; new messages append from HEAD
- **Merges**: Commits with `mergeIds[]` combine content from multiple branches
- **Nested conversations**: Parent/child tree via `parentRef` (convId + commitId)

### Turn-Based Input

- `turn` state alternates between "prompt" and "response"
- Prompt turn: creates a commit with `response: ""`
- Response turn: fills in the empty response of the current HEAD commit
- UI shows turn indicator, placeholder text, and button label change accordingly

### /show Commands

- `/show today` — Shows timeline of all conversations updated today
- `/show yesterday` — Shows timeline of all conversations updated yesterday
- Timeline replaces the center panel with a scrollable day review

### Styling

- Inline `style` objects with theme color values from `t` (theme object)
- Two complete color palettes: LIGHT and DARK, defined in App.jsx
- Branch colors via `bCol(names, branch)` helper
- Only CSS class: `.graph-scroll` for scrollbar hiding

## Coding Conventions

- **Abbreviations in state**: `t` = theme, `mm` = merge mode, `sel` = selected, `cm` = commit, `cv` = conversation, `cid` = commit ID, `hid` = head ID, `br` = branch
- **Naming**: camelCase for functions/variables, PascalCase for components
- **Icons**: Inline SVG components (SunIcon, MoonIcon, GitHubIcon)
- **No TypeScript** - plain JSX throughout

## Deployment

- **Netlify**: Build with `npm run build`, publish `dist/`
- **SPA redirect**: `/*` -> `/index.html` (200 status) in `netlify.toml`
- **Static site only** - no serverless functions
