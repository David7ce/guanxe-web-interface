document.addEventListener("DOMContentLoaded", function () {
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
    selectPaymentMethod();
    validatePaymentForm();



    // Inicializar los botones para eliminar producto del carrito
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

    // Inicializar los botones para agregar producto al carrito
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

    // Add event listeners to existing quantity inputs
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

    // Call updateTotalProductPrice after adding a new product to the cart
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

    // Calcular el precio total de los productos en el carrito
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

    // Botón para continuar la compra y pasar a la siguiente página
    const continueButton = document.getElementById("continue-button");

    continueButton.addEventListener("click", function () {
        const currentStep = document.querySelector(".section.active");

        if (currentStep.id === "step1") {
            const selectedProducts = document.getElementById("selected-products");
            const products = selectedProducts.querySelectorAll("article.product");

            if (products.length > 0) {
                // Ocultar la sección actual
                currentStep.classList.remove("active");
                currentStep.setAttribute("aria-hidden", "true");

                // Mostrar la sección "Datos del cliente"
                document.getElementById("step2").classList.add("active");
                document.getElementById("step2").setAttribute("aria-hidden", "false");
            } else {
                alert("La cesta está vacía. Por favor, añade productos antes de continuar.");
            }
        } else if (currentStep.id === "step2") {
            validateClientDataForm();
        } else if (currentStep.id === "step3") {
            initializePaymentMethodSelection();
            selectPaymentMethod();
            validatePaymentForm();
        } else if (currentStep.id === "step4") {
            alert("Compra finalizada. Gracias por su compra.");
        }
    });

    // Validar los datos del formulario de datos del cliente
    function validateClientDataForm() {
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
                markInvalidField(document.getElementById(field.name));
            } else if (field.validate && !field.validate(fieldValue.trim())) {
                errors.push(field.errorMessage);
                markInvalidField(document.getElementById(field.name));
            }
        });

        if (errors.length > 0) {
            generateErrorList(errors, "step2");
        } else {
            let existingErrorList = document.getElementById("data-client-errors");
            if (existingErrorList != null) {
                existingErrorList.remove();
            }
            document.getElementById("step2").classList.remove("active");
            document.getElementById("step2").setAttribute("aria-hidden", "true");
            document.getElementById("step3").classList.add("active");
            document.getElementById("step3").setAttribute("aria-hidden", "false");
        }
    }


    function markInvalidField(field) {
        field.classList.add("invalid-field");
    }

    function unmarkInvalidFields(form) {
        const invalidFields = form.querySelectorAll(".invalid-field");
        invalidFields.forEach(function (field) {
            field.classList.remove("invalid-field");
        });
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

    
    function initializePaymentMethodSelection() {
        const paymentMethodSelect = document.getElementById("payment-method");
        const paymentDetails = document.getElementById("payment-details");
        const cardDetails = document.getElementById("card-details");
        const paypalDetails = document.getElementById("paypal-details");
        const bankTransferDetails = document.getElementById("bank-transfer-details");

        paymentMethodSelect.addEventListener("change", function () {
            const selectedMethod = paymentMethodSelect.value;

            // Hide all payment details
            cardDetails.classList.add("hidden");
            paypalDetails.classList.add("hidden");
            bankTransferDetails.classList.add("hidden");

            // Show the selected payment details
            if (selectedMethod === "card") {
                cardDetails.classList.remove("hidden");
            } else if (selectedMethod === "paypal") {
                paypalDetails.classList.remove("hidden");
            } else if (selectedMethod === "bank-transfer") {
                bankTransferDetails.classList.remove("hidden");
            }
        });
    }

    function selectPaymentMethod() {
        // Selecciona entre: Tarjeta de débito/crédito, PayPal, Transferencia bancaria
        const paymentMethod = document.getElementById("payment-method");

        paymentMethod.addEventListener("change", function () {
            // If the user select one payment-method option, show the corresponding payment-details
            // If the user select another payment-method option, hide the previous payment-details and show the new one
            const selectedMethod = paymentMethod.value;
            const cardDetails = document.getElementById("card-details");
            const paypalDetails = document.getElementById("paypal-details");
            const bankTransferDetails = document.getElementById("bank-transfer-details");

            // Hide all payment details
            cardDetails.classList.add("hidden");
            paypalDetails.classList.add("hidden");
            bankTransferDetails.classList.add("hidden");

            // Show the selected payment details
            if (selectedMethod === "card") {
                cardDetails.classList.remove("hidden");
            } else if (selectedMethod === "paypal") {
                paypalDetails.classList.remove("hidden");
            } else if (selectedMethod === "bank-transfer") {
                bankTransferDetails.classList.remove("hidden");
            }
        });
    }

    function validatePaymentForm() {
        const paymentForm = document.getElementById("payment-form");
        const formData = new FormData(paymentForm);
        const errors = [];

        // Clear previous error markings
        unmarkInvalidFields(paymentForm);

        const paymentMethod = document.getElementById("payment-method").value;
        let requiredFields = [];

        if (paymentMethod === "card") {
            requiredFields = [
                { name: "card-number", label: "Número de tarjeta", validate: value => /^\d{16}$/.test(value), errorMessage: "El número de tarjeta debe tener 16 dígitos." },
                { name: "card-expiration", label: "Fecha de caducidad", validate: value => /^\d{2}\/\d{2}$/.test(value), errorMessage: "La fecha de caducidad debe tener el formato MM/AA." },
                { name: "card-cvv", label: "CVV", validate: value => /^\d{3}$/.test(value), errorMessage: "El CVV debe tener 3 dígitos." },
            ];
        } else if (paymentMethod === "paypal") {
            requiredFields = [
                { name: "paypal-email", label: "Correo electrónico de PayPal", validate: value => /\S+@\S+\.\S+/.test(value), errorMessage: "El correo electrónico de PayPal no es válido." },
            ];
        } else if (paymentMethod === "bank-transfer") {
            requiredFields = [
                { name: "bank-transfer-proof", label: "Justificante de transferencia bancaria", validate: value => value, errorMessage: "Debe subir un justificante de transferencia bancaria." },
            ];
        }

        requiredFields.forEach(field => {
            const fieldValue = formData.get(field.name);
            if (!fieldValue || !fieldValue.trim()) {
                errors.push(`El campo '${field.label}' es obligatorio.`);
                markInvalidField(document.getElementById(field.name));
            } else if (field.validate && !field.validate(fieldValue.trim())) {
                errors.push(field.errorMessage);
                markInvalidField(document.getElementById(field.name));
            }
        });

        if (errors.length > 0) {
            generateErrorList(errors, "step3");
        } else {
            document.getElementById("payment-errors").innerHTML = "";
            alert("Formulario de pago enviado.");
        }
    }

    function generateErrorList(errors, elementId) {
        const element = document.getElementById(elementId);
        let errorList = document.getElementById("generic-errors");

        if (!errorList) {
            errorList = document.createElement("div");
            errorList.id = 'generic-errors';
            errorList.classList.add("error-list");
        } else {
            errorList.innerHTML = "";
        }

        const ul = document.createElement("ul");
        errors.forEach(function (error) {
            const errorItem = document.createElement("li");
            errorItem.textContent = error;
            ul.appendChild(errorItem);
        });

        errorList.appendChild(ul);
        element.appendChild(errorList);
    }


});
