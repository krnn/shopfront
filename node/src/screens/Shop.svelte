<script>
	import { onMount } from 'svelte';
    import { isLoading, hasLoadedProducts, filteredProducts, nameF, cartItems } from '../stores.js';
	import ProductTile from './ProductTile.svelte';
    import { fetchProducts, addItem } from '../service.js';

    onMount(() => {
        if ($hasLoadedProducts) isLoading.set(false)
        else fetchProducts()
    })
    let nameTerm = '';

    const addToCart = async(data) => {
        let item = {};
        item.id = data.id;
        item.moq = data.moq;
        
        let iId = await addItem(item, 1);
        for (let i = 0; i < $cartItems.length; i++) {
            if ($cartItems[i].product.id === data.id) {
                $cartItems[i].quantity++;
                $cartItems = $cartItems
                return
            }
        }
        let temp = {}
        temp.id = iId
        temp.product = {}
        temp.product = data
        temp.quantity = data.moq
        cartItems.update(items => [...items, temp])
    }

    $: nameF.set(nameTerm.toLocaleLowerCase());
</script>


{#if $isLoading}
<div class="w-full h-fit flex justify-center items-center flex-col">
    <p class="text-grey-500 mb-5">Loading...</p>
    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
        <path fill="#C779D0" d="M25,5A20.14,20.14,0,0,1,45,22.88a2.51,2.51,0,0,0,2.49,2.26h0A2.52,2.52,0,0,0,50,22.33a25.14,25.14,0,0,0-50,0,2.52,2.52,0,0,0,2.5,2.81h0A2.51,2.51,0,0,0,5,22.88,20.14,20.14,0,0,1,25,5Z">
          <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.5s" repeatCount="indefinite"/>
        </path>
    </svg>      
</div>
{:else}

<section>
    <div class="fixed px-1 py-2 w-full bg-primary-600 shadow-md md:w-52 md:rounded-r-md md:top-1/4 text-center z-30">
        <p class="text-white">Filter Products <i class="fas fa-filter"></i></p>
        <input class="w-48 rounded-sm focus:outline-none px-1" type="search" bind:value={nameTerm} placeholder="Product">
    </div>

    <div class="store-grid">
        {#each $filteredProducts as product}
            <ProductTile {product} {addToCart}/>
        {/each}
    </div>
</section>
{/if}