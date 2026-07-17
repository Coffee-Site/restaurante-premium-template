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

    if (!href || href === "#") {

        el.style.display = "none";
        return;

    }

    el.href = href;

    if (text)
        el.textContent = text;

}

        renderHorario() {

    const container = qs("#business-hours");

    if (!container) return;

    const horarios = this.empresa.horarioFuncionamento;

    if (!horarios || !horarios.length)
        return;

    const resumo = [];

    horarios.forEach((dia) => {

        if (dia.fechado)
            return;

        resumo.push(
            `<div class="hour-item">
                <strong>${dia.dia.substring(0,3)}</strong>
                <span>${dia.abertura} às ${dia.fechamento}</span>
            </div>`
        );

    });

    container.innerHTML = resumo.join("");

}

       preencherContato() {

    const contato = this.empresa.contato;
    const endereco = this.empresa.endereco;
    const redes = this.empresa.redesSociais;

    // ----------------------------
    // Telefone
    // ----------------------------

    this.setLink(

        "#contact-phone",

        `tel:${contato.telefoneLink}`,

        contato.telefone

    );

    // ----------------------------
    // WhatsApp
    // ----------------------------

    this.setLink(

        "#contact-whatsapp",

        `https://wa.me/${contato.whatsapp}?text=${encodeURIComponent(contato.whatsappMensagemPadrao)}`,

        "Conversar pelo WhatsApp"

    );

    // ----------------------------
    // Endereço
    // ----------------------------

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

    // Todo o card vira um link para o Google Maps

    const addressCard = qs("#contact-address-line1")?.closest(".contact-card");

    if (addressCard && endereco.googleMapsUrl) {

        addressCard.style.cursor = "pointer";

        addressCard.addEventListener("click", () => {

            window.open(endereco.googleMapsUrl, "_blank");

        });

    }

    // ----------------------------
    // Redes sociais
    // ----------------------------

    this.setLink(

        "#instagram-link",

        redes.instagram

    );

    this.setLink(

        "#facebook-link",

        redes.facebook

    );

    this.setLink(

        "#tiktok-link",

        redes.tiktok

    );

    this.setLink(

        "#youtube-link",

        redes.youtube

    );

    this.renderHorario();

}

        async init() {

    this.empresa = await loadJSON("assets/data/empresa.json");

    if (!this.empresa)
        return;

    this.preencherContato();

}