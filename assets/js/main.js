/* ==========================================================================
   COFFEE SITES PRO — MAIN.JS
   Template: Restaurante Premium
   Responsabilidade: núcleo de inicialização do site.
   Este arquivo NÃO deve conter lógica específica de menu, animações,
   galeria ou WhatsApp — cada uma dessas responsabilidades vive em seu
   próprio módulo (menu.js, animations.js, gallery.js, whatsapp.js).
   main.js apenas orquestra o boot da aplicação e resolve comportamentos
   globais e transversais ao site inteiro.
   ========================================================================== */

(() => {
  "use strict";

  /* ------------------------------------------------------------------------
     CONFIG GLOBAL
     Namespace único exposto em window para permitir que os demais módulos
     (menu.js, animations.js, gallery.js, whatsapp.js) leiam/registrem
     funcionalidades sem poluir o escopo global com variáveis soltas.
     ------------------------------------------------------------------------ */
  window.CoffeeSitesPro = window.CoffeeSitesPro || {
    config: {
      headerScrollThreshold: 40, // px de scroll para ativar header compacto
      smoothScrollOffset: 80,     // compensa altura do header fixo
    },
    modules: {}, // demais arquivos .js registram-se aqui (menu, gallery, etc.)
  };

  const App = window.CoffeeSitesPro;

  /* ------------------------------------------------------------------------
     UTILITÁRIOS COMPARTILHADOS
     Funções pequenas e puras, reutilizáveis pelos outros módulos do site.
     ------------------------------------------------------------------------ */
  App.utils = {
    /**
     * Seleciona um único elemento no DOM.
     * @param {string} selector
     * @param {ParentNode} scope
     */
    qs(selector, scope = document) {
      return scope.querySelector(selector);
    },

    /**
     * Seleciona múltiplos elementos e retorna um array (não NodeList).
     * @param {string} selector
     * @param {ParentNode} scope
     */
    qsa(selector, scope = document) {
      return Array.from(scope.querySelectorAll(selector));
    },

    /**
     * Debounce simples para eventos de alta frequência (scroll, resize).
     * @param {Function} fn
     * @param {number} wait
     */
    debounce(fn, wait = 150) {
      let timeoutId;
      return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(null, args), wait);
      };
    },

    /**
     * Carrega e faz o parse de um arquivo JSON da pasta assets/data/.
     * Utilizado pelos módulos que consomem cardapio.json, faq.json,
     * depoimentos.json e empresa.json.
     * @param {string} path
     * @returns {Promise<any|null>}
     */
    async loadJSON(path) {
      try {
        const response = await fetch(path, { cache: "no-cache" });
        if (!response.ok) {
          throw new Error(`Falha ao carregar ${path}: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error("[CoffeeSitesPro] Erro ao carregar JSON:", error);
        return null;
      }
    },
  };

  /* ------------------------------------------------------------------------
     HEADER — COMPORTAMENTO AO ROLAR A PÁGINA
     Adiciona a classe .header-scrolled quando o usuário rola a página,
     permitindo que o style.css/responsive.css apliquem um header mais
     compacto e com sombra mais pronunciada.
     ------------------------------------------------------------------------ */
  function initHeaderScroll() {
    const header = App.utils.qs("header");
    if (!header) return;

    const { headerScrollThreshold } = App.config;

    const onScroll = () => {
      if (window.scrollY > headerScrollThreshold) {
        header.classList.add("header-scrolled");
      } else {
        header.classList.remove("header-scrolled");
      }
    };

    window.addEventListener("scroll", App.utils.debounce(onScroll, 10), {
      passive: true,
    });

    onScroll(); // aplica estado correto caso a página já carregue rolada
  }

  /* ------------------------------------------------------------------------
     SCROLL SUAVE PARA ÂNCORAS INTERNAS
     Compensa a altura do header fixo (--header-height) ao navegar pelos
     links do menu (#hero, #sobre, #cardapio, etc.).
     ------------------------------------------------------------------------ */
  function initSmoothAnchors() {
    const anchors = App.utils.qsa('a[href^="#"]');
    if (!anchors.length) return;

    anchors.forEach((anchor) => {
      anchor.addEventListener("click", (event) => {
        const targetId = anchor.getAttribute("href");
        if (!targetId || targetId === "#") return;

        const target = App.utils.qs(targetId);
        if (!target) return;

        event.preventDefault();

        const offset = App.config.smoothScrollOffset;
        const targetPosition =
          target.getBoundingClientRect().top + window.scrollY - offset;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });

        // Fecha o menu mobile após navegação (se estiver aberto).
        // A própria classe é controlada pelo menu.js; aqui apenas
        // garantimos que ela seja removida ao clicar em qualquer âncora.
        const menu = App.utils.qs(".menu");
        if (menu && menu.classList.contains("menu-active")) {
          menu.classList.remove("menu-active");
          const toggle = App.utils.qs(".menu-toggle");
          if (toggle) toggle.classList.remove("is-open");
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     ANO DINÂMICO NO FOOTER
     Evita que o copyright fique desatualizado manualmente a cada ano.
     Funciona mesmo sem alterar o HTML: procura o texto "2026" dentro do
     footer e o substitui pelo ano atual, se existir um elemento marcado
     com [data-year] (preparado para uso futuro) ou o próprio parágrafo.
     ------------------------------------------------------------------------ */
  function initDynamicYear() {
    const yearTarget = App.utils.qs("[data-year]");
    const currentYear = new Date().getFullYear();

    if (yearTarget) {
      yearTarget.textContent = currentYear;
      return;
    }

    // Fallback: atualiza o texto do footer preservando o restante do conteúdo.
    const footerText = App.utils.qs("footer p");
    if (footerText) {
      footerText.innerHTML = footerText.innerHTML.replace(
        /\b\d{4}\b/,
        String(currentYear)
      );
    }
  }

  /* ------------------------------------------------------------------------
     BOOTSTRAP DA APLICAÇÃO
     Ponto único de entrada. Os demais arquivos (menu.js, animations.js,
     gallery.js, whatsapp.js) devem registrar suas próprias inicializações
     em App.modules e serem chamados aqui, mantendo a ordem de carregamento
     definida no index.html.
     ------------------------------------------------------------------------ */
  function init() {
    initHeaderScroll();
    initSmoothAnchors();
    initDynamicYear();

    // Inicializa módulos externos, caso já tenham sido registrados
    // (permite que main.js seja carregado antes ou depois dos demais
    // scripts sem quebrar a aplicação).
    Object.values(App.modules).forEach((module) => {
      if (module && typeof module.init === "function") {
        module.init();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
