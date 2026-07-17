/* ==========================================================================
   COFFEE SITES PRO — ANIMATIONS.JS
   Template: Restaurante Premium
   Responsabilidade: animações discretas de entrada (scroll reveal) e
   microinterações visuais. Segue a diretriz do projeto: "Animações
   discretas. Hover elegante." — nada de exageros, apenas transições
   suaves que reforçam a sensação premium do layout.

   Este módulo NÃO cria elementos novos; apenas observa elementos já
   existentes no DOM e alterna classes CSS. As classes .reveal,
   .reveal-visible, .stagger-item etc. devem ter suas transições
   definidas em animations.css (próximo arquivo da fila, se necessário)
   ou em style.css/responsive.css.
   ========================================================================== */

(() => {
  "use strict";

  const App = window.CoffeeSitesPro;

  if (!App) {
    console.error(
      "[CoffeeSitesPro] main.js não foi carregado antes de animations.js."
    );
    return;
  }

  const { qs, qsa } = App.utils;

  const animationsModule = {
    revealTargets: [],
    countersDone: false,

    /**
     * Define quais elementos recebem animação de revelação ao entrar
     * na viewport. Seleciona por seletor semântico em vez de exigir que
     * o HTML já tenha sido marcado manualmente com classes .reveal,
     * mantendo o index.html intocado.
     */
    collectRevealTargets() {
      const selectors = [
        "main section .section-title",
        "main section .section-subtitle",
        ".hero-grid > *",
        ".card",
        ".grid > *",
      ];

      const targets = new Set();

      selectors.forEach((selector) => {
        qsa(selector).forEach((el) => targets.add(el));
      });

      return Array.from(targets);
    },

    /**
     * Prepara cada elemento com a classe base .reveal (estado inicial
     * oculto/deslocado) antes de observá-lo, evitando "flash" de conteúdo
     * totalmente visível antes da animação disparar.
     */
    prepareTargets(targets) {
      targets.forEach((el, index) => {
        el.classList.add("reveal");
        // pequeno atraso escalonado entre elementos irmãos, criando um
        // efeito de entrada em cascata sutil (stagger)
        const delay = (index % 6) * 80; // ms, limitado para não acumular demais
        el.style.setProperty("--reveal-delay", `${delay}ms`);
      });
    },

    /**
     * Observa os elementos preparados e adiciona .reveal-visible quando
     * entram na viewport, removendo o observer do elemento em seguida
     * (a animação acontece uma única vez, sem repetir ao rolar de volta).
     */
    observeTargets(targets) {
      if (!("IntersectionObserver" in window)) {
        // Fallback: navegadores muito antigos apenas exibem tudo direto.
        targets.forEach((el) => el.classList.add("reveal-visible"));
        return;
      }

      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("reveal-visible");
              obs.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.15,
          rootMargin: "0px 0px -8% 0px",
        }
      );

      targets.forEach((el) => observer.observe(el));
    },

    /**
     * Efeito de leve paralaxe na imagem do hero conforme o scroll,
     * discreto o suficiente para reforçar profundidade sem distrair.
     * Respeita prefers-reduced-motion.
     */
    initHeroParallax() {
      const heroImage = qs(".hero-image img");
      if (!heroImage) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReducedMotion) return;

      const onScroll = () => {
        const offset = window.scrollY * 0.06; // deslocamento sutil
        heroImage.style.transform = `translateY(${offset}px)`;
      };

      window.addEventListener("scroll", App.utils.debounce(onScroll, 10), {
        passive: true,
      });
    },

    /**
     * Aplica um leve efeito de "tilt" (inclinação 3D sutil) nos cards ao
     * passar o mouse — reforça o padrão "hover elegante" pedido no
     * briefing, sem exagero. Desativado em touch (mobile) automaticamente,
     * já que não há hover real nesses dispositivos.
     */
    initCardTilt() {
      const isTouchDevice = window.matchMedia("(hover: none)").matches;
      if (isTouchDevice) return;

      const cards = qsa(".card");
      if (!cards.length) return;

      const maxTilt = 4; // graus, mantém o efeito discreto

      cards.forEach((card) => {
        card.addEventListener("mousemove", (event) => {
          const rect = card.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;

          const percentX = x / rect.width - 0.5;
          const percentY = y / rect.height - 0.5;

          const rotateX = (-percentY * maxTilt).toFixed(2);
          const rotateY = (percentX * maxTilt).toFixed(2);

          card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });

        card.addEventListener("mouseleave", () => {
          card.style.transform = "";
        });
      });
    },

    /**
     * Ponto de entrada do módulo, chamado por main.js.
     */
    init() {
      this.revealTargets = this.collectRevealTargets();
      this.prepareTargets(this.revealTargets);
      this.observeTargets(this.revealTargets);

      this.initHeroParallax();
      this.initCardTilt();
    },
  };

  App.modules.animations = animationsModule;

  if (document.readyState !== "loading") {
    animationsModule.init();
  }
})();
