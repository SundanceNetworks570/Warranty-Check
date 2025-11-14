// Simple warranty API for your frontend grid.
// To run:
//   cd backend
//   npm install
//   npm start
//
// Then your frontend (app.js) calls http://localhost:3000/api/warranty

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// GET /api/warranty?vendor=Dell&id=ABC1234
app.get('/api/warranty', async (req, res) => {
  const { vendor, id } = req.query;

  if (!vendor || !id) {
    return res.status(400).json({ error: 'Missing vendor or id' });
  }

  try {
    let data;

    switch (vendor) {
      case 'Dell':
        data = await lookupDellWarranty(id);
        break;
      case 'HP':
        data = await lookupHpWarranty(id);
        break;
      case 'Lenovo':
        data = await lookupLenovoWarranty(id);
        break;
      case 'Asus':
        data = await lookupAsusWarranty(id);
        break;
      default:
        return res.status(400).json({ error: 'Unsupported vendor' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Warranty info not found' });
    }

    res.json(data);
  } catch (err) {
    console.error('Error in /api/warranty:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== PLACEHOLDER LOOKUPS =====
// Replace these with real OEM API calls or internal services.

async function lookupDellWarranty(serviceTag) {
  // TODO: call Dell API or your internal tool.
  console.log('lookupDellWarranty called with', serviceTag);
  return null;
}

async function lookupHpWarranty(serial) {
  console.log('lookupHpWarranty called with', serial);
  return null;
}

async function lookupLenovoWarranty(serial) {
  console.log('lookupLenovoWarranty called with', serial);
  return null;
}

async function lookupAsusWarranty(serial) {
  console.log('lookupAsusWarranty called with', serial);
  return null;
}

app.listen(PORT, () => {
  console.log(`Warranty API listening on port ${PORT}`);
});
