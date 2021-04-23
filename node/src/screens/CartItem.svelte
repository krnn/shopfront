<script>
    import { cartItems } from '../stores.js'
    export let item;
    export let updateCart;

    let newQuantity = item.quantity;

    const removeFromCart = () => {
        $cartItems = $cartItems.filter(i => i.id !== item.id)
    }
    $: itemTotal = (item.price * item.quantity).toFixed(2)
</script>

<div class="relative border-b border-grey-300 py-2 last:border-none">
    <img src="{item.image_url}" class="inline-block w-12 h-12" alt="">

    <div class=" inline-block w-52 align-middle">
        <p class="text-grey-700">{item.name}</p>
        <input type="number" min="{item.moq}" bind:value={newQuantity}
        class="w-24 text-lg text-primary-900 text-right focus:outline-none rounded-t-sm border-b-2 pr-1 bg-info-100 border-info-400 focus:border-primary-400">
        <span class="text-sm text-grey-500">{item.units}</span>
    </div>
    <button class="absolute text-lg focus:outline-none text-grey-400 hover:text-accent-600" on:click={removeFromCart}>
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