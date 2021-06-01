<script>
    import { cartItems } from '../stores.js'
    import { removeItem, updateItem } from '../service.js'
    export let item;

    let newQuantity = item.quantity;
    let error = null;


    const updateCart = (data, n) => {
        if (n <= 0) {
            removeItem({userId: userId, itemId: data.id})
            $cartItems = $cartItems.filter(i => i.id !== data.id)
        } else if (n < data.product.moq) {
            error = `Minimum order quantity is ${data.product.moq}`
        } else {
            error = null
            for (let i = 0; i < $cartItems.length; i++) {
                updateItem({userId: userId, itemId: data.id, productId: data.product.id, n: n});
                if ($cartItems[i].product.id === data.product.id) {
                    $cartItems[i].quantity = n;
                    $cartItems = $cartItems
                }
            }
        }
    }


    const removeFromCart = () => {
        removeItem({userId: userId, itemId: item.id})
        $cartItems = $cartItems.filter(i => i.product.id !== item.product.id)
    }
    $: itemTotal = ((item.product.discount_price ? item.product.discount_price : item.product.price) * item.quantity).toFixed(2).toString().split(".")
</script>

<form  on:submit|preventDefault={updateCart(item, newQuantity)} class="relative border-b border-grey-300 py-2 last:border-none">
    {#if error}
        <p class="bg-accent-200 px-2 py-1 my-1 text-accent-800">{error}</p>
    {/if}
    <img src="{item.product.image_url}" class="inline-block w-12 h-12" alt="">

    <div class=" inline-block w-52 align-middle">
        <p class="text-grey-700">{item.product.name}</p>
        <input type="number" min="{item.product.moq}" bind:value={newQuantity}
        class="w-24 cart-input{error ? '-err' : ''}">
        <span class="text-sm text-grey-500">{item.product.units}</span>
    </div>
    <button type="button" class="btn-close" on:click={removeFromCart}>
        <i class="far fa-trash-alt"></i>
    </button>

    <button type="submit" hidden={newQuantity === item.quantity} class="absolute left-14 bottom-0.5 btn-p btn-m">
        <i class="fas fa-check-circle"></i> Update
    </button>
    
    <div class="text-right">
        <span class="align-top text-xl text-grey-500">&#8377;<span class="text-grey-700">{itemTotal[0]}</span></span>
        <span class="align-top text-sm text-grey-500">{itemTotal[1]}</span>
    </div>

</form>