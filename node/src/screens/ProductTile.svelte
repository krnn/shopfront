<script>
	import { link } from 'svelte-spa-router';
    export let product;
    let price = product.discount_price ? product.discount_price.split(".") : product.price.split(".");
    export let addToCart;
</script>

<div class="store-card">
    <a use:link href="/product/{product.id}" class="relative w-full focus:outline-none">
        <div style="background-image: url('{product.image_url}')"
        class="bg-cover bg-center h-36 sm:h-60 rounded"></div>
    
        <h2 class="py-1 text-grey-700">{product.name}</h2>
        <div class="absolute bg-white top-1 left-1 rounded-sm inline-block whitespace-nowrap shadow">
            {#if product.discount_price}
            <span class="inline-block py-1 px-2 rounded-l-sm text-sm font-bold bg-accent-500 text-white h-full">
                { Math.round((product.price - product.discount_price)/product.price * 100) }% OFF
            </span>
            {/if}
            <p class="inline-block px-2 pt-0.5">
                <span class="align-top text-grey-500">&#8377; <span class="font-bold text-grey-700">{price[0]}</span></span>
                <span class="align-top text-xs text-grey-500 -ml-0.5">{price[1]}</span>
            </p>
        </div>
    </a>

    <button class="text-sm btn-m btn-w w-full border border-info-300 hover:border-info-200" on:click="{addToCart(product)}">
        <i class="fas fa-cart-arrow-down"></i> Add To Cart
    </button>
    <!-- <button class="text-sm btn-m btn-a w-full sm:w-1/2">
        <i class="far fa-credit-card"></i> Buy Now
    </button> -->
</div>