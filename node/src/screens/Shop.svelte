<script>
    import { filteredProducts, nameF, cartItems } from '../stores.js';
	import ProductTile from './ProductTile.svelte';
	import ProductDetailModal from './ProductDetailModal.svelte';
    import { addItem } from '../service.js';
    
    let selectedProduct = null
    const setSelectedProduct = (prod) => {
        selectedProduct = prod
    }
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
    
<div class="fixed px-1 py-2 w-full bg-primary-600 shadow-md md:w-52 md:rounded-r-md md:top-1/4 text-center">
    <p class="text-white">Filter Products <i class="fas fa-filter"></i></p>
    <input class="w-48 rounded-sm focus:outline-none px-1" type="search" bind:value={nameTerm} placeholder="Product">

</div>

<div class="store-grid">
    {#each $filteredProducts as product}
        <ProductTile {product} {addToCart} {setSelectedProduct}/>
    {/each}
</div>

{#if selectedProduct}
<ProductDetailModal product={selectedProduct} {setSelectedProduct}/>
{/if}