<script>
	import { onMount } from 'svelte';
    import { fetchProducts, fetchCart } from './service.js';
	import Shop from './screens/Shop.svelte'
	import Cart from './screens/Cart.svelte'

    onMount(fetchProducts)
    onMount(fetchCart)
</script>

<div class="relative min-h-fit bg-grey-100">
	<Shop/>
	<Cart/>
</div>