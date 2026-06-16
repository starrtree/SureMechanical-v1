const layers = [
  'upgrade-core.css',
  'upgrade-sections.css',
  'upgrade-portfolio.css',
  'upgrade-pages.css',
];

for (const file of layers) {
  if (document.querySelector(`link[href$="${file}"]`)) continue;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = new URL(file, import.meta.url).href;
  document.head.appendChild(link);
}

const mobileToggle = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('.primary-nav');
const closeNavigation = () => {
  mobileToggle?.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('nav-open');
};

primaryNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeNavigation));
window.addEventListener('resize', () => {
  if (window.innerWidth > 1100) closeNavigation();
});

const featuredRail = document.querySelector('main > .portfolio-section .section-heading-row + .project-grid');
if (featuredRail) {
  const cards = [...featuredRail.querySelectorAll('.portfolio-card')];
  const controls = document.createElement('div');
  controls.className = 'project-rail-controls';

  const previous = document.createElement('button');
  previous.type = 'button';
  previous.setAttribute('aria-label', 'Scroll featured projects left');
  previous.textContent = '←';

  const progress = document.createElement('span');
  progress.className = 'project-rail-progress';
  progress.setAttribute('aria-live', 'polite');

  const next = document.createElement('button');
  next.type = 'button';
  next.setAttribute('aria-label', 'Scroll featured projects right');
  next.textContent = '→';

  controls.append(previous, progress, next);
  featuredRail.insertAdjacentElement('afterend', controls);

  const step = () => (cards[0]?.getBoundingClientRect().width || 340) + 20;
  previous.addEventListener('click', () => featuredRail.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => featuredRail.scrollBy({ left: step(), behavior: 'smooth' }));

  const updateProgress = () => {
    if (!cards.length) return;
    const railLeft = featuredRail.getBoundingClientRect().left;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;
    cards.forEach((card, index) => {
      const distance = Math.abs(card.getBoundingClientRect().left - railLeft);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    progress.textContent = `${String(closestIndex + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
  };

  featuredRail.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  if (!document.getElementById('project-modal')) {
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        window.location.assign('projects/');
      });
    });
  }
}

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
  const items = document.querySelectorAll(
    '.section-heading, .stat-card, .company-card, .portfolio-card, .value-card, .mini-card, .industry-detail, .company-section, .accordion, .workforce > div'
  );
  items.forEach((item) => item.classList.add('reveal-ready'));
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      currentObserver.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  items.forEach((item) => observer.observe(item));
}
