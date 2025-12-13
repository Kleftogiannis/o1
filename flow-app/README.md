# O(1) - Decide in Constant Time

An anticipatory decision-making mobile app that helps you make instant decisions, regardless of complexity. Built with React Native and Expo.

## Tech Stack

- **Framework:** React Native with Expo
- **Language:** TypeScript (strict mode)
- **Database:** WatermelonDB (offline-first)
- **Animations:** Rive
- **State Management:** Zustand
- **Gestures:** react-native-reanimated + react-native-gesture-handler
- **Haptics:** expo-haptics
- **Navigation:** Expo Router (file-based routing)

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo Go app on your mobile device (for testing)

### Installation

Dependencies are already installed. To reinstall:

```bash
npm install
```

### Running the App

Start the development server:

```bash
npm start
```

This will open Expo DevTools. You can then:

- **Scan QR code** with Expo Go app (iOS/Android)
- Press **`a`** to open in Android emulator
- Press **`i`** to open in iOS simulator
- Press **`w`** to open in web browser

### Alternative Commands

```bash
npm run android   # Run on Android
npm run ios       # Run on iOS (macOS only)
npm run web       # Run in web browser
```

### Project Structure

```
o1-decision-app/
├── app/              # Expo Router screens (file-based routing)
│   ├── _layout.tsx   # Root layout
│   ├── index.tsx     # Home screen
│   └── +not-found.tsx # 404 screen
├── components/       # Reusable components
├── hooks/            # Custom hooks
├── models/           # WatermelonDB models
├── store/            # Zustand stores
├── utils/            # Utility functions
├── constants/        # Constants and theme
│   └── theme.ts      # Color scheme and typography
├── types/            # TypeScript types
└── assets/           # Images, fonts, animations
```

## Development Commands

```bash
npx tsc --noEmit              # Type check
npm start                      # Start dev server
npm start -- --clear           # Clear cache and start
```

## Next Steps

Phase 0 (Week 1): Personal Prototype
- [ ] Manual decision entry screen
- [ ] Tournament-style elimination UI
- [ ] Factor-based swiping component
- [ ] WatermelonDB setup and models
- [ ] Offline storage

See `CLAUDE.md` for full development roadmap.
