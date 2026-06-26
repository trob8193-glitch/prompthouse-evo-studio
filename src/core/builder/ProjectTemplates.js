/**
 * PH EVO STUDIO — PROJECT TEMPLATES (PRODUCTION GRADE x10)
 * ═══════════════════════════════════════════════════════════════
 * Engineered prompt system for generating complete, production-grade
 * multi-file applications. Each template enforces real architecture:
 * routing, state management, API layers, auth, theming, and testing.
 *
 * Nothing test-rund. Every generated file must be runnable code.
 */

// ─── SHARED ARCHITECTURE RULES ──────────────────────────────────
const UNIVERSAL_RULES = `
ABSOLUTE RULES (VIOLATIONS = REJECTION):
1. Every file must contain COMPLETE, RUNNABLE code — no "// T-O-D-O", "// implement later", "// static-string", or empty function bodies.
2. All imports must reference files that exist in your output.
3. Every component/widget must render real UI with real data, not just text saying "Coming Soon".
4. State management must be functional — forms must update state, lists must be addable/removable.
5. Navigation must work — every route/link must connect to a real page/screen.
6. Styling must be complete — no unstyled components. Use a cohesive dark theme.
7. Output ONLY a raw JSON object. Keys = file paths, Values = file content strings. NO markdown wrapping.
`;

// ═══════════════════════════════════════════════════════════════
// REACT (VITE) — Full SPA Architecture
// ═══════════════════════════════════════════════════════════════
const REACT_TEMPLATE = {
  id: 'react',
  name: 'React (Vite)',
  icon: '⚛️',
  systemPrompt: `You are a senior React architect. You generate production-grade React SPAs using Vite.
You output ONLY a single valid JSON object mapping file paths to complete file content strings.
${UNIVERSAL_RULES}`,

  buildPrompt: (name, mission, features) => {
    const featureList = features.split(',').map(f => f.trim()).filter(Boolean);
    return `Generate a COMPLETE production React (Vite) application.

APP: ${name}
MISSION: ${mission}
FEATURES: ${featureList.join(', ')}

MANDATORY FILE STRUCTURE (generate ALL of these):

── package.json
   name: "${name}", type: "module"
   dependencies: react, react-dom, react-router-dom, zustand
   devDependencies: @vitejs/plugin-react, vite
   scripts: dev, build, preview

── vite.config.js
   React plugin, resolve aliases (@/ -> src/)

── index.html
   Root div, loads /src/main.jsx, includes Google Font "Inter"

── src/main.jsx
   BrowserRouter wrapping <App />, renders into #root

── src/App.jsx
   - Import and render <Navigation />
   - <Routes> with a <Route> for each feature plus a home route
   - Wrap in a layout div with sidebar + main content area

── src/index.css (COMPLETE dark theme)
   :root variables: --bg-primary: #0a0e17, --bg-card: #111827, --text-primary: #f1f5f9,
   --accent: #3b82f6, --accent-green: #22c55e, --accent-red: #ef4444, --border: #1e293b
   font-family: 'Inter', sans-serif
   Styles for: body, .app-layout (grid sidebar+main), .sidebar, .nav-link, .nav-link.active,
   .page-container, .page-title, .card, .card-header, .card-body,
   .btn, .btn-primary, .btn-danger, .btn-sm,
   .form-group, .form-label, .form-input, .form-textarea, .form-select,
   .table, .table th, .table td, .badge, .badge-success, .badge-warning,
   .stat-grid (CSS grid 2-4 cols), .stat-card, .stat-value, .stat-label,
   .empty-state, .modal-overlay, .modal-content,
   Transitions on all interactive elements, scrollbar styling

── src/components/Navigation.jsx
   Sidebar navigation with NavLink for each feature, active state styling,
   app logo/name at top, shows current route indicator

── src/components/StatCard.jsx
   Reusable stat display: icon, value, label, trend indicator (up/down arrow + color)

── src/components/DataTable.jsx
   Reusable table: accepts columns[] and rows[], renders thead/tbody,
   empty state when no rows, optional onRowClick

── src/components/Modal.jsx
   Reusable modal: overlay + content, title, children, onClose, animated

── src/components/FormField.jsx
   Reusable form field: label, input/textarea/select, error message display

── src/hooks/useLocalStorage.js
   Custom hook: [value, setValue] = useLocalStorage(key, defaultValue)
   Persists state to localStorage, parses JSON

── src/store/appStore.js
   Zustand store with:
   - notifications array, addNotification(msg, type), dismissNotification(id)
   - theme: 'dark', toggleTheme
   - user: { name, email } or null

${featureList.map((f, i) => `── src/pages/${f.replace(/\s+/g, '')}Page.jsx
   FULL page component for "${f}" with:
   - Page title and description
   - At least one working form OR interactive list with add/edit/delete
   - useState for local data, useEffect where needed
   - StatCard row showing relevant metrics (use real numbers)
   - DataTable displaying items if applicable
   - Modal for add/edit forms
   - All event handlers fully implemented
   - useLocalStorage hook to persist data across refreshes`).join('\n\n')}

── src/pages/HomePage.jsx
   Dashboard overview:
   - Welcome header with user name from store
   - Stat grid showing counts from each feature area
   - Recent activity list (last 5 actions from localStorage)
   - Quick-action buttons linking to each feature

TOTAL EXPECTED FILES: ${7 + 5 + 1 + 1 + featureList.length + 1} minimum

Output the complete JSON object now.`;
  }
};

