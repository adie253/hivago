# Hivago - Project Documentation

Welcome to the Hivago project documentation. This document provides a comprehensive overview of the technologies, architecture, and features implemented in this food delivery application.

---

## 🚀 Tech Stack

We chose these technologies to ensure a modern, performant, and type-safe development experience:

*   **React (v18)**: The core library for building the user interface.
*   **TypeScript**: Provides static type checking, reducing bugs and improving developer productivity.
*   **Vite**: A lightning-fast build tool and development server.
*   **Tailwind CSS**: A utility-first CSS framework for rapid UI development and consistent styling.
*   **Lucide React**: A beautiful and consistent icon library.
*   **GSAP**: Used for smooth, high-performance animations (e.g., in `RestaurantGrid`).
*   **React Router DOM**: Handles client-side routing and navigation.

---

## 🏗️ Architecture: Clean & Modular

Hivago is built with **Clean Architecture** principles in mind, ensuring a clear separation of concerns:

1.  **Core Layer (`src/core`)**: Contains the pure business logic, entities, and repository interfaces. It is independent of any UI framework or data source.
2.  **Data Layer (`src/data`)**: Responsible for data fetching and persistence. It implements the interfaces defined in the Core layer.
3.  **Presentation Layer (`src/presentation`)**: The React-based UI. It contains pages, components, and contexts to manage view-related state.
4.  **DI Layer (`src/di`)**: (Dependency Injection) Manages the assembly of the application's components.

---

## 📂 Project Structure

The project follows a clean, modular architecture:

```text
src/
├── assets/             # Static assets (SVGs, Images)
├── core/               # Core business logic and types
├── data/               # Data layer (JSON datasets, repositories)
│   └── restaurants.json # Master restaurant and menu data
├── presentation/       # UI Layer
│   ├── components/    # Reusable UI components
│   ├── context/       # State management (Filter, Cart, Favorites)
│   ├── hooks/         # Custom React hooks
│   └── pages/         # Page components (Home, Restaurants, etc.)
├── App.tsx             # Main application component & routes
└── main.tsx            # Application entry point
```

---

## 核心 Features & Implementation Details

### 1. Data-Driven Filtering System
The heart of the application is a synchronized filtering system powered by `FilterContext`.

*   **Centralized Data**: All restaurant and menu data is stored in `src/data/restaurants.json`.
*   **Global State**: `FilterContext` manages search queries, category selections, veg-only toggles, and rating/sort preferences across the entire app.
*   **Sync Logic**: When a user clicks a "Pizza" category icon, toggles the "VEG" switch, or types in the search bar, the UI updates instantly because all components consume the same `filteredRestaurants` state.

### 2. Search Overlay with Portal
The search experience is designed to be immersive and mobile-friendly:
*   **React Portals**: We use `createPortal` to render the `SearchOverlay` at the root of the DOM. This ensures it covers the entire screen, including the sticky Navbar and location tabs, without stacking context issues.
*   **Multi-level Search**: Users can search for both Restaurants and specific Dishes.
*   **Body Scroll Lock**: When the overlay is open, scrolling on the background page is disabled for a better UX.

### 3. Responsive & Premium Design
*   **Micro-animations**: Subtle hover effects and GSAP-powered entrance animations make the app feel alive.
*   **Adaptive Layouts**: The Footer and Navbar are optimized for both mobile and desktop views.
*   **Glassmorphism**: Elegant use of blurs and semi-transparent backgrounds for a premium feel.

---

## 🛠️ State Management

We use React's Context API for lightweight and effective state management:

1.  **FilterContext**: Synchronizes the search and discovery experience.
2.  **FavoritesContext**: Manages user-liked restaurants.
3.  **CartContext**: (Planned) To handle orders and checkout logic.

---

## 📖 How to Understand the Code

1.  **Start at `App.tsx`**: See how the providers wrap the application and how routes are defined.
2.  **Explore `src/presentation/context/FilterContext.tsx`**: This is where the main logic for filtering the `restaurants.json` data lives.
3.  **Check `src/presentation/components/SearchOverlay.tsx`**: Understand how we implement the full-screen search experience.
4.  **Review `src/data/restaurants.json`**: Familiarize yourself with the data structure used for restaurants and their menus.

---

## ⚙️ Development

To start the development server:
```bash
npm run dev
```

To build for production:
```bash
npm run build
```
