<script>
	import { link } from 'svelte-spa-router';
    import { addItem } from '../service.js';
    import { cartItems, userLocation } from '../stores.js';
    import CheckoutItem from './CheckoutItem.svelte'

    // $: cartTotal = $cartItems.length ? $cartItems.map(i => (i.quantity * (i.product.discount_price ? i.product.discount_price : i.product.price))).reduce((acc, cur) => acc + cur).toFixed(2) : 0
</script>

<div class="min-h-fit text-center">
    <p class="text-grey-400 text-sm p-3 pb-6 text-left">
        <a class="text-info-700" href="/">Home</a> /
        <a class="text-info-700" use:link href="/">Store</a> /
        Checkout
    </p>
    <h1 class="text-grey-900 text-center text-2xl font-bold">Checkout</h1>

    <div class="inline-block bg-white w-full max-w-hd shadow-md align-top p-4 rounded-md my-4 mx-auto">
        <div class="text-left">
            <a href="/store" class="btn-w btn-m text-sm"><i class="fas fa-arrow-left"></i> Back to Store</a>
        </div>
        <h1 class="text-grey-600 text-left text-lg">Order Summary</h1>
        
        {#each $cartItems as item}
        <CheckoutItem {item} />
        {/each}

        <!-- <p class="text-right text-grey-500 my-3"> Shipping Charges
            <span class="text-xl w-32 inline-block">&#8377;<span class="text-grey-700">1000.00</span></span>
        </p>

        <p class="text-right text-grey-500">Total Amount Payable
            <span class="text-2xl w-32 inline-block">&#8377;<span class="font-bold text-grey-900">{cartTotal}</span></span>
        </p> -->
        <form class="text-grey-500 my-3">
            <div class="inline-block w-1/2">
                <input class="form-input" type="email" name="email" placeholder="Email Address">
            </div>
            <button class="btn-m btn-p">Get Pricing</button>
        </form>
    </div>

    

    <!-- <div id="checkout-form" class="bg-white rounded-md shadow-md py-4 my-4 align-top relative {% if customer %}hidden{% else %}inline-block{% endif %}">
        <form id="checkout-form" method="POST" class="inline-block text-left px-4">
            {% csrf_token %}
            <h2 class="text-center text-lg text-grey-700 py-1">Shipping Details</h2>

            <div class="inline-block w-80">
                <label class="form-label" for="company">Company Name</label>
                <input class="form-input co-input" type="text" name="company"
                {% if customer.company %}
                value="{{customer.company}}"
                {% endif %}
                >
            </div>
            <br>
            <div class="inline-block w-80">
                <label class="form-label" for="address1">Address 1<b>*</b></label>
                <input class="form-input co-input" type="text" name="address1" required
                {% if customer.address1 %}
                value="{{customer.address1}}"
                {% endif %}
                >
            </div>
            <br>
            <div class="inline-block w-80">
                <label class="form-label" for="address2">Address 2 (Optional)</label>
                <input class="form-input co-input" type="text" name="address2"
                {% if customer.address2 %}
                value="{{customer.address2}}"
                {% endif %}
                >
            </div>
            <br>

            <div class="inline-block w-56">
                <label class="form-label" for="email">City<b>*</b></label>
                <input class="form-input co-input" type="text" name="city" required
                {% if customer.city %}
                value="{{customer.city}}"
                {% endif %}
                >
            </div>

            <div class="inline-block w-24">
                <label class="form-label" for="pincode">Pincode<b>*</b></label>
                <input class="form-input co-input" type="number" name="pincode" required
                {% if customer.pincode %}
                value="{{customer.pincode}}"
                {% endif %}
                >
            </div>
            <br>

            <div class="inline-block w-40">
                <label class="form-label" for="state">State</label>
                <input class="form-input co-input" type="text" name="state"
                {% if customer.state %}
                value="{{customer.state}}"
                {% endif %}
                >
            </div>

            <div class="inline-block w-40">
                <label class="form-label" for="country">Country</label>
                <input class="form-input co-input" type="text" name="country"
                {% if customer.country %}
                value="{{customer.country}}"
                {% endif %}
                >
            </div>
            <br>

            <button id="checkout-btn" type="submit" class="mt-4 w-80 text-lg btn-p btn-m">
                <i class="fas fa-clipboard-check"></i>
                Confirm Billing Details
            </button>
        </form>

        {% if user.is_authenticated == False %}
        <div class="absolute top-0 left-0 rounded-md bg-white bg-opacity-80 h-full w-full">
            <div class="bg-white rounded-md p-3 w-2/3 mx-auto my-28 border border-info-400 shadow-md">
                <p class="text-grey-600 text-sm">Login or register to continue</p>

                <button class="btn-m btn-p w-2/3 my-4" onclick="toggleAuthModal('L')">Login</button>
                <br>
                <button class="btn-m btn-a w-2/3" onclick="toggleAuthModal('R')">Sign Up</button>
            </div>
        </div>
        {% endif %}
    </div>

    {% if customer %}
    <div id="checkout-display" class="bg-white inline-block rounded-md shadow-md p-4 my-4 align-top">
        <h2 class="text-center text-lg text-grey-700 py-1">Shipping Details</h2>
                {% if customer.company %}
                    <p class="text-grey-600 text-left">{{customer.company}}</p>
                {% endif %}

                <p class="text-grey-600 text-left w-80">{{customer.address1}}</p>

                {% if customer.address2 %}
                    <p class="text-grey-600 text-left">{{customer.address2}}</p>
                {% endif %}

                <p class="text-grey-600 text-left">{{customer.city}} - {{customer.pincode}}</p>

                <p class="text-grey-600 text-left">
                {% if customer.state %}{{customer.state}}{% endif %}
                {% if customer.country %}{{customer.country}}{% endif %}
                </p>

                <button class="btn-w btn-m text-sm" onclick="showShippingForm()">Edit Details</button>
    </div>
    
    
    <section id="payment-sect" class="bg-white rounded-md shadow-md p-4 my-8 mx-2 inline-block align-top">
        <h2>Make Payment</h2>
        <a href="{% url 'processorder' %}" class="btn-p btn-m" onclick="showShippingForm()">Make Payment</a>
    </section>
    {% endif %} -->

</div>