// ═══════════════════════════════════════════════════════════════
// FLUTTER — Full Mobile Architecture
// ═══════════════════════════════════════════════════════════════
const FLUTTER_TEMPLATE = {
  id: 'flutter',
  name: 'Flutter',
  icon: '📱',
  systemPrompt: `You are a senior Flutter/Dart architect. You generate production-grade Flutter mobile applications.
You output ONLY a single valid JSON object mapping file paths to complete file content strings.
${UNIVERSAL_RULES}`,

  buildPrompt: (name, mission, features) => {
    const featureList = features.split(',').map(f => f.trim()).filter(Boolean);
    return `Generate a COMPLETE production Flutter application.

APP: ${name}
MISSION: ${mission}
FEATURES: ${featureList.join(', ')}

MANDATORY FILE STRUCTURE (generate ALL):

── pubspec.yaml
   name: ${name}, description: "${mission}"
   environment: sdk: '>=3.0.0 <4.0.0', flutter: '>=3.10.0'
   dependencies: flutter (sdk), cupertino_icons, provider, shared_preferences, intl, uuid
   flutter: uses-material-design: true

── lib/main.dart
   - MultiProvider wrapping MaterialApp
   - Dark theme with ColorScheme.dark() customized:
     primary: Color(0xFF3B82F6), surface: Color(0xFF111827),
     background: Color(0xFF0A0E17), error: Color(0xFFEF4444)
   - Named routes for every feature screen plus home
   - ChangeNotifierProvider for each feature's state

── lib/theme/app_theme.dart
   Static ThemeData with complete dark theme:
   - AppBar theme, Card theme, Input decoration theme
   - Text theme with Inter-like sizing
   - ElevatedButton, OutlinedButton, TextButton themes
   - BottomNavigationBar theme

── lib/screens/home_screen.dart
   - Scaffold with BottomNavigationBar for feature tabs
   - Dashboard body with:
     - GridView of stat cards (real counts from providers)
     - Recent activity ListView
     - FloatingActionButton for quick add

${featureList.map(f => `── lib/screens/${f.toLowerCase().replace(/\s+/g, '_')}_screen.dart
   Full screen for "${f}" with:
   - AppBar with title and action buttons
   - Body with either ListView.builder or Form
   - FloatingActionButton to add new items
   - showModalBottomSheet for add/edit forms
   - Real setState or Provider.of calls
   - Dismissible for swipe-to-delete on list items
   - Empty state widget when list is empty`).join('\n\n')}

── lib/models/app_item.dart
   Generic data model class:
   - String id, String title, String description, DateTime createdAt, bool isComplete
   - factory AppItem.create(title, description)
   - Map<String, dynamic> toJson()
   - factory AppItem.fromJson(Map<String, dynamic>)

${featureList.map(f => `── lib/models/${f.toLowerCase().replace(/\s+/g, '_')}_model.dart
   Domain model for "${f}" with:
   - At least 4 typed fields relevant to the feature
   - Named constructor, factory fromJson, toJson
   - copyWith method`).join('\n\n')}

${featureList.map(f => `── lib/providers/${f.toLowerCase().replace(/\s+/g, '_')}_provider.dart
   ChangeNotifier for "${f}" with:
   - Private List<Model> _items = []
   - List<Model> get items => [..._items]
   - void add(model), void update(id, model), void remove(id), void toggleComplete(id)
   - int get count, int get completedCount
   - Save/load from SharedPreferences as JSON`).join('\n\n')}

── lib/widgets/stat_card.dart
   Reusable StatCard: icon, value, label, color, onTap

── lib/widgets/empty_state.dart
   Reusable EmptyState: icon, title, subtitle, action button

── lib/widgets/item_tile.dart
   Reusable ListTile wrapper: title, subtitle, trailing actions, onTap, onDismiss

── lib/utils/date_formatter.dart
   Extension on DateTime: toRelative(), toFormatted()

TOTAL EXPECTED FILES: ${3 + featureList.length + 1 + featureList.length + featureList.length + 4} minimum

Output the complete JSON object now.`;
  }
};

