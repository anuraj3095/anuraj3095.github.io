# anuraj.me - Personal Hub

This repository contains the source code for [anuraj.me](https://anuraj.me), my personal hub and digital multiverse. It's built with **Vite**, **React**, **TypeScript**, and **Vanilla CSS**.

## Features

- **Bento Box UI**: A scalable, modular dashboard displaying various interests (Engineering, Finance, Machines, Cooking).
- **Interactive Sandbox**: Contains custom-built mini-games (like a React-based Memory Game) for fun and interactive engagement.
- **Dark Mode Aesthetics**: Glassmorphism, smooth animations, and a premium neon/dark aesthetic using raw CSS variables.

## Running Locally for Testing

To run the site on your local machine for development:

1. Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).
2. Install the project dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the local URL provided in the terminal (usually `http://localhost:5173`).

## Deploying to Production

This project uses **GitHub Actions** for automated deployment.

1. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Update website content"
   ```
2. **Push to GitHub**:
   ```bash
   git push origin main
   ```
3. **Automated Deployment**:
   Once pushed to the `main` branch, the `.github/workflows/deploy.yml` workflow will automatically trigger. It builds the Vite app and deploys the `dist` folder directly to GitHub Pages.

> **Note**: Your professional portfolio is hosted separately at `/portfolio`. This site acts as the top-level hub linking to it.