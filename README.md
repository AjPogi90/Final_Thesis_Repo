# Parental Dashboard

Build with Create React App. No Vite.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with Firebase config (see `.env.example`)

3. Start development server:
```bash
npm start
```

4. Build for production:
```bash
npm run build
```
## how to push and pull
After editing your code:

git add .
git commit -m "Added dashboard analytics feature"
git push

Every commit is a saved version of your project.

Think of it like checkpoints in a game.

After editing your code:

git add .
git commit -m "Added dashboard analytics feature"
git push

Every commit is a saved version of your project.

Think of it like checkpoints in a game.

If something breaks and you want to undo a bad push:

git revert COMMIT_ID
git push

Example:

git revert a8f3d91c2e
git push

What this does:

Keeps your history

Creates a new commit that cancels the bad one

Safe for thesis projects

## Features

- Parent login with Firebase Authentication
- Real-time monitoring of child devices
- App blocking/unblocking
- Device control (lock/unlock)
- Location tracking with map view
- Light/dark theme support
- Mobile-responsive design

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components (Login, Dashboard, ChildDetails)
├── config/             # Firebase configuration
├── hooks/              # Custom React hooks (Firebase data fetching)
├── contexts/           # React Context (Theme, Auth)
├── utils/              # Helper functions
├── App.js              # Main app component with routing
├── index.js            # React entry point
└── index.css           # Global styles
```
