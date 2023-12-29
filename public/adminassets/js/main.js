!function(e){"use strict";if(e(".menu-item.has-submenu .menu-link").on("click",function(s){s.preventDefault(),e(this).next(".submenu").is(":hidden")&&e(this).parent(".has-submenu").siblings().find(".submenu").slideUp(200),e(this).next(".submenu").slideToggle(200)}),e("[data-trigger]").on("click",function(s){s.preventDefault(),s.stopPropagation();var n=e(this).attr("data-trigger");e(n).toggleClass("show"),e("body").toggleClass("offcanvas-active"),e(".screen-overlay").toggleClass("show")}),e(".screen-overlay, .btn-close").click(function(s){e(".screen-overlay").removeClass("show"),e(".mobile-offcanvas, .show").removeClass("show"),e("body").removeClass("offcanvas-active")}),e(".btn-aside-minimize").on("click",function(){window.innerWidth<768?(e("body").removeClass("aside-mini"),e(".screen-overlay").removeClass("show"),e(".navbar-aside").removeClass("show"),e("body").removeClass("offcanvas-active")):e("body").toggleClass("aside-mini")}),e(".select-nice").length&&e(".select-nice").select2(),e("#offcanvas_aside").length){const e=document.querySelector("#offcanvas_aside");new PerfectScrollbar(e)}e(".darkmode").on("click",function(){e("body").toggleClass("dark")})}(jQuery);
function validateProductForm() {
    const productTitleInput = document.getElementById('product-title');
    const productTitleError = document.getElementById('product-title-error');

    const productPriceInput = document.getElementById('product-price');
    const productPriceError = document.getElementById('product-price-error');

    const productColorInput = document.getElementById('product-color');
    const productColorError = document.getElementById('product-color-error');

    const productBrandInput = document.getElementById('product-brand');
    const productBrandError = document.getElementById('product-brand-error');

    const productDescripitionInput = document.getElementById('product-descripition');
    const productDescripitionError = document.getElementById('product-descripition-error');

    const productBatteryCapacityInput = document.getElementById('product-batteryCapacity');
    const productBatteryCapacityError = document.getElementById('product-batteryCapacity-error');

    const productTypeInput = document.getElementById('product-type');
    const productTypeError = document.getElementById('product-type-error');

    const productQuantityInput = document.getElementById('product-quantity');
    const productQuantityError = document.getElementById('product-quantity-error');

    const productDriverUnitsInput = document.getElementById('product-driverUnits');
    const productDriverUnitsError = document.getElementById('product-driverUnits-error');

    productTitleError.textContent = '';
    productPriceError.textContent = '';
    productColorError.textContent = '';
    productBrandError.textContent = '';
    productDescripitionError.textContent = '';
    productBatteryCapacityError.textContent = '';
    productTypeError.textContent = '';
    productQuantityError.textContent = '';
    productDriverUnitsError.textContent = '';

    // Validate Product Title
    if (productTitleInput.value.trim() === '') {
        productTitleError.textContent = 'Product title is required';
        productTitleInput.focus();
        return false;
    }

    // price
    if (productPriceInput.value.trim() === '') {
        productPriceError.textContent = 'Price is required';
        productPriceInput.focus();
        return false;
    }

    // color
    if (productColorInput.value.trim() === '') {
        productColorError.textContent = 'Color is required';
        productColorInput.focus();
        return false;
    }

    // Validate Product Brand
    if (productBrandInput.value.trim() === '') {
        productBrandError.textContent = 'Brand is required';
        productBrandInput.focus();
        return false;
    }

    // description
    if (productDescripitionInput.value.trim() === '') {
        productDescripitionError.textContent = 'Description is required';
        productDescripitionInput.focus();
        return false;
    }

    // battery capacity
    if (productBatteryCapacityInput.value.trim() === '') {
        productBatteryCapacityError.textContent = 'Battery capacity is required';
        productBatteryCapacityInput.focus();
        return false;
    }

    // type
    if (productTypeInput.value.trim() === '') {
        productTypeError.textContent = 'Type is required';
        productTypeInput.focus();
        return false;
    }

    // quantity
    if (productQuantityInput.value.trim() === '') {
        productQuantityError.textContent = 'Quantity is required';
        productQuantityInput.focus();
        return false;
    }

    // driverUnits
    if (productDriverUnitsInput.value.trim() === '') {
        productDriverUnitsError.textContent = 'Driver Units is required';
        productDriverUnitsInput.focus();
        return false;
    }

    // Check for errors one more time
    if (
        productTitleError.textContent ||
        productPriceError.textContent ||
        productColorError.textContent ||
        productBrandError.textContent ||
        productDescripitionError.textContent ||
        productBatteryCapacityError.textContent ||
        productTypeError.textContent ||
        productQuantityError.textContent ||
        productDriverUnitsError.textContent
    ) {
        // Validation failed; prevent the form from submitting
        return false;
    }

    // If all validations pass, the form will be submitted
    return true;
}
