// Genera las tarjetas de producto (repetidas/placeholder por ahora) en vez de tenerlas
// copiadas a mano en el HTML. Contenedores marcados con data-product-list="trend"|"catalog"
// se rellenan según su tipo. La ruta raíz del sitio se calcula igual que en layout.js.
(function () {
  const marker = "/js/products.js";
  const scriptSrc = document.currentScript.src;
  const siteRoot = scriptSrc.slice(0, scriptSrc.indexOf(marker) + 1);

  const vansOldSkool = {
    productHref: `${siteRoot}pages/catalog/zapatillas-vans-oldskool.html`,
    img: `${siteRoot}img/products/zapatillas/vans-old-skool-4.png`,
  };

  function renderTrendCard() {
    return `
    <article class="product">
      <a href="${vansOldSkool.productHref}" aria-label="Zapatillas Vans Old Skool">
        <img src="${vansOldSkool.img}" alt="zapatillas" />
        <p class="name">Zapatillas Vans Old Skool</p>
        <p class="price">99.90€</p>
        <p class="price-offer">-10%</p>
      </a>
    </article>`;
  }

  function renderCatalogCard() {
    return `
    <article class="product">
      <a href="${vansOldSkool.productHref}">
        <img src="${vansOldSkool.img}" alt="" />
        <p class="name">Zapatillas Vans</p>
        <p class="price">99.90€</p>
        <p class="rating">★★★★☆</p>
      </a>
    </article>`;
  }

  function fillLists(selector, count, renderCard) {
    document.querySelectorAll(selector).forEach((container) => {
      container.innerHTML = Array.from({ length: count }, renderCard).join("");
    });
  }

  function init() {
    fillLists('[data-product-list="trend"]', 5, renderTrendCard);
    fillLists('[data-product-list="catalog"]', 45, renderCatalogCard);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
