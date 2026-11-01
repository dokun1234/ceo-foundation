/**
 * C.E.O Foundation (Centre of Empowerment Organisation)
 * Unified 6-Page Interactive Application Logic + Surgical Home ScrollCraft Sync
 * Zero-dependency, fast-loading ES6 module for Kenyan & Global UX
 */

(function () {
  'use strict';

  const CONFIG = window.CEO_CONFIG;
  const DATA = window.CEO_DATA;

  const ICONS = {
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    'check-circle': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    sparkles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>',
    'heart-handshake': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    arrowRight: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
    zoom: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>'
  };

  /* --------------------------------------------------------------------------
     Toast Notification & Shared Lightbox Helper
  -------------------------------------------------------------------------- */
  let toastTimeout = null;
  function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  function openSharedLightbox({ src, title, caption }) {
    const lightbox = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxCaption = document.getElementById('lightbox-caption');
    if (!lightbox || !lightboxImg) return;

    lightboxImg.src = src;
    lightboxImg.alt = title || 'C.E.O Foundation image';
    if (lightboxTitle) lightboxTitle.textContent = title || '';
    if (lightboxCaption) lightboxCaption.textContent = caption || '';
    lightbox.classList.add('open');
    document.body.classList.add('modal-open');
  }

  function initLightboxChrome() {
    const lightbox = document.getElementById('lightbox-modal');
    const lightboxClose = document.getElementById('lightbox-close');
    if (!lightbox) return;

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.classList.remove('modal-open');
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    const backdrop = lightbox.querySelector('.modal__backdrop');
    if (backdrop) backdrop.addEventListener('click', closeLightbox);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('open')) {
        closeLightbox();
      }
    });
  }

  /* --------------------------------------------------------------------------
     Multi-Page Navbar Scroll, Active Page Highlight & Mobile Drawer
  -------------------------------------------------------------------------- */
  function initNavigation() {
    const navbar = document.getElementById('navbar');
    const drawer = document.getElementById('mobile-drawer');
    const openBtn = document.getElementById('mobile-menu-open');
    const closeBtn = document.getElementById('mobile-menu-close');
    const backdrop = drawer ? drawer.querySelector('.mobile-drawer__backdrop') : null;
    const mobileLinks = drawer ? drawer.querySelectorAll('a') : [];

    if (navbar) {
      function onScroll() {
        if (window.scrollY > 24) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    function closeDrawer() {
      if (!drawer) return;
      drawer.classList.remove('open');
      document.body.classList.remove('modal-open');
      if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
    }

    function openDrawer() {
      if (!drawer) return;
      drawer.classList.add('open');
      document.body.classList.add('modal-open');
      if (openBtn) openBtn.setAttribute('aria-expanded', 'true');
    }

    if (openBtn) openBtn.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (backdrop) backdrop.addEventListener('click', closeDrawer);
    mobileLinks.forEach((link) => link.addEventListener('click', closeDrawer));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) {
        closeDrawer();
      }
    });

    // Multi-page active pathname highlight
    const rawFile = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const currentFile = rawFile === '' ? 'index.html' : rawFile;

    document.querySelectorAll('.nav-link, .mobile-drawer__link').forEach((link) => {
      const href = (link.getAttribute('href') || '').split('#')[0].split('?')[0].toLowerCase();
      const targetFile = href === '' || href === './' ? 'index.html' : href;
      const isMatch = targetFile === currentFile;
      link.classList.toggle('active', isMatch);
      if (isMatch) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  /* --------------------------------------------------------------------------
     Render Core Values, Approach, Programs, Focus Pills & Pathways
  -------------------------------------------------------------------------- */
  function renderProgramCard(prog, showSupportLink) {
    return `
      <article class="program-card reveal" id="${prog.id}">
        <div class="program-card__media">
          <img src="${prog.image}" alt="${prog.title}" loading="lazy" decoding="async" />
          <span class="program-card__tag">${prog.tag}</span>
        </div>
        <div class="program-card__body">
          <h3 class="program-card__title">${prog.title}</h3>
          <p class="program-card__desc">${prog.description}</p>
          <ul class="program-card__outcomes">
            ${prog.outcomes.map((o) => `<li>${ICONS.check}<span>${o}</span></li>`).join('')}
          </ul>
          ${
            showSupportLink
              ? `<a href="donate.html?tier=${encodeURIComponent(prog.tierId)}" class="program-card__action">
                   <span>Support This Program</span>
                   ${ICONS.arrowRight}
                 </a>`
              : `<a href="programs.html#${encodeURIComponent(prog.id)}" class="program-card__action">
                   <span>Explore Program Details</span>
                   ${ICONS.arrowRight}
                 </a>`
          }
        </div>
      </article>`;
  }

  function renderStaticCollections() {
    // 1. 7 Core Values (About page)
    const valuesGrid = document.getElementById('values-grid');
    if (valuesGrid) {
      valuesGrid.innerHTML = DATA.values
        .map(
          (val) => `
        <article class="value-card reveal" id="value-${val.id}">
          <div class="value-card__top">
            <div class="value-card__icon">${ICONS[val.icon] || ICONS.heart}</div>
            <h4 class="value-card__title">${val.title}</h4>
          </div>
          <p class="value-card__desc">${val.description}</p>
        </article>`
        )
        .join('');
    }

    // 2. Fallback static 4-Stage Approach grid (if rendered outside pinned home stage)
    const approachGrid = document.getElementById('approach-grid');
    if (approachGrid) {
      approachGrid.innerHTML = DATA.approach
        .map(
          (item, index) => `
        <article class="approach-card approach-card--${item.accent || 'navy'} reveal">
          <div>
            <div class="approach-card__step">
              <span class="approach-card__num">STEP ${item.step}</span>
              ${index < DATA.approach.length - 1 ? `<span class="approach-card__arrow" aria-hidden="true">${ICONS.arrowRight}</span>` : ''}
            </div>
            <h3 class="approach-card__stage">${item.stage}</h3>
            <p class="approach-card__sub">${item.subtitle}</p>
            <p class="approach-card__desc">${item.description}</p>
          </div>
          <ul class="approach-card__list">
            ${item.highlights.map((h) => `<li>${h}</li>`).join('')}
          </ul>
        </article>`
        )
        .join('');
    }

    // 3. 10 Areas of Focus Pills (Programs page)
    const focusContainer = document.getElementById('focus-pills');
    if (focusContainer) {
      focusContainer.innerHTML = DATA.focusAreas
        .map((area) => `<span class="focus-pill">${area}</span>`)
        .join('');
    }

    // 4a. Featured 3 Programs Preview (Home page)
    const homeProgramsGrid = document.getElementById('home-programs-grid');
    if (homeProgramsGrid) {
      const featuredIds = ['youth-mentorship', 'childrens-welfare', 'community-outreach'];
      const featured = featuredIds
        .map((id) => DATA.programs.find((p) => p.id === id))
        .filter(Boolean);
      homeProgramsGrid.innerHTML = featured.map((p) => renderProgramCard(p, false)).join('');
    }

    // 4b. All 6 Core Programs Showcase (Programs page)
    const programsGrid = document.getElementById('programs-grid');
    if (programsGrid) {
      programsGrid.innerHTML = DATA.programs.map((p) => renderProgramCard(p, true)).join('');
    }

    // 5. Home Featured 3 Executive Leaders Preview
    const homeLeadersGrid = document.getElementById('home-leaders-grid');
    if (homeLeadersGrid) {
      homeLeadersGrid.innerHTML = DATA.leaders
        .slice(0, 3)
        .map(
          (leader) => `
        <a href="leadership.html?leader=${encodeURIComponent(leader.id)}" class="leader-card reveal" aria-label="Read full leadership profile of ${leader.name}">
          <div class="leader-card__portrait">
            <img src="${leader.photo}" alt="${leader.name} - ${leader.role}" loading="lazy" decoding="async" />
            <div class="leader-card__role-pill">
              <span class="leader-card__role-badge">${leader.shortRole}</span>
            </div>
          </div>
          <div class="leader-card__body">
            <h3 class="leader-card__name">${leader.name}</h3>
            <div class="leader-card__tags">
              ${leader.credentials
                .slice(0, 3)
                .map((c) => `<span class="leader-card__tag">${c}</span>`)
                .join('')}
            </div>
            <p class="leader-card__quote">&ldquo;${leader.quote}&rdquo;</p>
            <span class="leader-card__btn">
              <span>Read Full Profile</span>
              ${ICONS.arrowRight}
            </span>
          </div>
        </a>`
        )
        .join('');
    }

    // 6. Membership 4 Participation Pathways, 10 Benefits & 10 Expectations
    const pathwaysGrid = document.getElementById('pathways-grid');
    if (pathwaysGrid && DATA.pathways) {
      pathwaysGrid.innerHTML = DATA.pathways
        .map(
          (pw, idx) => `
        <article class="pathway-card reveal">
          <div>
            <span class="pathway-card__num">0${idx + 1}</span>
            <h3 class="pathway-card__title">${pw.title}</h3>
            <p class="pathway-card__desc">${pw.summary}</p>
          </div>
          <button type="button" class="pathway-card__btn" data-select-pathway="${pw.value}">
            <span>Apply for This Pathway</span>
            ${ICONS.arrowRight}
          </button>
        </article>`
        )
        .join('');

      pathwaysGrid.querySelectorAll('[data-select-pathway]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const select = document.getElementById('mem-pathway');
          const formCard = document.getElementById('membership-form');
          const nameInput = document.getElementById('mem-name');
          if (select) select.value = btn.dataset.selectPathway;
          if (formCard) {
            formCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
              if (nameInput) nameInput.focus({ preventScroll: true });
            }, 420);
          }
        });
      });
    }

    const benefitsGrid = document.getElementById('benefits-grid');
    if (benefitsGrid) {
      benefitsGrid.innerHTML = DATA.membershipBenefits
        .map(
          (b) => `
        <div class="benefit-item">
          <span class="benefit-item__dot" aria-hidden="true"></span>
          <span>${b}</span>
        </div>`
        )
        .join('');
    }

    const expectationsList = document.getElementById('expectations-list');
    if (expectationsList) {
      expectationsList.innerHTML = DATA.memberExpectations
        .map(
          (exp, idx) => `
        <li>
          <span class="expectations-num">${idx + 1}</span>
          <span>${exp}</span>
        </li>`
        )
        .join('');
    }

    const expBox = document.getElementById('expectations-box');
    const expToggle = document.getElementById('expectations-toggle');
    if (expBox && expToggle) {
      expToggle.addEventListener('click', () => {
        const isOpen = expBox.classList.toggle('open');
        expToggle.setAttribute('aria-expanded', String(isOpen));
      });
    }
  }

  /* --------------------------------------------------------------------------
     Outreach Documentary Gallery & Lightbox (Programs Page)
  -------------------------------------------------------------------------- */
  function initGallery() {
    const galleryGrid = document.getElementById('gallery-grid');
    const filterButtons = document.querySelectorAll('[data-gallery-filter]');
    if (!galleryGrid) return;

    function renderGallery(category = 'all') {
      const items =
        category === 'all'
          ? DATA.gallery
          : DATA.gallery.filter((item) => item.category === category);

      galleryGrid.innerHTML = items
        .map(
          (item, index) => `
        <figure class="gallery-item ${category === 'all' && item.featured && index === 0 ? 'gallery-item--featured' : ''}" data-gallery-id="${item.id}" tabindex="0" role="button" aria-label="View full photo: ${item.title}">
          <img src="${item.src}" alt="${item.title}" loading="lazy" decoding="async" />
          <span class="gallery-item__zoom" aria-hidden="true">${ICONS.zoom}</span>
          <figcaption class="gallery-item__overlay">
            <span class="gallery-item__badge">${item.badge}</span>
            <h3 class="gallery-item__title">${item.title}</h3>
            <p class="gallery-item__caption">${item.caption}</p>
          </figcaption>
        </figure>`
        )
        .join('');

      galleryGrid.querySelectorAll('.gallery-item').forEach((card) => {
        const openItem = () => {
          const item = DATA.gallery.find((g) => g.id === card.dataset.galleryId);
          if (!item) return;
          openSharedLightbox({
            src: item.src,
            title: item.title,
            caption: item.caption
          });
        };
        card.addEventListener('click', openItem);
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openItem();
          }
        });
      });
    }

    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        renderGallery(btn.dataset.galleryFilter);
      });
    });

    const params = new URLSearchParams(window.location.search);
    const initialCat = params.get('category');
    if (initialCat && ['all', 'welfare', 'feeding', 'dignity', 'mentorship'].includes(initialCat)) {
      filterButtons.forEach((b) => b.classList.toggle('active', b.dataset.galleryFilter === initialCat));
      renderGallery(initialCat);
    } else {
      renderGallery('all');
    }
  }

  /* --------------------------------------------------------------------------
     Leadership Showcase, Deep-Dive Profile Modal & Official Posters Grid
  -------------------------------------------------------------------------- */
  function initLeadership() {
    const leadersGrid = document.getElementById('leaders-grid');
    const postersGrid = document.getElementById('posters-grid');
    const modal = document.getElementById('leader-modal');

    if (postersGrid) {
      const posterLeaders = DATA.leaders.filter((l) => l.poster);
      postersGrid.innerHTML = posterLeaders
        .map(
          (leader) => `
        <article class="poster-card reveal" data-poster-src="${leader.poster}" data-poster-name="${leader.name}" data-poster-role="${leader.role}" tabindex="0" role="button" aria-label="View official leadership poster for ${leader.name}">
          <div class="poster-card__media">
            <img src="${leader.poster}" alt="${leader.name} official C.E.O Foundation poster" loading="lazy" decoding="async" />
          </div>
          <div class="poster-card__bar">
            <div>
              <h3 class="poster-card__name">${leader.name}</h3>
              <span class="poster-card__role">${leader.shortRole}</span>
            </div>
            <span aria-hidden="true">${ICONS.zoom}</span>
          </div>
        </article>`
        )
        .join('');

      postersGrid.querySelectorAll('.poster-card').forEach((card) => {
        const openPoster = () => {
          openSharedLightbox({
            src: card.dataset.posterSrc,
            title: `${card.dataset.posterName} - ${card.dataset.posterRole}`,
            caption: 'Official C.E.O Foundation Executive Leadership Portfolio Poster'
          });
        };
        card.addEventListener('click', openPoster);
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openPoster();
          }
        });
      });
    }

    if (!modal) return;

    let currentIndex = 0;

    if (leadersGrid) {
      leadersGrid.innerHTML = DATA.leaders
        .map(
          (leader, index) => `
        <article class="leader-card reveal" id="leader-${leader.id}" data-leader-index="${index}" tabindex="0" role="button" aria-label="Read full leadership profile of ${leader.name}">
          <div class="leader-card__portrait">
            ${
              leader.photo
                ? `<img src="${leader.photo}" alt="${leader.name} - ${leader.role}" loading="lazy" decoding="async" />`
                : `<div class="leader-card__monogram">
                     <div class="leader-card__monogram-circle">${leader.initials}</div>
                     <img class="leader-card__monogram-logo" src="assets/images/logo-icon.png" alt="" aria-hidden="true" />
                   </div>`
            }
            <div class="leader-card__role-pill">
              <span class="leader-card__role-badge">${leader.shortRole}</span>
            </div>
          </div>
          <div class="leader-card__body">
            <h3 class="leader-card__name">${leader.name}</h3>
            <div class="leader-card__tags">
              ${leader.credentials
                .slice(0, 3)
                .map((c) => `<span class="leader-card__tag">${c}</span>`)
                .join('')}
            </div>
            <p class="leader-card__quote">&ldquo;${leader.quote}&rdquo;</p>
            <span class="leader-card__btn">
              <span>View Leadership Profile</span>
              ${ICONS.arrowRight}
            </span>
          </div>
        </article>`
        )
        .join('');
    }

    const photoSlot = document.getElementById('modal-leader-photo-slot');
    const nameEl = document.getElementById('modal-leader-name');
    const roleEl = document.getElementById('modal-leader-role');
    const quoteEl = document.getElementById('modal-leader-quote');
    const credsEl = document.getElementById('modal-leader-creds');
    const aboutEl = document.getElementById('modal-leader-about');
    const respEl = document.getElementById('modal-leader-responsibilities');
    const strengthsEl = document.getElementById('modal-leader-strengths');
    const legacyEl = document.getElementById('modal-leader-legacy');
    const posterBtn = document.getElementById('modal-leader-poster-btn');
    const prevBtn = document.getElementById('leader-prev-btn');
    const nextBtn = document.getElementById('leader-next-btn');
    const closeBtn = document.getElementById('leader-modal-close');

    const dialogEl = modal.querySelector('.leader-modal__dialog');
    const mainEl = modal.querySelector('.leader-modal__main');
    const sidebarEl = modal.querySelector('.leader-modal__sidebar');

    function resetModalScroll(smooth = false) {
      [dialogEl, mainEl, sidebarEl].forEach((el) => {
        if (!el) return;
        if (smooth && typeof el.scrollTo === 'function') {
          el.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          el.scrollTop = 0;
        }
      });
    }

    function populateModal(index, smoothScrollTop = false) {
      currentIndex = (index + DATA.leaders.length) % DATA.leaders.length;
      const leader = DATA.leaders[currentIndex];

      if (leader.photo) {
        photoSlot.innerHTML = `<img src="${leader.photo}" alt="${leader.name}" />`;
      } else {
        photoSlot.innerHTML = `
          <div class="leader-card__monogram">
            <div class="leader-card__monogram-circle">${leader.initials}</div>
          </div>`;
      }

      nameEl.textContent = leader.aka ? `${leader.name} (${leader.aka})` : leader.name;
      roleEl.textContent = leader.role;
      quoteEl.textContent = `"${leader.quote}"`;

      credsEl.innerHTML = leader.credentials
        .map(
          (cred) => `
        <div class="leader-modal__cred-item">
          <span class="leader-modal__cred-dot">&#9733;</span>
          <span>${cred}</span>
        </div>`
        )
        .join('');

      aboutEl.innerHTML = leader.about.map((p) => `<p>${p}</p>`).join('');
      respEl.innerHTML = leader.responsibilities.map((r) => `<li>${r}</li>`).join('');
      strengthsEl.innerHTML = leader.strengths.map((s) => `<li>${s}</li>`).join('');
      legacyEl.textContent = leader.legacy;

      if (leader.poster) {
        posterBtn.style.display = 'inline-flex';
        posterBtn.href = leader.poster;
      } else {
        posterBtn.style.display = 'none';
      }

      resetModalScroll(smoothScrollTop);
    }

    function openModal(index) {
      populateModal(index, false);
      modal.classList.add('open');
      document.body.classList.add('modal-open');
      requestAnimationFrame(() => resetModalScroll(false));
    }

    function closeModal() {
      modal.classList.remove('open');
      document.body.classList.remove('modal-open');
    }

    if (leadersGrid) {
      leadersGrid.querySelectorAll('.leader-card').forEach((card) => {
        const idx = Number(card.dataset.leaderIndex);
        card.addEventListener('click', () => openModal(idx));
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openModal(idx);
          }
        });
      });
    }

    const founderProfileBtn = document.getElementById('open-founder-profile');
    if (founderProfileBtn) {
      founderProfileBtn.addEventListener('click', () => openModal(0));
    }

    if (prevBtn) prevBtn.addEventListener('click', () => populateModal(currentIndex - 1, true));
    if (nextBtn) nextBtn.addEventListener('click', () => populateModal(currentIndex + 1, true));
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    const backdrop = modal.querySelector('.modal__backdrop');
    if (backdrop) backdrop.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('open')) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') populateModal(currentIndex - 1, true);
      if (e.key === 'ArrowRight') populateModal(currentIndex + 1, true);
    });

    // Deep-link support: leadership.html?leader=otieno-collins-junior
    const params = new URLSearchParams(window.location.search);
    const requestedLeader = params.get('leader');
    if (requestedLeader) {
      const idx = DATA.leaders.findIndex((l) => l.id === requestedLeader);
      if (idx >= 0) {
        openModal(idx);
      }
    }
  }

  /* --------------------------------------------------------------------------
     Membership & Volunteer Registration Form (WhatsApp & Email Fast-Track)
  -------------------------------------------------------------------------- */
  function initMembershipForm() {
    const form = document.getElementById('membership-form');
    const emailBtn = document.getElementById('send-membership-email');
    if (!form) return;

    // Pre-select pathway from URL (?pathway=volunteer or full title)
    const params = new URLSearchParams(window.location.search);
    const requestedPathway = params.get('pathway');
    const pathwaySelect = document.getElementById('mem-pathway');
    if (requestedPathway && pathwaySelect && DATA.pathways) {
      const matched = DATA.pathways.find(
        (pw) =>
          pw.id.toLowerCase() === requestedPathway.toLowerCase() ||
          pw.value.toLowerCase() === requestedPathway.toLowerCase()
      );
      if (matched) {
        pathwaySelect.value = matched.value;
      }
    }

    function buildPayload() {
      const name = document.getElementById('mem-name').value.trim();
      const phone = document.getElementById('mem-phone').value.trim();
      const email = document.getElementById('mem-email').value.trim();
      const location = document.getElementById('mem-location').value.trim();
      const pathway = document.getElementById('mem-pathway').value;
      const focus = document.getElementById('mem-focus').value;
      const message = document.getElementById('mem-message').value.trim();

      if (!name || !phone) {
        showToast('Please enter your Full Name and Phone / WhatsApp number.');
        return null;
      }

      const summary = [
        `Hello C.E.O Foundation! I would like to join the CEO Movement.`,
        ``,
        `*Name:* ${name}`,
        `*Phone:* ${phone}`,
        email ? `*Email:* ${email}` : null,
        location ? `*Location / Institution:* ${location}` : null,
        `*Participation Pathway:* ${pathway}`,
        `*Primary Area of Interest:* ${focus}`,
        message ? `*Motivation / Skills:* ${message}` : null
      ]
        .filter(Boolean)
        .join('\n');

      return { name, pathway, summary };
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (CONFIG.googleFormUrl) {
        window.open(CONFIG.googleFormUrl, '_blank', 'noopener');
        return;
      }
      const data = buildPayload();
      if (!data) return;
      const waUrl = `https://wa.me/${CONFIG.phoneRaw}?text=${encodeURIComponent(data.summary)}`;
      showToast('Opening WhatsApp to complete your C.E.O Membership registration...');
      window.open(waUrl, '_blank', 'noopener');
    });

    if (emailBtn) {
      emailBtn.addEventListener('click', () => {
        const data = buildPayload();
        if (!data) return;
        const subject = `C.E.O Foundation Membership Application - ${data.name} (${data.pathway})`;
        const cleanBody = data.summary.replace(/\*/g, '');
        window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(cleanBody)}`;
        showToast('Opening your email client with your formatted application...');
      });
    }
  }

  /* --------------------------------------------------------------------------
     Interactive Impact & Donation Calculator + Kenyan M-Pesa Copy Controls
  -------------------------------------------------------------------------- */
  function initSupportHub() {
    const tiersGrid = document.getElementById('tiers-grid');
    const currencyBtns = document.querySelectorAll('[data-currency]');
    const freqBtns = document.querySelectorAll('[data-frequency]');
    const customInput = document.getElementById('custom-amount-input');
    const customPrefix = document.getElementById('custom-currency-prefix');
    const readoutTitle = document.getElementById('impact-readout-title');
    const readoutDesc = document.getElementById('impact-readout-desc');
    const pledgeWaBtn = document.getElementById('pledge-whatsapp-btn');
    const pledgeEmailBtn = document.getElementById('pledge-email-btn');

    // Global 1-Click Copy Buttons (available on any page)
    document.querySelectorAll('[data-copy]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const text = btn.dataset.copy;
        const label = btn.dataset.copyLabel || 'Details';
        try {
          await navigator.clipboard.writeText(text);
          showToast(`${label} (${text}) copied to clipboard!`);
        } catch (err) {
          const temp = document.createElement('textarea');
          temp.value = text;
          document.body.appendChild(temp);
          temp.select();
          document.execCommand('copy');
          document.body.removeChild(temp);
          showToast(`${label} (${text}) copied to clipboard!`);
        }
      });
    });

    // Channel tabs (M-Pesa / In-Kind / CSR Partner)
    const channelTabs = document.querySelectorAll('[data-channel-tab]');
    const channelPanes = document.querySelectorAll('[data-channel-pane]');
    channelTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.channelTab;
        channelTabs.forEach((t) => t.classList.toggle('active', t === tab));
        channelPanes.forEach((p) => p.classList.toggle('active', p.dataset.channelPane === target));
      });
    });

    if (!tiersGrid) return;

    let currency = 'KES';
    let frequency = 'One-Time';
    let selectedTierIndex = 1; // Default to Children's Home Meal Support (KES 1,500)
    let customAmount = null;

    // Hydrate URL query parameters (?tier=tier-dignity&currency=USD&tab=inkind)
    const params = new URLSearchParams(window.location.search);
    const requestedTier = params.get('tier');
    if (requestedTier) {
      const idx = DATA.impactTiers.findIndex((t) => t.id === requestedTier);
      if (idx >= 0) selectedTierIndex = idx;
    }
    const requestedCurrency = (params.get('currency') || '').toUpperCase();
    if (requestedCurrency === 'USD' || requestedCurrency === 'KES') {
      currency = requestedCurrency;
      currencyBtns.forEach((b) => b.classList.toggle('active', b.dataset.currency === currency));
      if (customPrefix) customPrefix.textContent = currency === 'KES' ? 'KES' : 'USD $';
    }
    const requestedTab = params.get('tab');
    if (requestedTab && ['mpesa', 'inkind', 'partner'].includes(requestedTab)) {
      channelTabs.forEach((t) => t.classList.toggle('active', t.dataset.channelTab === requestedTab));
      channelPanes.forEach((p) => p.classList.toggle('active', p.dataset.channelPane === requestedTab));
    }

    function formatCurrency(amount) {
      return currency === 'KES'
        ? `KES ${Number(amount).toLocaleString()}`
        : `$${Number(amount).toLocaleString()} USD`;
    }

    function updateReadout() {
      const tier = DATA.impactTiers[selectedTierIndex];
      const activeAmount = customAmount || (currency === 'KES' ? tier.kes : tier.usd);
      const formatted = formatCurrency(activeAmount);

      if (readoutTitle && readoutDesc) {
        readoutTitle.textContent = `${frequency} Support \u2022 ${formatted}`;
        readoutDesc.textContent = customAmount
          ? `Your ${formatted} (${frequency.toLowerCase()}) contribution directly fuels C.E.O Foundation's children's welfare visits, sanitary & hygiene drives, and youth mentorship programmes across Kenya.`
          : tier.impact;
      }

      const msg = `Hello C.E.O Foundation Finance Team! I would like to make a *${frequency} Support Contribution* of *${formatted}* towards *${customAmount ? 'General Community Impact' : tier.label}* (Ref: ${tier.accountRef}). Kindly share/confirm the M-Pesa or payment instructions.`;

      if (pledgeWaBtn) {
        pledgeWaBtn.href = `https://wa.me/${CONFIG.phoneRaw}?text=${encodeURIComponent(msg)}`;
      }
      if (pledgeEmailBtn) {
        const subject = `Support Contribution Pledge (${formatted}) - C.E.O Foundation`;
        pledgeEmailBtn.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(msg.replace(/\*/g, ''))}`;
      }
    }

    function renderTiers() {
      tiersGrid.innerHTML = DATA.impactTiers
        .map((tier, idx) => {
          const val = currency === 'KES' ? `KES ${tier.kes.toLocaleString()}` : `$${tier.usd}`;
          const isActive = customAmount === null && idx === selectedTierIndex;
          return `
            <button type="button" class="tier-btn ${isActive ? 'active' : ''}" data-tier-idx="${idx}">
              ${tier.popular ? '<span class="tier-btn__badge">Most Impactful</span>' : ''}
              <span class="tier-btn__amount">${val}</span>
              <span class="tier-btn__label">${tier.label}</span>
            </button>`;
        })
        .join('');

      tiersGrid.querySelectorAll('.tier-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          selectedTierIndex = Number(btn.dataset.tierIdx);
          customAmount = null;
          if (customInput) customInput.value = '';
          renderTiers();
          updateReadout();
        });
      });
    }

    currencyBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        currency = btn.dataset.currency;
        currencyBtns.forEach((b) => b.classList.toggle('active', b === btn));
        if (customPrefix) customPrefix.textContent = currency === 'KES' ? 'KES' : 'USD $';
        customAmount = null;
        if (customInput) customInput.value = '';
        renderTiers();
        updateReadout();
      });
    });

    freqBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        frequency = btn.dataset.frequency;
        freqBtns.forEach((b) => b.classList.toggle('active', b === btn));
        updateReadout();
      });
    });

    if (customInput) {
      customInput.addEventListener('input', () => {
        const val = parseFloat(customInput.value);
        if (!isNaN(val) && val > 0) {
          customAmount = val;
          tiersGrid.querySelectorAll('.tier-btn').forEach((b) => b.classList.remove('active'));
        } else {
          customAmount = null;
          renderTiers();
        }
        updateReadout();
      });
    }

    renderTiers();
    updateReadout();
  }

  /* --------------------------------------------------------------------------
     Surgical ScrollCraft Mount & Interactive Step Tabs on Home (index.html only)
  -------------------------------------------------------------------------- */
  function initHomeScrollCraft() {
    if (!window.ScrollCraft || typeof window.ScrollCraft.mount !== 'function') return;

    window.ScrollCraft.mount();

    const approachAct = document.getElementById('approach');
    const stepTabs = document.querySelectorAll('.sc-approach__tab[data-sc-step]');
    if (!approachAct || !stepTabs.length) return;

    const plateauTargets = [0.08, 0.37, 0.63, 0.92];

    function syncActiveTab() {
      const p = parseFloat(approachAct.style.getPropertyValue('--sc-p')) || 0;
      const activeIdx = p < 0.255 ? 0 : p < 0.505 ? 1 : p < 0.755 ? 2 : 3;
      stepTabs.forEach((tab, idx) => {
        const isActive = idx === activeIdx;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', String(isActive));
      });
    }

    window.addEventListener('scroll', syncActiveTab, { passive: true });
    syncActiveTab();

    stepTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const idx = Number(tab.dataset.scStep) || 0;
        const rect = approachAct.getBoundingClientRect();
        const actTop = rect.top + window.scrollY;
        const travel = Math.max(approachAct.offsetHeight - window.innerHeight, 1);
        const targetY = Math.round(actTop + travel * plateauTargets[idx]);
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      });
    });
  }

  /* --------------------------------------------------------------------------
     Scroll Reveal & Animated Counters
  -------------------------------------------------------------------------- */
  function initAnimations() {
    const revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      revealEls.forEach((el) => revealObserver.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add('visible'));
    }

    const counters = document.querySelectorAll('[data-count]');
    if ('IntersectionObserver' in window && counters.length) {
      const counterObserver = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const target = parseInt(el.dataset.count, 10);
            const suffix = el.dataset.suffix || '';
            const duration = 1100;
            const start = performance.now();

            function tick(now) {
              const progress = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              el.textContent = Math.round(target * eased) + suffix;
              if (progress < 1) {
                requestAnimationFrame(tick);
              }
            }
            requestAnimationFrame(tick);
            obs.unobserve(el);
          });
        },
        { threshold: 0.45 }
      );
      counters.forEach((c) => counterObserver.observe(c));
    }
  }

  /* --------------------------------------------------------------------------
     Footer Social Media Links (Configured via CEO_CONFIG.social or Admin Studio)
  -------------------------------------------------------------------------- */
  const SOCIAL_ICONS = {
    facebook: {
      label: 'Facebook',
      path: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z'
    },
    instagram: {
      label: 'Instagram',
      path: 'M16 4H8a4 4 0 0 0-4 4v8a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V8a4 4 0 0 0-4-4zm-4 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm4.5-6.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z'
    },
    tiktok: {
      label: 'TikTok',
      path: 'M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5v3a8 8 0 0 1-5-1.7V16a8 8 0 1 1-8-8c.7 0 1.3.1 2 .3v3.7z'
    },
    x: {
      label: 'X (Twitter)',
      path: 'M4 4l6.5 7.5L4 20h2.5l5.2-6.1L16 20h4l-7-8.1L19.5 4H17l-4.7 5.5L8 4H4z'
    },
    linkedin: {
      label: 'LinkedIn',
      path: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z M4 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4z'
    },
    youtube: {
      label: 'YouTube',
      path: 'M22.5 6.2a2.8 2.8 0 0 0-2-2C18.7 3.7 12 3.7 12 3.7s-6.7 0-8.5.5a2.8 2.8 0 0 0-2 2A29.4 29.4 0 0 0 1 12a29.4 29.4 0 0 0 .5 5.8 2.8 2.8 0 0 0 2 2c1.8.5 8.5.5 8.5.5s6.7 0 8.5-.5a2.8 2.8 0 0 0 2-2 29.4 29.4 0 0 0 .5-5.8 29.4 29.4 0 0 0-.5-5.8zM9.8 15.5V8.5l6.2 3.5-6.2 3.5z'
    }
  };

  function renderSocialLinks() {
    const wrap = document.getElementById('footer-social');
    if (!wrap) return;
    const social = (window.CEO_CONFIG && window.CEO_CONFIG.social) || {};
    const links = Object.keys(SOCIAL_ICONS)
      .filter((k) => social[k] && /^https?:\/\//i.test(social[k]))
      .map((k) => {
        const item = SOCIAL_ICONS[k];
        return `<a href="${social[k]}" target="_blank" rel="noopener" class="footer__social-link" aria-label="C.E.O Foundation on ${item.label}" title="${item.label}">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${item.path}"/></svg>
        </a>`;
      });
    wrap.innerHTML = links.join('');
    wrap.style.display = links.length ? 'flex' : 'none';
  }

  /* --------------------------------------------------------------------------
     Initialize All Modules on DOMContentLoaded
  -------------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    renderStaticCollections();
    renderSocialLinks();
    initNavigation();
    initLightboxChrome();
    initGallery();
    initLeadership();
    initMembershipForm();
    initSupportHub();
    initHomeScrollCraft();
    initAnimations();
  });
})();
