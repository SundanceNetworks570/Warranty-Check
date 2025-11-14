# Computer Warranty Grid

Multi-vendor warranty lookup UI for Dell, HP, Lenovo, and Asus.

## What this repo contains

- `index.html` – Frontend page (works on GitHub Pages)
- `style.css` – Styling
- `app.js` – Frontend logic (grid, row add/remove, calls backend API)
- `backend/` – Node.js/Express API skeleton for real warranty lookups

## Frontend (GitHub Pages)

1. Push this repo to GitHub.
2. In the repo, go to **Settings → Pages**.
3. Under **Source**, choose **Deploy from a branch**, select `main` and `/ (root)`.
4. GitHub will give you a URL like:

   `https://<your-username>.github.io/<repo-name>/`

That URL serves `index.html` as a standalone page.

## Backend (Node.js)

From the `backend` folder:

```bash
cd backend
npm install
npm start
```

This starts a local API on `http://localhost:3000`.

### API spec

`GET /api/warranty?vendor=<Dell|HP|Lenovo|Asus>&id=<string>`

Returns JSON:

```json
{
  "make": "Dell",
  "model": "Latitude 7420",
  "warrantyEnd": "2027-03-15",
  "warrantyStatus": "Active"
}
```

IT/devs should:

- Implement `lookupDellWarranty`, `lookupHpWarranty`, `lookupLenovoWarranty`, `lookupAsusWarranty`
  in `backend/server.js` by calling OEM APIs or internal tools.
- Deploy this backend to a public URL, e.g. `https://warranty.sundancenetworks.com`.

Then, update `BACKEND_BASE_URL` in `app.js`:

```js
const BACKEND_BASE_URL = 'https://warranty.sundancenetworks.com';
```

And flip `useMockData` to `false` (already set by default).

## Using the grid

- Click **Add Device** to add rows.
- Choose Manufacturer.
- Paste in Service Tag / Serial.
- Press **Enter** in the Service Tag cell to lookup that row, or click **Lookup All** to process all rows.

Errors per-row show in red under the manufacturer selection.
