/* ==========================================================================
   COFFEE SITES PRO — CONTENT.JS
   Template: Restaurante Premium
   Responsabilidade: consumir assets/data/cardapio.json, assets/data/faq.json e
   assets/data/depoimentos.json e renderizar as seções #destaques, #cardapio,
   #faq e #depoimentos, que hoje existem no index.html como contêineres
   vazios. Este módulo fecha o ciclo "dados fora do HTML" definido no
   briefing do framework.

   Depende de main.js (App.utils.qs/qsa/loadJSON) já carregado antes.
   ========================================================================== */

(() => {
  "use strict";

  const App = window.CoffeeSitesPro;

  if (!App) {
    console.error(
      "[CoffeeSitesPro] main.js não foi carregado antes de content.js."
    );
    return;
  }

  const { qs, qsa, loadJSON } = App.utils;

  const contentModule = {
    cardapioData: null,
    faqData: null,
    depoimentosData: null,

    /**
     * Formata um número como moeda brasileira (R$ 00,00).
     * @param {number} value
     */
    formatPrice(value) {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);
    },

    /**
     * Constrói o card de um item de cardápio (usado tanto em #destaques
     * quanto na listagem completa em #cardapio).
     * @param {object} item
     */
    buildDishCard(item) {
      const card = document.createElement("article");
      card.className = "card dish-card";

      const tagsHTML = (item.tags || [])
        .map((tag) => `<span class="dish-tag">${tag}</span>`)
        .join("");

      card.innerHTML = `
        <div class="dish-card-image">
          <img src="${item.imagem}" alt="${item.nome}" loading="lazy" decoding="async">
        </div>
        <div class="dish-card-body">
          <div class="dish-card-header">
            <h3 class="dish-card-title">${item.nome}</h3>
            <span class="dish-card-price">${this.formatPrice(item.preco)}</span>
          </div>
          <p class="dish-card-description">${item.descricao}</p>
          ${tagsHTML ? `<div class="dish-card-tags">${tagsHTML}</div>` : ""}
        </div>
      `;

      return card;
    },

    /**
     * Renderiza os pratos marcados com "destaque": true dentro de
     * #destaques .grid, reunindo-os de todas as categorias do cardápio.
     */
    renderDestaques() {
      const container = qs("#destaques .grid");
      if (!container || !this.cardapioData) return;

      const destaques = this.cardapioData.categorias
        .flatMap((categoria) => categoria.itens)
        .filter((item) => item.destaque);

      if (!destaques.length) return;

      container.innerHTML = "";
      destaques.forEach((item) => {
        container.appendChild(this.buildDishCard(item));
      });
    },

    /**
     * Renderiza o cardápio completo dentro de #menu-content, com
     * navegação por categoria (abas) e grade de pratos por categoria.
     */
    renderCardapio() {
      const container = qs("#menu-content");
      if (!container || !this.cardapioData) return;

      const { categorias } = this.cardapioData;
      container.innerHTML = "";

      // Abas de categoria
      const tabsNav = document.createElement("div");
      tabsNav.className = "menu-tabs";
      tabsNav.setAttribute("role", "tablist");

      // Painéis de conteúdo por categoria
      const panelsWrapper = document.createElement("div");
      panelsWrapper.className = "menu-panels";

      categorias.forEach((categoria, index) => {
        const isActive = index === 0;

        // Botão da aba
        const tabButton = document.createElement("button");
        tabButton.type = "button";
        tabButton.className = "menu-tab" + (isActive ? " is-active" : "");
        tabButton.textContent = categoria.nome;
        tabButton.setAttribute("role", "tab");
        tabButton.setAttribute("aria-selected", String(isActive));
        tabButton.dataset.categoryId = categoria.id;
        tabsNav.appendChild(tabButton);

        // Painel da categoria
        const panel = document.createElement("div");
        panel.className = "menu-panel" + (isActive ? " is-active" : "");
        panel.setAttribute("role", "tabpanel");
        panel.dataset.categoryId = categoria.id;

        const grid = document.createElement("div");
        grid.className = "grid";
        categoria.itens.forEach((item) => {
          grid.appendChild(this.buildDishCard(item));
        });

        panel.appendChild(grid);
        panelsWrapper.appendChild(panel);

        tabButton.addEventListener("click", () => {
          qsa(".menu-tab", tabsNav).forEach((btn) => {
            btn.classList.remove("is-active");
            btn.setAttribute("aria-selected", "false");
          });
          qsa(".menu-panel", panelsWrapper).forEach((pnl) =>
            pnl.classList.remove("is-active")
          );

          tabButton.classList.add("is-active");
          tabButton.setAttribute("aria-selected", "true");
          panel.classList.add("is-active");
        });
      });

      container.appendChild(tabsNav);
      container.appendChild(panelsWrapper);
    },

    /**
     * Renderiza a lista de perguntas frequentes como um acordeão acessível
     * usando <details>/<summary> nativos (sem depender de JS para abrir/
     * fechar, apenas para popular o conteúdo).
     */
    renderFAQ() {
      const container = qs("#faq-list");
      if (!container || !this.faqData) return;

      container.innerHTML = "";

      this.faqData.perguntas.forEach((item) => {
        const details = document.createElement("details");
        details.className = "faq-item";

        const summary = document.createElement("summary");
        summary.className = "faq-question";
        summary.textContent = item.pergunta;

        const answer = document.createElement("p");
        answer.className = "faq-answer";
        answer.textContent = item.resposta;

        details.appendChild(summary);
        details.appendChild(answer);
        container.appendChild(details);
      });
    },

    /**
     * Constrói a representação visual da nota (estrelas) de um depoimento.
     * @param {number} nota de 0 a 5
     */
    buildStars(nota) {
      const fullStar = "★";
      const emptyStar = "☆";
      const rounded = Math.round(nota);
      return fullStar.repeat(rounded) + emptyStar.repeat(5 - rounded);
    },

    /**
     * Renderiza os depoimentos de clientes dentro de #depoimentos .grid.
     */
    renderDepoimentos() {
      const container = qs("#depoimentos .grid");
      if (!container || !this.depoimentosData) return;

      container.innerHTML = "";

      this.depoimentosData.depoimentos.forEach((dep) => {
        const card = document.createElement("article");
        card.className = "card testimonial-card";

        card.innerHTML = `
          <div class="testimonial-header">
            <img class="testimonial-photo" src="${dep.foto}" alt="${dep.nome}" loading="lazy" decoding="async">
            <div>
              <h3 class="testimonial-name">${dep.nome}</h3>
              <span class="testimonial-stars" aria-label="Nota ${dep.nota} de 5">${this.buildStars(dep.nota)}</span>
            </div>
          </div>
          <p class="testimonial-text">"${dep.texto}"</p>
          <span class="testimonial-source">${dep.origem}</span>
        `;

        container.appendChild(card);
      });
    },

    /**
     * Dispara o reveal-on-scroll (animations.js) para os elementos recém
     * inseridos no DOM, já que eles não existiam quando animations.js
     * fez sua varredura inicial na carga da página.
     */
    refreshAnimations() {
      const animationsModule = App.modules.animations;
      if (animationsModule && typeof animationsModule.init === "function") {
        animationsModule.init();
      }
    },

    /**
     * Ponto de entrada do módulo, chamado por main.js.
     */
    async init() {
      const [cardapio, faq, depoimentos] = await Promise.all([
        loadJSON("assets/data/cardapio.json"),
        loadJSON("assets/data/faq.json"),
        loadJSON("assets/data/depoimentos.json"),
      ]);

      this.cardapioData = cardapio;
      this.faqData = faq;
      this.depoimentosData = depoimentos;

      if (this.cardapioData) {
        this.renderDestaques();
        this.renderCardapio();
      }
      if (this.faqData) {
        this.renderFAQ();
      }
      if (this.depoimentosData) {
        this.renderDepoimentos();
      }

      this.refreshAnimations();
    },
  };

  App.modules.content = contentModule;

  if (document.readyState !== "loading") {
    contentModule.init();
  }
})();
