document.addEventListener("DOMContentLoaded", function () {
    initializeContinueButton();
    step1();
    step2();
    step3();
    step4();

    // -- Inicilization functions --
    function step1() {
        initializeRemoveProduct();
        initializeAddProduct();
        updateProductPriceOnQuantityChange();
        updateTotalProductPrice();
        updateTotalPrice();
    }

    function step2() {
        addCountryToShippingZone();
        showShippingMethodByZone();
        autoCompleteDataUserForm();
    }

    function step3() {
        updateTotalPriceWithShipping();
        initializePaymentMethodSelection();
        autoCompleteDataPaymentForm();
    }

    function step4() {
        showConfirmationView();
    }

    function initializeContinueButton() {
        document.querySelector('#continue-button').addEventListener("click", function () {
            const currentStep = document.querySelector(".section.active");

            if (currentStep.id === "step1") {
                handleStep1ContinueClick();
            } else if (currentStep.id === "step2") {
                handleStep2ContinueClick();
            } else if (currentStep.id === "step3") {
                handleStep3ContinueClick();
            } else if (currentStep.id === "step4") {
                showConfirmationView();
            }
        });
    }

    function showNextStep(currentStep) {
        const currentStepElement = document.getElementById(`step${currentStep}`);
        const nextStepElement = document.getElementById(`step${parseInt(currentStep) + 1}`);

        if (!currentStepElement) {
            console.error(`Current step element not found: step${currentStep}`);
            return;
        }

        if (!nextStepElement) {
            console.error(`Next step element not found: step${parseInt(currentStep) + 1}`);
            return;
        }

        currentStepElement.classList.remove("active");
        currentStepElement.setAttribute("aria-hidden", "true");
        nextStepElement.classList.add("active");
        nextStepElement.setAttribute("aria-hidden", "false");
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

    function validateFields(fields, formData, errors) {
        fields.forEach(field => {
            const value = formData.get(field);
            if (!value) {
                errors.push(`El campo ${field} es obligatorio.`);
            }
        });
    }

    // --- Products ZONE ---
    function handleStep1ContinueClick() {
        const selectedProducts = document.getElementById("selected-products");
        const products = selectedProducts.querySelectorAll("article.product");

        if (products.length > 0) {
            showNextStep('1');
        } else {
            alert("La cesta está vacía. Por favor, añade productos antes de continuar.");
        }
    }

    function initializeRemoveProduct() {
        const removeButtons = document.querySelectorAll(".remove-product");

        removeButtons.forEach((button) => {
            button.addEventListener("click", function (event) {
                const productArticle = event.target.closest("article.product");
                if (productArticle) {
                    productArticle.remove();
                    updateTotalPrice();
                }
            });
        });
    }

    function initializeAddProduct() {
        const addProductButtons = document.querySelectorAll(".add-product");

        addProductButtons.forEach((button) => {
            button.addEventListener("click", addProductToCart);
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
                updateTotalProductPrice();
            });
        });
    }

    function addProductToCart(event) {
        const product = event.target.closest("article.product");
        const productId = product.id;
        const productName = product.querySelector(".product-name h2").textContent;
        const productPrice = parseFloat(
            product
                .querySelector(".product-pricing span")
                .textContent.replace("€", "")
        );
        const selectedProducts = document.getElementById("selected-products");
        const imgSrc = product.querySelector(".product-img img").getAttribute("src");

        // Check if the product is already in the cart
        let cartItem = selectedProducts.querySelector(`#${productId}-cart`);
        if (cartItem) {
            // If the product is already in the cart, increase the quantity
            let quantityInput = cartItem.querySelector(".product-quantity input");
            quantityInput.value = parseInt(quantityInput.value) + 1;
        } else {
            // Create a new product element
            const productTemplate = `
            <article class="product" id="${productId}-cart" aria-labelledby="${productId}-name">
              <figure class="product-img">
                <img src="${imgSrc}" alt="${productName}" />
              </figure>
              <section class="product-info">
                <div class="product-name">
                  <h2 id="${productId}-name">${productName}</h2>
                  <button class="remove-product" aria-label="Eliminar producto">
                    <img src="../../img/icon/trash.svg" alt="Eliminar producto" class="icon-trash" />
                  </button>
                </div>
                <div class="product-quantity">
                  <label for="${productId}-quantity">Unidades:</label>
                  <input type="number" id="${productId}-quantity" value="1" min="0" max="99" aria-label="Número de unidades disponibles" />
                </div>
                <div class="product-pricing">
                  <p>Precio por unidad: <span id="${productId}-price">${productPrice.toFixed(2)}€</span></p>
                  <p>Total: <span id="${productId}-total">${productPrice.toFixed(2)}€</span></p> <!-- Initialize total price -->
                </div>
              </section>
            </article>
            `;

            // Append the new product to the selected products
            selectedProducts.insertAdjacentHTML("beforeend", productTemplate);
        }

        // Update the total price with the added number
        updateProductPriceOnQuantityChange();
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

    function updateTotalPrice() {
        const subtotalElement = document.getElementById("subtotal-price");
        const totalElement = document.getElementById("total-price");
        const totalUnitPrice = document.querySelectorAll(".product-pricing span[id$='-total']");
        const shippingMethodSelect = document.getElementById("shipping-method");
        const igic = 0.07;
        let subtotal = 0;

        totalUnitPrice.forEach((totalUnitePrice) => {
            const price = parseFloat(totalUnitePrice.textContent.replace("€", ""));
            subtotal += price;
        });

        subtotalElement.textContent = `${subtotal.toFixed(2)}€`;

        let total = (igic + 1) * subtotal;

        const selectedMethod = shippingMethodSelect.options[shippingMethodSelect.selectedIndex];
        if (selectedMethod && selectedMethod.dataset.price) {
            total += parseFloat(selectedMethod.dataset.price);
        }

        totalElement.textContent = `${total.toFixed(2)}€`;
    }


    // --- Client data ZONE ---
    function handleStep2ContinueClick() {
        const errors = validateClientData();

        if (errors.length > 0) {
            generateErrorList(errors, "step2");
        } else {
            showNextStep('2');
        }
    }

    function autoCompleteDataUserForm() {
        const dniInput = document.getElementById("dni");
        const nameInput = document.getElementById("name");
        const surname1Input = document.getElementById("surname1");
        const surname2Input = document.getElementById("surname2");
        const nationality = document.getElementById("nationality");
        const emailInput = document.getElementById("email");
        const emailConfirmInput = document.getElementById("email-confirm");
        const phonePrefixInput = document.getElementById("phone-prefix");
        const mobilePhoneInput = document.getElementById("mobile-phone");
        const addressInput = document.getElementById("address");
        const cityInput = document.getElementById("city");
        const countryInput = document.getElementById("country");
        const postalCodeInput = document.getElementById("postal-code");
        const shippingMethodSelect = document.getElementById("shipping-method");
        const firstOption = shippingMethodSelect.options[1];

        dniInput.value = "12345678Z";
        nameInput.value = "Juan";
        surname1Input.value = "García";
        surname2Input.value = "Pérez";
        nationality.value = "spanish";
        emailInput.value = "test@email.com";
        emailConfirmInput.value = "test@email.com";
        phonePrefixInput.value = "+34";
        addressInput.value = "Calle Falsa 123";
        cityInput.value = "Madrid";
        countryInput.value = "spain";
        postalCodeInput.value = "28080";
        mobilePhoneInput.value = "666777888";
        if (firstOption) {
            firstOption.selected = true;
        }
    }

    function validateClientData() {
        const clientDataForm = document.getElementById("client-data-form");
        const formData = new FormData(clientDataForm);
        const errors = [];

        // Clear previous error markings
        unmarkInvalidFields(clientDataForm);

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
            { name: "postal-code", label: "Código postal", validate: value => /^\d{5}$/.test(value), errorMessage: "El código postal debe tener 5 dígitos." },
        ];

        const shippingMethodElement = document.getElementById("shipping-method");
        if (shippingMethodElement) {
            requiredFields.push({ name: "shipping-method", label: "Método de envío" });
        }

        requiredFields.forEach(field => {
            const fieldValue = formData.get(field.name);
            if (!fieldValue || !fieldValue.trim()) {
                errors.push(`El campo '${field.label}' es obligatorio.`);
                markInvalidField(clientDataForm, field.name);
            } else if (field.validate && !field.validate(fieldValue.trim())) {
                errors.push(field.errorMessage);
                markInvalidField(clientDataForm, field.name);
            }
        });

        return errors;
    }

    function addCountryToShippingZone() {
        const countrySelect = document.getElementById("country");
        const shippingZone = document.getElementById("shipping-zone");

        countrySelect.addEventListener("change", function () {
            const selectedCountry = countrySelect.value;
            shippingZone.textContent = selectedCountry;
        });

        // Set the value of the shipping zone
        shippingZone.textContent = countrySelect.value;
    }

    function showShippingMethodByZone() {
        const shippingMethod = document.getElementById("shipping-method");
        const countrySelect = document.getElementById("country");
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
            const selectedCountry = countrySelect.value;
            const zone = shippingZones[selectedCountry] || "zone3";
            const methods = shippingMethods[zone] || [];

            shippingMethod.innerHTML = '<option value="">Seleccione un método de envío</option>';
            shippingMethod.disabled = methods.length === 0;

            methods.forEach(method => {
                const option = document.createElement("option");
                option.value = method.method;
                option.textContent = `${method.method} (${method.price}€)`;
                option.dataset.price = method.price;
                shippingMethod.appendChild(option);
            });
        }

        // Comentar si no uso autocompletado
        countrySelect.addEventListener("change", updateShippingMethods);
        updateShippingMethods();
    }

    function updateTotalPriceWithShipping() {
        const shippingMethod = document.getElementById("shipping-method");

        // valor del option seleccionado con dataset.price
        shippingMethod.addEventListener("change", updateTotalPrice);
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
        const paymentMethodSelect = document.getElementById("payment-method");
        const cardDetails = document.getElementById("card-details");
        const paypalDetails = document.getElementById("paypal-details");
        const bankTransferDetails = document.getElementById("bank-transfer-details");

        if (!paymentMethodSelect || !cardDetails || !paypalDetails || !bankTransferDetails) {
            console.error("One or more payment method elements are missing");
            return;
        }

        // Hide all payment details sections by default
        cardDetails.style.display = "none";
        paypalDetails.style.display = "none";
        bankTransferDetails.style.display = "none";

        paymentMethodSelect.addEventListener("change", function () {
            const selectedMethod = paymentMethodSelect.value;

            // Hide all payment details sections
            cardDetails.style.display = "none";
            paypalDetails.style.display = "none";
            bankTransferDetails.style.display = "none";

            // Show the selected payment method details
            if (selectedMethod === "card") {
                cardDetails.style.display = "block";
            } else if (selectedMethod === "paypal") {
                paypalDetails.style.display = "block";
            } else if (selectedMethod === "bank-transfer") {
                bankTransferDetails.style.display = "block";
            }
        });
    }

    function validatePaymentMethodSelection() {
        const paymentMethodSelect = document.getElementById("payment-method");
        const selectedMethod = paymentMethodSelect.value;
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

        if (!cardNumberInput.value || !/^\d{16}$/.test(cardNumberInput.value)) {
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

    function autoCompleteDataPaymentForm() {
        const cardNameInput = document.getElementById("card-name");
        const cardNumberInput = document.getElementById("card-number");
        const cardExpirationInput = document.getElementById("card-expiration");
        const cardCvvInput = document.getElementById("card-cvv");
        // const paypalEmailInput = document.getElementById("paypal-email");

        cardNameInput.value = "Juan García";
        cardNumberInput.value = "1234567812345678";
        cardExpirationInput.value = "12/23";
        cardCvvInput.value = "123";
        // paypalEmailInput.value = "test@paypal.com";

    }

    // --- Confirmation ZONE ---
    // Felicitar por la compra
    // Mostrar los datos de la compra

    function showConfirmationView() {
        const step4 = document.getElementById("step4");
        if (step4) {
            step4.classList.remove("active");
            step4.setAttribute("aria-hidden", "true");
        }

        showCongratulations();
        showPurchaseData();
    };

    function showCongratulations() {
        const divStep4 = document.getElementById("step4");
        const congratulationsMessage = document.createElement("div");
        congratulationsMessage.classList.add("congratulations-message");
        congratulationsMessage.innerHTML = `
            <h2>Confirmación de compra</h2>
            <p>Aquí tienes un resumen de tu compra.</p>
        `;
        divStep4.appendChild(congratulationsMessage);
    }

    function showPurchaseData() {
        const divStep4 = document.getElementById("step4");
        const confirmationDetails = document.createElement("div");
        confirmationDetails.id = "confirmation-details";
        divStep4.appendChild(confirmationDetails);
        const selectedProducts = document.getElementById("selected-products");
        const products = selectedProducts.querySelectorAll("article.product");
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
        confirmationDetails.appendChild(purchaseData);

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
        confirmationDetails.appendChild(clientData);

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
        confirmationDetails.appendChild(paymentData);

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
        confirmationDetails.appendChild(companyData);
    }
});
