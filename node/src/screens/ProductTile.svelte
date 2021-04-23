<script>
    export let product;
    export let addToCart;
    
</script>

<div class="store-card">
    <div style="background-image: url('{product.image_url}')"
    class="bg-cover bg-center h-36 sm:h-60"></div>

    <h2 class="sm:text-lg text-grey-700">{product.name}</h2>
    <div>
        <span class="align-top text-2xl text-grey-500">&#8377;<span class="font-bold text-grey-700">{Math.trunc(product.price)}</span></span>
        <span class="align-top text-sm text-grey-500">{product.price.split(".")[1]}</span>
    </div>

    <button class="text-sm btn-m btn-w w-full sm:w-1/2" on:click="{addToCart(product, 1)}">
        <i class="fas fa-cart-arrow-down"></i> Add To Cart
    </button><button class="text-sm btn-m btn-a w-full sm:w-1/2">
        <i class="far fa-credit-card"></i> Buy Now
    </button>
</div>