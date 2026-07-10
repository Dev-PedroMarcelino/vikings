"use strict";
/* ═══════════════════════════════════════════════════════════
   VIKING'S BURGUER — Motion & Interações (TypeScript)
   GSAP + ScrollTrigger · Lenis (scroll suave) · AOS · Canvas
   Compilado para js/main.js  (npm run build)
   ═══════════════════════════════════════════════════════════ */
(() => {
    "use strict";
    var _a, _b, _c, _d, _e;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const hasGsap = !!window.gsap && !prefersReducedMotion;
    /* ── Lenis: scroll suave (um único loop de rAF) ───────────
       Bug anterior: o Lenis era dirigido por DOIS loops de rAF ao
       mesmo tempo (um standalone + o ticker do GSAP), avançando o
       scroll em dobro por frame — daí a sensação de travado. Agora
       há uma única fonte de tempo: o ticker do GSAP quando presente,
       senão um rAF próprio.                                        */
    let lenis = null;
    if (window.Lenis && !prefersReducedMotion) {
        lenis = new Lenis({
            lerp: 0.11,
            wheelMultiplier: 1,
            smoothWheel: true,
            syncTouch: false,
            touchMultiplier: 1.6,
        });
        if (!hasGsap) {
            const raf = (time) => {
                lenis.raf(time);
                requestAnimationFrame(raf);
            };
            requestAnimationFrame(raf);
        }
    }
    /* ── Menu mobile ──────────────────────────────────────── */
    const burgerBtn = document.getElementById("burgerBtn");
    const nav = document.getElementById("nav");
    const closeMobileNav = () => {
        nav === null || nav === void 0 ? void 0 : nav.classList.remove("is-open");
        burgerBtn === null || burgerBtn === void 0 ? void 0 : burgerBtn.classList.remove("is-open");
        burgerBtn === null || burgerBtn === void 0 ? void 0 : burgerBtn.setAttribute("aria-expanded", "false");
    };
    burgerBtn === null || burgerBtn === void 0 ? void 0 : burgerBtn.addEventListener("click", () => {
        var _a;
        const open = (_a = nav === null || nav === void 0 ? void 0 : nav.classList.toggle("is-open")) !== null && _a !== void 0 ? _a : false;
        burgerBtn.classList.toggle("is-open", open);
        burgerBtn.setAttribute("aria-expanded", String(open));
    });
    /* ── Âncoras internas respeitam o scroll suave ────────── */
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", (e) => {
            const id = link.getAttribute("href");
            if (!id || id.length < 2)
                return;
            const target = document.querySelector(id);
            if (!target)
                return;
            e.preventDefault();
            if (lenis) {
                // Blocos do cardápio ficam sob o header + a barra sticky de
                // categorias, então precisam de um offset maior
                const offset = target.classList.contains("menu__block") ? -130 : -80;
                lenis.scrollTo(target, { offset });
            }
            else {
                target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
            }
            closeMobileNav();
        });
    });
    /* ── AOS: reveals por seção ───────────────────────────── */
    (_a = window.AOS) === null || _a === void 0 ? void 0 : _a.init({
        duration: 800,
        easing: "ease-out-cubic",
        once: true,
        offset: 60,
        disable: prefersReducedMotion,
    });
    /* ── Header: encolhe ao rolar ─────────────────────────── */
    const header = document.getElementById("header");
    const onScroll = () => {
        header === null || header === void 0 ? void 0 : header.classList.toggle("is-scrolled", window.scrollY > 40);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    /* ── GSAP: hero, parallax e contadores ────────────────── */
    if (hasGsap) {
        gsap.registerPlugin(ScrollTrigger);
        if (lenis) {
            lenis.on("scroll", ScrollTrigger.update);
            gsap.ticker.add((time) => lenis.raf(time * 1000));
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
        gsap.fromTo(".cta__img", { yPercent: -10 }, {
            yPercent: 10,
            ease: "none",
            scrollTrigger: { trigger: ".cta", start: "top bottom", end: "bottom top", scrub: true },
        });
        // Vegvísir: bússola nórdica que gira conforme o scroll
        gsap.utils.toArray(".vegvisir").forEach((el) => {
            gsap.to(el, {
                rotation: 220,
                ease: "none",
                scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1.2 },
            });
        });
        // Contadores animados
        document.querySelectorAll(".counter").forEach((el) => {
            var _a, _b;
            const target = parseFloat((_a = el.dataset.target) !== null && _a !== void 0 ? _a : "0");
            const decimals = parseInt((_b = el.dataset.decimals) !== null && _b !== void 0 ? _b : "0", 10);
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
    }
    else {
        // Sem GSAP: garante contadores com o valor final
        document.querySelectorAll(".counter").forEach((el) => {
            var _a, _b;
            const decimals = parseInt((_a = el.dataset.decimals) !== null && _a !== void 0 ? _a : "0", 10);
            el.textContent = parseFloat((_b = el.dataset.target) !== null && _b !== void 0 ? _b : "0").toFixed(decimals).replace(".", ",");
        });
    }
    /* ── Decodificação rúnica: runas se transformam em letras ─
       Aplicada aos rótulos curtos (kickers e títulos do cardápio).
       Anima apenas o último nó de texto do elemento, preservando
       ícones/spans internos.                                       */
    const RUNES = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟᛥᚾ";
    const randomRune = () => RUNES[(Math.random() * RUNES.length) | 0];
    const decodeTextNode = (node) => {
        var _a;
        const finalText = (_a = node.nodeValue) !== null && _a !== void 0 ? _a : "";
        const chars = [...finalText];
        const total = chars.length;
        if (!total)
            return;
        const durationPerChar = 42; // ms que cada caractere leva para "assentar"
        const stagger = 55;
        const start = performance.now();
        const frame = (now) => {
            const elapsed = now - start;
            let settled = 0;
            const out = chars.map((ch, i) => {
                if (ch === " ")
                    return " ";
                const charStart = i * stagger;
                const progress = elapsed - charStart;
                if (progress >= durationPerChar) {
                    settled++;
                    return ch;
                }
                if (progress < 0)
                    return "";
                return randomRune();
            });
            node.nodeValue = out.join("");
            if (settled < total) {
                requestAnimationFrame(frame);
            }
            else {
                node.nodeValue = finalText;
            }
        };
        requestAnimationFrame(frame);
    };
    const lastTextNode = (el) => {
        var _a;
        for (let i = el.childNodes.length - 1; i >= 0; i--) {
            const child = el.childNodes[i];
            if (child.nodeType === Node.TEXT_NODE && ((_a = child.nodeValue) !== null && _a !== void 0 ? _a : "").trim().length > 0) {
                return child;
            }
        }
        return null;
    };
    const scrambleTargets = document.querySelectorAll(".section__kicker, .menu__heading, .launch__kicker");
    if (scrambleTargets.length && !prefersReducedMotion && "IntersectionObserver" in window) {
        const runeObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting)
                    return;
                const node = lastTextNode(entry.target);
                if (node)
                    decodeTextNode(node);
                obs.unobserve(entry.target);
            });
        }, { threshold: 0.6 });
        scrambleTargets.forEach((el) => runeObserver.observe(el));
    }
    /* ── Botões magnéticos: o CTA é atraído pelo cursor ─────── */
    if (canHover && !prefersReducedMotion) {
        document.querySelectorAll("[data-magnetic]").forEach((btn) => {
            const strength = 0.35;
            const moveX = hasGsap ? gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3" }) : null;
            const moveY = hasGsap ? gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3" }) : null;
            btn.addEventListener("pointermove", (e) => {
                const rect = btn.getBoundingClientRect();
                const relX = (e.clientX - rect.left - rect.width / 2) * strength;
                const relY = (e.clientY - rect.top - rect.height / 2) * strength;
                if (moveX && moveY) {
                    moveX(relX);
                    moveY(relY);
                }
                else {
                    btn.style.transform = `translate(${relX}px, ${relY}px)`;
                }
            });
            btn.addEventListener("pointerleave", () => {
                if (moveX && moveY) {
                    moveX(0);
                    moveY(0);
                }
                else {
                    btn.style.transform = "";
                }
            });
        });
    }
    /* ── Tilt 3D nos cards ao passar o mouse ───────────────── */
    if (canHover && !prefersReducedMotion) {
        const MAX_TILT = 6; // graus
        document.querySelectorAll(".card, .feature").forEach((card) => {
            card.addEventListener("pointermove", (e) => {
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
    const inlineVideos = document.querySelectorAll("video[data-inline]");
    if (inlineVideos.length && "IntersectionObserver" in window) {
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const video = entry.target;
                if (entry.isIntersecting && !prefersReducedMotion) {
                    const p = video.play();
                    if (p)
                        p.catch(() => undefined);
                }
                else {
                    video.pause();
                }
            });
        }, { threshold: 0.35 });
        inlineVideos.forEach((v) => videoObserver.observe(v));
    }
    /* ── Vídeo do hero: loop com crossfade suave ──────────────
       Roda mesmo com prefers-reduced-motion: o vídeo é o fundo da
       marca (sem ele só resta a imagem estática) e sem este bloco
       ele ficava eternamente com opacity 0, baixando à toa.        */
    const heroVideo = document.getElementById("heroVideo");
    if (heroVideo) {
        heroVideo.removeAttribute("loop"); // o loop nativo dá corte seco
        const hero = document.querySelector(".hero");
        const FADE_AHEAD = 1.0;
        const FADE_MS = 900;
        let active = heroVideo;
        let standby = heroVideo.cloneNode();
        standby.removeAttribute("autoplay");
        standby.removeAttribute("id");
        standby.classList.remove("is-active");
        (_b = heroVideo.parentElement) === null || _b === void 0 ? void 0 : _b.appendChild(standby);
        let swapping = false;
        const crossfade = () => {
            if (swapping)
                return;
            swapping = true;
            standby.currentTime = 0;
            const playing = standby.play();
            (playing !== null && playing !== void 0 ? playing : Promise.resolve())
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
        const armCrossfade = (v) => {
            v.addEventListener("timeupdate", () => {
                if (v !== active || !v.duration)
                    return;
                if (v.duration - v.currentTime > FADE_AHEAD)
                    return;
                crossfade();
            });
            v.addEventListener("ended", () => {
                if (v === active)
                    crossfade();
            });
        };
        armCrossfade(heroVideo);
        armCrossfade(standby);
        heroVideo.addEventListener("playing", () => {
            heroVideo.classList.add("is-active");
            hero === null || hero === void 0 ? void 0 : hero.classList.add("has-video");
        }, { once: true });
        const autoplayAttempt = heroVideo.play();
        if (autoplayAttempt) {
            autoplayAttempt.catch(() => {
                window.addEventListener("pointerdown", () => {
                    const retry = heroVideo.play();
                    if (retry)
                        retry.catch(() => undefined);
                }, { once: true });
            });
        }
        // Pausa o vídeo quando o hero sai da tela (performance)
        new IntersectionObserver(([entry]) => {
            if (!(hero === null || hero === void 0 ? void 0 : hero.classList.contains("has-video")))
                return;
            if (entry.isIntersecting) {
                const resume = active.play();
                if (resume)
                    resume.catch(() => undefined);
            }
            else if (!swapping) {
                active.pause();
            }
        }, { threshold: 0 }).observe(hero);
    }
    /* ── Reel "vikings def": vídeo → logo → vídeo, em loop ────
       Quando o vídeo termina, a logo entra com um efeito de
       revelação; após um intervalo, o vídeo recomeça do zero.     */
    const reel = document.getElementById("reel");
    const reelVideo = document.getElementById("reelVideo");
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
                    if (p)
                        p.catch(() => undefined);
                }
            }, LOGO_MS);
        });
        // Toca só quando a seção está visível (sem brigar com o interlúdio)
        const playIfIdle = () => {
            if (!reelVisible || reel.classList.contains("is-logo"))
                return;
            const p = reelVideo.play();
            if (p)
                p.catch(() => undefined);
        };
        if ("IntersectionObserver" in window) {
            new IntersectionObserver(([entry]) => {
                reelVisible = entry.isIntersecting;
                if (reelVisible) {
                    playIfIdle();
                }
                else {
                    reelVideo.pause();
                }
            }, { threshold: 0.3 }).observe(reel);
        }
        else {
            playIfIdle();
        }
    }
    /* ── Brasas: partículas no hero ───────────────────────── */
    const canvas = document.getElementById("embers");
    const ctx = (_c = canvas === null || canvas === void 0 ? void 0 : canvas.getContext("2d")) !== null && _c !== void 0 ? _c : null;
    if (canvas && ctx && !prefersReducedMotion) {
        let running = true;
        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resize();
        window.addEventListener("resize", resize);
        const COLORS = ["255,107,44", "232,93,38", "201,162,75", "166,58,43"];
        const spawn = () => ({
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
        const particles = [];
        for (let i = 0; i < COUNT; i++) {
            const p = spawn();
            p.y = Math.random() * canvas.height;
            particles.push(p);
        }
        const tick = () => {
            if (!running)
                return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p, i) => {
                p.x += p.vx + Math.sin(p.flicker) * 0.25;
                p.y += p.vy;
                p.flicker += 0.05;
                p.life -= p.decay;
                if (p.life <= 0 || p.y < -12)
                    particles[i] = spawn();
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
        new IntersectionObserver(([entry]) => {
            const wasRunning = running;
            running = entry.isIntersecting;
            if (running && !wasRunning)
                tick();
        }, { threshold: 0 }).observe(canvas);
    }
    /* ── Scrollspy das categorias do cardápio ─────────────── */
    const pills = document.querySelectorAll(".menu__pill");
    const blocks = document.querySelectorAll(".menu__block");
    if (pills.length && "IntersectionObserver" in window) {
        const spy = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting)
                    return;
                pills.forEach((p) => p.classList.toggle("is-active", p.getAttribute("href") === "#" + entry.target.id));
            });
        }, { rootMargin: "-35% 0px -55% 0px" });
        blocks.forEach((b) => spy.observe(b));
    }
    /* ── Carrossel de depoimentos ─────────────────────────── */
    const track = document.getElementById("carouselTrack");
    if (track) {
        const slides = track.children;
        const dotsWrap = document.getElementById("carouselDots");
        let index = 0;
        let timer = 0;
        const go = (i, manual) => {
            index = (i + slides.length) % slides.length;
            track.style.transform = `translateX(-${index * 100}%)`;
            if (dotsWrap) {
                for (let d = 0; d < dotsWrap.children.length; d++) {
                    dotsWrap.children[d].classList.toggle("is-active", d === index);
                }
            }
            if (manual)
                restart();
        };
        const restart = () => {
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
        (_d = document.getElementById("prevBtn")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", () => go(index - 1, true));
        (_e = document.getElementById("nextBtn")) === null || _e === void 0 ? void 0 : _e.addEventListener("click", () => go(index + 1, true));
        let startX = 0;
        track.addEventListener("touchstart", (e) => (startX = e.touches[0].clientX), {
            passive: true,
        });
        track.addEventListener("touchend", (e) => {
            const dx = e.changedTouches[0].clientX - startX;
            if (Math.abs(dx) > 45)
                go(index + (dx < 0 ? 1 : -1), true);
        }, { passive: true });
        restart();
    }
    /* ── Mapa: injetado só quando a seção aparece ─────────── */
    const mapContainer = document.getElementById("mapContainer");
    if (mapContainer) {
        const loadMap = () => {
            var _a;
            if (mapContainer.querySelector("iframe"))
                return;
            const iframe = document.createElement("iframe");
            iframe.src = (_a = mapContainer.dataset.mapSrc) !== null && _a !== void 0 ? _a : "";
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
            const mapObserver = new IntersectionObserver(([entry]) => {
                if (entry.isIntersecting) {
                    loadMap();
                    mapObserver.disconnect();
                }
            }, { rootMargin: "400px" });
            mapObserver.observe(mapContainer);
        }
        else {
            loadMap();
        }
    }
    /* ── WhatsApp: mensagem personalizada por produto ─────── */
    const WHATS_BASE = "https://wa.me/5519996979642?text=";
    document.querySelectorAll("[data-item]").forEach((btn) => {
        const msg = `Olá! Vim pelo site e quero pedir: ${btn.dataset.item} 🍔`;
        btn.href = WHATS_BASE + encodeURIComponent(msg);
    });
    /* ── Ano do rodapé ────────────────────────────────────── */
    const year = document.getElementById("year");
    if (year)
        year.textContent = String(new Date().getFullYear());
})();
