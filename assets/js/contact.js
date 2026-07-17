/* ==========================================================================
   COFFEE SITES PRO — CONTACT.JS
   Template: Restaurante Premium

   Responsabilidade:
   Carregar automaticamente os dados de contato da empresa através do
   arquivo assets/data/empresa.json e preencher a seção CONTATO.

   Desenvolvido para ser reutilizado em qualquer template da
   Coffee Sites Pro.

   ========================================================================== */

(() => {
    "use strict";

    const App = window.CoffeeSitesPro;

    if (!App) return;

    const { qs, loadJSON } = App.utils;

    const ContactModule = {

        empresa: null,

        setText(id, value) {
            const el = qs(id);

            if (!el || value === undefined || value === null || value === "")
                return;

            el.textContent = value;
        },

        setLink(id, href, text = null) {
            const el = qs(id);

            if (!el) return;

            if (!href) {
                el.style.display = "none";
                return;
            }

            el.href = href;

            if (text)
                el.textContent = text;
        },

        renderHorario() {

            const container = qs("#business-hours");

            if (!container) return;

            container.innerHTML = "";

            this.empresa.horarioFuncionamento.forEach((dia) => {

                const item = document.createElement("div");
                item.className = "business-day";

                if (dia.fechado) {

                    item.innerHTML = `
                        <strong>${dia.dia}</strong><br>
                        Fechado
                    `;

                } else {

                    item.innerHTML = `
                        <strong>${dia.dia}</strong><br>
                        ${dia.abertura} às ${dia.fechamento}
                    `;

                }

                container.appendChild(item);

            });

        },

        preencherContato() {

            const contato = this.empresa.contato;
            const endereco = this.empresa.endereco;
            const redes = this.empresa.redesSociais;

            this.setText("#contact-phone", contato.telefone);

            this.setLink(
                "#contact-email",
                "mailto:" + contato.email,
                contato.email
            );

            this.setLink(
                "#contact-whatsapp",
                `https://wa.me/${contato.whatsapp}?text=${encodeURIComponent(contato.whatsappMensagemPadrao)}`,
                "Conversar pelo WhatsApp"
            );

            this.setText(
                "#contact-address-line1",
                endereco.logradouro
            );

            this.setText(
                "#contact-address-line2",
                endereco.bairro
            );

            this.setText(
                "#contact-address-line3",
                `${endereco.cidade} - ${endereco.estado}`
            );

            this.setLink(
                "#instagram-link",
                redes.instagram,
                "Instagram"
            );

            this.setLink(
                "#facebook-link",
                redes.facebook,
                "Facebook"
            );

            this.setLink(
                "#tiktok-link",
                redes.tiktok,
                "TikTok"
            );

            this.setLink(
                "#youtube-link",
                redes.youtube,
                "YouTube"
            );

            this.renderHorario();

        },

        async init() {

            this.empresa = await loadJSON("assets/data/empresa.json");

            if (!this.empresa)
                return;

            this.preencherContato();

        }

    };

    App.modules.contact = ContactModule;

    if (document.readyState !== "loading") {

        ContactModule.init();

    }

})();