/* ==========================================================================
   COFFEE SITES PRO — MENU.JS
   Template: Restaurante Premium
   Responsabilidade: navegação — menu mobile (hambúrguer) e estado ativo
   do link correspondente à seção visível (scrollspy leve).

   Este módulo injeta dinamicamente o botão .menu-toggle dentro da <nav>,
   sem exigir alteração manual do index.html já entregue. Ele se registra
   em window.CoffeeSitesPro.modules.menu e é inicializado por main.js.
   ========================================================================== */

(() => {
  "use strict";

  const App = window.CoffeeSitesPro;

  if (!App) {
    console.error(
      "[CoffeeSitesPro] main.js não foi carregado antes de menu.js."
    );
    return;
  }

  const { qs, qsa } = App.utils;

  const menuModule = {
    nav: null,
    menu: null,
    toggle: null,
    menuLinks: [],
    sections: [],

    /**
     * Cria o botão hambúrguer e o insere na <nav>, antes do <ul class="menu">
     * ou do botão de CTA, mantendo a ordem visual definida no responsive.css.
     */
    buildToggleButton() {
      const toggle = document.createElement("button");
      toggle.className = "menu-toggle";
      toggle.setAttribute("type", "button");
      toggle.setAttribute("aria-label", "Abrir menu de navegação");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-controls", "site-menu");

      // Três barras do ícone hambúrguer (estilizadas em responsive.css)
      for (let i = 0; i < 3; i += 1) {
        toggle.appendChild(document.createElement("span"));
      }

      return toggle;
    },

    /**
     * Abre o menu mobile.
     */
    openMenu() {
      this.menu.classList.add("menu-active");
      this.toggle.classList.add("is-open");
      this.toggle.setAttribute("aria-expanded", "true");
      this.toggle.setAttribute("aria-label", "Fechar menu de navegação");
      document.body.style.overflow = "hidden"; // evita scroll atrás do menu
    },

    /**
     * Fecha o menu mobile.
     */
    closeMenu() {
      this.menu.classList.remove("menu-active");
      this.toggle.classList.remove("is-open");
      this.toggle.setAttribute("aria-expanded", "false");
      this.toggle.setAttribute("aria-label", "Abrir menu de navegação");
      document.body.style.overflow = "";
    },

    /**
     * Alterna entre aberto/fechado.
     */
    toggleMenu() {
      const isOpen = this.menu.classList.contains("menu-active");
      if (isOpen) {
        this.closeMenu();
      } else {
        this.openMenu();
      }
    },

    /**
     * Fecha o menu automaticamente quando a tela é redimensionada para
     * um breakpoint onde o menu já é exibido horizontalmente (>= 768px),
     * evitando que o estado "aberto" fique preso ao girar o dispositivo.
     */
    handleResize() {
      if (window.innerWidth >= 768) {
        this.closeMenu();
      }
    },

    /**
     * Fecha o menu ao clicar fora dele (overlay implícito: qualquer clique
     * fora da <nav> enquanto o menu estiver ativo).
     */
    handleOutsideClick(event) {
      const clickedInsideNav = this.nav.contains(event.target);
      const isOpen = this.menu.classList.contains("menu-active");

      if (isOpen && !clickedInsideNav) {
        this.closeMenu();
      }
    },

    /**
     * Fecha o menu ao pressionar Esc — acessibilidade via teclado.
     */
    handleEscKey(event) {
      if (event.key === "Escape") {
        this.closeMenu();
      }
    },

    /**
     * Scrollspy leve: marca o link do menu correspondente à seção
     * atualmente visível com a classe .menu-link-active.
     */
    initScrollSpy() {
      if (!("IntersectionObserver" in window) || !this.sections.length) {
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const id = entry.target.getAttribute("id");
            this.menuLinks.forEach((link) => {
              const isMatch = link.getAttribute("href") === `#${id}`;
              link.classList.toggle("menu-link-active", isMatch);
            });
          });
        },
        {
          rootMargin: "-45% 0px -45% 0px", // dispara quando a seção cruza o centro da viewport
          threshold: 0,
        }
      );

      this.sections.forEach((section) => observer.observe(section));
    },

    /**
     * Ponto de entrada do módulo, chamado por main.js.
     */
    init() {
      this.nav = qs("header nav");
      this.menu = qs(".menu");

      if (!this.nav || !this.menu) {
        console.warn("[CoffeeSitesPro] menu.js: <nav> ou .menu não encontrado.");
        return;
      }

      this.menu.setAttribute("id", "site-menu");

      this.toggle = this.buildToggleButton();
      this.nav.insertBefore(this.toggle, this.menu);

      this.menuLinks = qsa("a", this.menu);
      this.sections = qsa("main section[id]");

      this.toggle.addEventListener("click", () => this.toggleMenu());
      document.addEventListener("click", (event) =>
        this.handleOutsideClick(event)
      );
      document.addEventListener("keydown", (event) => this.handleEscKey(event));
      window.addEventListener(
        "resize",
        App.utils.debounce(() => this.handleResize(), 150)
      );

      this.initScrollSpy();
    },
  };

  App.modules.menu = menuModule;

  // Caso menu.js seja carregado depois do DOMContentLoaded já disparado
  // por main.js (ex.: ordem de scripts alterada), garante inicialização.
  if (document.readyState !== "loading") {
    menuModule.init();
  }
})();
