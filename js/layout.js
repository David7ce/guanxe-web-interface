// Inyecta cabecera, panel de accesibilidad y pie de página comunes en <div id="site-header">
// y <div id="site-footer">. Una sola fuente de verdad para evitar HTML duplicado por página.
// La ruta raíz del sitio se calcula a partir de dónde se cargó este script, así funciona
// igual desde index.html como desde pages/checkout/index.html sin rutas relativas manuales.
(function () {
  const marker = "/js/layout.js";
  const scriptSrc = document.currentScript.src;
  const siteRoot = scriptSrc.slice(0, scriptSrc.indexOf(marker) + 1);
  const icon = (name) => `${siteRoot}img/icon/${name}`;

  function renderHeader() {
    return `
    <header class="header-section">
      <div class="icon-item visible logo">
        <a href="${siteRoot}index.html" aria-label="Guanxe Home">
          <img src="${icon("guanxe-logo.svg")}" alt="guanxe" class="guanxe-logo" />
        </a>
      </div>
      <div class="icon-item search">
        <input type="search" name="search" id="search" placeholder="Buscar productos" aria-label="Buscar productos" />
      </div>
      <div class="icon-item">
        <a href="#" aria-label="Región Canarias">
          <img src="${icon("canary-flag.svg")}" alt="Canarias" class="canary-flag-icon" />
          <p>Canarias</p>
        </a>
      </div>
      <div class="icon-item">
        <a href="#" aria-label="Cuenta de usuario">
          <img src="${icon("user.svg")}" alt="user" class="user-account" />
          <p>Cuenta</p>
        </a>
      </div>
      <div class="icon-item visible">
        <a href="${siteRoot}pages/checkout/index.html" aria-label="Carrito de compras">
          <img src="${icon("shopping-cart.svg")}" alt="shopping-cart" class="shopping-cart-icon" />
          <p>Cesta</p>
        </a>
      </div>
    </header>

    <div class="accessibility">
      <div class="theme-settings">
        <img id="sun-icon" class="theme-icon" src="${icon("sun.svg")}" alt="Tema claro" aria-label="Cambiar a tema claro" />
        <img id="moon-icon" class="theme-icon" src="${icon("moon-stars.svg")}" alt="Tema oscuro" aria-label="Cambiar a tema oscuro" />

        <div class="change-font-size">
          <button class="font-size-icon" id="decrease-font-size" aria-label="Disminuir tamaño de letra">A-</button>
          <button class="font-size-icon" id="reset-font-size" aria-label="Resetear tamaño de letra">⥻</button>
          <button class="font-size-icon" id="increase-font-size" aria-label="Aumentar tamaño de letra">A+</button>
        </div>

        <img id="high-contrast-icon" class="contrast-icon" src="${icon("high-contrast.svg")}" alt="Alto contraste" aria-label="Cambiar a alto contraste" />
        <img id="low-contrast-icon" class="contrast-icon" src="${icon("low-contrast.svg")}" alt="Bajo contraste" aria-label="Cambiar a bajo contraste" />
      </div>
    </div>
    `;
  }

  function renderFooter() {
    return `
    <footer>
      <div class="conditions-and-legal">
        <span>Condiciones</span>
        <p><a href="#" aria-label="Condiciones de contratación">Condiciones de contratación</a></p>
        <p><a href="#" aria-label="Condiciones de uso">Condiciones de uso</a></p>
        <span>Legalidad</span>
        <p><a href="#" aria-label="Aviso legal">Aviso legal</a></p>
        <p><a href="#" aria-label="Reclamaciones">Reclamaciones</a></p>
      </div>
      <div class="help">
        <span>Ayuda</span>
        <p><a href="#" aria-label="Cómo comprar">Cómo comprar</a></p>
        <p><a href="#" aria-label="Envíos">Envíos</a></p>
        <p><a href="#" aria-label="Devoluciones">Devoluciones</a></p>
        <p><a href="#" aria-label="Bases promocionales">Bases promocionales</a></p>
      </div>
      <div class="corpo-side">
        <span>Quiénes somos</span>
        <p><a href="${siteRoot}pages/about.html">Sobre nosotros</a></p>
        <p><a href="#" aria-label="Responsabilidad social">Responsabilidad social</a></p>
        <p><a href="#" aria-label="Tiendas">Tiendas</a></p>
      </div>
    </footer>
    `;
  }

  function inject() {
    const headerMount = document.getElementById("site-header");
    const footerMount = document.getElementById("site-footer");
    if (headerMount) headerMount.outerHTML = renderHeader();
    if (footerMount) footerMount.outerHTML = renderFooter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }
})();
