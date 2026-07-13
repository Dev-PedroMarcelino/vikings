/* ═══════════════════════════════════════════════════════════
   VIKING'S BURGUER — Motion & Interações (TypeScript)
   GSAP + ScrollTrigger · Lenis (scroll suave) · AOS · Canvas
   Compilado para js/main.js  (npm run build)
   ═══════════════════════════════════════════════════════════ */

(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasGsap = !!window.gsap && !prefersReducedMotion;

  /* ── Lenis: scroll suave (um único loop de rAF) ───────────
     Bug anterior: o Lenis era dirigido por DOIS loops de rAF ao
     mesmo tempo (um standalone + o ticker do GSAP), avançando o
     scroll em dobro por frame — daí a sensação de travado. Agora
     há uma única fonte de tempo: o ticker do GSAP quando presente,
     senão um rAF próprio.                                        */
  let lenis: Lenis | null = null;
  if (window.Lenis && !prefersReducedMotion) {
    lenis = new Lenis({
      lerp: 0.11,
      wheelMultiplier: 1,
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1.6,
    });

    if (!hasGsap) {
      const raf = (time: number): void => {
        lenis!.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    }
  }

  /* ── Menu mobile ──────────────────────────────────────── */
  const burgerBtn = document.getElementById("burgerBtn");
  const nav = document.getElementById("nav");

  const closeMobileNav = (): void => {
    nav?.classList.remove("is-open");
    burgerBtn?.classList.remove("is-open");
    burgerBtn?.setAttribute("aria-expanded", "false");
  };

  burgerBtn?.addEventListener("click", () => {
    const open = nav?.classList.toggle("is-open") ?? false;
    burgerBtn.classList.toggle("is-open", open);
    burgerBtn.setAttribute("aria-expanded", String(open));
  });

  /* ── Âncoras internas respeitam o scroll suave ────────── */
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e: MouseEvent) => {
      const id = link.getAttribute("href");
      if (!id || id.length < 2) return;
      const target = document.querySelector<HTMLElement>(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) {
        // Blocos do cardápio ficam sob o header + a barra sticky de
        // categorias, então precisam de um offset maior
        const offset = target.classList.contains("menu__block") ? -130 : -80;
        lenis.scrollTo(target, { offset });
      } else {
        target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
      }
      closeMobileNav();
    });
  });

  /* ── AOS: reveals por seção ───────────────────────────── */
  window.AOS?.init({
    duration: 800,
    easing: "ease-out-cubic",
    once: true,
    offset: 60,
    disable: prefersReducedMotion,
  });

  /* ── Header: encolhe ao rolar ─────────────────────────── */
  const header = document.getElementById("header");
  const onScroll = (): void => {
    header?.classList.toggle("is-scrolled", window.scrollY > 40);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ── GSAP: hero, parallax e contadores ────────────────── */
  if (hasGsap) {
    gsap.registerPlugin(ScrollTrigger);

    if (lenis) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time: number) => lenis!.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    // Entrada cinematográfica do hero
    gsap
      .timeline({ defaults: { ease: "power4.out" } })
      .from(".hero__runes", { y: 24, opacity: 0, duration: 0.9 })
      .from(".hero__kicker", { y: 24, opacity: 0, duration: 0.8 }, "-=0.6")
      .from(".hero__line", { yPercent: 110, duration: 1.1, stagger: 0.14 }, "-=0.5")
      .from(".hero__subtitle", { y: 30, opacity: 0, duration: 0.9 }, "-=0.6")
      .from(".hero__actions .btn", { y: 26, opacity: 0, duration: 0.7, stagger: 0.12 }, "-=0.55")
      .from(".hero__rating", { y: 18, opacity: 0, duration: 0.7 }, "-=0.4")
      .from(".hero__scroll", { opacity: 0, duration: 0.8 }, "-=0.3");

    // Parallax do fundo do hero (imagem + vídeo se movem juntos).
    // No mobile o fundo vira uma faixa no fluxo da página, então o
    // deslocamento a empurraria por cima do texto — desativado lá.
    if (window.matchMedia("(min-width: 641px)").matches) {
      gsap.to(".hero__bg", {
        yPercent: 10,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
      });
    }

    // Parallax do CTA final
    gsap.fromTo(
      ".cta__img",
      { yPercent: -10 },
      {
        yPercent: 10,
        ease: "none",
        scrollTrigger: { trigger: ".cta", start: "top bottom", end: "bottom top", scrub: true },
      }
    );

    // Vegvísir: bússola nórdica que gira conforme o scroll
    gsap.utils.toArray<HTMLElement>(".vegvisir").forEach((el) => {
      gsap.to(el, {
        rotation: 220,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1.2 },
      });
    });

    // Contadores animados
    document.querySelectorAll<HTMLElement>(".counter").forEach((el) => {
      const target = parseFloat(el.dataset.target ?? "0");
      const decimals = parseInt(el.dataset.decimals ?? "0", 10);
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 2,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
        onUpdate() {
          el.textContent = obj.val.toFixed(decimals).replace(".", ",");
        },
      });
    });
  } else {
    // Sem GSAP: garante contadores com o valor final
    document.querySelectorAll<HTMLElement>(".counter").forEach((el) => {
      const decimals = parseInt(el.dataset.decimals ?? "0", 10);
      el.textContent = parseFloat(el.dataset.target ?? "0").toFixed(decimals).replace(".", ",");
    });
  }

  /* ── Decodificação rúnica: runas se transformam em letras ─
     Aplicada aos rótulos curtos (kickers e títulos do cardápio).
     Anima apenas o último nó de texto do elemento, preservando
     ícones/spans internos.                                       */
  const RUNES = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟᛥᚾ";
  const randomRune = (): string => RUNES[(Math.random() * RUNES.length) | 0];

  const decodeTextNode = (node: Text): void => {
    const finalText = node.nodeValue ?? "";
    const chars = [...finalText];
    const total = chars.length;
    if (!total) return;

    const durationPerChar = 42; // ms que cada caractere leva para "assentar"
    const stagger = 55;
    const start = performance.now();

    const frame = (now: number): void => {
      const elapsed = now - start;
      let settled = 0;
      const out = chars.map((ch, i) => {
        if (ch === " ") return " ";
        const charStart = i * stagger;
        const progress = elapsed - charStart;
        if (progress >= durationPerChar) {
          settled++;
          return ch;
        }
        if (progress < 0) return "";
        return randomRune();
      });
      node.nodeValue = out.join("");
      if (settled < total) {
        requestAnimationFrame(frame);
      } else {
        node.nodeValue = finalText;
      }
    };
    requestAnimationFrame(frame);
  };

  const lastTextNode = (el: Element): Text | null => {
    for (let i = el.childNodes.length - 1; i >= 0; i--) {
      const child = el.childNodes[i];
      if (child.nodeType === Node.TEXT_NODE && (child.nodeValue ?? "").trim().length > 0) {
        return child as Text;
      }
    }
    return null;
  };

  const scrambleTargets = document.querySelectorAll<HTMLElement>(
    ".section__kicker, .menu__heading, .launch__kicker"
  );
  if (scrambleTargets.length && !prefersReducedMotion && "IntersectionObserver" in window) {
    const runeObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const node = lastTextNode(entry.target);
          if (node) decodeTextNode(node);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );
    scrambleTargets.forEach((el) => runeObserver.observe(el));
  }

  /* ── Botões magnéticos: o CTA é atraído pelo cursor ─────── */
  if (canHover && !prefersReducedMotion) {
    document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((btn) => {
      const strength = 0.35;
      const moveX = hasGsap ? gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3" }) : null;
      const moveY = hasGsap ? gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3" }) : null;

      btn.addEventListener("pointermove", (e: PointerEvent) => {
        const rect = btn.getBoundingClientRect();
        const relX = (e.clientX - rect.left - rect.width / 2) * strength;
        const relY = (e.clientY - rect.top - rect.height / 2) * strength;
        if (moveX && moveY) {
          moveX(relX);
          moveY(relY);
        } else {
          btn.style.transform = `translate(${relX}px, ${relY}px)`;
        }
      });

      btn.addEventListener("pointerleave", () => {
        if (moveX && moveY) {
          moveX(0);
          moveY(0);
        } else {
          btn.style.transform = "";
        }
      });
    });
  }

  /* ── Tilt 3D nos cards ao passar o mouse ───────────────── */
  if (canHover && !prefersReducedMotion) {
    const MAX_TILT = 6; // graus
    document.querySelectorAll<HTMLElement>(".card, .feature").forEach((card) => {
      card.addEventListener("pointermove", (e: PointerEvent) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform =
          `perspective(900px) rotateX(${(-py * MAX_TILT).toFixed(2)}deg) ` +
          `rotateY(${(px * MAX_TILT).toFixed(2)}deg) translateY(-8px)`;
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ── Vídeos inline (cards): tocam só quando visíveis ────── */
  const inlineVideos = document.querySelectorAll<HTMLVideoElement>("video[data-inline]");
  if (inlineVideos.length && "IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting && !prefersReducedMotion) {
            const p = video.play();
            if (p) p.catch(() => undefined);
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.35 }
    );
    inlineVideos.forEach((v) => videoObserver.observe(v));
  }

  /* ── Vídeo do hero: loop com crossfade suave ──────────────
     Roda mesmo com prefers-reduced-motion: o vídeo é o fundo da
     marca (sem ele só resta a imagem estática) e sem este bloco
     ele ficava eternamente com opacity 0, baixando à toa.        */
  const heroVideo = document.getElementById("heroVideo") as HTMLVideoElement | null;
  if (heroVideo) {
    heroVideo.removeAttribute("loop"); // o loop nativo dá corte seco
    const hero = document.querySelector<HTMLElement>(".hero");
    const FADE_AHEAD = 1.0;
    const FADE_MS = 900;

    let active: HTMLVideoElement = heroVideo;
    let standby = heroVideo.cloneNode() as HTMLVideoElement;
    standby.removeAttribute("autoplay");
    standby.removeAttribute("id");
    standby.classList.remove("is-active");
    heroVideo.parentElement?.appendChild(standby);

    let swapping = false;

    const crossfade = (): void => {
      if (swapping) return;
      swapping = true;
      standby.currentTime = 0;
      const playing = standby.play();
      (playing ?? Promise.resolve())
        .then(() => {
          standby.classList.add("is-active");
          active.classList.remove("is-active");
          window.setTimeout(() => {
            active.pause();
            const prev = active;
            active = standby;
            standby = prev;
            swapping = false;
          }, FADE_MS);
        })
        .catch(() => {
          swapping = false;
        });
    };

    const armCrossfade = (v: HTMLVideoElement): void => {
      v.addEventListener("timeupdate", () => {
        if (v !== active || !v.duration) return;
        if (v.duration - v.currentTime > FADE_AHEAD) return;
        crossfade();
      });
      v.addEventListener("ended", () => {
        if (v === active) crossfade();
      });
    };

    armCrossfade(heroVideo);
    armCrossfade(standby);

    heroVideo.addEventListener(
      "playing",
      () => {
        heroVideo.classList.add("is-active");
        hero?.classList.add("has-video");
      },
      { once: true }
    );

    const autoplayAttempt = heroVideo.play();
    if (autoplayAttempt) {
      autoplayAttempt.catch(() => {
        window.addEventListener(
          "pointerdown",
          () => {
            const retry = heroVideo.play();
            if (retry) retry.catch(() => undefined);
          },
          { once: true }
        );
      });
    }

    // Pausa o vídeo quando o hero sai da tela (performance)
    new IntersectionObserver(
      ([entry]) => {
        if (!hero?.classList.contains("has-video")) return;
        if (entry.isIntersecting) {
          const resume = active.play();
          if (resume) resume.catch(() => undefined);
        } else if (!swapping) {
          active.pause();
        }
      },
      { threshold: 0 }
    ).observe(hero as Element);
  }

  /* ── Reel "vikings def": vídeo → logo → vídeo, em loop ────
     Quando o vídeo termina, a logo entra com um efeito de
     revelação; após um intervalo, o vídeo recomeça do zero.     */
  const reel = document.getElementById("reel");
  const reelVideo = document.getElementById("reelVideo") as HTMLVideoElement | null;
  if (reel && reelVideo) {
    const LOGO_MS = 3200; // tempo da logo em cena antes do vídeo voltar
    let logoTimer = 0;
    let reelVisible = !("IntersectionObserver" in window);

    reelVideo.addEventListener("ended", () => {
      reel.classList.add("is-logo");
      window.clearTimeout(logoTimer);
      logoTimer = window.setTimeout(() => {
        reel.classList.remove("is-logo");
        reelVideo.currentTime = 0;
        if (reelVisible) {
          const p = reelVideo.play();
          if (p) p.catch(() => undefined);
        }
      }, LOGO_MS);
    });

    // Toca só quando a seção está visível (sem brigar com o interlúdio)
    const playIfIdle = (): void => {
      if (!reelVisible || reel.classList.contains("is-logo")) return;
      const p = reelVideo.play();
      if (p) p.catch(() => undefined);
    };
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        ([entry]) => {
          reelVisible = entry.isIntersecting;
          if (reelVisible) {
            playIfIdle();
          } else {
            reelVideo.pause();
          }
        },
        { threshold: 0.3 }
      ).observe(reel);
    } else {
      playIfIdle();
    }
  }

  /* ── Brasas: partículas no hero ───────────────────────── */
  const canvas = document.getElementById("embers") as HTMLCanvasElement | null;
  const ctx = canvas?.getContext("2d") ?? null;
  if (canvas && ctx && !prefersReducedMotion) {
    let running = true;

    const resize = (): void => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const COLORS = ["255,107,44", "232,93,38", "201,162,75", "166,58,43"];

    interface Ember {
      x: number;
      y: number;
      r: number;
      vy: number;
      vx: number;
      life: number;
      decay: number;
      color: string;
      flicker: number;
    }

    const spawn = (): Ember => ({
      x: Math.random() * canvas.width,
      y: canvas.height + 10,
      r: Math.random() * 2.4 + 0.6,
      vy: -(Math.random() * 0.9 + 0.35),
      vx: (Math.random() - 0.5) * 0.5,
      life: 1,
      decay: Math.random() * 0.004 + 0.002,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      flicker: Math.random() * Math.PI * 2,
    });

    const COUNT = Math.min(46, Math.floor(window.innerWidth / 30));
    const particles: Ember[] = [];
    for (let i = 0; i < COUNT; i++) {
      const p = spawn();
      p.y = Math.random() * canvas.height;
      particles.push(p);
    }

    const tick = (): void => {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.x += p.vx + Math.sin(p.flicker) * 0.25;
        p.y += p.vy;
        p.flicker += 0.05;
        p.life -= p.decay;
        if (p.life <= 0 || p.y < -12) particles[i] = spawn();

        const alpha = Math.max(0, p.life * 0.8) * (0.7 + Math.sin(p.flicker * 3) * 0.3);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(${p.color},0.8)`;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      requestAnimationFrame(tick);
    };
    tick();

    new IntersectionObserver(
      ([entry]) => {
        const wasRunning = running;
        running = entry.isIntersecting;
        if (running && !wasRunning) tick();
      },
      { threshold: 0 }
    ).observe(canvas);
  }

  /* ── Scrollspy das categorias do cardápio ─────────────── */
  /* ── Filtro do cardápio ──────────────────────────────── */
  const pills = document.querySelectorAll<HTMLAnchorElement>(".menu__pill");
  const blocks = document.querySelectorAll<HTMLElement>(".menu__block");

  function filterMenu(filter: string) {
    blocks.forEach((b) => {
      b.style.display = (filter === "all" || b.id === filter) ? "" : "none";
    });
    if (window.AOS) {
      setTimeout(() => window.AOS!.refresh(), 50);
    }
  }

  pills.forEach((pill) => {
    pill.addEventListener("click", (e) => {
      e.preventDefault();
      const filter = pill.dataset.filter || "all";
      pills.forEach((p) => p.classList.remove("is-active"));
      pill.classList.add("is-active");
      filterMenu(filter);
      const target = filter === "all"
        ? document.getElementById("cardapio")
        : document.getElementById(filter);
      if (target) {
        lenis?.scrollTo(target, { offset: -100 });
      }
    });
  });

  /* ── Carrossel de depoimentos ─────────────────────────── */
  const track = document.getElementById("carouselTrack");
  if (track) {
    const slides = track.children;
    const dotsWrap = document.getElementById("carouselDots");
    let index = 0;
    let timer = 0;

    const go = (i: number, manual?: boolean): void => {
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      if (dotsWrap) {
        for (let d = 0; d < dotsWrap.children.length; d++) {
          dotsWrap.children[d].classList.toggle("is-active", d === index);
        }
      }
      if (manual) restart();
    };

    const restart = (): void => {
      window.clearInterval(timer);
      timer = window.setInterval(() => go(index + 1), 5200);
    };

    if (dotsWrap) {
      for (let i = 0; i < slides.length; i++) {
        const dot = document.createElement("button");
        dot.className = "carousel__dot" + (i === 0 ? " is-active" : "");
        dot.setAttribute("aria-label", "Ir para o depoimento " + (i + 1));
        dot.addEventListener("click", () => go(i, true));
        dotsWrap.appendChild(dot);
      }
    }

    document.getElementById("prevBtn")?.addEventListener("click", () => go(index - 1, true));
    document.getElementById("nextBtn")?.addEventListener("click", () => go(index + 1, true));

    let startX = 0;
    track.addEventListener("touchstart", (e: TouchEvent) => (startX = e.touches[0].clientX), {
      passive: true,
    });
    track.addEventListener(
      "touchend",
      (e: TouchEvent) => {
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 45) go(index + (dx < 0 ? 1 : -1), true);
      },
      { passive: true }
    );

    restart();
  }

  /* ── Mapa: injetado só quando a seção aparece ─────────── */
  const mapContainer = document.getElementById("mapContainer");
  if (mapContainer) {
    const loadMap = (): void => {
      if (mapContainer.querySelector("iframe")) return;
      const iframe = document.createElement("iframe");
      iframe.src = mapContainer.dataset.mapSrc ?? "";
      iframe.width = "600";
      iframe.height = "520";
      iframe.style.border = "0";
      iframe.loading = "lazy";
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = "no-referrer-when-downgrade";
      iframe.title = "Mapa — Viking's Burguer, R. André Luiz 281, Leme/SP";
      mapContainer.replaceChildren(iframe);
    };
    if ("IntersectionObserver" in window) {
      const mapObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            loadMap();
            mapObserver.disconnect();
          }
        },
        { rootMargin: "400px" }
      );
      mapObserver.observe(mapContainer);
    } else {
      loadMap();
    }
  }

  /* ═══ MÓDULO DE PEDIDOS ═══════════════════════════════════ */

  interface CartAddon { name: string; price: number; }
  interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    addons: CartAddon[];
    img: string;
  }

  const WHATS_NUMBER = "5519996979642";
  const WHATS_BASE = `https://wa.me/${WHATS_NUMBER}?text=`;
  const CART_KEY = "vikings-cart";
  const cart: CartItem[] = loadCart();

  /* ── Helpers ─────────────────────────────────────────── */
  function fmt(v: number): string {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function parseAddons(raw: string | undefined): CartAddon[] {
    if (!raw) return [];
    return raw.split(",").map((s) => {
      const [name, price] = s.split(":");
      return { name: name.trim(), price: Number(price) || 0 };
    });
  }

  function itemTotal(item: CartItem): number {
    const addonsTotal = item.addons.reduce((s, a) => s + a.price, 0);
    return (item.price + addonsTotal) * item.quantity;
  }

  function cartTotal(): number {
    return cart.reduce((s, i) => s + itemTotal(i), 0);
  }

  function cartCount(): number {
    return cart.reduce((s, i) => s + i.quantity, 0);
  }

  function findCartIndex(id: string, addons: CartAddon[]): number {
    return cart.findIndex((c) => {
      if (c.id !== id) return false;
      if (c.addons.length !== addons.length) return false;
      const aNames = c.addons.map((a) => a.name).sort();
      const bNames = addons.map((a) => a.name).sort();
      return aNames.every((n, i) => n === bNames[i]);
    });
  }

  /* ── Persistência ──────────────────────────────────────── */
  function saveCart(): void {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch {}
  }
  function loadCart(): CartItem[] {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  /* ── DOM refs ────────────────────────────────────────── */
  const addonModal = document.getElementById("addonModal")!;
  const addonModalClose = document.getElementById("addonModalClose")!;
  const addonModalMedia = document.getElementById("addonModalMedia")!;
  const addonModalTitle = document.getElementById("addonModalTitle")!;
  const addonModalPrice = document.getElementById("addonModalPrice")!;
  const addonModalDesc = document.getElementById("addonModalDesc")!;
  const addonModalAddons = document.getElementById("addonModalAddons")!;
  const addonModalAddonsWrap = document.getElementById("addonModalAddonsWrap")!;
  const addonQtyMinus = document.getElementById("addonQtyMinus")!;
  const addonQtyPlus = document.getElementById("addonQtyPlus")!;
  const addonQtyNum = document.getElementById("addonQtyNum")!;
  const addonModalTotal = document.getElementById("addonModalTotal")!;
  const addonModalConfirm = document.getElementById("addonModalConfirm")!;
  const cartBar = document.getElementById("cartBar")!;
  const cartBarCount = document.getElementById("cartBarCount")!;
  const cartBarTotal = document.getElementById("cartBarTotal")!;
  const cartBarOpen = document.getElementById("cartBarOpen")!;
  const cartPanel = document.getElementById("cartPanel")!;
  const cartPanelOverlay = document.getElementById("cartPanelOverlay")!;
  const cartPanelClose = document.getElementById("cartPanelClose")!;
  const cartPanelItems = document.getElementById("cartPanelItems")!;
  const cartPanelTotal = document.getElementById("cartPanelTotal")!;
  const cartPanelCheckout = document.getElementById("cartPanelCheckout")!;
  const checkoutModal = document.getElementById("checkoutModal")!;
  const checkoutModalClose = document.getElementById("checkoutModalClose")!;
  const checkoutForm = document.getElementById("checkoutForm") as HTMLFormElement;
  const checkoutSummary = document.getElementById("checkoutSummary")!;

  /* ── Modal de Adicionais — state ─────────────────────── */
  let modalItemId = "";
  let modalItemName = "";
  let modalItemPrice = 0;
  let modalItemImg = "";
  let modalItemDesc = "";
  let modalAddons: CartAddon[] = [];
  let modalSelectedAddons: CartAddon[] = [];
  let modalQty = 1;

  function openAddonModal(
    id: string, name: string, price: number, img: string,
    addonsRaw: string, desc?: string
  ) {
    modalItemId = id;
    modalItemName = name;
    modalItemPrice = price;
    modalItemImg = img;
    modalItemDesc = desc || "";
    modalAddons = parseAddons(addonsRaw);
    modalSelectedAddons = [];
    modalQty = 1;

    addonModalTitle.textContent = name;
    addonModalPrice.textContent = fmt(price);
    addonModalDesc.textContent = modalItemDesc;
    addonModalDesc.style.display = modalItemDesc ? "" : "none";
    addonQtyNum.textContent = "1";

    if (img) {
      addonModalMedia.innerHTML = `<img src="${img}" alt="${name}" />`;
      addonModalMedia.style.display = "";
    } else {
      addonModalMedia.style.display = "none";
    }

    if (modalAddons.length > 0) {
      addonModalAddonsWrap.style.display = "";
      addonModalAddons.innerHTML = modalAddons.map((a) =>
        `<button class="modal__addon-pill" data-addon-name="${a.name}" data-addon-price="${a.price}" type="button">
          ${a.name} <span class="addon-price">${a.price > 0 ? `+${fmt(a.price)}` : "Grátis"}</span>
        </button>`
      ).join("");
    } else {
      addonModalAddonsWrap.style.display = "none";
    }

    updateModalTotal();
    addonModal.hidden = false;
    requestAnimationFrame(() => addonModal.classList.add("is-open"));
  }

  function closeAddonModal() {
    addonModal.classList.remove("is-open");
    setTimeout(() => { addonModal.hidden = true; }, 350);
  }

  function updateModalTotal() {
    const addonsTotal = modalSelectedAddons.reduce((s, a) => s + a.price, 0);
    const total = (modalItemPrice + addonsTotal) * modalQty;
    addonModalTotal.textContent = fmt(total);
  }

  addonModalClose.addEventListener("click", closeAddonModal);
  addonModal.addEventListener("click", (e) => {
    if (e.target === addonModal) closeAddonModal();
  });

  addonModalAddons.addEventListener("click", (e) => {
    const pill = (e.target as HTMLElement).closest(".modal__addon-pill") as HTMLElement;
    if (!pill) return;
    const aName = pill.dataset.addonName!;
    const aPrice = Number(pill.dataset.addonPrice) || 0;
    const idx = modalSelectedAddons.findIndex((a) => a.name === aName);
    if (idx >= 0) {
      modalSelectedAddons.splice(idx, 1);
      pill.classList.remove("is-active");
    } else {
      modalSelectedAddons.push({ name: aName, price: aPrice });
      pill.classList.add("is-active");
    }
    updateModalTotal();
  });

  addonQtyMinus.addEventListener("click", () => {
    if (modalQty > 1) { modalQty--; addonQtyNum.textContent = String(modalQty); updateModalTotal(); }
  });
  addonQtyPlus.addEventListener("click", () => {
    if (modalQty < 99) { modalQty++; addonQtyNum.textContent = String(modalQty); updateModalTotal(); }
  });

  addonModalConfirm.addEventListener("click", () => {
    addToCart(modalItemId, modalItemName, modalItemPrice, modalItemImg, modalSelectedAddons, modalQty);
    closeAddonModal();
  });

  /* ── Carrinho — CRUD ─────────────────────────────────── */
  function addToCart(
    id: string, name: string, price: number, img: string,
    addons: CartAddon[], qty: number
  ) {
    const idx = findCartIndex(id, addons);
    if (idx >= 0) {
      cart[idx].quantity += qty;
    } else {
      cart.push({ id, name, price, quantity: qty, addons: [...addons], img });
    }
    saveCart();
    renderAll();
  }

  function updateCartQty(index: number, delta: number) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) cart.splice(index, 1);
    saveCart();
    renderAll();
  }

  function removeCartItem(index: number) {
    cart.splice(index, 1);
    saveCart();
    renderAll();
  }

  /* ── Render ──────────────────────────────────────────── */
  function renderAll() {
    renderCartBar();
    renderCartPanel();
    renderCardButtons();
    renderDrinkButtons();
  }

  function renderCartBar() {
    const count = cartCount();
    const whatsFloat = document.querySelector(".whats-float");
    if (count > 0) {
      cartBar.hidden = false;
      cartBar.classList.add("is-visible");
      cartBarCount.textContent = `${count} ${count === 1 ? "item" : "itens"}`;
      cartBarTotal.textContent = fmt(cartTotal());
      if (whatsFloat) whatsFloat.classList.add("whats-float--raised");
    } else {
      cartBar.classList.remove("is-visible");
      if (whatsFloat) whatsFloat.classList.remove("whats-float--raised");
      setTimeout(() => { cartBar.hidden = true; }, 450);
    }
  }

  function renderCartPanel() {
    if (cart.length === 0) {
      cartPanelItems.innerHTML = `<div class="cart-panel__empty"><div class="cart-panel__empty-icon">🛒</div><p>Seu carrinho está vazio</p></div>`;
    } else {
      cartPanelItems.innerHTML = cart.map((item, i) => {
        const addonsText = item.addons.length > 0
          ? item.addons.map((a) => `+ ${a.name} (${fmt(a.price)})`).join(", ")
          : "";
        return `<div class="cart-item">
          <div class="cart-item__img">${item.img ? `<img src="${item.img}" alt="${item.name}" />` : `<div style="width:100%;height:100%;background:var(--graphite);display:grid;place-items:center;font-size:1.5rem">🍔</div>`}</div>
          <div class="cart-item__info">
            <div class="cart-item__name">${item.name}</div>
            ${addonsText ? `<div class="cart-item__addons">${addonsText}</div>` : ""}
            <div class="cart-item__row">
              <div class="cart-item__qty">
                <button class="cart-item__qty-btn cart-item__qty-minus" data-cart-idx="${i}" aria-label="Diminuir">−</button>
                <span class="cart-item__qty-num">${item.quantity}</span>
                <button class="cart-item__qty-btn cart-item__qty-plus" data-cart-idx="${i}" aria-label="Aumentar">+</button>
                <button class="cart-item__qty-btn cart-item__qty-btn--remove" data-cart-idx="${i}" data-cart-remove aria-label="Remover item">✕</button>
              </div>
              <span class="cart-item__price">${fmt(itemTotal(item))}</span>
            </div>
          </div>
        </div>`;
      }).join("");
    }
    cartPanelTotal.textContent = fmt(cartTotal());
  }

  function renderCardButtons() {
    document.querySelectorAll<HTMLElement>(".card__order").forEach((wrap) => {
      const id = wrap.dataset.id!;
      const qtyEl = wrap.querySelector<HTMLElement>(".card__qty")!;
      const numEl = wrap.querySelector<HTMLElement>(".card__qty-num")!;
      const totalInCart = cart
        .filter((c) => c.id === id)
        .reduce((s, c) => s + c.quantity, 0);
      if (totalInCart > 0) {
        qtyEl.hidden = false;
        numEl.textContent = String(totalInCart);
      } else {
        qtyEl.hidden = true;
        numEl.textContent = "0";
      }
    });
  }

  function renderDrinkButtons() {
    document.querySelectorAll<HTMLElement>(".drinks__list li[data-id]").forEach((li) => {
      const id = li.dataset.id!;
      const existing = li.querySelector<HTMLElement>(".drink-qty");
      const btn = li.querySelector<HTMLElement>(".btn-drink-add");
      const totalInCart = cart.filter((c) => c.id === id).reduce((s, c) => s + c.quantity, 0);
      if (totalInCart > 0) {
        if (btn) btn.style.display = "none";
        if (!existing) {
          const div = document.createElement("div");
          div.className = "drink-qty";
          div.innerHTML = `<button class="drink-qty-btn drink-qty-minus" data-cart-drink-minus="${id}" aria-label="Diminuir">−</button>
            <span class="drink-qty-num">${totalInCart}</span>
            <button class="drink-qty-btn drink-qty-plus" data-cart-drink-plus="${id}" aria-label="Aumentar">+</button>`;
          li.appendChild(div);
        } else {
          const numEl = existing.querySelector<HTMLElement>(".drink-qty-num")!;
          numEl.textContent = String(totalInCart);
        }
      } else {
        if (btn) btn.style.display = "";
        if (existing) existing.remove();
      }
    });
  }

  /* ── Event delegation: Cardápio "+" buttons ────────────── */
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;

    // Botão "+" nos cards (abre modal de adicionais)
    const addBtn = target.closest(".btn--add");
    if (addBtn) {
      const wrap = addBtn.closest<HTMLElement>(".card__order");
      if (wrap) {
        e.preventDefault();
        openAddonModal(
          wrap.dataset.id!,
          wrap.dataset.name!,
          Number(wrap.dataset.price) || 0,
          wrap.dataset.img || "",
          wrap.dataset.addons || "",
          wrap.closest<HTMLElement>(".card__body")?.querySelector<HTMLElement>(".card__desc")?.textContent || undefined
        );
      }
      return;
    }

    // Botão "+" nas bebidas (adiciona direto)
    if (target.closest(".btn-drink-add")) {
      const li = target.closest<HTMLElement>("li[data-id]");
      if (li) {
        addToCart(li.dataset.id!, li.dataset.name!, Number(li.dataset.price) || 0, "", [], 1);
      }
      return;
    }

    // Qty minus nos cards do cardápio
    const cardMinus = target.closest<HTMLElement>(".card__qty-minus");
    if (cardMinus) {
      const wrap = cardMinus.closest<HTMLElement>(".card__order");
      if (wrap) {
        const id = wrap.dataset.id!;
        const idx = cart.findIndex((c) => c.id === id && c.addons.length === 0);
        if (idx >= 0) updateCartQty(idx, -1);
      }
      return;
    }

    // Qty plus nos cards do cardápio
    const cardPlus = target.closest<HTMLElement>(".card__qty-plus");
    if (cardPlus) {
      const wrap = cardPlus.closest<HTMLElement>(".card__order");
      if (wrap) {
        const id = wrap.dataset.id!;
        const name = wrap.dataset.name!;
        const price = Number(wrap.dataset.price) || 0;
        const img = wrap.dataset.img || "";
        const idx = cart.findIndex((c) => c.id === id && c.addons.length === 0);
        if (idx >= 0) {
          cart[idx].quantity++;
          saveCart();
          renderAll();
        } else {
          addToCart(id, name, price, img, [], 1);
        }
      }
      return;
    }

    // Drink qty minus
    const drinkMinus = target.closest<HTMLElement>("[data-cart-drink-minus]");
    if (drinkMinus) {
      const id = drinkMinus.dataset.cartDrinkMinus!;
      const idx = cart.findIndex((c) => c.id === id);
      if (idx >= 0) updateCartQty(idx, -1);
      return;
    }

    // Drink qty plus
    const drinkPlus = target.closest<HTMLElement>("[data-cart-drink-plus]");
    if (drinkPlus) {
      const id = drinkPlus.dataset.cartDrinkPlus!;
      const li = document.querySelector<HTMLElement>(`li[data-id="${id}"]`);
      if (li) {
        const name = li.dataset.name!;
        const price = Number(li.dataset.price) || 0;
        const idx = cart.findIndex((c) => c.id === id);
        if (idx >= 0) {
          cart[idx].quantity++;
          saveCart();
          renderAll();
        } else {
          addToCart(id, name, price, "", [], 1);
        }
      }
      return;
    }

    // Carrinho: qty minus
    const cartMinus = target.closest<HTMLElement>(".cart-item__qty-minus");
    if (cartMinus) {
      const idx = Number(cartMinus.dataset.cartIdx);
      updateCartQty(idx, -1);
      return;
    }

    // Carrinho: qty plus
    const cartPlus = target.closest<HTMLElement>(".cart-item__qty-plus");
    if (cartPlus) {
      const idx = Number(cartPlus.dataset.cartIdx);
      cart[idx].quantity++;
      saveCart();
      renderAll();
      return;
    }

    // Carrinho: remover item
    const cartRemove = target.closest<HTMLElement>("[data-cart-remove]");
    if (cartRemove) {
      const idx = Number(cartRemove.dataset.cartIdx);
      removeCartItem(idx);
      return;
    }
  });

  /* ── Carrinho Panel ───────────────────────────────────── */
  cartBarOpen.addEventListener("click", () => {
    cartPanel.classList.add("is-open");
    document.body.style.overflow = "hidden";
  });

  function closeCartPanel() {
    cartPanel.classList.remove("is-open");
    document.body.style.overflow = "";
  }
  cartPanelClose.addEventListener("click", closeCartPanel);
  cartPanelOverlay.addEventListener("click", closeCartPanel);

  /* ── Checkout ─────────────────────────────────────────── */
  cartPanelCheckout.addEventListener("click", () => {
    closeCartPanel();
    setTimeout(() => {
      renderCheckoutSummary();
      checkoutModal.hidden = false;
      requestAnimationFrame(() => checkoutModal.classList.add("is-open"));
    }, 400);
  });

  function closeCheckoutModal() {
    checkoutModal.classList.remove("is-open");
    setTimeout(() => { checkoutModal.hidden = true; }, 350);
  }
  checkoutModalClose.addEventListener("click", closeCheckoutModal);
  checkoutModal.addEventListener("click", (e) => {
    if (e.target === checkoutModal) closeCheckoutModal();
  });

  function renderCheckoutSummary() {
    checkoutSummary.innerHTML = cart.map((item) => {
      const addonsText = item.addons.length > 0
        ? item.addons.map((a) => `+ ${a.name}`).join(", ")
        : "";
      return `<div class="checkout-summary__item">
        <span class="checkout-summary__item-name">
          ${item.quantity}x ${item.name}
          ${addonsText ? `<small>${addonsText}</small>` : ""}
        </span>
        <span class="checkout-summary__item-price">${fmt(itemTotal(item))}</span>
      </div>`;
    }).join("") + `<div class="checkout-summary__total">
      <span>Total</span><strong>${fmt(cartTotal())}</strong>
    </div>`;
  }

  checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(checkoutForm);
    const name = (fd.get("name") as string).trim();
    const address = (fd.get("address") as string).trim();
    const payment = fd.get("payment") as string;
    const notes = (fd.get("notes") as string || "").trim();
    if (!name || !address || !payment) return;

    const msg = buildWhatsAppMessage(name, address, payment, notes);
    window.open(WHATS_BASE + encodeURIComponent(msg), "_blank");

    // Limpar carrinho e fechar
    cart.length = 0;
    saveCart();
    renderAll();
    checkoutForm.reset();
    closeCheckoutModal();
  });

  function buildWhatsAppMessage(
    name: string, address: string, payment: string, notes: string
  ): string {
    const lines: string[] = [];
    lines.push("🍟 *Pedido Viking's Burguer*");
    lines.push("");
    lines.push(`👤 ${name}`);
    lines.push(`📍 ${address}`);
    lines.push("");
    lines.push("━━━━━━━━━━━━━━━━");

    cart.forEach((item) => {
      lines.push(`🍔 *${item.name}*`);
      if (item.addons.length > 0) {
        item.addons.forEach((a) => {
          lines.push(`   + ${a.name}`);
        });
      }
      lines.push(`   Qtd: ${item.quantity}`);
      lines.push("");
    });

    lines.push("━━━━━━━━━━━━━━━━");
    lines.push("");
    lines.push(`💳 Pagamento: ${payment}`);
    if (notes) lines.push(`📝 Obs: ${notes}`);

    return lines.join("\n");
  }

  /* ── Init: render state on load ──────────────────────── */
  renderAll();

  /* ── Ano do rodapé ────────────────────────────────────── */
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
