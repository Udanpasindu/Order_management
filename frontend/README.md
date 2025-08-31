# Furniture Store Frontend (Vite + React)

This frontend is wired to the Express backend via Axios. All data is loaded from the backend API — no dummy data is used.

## Environment

- Copy `.env.example` to `.env.local` and adjust if needed:

```
VITE_API_URL=http://localhost:5000/api
```

If `VITE_API_URL` is not set, the app falls back to `http(s)://<host>:5000/api`.

## Scripts

- Dev server: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`

## Backend CORS

Ensure the backend allows your frontend origin. Optionally set `FRONTEND_ORIGIN` on the backend (e.g. `http://localhost:5173`).
