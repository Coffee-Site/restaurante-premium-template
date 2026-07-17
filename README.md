# Coffee Sites Pro
### Framework de sites institucionais profissionais para pequenos negócios locais

Coffee Sites Pro é um framework próprio, construído em **HTML5 + CSS3 + JavaScript ES6 puro** (sem frameworks, sem CMS), pensado para produzir dezenas/centenas de sites institucionais de alta qualidade visual para empresas locais — restaurantes, clínicas, pet shops, salões de beleza e outros segmentos — reaproveitando de 80% a 90% da base de código entre os templates.

Este repositório contém o primeiro template do framework: **Restaurante Premium**.

---

## 1. Filosofia do framework

- **Sem dependências pesadas.** Nada de WordPress, Odoo, Elementor, Bootstrap, jQuery, React, Vue ou Angular. Apenas HTML/CSS/JS nativos, para máxima performance e portabilidade.
- **Dados fora do HTML.** Todo conteúdo variável (cardápio, FAQ, depoimentos, dados da empresa) vive em arquivos JSON dentro de `data/`, permitindo atualizar o site sem tocar em código e abrindo caminho para automação futura (geração de sites em lote, painéis administrativos, etc.).
- **Componentização por CSS/JS modular.** Cada responsabilidade visual (header, hero, cards, CTA, footer, FAQ, galeria, menu, WhatsApp, mapa, depoimentos) tem seu próprio arquivo JS quando exige lógica, e classes reaproveitáveis no CSS.
- **Performance e SEO em primeiro lugar.** Estrutura semântica, lazy loading de imagens, `robots.txt`/`sitemap.xml` prontos, meta tags preparadas, e arquitetura pensada para nota 95+ no Lighthouse.
- **Publicação via Cloudflare Pages.** Fluxo de trabalho: IA gera os arquivos → GitHub → Cloudflare Pages → domínio personalizado.

---

## 2. Estrutura de pastas

```
restaurante-premium/
├── index.html
├── robots.txt
├── sitemap.xml
├── manifest.json
├── README.md
├── assets/
│   ├── css/
│   │   ├── variables.css     → Design tokens (cores, tipografia, espaçamentos)
│   │   ├── style.css         → Base visual (reset, layout, componentes)
│   │   ├── responsive.css    → Breakpoints mobile-first
│   │   └── animations.css    → Reveal on scroll, lightbox, WhatsApp float, etc.
│   ├── js/
│   │   ├── main.js           → Núcleo: boot, utils, header scroll, smooth scroll
│   │   ├── menu.js           → Menu mobile (hambúrguer) + scrollspy
│   │   ├── animations.js     → Scroll reveal, parallax do hero, tilt dos cards
│   │   ├── gallery.js        → Galeria + lightbox acessível
│   │   └── whatsapp.js       → Botão flutuante + links de WhatsApp
│   ├── images/
│   │   ├── hero/
│   │   ├── pratos/
│   │   ├── galeria/
│   │   ├── logo/
│   │   ├── equipe/
│   │   ├── icons/
│   │   └── favicon/
│   └── fonts/
└── data/
    ├── empresa.json      → Dados institucionais, contato, endereço, SEO
    ├── cardapio.json      → Categorias e itens do cardápio
    ├── faq.json           → Perguntas frequentes
    └── depoimentos.json   → Avaliações de clientes
```

---

## 3. Design System

Definido inteiramente em `assets/css/variables.css`, como fonte única da verdade:

| Token | Valor |
|---|---|
| `--color-primary` | `#C89B3C` |
| `--color-primary-dark` | `#A97F29` |
| `--color-black` | `#111111` |
| `--color-dark` | `#1C1C1C` |
| `--color-gray` | `#666666` |
| `--color-white` | `#FFFFFF` |
| `--color-light` | `#F7F7F7` |
| `--font-title` | Playfair Display |
| `--font-text` | Poppins |

Ao criar um novo template de outro segmento (barbearia, clínica, pet shop etc.), o processo recomendado é: **duplicar a pasta do template mais próximo e sobrescrever apenas `variables.css`** (paleta e tipografia) e os JSONs em `data/`, mantendo `style.css`, `responsive.css`, `animations.css` e os módulos JS praticamente intactos.

---

## 4. Como o conteúdo dinâmico funciona

Os módulos JS carregam os JSONs via `fetch` (função `App.utils.loadJSON`, em `main.js`):

- **`whatsapp.js`** lê `data/empresa.json` (`whatsapp`, `whatsappMensagemPadrao`) para montar o botão flutuante e os links de contato.
- **`cardapio.json`**, **`faq.json`** e **`depoimentos.json`** já estão estruturados e prontos para consumo, mas a renderização desses três nas seções `#cardapio`, `#faq` e `#depoimentos` ainda precisa ser implementada em um módulo dedicado (sugestão: `content.js`), já que hoje essas seções existem no `index.html` como contêineres vazios (`#menu-content`, `#faq-list`, `.grid`).

> **Próximo passo recomendado:** criar `assets/js/content.js` para popular dinamicamente cardápio, FAQ e depoimentos a partir dos respectivos JSONs, seguindo o mesmo padrão de módulo registrado em `App.modules` usado pelos demais arquivos.

---

## 5. Checklist antes de publicar para um cliente

- [ ] Substituir todas as imagens placeholder em `assets/images/` pelas fotos reais do estabelecimento.
- [ ] Atualizar `data/empresa.json` com telefone, endereço, redes sociais e horário de funcionamento reais.
- [ ] Atualizar `data/cardapio.json`, `data/faq.json` e `data/depoimentos.json` com o conteúdo do cliente.
- [ ] Revisar `manifest.json` (nome, cores do tema, ícones em `assets/images/icons/`).
- [ ] Atualizar as URLs em `robots.txt` e `sitemap.xml` para o domínio definitivo do cliente.
- [ ] Preencher `meta description`, `Open Graph` e `Schema.org` (`Restaurant`) com os dados reais.
- [ ] Conectar Google Analytics e Google Search Console (`data/empresa.json > analytics`).
- [ ] Rodar auditoria no Lighthouse (meta: 95+ em Performance, Acessibilidade, Boas Práticas e SEO).
- [ ] Testar em mobile, tablet, notebook, desktop e ultrawide.

---

## 6. Publicação (Cloudflare Pages)

Fluxo padrão de entrega do framework:

1. Gerar/ajustar os arquivos do template.
2. Subir o projeto para um repositório no **GitHub**.
3. Conectar o repositório ao **Cloudflare Pages** (build command: nenhum necessário, é HTML estático — output directory: raiz do projeto).
4. Validar a URL gratuita gerada pelo Cloudflare Pages e apresentar a demonstração ao cliente.
5. Após aprovação: registrar o domínio definitivo, conectá-lo ao projeto no Cloudflare Pages e realizar a entrega final.

---

## 7. Próximos templates do framework

Este template (Restaurante Premium) serve como base estrutural para os próximos segmentos planejados:

Barbearia · Academia · Advogado · Imobiliária · Oficina Mecânica · Hotel · Pizzaria · Dentista · Contabilidade · Escritório · entre outros.

Ao iniciar um novo segmento, reaproveite este README como ponto de partida, ajustando apenas as seções específicas do negócio (ex.: "Cardápio" → "Serviços", "Depoimentos" permanece, "Galeria" permanece).