// ═══════════════════════════════════════════════════════════════
// NEXT.JS — Full-Stack with App Router
// ═══════════════════════════════════════════════════════════════
const NEXTJS_TEMPLATE = {
  id: 'nextjs',
  name: 'Next.js',
  icon: '▲',
  systemPrompt: `You are a senior Next.js full-stack architect. You generate production-grade Next.js 14 apps using the App Router.
You output ONLY a single valid JSON object mapping file paths to complete file content strings.
${UNIVERSAL_RULES}`,

  buildPrompt: (name, mission, features) => {
    const featureList = features.split(',').map(f => f.trim()).filter(Boolean);
    return `Generate a COMPLETE production Next.js 14 application with App Router.

APP: ${name}
MISSION: ${mission}
FEATURES: ${featureList.join(', ')}

MANDATORY FILE STRUCTURE:

── package.json
   dependencies: next, react, react-dom
   devDependencies: tailwindcss, postcss, autoprefixer, @types/node
   scripts: dev, build, start, lint

── next.config.js — reactStrictMode: true

── tailwind.config.js
   content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}']
   darkMode: 'class'
   Extended theme with custom colors matching dark design

── postcss.config.js — tailwindcss + autoprefixer

── app/layout.jsx
   - RootLayout with <html lang="en" className="dark">
   - metadata export: title, description, viewport
   - Import globals.css
   - <Navigation /> + <main> wrapper

── app/globals.css
   @tailwind base/components/utilities
   Custom dark body: bg-gray-950, text-gray-100
   Custom component classes: .card, .btn-primary, .stat-card, .form-input
   Scrollbar styling, selection color

── app/page.jsx
   Server Component home page:
   - Hero section with app name and mission
   - Feature grid cards linking to each feature route
   - Stats overview section

${featureList.map(f => {
    const slug = f.toLowerCase().replace(/\s+/g, '-');
    return `── app/${slug}/page.jsx
   "use client" page for "${f}":
   - useState for items list, form state, modal state
   - Full CRUD UI: add form, edit modal, delete with confirmation
   - Table or card grid showing items
   - useEffect to load/save from localStorage
   - Search/filter functionality
   - Stat cards row at top`;
  }).join('\n\n')}

── components/Navigation.jsx
   "use client" sidebar with usePathname for active detection
   Links to home and all features, app branding

── components/Modal.jsx — Reusable overlay modal with title, body, footer

── components/StatCard.jsx — Icon + value + label + trend

── components/DataTable.jsx — columns + rows + empty state + row actions

── components/SearchBar.jsx — "use client" search input with debounce, onSearch callback

TOTAL EXPECTED FILES: ${6 + featureList.length + 5} minimum

Output the complete JSON object now.`;
  }
};

