// ===== Config =====
const CONTACT_EMAIL = "altera.ownership@gmail.com";

// ===== Nav =====
const nav = document.getElementById("nav");
const toggle = document.getElementById("navToggle");
const links = document.getElementById("navLinks");
addEventListener("scroll", () => nav.classList.toggle("is-scrolled", scrollY > 40), { passive: true });
toggle.addEventListener("click", () => {
  toggle.classList.toggle("is-open");
  links.classList.toggle("is-open");
});
links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
  toggle.classList.remove("is-open");
  links.classList.remove("is-open");
}));

// ===== Hero sparks (VFX particles) =====
(() => {
  const c = document.getElementById("sparks");
  const ctx = c.getContext("2d");
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let w, h, dpr, parts = [];
  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = c.offsetWidth; h = c.offsetHeight;
    c.width = w * dpr; c.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const spawn = () => ({
    x: Math.random() * w,
    y: h + Math.random() * 40,
    r: Math.random() * 1.8 + .4,
    vx: (Math.random() - .5) * .3,
    vy: -(Math.random() * .7 + .25),
    life: 0,
    max: 300 + Math.random() * 400,
    hue: Math.random() < .7 ? 38 : 215
  });
  resize();
  addEventListener("resize", resize);
  const count = w < 600 ? 50 : 110;
  for (let i = 0; i < count; i++) { const p = spawn(); p.y = Math.random() * h; p.life = Math.random() * p.max; parts.push(p); }
  let mx = -999, my = -999;
  c.parentElement.addEventListener("pointermove", e => { const b = c.getBoundingClientRect(); mx = e.clientX - b.left; my = e.clientY - b.top; });
  const tick = () => {
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    for (const p of parts) {
      const dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
      if (d2 < 14000) { p.vx += dx / d2 * 2; p.vy += dy / d2 * 2; }
      p.vx *= .99; p.x += p.vx + Math.sin((p.life + p.x) * .01) * .2; p.y += p.vy; p.life++;
      const a = Math.sin(Math.PI * p.life / p.max);
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
      g.addColorStop(0, `hsla(${p.hue},100%,80%,${a})`);
      g.addColorStop(1, `hsla(${p.hue},100%,60%,0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2); ctx.fill();
      if (p.life > p.max || p.y < -20) Object.assign(p, spawn());
    }
    requestAnimationFrame(tick);
  };
  tick();
})();

// ===== Reveal on scroll =====
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
}), { threshold: .12 });
document.querySelectorAll(".reveal").forEach(el => io.observe(el));

// ===== Card glow follows cursor =====
document.querySelectorAll(".card").forEach(card => card.addEventListener("pointermove", e => {
  const b = card.getBoundingClientRect();
  card.style.setProperty("--mx", `${e.clientX - b.left}px`);
  card.style.setProperty("--my", `${e.clientY - b.top}px`);
}));

// ===== Portfolio filter =====
const filterBtns = document.querySelectorAll("#filters button");
const items = document.querySelectorAll("#gallery .item");
filterBtns.forEach(btn => btn.addEventListener("click", () => {
  filterBtns.forEach(b => b.classList.toggle("is-active", b === btn));
  const f = btn.dataset.filter;
  items.forEach(it => it.classList.toggle("is-hidden", f !== "all" && it.dataset.cat !== f));
}));

// ===== Lightbox =====
const lb = document.createElement("div");
lb.className = "lightbox";
lb.innerHTML = '<button aria-label="Close">&times;</button><img alt="" />';
document.body.appendChild(lb);
const lbImg = lb.querySelector("img");
items.forEach(it => it.addEventListener("click", () => {
  const img = it.querySelector("img");
  lbImg.src = img.src; lbImg.alt = img.alt;
  lb.classList.add("is-open");
}));
lb.addEventListener("click", () => lb.classList.remove("is-open"));
addEventListener("keydown", e => { if (e.key === "Escape") lb.classList.remove("is-open"); });

// ===== Showreel (set data-video to a YouTube ID in index.html) =====
const reel = document.getElementById("reel");
reel.querySelector(".reel__play").addEventListener("click", () => {
  const id = reel.dataset.video;
  if (!id) { document.getElementById("reelSoon").classList.add("is-visible"); return; }
  reel.innerHTML = `<iframe src="https://www.youtube.com/embed/${id}?autoplay=1&rel=0" allow="autoplay; encrypted-media; fullscreen" allowfullscreen title="Altera Studio showreel"></iframe>`;
});

// ===== Stats counter =====
const statIO = new IntersectionObserver(entries => entries.forEach(e => {
  if (!e.isIntersecting) return;
  const el = e.target, end = +el.dataset.count, t0 = performance.now();
  const step = t => {
    const k = Math.min((t - t0) / 1400, 1);
    el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
  statIO.unobserve(el);
}), { threshold: .5 });
document.querySelectorAll("[data-count]").forEach(el => statIO.observe(el));

// ===== Contact form → mailto =====
document.getElementById("contactForm").addEventListener("submit", e => {
  e.preventDefault();
  const d = new FormData(e.target);
  const subject = `[${d.get("service")}] Project inquiry from ${d.get("name")}`;
  const body = `Name: ${d.get("name")}\nEmail: ${d.get("email")}\nService: ${d.get("service")}\n\n${d.get("message")}`;
  location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

document.getElementById("year").textContent = new Date().getFullYear();
