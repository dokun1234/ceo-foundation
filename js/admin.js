/**
 * C.E.O Foundation (Centre of Empowerment Organisation)
 * Visual Content Manager & Zero-Maintenance Admin Studio (js/admin.js)
 *
 * Capabilities:
 * - Add, edit, reorder, and remove Executive Leaders (with client-side photo compression)
 * - Upload, categorize, edit, reorder, and remove Outreach Gallery Photos
 * - Edit Core Empowerment Programs & Organisation / M-Pesa Settings
 * - Instant live browser preview across all 6 pages (via localStorage override)
 * - 1-Click GitHub Cloud Auto-Publish (commits new photos + updated js/data.js to GitHub -> Cloudflare Pages / Netlify)
 * - 1-Click Download / Local File Save of js/data.js
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'ceo_cms_override_v1';
  const GH_SETTINGS_KEY = 'ceo_cms_github_v1';
  const SESSION_UNLOCK_KEY = 'ceo_cms_unlocked';

  // Working copies of CONFIG and DATA
  const state = {
    config: JSON.parse(JSON.stringify(window.CEO_CONFIG || {})),
    data: JSON.parse(JSON.stringify(window.CEO_DATA || {})),
    unsaved: false,
    pendingUploads: {} // path -> base64 (without data:image/... prefix) for GitHub upload
  };

  /* --------------------------------------------------------------------------
     Toast & Dirty Status Helpers
  -------------------------------------------------------------------------- */
  let toastTimer = null;
  function showToast(msg, isError) {
    const toast = document.getElementById('admin-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.borderLeftColor = isError ? '#ef4444' : '#10b981';
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 4200);
  }

  function markChanged( autoSaveLocal = true ) {
    state.unsaved = true;
    const pill = document.getElementById('admin-status-pill');
    const text = document.getElementById('admin-status-text');
    if (pill && text) {
      pill.classList.add('unsaved');
      text.textContent = autoSaveLocal ? 'Saved to Browser Preview (Click Publish to Push Live)' : 'Unsaved Changes';
    }
    if (autoSaveLocal) {
      saveToBrowserPreview();
    }
    updateSummaryCounters();
  }

  function markSynced(label) {
    state.unsaved = false;
    const pill = document.getElementById('admin-status-pill');
    const text = document.getElementById('admin-status-text');
    if (pill && text) {
      pill.classList.remove('unsaved');
      text.textContent = label || 'All Changes Synced';
    }
    updateSummaryCounters();
  }

  function saveToBrowserPreview() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          config: state.config,
          data: state.data,
          updatedAt: new Date().toISOString()
        })
      );
      window.CEO_CONFIG = state.config;
      window.CEO_DATA = state.data;
    } catch (err) {
      console.warn('Local preview storage quota warning:', err);
      showToast('Note: Large photo stored in memory. Click Download data.js or Publish to save permanently.', false);
    }
  }

  function updateSummaryCounters() {
    const lCount = (state.data.leaders || []).length;
    const gCount = (state.data.gallery || []).length;
    const pCount = (state.data.programs || []).length;

    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(val);
    };

    setTxt('stat-leaders-count', lCount);
    setTxt('stat-gallery-count', gCount);
    setTxt('stat-programs-count', pCount);
    setTxt('tab-count-leaders', lCount);
    setTxt('tab-count-gallery', gCount);
    setTxt('tab-count-programs', pCount);

    const gh = getGhSettings();
    if (gh.repo && gh.token) {
      setTxt('stat-sync-mode', 'GitHub Cloud Live');
      setTxt('stat-sync-sub', `Connected to ${gh.repo} (${gh.branch || 'main'})`);
    } else {
      setTxt('stat-sync-mode', 'Browser Preview + File Export');
      setTxt('stat-sync-sub', 'Configure Tab 5 for 1-click Cloud Auto-Publish');
    }
  }

  /* --------------------------------------------------------------------------
     Passcode Lock Screen (SHA-256 Hashed & Synced via CEO_CONFIG.adminPassHash)
  -------------------------------------------------------------------------- */
  // Default SHA-256 hash for "ceo2026"
  const DEFAULT_PASS_HASH = '969492a3576186258380a0f988565d827298553b82d63557a4971c1b86095857';

  async function sha256Hex(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  function getGhSettings() {
    try {
      return JSON.parse(localStorage.getItem(GH_SETTINGS_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function saveGhSettings(settings) {
    localStorage.setItem(GH_SETTINGS_KEY, JSON.stringify(settings));
    updateSummaryCounters();
  }

  function initLockScreen() {
    const lock = document.getElementById('admin-lock');
    const form = document.getElementById('admin-unlock-form');
    const input = document.getElementById('admin-pin-input');
    const err = document.getElementById('admin-pin-error');
    if (!lock || !form) return;

    if (sessionStorage.getItem(SESSION_UNLOCK_KEY) === '1') {
      lock.classList.add('unlocked');
      return;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const gh = getGhSettings();
      const activeHash = state.config.adminPassHash || gh.passHash || DEFAULT_PASS_HASH;
      const entered = (input.value || '').trim();
      const enteredHash = await sha256Hex(entered);

      if (enteredHash === activeHash) {
        sessionStorage.setItem(SESSION_UNLOCK_KEY, '1');
        lock.classList.add('unlocked');
        if (err) err.style.display = 'none';
      } else {
        if (err) {
          err.textContent = 'Incorrect passcode. Please contact the C.E.O Foundation Executive Desk.';
          err.style.display = 'block';
        }
      }
    });
  }

  /* --------------------------------------------------------------------------
     Tab Switching & Modal Helpers
  -------------------------------------------------------------------------- */
  function initTabs() {
    const tabs = document.querySelectorAll('.admin-tab');
    const panels = document.querySelectorAll('.admin-panel');

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        tabs.forEach((t) => t.classList.toggle('active', t === tab));
        panels.forEach((p) => p.classList.toggle('active', p.id === `panel-${target}`));
      });
    });

    document.querySelectorAll('[data-close-modal]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const modal = document.getElementById(btn.dataset.closeModal);
        if (modal) modal.classList.remove('open');
      });
    });

    document.querySelectorAll('.admin-modal').forEach((modal) => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('open');
      });
    });
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('open');
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('open');
  }

  /* --------------------------------------------------------------------------
     Client-Side Image Compression (Resizes huge phone photos to clean JPEG)
  -------------------------------------------------------------------------- */
  function compressImageFile(file, maxWidth = 960, quality = 0.82) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Could not read image file'));
      reader.onload = (ev) => {
        const img = new Image();
        img.onerror = () => reject(new Error('Invalid image format'));
        img.onload = () => {
          let { width, height } = img;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function slugify(text) {
    return String(text || 'item')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48);
  }

  /* --------------------------------------------------------------------------
     1. EXECUTIVE LEADERS MANAGER
  -------------------------------------------------------------------------- */
  function renderLeadersAdmin() {
    const grid = document.getElementById('admin-leaders-grid');
    const searchInput = document.getElementById('leader-admin-search');
    if (!grid) return;

    const query = ((searchInput && searchInput.value) || '').trim().toLowerCase();
    const leaders = state.data.leaders || [];

    const filtered = leaders
      .map((leader, idx) => ({ leader, idx }))
      .filter(({ leader }) => {
        if (!query) return true;
        return (
          (leader.name || '').toLowerCase().includes(query) ||
          (leader.role || '').toLowerCase().includes(query) ||
          (leader.discipline || '').toLowerCase().includes(query)
        );
      });

    grid.innerHTML = filtered
      .map(
        ({ leader, idx }) => `
      <article class="admin-item-card">
        <div class="admin-leader-top">
          ${
            leader.photo
              ? `<img src="${leader.photo}" alt="${leader.name}" class="admin-leader-avatar" />`
              : `<div class="admin-leader-avatar" style="display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:1.15rem;">${leader.initials || leader.name.slice(0, 2).toUpperCase()}</div>`
          }
          <div class="admin-leader-meta">
            <span class="admin-leader-dept">${leader.shortRole || 'Executive Leader'}</span>
            <h3 class="admin-leader-name" title="${leader.name}">${idx + 1}. ${leader.name}</h3>
            <p class="admin-leader-role">${leader.discipline || leader.role}</p>
          </div>
        </div>
        <div class="admin-item-body">
          <p style="font-style: italic; color: var(--navy-800); margin-bottom: 6px;">&ldquo;${leader.quote}&rdquo;</p>
          <p style="font-size: 0.78rem; color: var(--text-500);">
            ${(leader.credentials || []).join(' • ')}
          </p>
        </div>
        <div class="admin-item-footer">
          <div class="admin-order-btns">
            <button type="button" class="admin-icon-btn" title="Move Up" data-leader-move="${idx}" data-dir="-1" ${idx === 0 ? 'disabled' : ''}>&uarr;</button>
            <button type="button" class="admin-icon-btn" title="Move Down" data-leader-move="${idx}" data-dir="1" ${idx === leaders.length - 1 ? 'disabled' : ''}>&darr;</button>
          </div>
          <div style="display: flex; gap: 6px;">
            <button type="button" class="admin-btn admin-btn--outline" style="padding: 6px 12px; font-size: 0.78rem;" data-leader-edit="${idx}">Edit</button>
            <button type="button" class="admin-btn admin-btn--danger" style="padding: 6px 12px; font-size: 0.78rem;" data-leader-delete="${idx}">Remove</button>
          </div>
        </div>
      </article>`
      )
      .join('');

    // Wire Move Up / Down
    grid.querySelectorAll('[data-leader-move]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.leaderMove);
        const dir = Number(btn.dataset.dir);
        const targetIdx = idx + dir;
        if (targetIdx < 0 || targetIdx >= leaders.length) return;
        const temp = leaders[idx];
        leaders[idx] = leaders[targetIdx];
        leaders[targetIdx] = temp;
        leaders.forEach((l, i) => {
          l.order = i + 1;
        });
        markChanged();
        renderLeadersAdmin();
        showToast(`Moved ${temp.name} to position #${targetIdx + 1}`);
      });
    });

    // Wire Edit
    grid.querySelectorAll('[data-leader-edit]').forEach((btn) => {
      btn.addEventListener('click', () => openLeaderEditor(Number(btn.dataset.leaderEdit)));
    });

    // Wire Delete
    grid.querySelectorAll('[data-leader-delete]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.leaderDelete);
        const leader = leaders[idx];
        if (!leader) return;
        if (confirm(`Remove "${leader.name}" (${leader.shortRole}) from the Executive Leadership directory?`)) {
          leaders.splice(idx, 1);
          leaders.forEach((l, i) => {
            l.order = i + 1;
          });
          markChanged();
          renderLeadersAdmin();
          showToast(`Removed ${leader.name} from Leadership Directory`);
        }
      });
    });
  }

  function openLeaderEditor(idx) {
    const isNew = idx === null || idx === undefined || idx < 0;
    const leader = isNew
      ? {
          id: '',
          specimen: String((state.data.leaders || []).length + 1).padStart(2, '0'),
          name: '',
          role: '',
          shortRole: '',
          discipline: '',
          credentials: ['Executive Leader', 'Mentor'],
          photo: '',
          poster: '',
          quote: '',
          about: [],
          responsibilities: [],
          strengths: [],
          legacy: ''
        }
      : state.data.leaders[idx];

    document.getElementById('modal-leader-title').textContent = isNew
      ? 'Add New Executive Leader'
      : `Edit Leader: ${leader.name}`;
    document.getElementById('leader-idx').value = isNew ? '-1' : String(idx);
    document.getElementById('leader-photo-preview').src = leader.photo || 'assets/images/logo-icon.png';
    document.getElementById('leader-photo-path').value = leader.photo || '';
    document.getElementById('leader-photo-file').value = '';
    document.getElementById('leader-name').value = leader.name || '';
    document.getElementById('leader-discipline').value = leader.discipline || '';
    document.getElementById('leader-role').value = leader.role || '';
    document.getElementById('leader-short-role').value = leader.shortRole || '';
    document.getElementById('leader-creds').value = (leader.credentials || []).join(', ');
    document.getElementById('leader-quote').value = leader.quote || '';
    document.getElementById('leader-bio').value = (leader.about || leader.bio || []).join('\n\n');
    document.getElementById('leader-resp').value = (leader.responsibilities || []).join('\n');
    document.getElementById('leader-strengths').value = (leader.strengths || []).join('\n');
    document.getElementById('leader-legacy').value = leader.legacy || '';

    openModal('modal-leader');
  }

  function initLeadersAdmin() {
    const searchInput = document.getElementById('leader-admin-search');
    if (searchInput) {
      searchInput.addEventListener('input', renderLeadersAdmin);
    }

    const addBtn = document.getElementById('btn-add-leader');
    if (addBtn) {
      addBtn.addEventListener('click', () => openLeaderEditor(-1));
    }

    const fileInput = document.getElementById('leader-photo-file');
    if (fileInput) {
      fileInput.addEventListener('change', async () => {
        const file = fileInput.files && fileInput.files[0];
        if (!file) return;
        try {
          const dataUrl = await compressImageFile(file, 820, 0.84);
          document.getElementById('leader-photo-preview').src = dataUrl;
          document.getElementById('leader-photo-path').value = dataUrl;
          showToast('Portrait photo optimized and ready!');
        } catch (err) {
          showToast(err.message, true);
        }
      });
    }

    const form = document.getElementById('form-leader');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const idx = Number(document.getElementById('leader-idx').value);
        const name = document.getElementById('leader-name').value.trim();
        const discipline = document.getElementById('leader-discipline').value.trim();
        const role = document.getElementById('leader-role').value.trim();
        const shortRole = document.getElementById('leader-short-role').value.trim();
        const credsRaw = document.getElementById('leader-creds').value;
        const quote = document.getElementById('leader-quote').value.trim();
        const bioRaw = document.getElementById('leader-bio').value;
        const respRaw = document.getElementById('leader-resp').value;
        const strengthsRaw = document.getElementById('leader-strengths').value;
        const legacy = document.getElementById('leader-legacy').value.trim();
        const photoVal = document.getElementById('leader-photo-path').value.trim();

        const credentials = credsRaw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

        const about = bioRaw
          .split(/\n+/)
          .map((s) => s.trim())
          .filter(Boolean);

        const responsibilities = respRaw
          .split(/\n+/)
          .map((s) => s.trim())
          .filter(Boolean);

        const strengths = strengthsRaw
          .split(/\n+/)
          .map((s) => s.trim())
          .filter(Boolean);

        const existing = idx >= 0 ? state.data.leaders[idx] : null;
        const id = (existing && existing.id) || slugify(name);
        const initials = name
          .split(/\s+/)
          .map((w) => w[0])
          .join('')
          .slice(0, 2)
          .toUpperCase();

        const updatedLeader = {
          ...(existing || {}),
          id,
          specimen: String(idx >= 0 ? idx + 1 : (state.data.leaders || []).length + 1).padStart(2, '0'),
          name,
          role,
          shortRole,
          discipline,
          initials,
          hasFullProfile: Boolean(photoVal),
          credentials: credentials.length ? credentials : ['Executive Leader'],
          photo: photoVal || undefined,
          poster: (existing && existing.poster) || (photoVal ? photoVal : undefined),
          quote,
          philosophy: (existing && existing.philosophy) || quote,
          about: about.length ? about : [quote],
          responsibilities: responsibilities.length
            ? responsibilities
            : ['Lead strategic initiatives and community outreach within C.E.O Foundation.'],
          strengths: strengths.length
            ? strengths
            : ['Leadership & teamwork', 'Community empowerment', 'Ethical stewardship'],
          legacy:
            legacy ||
            `${name} wants to be remembered as a compassionate leader who empowered communities through C.E.O Foundation.`
        };

        if (idx >= 0) {
          state.data.leaders[idx] = updatedLeader;
        } else {
          state.data.leaders.push(updatedLeader);
        }

        closeModal('modal-leader');
        markChanged();
        renderLeadersAdmin();
        showToast(idx >= 0 ? `Updated ${name}` : `Added ${name} to Executive Leadership!`);
      });
    }
  }

  /* --------------------------------------------------------------------------
     2. OUTREACH GALLERY MANAGER
  -------------------------------------------------------------------------- */
  function renderGalleryAdmin() {
    const grid = document.getElementById('admin-gallery-grid');
    const filterSel = document.getElementById('gallery-admin-filter');
    if (!grid) return;

    const activeCat = (filterSel && filterSel.value) || 'All';
    const gallery = state.data.gallery || [];

    const filtered = gallery
      .map((item, idx) => ({ item, idx }))
      .filter(({ item }) => activeCat === 'All' || item.category === activeCat);

    grid.innerHTML = filtered
      .map(
        ({ item, idx }) => `
      <article class="admin-item-card">
        <div class="admin-gallery-thumb">
          <img src="${item.src}" alt="${item.title}" loading="lazy" />
          <span class="admin-gallery-badge">${item.category}</span>
        </div>
        <div class="admin-item-body">
          <h3 style="font-size: 0.98rem; font-weight: 800; color: var(--navy-900); margin-bottom: 4px;">${item.title}</h3>
          <p style="font-size: 0.82rem; color: var(--text-600);">${item.caption}</p>
        </div>
        <div class="admin-item-footer">
          <div class="admin-order-btns">
            <button type="button" class="admin-icon-btn" title="Move Earlier" data-photo-move="${idx}" data-dir="-1" ${idx === 0 ? 'disabled' : ''}>&larr;</button>
            <button type="button" class="admin-icon-btn" title="Move Later" data-photo-move="${idx}" data-dir="1" ${idx === gallery.length - 1 ? 'disabled' : ''}>&rarr;</button>
          </div>
          <div style="display: flex; gap: 6px;">
            <button type="button" class="admin-btn admin-btn--outline" style="padding: 6px 12px; font-size: 0.78rem;" data-photo-edit="${idx}">Edit</button>
            <button type="button" class="admin-btn admin-btn--danger" style="padding: 6px 12px; font-size: 0.78rem;" data-photo-delete="${idx}">Delete</button>
          </div>
        </div>
      </article>`
      )
      .join('');

    grid.querySelectorAll('[data-photo-move]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.photoMove);
        const dir = Number(btn.dataset.dir);
        const target = idx + dir;
        if (target < 0 || target >= gallery.length) return;
        const tmp = gallery[idx];
        gallery[idx] = gallery[target];
        gallery[target] = tmp;
        markChanged();
        renderGalleryAdmin();
      });
    });

    grid.querySelectorAll('[data-photo-edit]').forEach((btn) => {
      btn.addEventListener('click', () => openPhotoEditor(Number(btn.dataset.photoEdit)));
    });

    grid.querySelectorAll('[data-photo-delete]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.photoDelete);
        const item = gallery[idx];
        if (!item) return;
        if (confirm(`Delete outreach photo "${item.title}" from the gallery?`)) {
          gallery.splice(idx, 1);
          markChanged();
          renderGalleryAdmin();
          showToast(`Deleted "${item.title}"`);
        }
      });
    });
  }

  function openPhotoEditor(idx) {
    const isNew = idx === null || idx === undefined || idx < 0;
    const item = isNew
      ? {
          id: '',
          src: '',
          category: "Children's Homes",
          title: '',
          caption: ''
        }
      : state.data.gallery[idx];

    document.getElementById('modal-photo-title').textContent = isNew
      ? 'Upload New Outreach Photo'
      : `Edit Outreach Photo: ${item.title}`;
    document.getElementById('photo-idx').value = isNew ? '-1' : String(idx);
    document.getElementById('photo-img-preview').src = item.src || 'assets/images/logo-icon.png';
    document.getElementById('photo-img-path').value = item.src || '';
    document.getElementById('photo-img-file').value = '';
    document.getElementById('photo-title').value = item.title || '';
    document.getElementById('photo-category').value = item.category || "Children's Homes";
    document.getElementById('photo-caption').value = item.caption || '';

    openModal('modal-photo');
  }

  function initGalleryAdmin() {
    const filterSel = document.getElementById('gallery-admin-filter');
    if (filterSel) filterSel.addEventListener('change', renderGalleryAdmin);

    const addBtn = document.getElementById('btn-add-photo');
    if (addBtn) addBtn.addEventListener('click', () => openPhotoEditor(-1));

    const fileInput = document.getElementById('photo-img-file');
    if (fileInput) {
      fileInput.addEventListener('change', async () => {
        const file = fileInput.files && fileInput.files[0];
        if (!file) return;
        try {
          const dataUrl = await compressImageFile(file, 1100, 0.82);
          document.getElementById('photo-img-preview').src = dataUrl;
          document.getElementById('photo-img-path').value = dataUrl;
          showToast('Outreach photo compressed and ready!');
        } catch (err) {
          showToast(err.message, true);
        }
      });
    }

    const form = document.getElementById('form-photo');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const idx = Number(document.getElementById('photo-idx').value);
        const src = document.getElementById('photo-img-path').value.trim();
        const title = document.getElementById('photo-title').value.trim();
        const category = document.getElementById('photo-category').value;
        const caption = document.getElementById('photo-caption').value.trim();

        const existing = idx >= 0 ? state.data.gallery[idx] : null;
        const badgeMap = {
          welfare: "Children's Welfare",
          feeding: 'Food Support',
          dignity: 'Essential Items',
          mentorship: 'Youth Mentorship'
        };
        const newItem = {
          ...(existing || {}),
          id: (existing && existing.id) || `gal-${Date.now().toString(36)}`,
          src,
          w: (existing && existing.w) || 1200,
          h: (existing && existing.h) || 800,
          category,
          badge: badgeMap[category] || 'Community Outreach',
          title,
          caption
        };

        if (idx >= 0) {
          state.data.gallery[idx] = newItem;
        } else {
          // Put newest uploaded photos first so they appear right at the top of the gallery!
          state.data.gallery.unshift(newItem);
        }

        closeModal('modal-photo');
        markChanged();
        renderGalleryAdmin();
        showToast(idx >= 0 ? `Updated "${title}"` : `Added "${title}" to Outreach Gallery!`);
      });
    }
  }

  /* --------------------------------------------------------------------------
     3. CORE PROGRAMS MANAGER
  -------------------------------------------------------------------------- */
  function renderProgramsAdmin() {
    const grid = document.getElementById('admin-programs-grid');
    if (!grid) return;
    const programs = state.data.programs || [];

    grid.innerHTML = programs
      .map(
        (prog, idx) => `
      <article class="admin-item-card">
        <div class="admin-gallery-thumb">
          <img src="${prog.image}" alt="${prog.title}" loading="lazy" />
          <span class="admin-gallery-badge">${prog.tag}</span>
        </div>
        <div class="admin-item-body">
          <h3 style="font-size: 1.02rem; font-weight: 800; color: var(--navy-900); margin-bottom: 6px;">${prog.title}</h3>
          <p style="font-size: 0.83rem; color: var(--text-600); margin-bottom: 10px;">${prog.description}</p>
          <ul style="font-size: 0.78rem; color: var(--navy-800); padding-left: 16px;">
            ${(prog.outcomes || []).map((o) => `<li>${o}</li>`).join('')}
          </ul>
        </div>
        <div class="admin-item-footer">
          <span style="font-size: 0.75rem; color: var(--text-500); font-weight: 700;">Program #${idx + 1}</span>
          <div style="display: flex; gap: 6px;">
            <button type="button" class="admin-btn admin-btn--outline" style="padding: 6px 12px; font-size: 0.78rem;" data-prog-edit="${idx}">Edit</button>
            <button type="button" class="admin-btn admin-btn--danger" style="padding: 6px 12px; font-size: 0.78rem;" data-prog-delete="${idx}">Delete</button>
          </div>
        </div>
      </article>`
      )
      .join('');

    grid.querySelectorAll('[data-prog-edit]').forEach((btn) => {
      btn.addEventListener('click', () => openProgramEditor(Number(btn.dataset.progEdit)));
    });

    grid.querySelectorAll('[data-prog-delete]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.progDelete);
        const prog = programs[idx];
        if (!prog) return;
        if (confirm(`Delete program "${prog.title}"?`)) {
          programs.splice(idx, 1);
          markChanged();
          renderProgramsAdmin();
          showToast(`Deleted program "${prog.title}"`);
        }
      });
    });
  }

  function openProgramEditor(idx) {
    const isNew = idx === null || idx === undefined || idx < 0;
    const prog = isNew
      ? {
          id: '',
          tag: 'Core Pillar',
          title: '',
          description: '',
          image: 'assets/images/outreach/mentorship-talk.jpg',
          outcomes: [],
          tierId: 'tier-outreach'
        }
      : state.data.programs[idx];

    document.getElementById('modal-program-title').textContent = isNew
      ? 'Add Core Program'
      : `Edit Program: ${prog.title}`;
    document.getElementById('program-idx').value = isNew ? '-1' : String(idx);
    document.getElementById('program-img-preview').src = prog.image || 'assets/images/logo-icon.png';
    document.getElementById('program-img-path').value = prog.image || '';
    document.getElementById('program-img-file').value = '';
    document.getElementById('program-title').value = prog.title || '';
    document.getElementById('program-tag').value = prog.tag || '';
    document.getElementById('program-desc').value = prog.description || '';
    document.getElementById('program-outcomes').value = (prog.outcomes || []).join('\n');

    openModal('modal-program');
  }

  function initProgramsAdmin() {
    const addBtn = document.getElementById('btn-add-program');
    if (addBtn) addBtn.addEventListener('click', () => openProgramEditor(-1));

    const fileInput = document.getElementById('program-img-file');
    if (fileInput) {
      fileInput.addEventListener('change', async () => {
        const file = fileInput.files && fileInput.files[0];
        if (!file) return;
        try {
          const dataUrl = await compressImageFile(file, 960, 0.82);
          document.getElementById('program-img-preview').src = dataUrl;
          document.getElementById('program-img-path').value = dataUrl;
          showToast('Program cover image optimized!');
        } catch (err) {
          showToast(err.message, true);
        }
      });
    }

    const form = document.getElementById('form-program');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const idx = Number(document.getElementById('program-idx').value);
        const image = document.getElementById('program-img-path').value.trim();
        const title = document.getElementById('program-title').value.trim();
        const tag = document.getElementById('program-tag').value.trim();
        const description = document.getElementById('program-desc').value.trim();
        const outcomes = document
          .getElementById('program-outcomes')
          .value.split(/\n+/)
          .map((s) => s.trim())
          .filter(Boolean);

        const existing = idx >= 0 ? state.data.programs[idx] : null;
        const updated = {
          id: (existing && existing.id) || slugify(title),
          tag,
          title,
          description,
          image,
          outcomes,
          tierId: (existing && existing.tierId) || 'tier-outreach'
        };

        if (idx >= 0) {
          state.data.programs[idx] = updated;
        } else {
          state.data.programs.push(updated);
        }

        closeModal('modal-program');
        markChanged();
        renderProgramsAdmin();
        showToast(`Saved program "${title}"`);
      });
    }
  }

  /* --------------------------------------------------------------------------
     4. ORGANISATION SETTINGS & CLOUD SYNC FORMS
  -------------------------------------------------------------------------- */
  function initSettingsAndCloudForms() {
    const cfg = state.config;
    const setVal = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.value = v || '';
    };

    setVal('cfg-name', cfg.name);
    setVal('cfg-legal', cfg.legalName);
    setVal('cfg-motto', cfg.motto);
    setVal('cfg-tagline', cfg.tagline);
    setVal('cfg-phone-display', cfg.phoneDisplay);
    setVal('cfg-phone-raw', cfg.phoneRaw);
    setVal('cfg-email', cfg.email);
    setVal('cfg-mpesa', cfg.mpesaPaybill);
    setVal('cfg-google-form', cfg.googleFormUrl);

    const settingsForm = document.getElementById('admin-settings-form');
    if (settingsForm) {
      settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        state.config.name = document.getElementById('cfg-name').value.trim();
        state.config.legalName = document.getElementById('cfg-legal').value.trim();
        state.config.motto = document.getElementById('cfg-motto').value.trim();
        state.config.tagline = document.getElementById('cfg-tagline').value.trim();
        state.config.phoneDisplay = document.getElementById('cfg-phone-display').value.trim();
        state.config.phoneRaw = document.getElementById('cfg-phone-raw').value.trim().replace(/[^0-9]/g, '');
        state.config.email = document.getElementById('cfg-email').value.trim();
        state.config.mpesaPaybill = document.getElementById('cfg-mpesa').value.trim();
        state.config.googleFormUrl = document.getElementById('cfg-google-form').value.trim();

        markChanged();
        showToast('Organisation contacts & M-Pesa settings saved!');
      });
    }

    // Cloud Sync Form
    const gh = getGhSettings();
    setVal('gh-repo', gh.repo || 'dokun1234/ceo-foundation');
    setVal('gh-branch', gh.branch || 'main');
    setVal('gh-token', gh.token || '');
    setVal('cfg-admin-pin', '');

    const ghForm = document.getElementById('admin-github-form');
    if (ghForm) {
      ghForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPin = document.getElementById('cfg-admin-pin').value.trim();
        let passHash = state.config.adminPassHash || gh.passHash || DEFAULT_PASS_HASH;

        if (newPin) {
          passHash = await sha256Hex(newPin);
          state.config.adminPassHash = passHash;
          document.getElementById('cfg-admin-pin').value = '';
          markChanged();
        }

        saveGhSettings({
          repo: document.getElementById('gh-repo').value.trim(),
          branch: document.getElementById('gh-branch').value.trim() || 'main',
          token: document.getElementById('gh-token').value.trim(),
          passHash
        });

        showToast(
          newPin
            ? 'New passcode encrypted (SHA-256) & saved! Click "Save & Publish Changes" at the top to apply it across all devices.'
            : 'Cloud Auto-Publish settings saved!'
        );
      });
    }

    const resetBtn = document.getElementById('btn-reset-defaults');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset all local browser edits back to the original C.E.O Foundation factory data?')) {
          localStorage.removeItem(STORAGE_KEY);
          state.config = JSON.parse(JSON.stringify(window.CEO_DEFAULT_CONFIG || window.CEO_CONFIG));
          state.data = JSON.parse(JSON.stringify(window.CEO_DEFAULT_DATA || window.CEO_DATA));
          window.CEO_CONFIG = state.config;
          window.CEO_DATA = state.data;
          renderLeadersAdmin();
          renderGalleryAdmin();
          renderProgramsAdmin();
          initSettingsAndCloudForms();
          markSynced('Reset to Factory Defaults');
          showToast('Restored factory default leaders, photos, and settings.');
        }
      });
    }
  }

  /* --------------------------------------------------------------------------
     5. GENERATE js/data.js CONTENT & 1-CLICK PUBLISH (GITHUB OR FILE DOWNLOAD)
  -------------------------------------------------------------------------- */
  function buildDataJsSource(configObj, dataObj) {
    return `/**
 * C.E.O Foundation (Centre of Empowerment Organisation)
 * Central Configuration & Content Data Store
 * Updated via C.E.O Foundation Admin Studio (${new Date().toISOString()})
 */

window.CEO_CONFIG = ${JSON.stringify(configObj, null, 2)};

window.CEO_DATA = ${JSON.stringify(dataObj, null, 2)};

window.CEO_DEFAULT_CONFIG = JSON.parse(JSON.stringify(window.CEO_CONFIG));
window.CEO_DEFAULT_DATA = JSON.parse(JSON.stringify(window.CEO_DATA));

(function applyCmsOverrides() {
  try {
    const raw = localStorage.getItem("ceo_cms_override_v1");
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      if (parsed.config && typeof parsed.config === "object") {
        Object.assign(window.CEO_CONFIG, parsed.config);
      }
      if (parsed.data && typeof parsed.data === "object") {
        Object.assign(window.CEO_DATA, parsed.data);
      }
    }
  } catch (err) {
    console.warn("Could not load local CMS preview override:", err);
  }
})();
`;
  }

  function downloadDataJsFile() {
    const content = buildDataJsSource(state.config, state.data);
    const blob = new Blob([content], { type: 'application/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.js';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('Downloaded updated data.js! Replace js/data.js in your project folder.');
  }

  async function githubPutFile(repo, branch, token, filePath, base64Content, commitMessage) {
    const apiUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`;
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json'
    };

    // Check if file already exists to get its SHA
    let sha = undefined;
    const getRes = await fetch(`${apiUrl}?ref=${encodeURIComponent(branch)}`, { headers });
    if (getRes.ok) {
      const existing = await getRes.json();
      sha = existing.sha;
    }

    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: commitMessage,
        content: base64Content,
        branch,
        ...(sha ? { sha } : {})
      })
    });

    if (!putRes.ok) {
      const errText = await putRes.text();
      throw new Error(`GitHub API error (${putRes.status}): ${errText}`);
    }
    return putRes.json();
  }

  function utf8ToBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }

  async function publishChanges() {
    saveToBrowserPreview();
    const gh = getGhSettings();

    // If GitHub Cloud Sync is configured, push new images + js/data.js directly to GitHub!
    if (gh.repo && gh.token) {
      const btn = document.getElementById('btn-publish-changes');
      const origText = btn ? btn.textContent : '';
      try {
        if (btn) {
          btn.disabled = true;
          btn.textContent = 'Publishing to Live Cloud...';
        }

        const branch = gh.branch || 'main';

        // Upload any embedded base64 leader photos as clean files in assets/images/leaders/
        for (const leader of state.data.leaders || []) {
          if (leader.photo && leader.photo.startsWith('data:image/')) {
            const base64Data = leader.photo.split(',')[1];
            const fileName = `${slugify(leader.name)}-${Date.now().toString(36)}.jpg`;
            const repoPath = `assets/images/leaders/${fileName}`;
            await githubPutFile(
              gh.repo,
              branch,
              gh.token,
              repoPath,
              base64Data,
              `Upload portrait photo for ${leader.name}`
            );
            leader.photo = repoPath;
            leader.poster = repoPath;
          }
        }

        // Upload any embedded base64 gallery photos as clean files in assets/images/outreach/
        for (const item of state.data.gallery || []) {
          if (item.src && item.src.startsWith('data:image/')) {
            const base64Data = item.src.split(',')[1];
            const fileName = `${slugify(item.title)}-${Date.now().toString(36)}.jpg`;
            const repoPath = `assets/images/outreach/${fileName}`;
            await githubPutFile(
              gh.repo,
              branch,
              gh.token,
              repoPath,
              base64Data,
              `Upload outreach photo: ${item.title}`
            );
            item.src = repoPath;
          }
        }

        // Now commit the updated js/data.js
        const sourceCode = buildDataJsSource(state.config, state.data);
        await githubPutFile(
          gh.repo,
          branch,
          gh.token,
          'js/data.js',
          utf8ToBase64(sourceCode),
          'Update website content via C.E.O Foundation Admin Studio'
        );

        saveToBrowserPreview();
        renderLeadersAdmin();
        renderGalleryAdmin();
        markSynced('Published Live to GitHub Cloud');
        showToast('Published to GitHub! Cloudflare Pages / Netlify will update your live website in ~20 seconds.');
      } catch (err) {
        console.error(err);
        showToast(`Cloud publish failed: ${err.message}`, true);
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = origText;
        }
      }
      return;
    }

    // Otherwise, save immediately to live browser preview and offer 1-click file save if supported
    markSynced('Saved to Live Browser Preview');
    showToast('Saved! Open any website page to see your updates live, or configure Tab 5 for GitHub Cloud Auto-Publish.');
  }

  /* --------------------------------------------------------------------------
     Initialize Admin Dashboard
  -------------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initLockScreen();
    initTabs();
    initLeadersAdmin();
    initGalleryAdmin();
    initProgramsAdmin();
    initSettingsAndCloudForms();

    renderLeadersAdmin();
    renderGalleryAdmin();
    renderProgramsAdmin();
    updateSummaryCounters();

    const exportBtn = document.getElementById('btn-export-data');
    if (exportBtn) exportBtn.addEventListener('click', downloadDataJsFile);

    const publishBtn = document.getElementById('btn-publish-changes');
    if (publishBtn) publishBtn.addEventListener('click', publishChanges);
  });
})();
