<script>
	import { onMount } from 'svelte';
	import { link } from 'svelte-spa-router';
    import { isLoading, userLocation, setProductDetails, productDetail, cartItems } from '../stores.js';
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

<div class="min-h-fit text-center">
    <p class="text-grey-400 text-sm p-3 pb-6 text-left">
        <a class="text-info-700" href="/">Home</a> /
        <a class="text-info-700" use:link href="/">Store</a> /
        {$productDetail.name}
    </p>


    <Slider cover={$productDetail.image_url} images={$productDetail.image_urls} videos={$productDetail.video_urls} name={$productDetail.name}/>

    
    <div class="inline-block px-3 md:w-1/2 text-left">
        <h1 class="text-2xl">
            {$productDetail.name}
            {#if $userLocation === 'IN' && $productDetail.discount_price}
            <span class="inline-block px-1 text-lg rounded font-bold bg-accent-500 text-white h-full">
                { Math.round(($productDetail.price - $productDetail.discount_price)/$productDetail.price * 100) }% OFF
            </span>
            {/if}
        </h1>

        {$productDetail.description}
        <form on:submit|preventDefault={addToCart($productDetail)} class="bg-white p-4 shadow-md text-center rounded">
            {#if $userLocation === 'IN'}
            <div class="inline-block mr-4 align-bottom text-2xl">
                <p class="text-grey-400 text-xs -mb-1">Unit Price</p>
                <p class="inline-block {$productDetail.discount_price ? 'text-accent-500 opacity-60 line-through' : 'text-grey-500'}">
                    <span class="align-top ">&#8377;<span class="font-bold {$productDetail.discount_price ? 'text-accent-700' : 'text-grey-700'}"
                        >{Math.trunc($productDetail.price)}</span></span>
                    <span class="align-top -ml-1 text-sm">{String($productDetail.price).split(".")[1]}</span>
                </p>
                
                {#if $productDetail.discount_price}
                    <i class="text-primary-600 fas fa-caret-right"></i>
                    <span class="align-top text-grey-500">&#8377;<span class="font-bold text-grey-700">{Math.trunc($productDetail.discount_price)}</span></span>
                    <span class="align-top -ml-1 text-sm text-grey-500">{String($productDetail.discount_price).split(".")[1]}</span>
                {/if}
            </div>
            {/if}

            <div class="inline-block mr-4 align-bottom">
                <p class="text-grey-400 text-xs">Quantity (min. {$productDetail.moq} {$productDetail.units})</p>
                <input class="w-24 cart-input" type="number" name="addQty" id="addQty"
                    min="{$productDetail.moq}" value={$productDetail.moq}><span 
                    class="text-info-600 border-b-2 bg-info-100 border-info-400 pb-1 pt-1.5 -ml-1 px-2">{$productDetail.units}</span>
            </div>
            <button class="btn-p btn-m mt-2" type="submit">
                <i class="fas fa-cart-arrow-down"></i> Add To Cart
            </button>
            {#if error}
                <p class="bg-accent-200 px-2 py-1 my-1 text-accent-800">{error}</p>
            {/if}
        </form>
        
    </div>

</div>
{/if}
