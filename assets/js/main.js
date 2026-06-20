/* ============================================================
   ViaPrivé — интерактив: 3D-параллакс, tilt, скролл, переходы
   ============================================================ */
(function () {
  "use strict";

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Навигация: фон при скролле + бургер ---------- */
  const nav = document.querySelector(".nav");
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle("scrolled", window.scrollY > 40);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const burger = document.querySelector(".nav__burger");
  const links = document.querySelector(".nav__links");
  if (burger && links) {
    burger.addEventListener("click", () => links.classList.toggle("open"));
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => links.classList.remove("open"))
    );
  }

  /* ---------- Появление при скролле ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  if (reduce) return; // дальше только декоративные эффекты

  /* ---------- HERO: 3D-параллакс по движению мыши ---------- */
  const hero = document.querySelector(".hero");
  const scene = document.querySelector(".hero__scene");
  const inner = document.querySelector(".hero__inner");
  const card = document.querySelector(".hero__card");
  if (hero && (scene || inner)) {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
    });
    hero.addEventListener("mouseleave", () => { tx = 0; ty = 0; });

    const loop = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      if (scene) scene.style.transform =
        `rotateY(${cx * 10}deg) rotateX(${-cy * 10}deg) translateZ(0)`;
      if (inner) inner.style.transform =
        `rotateY(${cx * 4}deg) rotateX(${-cy * 4}deg)`;
      if (card) card.style.transform =
        `translateZ(90px) rotateY(${-12 + cx * 16}deg) rotateX(${6 - cy * 14}deg)`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* ---------- Tilt 3D для карточек ---------- */
  const isTouch = matchMedia("(hover: none)").matches;
  if (!isTouch) {
    document.querySelectorAll(".tilt").forEach((el) => {
      const strength = parseFloat(el.dataset.tilt || "10");
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        el.style.transform =
          `perspective(800px) rotateY(${(px - 0.5) * strength * 2}deg) rotateX(${(0.5 - py) * strength * 2}deg) translateZ(10px)`;
        el.style.setProperty("--mx", px * 100 + "%");
        el.style.setProperty("--my", py * 100 + "%");
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "";
      });
    });
  }

  /* ---------- Переходы между страницами (занавес) ---------- */
  const curtain = document.querySelector(".curtain");
  if (curtain) {
    // открыть страницу (поднять занавес)
    requestAnimationFrame(() => {
      setTimeout(() => curtain.classList.add("up"), 60);
    });

    document.querySelectorAll('a[data-link]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const href = a.getAttribute("href");
        if (!href || href.startsWith("#") || a.target === "_blank") return;
        e.preventDefault();
        document.body.classList.add("leaving");
        curtain.classList.remove("up");
        curtain.classList.add("down");
        setTimeout(() => (window.location.href = href), 620);
      });
    });
  }
})();
