<script>
	import { onMount } from 'svelte';
	import Router from 'svelte-spa-router';
    import { fetchCart } from './service.js';
	import Cart from './screens/Cart.svelte'
	import Shop from './screens/Shop.svelte'
	import ProductPage from './screens/ProductPage.svelte'

    onMount(fetchCart)
</script>
<div class="relative min-h-fit bg-grey-100">
	<Router routes={{
		'/': Shop,
		'/product/:id': ProductPage,
	}} />
	<Cart/>
</div>