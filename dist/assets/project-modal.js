const projectData = document.getElementById('project-data');
const modal = document.getElementById('project-modal');

if (projectData && modal) {
  const projects = JSON.parse(projectData.textContent);
  const panel = modal.querySelector('.project-modal__panel');
  const viewport = modal.querySelector('[data-gallery-viewport]');
  const dots = modal.querySelector('[data-gallery-dots]');
  const title = modal.querySelector('[data-modal-title]');
  const category = modal.querySelector('[data-modal-category]');
  const description = modal.querySelector('[data-modal-description]');
  const company = modal.querySelector('[data-modal-company]');
  const tags = modal.querySelector('[data-modal-tags]');
  const closeButton = modal.querySelector('.project-modal__close');
  const stylesheet = document.querySelector('link[href$="assets/styles.css"]')?.getAttribute('href') || 'assets/styles.css';
  const prefix = stylesheet.replace(/assets\/styles\.css$/, '');

  let activeProject = 0;
  let activeSlide = 0;
  let lastFocus = null;
  let scrollTimer = null;

  const projectAsset = (src) => src.startsWith('/images/') ? `${prefix}${src.slice(1)}` : src;
  const focusable = () => [...panel.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')];

  const updateDots = () => {
    dots.querySelectorAll('button').forEach((dot, index) => dot.classList.toggle('active', index === activeSlide));
  };

  const setSlide = (index, smooth = true) => {
    const slides = [...viewport.querySelectorAll('.project-gallery__slide')];
    if (!slides.length) return;
    activeSlide = (index + slides.length) % slides.length;
    slides[activeSlide].scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', inline: 'center', block: 'nearest' });
    updateDots();
  };

  const addGalleryImage = (image) => {
    const figure = document.createElement('figure');
    figure.className = 'project-gallery__slide';

    const img = document.createElement('img');
    img.className = 'project-gallery__image';
    img.src = projectAsset(image.src);
    img.alt = image.alt;
    img.loading = 'lazy';
    img.addEventListener('error', () => {
      img.hidden = true;
    });

    const caption = document.createElement('figcaption');
    caption.textContent = image.caption || '';
    figure.append(img, caption);
    viewport.appendChild(figure);
  };

  const addDot = (_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Go to image ${index + 1}`);
    dot.addEventListener('click', () => setSlide(index));
    dots.appendChild(dot);
  };

  const renderTags = (items) => {
    tags.replaceChildren();
    items.forEach((item) => {
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = item;
      tags.appendChild(chip);
    });
  };

  const openProject = (index) => {
    activeProject = (index + projects.length) % projects.length;
    activeSlide = 0;
    const project = projects[activeProject];

    title.textContent = project.title;
    category.textContent = `${project.icon} ${project.category}`;
    description.textContent = project.description;
    company.textContent = project.company;
    renderTags(project.tags);
    viewport.replaceChildren();
    dots.replaceChildren();
    project.gallery.forEach(addGalleryImage);
    project.gallery.forEach(addDot);

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    closeButton.focus();
    requestAnimationFrame(() => setSlide(0, false));
  };

  const closeProject = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    lastFocus?.focus();
  };

  document.querySelectorAll('[data-project-index]').forEach((card) => {
    card.addEventListener('click', () => {
      lastFocus = card;
      openProject(Number(card.dataset.projectIndex));
    });
  });

  modal.querySelectorAll('[data-modal-close]').forEach((control) => control.addEventListener('click', closeProject));
  modal.querySelector('[data-gallery-prev]').addEventListener('click', () => setSlide(activeSlide - 1));
  modal.querySelector('[data-gallery-next]').addEventListener('click', () => setSlide(activeSlide + 1));
  modal.querySelector('[data-project-prev]').addEventListener('click', () => openProject(activeProject - 1));
  modal.querySelector('[data-project-next]').addEventListener('click', () => openProject(activeProject + 1));

  viewport.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const width = viewport.clientWidth || 1;
      activeSlide = Math.max(0, Math.min(viewport.children.length - 1, Math.round(viewport.scrollLeft / width)));
      updateDots();
    }, 90);
  }, { passive: true });

  document.addEventListener('keydown', (event) => {
    if (!modal.classList.contains('is-open')) return;
    if (event.key === 'Escape') closeProject();
    if (event.key === 'ArrowLeft') setSlide(activeSlide - 1);
    if (event.key === 'ArrowRight') setSlide(activeSlide + 1);

    if (event.key === 'Tab') {
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
}
