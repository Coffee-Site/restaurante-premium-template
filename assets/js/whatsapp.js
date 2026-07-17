/* ==========================================================================
   COFFEE SITES PRO — WHATSAPP.JS
   Template: Restaurante Premium
   Responsabilidade: botão flutuante de WhatsApp e geração de links de
   contato pré-preenchidos (reserva de mesa, dúvidas sobre o cardápio etc.).

   O número de telefone e as mensagens padrão vêm de assets/data/empresa.json
   (campo "whatsapp" e, opcionalmente, "whatsappMensagens"), mantendo o
   princípio do projeto de que o HTML não deve conter dados fixos.
   Caso o JSON ainda não exista ou falhe ao carregar, um fallback local
   evita que o botão quebre durante o desenvolvimento/demonstração.
   ========================================================================== */

(() => {
  "use strict";

  const App = window.CoffeeSitesPro;

  if (!App) {
    console.error(
      "[CoffeeSitesPro] main.js não foi carregado antes de whatsapp.js."
    );
    return;
  }

  const { qs, qsa, loadJSON } = App.utils;

  // Usado apenas se assets/data/empresa.json ainda não existir ou não tiver
  // os campos abaixo. Troque o número pelo real antes de publicar.
  const WHATSAPP_FALLBACK = {
    numero: "5511999999999",
    mensagemPadrao:
      "Olá! Gostaria de fazer uma reserva no restaurante.",
  };

  const whatsappModule = {
    numero: null,
    mensagemPadrao: null,
    floatButton: null,

    /**
     * Carrega os dados de contato a partir de assets/data/empresa.json.
     * Espera algo como:
     * { "whatsapp": "5511999999999", "whatsappMensagemPadrao": "..." }
     */
    async loadContactData() {
      const empresa = await loadJSON("assets/data/empresa.json");

      if (empresa && empresa.whatsapp) {
        return {
          numero: this.sanitizeNumber(empresa.whatsapp),
          mensagemPadrao:
            empresa.whatsappMensagemPadrao || WHATSAPP_FALLBACK.mensagemPadrao,
        };
      }

      return { ...WHATSAPP_FALLBACK };
    },

    /**
     * Remove qualquer caractere que não seja dígito do número de telefone,
     * garantindo compatibilidade com o formato exigido pelo wa.me.
     */
    sanitizeNumber(rawNumber) {
      return String(rawNumber).replace(/\D/g, "");
    },

    /**
     * Monta a URL final do WhatsApp (wa.me) com mensagem codificada.
     * @param {string} customMessage mensagem específica (opcional)
     */
    buildLink(customMessage) {
      const message = encodeURIComponent(customMessage || this.mensagemPadrao);
      return `https://wa.me/${this.numero}?text=${message}`;
    },

    /**
     * Cria o botão flutuante fixo (canto inferior direito) e o anexa
     * ao final do body. Não depende de nenhum elemento existente no
     * index.html.
     */
    buildFloatButton() {
      const link = document.createElement("a");
      link.className = "whatsapp-float";
      link.href = this.buildLink();
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", "Conversar no WhatsApp");

      link.innerHTML = `
        <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true" focusable="false">
          <path fill="currentColor" d="M16.004 3C9.375 3 4 8.373 4 15c0 2.317.663 4.482 1.812 6.318L4 29l7.86-1.77A11.94 11.94 0 0 0 16.004 27C22.632 27 28 21.627 28 15S22.632 3 16.004 3Zm0 21.818a9.77 9.77 0 0 1-4.99-1.37l-.358-.213-4.664 1.05 1.02-4.55-.234-.372A9.74 9.74 0 0 1 5.2 15c0-5.98 4.86-10.818 10.804-10.818S26.8 9.02 26.8 15 21.948 24.818 16.004 24.818Zm5.42-7.36c-.297-.15-1.755-.867-2.027-.966-.272-.099-.47-.148-.667.148-.198.297-.767.966-.94 1.164-.173.198-.347.223-.644.074-.297-.148-1.253-.462-2.386-1.472-.882-.786-1.478-1.756-1.65-2.053-.174-.297-.019-.457.13-.605.134-.133.297-.347.446-.52.15-.174.198-.297.297-.495.099-.198.05-.372-.025-.52-.074-.148-.667-1.61-.914-2.205-.24-.578-.485-.5-.667-.51-.173-.008-.371-.01-.569-.01a1.09 1.09 0 0 0-.792.372c-.272.297-1.04 1.017-1.04 2.48s1.065 2.876 1.213 3.075c.148.198 2.098 3.204 5.084 4.492.71.307 1.263.49 1.694.627.712.226 1.36.194 1.872.118.571-.085 1.755-.717 2.003-1.41.247-.693.247-1.287.173-1.41-.074-.124-.272-.198-.569-.347Z"/>
        </svg>
      `;

      document.body.appendChild(link);
      this.floatButton = link;
    },

    /**
     * Conecta elementos existentes que devem abrir o WhatsApp com uma
     * mensagem contextual específica, via atributo data-whatsapp-msg.
     * Ex.: <a data-whatsapp-msg="Quero reservar uma mesa" href="#">...</a>
     * Isso permite que botões do menu ("Reservar Mesa") sejam ligados ao
     * WhatsApp futuramente sem exigir alterações neste arquivo.
     */
    bindContextualTriggers() {
      const triggers = qsa("[data-whatsapp-msg]");
      triggers.forEach((trigger) => {
        trigger.addEventListener("click", (event) => {
          event.preventDefault();
          const message = trigger.getAttribute("data-whatsapp-msg");
          window.open(this.buildLink(message), "_blank", "noopener");
        });
      });
    },

    /**
     * Ponto de entrada do módulo, chamado por main.js.
     */
    async init() {
      const contact = await this.loadContactData();
      this.numero = contact.numero;
      this.mensagemPadrao = contact.mensagemPadrao;

      this.buildFloatButton();
      this.bindContextualTriggers();
    },
  };

  App.modules.whatsapp = whatsappModule;

  if (document.readyState !== "loading") {
    whatsappModule.init();
  }
})();
