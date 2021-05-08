<script>
    import { cartItems } from '../stores.js'
    import { removeItem } from '../service.js'
    export let item;
    export let updateCart;

    let newQuantity = item.quantity;

    const removeFromCart = () => {
        removeItem({userId: userId, itemId: item.id})
        $cartItems = $cartItems.filter(i => i.product.id !== item.product.id)
    }
    $: itemTotal = (item.product.price * item.quantity).toFixed(2)
</script>

<div class="relative border-b border-grey-300 py-2 last:border-none">
    <img src="{item.product.image_url}" class="inline-block w-12 h-12" alt="">

    <div class=" inline-block w-52 align-middle">
        <p class="text-grey-700">{item.product.name}</p>
        <input type="number" min="{item.product.moq}" bind:value={newQuantity}
        class="w-24 cart-input">
        <span class="text-sm text-grey-500">{item.product.units}</span>
    </div>
    <button class="btn-close" on:click={removeFromCart}>
        <i class="far fa-trash-alt"></i>
    </button>


    <button hidden={newQuantity === item.quantity} class="absolute left-14 bottom-0.5 btn-p btn-m" on:click={updateCart(item, newQuantity)}>
        <i class="fas fa-check-circle"></i> Update
    </button>
    
    <div class="text-right">
        <span class="align-top text-xl text-grey-500">&#8377;<span class="text-grey-700">{Math.trunc(itemTotal)}</span></span>
        <span class="align-top text-sm text-grey-500">{(itemTotal).toString().split(".")[1]}</span>
    </div>

</div>