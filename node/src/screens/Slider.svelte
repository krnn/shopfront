<script>
    export let cover;
    export let images;
    export let videos;
    export let name;

    const currentSlide = (n) => {
        if (window.innerWidth <= 640) {
            document.getElementById('reel').style.marginTop =  (-n * 288) + "px";
        } else {
            document.getElementById('reel').style.marginTop =  (-n * 384) + "px";
        }
    }
</script>

{#if cover}
<div class="inline-block align-top">
    <div class="slider-size overflow-hidden rounded shadow-md bg-white">
        <div id="reel">
            <!--       [[[[  ERROR: THE BACKGROUND IMAGE BELOW IS CAUSING AN ERROR FOR SOME REASON  ]]]]       -->
            <div class="product-frame slider-size" style="background-image: url({cover})" alt="{name}"></div>
            
            {#if images && images.length > 0}{#each images as url}
                <div class="product-frame slider-size" style="background-image: url({url})" alt="{name}"></div>
            {/each}{/if}
            
            {#if videos && videos.length > 0}{#each videos as url}
                <iframe class="product-video slider-size" src="https://www.youtube.com/embed/{url}" title="Product video for {name}" frameborder="0"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope" allowfullscreen></iframe>
            {/each}{/if}
        </div>
    </div>

    {#if images && images.length > 0}
    <div class="slider-thumbs flex flex-wrap my-2.5">
        <button class="slider-thumb" on:click={() => currentSlide(0)} style="background-image: url({cover})"></button>
        {#each images as irl, i}
        <button class="slider-thumb" on:click={() => currentSlide(i+1)} style="background-image: url({irl})"></button>
        {/each}
        {#each videos as vrl, i}
        <button class="slider-thumb" on:click={() => currentSlide(i+1 + images.length)}><i class="fas fa-film"></i></button>
        {/each}
    </div>
    {/if}
</div>
{/if}