# ChatApp — React 19 + Vite 6 + Tailwind v4

A clean, minimal, fully API-connected chat frontend.

## Tech Stack

| Tool         | Version |
|--------------|---------|
| React        | 19.x    |
| Vite         | 6.x     |
| Tailwind CSS | 4.x     |
| Lucide React | 0.468.x |
| Axios        | 1.x     |

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env and set VITE_SERVER_API to your backend URL

# 3. Start dev server
npm run dev

# 4. Build for production
npm run build
```

---

## Project Structure

```
chat-app/
├── index.html
├── vite.config.js
├── .env.example
├── package.json
└── src/
    ├── main.jsx                  # Entry — wraps app in AuthProvider
    ├── App.jsx                   # Root: auth gate + layout + error toast
    ├── index.css                 # Tailwind v4 @import + @theme tokens
    ├── context/
    │   └── AuthContext.jsx       # Login/logout state, persisted to localStorage
    ├── hooks/
    │   └── useChat.js            # All chat state: fetch, send, delete, groups
    ├── utils/
    │   └── api.js                # Axios client + all API functions
    ├── pages/
    │   └── LoginPage.jsx         # Login form (username + password)
    └── components/
        ├── Avatar.jsx            # Avatar circle with status dot
        ├── SearchBar.jsx         # Search input with clear button
        ├── ContactItem.jsx       # Single chat row in sidebar
        ├── Modal.jsx             # Reusable modal wrapper (Esc to close)
        ├── CreateGroupModal.jsx  # Create group chat (name + member IDs)
        ├── ChatInfoPanel.jsx     # Right panel: rename, members, leave, delete
        ├── Sidebar.jsx           # Left panel: chats + new group + logout
        ├── ChatHeader.jsx        # Top bar with contact info + info toggle
        ├── MessageBubble.jsx     # Message bubble: text, attachments, delete
        ├── MessageList.jsx       # Scrollable thread with loading skeleton
        ├── MessageInput.jsx      # Textarea + file picker + send button
        └── ChatWindow.jsx        # Combines header + list + input + info panel
```

---

## API Routes Used

| Method | Endpoint                      | Purpose                  |
|--------|-------------------------------|--------------------------|
| POST   | `/users/login`                | Login                    |
| GET    | `/users/logout`               | Logout                   |
| GET    | `/message/:chatId/messages`   | Fetch messages           |
| POST   | `/message/:chatId`            | Send message             |
| DELETE | `/message/:messageId`         | Delete message           |
| POST   | `/chat/one-to-one`            | Create 1-to-1 chat       |
| POST   | `/chat/group`                 | Create group chat        |
| GET    | `/chat/`                      | Get all user chats       |
| GET    | `/chat/:chatId`               | Get chat by ID           |
| PATCH  | `/chat/:chatId/rename`        | Rename group             |
| PATCH  | `/chat/:chatId/add-member`    | Add member to group      |
| PATCH  | `/chat/:chatId/remove-member` | Remove member from group |
| PATCH  | `/chat/:chatId/leave`         | Leave group              |
| DELETE | `/chat/:chatId`               | Delete chat              |

---

## Features

- **Auth** — Login page, session persisted to localStorage, logout button
- **Chat list** — All user chats from API with search filter
- **1-to-1 and Group chats** — Full support for both
- **Messages** — Fetch on select, optimistic send, failed state indicator
- **Attachments** — Multi-file picker, preview chips, sent as multipart/form-data
- **Delete messages** — Hover to reveal delete on your own messages
- **Group management** — Rename, add/remove members, leave, delete via info panel
- **Error toasts** — API errors shown as auto-dismissing bottom toasts
- **Loading states** — Skeleton loaders for messages, spinner for chats

---

## Tailwind v4 Notes

- Uses `@import "tailwindcss"` not `@tailwind` directives
- Custom tokens live in `@theme {}` inside `src/index.css`
- No `tailwind.config.js` needed
- Plugin: `@tailwindcss/vite` replaces PostCSS setup
