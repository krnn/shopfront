<script>
    import { filteredProducts, nameF, cartItems } from '../stores.js';
	import ProductTile from './ProductTile.svelte';

    let nameTerm = '';

    const addToCart = (data) => {
        for (let i = 0; i < $cartItems.length; i++) {
            if ($cartItems[i].id === data.id) {
                $cartItems[i].quantity++;
                $cartItems = $cartItems
                return
            }
        }
        let temp = {}
        temp.id = data.id
        temp.name = data.name
        temp.price = data.price
        temp.image_url = data.image_url
        temp.units = data.units
        temp.quantity = data.moq
        cartItems.update(items => [...items, temp])
    }

    $: nameF.set(nameTerm.toLocaleLowerCase());
</script>
    
<div class="fixed px-1 py-2 w-full bg-primary-600 shadow-md md:w-52 md:rounded-r-md md:top-1/4 text-center">
    <p class="text-white">Filter Products <i class="fas fa-filter"></i></p>
    <input class="w-48 rounded-sm focus:outline-none px-1" type="search" bind:value={nameTerm} placeholder="Product">

</div>

<div class="store-grid">
    {#each $filteredProducts as product}
        <ProductTile {product} {addToCart}/>
    {/each}
</div>