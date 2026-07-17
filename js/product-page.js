// Conecta los botones "Añadir al carrito" / "Comprar ahora" de la ficha de producto
// con el mismo carrito (localStorage "selectedProducts") que usa el checkout.
document.addEventListener("DOMContentLoaded", function () {
  const productEl = document.querySelector(".product[data-product-id]");
  const addToCartButton = document.getElementById("add-to-cart-button");
  const buyNowButton = document.getElementById("buy-now-button");
  const quantityInput = document.getElementById("quantity");

  if (!productEl) return;

  const product = {
    id: productEl.dataset.productId,
    name: productEl.dataset.productName,
    price: parseFloat(productEl.dataset.productPrice),
    imgSrc: productEl.dataset.productImg,
    stock: parseInt(productEl.dataset.productStock),
  };

  function addToCart() {
    const quantity = quantityInput ? Math.max(1, parseInt(quantityInput.value) || 1) : 1;
    const products = JSON.parse(localStorage.getItem("selectedProducts")) || [];
    const existing = products.find((item) => item.id === product.id);

    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, product.stock);
    } else {
      products.push({ ...product, quantity: Math.min(quantity, product.stock) });
    }

    localStorage.setItem("selectedProducts", JSON.stringify(products));
  }

  if (addToCartButton) {
    addToCartButton.addEventListener("click", function () {
      addToCart();
      alert("Producto añadido al carrito.");
    });
  }

  if (buyNowButton) {
    buyNowButton.addEventListener("click", function () {
      addToCart();
      window.location.href = "../checkout/index.html";
    });
  }
});
