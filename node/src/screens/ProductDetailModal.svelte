<script>
    export let product
    export let setSelectedProduct
</script>

<div class="fixed bottom-0 h-fit w-full bg-white bg-opacity-50 border-opacity-70" on:click={setSelectedProduct(null)}>
    <div class="mx-auto w-11/12 h-fit overflow-y-scroll" on:click|stopPropagation>
        <button on:click="{setSelectedProduct(null)}"><i class="fas fa-arrow-left"></i></button>
        <h1>{product.name}</h1>
        <img src="{product.image_url}" alt="{product.name}">
    </div>

</div>