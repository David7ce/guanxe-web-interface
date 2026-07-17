document.addEventListener("DOMContentLoaded", function () {
    const DOM = {
        continueButtons: document.querySelectorAll('.continue-button'),
        navLinks: document.querySelectorAll(".steps-checkout a"),
        steps: document.querySelectorAll(".section"),
        navItems: document.querySelectorAll(".steps-checkout li"),
        selectedProducts: document.getElementById("selected-products"),
        subtotalElement: document.getElementById("subtotal-price"),
        totalElement: document.getElementById("total-price"),
        shippingMethodSelect: document.getElementById("shipping-method"),
        countrySelect: document.getElementById("country"),
        shippingZone: document.getElementById("shipping-zone"),
        paymentMethodSelect: document.getElementById("payment-method"),
        cardDetails: document.getElementById("card-details"),
        paypalDetails: document.getElementById("paypal-details"),
        bankTransferDetails: document.getElementById("bank-transfer-details"),
        discountInput: document.getElementById("discount-code"),
        discountButton: document.getElementById("check-discount-button"),
        sameAddressCheckbox: document.getElementById('same-address'),
        billingAddressFields: document.getElementById('billing-address-fields'),
        clientDataForm: document.getElementById("client-data-form"),
        step4: document.getElementById("step4"),
        confirmationDetails: document.createElement("div"),
        discountCodes: ["GUANXE10", "GUANXE-DOR", "GUANCHE-TFE", "GUANXE-2025"]
    };

    let appliedDiscountRate = 0;

    const initialProducts = [
        {
            id: "product-1",
            name: "Vans Old Skool",
            price: 15,
            quantity: 1,
            imgSrc: "../../img/products/zapatillas/vans-old-skool-1.png",
            stock: 10
        },
        {
            id: "product-2",
            name: "Bolso",
            price: 15,
            quantity: 1,
            imgSrc: "../../img/products/bolso.webp",
            stock: 10
        },
        {
            id: "product-3",
            name: "Camiseta de asillas",
            price: 20,
            quantity: 1,
            imgSrc: "../../img/products/camiseta-asillas.jpg",
            stock: 5
        },
        {
            id: "product-4",
            name: "Jersey Hackett",
            price: 25,
            quantity: 1,
            imgSrc: "../../img/products/jersey-hackett.jpg",
            stock: 99
        },
        {
            id: "product-5",
            name: "Sandalias",
            price: 30,
            quantity: 1,
            imgSrc: "../../img/products/sandalias.jpg",
            stock: 99
        }
    ];

    try {
        if (!localStorage.getItem("selectedProducts")) {
            localStorage.setItem("selectedProducts", JSON.stringify(initialProducts));
        }
    } catch (e) {
        console.error('localStorage error:', e);
    }

    initializeContinueButton();
    initializeNavigationMenu();
    preventFormSubmission();
    step1();
    step2();
    step3();
    step4();

    // -- Inicilization functions --
    function preventFormSubmission() {
        document.querySelectorAll("form").forEach(form => {
            form.addEventListener("submit", (event) => event.preventDefault());
        });
    }

    function step1() {
        renderCart();
        applyStoredRecommendedStock();
        initializeRemoveProduct();
        initializeAddProduct();
        updateProductPriceOnQuantityChange();
        updateTotalProductPrice();
        updateTotalPrice();
    }

    function step2() {
        addCountryToShippingZone();
        showShippingMethodByZone();
    }

    function step3() {
        updateTotalPriceWithShipping();
        initializePaymentMethodSelection();
        showBillingAddress();
    }

    function step4() {
        showConfirmationView();
    }

    function initializeContinueButton() {
        DOM.continueButtons.forEach(button => {
            button.addEventListener("click", function () {
                const currentStep = document.querySelector(".section.active");

                switch (currentStep.id) {
                    case "step1":
                        handleStep1ContinueClick();
                        break;
                    case "step2":
                        handleStep2ContinueClick();
                        break;
                    case "step3":
                        handleStep3ContinueClick();
                        break;
                    case "step4":
                        congratulationsMessage();
                        break;
                    default:
                        console.error("Paso no reconocido:", currentStep.id);
                }
            });
        });
    }

    function initializeNavigationMenu() {
        DOM.navLinks.forEach((link, index) => {
            link.addEventListener("click", function (event) {
                event.preventDefault();
                const currentStep = document.querySelector(".section.active").id.replace("step", "");
                if (index + 1 <= parseInt(currentStep)) {
                    showStep(index + 1);
                }
            });
        });
    }

    function showStep(stepNumber) {
        DOM.steps.forEach((step, index) => {
            if (index + 1 === stepNumber) {
                step.classList.add("active");
                step.setAttribute("aria-hidden", "false");
                DOM.navItems[index].classList.add("active-step");
            } else {
                step.classList.remove("active");
                step.setAttribute("aria-hidden", "true");
                DOM.navItems[index].classList.remove("active-step");
            }
        });
    }

    function showNextStep(currentStep) {
        const getElement = (id) => document.getElementById(id);
        const getNavElement = (step) => document.querySelector(`.steps-checkout li:nth-child(${step})`);

        const currentStepElement = getElement(`step${currentStep}`);
        const nextStepElement = getElement(`step${parseInt(currentStep) + 1}`);
        const currentNavElement = getNavElement(parseInt(currentStep));
        const nextNavElement = getNavElement(parseInt(currentStep) + 1);

        if (!currentStepElement || !nextStepElement) {
            console.error(`Step element not found: step${currentStep} or step${parseInt(currentStep) + 1}`);
            return;
        }

        currentStepElement.classList.remove("active");
        currentStepElement.setAttribute("aria-hidden", "true");
        currentNavElement.classList.remove("active-step");

        nextStepElement.classList.add("active");
        nextStepElement.setAttribute("aria-hidden", "false");
        nextNavElement.classList.add("active-step");
    }

    // --- Utility functions ---
    function markInvalidField(form, fieldName) {
        const field = form.querySelector(`[name='${fieldName}']`);
        if (field) {
            field.classList.add("invalid");
        }
    }

    function unmarkInvalidFields(form) {
        const invalidFields = form.querySelectorAll(".invalid");
        invalidFields.forEach(field => {
            field.classList.remove("invalid");
        });
    }

    function generateErrorList(errors, step) {
        const stepElement = document.getElementById(step);

        // Eliminar la lista de errores existente si existe
        const existingErrorList = document.getElementById(`${step}-errors`);
        if (existingErrorList) {
            existingErrorList.remove();
        }

        const errorList = document.createElement("ul");
        errorList.id = `${step}-errors`;
        errorList.classList.add("validation-error-list");

        errors.forEach(error => {
            const listItem = document.createElement("li");
            listItem.textContent = error;
            errorList.appendChild(listItem);
        });

        stepElement.appendChild(errorList); // añadir al final del formulario
    }

    // --- Products ZONE ---
    function handleStep1ContinueClick() {
        const products = JSON.parse(localStorage.getItem("selectedProducts")) || [];

        if (products.length > 0) {
            showNextStep('1');
        } else {
            alert("La cesta está vacía. Por favor, añade productos antes de continuar.");
        }
    }

    function renderCart() {
        const products = JSON.parse(localStorage.getItem("selectedProducts")) || [];

        DOM.selectedProducts.querySelectorAll("article.product").forEach((article) => article.remove());

        products.forEach((product) => {
            const elementId = `${product.id}-cart`;
            const productTemplate = `
            <article class="product" id="${elementId}" aria-labelledby="${elementId}-name">
              <figure class="product-img">
                <img src="${product.imgSrc}" alt="${product.name}" />
              </figure>
              <section class="product-info">
                <div class="product-name">
                  <h2 id="${elementId}-name">${product.name}</h2>
                  <button class="remove-product" aria-label="Eliminar producto">
                    <img src="../../img/icon/trash.svg" alt="Eliminar producto" class="icon-trash" />
                  </button>
                </div>
                <div class="product-quantity">
                  <label for="${elementId}-quantity">Unidades:</label>
                  <input type="number" id="${elementId}-quantity" value="${product.quantity}" min="0" max="${product.stock}" aria-label="Número de unidades disponibles" />
                  <p>Unidades en stock: <span id="${elementId}-stock">${product.stock}</span></p>
                </div>
                <div class="product-pricing">
                  <p>Precio por unidad: <span id="${elementId}-price">${product.price.toFixed(2)}€</span></p>
                  <p>Total: <span id="${elementId}-total">${(product.price * product.quantity).toFixed(2)}€</span></p>
                </div>
              </section>
            </article>
            `;
            DOM.selectedProducts.insertAdjacentHTML("beforeend", productTemplate);
        });
    }

    function applyStoredRecommendedStock() {
        const stored = JSON.parse(localStorage.getItem("recommendedStock")) || {};
        document.querySelectorAll(".recommended-products article.product").forEach((article) => {
            const stockSpan = article.querySelector("span[id$='-stock']");
            if (stockSpan && stored[article.id] !== undefined) {
                stockSpan.textContent = stored[article.id];
            }
        });
    }

    function saveRecommendedStock(productId, stock) {
        const stored = JSON.parse(localStorage.getItem("recommendedStock")) || {};
        stored[productId] = stock;
        localStorage.setItem("recommendedStock", JSON.stringify(stored));
    }

    function initializeRemoveProduct() {
        const removeButtons = document.querySelectorAll(".remove-product");

        removeButtons.forEach((button) => {
            button.addEventListener("click", function (event) {
                const productArticle = event.target.closest("article.product");
                if (productArticle) {
                    const productId = productArticle.id.replace("-cart", "");
                    removeProductFromCart(productId);
                    productArticle.remove();
                    updateTotalPrice();
                }
            });
        });
    }

    function initializeAddProduct() {
        const addProductButtons = document.querySelectorAll(".add-product");

        addProductButtons.forEach((button) => {
            button.addEventListener("click", function (event) {
                const product = event.target.closest("article");
                const stockSpan = product.querySelector("span[id$='-stock']");
                if (stockSpan && parseInt(stockSpan.textContent) > 0) {
                    addProductToCart(product);
                } else {
                    alert("Este producto está fuera de stock.");
                }
            });
        });
    }

    function updateTotalProductPrice() {
        const totalUnitPrice = document.querySelectorAll(".product-pricing span[id$='-total']");

        totalUnitPrice.forEach((totalUnitePrice) => {
            const productId = totalUnitePrice.id.replace("-total", "");
            const quantity = parseInt(document.getElementById(`${productId}-quantity`).value);
            const unitPrice = parseFloat(document.getElementById(`${productId}-price`).textContent.replace("€", ""));
            const modifiedPrice = unitPrice * quantity;
            totalUnitePrice.textContent = `${modifiedPrice.toFixed(2)}€`;
        });
    }

    function updateProductPriceOnQuantityChange() {
        const quantityInputs = document.querySelectorAll(".product-quantity input");
        quantityInputs.forEach((input) => {
            input.addEventListener("change", function (event) {
                const quantity = parseInt(event.target.value);
                const productId = event.target.id.replace("-quantity", "");
                const productPrice = parseFloat(
                    document.getElementById(`${productId}-price`).textContent.replace("€", "")
                );
                const totalPrice = quantity * productPrice;
                document.getElementById(`${productId}-total`).textContent = `${totalPrice.toFixed(2)}€`;

                if (quantity === 0) {
                    const productArticle = event.target.closest("article.product");
                    if (productArticle) {
                        productArticle.remove();
                    }
                }

                updateTotalProductPrice();
                updateTotalPrice();
                updateCartInLocalStorage();
            });
        });
    }

    function addProductToCart(product) {
        const productId = product.id;
        const productName = product.querySelector(".product-name h2").textContent;
        const productPrice = parseFloat(
            product
                .querySelector("span[id$='-price']")
                .textContent.replace("€", "")
        );
        const imgSrc = product.querySelector(".product-img img").getAttribute("src");
        const stockSpan = product.querySelector("span[id$='-stock']");
        const stock = parseInt(stockSpan.textContent);
        stockSpan.textContent = stock - 1;
        if (product.closest(".recommended-products")) {
            saveRecommendedStock(product.id, stock - 1);
        }

        // Check if the product is already in the cart
        let cartItem = DOM.selectedProducts.querySelector(`#${productId}-cart`);
        if (cartItem) {
            // If the product is already in the cart, increase the quantity
            let quantityInput = cartItem.querySelector(".product-quantity input");
            if (parseInt(quantityInput.value) < stock) {
                quantityInput.value = parseInt(quantityInput.value) + 1;
            } else {
                alert("No puedes añadir más unidades de este producto.");
            }
        } else {
            // Create a new product element
            const elementId = `${productId}-cart`;
            const productTemplate = `
            <article class="product" id="${elementId}" aria-labelledby="${elementId}-name">
              <figure class="product-img">
                <img src="${imgSrc}" alt="${productName}" />
              </figure>
              <section class="product-info">
                <div class="product-name">
                  <h2 id="${elementId}-name">${productName}</h2>
                  <button class="remove-product" aria-label="Eliminar producto">
                    <img src="../../img/icon/trash.svg" alt="Eliminar producto" class="icon-trash" />
                  </button>
                </div>
                <div class="product-quantity">
                  <label for="${elementId}-quantity">Unidades:</label>
                  <input type="number" id="${elementId}-quantity" value="1" min="0" max="${stock}" aria-label="Número de unidades disponibles" />
                  <p>Unidades en stock: <span id="${elementId}-stock">${stock}</span></p>
                </div>
                <div class="product-pricing">
                  <p>Precio por unidad: <span id="${elementId}-price">${productPrice.toFixed(2)}€</span></p>
                  <p>Total: <span id="${elementId}-total">${productPrice.toFixed(2)}€</span></p> <!-- Initialize total price -->
                </div>
              </section>
            </article>
            `;

            // Append the new product to the selected products
            DOM.selectedProducts.insertAdjacentHTML("beforeend", productTemplate);
        }

        updateCartInLocalStorage();
        updateProductPriceOnQuantityChange();
        initializeRemoveProduct(); // Reinitialize remove product buttons for new items
    }

    function updateTotalPrice() {
        const totalUnitPrice = document.querySelectorAll(".product-pricing span[id$='-total']");
        const igic = 0.07;
        let subtotal = 0;

        totalUnitPrice.forEach((totalUnitePrice) => {
            const price = parseFloat(totalUnitePrice.textContent.replace("€", ""));
            subtotal += price / (1 + igic); // Calculate subtotal without IGIC
        });

        DOM.subtotalElement.textContent = `${subtotal.toFixed(2)}€`;

        let total = (igic + 1) * subtotal;

        const selectedMethod = DOM.shippingMethodSelect.options[DOM.shippingMethodSelect.selectedIndex];
        if (selectedMethod && selectedMethod.dataset.price) {
            total += parseFloat(selectedMethod.dataset.price);
        }

        if (appliedDiscountRate > 0) {
            total -= total * appliedDiscountRate;
        }

        DOM.totalElement.textContent = `${total.toFixed(2)}€`;
    }

    function updateCartInLocalStorage() {
        const products = [];
        const productElements = DOM.selectedProducts.querySelectorAll("article.product");

        productElements.forEach(product => {
            const productId = product.id.replace("-cart", "");
            const productName = product.querySelector(".product-name h2").textContent;
            const productPrice = parseFloat(product.querySelector(".product-pricing span[id$='-price']").textContent.replace("€", ""));
            const productQuantity = parseInt(product.querySelector(".product-quantity input").value);
            const imgSrc = product.querySelector(".product-img img").getAttribute("src");
            const stock = parseInt(product.querySelector(".product-quantity span").textContent);

            products.push({
                id: productId,
                name: productName,
                price: productPrice,
                quantity: productQuantity,
                imgSrc: imgSrc,
                stock: stock
            });
        });

        localStorage.setItem("selectedProducts", JSON.stringify(products));
    }

    function removeProductFromCart(productId) {
        let products = JSON.parse(localStorage.getItem("selectedProducts")) || [];
        products = products.filter(product => product.id !== productId);
        localStorage.setItem("selectedProducts", JSON.stringify(products));
    }

    // --- Client data ZONE ---
    function handleStep2ContinueClick() {
        const errors = validateClientData();

        if (errors.length > 0) {
            generateErrorList(errors, "step2");
        } else {
            saveClientDataToLocalStorage();
            showNextStep('2');
        }
    }

    function saveClientDataToLocalStorage() {
        const formData = new FormData(DOM.clientDataForm);
        const clientData = {};

        formData.forEach((value, key) => {
            clientData[key] = value;
        });

        localStorage.setItem("clientData", JSON.stringify(clientData));
    }

    function validateClientData() {
        const formData = new FormData(DOM.clientDataForm);
        const errors = [];

        // Clear previous error markings
        unmarkInvalidFields(DOM.clientDataForm);

        const requiredFields = [
            { name: "name", label: "Nombre", validate: value => value.length >= 3 && value.length <= 20, errorMessage: "El nombre debe tener entre 3 y 20 caracteres." },
            { name: "surname1", label: "Apellido 1", validate: value => value.length >= 3 && value.length <= 20, errorMessage: "El apellido debe tener entre 3 y 20 caracteres." },
            { name: "nationality", label: "Nacionalidad" },
            { name: "dni", label: "DNI", validate: value => /^\d{8}[A-Z]$/.test(value), errorMessage: "El DNI debe tener 8 dígitos y una letra." },
            { name: "email", label: "Correo electrónico" },
            { name: "email-confirm", label: "Confirmar correo electrónico" },
            { name: "phone-prefix", label: "Prefijo telefónico" },
            { name: "mobile-phone", label: "Número de móvil" },
            { name: "address", label: "Dirección", validate: value => value.split(' ').length >= 2 && value.split(' ').length <= 11, errorMessage: "La dirección debe tener entre 2 y 11 palabras." },
            { name: "city", label: "Ciudad", validate: value => /^[a-zA-Z\s]{2,}$/.test(value), errorMessage: "La ciudad debe tener al menos 2 caracteres y solo contener letras y espacios." },
            { name: "country", label: "País" },
            { name: "postal-code", label: "Código postal", validate: value => /^38\d{3}$/.test(value), errorMessage: "El código postal debe tener 5 dígitos y empezar por 38 (Canarias)." },
        ];

        const shippingMethodElement = document.getElementById("shipping-method");
        if (shippingMethodElement) {
            requiredFields.push({ name: "shipping-method", label: "Método de envío" });
        }

        if (DOM.sameAddressCheckbox && !DOM.sameAddressCheckbox.checked) {
            requiredFields.push(
                { name: "billing-address", label: "Calle de facturación", validate: value => value.split(' ').length >= 2 && value.split(' ').length <= 11, errorMessage: "La dirección de facturación debe tener entre 2 y 11 palabras." },
                { name: "billing-city", label: "Ciudad de facturación", validate: value => /^[a-zA-Z\s]{2,}$/.test(value), errorMessage: "La ciudad de facturación debe tener al menos 2 caracteres y solo contener letras y espacios." },
                { name: "billing-country", label: "País de facturación" },
                { name: "billing-postal-code", label: "Código postal de facturación", validate: value => /^38\d{3}$/.test(value), errorMessage: "El código postal de facturación debe tener 5 dígitos y empezar por 38 (Canarias)." }
            );
        }

        requiredFields.forEach(field => {
            const fieldValue = formData.get(field.name);
            if (!fieldValue || !fieldValue.trim()) {
                errors.push(`El campo '${field.label}' es obligatorio.`);
                markInvalidField(DOM.clientDataForm, field.name);
            } else if (field.validate && !field.validate(fieldValue.trim())) {
                errors.push(field.errorMessage);
                markInvalidField(DOM.clientDataForm, field.name);
            }
        });

        return errors;
    }

    function addCountryToShippingZone() {
        DOM.countrySelect.addEventListener("change", function () {
            const selectedCountry = DOM.countrySelect.value;
            DOM.shippingZone.textContent = selectedCountry;
        });

        // Set the value of the shipping zone
        DOM.shippingZone.textContent = DOM.countrySelect.value;
    }

    function showShippingMethodByZone() {
        const shippingZones = {
            spain: "zone1",
            andorra: "zone2",
            portugal: "zone2",
            france: "zone3"
        };
        const shippingMethods = {
            zone1: [
                { method: "Standard", price: 5 },
                { method: "Express", price: 10 }
            ],
            zone2: [
                { method: "Standard", price: 7 }
            ],
            zone3: []
        };

        function updateShippingMethods() {
            const selectedCountry = DOM.countrySelect.value;
            const zone = shippingZones[selectedCountry] || "zone3";
            const methods = shippingMethods[zone] || [];

            DOM.shippingMethodSelect.innerHTML = '<option value="">Seleccione un método de envío</option>';

            methods.forEach(method => {
                const option = document.createElement("option");
                option.value = method.method;
                option.textContent = `${method.method} (${method.price}€)`;
                option.dataset.price = method.price;
                DOM.shippingMethodSelect.appendChild(option);
            });

            const existingNotice = document.getElementById("no-shipping-notice");
            if (existingNotice) existingNotice.remove();

            if (selectedCountry && methods.length === 0) {
                DOM.shippingMethodSelect.disabled = true;
                const notice = document.createElement("p");
                notice.id = "no-shipping-notice";
                notice.classList.add("validation-error-list");
                notice.textContent = "No realizamos envíos a este país todavía.";
                DOM.shippingMethodSelect.insertAdjacentElement("afterend", notice);
            } else {
                DOM.shippingMethodSelect.disabled = false;
            }
        }

        DOM.countrySelect.addEventListener("change", updateShippingMethods);
        updateShippingMethods();
    }

    function updateTotalPriceWithShipping() {
        DOM.shippingMethodSelect.addEventListener("change", updateTotalPrice);
    }

    // -- Payment method ZONE --
    function handleStep3ContinueClick() {
        const errors = validatePaymentMethodSelection();

        if (errors.length > 0) {
            generateErrorList(errors, "payment-details");
        } else {
            // Proceed to the next step
            showNextStep('3');
        }
    }

    function initializePaymentMethodSelection() {
        if (!DOM.paymentMethodSelect || !DOM.cardDetails || !DOM.paypalDetails || !DOM.bankTransferDetails) {
            console.error("One or more payment method elements are missing");
            return;
        }

        // Hide all payment details sections by default
        DOM.cardDetails.style.display = "none";
        DOM.paypalDetails.style.display = "none";
        DOM.bankTransferDetails.style.display = "none";

        DOM.paymentMethodSelect.addEventListener("change", function () {
            const selectedMethod = DOM.paymentMethodSelect.value;

            // Hide all payment details sections
            DOM.cardDetails.style.display = "none";
            DOM.paypalDetails.style.display = "none";
            DOM.bankTransferDetails.style.display = "none";

            // Show the selected payment method details
            if (selectedMethod === "card") {
                DOM.cardDetails.style.display = "block";
            } else if (selectedMethod === "paypal") {
                DOM.paypalDetails.style.display = "block";
            } else if (selectedMethod === "bank-transfer") {
                DOM.bankTransferDetails.style.display = "block";
            }
        });

        DOM.discountButton.addEventListener("click", function () {
            if (appliedDiscountRate > 0) return;

            const existingMessage = DOM.discountButton.parentElement.querySelector(".discount-message, .discount-error");
            if (existingMessage) existingMessage.remove();

            if (DOM.discountCodes.includes(DOM.discountInput.value.trim())) {
                appliedDiscountRate = 0.1;
                updateTotalPrice();
                DOM.discountInput.disabled = true;
                DOM.discountButton.disabled = true;

                let discountMessage = document.createElement("p");
                discountMessage.textContent = "Descuento aplicado correctamente.";
                discountMessage.classList.add("discount-message");
                DOM.discountButton.insertAdjacentElement("afterend", discountMessage);
            } else {
                let errorMessage = document.createElement("p");
                errorMessage.textContent = "Código de descuento no válido.";
                errorMessage.classList.add("discount-error");
                DOM.discountButton.insertAdjacentElement("afterend", errorMessage);
            }
        });
    }

    function showBillingAddress() {
        DOM.sameAddressCheckbox.addEventListener('change', () => {
            if (DOM.sameAddressCheckbox.checked) {
                DOM.billingAddressFields.style.display = 'none';
            } else {
                DOM.billingAddressFields.style.display = 'block';
            }
        });
    }

    function validatePaymentMethodSelection() {
        const selectedMethod = DOM.paymentMethodSelect.value;
        let errors = [];

        if (selectedMethod === "card") {
            errors = validateCardPaymentMethodSelection();
        } else if (selectedMethod === "paypal") {
            errors = validatePaypalMethodSelection();
        } else if (selectedMethod === "bank-transfer") {
            errors = validateBankMethodSelection();
        }

        return errors;
    }

    function validateCardPaymentMethodSelection() {
        const cardNameInput = document.getElementById("card-name");
        const cardNumberInput = document.getElementById("card-number");
        const cardExpirationInput = document.getElementById("card-expiration");
        const cardCvvInput = document.getElementById("card-cvv");
        const errors = [];

        // Clear previous error markings
        unmarkInvalidFields(document.getElementById("payment-details"));

        if (!cardNameInput.value || cardNameInput.value.length < 3) {
            errors.push("El nombre del titular de la tarjeta debe tener al menos 3 caracteres.");
            markInvalidField(document.getElementById("payment-details"), "card-holder");
        }

        if (!cardNumberInput.value || !/^\d{16}$/.test(cardNumberInput.value.replace(/\s/g, ""))) {
            errors.push("El número de tarjeta debe tener 16 dígitos.");
            markInvalidField(document.getElementById("payment-details"), "card-number");
        }

        if (!cardExpirationInput.value || !/^\d{2}\/\d{2}$/.test(cardExpirationInput.value)) {
            errors.push("La fecha de caducidad de la tarjeta debe tener el formato MM/AA.");
            markInvalidField(document.getElementById("payment-details"), "card-expiration");
        }

        if (!cardCvvInput.value || !/^\d{3}$/.test(cardCvvInput.value)) {
            errors.push("El código CVC de la tarjeta debe tener 3 dígitos.");
            markInvalidField(document.getElementById("payment-details"), "card-cvc");
        }

        return errors;
    }

    function validatePaypalMethodSelection() {
        const paypalEmailInput = document.getElementById("paypal-email");
        const errors = [];

        // Clear previous error markings
        unmarkInvalidFields(document.getElementById("payment-details"));

        if (!paypalEmailInput.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paypalEmailInput.value)) {
            errors.push("El correo electrónico de PayPal no es válido.");
            markInvalidField(document.getElementById("payment-details"), "paypal-email");
        }

        return errors;
    }

    function validateBankMethodSelection() {
        const bankReceiptFile = document.getElementById("bank-transfer-proof");
        const errors = [];

        if (!bankReceiptFile || !bankReceiptFile.files || bankReceiptFile.files.length === 0) {
            errors.push("Debe haber subido un archivo.");
        } else {
            const file = bankReceiptFile.files[0];
            if (file.type !== "application/pdf") {
                errors.push("Debe haber subido un archivo PDF válido.");
            }
        }

        return errors;
    }

    // --- Confirmation ZONE ---
    // Felicitar por la compra
    // Mostrar los datos de la compra

    function showConfirmationView() {
        showPurchaseData();
    };

    function congratulationsMessage() {
        if (document.getElementById("congratulations-message")) return;

        const message = document.createElement("div");
        message.id = "congratulations-message";
        message.innerHTML = `
        <h3>¡Gracias por tu compra!</h3>
        <p>Hemos recibido tu pedido correctamente.</p>
        `;
        DOM.step4.appendChild(message);
    }

    function showPurchaseData() {
        DOM.confirmationDetails.id = "confirmation-details";
        DOM.confirmationDetails.innerHTML = "";
        DOM.step4.appendChild(DOM.confirmationDetails);
        const products = DOM.selectedProducts.querySelectorAll("article.product");
        const productsData = [
            // { id: 1, name: "Producto 1", price: 10, quantity: 2 },
            // { id: 2, name: "Producto 2", price: 20, quantity: 1 }
        ];

        // Obtener información de los productos y almacenarlos en array de productos
        products.forEach((product) => {
            const productId = product.id; // product-1
            const productName = product.querySelector(".product-name h2").textContent; // product-1-name
            const productPrice = parseFloat(product.querySelector(".product-pricing span[id$='-price']").textContent.replace("€", "")); // product-1-price
            const productQuantity = parseInt(product.querySelector(".product-quantity input").value); // product-1-quantity

            productsData.push({
                id: productId,
                name: productName,
                price: productPrice,
                quantity: productQuantity
            });
        });

        // Insertar productos del carrito
        const purchaseData = document.createElement("div");
        purchaseData.id = "purchase-data";
        const purchaseTitle = document.createElement("h3");
        purchaseTitle.textContent = "Resumen de la compra";
        purchaseData.appendChild(purchaseTitle);
        const productContainer = document.createElement("div");
        productContainer.classList.add("product-container");
        const headerRow = document.createElement("div");
        headerRow.classList.add("row", "header");
        headerRow.innerHTML = `
        <div class="cell">Nombre</div>
        <div class="cell">Precio</div>
        <div class="cell">Cantidad</div>
        `;
        productContainer.appendChild(headerRow);

        productsData.forEach((product) => {
            const productRow = document.createElement("div");
            productRow.classList.add("row");
            productRow.innerHTML = `
            <div class="cell">${product.name}</div>
            <div class="cell">${product.price.toFixed(2)}€</div>
            <div class="cell">${product.quantity}</div>
        `;
            productContainer.appendChild(productRow);
        });

        purchaseData.appendChild(productContainer);

        // Subtotal
        const subtotalElement = document.createElement("div");
        subtotalElement.classList.add("data-row");
        subtotalElement.textContent = `Subtotal: ${document.getElementById("subtotal-price").textContent}`;
        purchaseData.appendChild(subtotalElement);

        // Porcentaje de impuesto IGIC
        const igic = 0.07;
        const igicElement = document.createElement("div");
        igicElement.classList.add("data-row");
        igicElement.textContent = `IGIC: ${(igic * 100).toFixed(2)}%`;
        purchaseData.appendChild(igicElement);

        // Descuento aplicado
        const discountElement = document.createElement("div");
        const discount = document.getElementById("discount") ? parseFloat(document.getElementById("discount").textContent) : 0;
        discountElement.classList.add("data-row");
        discountElement.textContent = `Descuento: ${discount.toFixed(2)}€`;
        purchaseData.appendChild(discountElement);

        // Insertar el total
        const totalElement = document.createElement("div");
        totalElement.classList.add("data-row");
        totalElement.textContent = `Total: ${document.getElementById("total-price").textContent}`;
        purchaseData.appendChild(totalElement);
        DOM.confirmationDetails.appendChild(purchaseData);

        // Insertar datos del cliente y dirección de envío
        const clientData = document.createElement("div");
        clientData.id = "client-data";
        clientData.innerHTML = `
        <h3>Datos del cliente</h3>
        <div>Nombre: ${document.getElementById("name").value} ${document.getElementById("surname1").value} ${document.getElementById("surname2").value}</div>
        <div>Nacionalidad: ${document.getElementById("nationality").value}</div>
        <div>DNI: ${document.getElementById("dni").value}</div>
        <div>Correo electrónico: ${document.getElementById("email").value}</div>
        <div>Teléfono: ${document.getElementById("phone-prefix").value} ${document.getElementById("mobile-phone").value}</div>
        <div>Dirección: ${document.getElementById("address").value}</div>
        <div>Ciudad: ${document.getElementById("city").value}</div>
        <div>País: ${document.getElementById("country").value}</div>
        <div>Código postal: ${document.getElementById("postal-code").value}</div>
        `;
        DOM.confirmationDetails.appendChild(clientData);

        // Insertar datos de pago
        const paymentData = document.createElement("div");
        paymentData.id = "payment-data";

        if (document.getElementById("payment-method").value === "card") {
            paymentData.innerHTML = `
            <h3>Datos de pago</h3>
            <div>Método de pago: ${document.getElementById("payment-method").value}</div>
            `;
        }
        else if (document.getElementById("payment-method").value === "paypal") {
            paymentData.innerHTML = `
            <h3>Datos de pago</h3>
            <div>Método de pago: ${document.getElementById("payment-method").value}</div>
            `;
        }
        else if (document.getElementById("payment-method").value === "bank-transfer") {
            paymentData.innerHTML = `
            <h3>Datos de pago</h3>
            <div>Método de pago: ${document.getElementById("payment-method").value}</div>
            `;
        }
        DOM.confirmationDetails.appendChild(paymentData);

        // Insertar datos de la empresa
        const companyData = document.createElement("div");
        companyData.id = "company-data";
        companyData.innerHTML = `
        <h3>Datos de la empresa</h3>
        <div>Nombre de la empresa: Guanxe</div>
        <div>CIF: B12345678</div>
        <div>Dirección: Calle Falsa 123</div>
        <div>Ciudad: Madrid</div>
        <div>País: España</div>
        <div>Código postal: 28080</div>
        `;
        DOM.confirmationDetails.appendChild(companyData);
    }
});