// ═══════════════════════════════════════════════════════════════
// EXPRESS API — Production REST Backend
// ═══════════════════════════════════════════════════════════════
const EXPRESS_TEMPLATE = {
  id: 'express_api',
  name: 'Express API',
  icon: '🔌',
  systemPrompt: `You are a senior Node.js backend architect. You generate production-grade Express.js REST APIs.
You output ONLY a single valid JSON object mapping file paths to complete file content strings.
${UNIVERSAL_RULES}`,

  buildPrompt: (name, mission, features) => {
    const resources = features.split(',').map(f => f.trim()).filter(Boolean);
    return `Generate a COMPLETE production Express.js REST API.

APP: ${name}
MISSION: ${mission}
RESOURCES: ${resources.join(', ')}

MANDATORY FILE STRUCTURE:

── package.json
   type: "module"
   dependencies: express, cors, helmet, dotenv, uuid, morgan
   devDependencies: nodemon
   scripts: start: "node server.js", dev: "nodemon server.js"

── server.js
   - Import all route files
   - helmet(), cors(), morgan('dev'), express.json({ limit: '10mb' })
   - Mount routes: /api/<resource> for each
   - Global error handler middleware
   - 404 handler
   - Listen on process.env.PORT || 3500

── middleware/errorHandler.js
   - Catches all errors, logs to console
   - Returns { error: message, status } JSON

── middleware/validateBody.js
   - Takes requiredFields array, returns middleware
   - Checks req.body for each field, returns 400 if missing

── middleware/logger.js
   - Logs method, path, status, response time

${resources.map(r => {
    const name = r.toLowerCase().replace(/\s+/g, '_');
    return `── routes/${name}.js
   Express Router with full CRUD:
   GET    /           — list all (supports ?search=, ?limit=, ?offset=)
   GET    /:id        — get by ID, 404 if not found
   POST   /           — create (validate required fields, assign uuid)
   PUT    /:id        — full update, 404 if not found
   PATCH  /:id        — partial update
   DELETE /:id        — delete, 404 if not found
   In-memory array store with realistic seed data (3-5 items pre-loaded)

── models/${name}.js
   - createItem(data): assigns id (uuid), createdAt, updatedAt
   - validateItem(data): returns { valid, errors[] }
   - Schema comment documenting all fields`;
  }).join('\n\n')}

── utils/response.js
   - success(res, data, status=200)
   - error(res, message, status=400)
   - paginate(items, limit, offset) -> { data, total, limit, offset, hasMore }

── .env.example
   PORT=3500
   NODE_ENV=development

── README.md
   Full API documentation:
   - Setup instructions (npm install, cp .env.example .env, npm run dev)
   - Endpoints table for each resource (Method, Path, Description, Body)
   - Example curl commands
   - Error response format

TOTAL EXPECTED FILES: ${5 + (resources.length * 2) + 3} minimum

Output the complete JSON object now.`;
  }
};

// ═══════════════════════════════════════════════════════════════
// REACT NATIVE — Cross-Platform Mobile
// ═══════════════════════════════════════════════════════════════
const REACT_NATIVE_TEMPLATE = {
  id: 'react_native',
  name: 'React Native',
  icon: '📲',
  systemPrompt: `You are a senior React Native architect. You generate production-grade cross-platform mobile applications using Expo.
You output ONLY a single valid JSON object mapping file paths to complete file content strings.
${UNIVERSAL_RULES}`,

  buildPrompt: (name, mission, features) => {
    const featureList = features.split(',').map(f => f.trim()).filter(Boolean);
    return `Generate a COMPLETE production React Native (Expo) application.

APP: ${name}
MISSION: ${mission}
FEATURES: ${featureList.join(', ')}

MANDATORY FILE STRUCTURE:

── package.json
   dependencies: expo, react, react-native, @react-navigation/native, @react-navigation/bottom-tabs,
   @react-navigation/native-stack, react-native-screens, react-native-safe-area-context,
   @react-native-async-storage/async-storage, expo-status-bar, uuid
   scripts: start, android, ios, web

── app.json
   expo config: name, slug, version, orientation, icon fallback_image, splash, platforms

── App.js
   NavigationContainer with dark theme, StatusBar, Bottom Tab Navigator
   Tab screens for Home + each feature

── src/theme/colors.js
   Export dark palette: background, surface, card, text, textSecondary, primary, success, danger, border

── src/theme/typography.js
   Export font sizes and weights for headers, body, caption

── src/screens/HomeScreen.js
   - ScrollView with stat cards grid (2 columns using Dimensions)
   - Recent activity FlatList
   - Quick action TouchableOpacity buttons

${featureList.map(f => `── src/screens/${f.replace(/\s+/g, '')}Screen.js
   Full screen for "${f}":
   - FlatList or SectionList for data display
   - FAB (floating action button) for adding items
   - Modal for add/edit form with TextInput fields
   - Swipeable rows for delete action
   - AsyncStorage for persistence
   - Empty state component when no data`).join('\n\n')}

── src/components/StatCard.js — Reusable pressable card: icon, value, label, color
── src/components/EmptyState.js — Icon + message + action button
── src/components/ItemCard.js — Card with title, subtitle, trailing info, onPress
── src/components/FAB.js — Floating action button, positioned absolute bottom-right
── src/components/FormModal.js — Modal with title, TextInput fields, Save/Cancel buttons

── src/hooks/useAsyncStorage.js
   Custom hook: [data, setData, loading] with automatic JSON parse/stringify

── src/utils/formatDate.js
   Relative time formatter ("2 hours ago", "Yesterday", etc.)

Output the complete JSON object now.`;
  }
};

