# Setu AA Mobile App

A React Native mobile application for Setu Account Aggregator integration.

## Features

- User authentication and registration
- Account aggregation consent management
- Financial account data viewing
- Transaction history
- Secure data handling with Setu APIs

## Tech Stack

- React Native with Expo
- TypeScript
- Redux Toolkit for state management
- React Navigation for routing
- Setu Account Aggregator APIs

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- pnpm package manager
- Expo CLI
- iOS Simulator or Android Emulator

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Start the development server:
```bash
pnpm start
```

3. Run on iOS:
```bash
pnpm ios
```

4. Run on Android:
```bash
pnpm android
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── screens/        # Screen components
├── services/       # API and external services
├── store/          # Redux store and slices
├── hooks/          # Custom React hooks
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── config/         # Configuration files
```

## Environment Configuration

Copy the environment configuration from `src/config/environment.ts` and update with your Setu API credentials.

## Backend

The backend server is located in the `backend/` directory. See the backend README for setup instructions.
