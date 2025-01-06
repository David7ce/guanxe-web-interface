document.addEventListener("DOMContentLoaded", function () {
    initializeCheckout();

    // -- Inicilization functions --
    function initializeCheckout() {
        initializeContinueButton();
        initializeRemoveButtons();
        initializeAddProductButtons();
        updateProductPriceOnQuantityChange();
        updateTotalProductPrice();
        updateTotalPrice();
        autoCompleteDataUserForm();
        addCountryToShippingZone();
        showShippingMethodByZone();
        updateTotalPriceWithShipping();
        initializePaymentMethodSelection();
    }

    function initializeContinueButton() {
        document.querySelector('#continue-button').addEventListener("click", function () {
            const currentStep = document.querySelector(".section.active");

            if (currentStep.id === "step1") {
                handleStep1ContinueClick(currentStep);
            } else if (currentStep.id === "step2") {
                handleStep2ContinueClick(currentStep);
            } else if (currentStep.id === "step3") {
                handleStep3ContinueClick();
            } else if (currentStep.id === "step4") {
                showConfirmationView();
                alert("Compra finalizada. Gracias por su compra.");
            }
        });
    }

    function goToNextStep(currentStep) {
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
            goToNextStep('1');
        } else {
            alert("La cesta está vacía. Por favor, añade productos antes de continuar.");
        }
    }

    function initializeRemoveButtons() {
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

    function initializeAddProductButtons() {
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
            goToNextStep('2');
        }
    }

    function autoCompleteDataUserForm() {
        const dniInput = document.getElementById("dni");
        const nameInput = document.getElementById("name");
        const surname1Input = document.getElementById("surname1");
        const surname2Input = document.getElementById("surname2");
        const emailInput = document.getElementById("email");
        const emailConfirmInput = document.getElementById("email-confirm");
        const phonePrefixInput = document.getElementById("phone-prefix");
        const mobilePhoneInput = document.getElementById("mobile-phone");
        const addressInput = document.getElementById("address");
        const cityInput = document.getElementById("city");
        const countryInput = document.getElementById("country");
        const postalCodeInput = document.getElementById("postal-code");

        dniInput.value = "12345678Z";
        nameInput.value = "Juan";
        surname1Input.value = "García";
        surname2Input.value = "Pérez";
        emailInput.value = "test@email.com";
        emailConfirmInput.value = "test@email.com";
        phonePrefixInput.value = "+34";
        addressInput.value = "Calle Falsa 123";
        cityInput.value = "Madrid";
        countryInput.value = "spain";
        postalCodeInput.value = "28080";
        mobilePhoneInput.value = "666777888";
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
            goToNextStep('3');
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
    
        paymentMethodSelect.addEventListener("change", function () {
            const selectedMethod = paymentMethodSelect.value;
    
            // Hide all payment details sections
            cardDetails.classList.add("hidden");
            paypalDetails.classList.add("hidden");
            bankTransferDetails.classList.add("hidden");
    
            // Show the selected payment method details
            if (selectedMethod === "card") {
                cardDetails.classList.remove("hidden");
            } else if (selectedMethod === "paypal") {
                paypalDetails.classList.remove("hidden");
            } else if (selectedMethod === "bank-transfer") {
                bankTransferDetails.classList.remove("hidden");
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

    // --- Confirmation ZONE ---
    showConfirmationView = () => {
        const step4 = document.getElementById("step4");
        step4.classList.remove("active");
        step4.setAttribute("aria-hidden", "true");

        const confirmationView = document.getElementById("confirmation");
        confirmationView.classList.add("active");
        confirmationView.setAttribute("aria-hidden", "false");

        // Mostrar los datos de la compra
        showPurchaseData();
    };

    showPurchaseData = () => {
        const selectedProducts = document.getElementById("selected-products");
        const confirmationProducts = document.getElementById("confirmation-products");
        const products = selectedProducts.querySelectorAll("article.product");

        products.forEach((product) => {
            const productId = product.id.replace("-cart", "");
            const productName = product.querySelector(".product-name h2").textContent;
            const productPrice = product.querySelector(".product-pricing span").textContent;
            const productQuantity = product.querySelector(".product-quantity input").value;
            const productTotal = product.querySelector(".product-pricing p:last-child span").textContent;

            const productTemplate = `
            <article class="product" id="${productId}-confirmation">
              <div class="product-info">
                <h2>${productName}</h2>
                <p>Precio por unidad: ${productPrice}</p>
                <p>Cantidad: ${productQuantity}</p>
                <p>Total: ${productTotal}</p>
              </div>
            </article>
            `;

            confirmationProducts.insertAdjacentHTML("beforeend", productTemplate);
        });

        // Mostrar el resto de datos de la compra
        showPurchaseDetails();
    }

    showPurchaseDetails = () => {
        const clientDataForm = document.getElementById("client-data-form");
        const formData = new FormData(clientDataForm);
        const confirmationDetails = document.getElementById("confirmation-details");

        const clientData = [
            { name: "name", label: "Nombre" },
            { name: "surname1", label: "Apellido 1" },
            { name: "surname2", label: "Apellido 2" },
            { name: "dni", label: "DNI" },
            { name: "email", label: "Correo electrónico" },
            { name: "phone-prefix", label: "Prefijo telefónico" },
            { name: "mobile-phone", label: "Número de móvil" },
            { name: "address", label: "Dirección" },
            { name: "city", label: "Ciudad" },
            { name: "country", label: "País" },
            { name: "postal-code", label: "Código postal" },
        ];

        clientData.forEach(field => {
            const fieldValue = formData.get(field.name);
            const fieldLabel = field.label;
            const fieldTemplate = `
            <p><strong>${fieldLabel}:</strong> ${fieldValue}</p>
            `;

            confirmationDetails.insertAdjacentHTML("beforeend", fieldTemplate);
        });

        // Mostrar el resto de datos de la compra
        showShippingMethod();
        showTotalPrice();
    }

    showShippingMethod = () => {
        const shippingMethodSelect = document.getElementById("shipping-method");
        const selectedMethod = shippingMethodSelect.options[shippingMethodSelect.selectedIndex].textContent;
        const confirmationShippingMethod = document.getElementById("confirmation-shipping-method");

        confirmationShippingMethod.innerHTML = `<p><strong>Método de envío:</strong> ${selectedMethod}</p>`;
    }

    showTotalPrice = () => {
        const subtotalPrice = document.getElementById("subtotal-price").textContent;
        const totalPrice = document.getElementById("total-price").textContent;
        const confirmationTotalPrice = document.getElementById("confirmation-total-price");

        confirmationTotalPrice.innerHTML = `
        <p><strong>Subtotal:</strong> ${subtotalPrice}</p>
        <p><strong>Total:</strong> ${totalPrice}</p>
        `;
    }
});
