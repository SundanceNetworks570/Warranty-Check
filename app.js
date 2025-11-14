// ===== CONFIG =====
const useMockData = false;
const BACKEND_BASE_URL = 'https://warranty-api-bxbw.onrender.com';; 
// When IT deploys the backend, change this to e.g.
// const BACKEND_BASE_URL = 'https://warranty.sundancenetworks.com';

// ===== MOCK DATA (for demo/testing if useMockData = true) =====
const mockWarrantyData = {
  Dell: {
    'ABC1234': {
      make: 'Dell',
      model: 'Latitude 7420',
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

document.addEventListener('DOMContentLoaded', () => {
  const devicesBody  = document.getElementById('devicesBody');
  const addRowBtn    = document.getElementById('addRowBtn');
  const lookupAllBtn = document.getElementById('lookupAllBtn');
  const errorMsg     = document.getElementById('errorMsg');
  const loadingMsg   = document.getElementById('loadingMsg');

  function setGlobalLoading(isLoading) {
    loadingMsg.style.display = isLoading ? 'block' : 'none';
    lookupAllBtn.disabled = isLoading;
    addRowBtn.disabled = isLoading;
  }

  function clearGlobalError() {
    errorMsg.textContent = '';
  }

  function createRow() {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>
        <select class="vendor-select">
          <option value="">Select…</option>
          <option value="Dell">Dell</option>
          <option value="HP">HP</option>
          <option value="Lenovo">Lenovo</option>
          <option value="Asus">Asus</option>
        </select>
        <div class="row-error"></div>
      </td>
      <td>
        <input type="text" class="id-input" placeholder="Service Tag / Serial">
      </td>
      <td>
        <span class="cell-text make-cell muted">—</span>
      </td>
      <td>
        <span class="cell-text model-cell muted">—</span>
      </td>
      <td>
        <span class="cell-text warranty-cell muted">—</span>
      </td>
      <td style="text-align:center;">
        <button type="button" class="remove-btn" title="Remove row">&times;</button>
      </td>
    `;

    const vendorSelect = tr.querySelector('.vendor-select');
    const idInput      = tr.querySelector('.id-input');
    const removeBtn    = tr.querySelector('.remove-btn');
    const rowError     = tr.querySelector('.row-error');

    function clearRowError() {
      rowError.textContent = '';
      tr.classList.remove('row-highlight-error');
    }

    vendorSelect.addEventListener('change', clearRowError);
    idInput.addEventListener('input', clearRowError);

    idInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        lookupRow(tr);
      }
    });

    removeBtn.addEventListener('click', () => {
      tr.remove();
    });

    devicesBody.appendChild(tr);
    return tr;
  }

  function validateRow(vendor, id) {
    if (!vendor && !id) {
      return { ok: false, message: '', skip: true }; // completely empty row
    }
    if (!vendor) {
      return { ok: false, message: 'Select a manufacturer.', skip: false };
    }
    if (!id) {
      return { ok: false, message: 'Enter a Service Tag / Serial.', skip: false };
    }
    if (!/^[A-Za-z0-9\-]{4,20}$/.test(id)) {
      return { ok: false, message: 'ID looks invalid (4–20 letters/numbers, dashes allowed).', skip: false };
    }
    return { ok: true, message: '', skip: false };
  }

  function clearRowResults(tr) {
    tr.querySelector('.make-cell').textContent = '—';
    tr.querySelector('.make-cell').classList.add('muted');
    tr.querySelector('.model-cell').textContent = '—';
    tr.querySelector('.model-cell').classList.add('muted');
    tr.querySelector('.warranty-cell').textContent = '—';
    tr.querySelector('.warranty-cell').classList.add('muted');
  }

  function updateRowResults(tr, data) {
    const makeCell     = tr.querySelector('.make-cell');
    const modelCell    = tr.querySelector('.model-cell');
    const warrantyCell = tr.querySelector('.warranty-cell');

    makeCell.textContent   = data.make || 'Unknown';
    modelCell.textContent  = data.model || 'Unknown';

    let warrantyText = 'Unknown';
    if (data.warrantyEnd && data.warrantyStatus) {
      warrantyText = `${data.warrantyEnd} (${data.warrantyStatus})`;
    } else if (data.warrantyEnd) {
      warrantyText = data.warrantyEnd;
    } else if (data.warrantyStatus) {
      warrantyText = data.warrantyStatus;
    }

    warrantyCell.textContent = warrantyText;

    makeCell.classList.remove('muted');
    modelCell.classList.remove('muted');
    warrantyCell.classList.remove('muted');
  }

  async function lookupRow(tr) {
    const vendorSelect = tr.querySelector('.vendor-select');
    const idInput      = tr.querySelector('.id-input');
    const rowError     = tr.querySelector('.row-error');

    const vendor = vendorSelect.value;
    const idRaw  = idInput.value.trim();
    const id     = idRaw.toUpperCase();

    clearGlobalError();
    rowError.textContent = '';
    tr.classList.remove('row-highlight-error');
    clearRowResults(tr);

    const validation = validateRow(vendor, id);
    if (validation.skip) return { skipped: true };
    if (!validation.ok) {
      rowError.textContent = validation.message;
      tr.classList.add('row-highlight-error');
      return { error: validation.message };
    }

    try {
      let data;

      if (useMockData) {
        const vendorData = mockWarrantyData[vendor] || {};
        data = vendorData[id];
        if (!data) {
          rowError.textContent =
            'No mock data for this ID (see app.js for sample IDs).';
          tr.classList.add('row-highlight-error');
          return { error: 'Not found (mock)' };
        }
      } else {
        const url = `${BACKEND_BASE_URL}/api/warranty?vendor=${encodeURIComponent(vendor)}&id=${encodeURIComponent(id)}`;
        const response = await fetch(url);

        if (!response.ok) {
          if (response.status === 404) {
            rowError.textContent = 'No warranty information found.';
            tr.classList.add('row-highlight-error');
            return { error: 'Not found' };
          }
          throw new Error('Backend error: ' + response.status);
        }
        data = await response.json();
      }

      if (!data) {
        rowError.textContent = 'No warranty information found.';
        tr.classList.add('row-highlight-error');
        return { error: 'Not found' };
      }

      updateRowResults(tr, data);
      return { ok: true };

    } catch (err) {
      console.error(err);
      rowError.textContent = 'Error during lookup.';
      tr.classList.add('row-highlight-error');
      return { error: 'Exception' };
    }
  }

  async function lookupAllRows() {
    clearGlobalError();
    setGlobalLoading(true);

    const rows = Array.from(devicesBody.querySelectorAll('tr'));
    let anySearched = false;
    let anyErrors   = false;

    for (const tr of rows) {
      const result = await lookupRow(tr);
      if (result && !result.skipped) {
        anySearched = true;
        if (result.error) {
          anyErrors = true;
        }
      }
    }

    if (!anySearched) {
      errorMsg.textContent = 'Nothing to look up. Add a row and enter some data.';
    } else if (anyErrors) {
      errorMsg.textContent = 'Some rows could not be looked up. Check row messages.';
    } else {
      errorMsg.textContent = '';
    }

    setGlobalLoading(false);
  }

  addRowBtn.addEventListener('click', () => {
    createRow();
  });

  lookupAllBtn.addEventListener('click', () => {
    lookupAllRows();
  });

  // Start with one empty row
  createRow();
});
