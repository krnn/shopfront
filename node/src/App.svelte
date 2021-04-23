<script>
	import { onMount } from 'svelte';
    import { fetchProducts } from './service.js';
	import Shop from './screens/Shop.svelte'
	import Cart from './screens/Cart.svelte'

    onMount(fetchProducts)
</script>

<div class="relative min-h-fit bg-grey-100">
	<Shop/>
	<Cart/>
</div>