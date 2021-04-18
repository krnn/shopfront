<script>
	export let baseURL;
	import { onMount } from 'svelte';

	let products = [];

	onMount(async () => {
		products = await axios.get(`${baseURL}listproducts/`)
		.then(res => res.data);
	});
</script>

<main>
	{#each products as product}
	<div>
		<h2>{product.name}</h2>
		<p>{product.price}</p>
	</div>
	{/each}
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>