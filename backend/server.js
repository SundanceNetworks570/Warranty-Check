// Simple warranty API for your frontend grid.
// To run locally:
//   cd backend
//   npm install
//   npm start
//
// On Render, this runs as a web service and your frontend (app.js)
// calls:  <YOUR_RENDER_URL>/api/warranty?vendor=...&id=...

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ------------------------------------------------------------------
// Sample data (FAKE but useful for testing)
// You can add more tags here any time.
//
// Try these from the UI:
//   Dell   + ABC1234
//   HP     + HP123456
//   Lenovo + LNV98765
//   Asus   + ASUS5555
// ------------------------------------------------------------------
const sampleWarrantyData = {
  Dell: {
    'ABC1234': {
      make: 'Dell',
      model: 'OptiPlex 7000',
      warrantyEnd: '2027-03-15',
      warrantyStatus: 'Active'
    }
  },
  HP: {
    'HP123456': {
      make: 'HP',
      model: 'EliteBook 840 G8',
      warrantyEnd: '2026-11-01',
      warrantyStatus: 'Active'
    }
  },
  Lenovo: {
    'LNV98765': {
      make: 'Lenovo',
      model: 'ThinkPad T14 Gen 3',
      warrantyEnd: '2025-09-30',
      warrantyStatus: 'Expiring Soon'
    }
  },
  Asus: {
    'ASUS5555': {
      make: 'Asus',
      model: 'ZenBook 14',
      warrantyEnd: '2028-01-10',
      warrantyStatus: 'Active'
    }
  }
};

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
    console.error('Error in /api/warranty:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== LOOKUP FUNCTIONS =====
// Right now these just read from sampleWarrantyData.
// Later, you can replace them with real OEM API calls.

async function lookupDellWarranty(serviceTag) {
  const id = serviceTag.toUpperCase().trim();
  console.log('lookupDellWarranty called with', id);

  const vendorData = sampleWarrantyData.Dell || {};
  return vendorData[id] || null;
}

async function lookupHpWarranty(serial) {
  const id = serial.toUpperCase().trim();
  console.log('lookupHpWarranty called with', id);

  const vendorData = sampleWarrantyData.HP || {};
  return vendorData[id] || null;
}

async function lookupLenovoWarranty(serial) {
  const id = serial.toUpperCase().trim();
  console.log('lookupLenovoWarranty called with', id);

  const vendorData = sampleWarrantyData.Lenovo || {};
  return vendorData[id] || null;
}

async function lookupAsusWarranty(serial) {
  const id = serial.toUpperCase().trim();
  console.log('lookupAsusWarranty called with', id);

  const vendorData = sampleWarrantyData.Asus || {};
  return vendorData[id] || null;
}

app.listen(PORT, () => {
  console.log(`Warranty API listening on port ${PORT}`);
});
