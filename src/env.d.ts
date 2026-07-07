/* ═══════════════════════════════════════════════════════════
   Declarações ambientes das bibliotecas carregadas via CDN.
   Elas expõem globais em `window`; aqui damos a elas um contrato
   de tipos mínimo para o TypeScript trabalhar em modo estrito.
   ═══════════════════════════════════════════════════════════ */

interface GsapTween {
  kill(): void;
}

interface GsapTicker {
  add(cb: (time: number) => void): void;
  remove(cb: (time: number) => void): void;
  lagSmoothing(threshold: number, adjustedLag?: number): void;
}

interface GsapTimeline {
  from(target: unknown, vars: Record<string, unknown>, position?: string | number): GsapTimeline;
  to(target: unknown, vars: Record<string, unknown>, position?: string | number): GsapTimeline;
  fromTo(
    target: unknown,
    fromVars: Record<string, unknown>,
    toVars: Record<string, unknown>,
    position?: string | number
  ): GsapTimeline;
}

interface GsapStatic {
  registerPlugin(...plugins: unknown[]): void;
  timeline(vars?: Record<string, unknown>): GsapTimeline;
  to(target: unknown, vars: Record<string, unknown>): GsapTween;
  from(target: unknown, vars: Record<string, unknown>): GsapTween;
  fromTo(target: unknown, fromVars: Record<string, unknown>, toVars: Record<string, unknown>): GsapTween;
  set(target: unknown, vars: Record<string, unknown>): void;
  quickTo(target: unknown, property: string, vars: Record<string, unknown>): (value: number) => void;
  ticker: GsapTicker;
  utils: {
    toArray<T = Element>(value: unknown): T[];
    mapRange(
      inMin: number,
      inMax: number,
      outMin: number,
      outMax: number,
      value: number
    ): number;
  };
}

interface LenisOptions {
  lerp?: number;
  duration?: number;
  smoothWheel?: boolean;
  wheelMultiplier?: number;
  touchMultiplier?: number;
  syncTouch?: boolean;
  easing?: (t: number) => number;
}

declare class Lenis {
  constructor(options?: LenisOptions);
  raf(time: number): void;
  on(event: "scroll", handler: () => void): void;
  scrollTo(target: string | number | HTMLElement, options?: { offset?: number }): void;
  destroy(): void;
}

interface AosStatic {
  init(options?: Record<string, unknown>): void;
  refresh(): void;
}

interface ScrollTriggerStatic {
  update(): void;
  refresh(): void;
}

declare const gsap: GsapStatic;
declare const ScrollTrigger: ScrollTriggerStatic;
declare const AOS: AosStatic;

interface Window {
  Lenis?: typeof Lenis;
  gsap?: GsapStatic;
  AOS?: AosStatic;
}
