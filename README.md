# DryPro Dry Wall

Marketing site for DryPro Dry Wall — drywall, taping, mudding and Level 5 finish in Victoria, BC.

Static site. No build step.

## Local preview

```bash
npx serve .
```

Then open http://localhost:3000.

## Deploy

Connected to Vercel. Pushes to `main` deploy automatically.

## Structure

- `index.html` — single page
- `styles.css` — brand tokens + layout
- `script.js` — before/after slider, scroll reveals, form
- `assets/` — logo and hero photography
- `vercel.json` — caching + security headers
