<script>
    // import { userLocation } from "../stores"

    export let item
    // $: itemTotal = ((item.product.discount_price ? item.product.discount_price : item.product.price) * item.quantity).toFixed(2).toString().split(".")
</script>

<div class="relative md:text-left tx0 border-b border-grey-300 py-2 last:border-none">
    <div class="inline-block text-base align-middle md:w-5/6">
        <img src="{item.product.image_url}" class="inline-block w-12 h-12" alt="{item.product.name}">

        <a href="/store/#/product/{item.product.id}" class="block text-grey-600 md:inline-block md:w-7/12 md:ml-5 font-bold align-middle">{item.product.name}}</a>
        <p class="text-grey-800 md:inline-block md:w-3/12 md:ml-5">
            {item.product.price} <span class="text-grey-500">&#10799</span>{item.quantity}
            <span class="text-sm text-grey-500">{item.product.units}</span>
        </p>
    </div>
    
    <!-- {#if $userLocation=="IN"}
    <div class="text-right md:inline-block md:w-1/6 md:align-middle">
        <span class="align-top text-xl text-grey-500 get">&#8377;<span class="text-grey-700">{itemTotal}</span></span>
    </div>
    {/if} -->

</div>