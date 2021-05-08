<script>
    import { fade, fly } from 'svelte/transition';
    import { cartItems } from '../stores.js';
    import CartItem from './CartItem.svelte';
    import { updateItem, removeItem } from '../service.js';

    let showCart = false;

    const updateCart = (data, n) => {
        if (n <= 0) {
            removeItem({userId: userId, itemId: data.id})
            $cartItems = $cartItems.filter(i => i.id !== data.id)
        } else if (n < data.product.moq) {
            
        } else {
            for (let i = 0; i < $cartItems.length; i++) {
                updateItem({userId: userId, itemId: data.id, n: n});
                if ($cartItems[i].product.id === data.product.id) {
                    $cartItems[i].quantity = n;
                    $cartItems = $cartItems
                }
            }
        }
    }

    const toggleCart = () => showCart = !showCart;
    $: cartTotal = $cartItems.length ? $cartItems.map(i => (i.quantity * i.product.price)).reduce((acc, cur) => acc + cur).toFixed(2) : 0
</script>

<button class="btn-cart" on:click={toggleCart}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7.94 7.94" height="30" width="30">
        <g transform="translate(0 -289)" stroke="#4f46e5" fill="none" stroke-width=".53" stroke-linecap="round" stroke-linejoin="round">
          <path d="M.33 290.34l1.16.1 1.05 4.48h3.82"/>
          <ellipse cx="1.99" cy="295.56" rx=".66" ry=".65"/>
          <ellipse cy="295.56" cx="6.36" rx=".66" ry=".65"/>
          <path d="M2.3 293.88h4.44l.7-2.4-5.84-.55"/>
        </g>
      </svg>
    {#if $cartItems.length}
    <div class="bg-accent-500 w-5 h-5 rounded-xl absolute top-1 right-1 text-white text-sm">
        {$cartItems.length}
    </div>
    {/if}
</button>


{#if showCart} 
<div transition:fly class="fixed flex bottom-0 left-0 w-screen bg-white bg-opacity-50 z-30 md:z-40">
    <span class="h-fit cart-overlay" on:click={toggleCart}></span>
    <div class="h-fit w-80 bg-white border-l border-grey-200 p-5 shadow-md">
        <h2>Cart</h2>
        
        <div class="cart-list">
    
            {#if $cartItems.length}
            {#each $cartItems as item (item.product.id)}
            <CartItem {item} {updateCart}/>
            {/each}
            {:else}
            <p transition:fade class="text-grey-400 text-center text-sm">Cart is empty</p>
            {/if}
            
        </div>
        
        <div class="text-right my-3">
            Total
            <span class="align-top text-2xl text-grey-500">&#8377;<span class="font-bold text-grey-700">{Math.trunc(cartTotal)}</span></span>
            <span class="align-top text-sm text-grey-500">{cartTotal ? (cartTotal).toString().split(".")[1] : "00"}</span>
        </div>
        <a href="/api/checkout" class="inline-block text-center text-lg btn-m btn-a w-full">
            <i class="fas fa-cash-register"></i>
            Proceed To Checkout
        </a>
    </div>
</div>
{/if}
