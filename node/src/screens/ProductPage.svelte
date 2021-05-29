<script>
	import { onMount } from 'svelte';
	import { link } from 'svelte-spa-router';
    import { isLoading, setProductDetails, productDetail, cartItems } from '../stores.js';
    import { addItem } from '../service.js';
    import Slider from './Slider.svelte';
    export let params;
    
    let error = null

    const addToCart = async (data) => {
        let addQty = document.getElementById('addQty').value
        let item = {};
        item.id = data.id;
        item.moq = data.moq;
        let n = addQty && addQty > data.moq ? addQty : data.moq
        // console.log('addQty', addQty, 'n', n, 'data.moq', data.moq);
        if (!addQty || addQty < data.moq) {
            error = `Minimum order quantity is ${data.moq}`
            // console.log('error', error);
            return
        } else {
            error = null;
            let iId = await addItem(item, n);
            for (let i = 0; i < $cartItems.length; i++) {
                if ($cartItems[i].product.id === data.id) {
                    $cartItems[i].quantity += n;
                    $cartItems = $cartItems
                    return
                }
            }
            let temp = {}
            temp.id = iId
            temp.product = {}
            temp.product = data
            temp.quantity = n
            cartItems.update(items => [...items, temp])
        }
    }

    const getProductDetail = 'hi'
    onMount(async () => {
        isLoading.set(true)
        let product = await axios.get(`/api/fullproduct/${params.id}`)
            .then(res => res.data);
        setProductDetails(product)
        // console.log($productDetail.image_urls);
    })
</script>

<div class="min-h-fit text-center">
    <p class="text-grey-400 text-sm p-2">
        <a class="text-info-700" href="/">Home</a> /
        <a class="text-info-700" use:link href="/">Store</a> /
        {$productDetail.name}
    </p>


    <Slider cover={$productDetail.image_url} images={$productDetail.image_urls} name={$productDetail.name}/>

    
    <div class="inline-block px-3 w-1/2 text-left">
        <h1 class="text-2xl">{$productDetail.name}</h1>

        {$productDetail.description}
        <form on:submit|preventDefault={addToCart($productDetail)} class="bg-white py-4 shadow-md text-center rounded">
            <input class="w-28 cart-input" type="number" name="addQty" id="addQty"
                min="{$productDetail.moq}" value={$productDetail.moq}><span 
                class="text-info-600 border-b-2 bg-info-100 border-info-400 py-1 pr-2">{$productDetail.units}</span>
            <button class="btn-p btn-m" type="submit">
                <i class="fas fa-cart-arrow-down"></i> Add To Cart
            </button>
            {#if error}
                <p class="bg-accent-200 px-2 py-1 my-1 text-accent-800">{error}</p>
            {/if}
        </form>
    </div>

</div>