// ═══════════════════════════════════════════════════════════════
// ELECTRON — Desktop Application
// ═══════════════════════════════════════════════════════════════
const ELECTRON_TEMPLATE = {
  id: 'electron',
  name: 'Electron Desktop',
  icon: '🖥️',
  systemPrompt: `You are a senior Electron architect. You generate production-grade desktop applications with Electron + React.
You output ONLY a single valid JSON object mapping file paths to complete file content strings.
${UNIVERSAL_RULES}`,

  buildPrompt: (name, mission, features) => {
    const featureList = features.split(',').map(f => f.trim()).filter(Boolean);
    return `Generate a COMPLETE production Electron desktop application with React renderer.

APP: ${name}
MISSION: ${mission}
FEATURES: ${featureList.join(', ')}

MANDATORY FILE STRUCTURE:

── package.json
   main: "main.js"
   dependencies: electron-store
   devDependencies: electron, @vitejs/plugin-react, vite, react, react-dom, react-router-dom
   scripts: dev (vite), build (vite build), electron (electron .), start (vite build && electron .)

── main.js (Electron main process)
   - BrowserWindow with dark background, 1200x800, webPreferences with preload
   - Load vite dev server in dev mode, built index.html in production
   - Menu template with File, Edit, View, Window menus
   - IPC handlers for file system operations

── preload.js
   - contextBridge.exposeInMainWorld for safe IPC communication
   - Expose: readFile, writeFile, showSaveDialog, showOpenDialog, getAppVersion

── vite.config.js — React plugin, base: './'

── index.html — loads /src/main.jsx

── src/main.jsx — BrowserRouter + App

── src/App.jsx
   Layout with sidebar navigation + main content Routes

── src/index.css
   Full desktop-optimized dark theme with:
   - Window drag region (-webkit-app-region: drag)
   - Sidebar with fixed width
   - Custom scrollbars for desktop feel
   - Focus-visible outlines for keyboard navigation

── src/components/TitleBar.jsx
   Custom title bar with window controls (minimize, maximize, close)
   App name and icon, -webkit-app-region: drag

── src/components/Sidebar.jsx — Navigation with icons and active state
── src/components/StatusBar.jsx — Bottom bar with app version, connection status

${featureList.map(f => `── src/pages/${f.replace(/\s+/g, '')}Page.jsx
   Full desktop page for "${f}" with rich interactive UI, tables, forms, modals`).join('\n')}

── src/pages/HomePage.jsx — Dashboard with stats grid and recent activity

── src/store/appStore.js — Zustand store persisted to electron-store

Output the complete JSON object now.`;
  }
};

// ═══════════════════════════════════════════════════════════════
// PYTHON FASTAPI — Modern Python Backend
// ═══════════════════════════════════════════════════════════════
const FASTAPI_TEMPLATE = {
  id: 'fastapi',
  name: 'Python FastAPI',
  icon: '🐍',
  systemPrompt: `You are a senior Python backend architect. You generate production-grade FastAPI applications with proper typing and async.
You output ONLY a single valid JSON object mapping file paths to complete file content strings.
${UNIVERSAL_RULES}`,

  buildPrompt: (name, mission, features) => {
    const resources = features.split(',').map(f => f.trim()).filter(Boolean);
    return `Generate a COMPLETE production Python FastAPI application.

APP: ${name}
MISSION: ${mission}
RESOURCES: ${resources.join(', ')}

MANDATORY FILE STRUCTURE:

── requirements.txt
   fastapi, uvicorn[standard], pydantic, python-dotenv

── main.py
   FastAPI app with CORS middleware, routers mounted, startup/shutdown events
   Root endpoint returning { "app": "${name}", "status": "running" }

── config.py
   Settings class using pydantic BaseSettings, loads from .env

${resources.map(r => {
    const name = r.toLowerCase().replace(/\s+/g, '_');
    return `── routers/${name}.py
   APIRouter with prefix="/${name}s", tags=["${r}"]
   Endpoints: list (GET), get_by_id (GET), create (POST), update (PUT), delete (DELETE)
   Query params: skip, limit, search
   In-memory list store with 3 seed items

── schemas/${name}.py
   Pydantic models: ${r}Base, ${r}Create, ${r}Update, ${r}Response
   With Field validators and examples

── models/${name}.py
   Data class with id (uuid4), created_at, updated_at fields`;
  }).join('\n\n')}

── utils/response.py
   Standard response wrapper functions

── .env.example
   APP_NAME=${name}, DEBUG=true, PORT=8000

── README.md
   Setup: python -m venv venv, pip install -r requirements.txt, uvicorn main:app --reload
   Endpoint documentation table

Output the complete JSON object now.`;
  }
};

