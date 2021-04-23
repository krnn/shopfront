
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.37.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const baseURL = 'http://localhost:8000/api/';

    const isLoading = writable(false);

    const productsList = writable([]);

    // Properties to filter by
    const nameF = writable('');

    // Derived store with filtered list of products
    const filteredProducts = derived(
        [productsList, nameF],
        ([$productlist, $nameF]) => $productlist.filter(p => p.name.toLowerCase().includes($nameF))
    );

    // Populate productsList store
    const setFetchedProducts = (data) => {
        productsList.set(data);
    	isLoading.set(false);
    };

    // Cart items
    const cartItems = writable([]);

    // // Add product to cartItems
    // export const addToCart = (data) => {
    //     console.log("data", data.id);
    //     // console.log("$productsList", $productsList);
    //     console.log("cartItems.length", cartItems.length);
    //     for (let i = 0; i < cartItems.length; i++) {
    //         console.log("item", cartItems[i].id);
    //         if (cartItems[i].id === data.id) {
    //             // cartItems[i].qty++;
    //             return
    //         }
    //     }
    //     data.qty = data.moq
    //     cartItems.update(items => [...items, data])
    // }

    const fetchProducts = async () => {
        isLoading.set(true);
        let products = await axios.get(`${baseURL}listproducts/`)
            .then(res => res.data);
        setFetchedProducts(products);
    };

    /* src/screens/ProductTile.svelte generated by Svelte v3.37.0 */

    const file$4 = "src/screens/ProductTile.svelte";

    function create_fragment$4(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let h2;
    	let t1_value = /*product*/ ctx[0].name + "";
    	let t1;
    	let t2;
    	let div1;
    	let span1;
    	let t3;
    	let span0;
    	let t4_value = Math.trunc(/*product*/ ctx[0].price) + "";
    	let t4;
    	let t5;
    	let span2;
    	let t6_value = /*product*/ ctx[0].price.split(".")[1] + "";
    	let t6;
    	let t7;
    	let button0;
    	let i0;
    	let t8;
    	let button1;
    	let i1;
    	let t9;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = space();
    			h2 = element("h2");
    			t1 = text(t1_value);
    			t2 = space();
    			div1 = element("div");
    			span1 = element("span");
    			t3 = text("₹");
    			span0 = element("span");
    			t4 = text(t4_value);
    			t5 = space();
    			span2 = element("span");
    			t6 = text(t6_value);
    			t7 = space();
    			button0 = element("button");
    			i0 = element("i");
    			t8 = text(" Add To Cart\n    ");
    			button1 = element("button");
    			i1 = element("i");
    			t9 = text(" Buy Now");
    			set_style(div0, "background-image", "url('" + /*product*/ ctx[0].image_url + "')");
    			attr_dev(div0, "class", "bg-cover bg-center h-36 sm:h-60");
    			add_location(div0, file$4, 7, 4, 104);
    			attr_dev(h2, "class", "sm:text-lg text-grey-700");
    			add_location(h2, file$4, 10, 4, 218);
    			attr_dev(span0, "class", "font-bold text-grey-700");
    			add_location(span0, file$4, 12, 62, 347);
    			attr_dev(span1, "class", "align-top text-2xl text-grey-500");
    			add_location(span1, file$4, 12, 8, 293);
    			attr_dev(span2, "class", "align-top text-sm text-grey-500");
    			add_location(span2, file$4, 13, 8, 435);
    			add_location(div1, file$4, 11, 4, 279);
    			attr_dev(i0, "class", "fas fa-cart-arrow-down");
    			add_location(i0, file$4, 17, 8, 630);
    			attr_dev(button0, "class", "text-sm btn-m btn-w w-full sm:w-1/2");
    			add_location(button0, file$4, 16, 4, 534);
    			attr_dev(i1, "class", "far fa-credit-card");
    			add_location(i1, file$4, 19, 8, 755);
    			attr_dev(button1, "class", "text-sm btn-m btn-a w-full sm:w-1/2");
    			add_location(button1, file$4, 18, 13, 694);
    			attr_dev(div2, "class", "store-card");
    			add_location(div2, file$4, 6, 0, 75);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t0);
    			append_dev(div2, h2);
    			append_dev(h2, t1);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, span1);
    			append_dev(span1, t3);
    			append_dev(span1, span0);
    			append_dev(span0, t4);
    			append_dev(div1, t5);
    			append_dev(div1, span2);
    			append_dev(span2, t6);
    			append_dev(div2, t7);
    			append_dev(div2, button0);
    			append_dev(button0, i0);
    			append_dev(button0, t8);
    			append_dev(div2, button1);
    			append_dev(button1, i1);
    			append_dev(button1, t9);

    			if (!mounted) {
    				dispose = listen_dev(
    					button0,
    					"click",
    					function () {
    						if (is_function(/*addToCart*/ ctx[1](/*product*/ ctx[0], 1))) /*addToCart*/ ctx[1](/*product*/ ctx[0], 1).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*product*/ 1) {
    				set_style(div0, "background-image", "url('" + /*product*/ ctx[0].image_url + "')");
    			}

    			if (dirty & /*product*/ 1 && t1_value !== (t1_value = /*product*/ ctx[0].name + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*product*/ 1 && t4_value !== (t4_value = Math.trunc(/*product*/ ctx[0].price) + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*product*/ 1 && t6_value !== (t6_value = /*product*/ ctx[0].price.split(".")[1] + "")) set_data_dev(t6, t6_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ProductTile", slots, []);
    	let { product } = $$props;
    	let { addToCart } = $$props;
    	const writable_props = ["product", "addToCart"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ProductTile> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("product" in $$props) $$invalidate(0, product = $$props.product);
    		if ("addToCart" in $$props) $$invalidate(1, addToCart = $$props.addToCart);
    	};

    	$$self.$capture_state = () => ({ product, addToCart });

    	$$self.$inject_state = $$props => {
    		if ("product" in $$props) $$invalidate(0, product = $$props.product);
    		if ("addToCart" in $$props) $$invalidate(1, addToCart = $$props.addToCart);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [product, addToCart];
    }

    class ProductTile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { product: 0, addToCart: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProductTile",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*product*/ ctx[0] === undefined && !("product" in props)) {
    			console.warn("<ProductTile> was created without expected prop 'product'");
    		}

    		if (/*addToCart*/ ctx[1] === undefined && !("addToCart" in props)) {
    			console.warn("<ProductTile> was created without expected prop 'addToCart'");
    		}
    	}

    	get product() {
    		throw new Error("<ProductTile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set product(value) {
    		throw new Error("<ProductTile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get addToCart() {
    		throw new Error("<ProductTile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set addToCart(value) {
    		throw new Error("<ProductTile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/screens/Shop.svelte generated by Svelte v3.37.0 */
    const file$3 = "src/screens/Shop.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (35:4) {#each $filteredProducts as product}
    function create_each_block$1(ctx) {
    	let producttile;
    	let current;

    	producttile = new ProductTile({
    			props: {
    				product: /*product*/ ctx[5],
    				addToCart: /*addToCart*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(producttile.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(producttile, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const producttile_changes = {};
    			if (dirty & /*$filteredProducts*/ 2) producttile_changes.product = /*product*/ ctx[5];
    			producttile.$set(producttile_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(producttile.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(producttile.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(producttile, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(35:4) {#each $filteredProducts as product}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div0;
    	let p;
    	let t0;
    	let i;
    	let t1;
    	let input;
    	let t2;
    	let div1;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*$filteredProducts*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			p = element("p");
    			t0 = text("Filter Products ");
    			i = element("i");
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(i, "class", "fas fa-filter");
    			add_location(i, file$3, 28, 42, 907);
    			attr_dev(p, "class", "text-white");
    			add_location(p, file$3, 28, 4, 869);
    			attr_dev(input, "class", "w-48 rounded-sm focus:outline-none px-1");
    			attr_dev(input, "type", "search");
    			attr_dev(input, "placeholder", "Product");
    			add_location(input, file$3, 29, 4, 945);
    			attr_dev(div0, "class", "fixed px-1 py-2 w-full bg-primary-600 shadow-md md:w-52 md:rounded-r-md md:top-1/4 text-center");
    			add_location(div0, file$3, 27, 0, 756);
    			attr_dev(div1, "class", "store-grid");
    			add_location(div1, file$3, 33, 0, 1068);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, p);
    			append_dev(p, t0);
    			append_dev(p, i);
    			append_dev(div0, t1);
    			append_dev(div0, input);
    			set_input_value(input, /*nameTerm*/ ctx[0]);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[3]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*nameTerm*/ 1) {
    				set_input_value(input, /*nameTerm*/ ctx[0]);
    			}

    			if (dirty & /*$filteredProducts, addToCart*/ 6) {
    				each_value = /*$filteredProducts*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $cartItems;
    	let $filteredProducts;
    	validate_store(cartItems, "cartItems");
    	component_subscribe($$self, cartItems, $$value => $$invalidate(4, $cartItems = $$value));
    	validate_store(filteredProducts, "filteredProducts");
    	component_subscribe($$self, filteredProducts, $$value => $$invalidate(1, $filteredProducts = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Shop", slots, []);
    	let nameTerm = "";

    	const addToCart = data => {
    		for (let i = 0; i < $cartItems.length; i++) {
    			if ($cartItems[i].id === data.id) {
    				set_store_value(cartItems, $cartItems[i].quantity++, $cartItems);
    				cartItems.set($cartItems);
    				return;
    			}
    		}

    		let temp = {};
    		temp.id = data.id;
    		temp.name = data.name;
    		temp.price = data.price;
    		temp.image_url = data.image_url;
    		temp.units = data.units;
    		temp.quantity = data.moq;
    		cartItems.update(items => [...items, temp]);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Shop> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		nameTerm = this.value;
    		$$invalidate(0, nameTerm);
    	}

    	$$self.$capture_state = () => ({
    		filteredProducts,
    		nameF,
    		cartItems,
    		ProductTile,
    		nameTerm,
    		addToCart,
    		$cartItems,
    		$filteredProducts
    	});

    	$$self.$inject_state = $$props => {
    		if ("nameTerm" in $$props) $$invalidate(0, nameTerm = $$props.nameTerm);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*nameTerm*/ 1) {
    			nameF.set(nameTerm.toLocaleLowerCase());
    		}
    	};

    	return [nameTerm, $filteredProducts, addToCart, input_input_handler];
    }

    class Shop extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Shop",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/screens/CartItem.svelte generated by Svelte v3.37.0 */
    const file$2 = "src/screens/CartItem.svelte";

    function create_fragment$2(ctx) {
    	let div2;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let p;
    	let t1_value = /*item*/ ctx[0].name + "";
    	let t1;
    	let t2;
    	let input;
    	let input_min_value;
    	let t3;
    	let span0;
    	let t4_value = /*item*/ ctx[0].units + "";
    	let t4;
    	let t5;
    	let button0;
    	let i0;
    	let t6;
    	let button1;
    	let i1;
    	let t7;
    	let button1_hidden_value;
    	let t8;
    	let div1;
    	let span2;
    	let t9;
    	let span1;
    	let t10_value = Math.trunc(/*itemTotal*/ ctx[3]) + "";
    	let t10;
    	let t11;
    	let span3;
    	let t12_value = /*itemTotal*/ ctx[3].toString().split(".")[1] + "";
    	let t12;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			p = element("p");
    			t1 = text(t1_value);
    			t2 = space();
    			input = element("input");
    			t3 = space();
    			span0 = element("span");
    			t4 = text(t4_value);
    			t5 = space();
    			button0 = element("button");
    			i0 = element("i");
    			t6 = space();
    			button1 = element("button");
    			i1 = element("i");
    			t7 = text(" Update");
    			t8 = space();
    			div1 = element("div");
    			span2 = element("span");
    			t9 = text("₹");
    			span1 = element("span");
    			t10 = text(t10_value);
    			t11 = space();
    			span3 = element("span");
    			t12 = text(t12_value);
    			if (img.src !== (img_src_value = /*item*/ ctx[0].image_url)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "inline-block w-12 h-12");
    			attr_dev(img, "alt", "");
    			add_location(img, file$2, 14, 4, 388);
    			attr_dev(p, "class", "text-grey-700");
    			add_location(p, file$2, 17, 8, 514);
    			attr_dev(input, "type", "number");
    			attr_dev(input, "min", input_min_value = /*item*/ ctx[0].moq);
    			attr_dev(input, "class", "w-24 text-lg text-primary-900 text-right focus:outline-none rounded-t-sm border-b-2 pr-1 bg-info-100 border-info-400 focus:border-primary-400");
    			add_location(input, file$2, 18, 8, 563);
    			attr_dev(span0, "class", "text-sm text-grey-500");
    			add_location(span0, file$2, 20, 8, 793);
    			attr_dev(div0, "class", " inline-block w-52 align-middle");
    			add_location(div0, file$2, 16, 4, 460);
    			attr_dev(i0, "class", "far fa-trash-alt");
    			add_location(i0, file$2, 23, 8, 987);
    			attr_dev(button0, "class", "absolute text-lg focus:outline-none text-grey-400 hover:text-accent-600");
    			add_location(button0, file$2, 22, 4, 864);
    			attr_dev(i1, "class", "fas fa-check-circle");
    			add_location(i1, file$2, 28, 8, 1185);
    			button1.hidden = button1_hidden_value = /*newQuantity*/ ctx[2] === /*item*/ ctx[0].quantity;
    			attr_dev(button1, "class", "absolute left-14 bottom-0.5 btn-p btn-m");
    			add_location(button1, file$2, 27, 4, 1040);
    			attr_dev(span1, "class", "text-grey-700");
    			add_location(span1, file$2, 32, 61, 1337);
    			attr_dev(span2, "class", "align-top text-xl text-grey-500");
    			add_location(span2, file$2, 32, 8, 1284);
    			attr_dev(span3, "class", "align-top text-sm text-grey-500");
    			add_location(span3, file$2, 33, 8, 1411);
    			attr_dev(div1, "class", "text-right");
    			add_location(div1, file$2, 31, 4, 1251);
    			attr_dev(div2, "class", "relative border-b border-grey-300 py-2 last:border-none");
    			add_location(div2, file$2, 13, 0, 314);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, img);
    			append_dev(div2, t0);
    			append_dev(div2, div0);
    			append_dev(div0, p);
    			append_dev(p, t1);
    			append_dev(div0, t2);
    			append_dev(div0, input);
    			set_input_value(input, /*newQuantity*/ ctx[2]);
    			append_dev(div0, t3);
    			append_dev(div0, span0);
    			append_dev(span0, t4);
    			append_dev(div2, t5);
    			append_dev(div2, button0);
    			append_dev(button0, i0);
    			append_dev(div2, t6);
    			append_dev(div2, button1);
    			append_dev(button1, i1);
    			append_dev(button1, t7);
    			append_dev(div2, t8);
    			append_dev(div2, div1);
    			append_dev(div1, span2);
    			append_dev(span2, t9);
    			append_dev(span2, span1);
    			append_dev(span1, t10);
    			append_dev(div1, t11);
    			append_dev(div1, span3);
    			append_dev(span3, t12);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[5]),
    					listen_dev(button0, "click", /*removeFromCart*/ ctx[4], false, false, false),
    					listen_dev(
    						button1,
    						"click",
    						function () {
    							if (is_function(/*updateCart*/ ctx[1](/*item*/ ctx[0], /*newQuantity*/ ctx[2]))) /*updateCart*/ ctx[1](/*item*/ ctx[0], /*newQuantity*/ ctx[2]).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*item*/ 1 && img.src !== (img_src_value = /*item*/ ctx[0].image_url)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*item*/ 1 && t1_value !== (t1_value = /*item*/ ctx[0].name + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*item*/ 1 && input_min_value !== (input_min_value = /*item*/ ctx[0].moq)) {
    				attr_dev(input, "min", input_min_value);
    			}

    			if (dirty & /*newQuantity*/ 4 && to_number(input.value) !== /*newQuantity*/ ctx[2]) {
    				set_input_value(input, /*newQuantity*/ ctx[2]);
    			}

    			if (dirty & /*item*/ 1 && t4_value !== (t4_value = /*item*/ ctx[0].units + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*newQuantity, item*/ 5 && button1_hidden_value !== (button1_hidden_value = /*newQuantity*/ ctx[2] === /*item*/ ctx[0].quantity)) {
    				prop_dev(button1, "hidden", button1_hidden_value);
    			}

    			if (dirty & /*itemTotal*/ 8 && t10_value !== (t10_value = Math.trunc(/*itemTotal*/ ctx[3]) + "")) set_data_dev(t10, t10_value);
    			if (dirty & /*itemTotal*/ 8 && t12_value !== (t12_value = /*itemTotal*/ ctx[3].toString().split(".")[1] + "")) set_data_dev(t12, t12_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let itemTotal;
    	let $cartItems;
    	validate_store(cartItems, "cartItems");
    	component_subscribe($$self, cartItems, $$value => $$invalidate(6, $cartItems = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CartItem", slots, []);
    	let { item } = $$props;
    	let { updateCart } = $$props;
    	let newQuantity = item.quantity;

    	const removeFromCart = () => {
    		set_store_value(cartItems, $cartItems = $cartItems.filter(i => i.id !== item.id), $cartItems);
    	};

    	const writable_props = ["item", "updateCart"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CartItem> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		newQuantity = to_number(this.value);
    		$$invalidate(2, newQuantity);
    	}

    	$$self.$$set = $$props => {
    		if ("item" in $$props) $$invalidate(0, item = $$props.item);
    		if ("updateCart" in $$props) $$invalidate(1, updateCart = $$props.updateCart);
    	};

    	$$self.$capture_state = () => ({
    		cartItems,
    		item,
    		updateCart,
    		newQuantity,
    		removeFromCart,
    		$cartItems,
    		itemTotal
    	});

    	$$self.$inject_state = $$props => {
    		if ("item" in $$props) $$invalidate(0, item = $$props.item);
    		if ("updateCart" in $$props) $$invalidate(1, updateCart = $$props.updateCart);
    		if ("newQuantity" in $$props) $$invalidate(2, newQuantity = $$props.newQuantity);
    		if ("itemTotal" in $$props) $$invalidate(3, itemTotal = $$props.itemTotal);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*item*/ 1) {
    			$$invalidate(3, itemTotal = (item.price * item.quantity).toFixed(2));
    		}
    	};

    	return [item, updateCart, newQuantity, itemTotal, removeFromCart, input_input_handler];
    }

    class CartItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { item: 0, updateCart: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CartItem",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*item*/ ctx[0] === undefined && !("item" in props)) {
    			console.warn("<CartItem> was created without expected prop 'item'");
    		}

    		if (/*updateCart*/ ctx[1] === undefined && !("updateCart" in props)) {
    			console.warn("<CartItem> was created without expected prop 'updateCart'");
    		}
    	}

    	get item() {
    		throw new Error("<CartItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<CartItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get updateCart() {
    		throw new Error("<CartItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set updateCart(value) {
    		throw new Error("<CartItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/screens/Cart.svelte generated by Svelte v3.37.0 */
    const file$1 = "src/screens/Cart.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (34:4) {#if $cartItems.length}
    function create_if_block_2(ctx) {
    	let div;
    	let t_value = /*$cartItems*/ ctx[0].length + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "bg-accent-500 w-5 h-5 rounded-xl absolute top-1 right-1 text-white text-sm");
    			add_location(div, file$1, 34, 4, 1337);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$cartItems*/ 1 && t_value !== (t_value = /*$cartItems*/ ctx[0].length + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(34:4) {#if $cartItems.length}",
    		ctx
    	});

    	return block;
    }

    // (42:0) {#if showCart}
    function create_if_block(ctx) {
    	let div3;
    	let span0;
    	let t0;
    	let div2;
    	let h2;
    	let t2;
    	let div0;
    	let current_block_type_index;
    	let if_block;
    	let t3;
    	let div1;
    	let t4;
    	let span2;
    	let t5;
    	let span1;
    	let t6_value = Math.trunc(/*cartTotal*/ ctx[2]) + "";
    	let t6;
    	let t7;
    	let span3;

    	let t8_value = (/*cartTotal*/ ctx[2]
    	? /*cartTotal*/ ctx[2].toString().split(".")[1]
    	: "00") + "";

    	let t8;
    	let t9;
    	let button;
    	let i;
    	let t10;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$cartItems*/ ctx[0].length) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			span0 = element("span");
    			t0 = space();
    			div2 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Cart";
    			t2 = space();
    			div0 = element("div");
    			if_block.c();
    			t3 = space();
    			div1 = element("div");
    			t4 = text("Total\n            ");
    			span2 = element("span");
    			t5 = text("₹");
    			span1 = element("span");
    			t6 = text(t6_value);
    			t7 = space();
    			span3 = element("span");
    			t8 = text(t8_value);
    			t9 = space();
    			button = element("button");
    			i = element("i");
    			t10 = text(" Proceed To Checkout");
    			attr_dev(span0, "class", "h-fit cart-overlay");
    			add_location(span0, file$1, 43, 4, 1593);
    			add_location(h2, file$1, 45, 8, 1741);
    			attr_dev(div0, "class", "cart-list");
    			add_location(div0, file$1, 47, 8, 1772);
    			attr_dev(span1, "class", "font-bold text-grey-700");
    			add_location(span1, file$1, 61, 66, 2212);
    			attr_dev(span2, "class", "align-top text-2xl text-grey-500");
    			add_location(span2, file$1, 61, 12, 2158);
    			attr_dev(span3, "class", "align-top text-sm text-grey-500");
    			add_location(span3, file$1, 62, 12, 2300);
    			attr_dev(div1, "class", "text-right my-3");
    			add_location(div1, file$1, 59, 8, 2098);
    			attr_dev(i, "class", "fas fa-cash-register");
    			add_location(i, file$1, 64, 51, 2477);
    			attr_dev(button, "class", "text-lg btn-m btn-a w-full");
    			add_location(button, file$1, 64, 8, 2434);
    			attr_dev(div2, "class", "h-fit w-80 bg-white border-l border-grey-200 p-5 shadow-md");
    			add_location(div2, file$1, 44, 4, 1660);
    			attr_dev(div3, "class", "fixed flex bottom-0 left-0 w-screen bg-white bg-opacity-50 z-30 md:z-40");
    			add_location(div3, file$1, 42, 0, 1503);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, span0);
    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, h2);
    			append_dev(div2, t2);
    			append_dev(div2, div0);
    			if_blocks[current_block_type_index].m(div0, null);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, t4);
    			append_dev(div1, span2);
    			append_dev(span2, t5);
    			append_dev(span2, span1);
    			append_dev(span1, t6);
    			append_dev(div1, t7);
    			append_dev(div1, span3);
    			append_dev(span3, t8);
    			append_dev(div2, t9);
    			append_dev(div2, button);
    			append_dev(button, i);
    			append_dev(button, t10);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(span0, "click", /*toggleCart*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div0, null);
    			}

    			if ((!current || dirty & /*cartTotal*/ 4) && t6_value !== (t6_value = Math.trunc(/*cartTotal*/ ctx[2]) + "")) set_data_dev(t6, t6_value);

    			if ((!current || dirty & /*cartTotal*/ 4) && t8_value !== (t8_value = (/*cartTotal*/ ctx[2]
    			? /*cartTotal*/ ctx[2].toString().split(".")[1]
    			: "00") + "")) set_data_dev(t8, t8_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(42:0) {#if showCart}",
    		ctx
    	});

    	return block;
    }

    // (54:12) {:else}
    function create_else_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Cart is empty";
    			attr_dev(p, "class", "text-grey-400 text-center text-sm");
    			add_location(p, file$1, 54, 12, 1972);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(54:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (50:12) {#if $cartItems.length}
    function create_if_block_1(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*$cartItems*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$cartItems, updateCart*/ 9) {
    				each_value = /*$cartItems*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(50:12) {#if $cartItems.length}",
    		ctx
    	});

    	return block;
    }

    // (51:12) {#each $cartItems as item}
    function create_each_block(ctx) {
    	let cartitem;
    	let current;

    	cartitem = new CartItem({
    			props: {
    				item: /*item*/ ctx[5],
    				updateCart: /*updateCart*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cartitem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cartitem, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const cartitem_changes = {};
    			if (dirty & /*$cartItems*/ 1) cartitem_changes.item = /*item*/ ctx[5];
    			cartitem.$set(cartitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cartitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cartitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cartitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(51:12) {#each $cartItems as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let button;
    	let svg;
    	let g;
    	let path0;
    	let ellipse0;
    	let ellipse1;
    	let path1;
    	let t0;
    	let t1;
    	let if_block1_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*$cartItems*/ ctx[0].length && create_if_block_2(ctx);
    	let if_block1 = /*showCart*/ ctx[1] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			button = element("button");
    			svg = svg_element("svg");
    			g = svg_element("g");
    			path0 = svg_element("path");
    			ellipse0 = svg_element("ellipse");
    			ellipse1 = svg_element("ellipse");
    			path1 = svg_element("path");
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(path0, "d", "M.33 290.34l1.16.1 1.05 4.48h3.82");
    			add_location(path0, file$1, 27, 10, 1056);
    			attr_dev(ellipse0, "cx", "1.99");
    			attr_dev(ellipse0, "cy", "295.56");
    			attr_dev(ellipse0, "rx", ".66");
    			attr_dev(ellipse0, "ry", ".65");
    			add_location(ellipse0, file$1, 28, 10, 1112);
    			attr_dev(ellipse1, "cy", "295.56");
    			attr_dev(ellipse1, "cx", "6.36");
    			attr_dev(ellipse1, "rx", ".66");
    			attr_dev(ellipse1, "ry", ".65");
    			add_location(ellipse1, file$1, 29, 10, 1173);
    			attr_dev(path1, "d", "M2.3 293.88h4.44l.7-2.4-5.84-.55");
    			add_location(path1, file$1, 30, 10, 1234);
    			attr_dev(g, "transform", "translate(0 -289)");
    			attr_dev(g, "stroke", "#4f46e5");
    			attr_dev(g, "fill", "none");
    			attr_dev(g, "stroke-width", ".53");
    			attr_dev(g, "stroke-linecap", "round");
    			attr_dev(g, "stroke-linejoin", "round");
    			add_location(g, file$1, 26, 8, 917);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 7.94 7.94");
    			attr_dev(svg, "height", "30");
    			attr_dev(svg, "width", "30");
    			add_location(svg, file$1, 25, 4, 821);
    			attr_dev(button, "class", "btn-cart");
    			add_location(button, file$1, 24, 0, 769);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, svg);
    			append_dev(svg, g);
    			append_dev(g, path0);
    			append_dev(g, ellipse0);
    			append_dev(g, ellipse1);
    			append_dev(g, path1);
    			append_dev(button, t0);
    			if (if_block0) if_block0.m(button, null);
    			insert_dev(target, t1, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*toggleCart*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$cartItems*/ ctx[0].length) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					if_block0.m(button, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*showCart*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*showCart*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (if_block0) if_block0.d();
    			if (detaching) detach_dev(t1);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let cartTotal;
    	let $cartItems;
    	validate_store(cartItems, "cartItems");
    	component_subscribe($$self, cartItems, $$value => $$invalidate(0, $cartItems = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Cart", slots, []);
    	let showCart = false;

    	const updateCart = (data, n) => {
    		if (n === 0) {
    			set_store_value(cartItems, $cartItems = $cartItems.filter(i => i.id !== data.id), $cartItems);
    		} else {
    			for (let i = 0; i < $cartItems.length; i++) {
    				if ($cartItems[i].id === data.id) {
    					set_store_value(cartItems, $cartItems[i].quantity = n, $cartItems);
    					cartItems.set($cartItems);
    				}
    			}
    		}
    	};

    	const toggleCart = () => $$invalidate(1, showCart = !showCart);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Cart> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		current_component,
    		cartItems,
    		CartItem,
    		showCart,
    		updateCart,
    		toggleCart,
    		$cartItems,
    		cartTotal
    	});

    	$$self.$inject_state = $$props => {
    		if ("showCart" in $$props) $$invalidate(1, showCart = $$props.showCart);
    		if ("cartTotal" in $$props) $$invalidate(2, cartTotal = $$props.cartTotal);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$cartItems*/ 1) {
    			$$invalidate(2, cartTotal = $cartItems.length
    			? $cartItems.map(i => i.quantity * i.price).reduce((acc, cur) => acc + cur).toFixed(2)
    			: 0);
    		}
    	};

    	return [$cartItems, showCart, cartTotal, updateCart, toggleCart];
    }

    class Cart extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cart",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.37.0 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let div;
    	let shop;
    	let t;
    	let cart;
    	let current;
    	shop = new Shop({ $$inline: true });
    	cart = new Cart({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(shop.$$.fragment);
    			t = space();
    			create_component(cart.$$.fragment);
    			attr_dev(div, "class", "relative min-h-fit bg-grey-100");
    			add_location(div, file, 9, 0, 217);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(shop, div, null);
    			append_dev(div, t);
    			mount_component(cart, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(shop.$$.fragment, local);
    			transition_in(cart.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(shop.$$.fragment, local);
    			transition_out(cart.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(shop);
    			destroy_component(cart);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	onMount(fetchProducts);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ onMount, fetchProducts, Shop, Cart });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.getElementById("shop"),
    	// props: {
    	// 	baseURL: 'http://localhost:8000/api/'
    	// }
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
