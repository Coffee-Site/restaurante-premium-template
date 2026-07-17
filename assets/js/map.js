/* ==========================================================================
   COFFEE SITES PRO — MAP.JS
   Template: Restaurante Premium
   Responsabilidade: renderizar o mapa de localização dentro de #mapa,
   usando os dados de assets/data/empresa.json (latitude/longitude/endereço).

   Implementação via iframe do Google Maps no formato "output=embed",
   que NÃO exige chave de API — ideal para o modelo de negócio do
   framework (demonstração rápida e gratuita no Cloudflare Pages antes
   da aprovação do cliente). Caso o cliente futuramente queira recursos
   avançados (rotas, múltiplos marcadores), a Google Maps JavaScript API
   pode substituir este módulo sem afetar o restante do site.
   ========================================================================== */

(() => {
  "use strict";

  const App = window.CoffeeSitesPro;

  if (!App) {
    console.error("[CoffeeSitesPro] main.js não foi carregado antes de map.js.");
    return;
  }

  const { qs, loadJSON } = App.utils;

  const mapModule = {
    container: null,

    /**
     * Monta a URL de embed do Google Maps a partir de coordenadas,
     * sem necessidade de API key (parâmetro output=embed).
     * @param {number} lat
     * @param {number} lng
     * @param {number} zoom
     */
    buildEmbedUrl(lat, lng, zoom = 15) {
      return `https://www.google.com/maps?q=${lat},${lng}&hl=pt-BR&z=${zoom}&output=embed`;
    },

    /**
     * Monta o endereço completo em uma única linha legível, a partir do
     * objeto "endereco" de empresa.json.
     * @param {object} endereco
     */
    formatAddress(endereco) {
      const partes = [
        endereco.logradouro,
        endereco.bairro,
        `${endereco.cidade} - ${endereco.estado}`,
        endereco.cep,
      ].filter(Boolean);

      return partes.join(", ");
    },

    /**
     * Renderiza o bloco de mapa: iframe + endereço textual + link para
     * "abrir no Google Maps" (útil para navegação em apps no celular).
     * @param {object} empresa dados de assets/data/empresa.json
     */
    render(empresa) {
      const { endereco } = empresa;
      if (!endereco || typeof endereco.latitude !== "number") {
        this.container.innerHTML =
          "<p>Endereço não disponível no momento.</p>";
        return;
      }

      const embedUrl = this.buildEmbedUrl(
        endereco.latitude,
        endereco.longitude
      );
      const mapsLink =
        endereco.googleMapsUrl ||
        `https://maps.google.com/?q=${endereco.latitude},${endereco.longitude}`;

      this.container.innerHTML = `
        <div class="map-wrapper">
          <iframe
            class="map-frame"
            src="${embedUrl}"
            width="100%"
            height="100%"
            style="border:0;"
            allowfullscreen="true"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            title="Localização do ${empresa.nome || "restaurante"}">
          </iframe>
        </div>
        <div class="map-info">
          <p class="map-address">
            <strong>${empresa.nome || ""}</strong><br>
            ${this.formatAddress(endereco)}
            ${endereco.referencia ? `<br><span class="map-reference">${endereco.referencia}</span>` : ""}
          </p>
          <a class="btn btn-outline map-link" href="${mapsLink}" target="_blank" rel="noopener noreferrer">
            Abrir no Google Maps
          </a>
        </div>
      `;
    },

    /**
     * Ponto de entrada do módulo, chamado por main.js.
     */
    async init() {
      this.container = qs("#mapa");
      if (!this.container) return;

      const empresa = await loadJSON("assets/data/empresa.json");
      if (!empresa) {
        this.container.innerHTML =
          "<p>Não foi possível carregar o mapa no momento.</p>";
        return;
      }

      this.render(empresa);
    },
  };

  App.modules.map = mapModule;

  if (document.readyState !== "loading") {
    mapModule.init();
  }
})();