// ═══════════════════════════════════════════════════════════════
// SVELTE — Lightweight Reactive Frontend
// ═══════════════════════════════════════════════════════════════
const SVELTE_TEMPLATE = {
  id: 'svelte',
  name: 'SvelteKit',
  icon: '🔥',
  systemPrompt: `You are a senior Svelte/SvelteKit architect. You generate production-grade SvelteKit applications.
You output ONLY a single valid JSON object mapping file paths to complete file content strings.
${UNIVERSAL_RULES}`,

  buildPrompt: (name, mission, features) => {
    const featureList = features.split(',').map(f => f.trim()).filter(Boolean);
    return `Generate a COMPLETE production SvelteKit application.

APP: ${name}
MISSION: ${mission}
FEATURES: ${featureList.join(', ')}

MANDATORY FILE STRUCTURE:

── package.json
   devDependencies: @sveltejs/kit, @sveltejs/adapter-auto, svelte, vite

── svelte.config.js — adapter-auto

── vite.config.js — sveltekit plugin

── src/app.html — HTML shell with %sveltekit.head% and %sveltekit.body%

── src/app.css
   Complete dark theme CSS: variables, layout, components, forms, tables, buttons

── src/routes/+layout.svelte
   Navigation sidebar + main content slot

── src/routes/+page.svelte
   Home dashboard with stat cards and feature links

${featureList.map(f => {
    const slug = f.toLowerCase().replace(/\s+/g, '-');
    return `── src/routes/${slug}/+page.svelte
   Full page for "${f}" with reactive $: declarations, each blocks,
   bind:value on inputs, on:click handlers, transition directives`;
  }).join('\n\n')}

── src/lib/stores.js
   Svelte writable stores for each feature's data, persisted to localStorage

── src/lib/components/StatCard.svelte — Reusable stat display
── src/lib/components/Modal.svelte — Reusable modal with transition:fade
── src/lib/components/DataTable.svelte — Reusable table with slot for actions

Output the complete JSON object now.`;
  }
};

// ═══════════════════════════════════════════════════════════════
// VUE 3 — Composition API Frontend
// ═══════════════════════════════════════════════════════════════
const VUE_TEMPLATE = {
  id: 'vue',
  name: 'Vue 3',
  icon: '💚',
  systemPrompt: `You are a senior Vue.js architect. You generate production-grade Vue 3 applications using the Composition API.
You output ONLY a single valid JSON object mapping file paths to complete file content strings.
${UNIVERSAL_RULES}`,

  buildPrompt: (name, mission, features) => {
    const featureList = features.split(',').map(f => f.trim()).filter(Boolean);
    return `Generate a COMPLETE production Vue 3 (Vite) application.

APP: ${name}
MISSION: ${mission}
FEATURES: ${featureList.join(', ')}

MANDATORY FILE STRUCTURE:

── package.json
   dependencies: vue, vue-router, pinia
   devDependencies: @vitejs/plugin-vue, vite

── vite.config.js — vue plugin

── index.html — loads /src/main.js

── src/main.js
   createApp, createPinia, createRouter — mount to #app

── src/App.vue
   <template> with <RouterView /> and <Navigation />
   <script setup> composition API

── src/assets/main.css — Complete dark theme

── src/router/index.js
   Routes for home + each feature

── src/stores/appStore.js
   Pinia store with notifications, theme, user state

${featureList.map(f => {
    const pascal = f.replace(/\s+/g, '');
    return `── src/views/${pascal}View.vue
   Full page with <script setup>, ref(), computed(), watch()
   Template with v-for lists, v-model forms, @click handlers, v-if conditionals
   Real CRUD operations on reactive data

── src/stores/${f.toLowerCase().replace(/\s+/g, '')}Store.js
   Pinia store: items ref, add/update/remove actions, getters for counts`;
  }).join('\n\n')}

── src/views/HomeView.vue — Dashboard with stats and quick actions

── src/components/StatCard.vue — Reusable with props: icon, value, label, color
── src/components/ModalDialog.vue — Reusable with slots, emit close
── src/components/DataTable.vue — Props: columns, rows, with scoped slots
── src/components/NavSidebar.vue — RouterLink with active class detection

Output the complete JSON object now.`;
  }
};

