/* ==========================================================================
   COFFEE SITES PRO — GALLERY.JS
   Template: Restaurante Premium
   Responsabilidade: renderizar a galeria de fotos (#galeria .grid) e
   fornecer um lightbox acessível para visualização ampliada.

   Observação de arquitetura: o projeto ainda não possui um galeria.json
   dedicado (apenas empresa.json, cardapio.json, faq.json e
   depoimentos.json estão previstos). Por isso este módulo aceita duas
   fontes de dados, nesta ordem de prioridade:

     1) Imagens já presentes no HTML dentro de #galeria .grid
        (ex.: <img src="..." alt="..."> inseridos manualmente).
     2) Um array de fallback (GALLERY_FALLBACK) apontando para
        assets/images/galeria/, útil em demos rápidas para clientes
        antes de existir um JSON de galeria dedicado.

   Quando um galeria.json for criado futuramente, basta estender
   loadGalleryData() para tentar App.utils.loadJSON("assets/data/galeria.json")
   antes do fallback, sem alterar o restante do módulo.
   ========================================================================== */

(() => {
  "use strict";

  const App = window.CoffeeSitesPro;

  if (!App) {
    console.error(
      "[CoffeeSitesPro] main.js não foi carregado antes de gallery.js."
    );
    return;
  }

  const { qs, qsa } = App.utils;

  // Fallback usado apenas se a seção #galeria estiver vazia no HTML e
  // nenhum assets/data/galeria.json existir ainda. Ajuste os arquivos conforme
  // as fotos reais do cliente forem entrando em assets/images/galeria/.
  const GALLERY_FALLBACK = [
    { src: "assets/images/galeria/01.png", alt: "Ambiente do restaurante" },
    { src: "assets/images/galeria/02.png", alt: "Prato especial da casa" },
    { src: "assets/images/galeria/03.png", alt: "Salão principal" },
    { src: "assets/images/galeria/04.png", alt: "Detalhe da decoração" },
    { src: "assets/images/galeria/05.png", alt: "Equipe em preparo" },
    { src: "assets/images/galeria/06.png", alt: "Área externa" },
  ];

  const galleryModule = {
    container: null,
    images: [],
    lightbox: null,
    lightboxImg: null,
    lightboxCaption: null,
    currentIndex: 0,

    /**
     * Retorna as imagens já existentes no HTML (se houver) ou o fallback.
     */
    async loadGalleryData() {
      const existingImages = qsa("img", this.container);
      if (existingImages.length) {
        return existingImages.map((img) => ({
          src: img.getAttribute("src"),
          alt: img.getAttribute("alt") || "",
        }));
      }
      return GALLERY_FALLBACK;
    },

    /**
     * Renderiza os itens da galeria dentro de #galeria .grid, envolvendo
     * cada imagem em um <button> para acessibilidade via teclado.
     */
    renderGallery(items) {
      this.container.innerHTML = "";

      items.forEach((item, index) => {
        const figure = document.createElement("figure");
        figure.className = "card gallery-item";

        const button = document.createElement("button");
        button.type = "button";
        button.className = "gallery-trigger";
        button.setAttribute("aria-label", `Ampliar imagem: ${item.alt}`);
        button.dataset.index = String(index);

        const img = document.createElement("img");
        img.src = item.src;
        img.alt = item.alt;
        img.loading = "lazy";
        img.decoding = "async";

        button.appendChild(img);
        figure.appendChild(button);
        this.container.appendChild(figure);

        button.addEventListener("click", () => this.openLightbox(index));
      });

      this.images = items;
    },

    /**
     * Cria a estrutura do lightbox uma única vez e a anexa ao final do body.
     */
    buildLightbox() {
      const overlay = document.createElement("div");
      overlay.className = "lightbox";
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");
      overlay.setAttribute("aria-label", "Visualização ampliada da galeria");
      overlay.hidden = true;

      overlay.innerHTML = `
        <button type="button" class="lightbox-close" aria-label="Fechar galeria">&times;</button>
        <button type="button" class="lightbox-prev" aria-label="Imagem anterior">&#8249;</button>
        <figure class="lightbox-figure">
          <img class="lightbox-img" alt="">
          <figcaption class="lightbox-caption"></figcaption>
        </figure>
        <button type="button" class="lightbox-next" aria-label="Próxima imagem">&#8250;</button>
      `;

      document.body.appendChild(overlay);

      this.lightbox = overlay;
      this.lightboxImg = qs(".lightbox-img", overlay);
      this.lightboxCaption = qs(".lightbox-caption", overlay);

      qs(".lightbox-close", overlay).addEventListener("click", () =>
        this.closeLightbox()
      );
      qs(".lightbox-prev", overlay).addEventListener("click", () =>
        this.showRelative(-1)
      );
      qs(".lightbox-next", overlay).addEventListener("click", () =>
        this.showRelative(1)
      );

      // Fecha ao clicar fora da imagem (na área escura do overlay)
      overlay.addEventListener("click", (event) => {
        if (event.target === overlay) {
          this.closeLightbox();
        }
      });
    },

    /**
     * Atualiza a imagem/legenda exibida no lightbox.
     */
    renderLightboxContent() {
      const item = this.images[this.currentIndex];
      if (!item) return;

      this.lightboxImg.src = item.src;
      this.lightboxImg.alt = item.alt;
      this.lightboxCaption.textContent = item.alt;
    },

    openLightbox(index) {
      this.currentIndex = index;
      this.renderLightboxContent();
      this.lightbox.hidden = false;
      document.body.style.overflow = "hidden";
      qs(".lightbox-close", this.lightbox).focus();

      document.addEventListener("keydown", this.handleKeydown);
    },

    closeLightbox() {
      this.lightbox.hidden = true;
      document.body.style.overflow = "";
      document.removeEventListener("keydown", this.handleKeydown);
    },

    /**
     * Navega para a imagem anterior/próxima, com loop no início/fim.
     * @param {number} direction -1 para anterior, 1 para próxima
     */
    showRelative(direction) {
      const total = this.images.length;
      this.currentIndex = (this.currentIndex + direction + total) % total;
      this.renderLightboxContent();
    },

    /**
     * Handler de teclado do lightbox (setas e Esc), vinculado com
     * arrow function para preservar o "this" ao remover o listener.
     */
    handleKeydown: null, // definido em init() para permitir bind correto

    /**
     * Ponto de entrada do módulo, chamado por main.js.
     */
    async init() {
      this.container = qs("#galeria .grid");
      if (!this.container) return;

      this.handleKeydown = (event) => {
        if (event.key === "Escape") this.closeLightbox();
        if (event.key === "ArrowLeft") this.showRelative(-1);
        if (event.key === "ArrowRight") this.showRelative(1);
      };

      const items = await this.loadGalleryData();
      this.renderGallery(items);
      this.buildLightbox();
    },
  };

  App.modules.gallery = galleryModule;

  if (document.readyState !== "loading") {
    galleryModule.init();
  }
})();
