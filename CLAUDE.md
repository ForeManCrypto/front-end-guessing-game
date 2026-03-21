# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start        # Dev server on port 3000 (with RPC proxy)
npm run build    # Production build
npm test         # Run Jest tests
npm test -- --testPathPattern=App  # Run a single test file
```

## Architecture

This is a React/TypeScript Web3 dApp — an "Identity Guessing Game" on the ShareRing blockchain where users connect their Keplr wallet and guess numbers to win SHR tokens.

**Routing:** Two pages via React Router — `HomePage` (landing) and `GuessingGamePage` (game UI). `App.tsx` defines the routes.

**Blockchain layer** (`src/client.ts`): Configures a `SigningCosmWasmClient` connected to the ShareRing testnet RPC. Handles Keplr wallet detection, chain registration, and signer setup. The contract address is hardcoded here.

**Smart contract interactions** (`src/components/GuessingGamePage.tsx`): All game logic lives here. Queries (`get_game_state`, `get_guesses`) run on a 5-second polling interval. Execute messages (`guess`, `claim_prize`, `add_funds_to_pool`, `collect_unclaimed_pool`) are triggered by user actions. Guess fee is 15 SHR.

**RPC proxying:** The blockchain RPC (`https://rpc-testnet.shareri.ng`) cannot be called directly due to CORS.
- **Dev:** `src/setupProxy.js` proxies `/rpc` → RPC endpoint via `http-proxy-middleware`
- **Prod:** `api/proxy.js` is a Vercel serverless function that proxies `/api/proxy/*` → RPC endpoint with CORS headers

**Webpack polyfills** (`config-overrides.js`): Uses `react-app-rewired` + `customize-cra` to inject Node.js polyfills (`crypto-browserify`, `stream-browserify`, `buffer`) required by the CosmJS/ShareLedger SDK in the browser.

**UI:** Material-UI v5 with Emotion. Styling is a mix of MUI `sx` props and `App.css`.

## Key Files

| File | Purpose |
|------|---------|
| `src/client.ts` | Keplr wallet connection + CosmWasm client setup; chain config and contract address |
| `src/components/GuessingGamePage.tsx` | All game logic, contract calls, state polling |
| `src/setupProxy.js` | Dev-only RPC proxy |
| `api/proxy.js` | Vercel production RPC proxy |
| `config-overrides.js` | Webpack polyfill overrides |
| `vercel.json` | Vercel rewrite rules for `/api/proxy` |
