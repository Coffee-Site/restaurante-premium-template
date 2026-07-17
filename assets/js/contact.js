(() => {
    "use strict";

    const App = window.CoffeeSitesPro;

    if (!App) return;

    const { qs, loadJSON } = App.utils;

    const ContactModule = {

        empresa: null,

        setText(selector, value) {

            const el = qs(selector);

            if (!el || value === undefined || value === null || value === "")
                return;

            el.textContent = value;
        },

        setLink(selector, href, text = null) {

            const el = qs(selector);

            if (!el) return;

            if (!href || href === "#") {
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

            const horarios = this.empresa?.horarioFuncionamento;

            if (!horarios || !horarios.length) return;

            container.innerHTML = "";

            horarios.forEach((dia) => {

                const item = document.createElement("div");

                item.className = "hour-item";

                item.innerHTML = `
                    <strong>${dia.dia.substring(0,3)}</strong>
                    <span>${
                        dia.fechado
                        ? "Fechado"
                        : `${dia.abertura} às ${dia.fechamento}`
                    }</span>
                `;

                container.appendChild(item);

            });

        },

        preencherContato() {

            const contato = this.empresa.contato;
            const endereco = this.empresa.endereco;
            const redes = this.empresa.redesSociais;

            this.setLink(
                "#contact-phone",
                `tel:${contato.telefoneLink}`,
                contato.telefone
            );

            this.setLink(
                "#contact-whatsapp",
                `https://wa.me/${contato.whatsapp}?text=${encodeURIComponent(contato.whatsappMensagemPadrao)}`,
                "Conversar pelo WhatsApp"
            );

            this.setText("#contact-address-line1", endereco.logradouro);
            this.setText("#contact-address-line2", endereco.bairro);
            this.setText(
                "#contact-address-line3",
                `${endereco.cidade} - ${endereco.estado}`
            );

            const addressCard = qs("#contact-address-line1")?.closest(".contact-card");

            if (addressCard && endereco.googleMapsUrl) {

                addressCard.style.cursor = "pointer";

                addressCard.onclick = () => {
                    window.open(endereco.googleMapsUrl, "_blank");
                };

            }

            this.setLink("#instagram-link", redes.instagram);
            this.setLink("#facebook-link", redes.facebook);
            this.setLink("#tiktok-link", redes.tiktok);
            this.setLink("#youtube-link", redes.youtube);

            this.renderHorario();

        },

        async init() {

            this.empresa = await loadJSON("assets/data/empresa.json");

            if (!this.empresa) return;

            this.preencherContato();

        }

    };

    App.modules.contact = ContactModule;

    if (document.readyState !== "loading") {
        ContactModule.init();
    }

})();