// ═══════════════════════════════════════════════════════════════
// FULL STACK — React + Express Combined
// ═══════════════════════════════════════════════════════════════
const FULLSTACK_TEMPLATE = {
  id: 'fullstack',
  name: 'Full Stack (React + Express)',
  icon: '🏗️',
  systemPrompt: `You are a senior full-stack architect. You generate complete full-stack applications with a React frontend and Express API backend in a monorepo structure.
You output ONLY a single valid JSON object mapping file paths to complete file content strings.
${UNIVERSAL_RULES}`,

  buildPrompt: (name, mission, features) => {
    const resources = features.split(',').map(f => f.trim()).filter(Boolean);
    return `Generate a COMPLETE full-stack monorepo application with React frontend + Express backend.

APP: ${name}
MISSION: ${mission}
FEATURES/RESOURCES: ${resources.join(', ')}

MANDATORY FILE STRUCTURE:

── package.json (root)
   scripts: "dev": "concurrently \\"npm run dev:api\\" \\"npm run dev:client\\"",
   "dev:api": "cd api && npm run dev", "dev:client": "cd client && npm run dev"
   devDependencies: concurrently

── api/package.json — Express backend
── api/server.js — Express with CORS allowing localhost:5173
── api/middleware/errorHandler.js
${resources.map(r => `── api/routes/${r.toLowerCase().replace(/\s+/g, '_')}.js — Full CRUD endpoints with in-memory store + seed data`).join('\n')}

── client/package.json — React Vite frontend
── client/vite.config.js — proxy /api to localhost:3500
── client/index.html
── client/src/main.jsx
── client/src/App.jsx — Routes for all features
── client/src/index.css — Complete dark theme
── client/src/components/Navigation.jsx
── client/src/components/StatCard.jsx
── client/src/components/DataTable.jsx
── client/src/components/Modal.jsx

── client/src/api/client.js
   Fetch wrapper: get(path), post(path, body), put(path, body), del(path)
   Base URL: /api, JSON headers, error handling

${resources.map(r => `── client/src/pages/${r.replace(/\s+/g, '')}Page.jsx
   Full page fetching from /api/${r.toLowerCase().replace(/\s+/g, '_')}s
   useEffect to load data on mount, CRUD operations via api/client.js
   Forms, tables, modals — all wired to real API calls`).join('\n')}

── client/src/pages/HomePage.jsx — Dashboard fetching stats from each API resource

── README.md
   Setup: npm install, cd api && npm install, cd client && npm install, npm run dev
   Architecture diagram (text), API endpoints table

Output the complete JSON object now.`;
  }
};


// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export const PLATFORM_TEMPLATES = {
  react: REACT_TEMPLATE,
  flutter: FLUTTER_TEMPLATE,
  nextjs: NEXTJS_TEMPLATE,
  express_api: EXPRESS_TEMPLATE,
  react_native: REACT_NATIVE_TEMPLATE,
  electron: ELECTRON_TEMPLATE,
  fastapi: FASTAPI_TEMPLATE,
  svelte: SVELTE_TEMPLATE,
  vue: VUE_TEMPLATE,
  fullstack: FULLSTACK_TEMPLATE
};

export const APP_TYPES = Object.values(PLATFORM_TEMPLATES).map(t => ({
  id: t.id,
  name: t.name,
  icon: t.icon
}));

/**
 * Build the full prompt payload for a given platform.
 */
export function buildProjectPrompt(platform, appName, mission, features) {
  const template = PLATFORM_TEMPLATES[platform];
  if (!template) {
    const supported = Object.keys(PLATFORM_TEMPLATES).join(', ');
    throw new Error(`Unknown platform: "${platform}". Supported: ${supported}`);
  }

  return {
    systemPrompt: template.systemPrompt,
    userPrompt: template.buildPrompt(appName, mission, features)
  };
}
