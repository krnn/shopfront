
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
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
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
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
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
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

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
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
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
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
    function tick() {
        schedule_update();
        return resolved_promise;
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

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
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
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
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

    /**
     * @typedef {Object} WrappedComponent Object returned by the `wrap` method
     * @property {SvelteComponent} component - Component to load (this is always asynchronous)
     * @property {RoutePrecondition[]} [conditions] - Route pre-conditions to validate
     * @property {Object} [props] - Optional dictionary of static props
     * @property {Object} [userData] - Optional user data dictionary
     * @property {bool} _sveltesparouter - Internal flag; always set to true
     */

    /**
     * @callback AsyncSvelteComponent
     * @returns {Promise<SvelteComponent>} Returns a Promise that resolves with a Svelte component
     */

    /**
     * @callback RoutePrecondition
     * @param {RouteDetail} detail - Route detail object
     * @returns {boolean|Promise<boolean>} If the callback returns a false-y value, it's interpreted as the precondition failed, so it aborts loading the component (and won't process other pre-condition callbacks)
     */

    /**
     * @typedef {Object} WrapOptions Options object for the call to `wrap`
     * @property {SvelteComponent} [component] - Svelte component to load (this is incompatible with `asyncComponent`)
     * @property {AsyncSvelteComponent} [asyncComponent] - Function that returns a Promise that fulfills with a Svelte component (e.g. `{asyncComponent: () => import('Foo.svelte')}`)
     * @property {SvelteComponent} [loadingComponent] - Svelte component to be displayed while the async route is loading (as a placeholder); when unset or false-y, no component is shown while component
     * @property {object} [loadingParams] - Optional dictionary passed to the `loadingComponent` component as params (for an exported prop called `params`)
     * @property {object} [userData] - Optional object that will be passed to events such as `routeLoading`, `routeLoaded`, `conditionsFailed`
     * @property {object} [props] - Optional key-value dictionary of static props that will be passed to the component. The props are expanded with {...props}, so the key in the dictionary becomes the name of the prop.
     * @property {RoutePrecondition[]|RoutePrecondition} [conditions] - Route pre-conditions to add, which will be executed in order
     */

    /**
     * Wraps a component to enable multiple capabilities:
     * 1. Using dynamically-imported component, with (e.g. `{asyncComponent: () => import('Foo.svelte')}`), which also allows bundlers to do code-splitting.
     * 2. Adding route pre-conditions (e.g. `{conditions: [...]}`)
     * 3. Adding static props that are passed to the component
     * 4. Adding custom userData, which is passed to route events (e.g. route loaded events) or to route pre-conditions (e.g. `{userData: {foo: 'bar}}`)
     * 
     * @param {WrapOptions} args - Arguments object
     * @returns {WrappedComponent} Wrapped component
     */
    function wrap$1(args) {
        if (!args) {
            throw Error('Parameter args is required')
        }

        // We need to have one and only one of component and asyncComponent
        // This does a "XNOR"
        if (!args.component == !args.asyncComponent) {
            throw Error('One and only one of component and asyncComponent is required')
        }

        // If the component is not async, wrap it into a function returning a Promise
        if (args.component) {
            args.asyncComponent = () => Promise.resolve(args.component);
        }

        // Parameter asyncComponent and each item of conditions must be functions
        if (typeof args.asyncComponent != 'function') {
            throw Error('Parameter asyncComponent must be a function')
        }
        if (args.conditions) {
            // Ensure it's an array
            if (!Array.isArray(args.conditions)) {
                args.conditions = [args.conditions];
            }
            for (let i = 0; i < args.conditions.length; i++) {
                if (!args.conditions[i] || typeof args.conditions[i] != 'function') {
                    throw Error('Invalid parameter conditions[' + i + ']')
                }
            }
        }

        // Check if we have a placeholder component
        if (args.loadingComponent) {
            args.asyncComponent.loading = args.loadingComponent;
            args.asyncComponent.loadingParams = args.loadingParams || undefined;
        }

        // Returns an object that contains all the functions to execute too
        // The _sveltesparouter flag is to confirm the object was created by this router
        const obj = {
            component: args.asyncComponent,
            userData: args.userData,
            conditions: (args.conditions && args.conditions.length) ? args.conditions : undefined,
            props: (args.props && Object.keys(args.props).length) ? args.props : {},
            _sveltesparouter: true
        };

        return obj
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

    function regexparam (str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* node_modules/svelte-spa-router/Router.svelte generated by Svelte v3.37.0 */

    const { Error: Error_1, Object: Object_1, console: console_1 } = globals;

    // (209:0) {:else}
    function create_else_block$3(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*props*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(209:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (202:0) {#if componentParams}
    function create_if_block$7(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ params: /*componentParams*/ ctx[1] }, /*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*componentParams, props*/ 6)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*componentParams*/ 2 && { params: /*componentParams*/ ctx[1] },
    					dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(202:0) {#if componentParams}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$7, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*componentParams*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
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
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
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
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function wrap(component, userData, ...conditions) {
    	// Use the new wrap method and show a deprecation warning
    	// eslint-disable-next-line no-console
    	console.warn("Method `wrap` from `svelte-spa-router` is deprecated and will be removed in a future version. Please use `svelte-spa-router/wrap` instead. See http://bit.ly/svelte-spa-router-upgrading");

    	return wrap$1({ component, userData, conditions });
    }

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
    function getLocation$1() {
    	const hashPosition = window.location.href.indexOf("#/");

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: "/";

    	// Check if there's a querystring
    	const qsPosition = location.indexOf("?");

    	let querystring = "";

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(null, // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	set(getLocation$1());

    	const update = () => {
    		set(getLocation$1());
    	};

    	window.addEventListener("hashchange", update, false);

    	return function stop() {
    		window.removeEventListener("hashchange", update, false);
    	};
    });

    const location = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);

    async function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	// Note: this will include scroll state in history even when restoreScrollState is false
    	history.replaceState(
    		{
    			scrollX: window.scrollX,
    			scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	window.location.hash = (location.charAt(0) == "#" ? "" : "#") + location;
    }

    async function pop() {
    	// Execute this code when the current call stack is complete
    	await tick();

    	window.history.back();
    }

    async function replace(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	const dest = (location.charAt(0) == "#" ? "" : "#") + location;

    	try {
    		window.history.replaceState(undefined, undefined, dest);
    	} catch(e) {
    		// eslint-disable-next-line no-console
    		console.warn("Caught exception while replacing the current page. If you're running this in the Svelte REPL, please note that the `replace` method might not work in this environment.");
    	}

    	// The method above doesn't trigger the hashchange event, so let's do that manually
    	window.dispatchEvent(new Event("hashchange"));
    }

    function link(node, hrefVar) {
    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != "a") {
    		throw Error("Action \"link\" can only be used with <a> tags");
    	}

    	updateLink(node, hrefVar || node.getAttribute("href"));

    	return {
    		update(updated) {
    			updateLink(node, updated);
    		}
    	};
    }

    // Internal function used by the link function
    function updateLink(node, href) {
    	// Destination must start with '/'
    	if (!href || href.length < 1 || href.charAt(0) != "/") {
    		throw Error("Invalid value for \"href\" attribute: " + href);
    	}

    	// Add # to the href attribute
    	node.setAttribute("href", "#" + href);

    	node.addEventListener("click", scrollstateHistoryHandler);
    }

    /**
     * The handler attached to an anchor tag responsible for updating the
     * current history state with the current scroll state
     *
     * @param {HTMLElementEventMap} event - an onclick event attached to an anchor tag
     */
    function scrollstateHistoryHandler(event) {
    	// Prevent default anchor onclick behaviour
    	event.preventDefault();

    	const href = event.currentTarget.getAttribute("href");

    	// Setting the url (3rd arg) to href will break clicking for reasons, so don't try to do that
    	history.replaceState(
    		{
    			scrollX: window.scrollX,
    			scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	// This will force an update as desired, but this time our scroll state will be attached
    	window.location.hash = href;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Router", slots, []);
    	let { routes = {} } = $$props;
    	let { prefix = "" } = $$props;
    	let { restoreScrollState = false } = $$props;

    	/**
     * Container for a route: path, component
     */
    	class RouteItem {
    		/**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent|WrappedComponent} component - Svelte component for the route, optionally wrapped
     */
    		constructor(path, component) {
    			if (!component || typeof component != "function" && (typeof component != "object" || component._sveltesparouter !== true)) {
    				throw Error("Invalid component object");
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == "string" && (path.length < 1 || path.charAt(0) != "/" && path.charAt(0) != "*") || typeof path == "object" && !(path instanceof RegExp)) {
    				throw Error("Invalid value for \"path\" argument - strings must start with / or *");
    			}

    			const { pattern, keys } = regexparam(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == "object" && component._sveltesparouter === true) {
    				this.component = component.component;
    				this.conditions = component.conditions || [];
    				this.userData = component.userData;
    				this.props = component.props || {};
    			} else {
    				// Convert the component to a function that returns a Promise, to normalize it
    				this.component = () => Promise.resolve(component);

    				this.conditions = [];
    				this.props = {};
    			}

    			this._pattern = pattern;
    			this._keys = keys;
    		}

    		/**
     * Checks if `path` matches the current route.
     * If there's a match, will return the list of parameters from the URL (if any).
     * In case of no match, the method will return `null`.
     *
     * @param {string} path - Path to test
     * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
     */
    		match(path) {
    			// If there's a prefix, check if it matches the start of the path.
    			// If not, bail early, else remove it before we run the matching.
    			if (prefix) {
    				if (typeof prefix == "string") {
    					if (path.startsWith(prefix)) {
    						path = path.substr(prefix.length) || "/";
    					} else {
    						return null;
    					}
    				} else if (prefix instanceof RegExp) {
    					const match = path.match(prefix);

    					if (match && match[0]) {
    						path = path.substr(match[0].length) || "/";
    					} else {
    						return null;
    					}
    				}
    			}

    			// Check if the pattern matches
    			const matches = this._pattern.exec(path);

    			if (matches === null) {
    				return null;
    			}

    			// If the input was a regular expression, this._keys would be false, so return matches as is
    			if (this._keys === false) {
    				return matches;
    			}

    			const out = {};
    			let i = 0;

    			while (i < this._keys.length) {
    				// In the match parameters, URL-decode all values
    				try {
    					out[this._keys[i]] = decodeURIComponent(matches[i + 1] || "") || null;
    				} catch(e) {
    					out[this._keys[i]] = null;
    				}

    				i++;
    			}

    			return out;
    		}

    		/**
     * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoading`, `routeLoaded` and `conditionsFailed` events
     * @typedef {Object} RouteDetail
     * @property {string|RegExp} route - Route matched as defined in the route definition (could be a string or a reguar expression object)
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {object} [userData] - Custom data passed by the user
     * @property {SvelteComponent} [component] - Svelte component (only in `routeLoaded` events)
     * @property {string} [name] - Name of the Svelte component (only in `routeLoaded` events)
     */
    		/**
     * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
     * 
     * @param {RouteDetail} detail - Route detail
     * @returns {bool} Returns true if all the conditions succeeded
     */
    		async checkConditions(detail) {
    			for (let i = 0; i < this.conditions.length; i++) {
    				if (!await this.conditions[i](detail)) {
    					return false;
    				}
    			}

    			return true;
    		}
    	}

    	// Set up all routes
    	const routesList = [];

    	if (routes instanceof Map) {
    		// If it's a map, iterate on it right away
    		routes.forEach((route, path) => {
    			routesList.push(new RouteItem(path, route));
    		});
    	} else {
    		// We have an object, so iterate on its own properties
    		Object.keys(routes).forEach(path => {
    			routesList.push(new RouteItem(path, routes[path]));
    		});
    	}

    	// Props for the component to render
    	let component = null;

    	let componentParams = null;
    	let props = {};

    	// Event dispatcher from Svelte
    	const dispatch = createEventDispatcher();

    	// Just like dispatch, but executes on the next iteration of the event loop
    	async function dispatchNextTick(name, detail) {
    		// Execute this code when the current call stack is complete
    		await tick();

    		dispatch(name, detail);
    	}

    	// If this is set, then that means we have popped into this var the state of our last scroll position
    	let previousScrollState = null;

    	if (restoreScrollState) {
    		window.addEventListener("popstate", event => {
    			// If this event was from our history.replaceState, event.state will contain
    			// our scroll history. Otherwise, event.state will be null (like on forward
    			// navigation)
    			if (event.state && event.state.scrollY) {
    				previousScrollState = event.state;
    			} else {
    				previousScrollState = null;
    			}
    		});

    		afterUpdate(() => {
    			// If this exists, then this is a back navigation: restore the scroll position
    			if (previousScrollState) {
    				window.scrollTo(previousScrollState.scrollX, previousScrollState.scrollY);
    			} else {
    				// Otherwise this is a forward navigation: scroll to top
    				window.scrollTo(0, 0);
    			}
    		});
    	}

    	// Always have the latest value of loc
    	let lastLoc = null;

    	// Current object of the component loaded
    	let componentObj = null;

    	// Handle hash change events
    	// Listen to changes in the $loc store and update the page
    	// Do not use the $: syntax because it gets triggered by too many things
    	loc.subscribe(async newLoc => {
    		lastLoc = newLoc;

    		// Find a route matching the location
    		let i = 0;

    		while (i < routesList.length) {
    			const match = routesList[i].match(newLoc.location);

    			if (!match) {
    				i++;
    				continue;
    			}

    			const detail = {
    				route: routesList[i].path,
    				location: newLoc.location,
    				querystring: newLoc.querystring,
    				userData: routesList[i].userData
    			};

    			// Check if the route can be loaded - if all conditions succeed
    			if (!await routesList[i].checkConditions(detail)) {
    				// Don't display anything
    				$$invalidate(0, component = null);

    				componentObj = null;

    				// Trigger an event to notify the user, then exit
    				dispatchNextTick("conditionsFailed", detail);

    				return;
    			}

    			// Trigger an event to alert that we're loading the route
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick("routeLoading", Object.assign({}, detail));

    			// If there's a component to show while we're loading the route, display it
    			const obj = routesList[i].component;

    			// Do not replace the component if we're loading the same one as before, to avoid the route being unmounted and re-mounted
    			if (componentObj != obj) {
    				if (obj.loading) {
    					$$invalidate(0, component = obj.loading);
    					componentObj = obj;
    					$$invalidate(1, componentParams = obj.loadingParams);
    					$$invalidate(2, props = {});

    					// Trigger the routeLoaded event for the loading component
    					// Create a copy of detail so we don't modify the object for the dynamic route (and the dynamic route doesn't modify our object too)
    					dispatchNextTick("routeLoaded", Object.assign({}, detail, { component, name: component.name }));
    				} else {
    					$$invalidate(0, component = null);
    					componentObj = null;
    				}

    				// Invoke the Promise
    				const loaded = await obj();

    				// Now that we're here, after the promise resolved, check if we still want this component, as the user might have navigated to another page in the meanwhile
    				if (newLoc != lastLoc) {
    					// Don't update the component, just exit
    					return;
    				}

    				// If there is a "default" property, which is used by async routes, then pick that
    				$$invalidate(0, component = loaded && loaded.default || loaded);

    				componentObj = obj;
    			}

    			// Set componentParams only if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
    			// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
    			if (match && typeof match == "object" && Object.keys(match).length) {
    				$$invalidate(1, componentParams = match);
    			} else {
    				$$invalidate(1, componentParams = null);
    			}

    			// Set static props, if any
    			$$invalidate(2, props = routesList[i].props);

    			// Dispatch the routeLoaded event then exit
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick("routeLoaded", Object.assign({}, detail, { component, name: component.name }));

    			return;
    		}

    		// If we're still here, there was no match, so show the empty component
    		$$invalidate(0, component = null);

    		componentObj = null;
    	});

    	const writable_props = ["routes", "prefix", "restoreScrollState"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	function routeEvent_handler(event) {
    		bubble($$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("routes" in $$props) $$invalidate(3, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ("restoreScrollState" in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    	};

    	$$self.$capture_state = () => ({
    		readable,
    		derived,
    		tick,
    		_wrap: wrap$1,
    		wrap,
    		getLocation: getLocation$1,
    		loc,
    		location,
    		querystring,
    		push,
    		pop,
    		replace,
    		link,
    		updateLink,
    		scrollstateHistoryHandler,
    		createEventDispatcher,
    		afterUpdate,
    		regexparam,
    		routes,
    		prefix,
    		restoreScrollState,
    		RouteItem,
    		routesList,
    		component,
    		componentParams,
    		props,
    		dispatch,
    		dispatchNextTick,
    		previousScrollState,
    		lastLoc,
    		componentObj
    	});

    	$$self.$inject_state = $$props => {
    		if ("routes" in $$props) $$invalidate(3, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ("restoreScrollState" in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    		if ("component" in $$props) $$invalidate(0, component = $$props.component);
    		if ("componentParams" in $$props) $$invalidate(1, componentParams = $$props.componentParams);
    		if ("props" in $$props) $$invalidate(2, props = $$props.props);
    		if ("previousScrollState" in $$props) previousScrollState = $$props.previousScrollState;
    		if ("lastLoc" in $$props) lastLoc = $$props.lastLoc;
    		if ("componentObj" in $$props) componentObj = $$props.componentObj;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*restoreScrollState*/ 32) {
    			// Update history.scrollRestoration depending on restoreScrollState
    			history.scrollRestoration = restoreScrollState ? "manual" : "auto";
    		}
    	};

    	return [
    		component,
    		componentParams,
    		props,
    		routes,
    		prefix,
    		restoreScrollState,
    		routeEvent_handler,
    		routeEvent_handler_1
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			routes: 3,
    			prefix: 4,
    			restoreScrollState: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get routes() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get restoreScrollState() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set restoreScrollState(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const persistCart = () => {
      const persist = localStorage.getItem('sf-ct');
      const data = persist ? JSON.parse(persist) : [];
      //if sub is broken, sets value to current local storage value
      const lsCart = writable(data, () => {
        const unsubscribe = lsCart.subscribe(value => {
          localStorage.setItem('sf-ct', JSON.stringify(value));
        });
        return unsubscribe
      });
      return lsCart
    };

    const isLoading = writable(true);

    const userLocation = writable(null);

    // Set userLocation
    const setLocation = (data) => {
        userLocation.set(data);
        document.cookie = `sf-l-c=${data}`;
    };

    const productsList = writable([]);

    const hasLoadedProducts = writable(false);

    // Populate productsList store
    const setFetchedProducts = (data) => {
        productsList.set(data);
    	isLoading.set(false);
        hasLoadedProducts.set(true);
    };

    // Properties to filter by
    const nameF = writable('');

    // Derived store with filtered list of products
    const filteredProducts = derived(
        [productsList, nameF],
        ([$productlist, $nameF]) => $productlist.filter(p => p.name.toLowerCase().includes($nameF))
    );

    // Cart items
    const cartItems = persistCart();

    // Populate cart if exists in database
    const setFetchedCart = (data) => {
        cartItems.set(data);
    };

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


    const productDetail = writable({});

    // Populate productDetail store
    const setProductDetails = (data) => {
        productDetail.set(data);
    	isLoading.set(false);
    };

    // Query 3rd party server for IP location
    const getLocation = async () => {
        let index = document.cookie.search('sf-l-c=');
        if (index > -1) {
            setLocation(document.cookie.slice(index+7,index+9));
            } else {
            try {
                let data = await axios.get('https://ipinfo.io/json?token=31d38724631f1c')
                    .then(res => res.data.country);
                setLocation(data);
            } catch (_) {
                setLocation('xx');
            }
        }
    };

    // Get all products from database 
    const fetchProducts = async () => {
        isLoading.set(true);
        let products = await axios.get('/api/listproducts/')
            .then(res => res.data);
        setFetchedProducts(products);
    };

    // Check cookies for cart, else check database
    const fetchCart = async () => {
        let userCart = [];
        if (user != "AnonymousUser") {
            userCart = await axios.get(`/api/getcart/${userId}`)
                .then(res => res.data["items"]);
            if (userCart.length <= 0)  {
                let lsCart = JSON.parse(localStorage.getItem('sf-ct'));
                if (lsCart.length && lsCart.length > 0) {
                    lsCart = lsCart.map(x => ({id: x.id}));
                    for (let i = 0; i < lsCart.length; i++) {
                        let iId = await addItem(lsCart[i].product, lsCart.quantity);
                        let temp = lsCart[i];
                        temp.id = iId;
                        userCart.push(temp);
                    }
                }
            }
            setFetchedCart(userCart);
        }
    };

    // Add product to cart
    const addItem = async (data, n = 1) => {
        if (user != "AnonymousUser")  {
            data.n = n;
            data.userId = userId;
            let itemId = await axios.post('/api/additem/', data)
                .then(res => res.data.iId);
            return itemId
        }
    };


    // Update cart quantity
    const updateItem = async (data) => {
        if (user === "AnonymousUser") ; else {
            await axios.post('/api/updateitem/', data)
                .then(res => res.data);
        }
    };

    const removeItem = async (data) => {
        if (user != "AnonymousUser") {
            await axios.post('/api/removeitem/', data);
                // .then(res => console.log("from addItem in service.js", res.data));
        }
    };

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /* src/screens/CartItem.svelte generated by Svelte v3.37.0 */
    const file$8 = "src/screens/CartItem.svelte";

    // (37:4) {#if error}
    function create_if_block_1$4(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*error*/ ctx[2]);
    			attr_dev(p, "class", "bg-accent-200 px-2 py-1 my-1 text-accent-800");
    			add_location(p, file$8, 37, 8, 1400);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*error*/ 4) set_data_dev(t, /*error*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(37:4) {#if error}",
    		ctx
    	});

    	return block;
    }

    // (55:4) {#if $userLocation==='IN'}
    function create_if_block$6(ctx) {
    	let div;
    	let span1;
    	let t0;
    	let span0;
    	let t1_value = /*itemTotal*/ ctx[3][0] + "";
    	let t1;
    	let t2;
    	let span2;
    	let t3_value = /*itemTotal*/ ctx[3][1] + "";
    	let t3;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span1 = element("span");
    			t0 = text("₹");
    			span0 = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			span2 = element("span");
    			t3 = text(t3_value);
    			attr_dev(span0, "class", "text-grey-700");
    			add_location(span0, file$8, 56, 61, 2308);
    			attr_dev(span1, "class", "align-top text-xl text-grey-500");
    			add_location(span1, file$8, 56, 8, 2255);
    			attr_dev(span2, "class", "align-top text-sm text-grey-500");
    			add_location(span2, file$8, 57, 8, 2373);
    			attr_dev(div, "class", "text-right");
    			add_location(div, file$8, 55, 4, 2222);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span1);
    			append_dev(span1, t0);
    			append_dev(span1, span0);
    			append_dev(span0, t1);
    			append_dev(div, t2);
    			append_dev(div, span2);
    			append_dev(span2, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*itemTotal*/ 8 && t1_value !== (t1_value = /*itemTotal*/ ctx[3][0] + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*itemTotal*/ 8 && t3_value !== (t3_value = /*itemTotal*/ ctx[3][1] + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(55:4) {#if $userLocation==='IN'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let form;
    	let t0;
    	let img;
    	let img_src_value;
    	let t1;
    	let div;
    	let p;
    	let t2_value = /*item*/ ctx[0].product.name + "";
    	let t2;
    	let t3;
    	let input;
    	let input_min_value;
    	let input_class_value;
    	let t4;
    	let span;
    	let t5_value = /*item*/ ctx[0].product.units + "";
    	let t5;
    	let t6;
    	let button0;
    	let i0;
    	let t7;
    	let button1;
    	let i1;
    	let t8;
    	let button1_hidden_value;
    	let t9;
    	let mounted;
    	let dispose;
    	let if_block0 = /*error*/ ctx[2] && create_if_block_1$4(ctx);
    	let if_block1 = /*$userLocation*/ ctx[4] === "IN" && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			form = element("form");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			img = element("img");
    			t1 = space();
    			div = element("div");
    			p = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			input = element("input");
    			t4 = space();
    			span = element("span");
    			t5 = text(t5_value);
    			t6 = space();
    			button0 = element("button");
    			i0 = element("i");
    			t7 = space();
    			button1 = element("button");
    			i1 = element("i");
    			t8 = text(" Update");
    			t9 = space();
    			if (if_block1) if_block1.c();
    			if (img.src !== (img_src_value = /*item*/ ctx[0].product.image_url)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "inline-block w-12 h-12");
    			attr_dev(img, "alt", "");
    			add_location(img, file$8, 39, 4, 1482);
    			attr_dev(p, "class", "text-grey-700");
    			add_location(p, file$8, 42, 8, 1616);
    			attr_dev(input, "type", "number");
    			attr_dev(input, "min", input_min_value = /*item*/ ctx[0].product.moq);
    			attr_dev(input, "class", input_class_value = "w-24 cart-input" + (/*error*/ ctx[2] ? "-err" : ""));
    			add_location(input, file$8, 43, 8, 1673);
    			attr_dev(span, "class", "text-sm text-grey-500");
    			add_location(span, file$8, 45, 8, 1806);
    			attr_dev(div, "class", " inline-block w-52 align-middle");
    			add_location(div, file$8, 41, 4, 1562);
    			attr_dev(i0, "class", "far fa-trash-alt");
    			add_location(i0, file$8, 48, 8, 1960);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "btn-close");
    			add_location(button0, file$8, 47, 4, 1885);
    			attr_dev(i1, "class", "fas fa-check-circle");
    			add_location(i1, file$8, 52, 8, 2130);
    			attr_dev(button1, "type", "submit");
    			button1.hidden = button1_hidden_value = /*newQuantity*/ ctx[1] === /*item*/ ctx[0].quantity;
    			attr_dev(button1, "class", "absolute left-14 bottom-0.5 btn-p btn-m");
    			add_location(button1, file$8, 51, 4, 2012);
    			attr_dev(form, "class", "relative border-b border-grey-300 py-2 last:border-none");
    			add_location(form, file$8, 35, 0, 1247);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			if (if_block0) if_block0.m(form, null);
    			append_dev(form, t0);
    			append_dev(form, img);
    			append_dev(form, t1);
    			append_dev(form, div);
    			append_dev(div, p);
    			append_dev(p, t2);
    			append_dev(div, t3);
    			append_dev(div, input);
    			set_input_value(input, /*newQuantity*/ ctx[1]);
    			append_dev(div, t4);
    			append_dev(div, span);
    			append_dev(span, t5);
    			append_dev(form, t6);
    			append_dev(form, button0);
    			append_dev(button0, i0);
    			append_dev(form, t7);
    			append_dev(form, button1);
    			append_dev(button1, i1);
    			append_dev(button1, t8);
    			append_dev(form, t9);
    			if (if_block1) if_block1.m(form, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[7]),
    					listen_dev(button0, "click", /*removeFromCart*/ ctx[6], false, false, false),
    					listen_dev(
    						form,
    						"submit",
    						prevent_default(function () {
    							if (is_function(/*updateCart*/ ctx[5](/*item*/ ctx[0], /*newQuantity*/ ctx[1]))) /*updateCart*/ ctx[5](/*item*/ ctx[0], /*newQuantity*/ ctx[1]).apply(this, arguments);
    						}),
    						false,
    						true,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (/*error*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$4(ctx);
    					if_block0.c();
    					if_block0.m(form, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*item*/ 1 && img.src !== (img_src_value = /*item*/ ctx[0].product.image_url)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*item*/ 1 && t2_value !== (t2_value = /*item*/ ctx[0].product.name + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*item*/ 1 && input_min_value !== (input_min_value = /*item*/ ctx[0].product.moq)) {
    				attr_dev(input, "min", input_min_value);
    			}

    			if (dirty & /*error*/ 4 && input_class_value !== (input_class_value = "w-24 cart-input" + (/*error*/ ctx[2] ? "-err" : ""))) {
    				attr_dev(input, "class", input_class_value);
    			}

    			if (dirty & /*newQuantity*/ 2 && to_number(input.value) !== /*newQuantity*/ ctx[1]) {
    				set_input_value(input, /*newQuantity*/ ctx[1]);
    			}

    			if (dirty & /*item*/ 1 && t5_value !== (t5_value = /*item*/ ctx[0].product.units + "")) set_data_dev(t5, t5_value);

    			if (dirty & /*newQuantity, item*/ 3 && button1_hidden_value !== (button1_hidden_value = /*newQuantity*/ ctx[1] === /*item*/ ctx[0].quantity)) {
    				prop_dev(button1, "hidden", button1_hidden_value);
    			}

    			if (/*$userLocation*/ ctx[4] === "IN") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$6(ctx);
    					if_block1.c();
    					if_block1.m(form, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let itemTotal;
    	let $cartItems;
    	let $userLocation;
    	validate_store(cartItems, "cartItems");
    	component_subscribe($$self, cartItems, $$value => $$invalidate(8, $cartItems = $$value));
    	validate_store(userLocation, "userLocation");
    	component_subscribe($$self, userLocation, $$value => $$invalidate(4, $userLocation = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CartItem", slots, []);
    	let { item } = $$props;
    	let newQuantity = item.quantity;
    	let error = null;

    	const updateCart = (data, n) => {
    		if (n <= 0) {
    			removeItem({ userId, itemId: data.id });
    			set_store_value(cartItems, $cartItems = $cartItems.filter(i => i.id !== data.id), $cartItems);
    		} else if (n < data.product.moq) {
    			$$invalidate(2, error = `Minimum order quantity is ${data.product.moq}`);
    		} else {
    			$$invalidate(2, error = null);

    			for (let i = 0; i < $cartItems.length; i++) {
    				updateItem({
    					userId,
    					itemId: data.id,
    					productId: data.product.id,
    					n
    				});

    				if ($cartItems[i].product.id === data.product.id) {
    					set_store_value(cartItems, $cartItems[i].quantity = n, $cartItems);
    					cartItems.set($cartItems);
    				}
    			}
    		}
    	};

    	const removeFromCart = () => {
    		removeItem({ userId, itemId: item.id });
    		set_store_value(cartItems, $cartItems = $cartItems.filter(i => i.product.id !== item.product.id), $cartItems);
    	};

    	const writable_props = ["item"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CartItem> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		newQuantity = to_number(this.value);
    		$$invalidate(1, newQuantity);
    	}

    	$$self.$$set = $$props => {
    		if ("item" in $$props) $$invalidate(0, item = $$props.item);
    	};

    	$$self.$capture_state = () => ({
    		cartItems,
    		userLocation,
    		removeItem,
    		updateItem,
    		item,
    		newQuantity,
    		error,
    		updateCart,
    		removeFromCart,
    		$cartItems,
    		itemTotal,
    		$userLocation
    	});

    	$$self.$inject_state = $$props => {
    		if ("item" in $$props) $$invalidate(0, item = $$props.item);
    		if ("newQuantity" in $$props) $$invalidate(1, newQuantity = $$props.newQuantity);
    		if ("error" in $$props) $$invalidate(2, error = $$props.error);
    		if ("itemTotal" in $$props) $$invalidate(3, itemTotal = $$props.itemTotal);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*item*/ 1) {
    			$$invalidate(3, itemTotal = ((item.product.discount_price
    			? item.product.discount_price
    			: item.product.price) * item.quantity).toFixed(2).toString().split("."));
    		}
    	};

    	return [
    		item,
    		newQuantity,
    		error,
    		itemTotal,
    		$userLocation,
    		updateCart,
    		removeFromCart,
    		input_input_handler
    	];
    }

    class CartItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { item: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CartItem",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*item*/ ctx[0] === undefined && !("item" in props)) {
    			console.warn("<CartItem> was created without expected prop 'item'");
    		}
    	}

    	get item() {
    		throw new Error("<CartItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<CartItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/screens/Cart.svelte generated by Svelte v3.37.0 */
    const file$7 = "src/screens/Cart.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (22:4) {#if $cartItems.length}
    function create_if_block_3$2(ctx) {
    	let div;
    	let t_value = /*$cartItems*/ ctx[0].length + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "bg-accent-500 w-5 h-5 rounded-xl absolute top-1 right-1 text-white text-sm");
    			add_location(div, file$7, 22, 4, 1061);
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
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(22:4) {#if $cartItems.length}",
    		ctx
    	});

    	return block;
    }

    // (30:0) {#if showCart}
    function create_if_block$5(ctx) {
    	let div2;
    	let span;
    	let t0;
    	let div1;
    	let h2;
    	let t2;
    	let div0;
    	let current_block_type_index;
    	let if_block0;
    	let t3;
    	let div2_transition;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block_2$2, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$cartItems*/ ctx[0].length) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*$userLocation*/ ctx[3] === "IN") return create_if_block_1$3;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block1 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			span = element("span");
    			t0 = space();
    			div1 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Cart";
    			t2 = space();
    			div0 = element("div");
    			if_block0.c();
    			t3 = space();
    			if_block1.c();
    			attr_dev(span, "class", "h-fit cart-overlay");
    			add_location(span, file$7, 31, 4, 1332);
    			add_location(h2, file$7, 33, 8, 1480);
    			attr_dev(div0, "class", "cart-list");
    			add_location(div0, file$7, 35, 8, 1511);
    			attr_dev(div1, "class", "h-fit w-80 bg-white border-l border-grey-200 p-5 shadow-md");
    			add_location(div1, file$7, 32, 4, 1399);
    			attr_dev(div2, "class", "fixed flex bottom-0 left-0 w-screen bg-white bg-opacity-50 z-30 md:z-40");
    			add_location(div2, file$7, 30, 0, 1227);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, span);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, h2);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			if_blocks[current_block_type_index].m(div0, null);
    			append_dev(div1, t3);
    			if_block1.m(div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*toggleCart*/ ctx[4], false, false, false);
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
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				} else {
    					if_block0.p(ctx, dirty);
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(div0, null);
    			}

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div1, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);

    			add_render_callback(() => {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fly, {}, true);
    				div2_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fly, {}, false);
    			div2_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if_blocks[current_block_type_index].d();
    			if_block1.d();
    			if (detaching && div2_transition) div2_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(30:0) {#if showCart}",
    		ctx
    	});

    	return block;
    }

    // (42:12) {:else}
    function create_else_block_1(ctx) {
    	let p;
    	let p_transition;
    	let current;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Cart is empty";
    			attr_dev(p, "class", "text-grey-400 text-center text-sm");
    			add_location(p, file$7, 42, 12, 1717);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!p_transition) p_transition = create_bidirectional_transition(p, fade, {}, true);
    				p_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!p_transition) p_transition = create_bidirectional_transition(p, fade, {}, false);
    			p_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching && p_transition) p_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(42:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (38:12) {#if $cartItems.length}
    function create_if_block_2$2(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = /*$cartItems*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*item*/ ctx[5].product.id;
    	validate_each_keys(ctx, each_value, get_each_context$3, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$3(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$3(key, child_ctx));
    	}

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
    			if (dirty & /*$cartItems*/ 1) {
    				each_value = /*$cartItems*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$3, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$3, each_1_anchor, get_each_context$3);
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
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(38:12) {#if $cartItems.length}",
    		ctx
    	});

    	return block;
    }

    // (39:12) {#each $cartItems as item (item.product.id)}
    function create_each_block$3(key_1, ctx) {
    	let first;
    	let cartitem;
    	let current;

    	cartitem = new CartItem({
    			props: { item: /*item*/ ctx[5] },
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(cartitem.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(cartitem, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
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
    			if (detaching) detach_dev(first);
    			destroy_component(cartitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(39:12) {#each $cartItems as item (item.product.id)}",
    		ctx
    	});

    	return block;
    }

    // (58:8) {:else}
    function create_else_block$2(ctx) {
    	let a;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "Proceed To Checkout";
    			attr_dev(a, "href", "/checkout");
    			attr_dev(a, "class", "inline-block text-center mt-5 text-lg btn-m btn-a w-full");
    			add_location(a, file$7, 58, 8, 2433);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(link.call(null, a)),
    					listen_dev(
    						a,
    						"click",
    						function () {
    							if (is_function(/*showCart*/ ctx[1] = false)) (/*showCart*/ ctx[1] = false).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(58:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (48:8) {#if $userLocation==='IN'}
    function create_if_block_1$3(ctx) {
    	let div;
    	let t0;
    	let span1;
    	let t1;
    	let span0;
    	let t2_value = Math.trunc(/*cartTotal*/ ctx[2]) + "";
    	let t2;
    	let t3;
    	let span2;

    	let t4_value = (/*cartTotal*/ ctx[2]
    	? /*cartTotal*/ ctx[2].toString().split(".")[1]
    	: "00") + "";

    	let t4;
    	let t5;
    	let a;
    	let i;
    	let t6;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("Total\n            ");
    			span1 = element("span");
    			t1 = text("₹");
    			span0 = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			span2 = element("span");
    			t4 = text(t4_value);
    			t5 = space();
    			a = element("a");
    			i = element("i");
    			t6 = text("\n            Proceed To Checkout");
    			attr_dev(span0, "class", "font-bold text-grey-700");
    			add_location(span0, file$7, 50, 66, 2008);
    			attr_dev(span1, "class", "align-top text-2xl text-grey-500");
    			add_location(span1, file$7, 50, 12, 1954);
    			attr_dev(span2, "class", "align-top text-sm text-grey-500");
    			add_location(span2, file$7, 51, 12, 2096);
    			attr_dev(div, "class", "text-right my-3");
    			add_location(div, file$7, 48, 8, 1894);
    			attr_dev(i, "class", "fas fa-cash-register");
    			add_location(i, file$7, 54, 12, 2327);
    			attr_dev(a, "href", "/api/checkout");
    			attr_dev(a, "class", "inline-block text-center text-lg btn-m btn-a w-full");
    			add_location(a, file$7, 53, 8, 2230);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, span1);
    			append_dev(span1, t1);
    			append_dev(span1, span0);
    			append_dev(span0, t2);
    			append_dev(div, t3);
    			append_dev(div, span2);
    			append_dev(span2, t4);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    			append_dev(a, t6);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cartTotal*/ 4 && t2_value !== (t2_value = Math.trunc(/*cartTotal*/ ctx[2]) + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*cartTotal*/ 4 && t4_value !== (t4_value = (/*cartTotal*/ ctx[2]
    			? /*cartTotal*/ ctx[2].toString().split(".")[1]
    			: "00") + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(48:8) {#if $userLocation==='IN'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
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
    	let if_block0 = /*$cartItems*/ ctx[0].length && create_if_block_3$2(ctx);
    	let if_block1 = /*showCart*/ ctx[1] && create_if_block$5(ctx);

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
    			add_location(path0, file$7, 15, 10, 780);
    			attr_dev(ellipse0, "cx", "1.99");
    			attr_dev(ellipse0, "cy", "295.56");
    			attr_dev(ellipse0, "rx", ".66");
    			attr_dev(ellipse0, "ry", ".65");
    			add_location(ellipse0, file$7, 16, 10, 836);
    			attr_dev(ellipse1, "cy", "295.56");
    			attr_dev(ellipse1, "cx", "6.36");
    			attr_dev(ellipse1, "rx", ".66");
    			attr_dev(ellipse1, "ry", ".65");
    			add_location(ellipse1, file$7, 17, 10, 897);
    			attr_dev(path1, "d", "M2.3 293.88h4.44l.7-2.4-5.84-.55");
    			add_location(path1, file$7, 18, 10, 958);
    			attr_dev(g, "transform", "translate(0 -289)");
    			attr_dev(g, "stroke", "#4f46e5");
    			attr_dev(g, "fill", "none");
    			attr_dev(g, "stroke-width", ".53");
    			attr_dev(g, "stroke-linecap", "round");
    			attr_dev(g, "stroke-linejoin", "round");
    			add_location(g, file$7, 14, 8, 641);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 7.94 7.94");
    			attr_dev(svg, "height", "30");
    			attr_dev(svg, "width", "30");
    			add_location(svg, file$7, 13, 4, 545);
    			attr_dev(button, "class", "btn-cart");
    			add_location(button, file$7, 12, 0, 493);
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
    					if_block0 = create_if_block_3$2(ctx);
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
    					if_block1 = create_if_block$5(ctx);
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
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let cartTotal;
    	let $cartItems;
    	let $userLocation;
    	validate_store(cartItems, "cartItems");
    	component_subscribe($$self, cartItems, $$value => $$invalidate(0, $cartItems = $$value));
    	validate_store(userLocation, "userLocation");
    	component_subscribe($$self, userLocation, $$value => $$invalidate(3, $userLocation = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Cart", slots, []);
    	let showCart = false;
    	const toggleCart = () => $$invalidate(1, showCart = !showCart);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Cart> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		fade,
    		fly,
    		link,
    		cartItems,
    		userLocation,
    		CartItem,
    		showCart,
    		toggleCart,
    		cartTotal,
    		$cartItems,
    		$userLocation
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
    			? $cartItems.map(i => i.quantity * (i.product.discount_price
    				? i.product.discount_price
    				: i.product.price)).reduce((acc, cur) => acc + cur).toFixed(2)
    			: 0);
    		}
    	};

    	return [$cartItems, showCart, cartTotal, $userLocation, toggleCart];
    }

    class Cart extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cart",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/screens/ProductTile.svelte generated by Svelte v3.37.0 */
    const file$6 = "src/screens/ProductTile.svelte";

    // (15:8) {#if $userLocation==='IN'}
    function create_if_block$4(ctx) {
    	let div;
    	let t0;
    	let p;
    	let span1;
    	let t1;
    	let span0;
    	let t3;
    	let span2;
    	let if_block = /*product*/ ctx[0].discount_price && create_if_block_1$2(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			p = element("p");
    			span1 = element("span");
    			t1 = text("₹ ");
    			span0 = element("span");
    			span0.textContent = `${/*price*/ ctx[3][0]}`;
    			t3 = space();
    			span2 = element("span");
    			span2.textContent = `${/*price*/ ctx[3][1]}`;
    			attr_dev(span0, "class", "font-bold text-grey-700");
    			add_location(span0, file$6, 22, 62, 1110);
    			attr_dev(span1, "class", "align-top text-grey-500");
    			add_location(span1, file$6, 22, 16, 1064);
    			attr_dev(span2, "class", "align-top text-xs text-grey-500 -ml-0.5");
    			add_location(span2, file$6, 23, 16, 1189);
    			attr_dev(p, "class", "inline-block px-2 pt-0.5");
    			add_location(p, file$6, 21, 12, 1011);
    			attr_dev(div, "class", "absolute bg-white top-1 left-1 rounded-sm inline-block whitespace-nowrap shadow");
    			add_location(div, file$6, 15, 8, 615);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t0);
    			append_dev(div, p);
    			append_dev(p, span1);
    			append_dev(span1, t1);
    			append_dev(span1, span0);
    			append_dev(p, t3);
    			append_dev(p, span2);
    		},
    		p: function update(ctx, dirty) {
    			if (/*product*/ ctx[0].discount_price) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$2(ctx);
    					if_block.c();
    					if_block.m(div, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(15:8) {#if $userLocation==='IN'}",
    		ctx
    	});

    	return block;
    }

    // (17:12) {#if product.discount_price}
    function create_if_block_1$2(ctx) {
    	let span;
    	let t0_value = Math.round((/*product*/ ctx[0].price - /*product*/ ctx[0].discount_price) / /*product*/ ctx[0].price * 100) + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = text("% OFF");
    			attr_dev(span, "class", "inline-block py-1 px-2 rounded-l-sm text-sm font-bold bg-accent-500 text-white h-full");
    			add_location(span, file$6, 17, 12, 762);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*product*/ 1 && t0_value !== (t0_value = Math.round((/*product*/ ctx[0].price - /*product*/ ctx[0].discount_price) / /*product*/ ctx[0].price * 100) + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(17:12) {#if product.discount_price}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div1;
    	let a;
    	let div0;
    	let t0;
    	let h2;
    	let t1_value = /*product*/ ctx[0].name + "";
    	let t1;
    	let t2;
    	let a_href_value;
    	let t3;
    	let button;
    	let i;
    	let t4;
    	let mounted;
    	let dispose;
    	let if_block = /*$userLocation*/ ctx[2] === "IN" && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			a = element("a");
    			div0 = element("div");
    			t0 = space();
    			h2 = element("h2");
    			t1 = text(t1_value);
    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();
    			button = element("button");
    			i = element("i");
    			t4 = text(" Add To Cart");
    			set_style(div0, "background-image", "url('" + /*product*/ ctx[0].image_url + "')");
    			attr_dev(div0, "class", "bg-cover bg-center h-36 sm:h-60 rounded");
    			add_location(div0, file$6, 10, 8, 387);
    			attr_dev(h2, "class", "py-1 text-grey-700");
    			add_location(h2, file$6, 13, 8, 521);
    			attr_dev(a, "href", a_href_value = "/product/" + /*product*/ ctx[0].id);
    			attr_dev(a, "class", "relative w-full focus:outline-none");
    			add_location(a, file$6, 9, 4, 294);
    			attr_dev(i, "class", "fas fa-cart-arrow-down");
    			add_location(i, file$6, 30, 8, 1450);
    			attr_dev(button, "class", "text-sm btn-m btn-w w-full border border-info-300 hover:border-info-200");
    			add_location(button, file$6, 29, 4, 1321);
    			attr_dev(div1, "class", "store-card");
    			add_location(div1, file$6, 8, 0, 265);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, a);
    			append_dev(a, div0);
    			append_dev(a, t0);
    			append_dev(a, h2);
    			append_dev(h2, t1);
    			append_dev(a, t2);
    			if (if_block) if_block.m(a, null);
    			append_dev(div1, t3);
    			append_dev(div1, button);
    			append_dev(button, i);
    			append_dev(button, t4);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(link.call(null, a)),
    					listen_dev(
    						button,
    						"click",
    						function () {
    							if (is_function(/*addToCart*/ ctx[1](/*product*/ ctx[0]))) /*addToCart*/ ctx[1](/*product*/ ctx[0]).apply(this, arguments);
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

    			if (dirty & /*product*/ 1) {
    				set_style(div0, "background-image", "url('" + /*product*/ ctx[0].image_url + "')");
    			}

    			if (dirty & /*product*/ 1 && t1_value !== (t1_value = /*product*/ ctx[0].name + "")) set_data_dev(t1, t1_value);

    			if (/*$userLocation*/ ctx[2] === "IN") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					if_block.m(a, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*product*/ 1 && a_href_value !== (a_href_value = "/product/" + /*product*/ ctx[0].id)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $userLocation;
    	validate_store(userLocation, "userLocation");
    	component_subscribe($$self, userLocation, $$value => $$invalidate(2, $userLocation = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ProductTile", slots, []);
    	let { product } = $$props;

    	let price = product.discount_price
    	? product.discount_price.split(".")
    	: product.price.split(".");

    	let { addToCart } = $$props;
    	const writable_props = ["product", "addToCart"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ProductTile> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("product" in $$props) $$invalidate(0, product = $$props.product);
    		if ("addToCart" in $$props) $$invalidate(1, addToCart = $$props.addToCart);
    	};

    	$$self.$capture_state = () => ({
    		userLocation,
    		link,
    		product,
    		price,
    		addToCart,
    		$userLocation
    	});

    	$$self.$inject_state = $$props => {
    		if ("product" in $$props) $$invalidate(0, product = $$props.product);
    		if ("price" in $$props) $$invalidate(3, price = $$props.price);
    		if ("addToCart" in $$props) $$invalidate(1, addToCart = $$props.addToCart);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [product, addToCart, $userLocation, price];
    }

    class ProductTile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { product: 0, addToCart: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProductTile",
    			options,
    			id: create_fragment$6.name
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
    const file$5 = "src/screens/Shop.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (47:0) {:else}
    function create_else_block$1(ctx) {
    	let section;
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
    	let each_value = /*$filteredProducts*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			section = element("section");
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
    			add_location(i, file$5, 50, 46, 1846);
    			attr_dev(p, "class", "text-white");
    			add_location(p, file$5, 50, 8, 1808);
    			attr_dev(input, "class", "w-48 rounded-sm focus:outline-none px-1");
    			attr_dev(input, "type", "search");
    			attr_dev(input, "placeholder", "Product");
    			add_location(input, file$5, 51, 8, 1888);
    			attr_dev(div0, "class", "fixed px-1 py-2 w-full bg-primary-600 shadow-md md:w-52 md:rounded-r-md md:top-1/4 text-center z-30");
    			add_location(div0, file$5, 49, 4, 1686);
    			attr_dev(div1, "class", "store-grid");
    			add_location(div1, file$5, 54, 4, 2018);
    			add_location(section, file$5, 48, 0, 1672);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);
    			append_dev(div0, p);
    			append_dev(p, t0);
    			append_dev(p, i);
    			append_dev(div0, t1);
    			append_dev(div0, input);
    			set_input_value(input, /*nameTerm*/ ctx[0]);
    			append_dev(section, t2);
    			append_dev(section, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[4]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*nameTerm*/ 1) {
    				set_input_value(input, /*nameTerm*/ ctx[0]);
    			}

    			if (dirty & /*$filteredProducts, addToCart*/ 12) {
    				each_value = /*$filteredProducts*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
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
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(47:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (38:0) {#if $isLoading}
    function create_if_block$3(ctx) {
    	let div;
    	let p;
    	let t1;
    	let svg;
    	let path;
    	let animateTransform;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "Loading...";
    			t1 = space();
    			svg = svg_element("svg");
    			path = svg_element("path");
    			animateTransform = svg_element("animateTransform");
    			attr_dev(p, "class", "text-grey-500 mb-5");
    			add_location(p, file$5, 39, 4, 1136);
    			attr_dev(animateTransform, "attributeName", "transform");
    			attr_dev(animateTransform, "type", "rotate");
    			attr_dev(animateTransform, "from", "0 25 25");
    			attr_dev(animateTransform, "to", "360 25 25");
    			attr_dev(animateTransform, "dur", "0.5s");
    			attr_dev(animateTransform, "repeatCount", "indefinite");
    			add_location(animateTransform, file$5, 42, 10, 1497);
    			attr_dev(path, "fill", "#C779D0");
    			attr_dev(path, "d", "M25,5A20.14,20.14,0,0,1,45,22.88a2.51,2.51,0,0,0,2.49,2.26h0A2.52,2.52,0,0,0,50,22.33a25.14,25.14,0,0,0-50,0,2.52,2.52,0,0,0,2.5,2.81h0A2.51,2.51,0,0,0,5,22.88,20.14,20.14,0,0,1,25,5Z");
    			add_location(path, file$5, 41, 8, 1277);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "50");
    			attr_dev(svg, "height", "50");
    			attr_dev(svg, "viewBox", "0 0 50 50");
    			add_location(svg, file$5, 40, 4, 1185);
    			attr_dev(div, "class", "w-full h-fit flex justify-center items-center flex-col");
    			add_location(div, file$5, 38, 0, 1063);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(div, t1);
    			append_dev(div, svg);
    			append_dev(svg, path);
    			append_dev(path, animateTransform);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(38:0) {#if $isLoading}",
    		ctx
    	});

    	return block;
    }

    // (56:8) {#each $filteredProducts as product}
    function create_each_block$2(ctx) {
    	let producttile;
    	let current;

    	producttile = new ProductTile({
    			props: {
    				product: /*product*/ ctx[7],
    				addToCart: /*addToCart*/ ctx[3]
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
    			if (dirty & /*$filteredProducts*/ 4) producttile_changes.product = /*product*/ ctx[7];
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
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(56:8) {#each $filteredProducts as product}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$3, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$isLoading*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
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
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
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
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $hasLoadedProducts;
    	let $cartItems;
    	let $isLoading;
    	let $filteredProducts;
    	validate_store(hasLoadedProducts, "hasLoadedProducts");
    	component_subscribe($$self, hasLoadedProducts, $$value => $$invalidate(5, $hasLoadedProducts = $$value));
    	validate_store(cartItems, "cartItems");
    	component_subscribe($$self, cartItems, $$value => $$invalidate(6, $cartItems = $$value));
    	validate_store(isLoading, "isLoading");
    	component_subscribe($$self, isLoading, $$value => $$invalidate(1, $isLoading = $$value));
    	validate_store(filteredProducts, "filteredProducts");
    	component_subscribe($$self, filteredProducts, $$value => $$invalidate(2, $filteredProducts = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Shop", slots, []);

    	onMount(() => {
    		if ($hasLoadedProducts) isLoading.set(false); else fetchProducts();
    	});

    	let nameTerm = "";

    	const addToCart = async data => {
    		let item = {};
    		item.id = data.id;
    		item.moq = data.moq;
    		let iId = await addItem(item, 1);

    		for (let i = 0; i < $cartItems.length; i++) {
    			if ($cartItems[i].product.id === data.id) {
    				set_store_value(cartItems, $cartItems[i].quantity++, $cartItems);
    				cartItems.set($cartItems);
    				return;
    			}
    		}

    		let temp = {};
    		temp.id = iId;
    		temp.product = {};
    		temp.product = data;
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
    		onMount,
    		isLoading,
    		hasLoadedProducts,
    		filteredProducts,
    		nameF,
    		cartItems,
    		ProductTile,
    		fetchProducts,
    		addItem,
    		nameTerm,
    		addToCart,
    		$hasLoadedProducts,
    		$cartItems,
    		$isLoading,
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

    	return [nameTerm, $isLoading, $filteredProducts, addToCart, input_input_handler];
    }

    class Shop extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Shop",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/screens/CheckoutItem.svelte generated by Svelte v3.37.0 */

    const file$4 = "src/screens/CheckoutItem.svelte";

    function create_fragment$4(ctx) {
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t0;
    	let a;
    	let t1_value = /*item*/ ctx[0].product.name + "";
    	let t1;
    	let t2;
    	let a_href_value;
    	let t3;
    	let p;
    	let t4_value = /*item*/ ctx[0].product.price + "";
    	let t4;
    	let t5;
    	let span0;
    	let t7_value = /*item*/ ctx[0].quantity + "";
    	let t7;
    	let t8;
    	let span1;
    	let t9_value = /*item*/ ctx[0].product.units + "";
    	let t9;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			a = element("a");
    			t1 = text(t1_value);
    			t2 = text("}");
    			t3 = space();
    			p = element("p");
    			t4 = text(t4_value);
    			t5 = space();
    			span0 = element("span");
    			span0.textContent = "⨯";
    			t7 = text(t7_value);
    			t8 = space();
    			span1 = element("span");
    			t9 = text(t9_value);
    			if (img.src !== (img_src_value = /*item*/ ctx[0].product.image_url)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "inline-block w-12 h-12");
    			attr_dev(img, "alt", img_alt_value = /*item*/ ctx[0].product.name);
    			add_location(img, file$4, 9, 8, 401);
    			attr_dev(a, "href", a_href_value = "/store/#/product/" + /*item*/ ctx[0].product.id);
    			attr_dev(a, "class", "block text-grey-600 md:inline-block md:w-7/12 md:ml-5 font-bold align-middle");
    			add_location(a, file$4, 11, 8, 504);
    			attr_dev(span0, "class", "text-grey-500");
    			add_location(span0, file$4, 13, 33, 760);
    			attr_dev(span1, "class", "text-sm text-grey-500");
    			add_location(span1, file$4, 14, 12, 830);
    			attr_dev(p, "class", "text-grey-800 md:inline-block md:w-3/12 md:ml-5");
    			add_location(p, file$4, 12, 8, 667);
    			attr_dev(div0, "class", "inline-block text-base align-middle md:w-5/6");
    			add_location(div0, file$4, 8, 4, 334);
    			attr_dev(div1, "class", "relative md:text-left tx0 border-b border-grey-300 py-2 last:border-none");
    			add_location(div1, file$4, 7, 0, 243);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			append_dev(div0, t0);
    			append_dev(div0, a);
    			append_dev(a, t1);
    			append_dev(a, t2);
    			append_dev(div0, t3);
    			append_dev(div0, p);
    			append_dev(p, t4);
    			append_dev(p, t5);
    			append_dev(p, span0);
    			append_dev(p, t7);
    			append_dev(p, t8);
    			append_dev(p, span1);
    			append_dev(span1, t9);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*item*/ 1 && img.src !== (img_src_value = /*item*/ ctx[0].product.image_url)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*item*/ 1 && img_alt_value !== (img_alt_value = /*item*/ ctx[0].product.name)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*item*/ 1 && t1_value !== (t1_value = /*item*/ ctx[0].product.name + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*item*/ 1 && a_href_value !== (a_href_value = "/store/#/product/" + /*item*/ ctx[0].product.id)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*item*/ 1 && t4_value !== (t4_value = /*item*/ ctx[0].product.price + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*item*/ 1 && t7_value !== (t7_value = /*item*/ ctx[0].quantity + "")) set_data_dev(t7, t7_value);
    			if (dirty & /*item*/ 1 && t9_value !== (t9_value = /*item*/ ctx[0].product.units + "")) set_data_dev(t9, t9_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
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
    	validate_slots("CheckoutItem", slots, []);
    	let { item } = $$props;
    	const writable_props = ["item"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CheckoutItem> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("item" in $$props) $$invalidate(0, item = $$props.item);
    	};

    	$$self.$capture_state = () => ({ item });

    	$$self.$inject_state = $$props => {
    		if ("item" in $$props) $$invalidate(0, item = $$props.item);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [item];
    }

    class CheckoutItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { item: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CheckoutItem",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*item*/ ctx[0] === undefined && !("item" in props)) {
    			console.warn("<CheckoutItem> was created without expected prop 'item'");
    		}
    	}

    	get item() {
    		throw new Error("<CheckoutItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<CheckoutItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/screens/Checkout.svelte generated by Svelte v3.37.0 */
    const file$3 = "src/screens/Checkout.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (24:8) {#each $cartItems as item}
    function create_each_block$1(ctx) {
    	let checkoutitem;
    	let current;

    	checkoutitem = new CheckoutItem({
    			props: { item: /*item*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(checkoutitem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(checkoutitem, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const checkoutitem_changes = {};
    			if (dirty & /*$cartItems*/ 1) checkoutitem_changes.item = /*item*/ ctx[1];
    			checkoutitem.$set(checkoutitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(checkoutitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(checkoutitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(checkoutitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(24:8) {#each $cartItems as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div3;
    	let p;
    	let a0;
    	let t1;
    	let a1;
    	let t3;
    	let t4;
    	let h10;
    	let t6;
    	let div2;
    	let div0;
    	let a2;
    	let i;
    	let t7;
    	let t8;
    	let h11;
    	let t10;
    	let t11;
    	let form;
    	let div1;
    	let input;
    	let t12;
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*$cartItems*/ ctx[0];
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
    			div3 = element("div");
    			p = element("p");
    			a0 = element("a");
    			a0.textContent = "Home";
    			t1 = text(" /\n        ");
    			a1 = element("a");
    			a1.textContent = "Store";
    			t3 = text(" /\n        Checkout");
    			t4 = space();
    			h10 = element("h1");
    			h10.textContent = "Checkout";
    			t6 = space();
    			div2 = element("div");
    			div0 = element("div");
    			a2 = element("a");
    			i = element("i");
    			t7 = text(" Back to Store");
    			t8 = space();
    			h11 = element("h1");
    			h11.textContent = "Order Summary";
    			t10 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t11 = space();
    			form = element("form");
    			div1 = element("div");
    			input = element("input");
    			t12 = space();
    			button = element("button");
    			button.textContent = "Get Pricing";
    			attr_dev(a0, "class", "text-info-700");
    			attr_dev(a0, "href", "/");
    			add_location(a0, file$3, 11, 8, 520);
    			attr_dev(a1, "class", "text-info-700");
    			attr_dev(a1, "href", "/");
    			add_location(a1, file$3, 12, 8, 573);
    			attr_dev(p, "class", "text-grey-400 text-sm p-3 pb-6 text-left");
    			add_location(p, file$3, 10, 4, 459);
    			attr_dev(h10, "class", "text-grey-900 text-center text-2xl font-bold");
    			add_location(h10, file$3, 15, 4, 658);
    			attr_dev(i, "class", "fas fa-arrow-left");
    			add_location(i, file$3, 19, 57, 923);
    			attr_dev(a2, "href", "/store");
    			attr_dev(a2, "class", "btn-w btn-m text-sm");
    			add_location(a2, file$3, 19, 12, 878);
    			attr_dev(div0, "class", "text-left");
    			add_location(div0, file$3, 18, 8, 842);
    			attr_dev(h11, "class", "text-grey-600 text-left text-lg");
    			add_location(h11, file$3, 21, 8, 998);
    			attr_dev(input, "class", "form-input");
    			attr_dev(input, "type", "email");
    			attr_dev(input, "name", "email");
    			attr_dev(input, "placeholder", "Email Address");
    			add_location(input, file$3, 36, 16, 1658);
    			attr_dev(div1, "class", "inline-block w-1/2");
    			add_location(div1, file$3, 35, 12, 1609);
    			attr_dev(button, "class", "btn-m btn-p");
    			add_location(button, file$3, 38, 12, 1770);
    			attr_dev(form, "class", "text-grey-500 my-3");
    			add_location(form, file$3, 34, 8, 1563);
    			attr_dev(div2, "class", "inline-block bg-white w-full max-w-hd shadow-md align-top p-4 rounded-md my-4 mx-auto");
    			add_location(div2, file$3, 17, 4, 734);
    			attr_dev(div3, "class", "min-h-fit text-center");
    			add_location(div3, file$3, 9, 0, 419);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, p);
    			append_dev(p, a0);
    			append_dev(p, t1);
    			append_dev(p, a1);
    			append_dev(p, t3);
    			append_dev(div3, t4);
    			append_dev(div3, h10);
    			append_dev(div3, t6);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, a2);
    			append_dev(a2, i);
    			append_dev(a2, t7);
    			append_dev(div2, t8);
    			append_dev(div2, h11);
    			append_dev(div2, t10);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			append_dev(div2, t11);
    			append_dev(div2, form);
    			append_dev(form, div1);
    			append_dev(div1, input);
    			append_dev(form, t12);
    			append_dev(form, button);
    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(link.call(null, a1));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$cartItems*/ 1) {
    				each_value = /*$cartItems*/ ctx[0];
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
    						each_blocks[i].m(div2, t11);
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
    			if (detaching) detach_dev(div3);
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
    	validate_store(cartItems, "cartItems");
    	component_subscribe($$self, cartItems, $$value => $$invalidate(0, $cartItems = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Checkout", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Checkout> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		link,
    		addItem,
    		cartItems,
    		userLocation,
    		CheckoutItem,
    		$cartItems
    	});

    	return [$cartItems];
    }

    class Checkout extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Checkout",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/screens/Slider.svelte generated by Svelte v3.37.0 */

    const file$2 = "src/screens/Slider.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	child_ctx[10] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	child_ctx[10] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    // (16:0) {#if cover}
    function create_if_block$2(ctx) {
    	let div3;
    	let div2;
    	let div1;
    	let div0;
    	let t0;
    	let t1;
    	let t2;
    	let if_block0 = /*images*/ ctx[1] && /*images*/ ctx[1].length > 0 && create_if_block_3$1(ctx);
    	let if_block1 = /*videos*/ ctx[2] && /*videos*/ ctx[2].length > 0 && create_if_block_2$1(ctx);
    	let if_block2 = /*images*/ ctx[1] && /*images*/ ctx[1].length > 0 && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(div0, "class", "product-frame slider-size");
    			set_style(div0, "background-image", "url(" + /*cover*/ ctx[0] + ")");
    			attr_dev(div0, "alt", /*name*/ ctx[3]);
    			add_location(div0, file$2, 20, 12, 654);
    			attr_dev(div1, "id", "reel");
    			add_location(div1, file$2, 18, 8, 511);
    			attr_dev(div2, "class", "slider-size overflow-hidden rounded shadow-md bg-white");
    			add_location(div2, file$2, 17, 4, 434);
    			attr_dev(div3, "class", "inline-block align-top");
    			add_location(div3, file$2, 16, 0, 393);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div1, t0);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t1);
    			if (if_block1) if_block1.m(div1, null);
    			append_dev(div3, t2);
    			if (if_block2) if_block2.m(div3, null);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cover*/ 1) {
    				set_style(div0, "background-image", "url(" + /*cover*/ ctx[0] + ")");
    			}

    			if (dirty & /*name*/ 8) {
    				attr_dev(div0, "alt", /*name*/ ctx[3]);
    			}

    			if (/*images*/ ctx[1] && /*images*/ ctx[1].length > 0) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_3$1(ctx);
    					if_block0.c();
    					if_block0.m(div1, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*videos*/ ctx[2] && /*videos*/ ctx[2].length > 0) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_2$1(ctx);
    					if_block1.c();
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*images*/ ctx[1] && /*images*/ ctx[1].length > 0) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_1$1(ctx);
    					if_block2.c();
    					if_block2.m(div3, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(16:0) {#if cover}",
    		ctx
    	});

    	return block;
    }

    // (23:12) {#if images && images.length > 0}
    function create_if_block_3$1(ctx) {
    	let each_1_anchor;
    	let each_value_3 = /*images*/ ctx[1];
    	validate_each_argument(each_value_3);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

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
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*images, name*/ 10) {
    				each_value_3 = /*images*/ ctx[1];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_3.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(23:12) {#if images && images.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (23:45) {#each images as url}
    function create_each_block_3(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = space();
    			attr_dev(div, "class", "product-frame slider-size");
    			set_style(div, "background-image", "url(" + /*url*/ ctx[13] + ")");
    			attr_dev(div, "alt", /*name*/ ctx[3]);
    			add_location(div, file$2, 23, 16, 848);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*images*/ 2) {
    				set_style(div, "background-image", "url(" + /*url*/ ctx[13] + ")");
    			}

    			if (dirty & /*name*/ 8) {
    				attr_dev(div, "alt", /*name*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(23:45) {#each images as url}",
    		ctx
    	});

    	return block;
    }

    // (27:12) {#if videos && videos.length > 0}
    function create_if_block_2$1(ctx) {
    	let each_1_anchor;
    	let each_value_2 = /*videos*/ ctx[2];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

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
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*videos, name*/ 12) {
    				each_value_2 = /*videos*/ ctx[2];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(27:12) {#if videos && videos.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (27:45) {#each videos as url}
    function create_each_block_2(ctx) {
    	let iframe;
    	let iframe_src_value;
    	let iframe_title_value;
    	let t;

    	const block = {
    		c: function create() {
    			iframe = element("iframe");
    			t = space();
    			attr_dev(iframe, "class", "product-video slider-size");
    			if (iframe.src !== (iframe_src_value = "https://www.youtube.com/embed/" + /*url*/ ctx[13])) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "title", iframe_title_value = "Product video for " + /*name*/ ctx[3]);
    			attr_dev(iframe, "frameborder", "0");
    			attr_dev(iframe, "allow", "accelerometer; clipboard-write; encrypted-media; gyroscope");
    			iframe.allowFullscreen = true;
    			add_location(iframe, file$2, 27, 16, 1065);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, iframe, anchor);
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*videos*/ 4 && iframe.src !== (iframe_src_value = "https://www.youtube.com/embed/" + /*url*/ ctx[13])) {
    				attr_dev(iframe, "src", iframe_src_value);
    			}

    			if (dirty & /*name*/ 8 && iframe_title_value !== (iframe_title_value = "Product video for " + /*name*/ ctx[3])) {
    				attr_dev(iframe, "title", iframe_title_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(iframe);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(27:45) {#each videos as url}",
    		ctx
    	});

    	return block;
    }

    // (34:4) {#if images && images.length > 0}
    function create_if_block_1$1(ctx) {
    	let div;
    	let button;
    	let t0;
    	let t1;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*images*/ ctx[1];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*videos*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			t0 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(button, "class", "slider-thumb");
    			set_style(button, "background-image", "url(" + /*cover*/ ctx[0] + ")");
    			add_location(button, file$2, 35, 8, 1459);
    			attr_dev(div, "class", "slider-thumbs flex flex-wrap my-2.5");
    			add_location(div, file$2, 34, 4, 1401);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(div, t0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div, null);
    			}

    			append_dev(div, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cover*/ 1) {
    				set_style(button, "background-image", "url(" + /*cover*/ ctx[0] + ")");
    			}

    			if (dirty & /*images, currentSlide*/ 18) {
    				each_value_1 = /*images*/ ctx[1];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div, t1);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*currentSlide, images, videos*/ 22) {
    				each_value = /*videos*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(34:4) {#if images && images.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (37:8) {#each images as irl, i}
    function create_each_block_1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[6](/*i*/ ctx[10]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			attr_dev(button, "class", "slider-thumb");
    			set_style(button, "background-image", "url(" + /*irl*/ ctx[11] + ")");
    			add_location(button, file$2, 37, 8, 1611);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*images*/ 2) {
    				set_style(button, "background-image", "url(" + /*irl*/ ctx[11] + ")");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(37:8) {#each images as irl, i}",
    		ctx
    	});

    	return block;
    }

    // (40:8) {#each videos as vrl, i}
    function create_each_block(ctx) {
    	let button;
    	let i_1;
    	let mounted;
    	let dispose;

    	function click_handler_2() {
    		return /*click_handler_2*/ ctx[7](/*i*/ ctx[10]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			i_1 = element("i");
    			attr_dev(i_1, "class", "fas fa-film");
    			add_location(i_1, file$2, 40, 88, 1859);
    			attr_dev(button, "class", "slider-thumb");
    			add_location(button, file$2, 40, 8, 1779);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, i_1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler_2, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(40:8) {#each videos as vrl, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let if_block_anchor;
    	let if_block = /*cover*/ ctx[0] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*cover*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Slider", slots, []);
    	let { cover } = $$props;
    	let { images } = $$props;
    	let { videos } = $$props;
    	let { name } = $$props;

    	const currentSlide = n => {
    		if (window.innerWidth <= 640) {
    			document.getElementById("reel").style.marginTop = -n * 288 + "px";
    		} else {
    			document.getElementById("reel").style.marginTop = -n * 384 + "px";
    		}
    	};

    	const writable_props = ["cover", "images", "videos", "name"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Slider> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => currentSlide(0);
    	const click_handler_1 = i => currentSlide(i + 1);
    	const click_handler_2 = i => currentSlide(i + 1 + images.length);

    	$$self.$$set = $$props => {
    		if ("cover" in $$props) $$invalidate(0, cover = $$props.cover);
    		if ("images" in $$props) $$invalidate(1, images = $$props.images);
    		if ("videos" in $$props) $$invalidate(2, videos = $$props.videos);
    		if ("name" in $$props) $$invalidate(3, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({
    		cover,
    		images,
    		videos,
    		name,
    		currentSlide
    	});

    	$$self.$inject_state = $$props => {
    		if ("cover" in $$props) $$invalidate(0, cover = $$props.cover);
    		if ("images" in $$props) $$invalidate(1, images = $$props.images);
    		if ("videos" in $$props) $$invalidate(2, videos = $$props.videos);
    		if ("name" in $$props) $$invalidate(3, name = $$props.name);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		cover,
    		images,
    		videos,
    		name,
    		currentSlide,
    		click_handler,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class Slider extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { cover: 0, images: 1, videos: 2, name: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Slider",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*cover*/ ctx[0] === undefined && !("cover" in props)) {
    			console.warn("<Slider> was created without expected prop 'cover'");
    		}

    		if (/*images*/ ctx[1] === undefined && !("images" in props)) {
    			console.warn("<Slider> was created without expected prop 'images'");
    		}

    		if (/*videos*/ ctx[2] === undefined && !("videos" in props)) {
    			console.warn("<Slider> was created without expected prop 'videos'");
    		}

    		if (/*name*/ ctx[3] === undefined && !("name" in props)) {
    			console.warn("<Slider> was created without expected prop 'name'");
    		}
    	}

    	get cover() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cover(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get images() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set images(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get videos() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set videos(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/screens/ProductPage.svelte generated by Svelte v3.37.0 */
    const file$1 = "src/screens/ProductPage.svelte";

    // (61:0) {:else}
    function create_else_block(ctx) {
    	let div2;
    	let p0;
    	let a0;
    	let t1;
    	let a1;
    	let t3;
    	let t4_value = /*$productDetail*/ ctx[2].name + "";
    	let t4;
    	let t5;
    	let slider;
    	let t6;
    	let div1;
    	let h1;
    	let t7_value = /*$productDetail*/ ctx[2].name + "";
    	let t7;
    	let t8;
    	let t9;
    	let t10_value = /*$productDetail*/ ctx[2].description + "";
    	let t10;
    	let t11;
    	let form;
    	let t12;
    	let div0;
    	let p1;
    	let t13;
    	let t14_value = /*$productDetail*/ ctx[2].moq + "";
    	let t14;
    	let t15;
    	let t16_value = /*$productDetail*/ ctx[2].units + "";
    	let t16;
    	let t17;
    	let t18;
    	let input;
    	let input_min_value;
    	let input_value_value;
    	let span;
    	let t19_value = /*$productDetail*/ ctx[2].units + "";
    	let t19;
    	let t20;
    	let button;
    	let i;
    	let t21;
    	let t22;
    	let current;
    	let mounted;
    	let dispose;

    	slider = new Slider({
    			props: {
    				cover: /*$productDetail*/ ctx[2].image_url,
    				images: /*$productDetail*/ ctx[2].image_urls,
    				videos: /*$productDetail*/ ctx[2].video_urls,
    				name: /*$productDetail*/ ctx[2].name
    			},
    			$$inline: true
    		});

    	let if_block0 = /*$userLocation*/ ctx[3] === "IN" && /*$productDetail*/ ctx[2].discount_price && create_if_block_4(ctx);
    	let if_block1 = /*$userLocation*/ ctx[3] === "IN" && create_if_block_2(ctx);
    	let if_block2 = /*error*/ ctx[0] && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			p0 = element("p");
    			a0 = element("a");
    			a0.textContent = "Home";
    			t1 = text(" /\n        ");
    			a1 = element("a");
    			a1.textContent = "Store";
    			t3 = text(" /\n        ");
    			t4 = text(t4_value);
    			t5 = space();
    			create_component(slider.$$.fragment);
    			t6 = space();
    			div1 = element("div");
    			h1 = element("h1");
    			t7 = text(t7_value);
    			t8 = space();
    			if (if_block0) if_block0.c();
    			t9 = space();
    			t10 = text(t10_value);
    			t11 = space();
    			form = element("form");
    			if (if_block1) if_block1.c();
    			t12 = space();
    			div0 = element("div");
    			p1 = element("p");
    			t13 = text("Quantity (min. ");
    			t14 = text(t14_value);
    			t15 = space();
    			t16 = text(t16_value);
    			t17 = text(")");
    			t18 = space();
    			input = element("input");
    			span = element("span");
    			t19 = text(t19_value);
    			t20 = space();
    			button = element("button");
    			i = element("i");
    			t21 = text(" Add To Cart");
    			t22 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(a0, "class", "text-info-700");
    			attr_dev(a0, "href", "/");
    			add_location(a0, file$1, 64, 8, 2415);
    			attr_dev(a1, "class", "text-info-700");
    			attr_dev(a1, "href", "/");
    			add_location(a1, file$1, 65, 8, 2468);
    			attr_dev(p0, "class", "text-grey-400 text-sm p-3 pb-6 text-left");
    			add_location(p0, file$1, 63, 4, 2354);
    			attr_dev(h1, "class", "text-2xl");
    			add_location(h1, file$1, 74, 8, 2777);
    			attr_dev(p1, "class", "text-grey-400 text-xs");
    			add_location(p1, file$1, 103, 16, 4569);
    			attr_dev(input, "class", "w-24 cart-input");
    			attr_dev(input, "type", "number");
    			attr_dev(input, "name", "addQty");
    			attr_dev(input, "id", "addQty");
    			attr_dev(input, "min", input_min_value = /*$productDetail*/ ctx[2].moq);
    			input.value = input_value_value = /*$productDetail*/ ctx[2].moq;
    			add_location(input, file$1, 104, 16, 4682);
    			attr_dev(span, "class", "text-info-600 border-b-2 bg-info-100 border-info-400 pb-1 pt-1.5 -ml-1 px-2");
    			add_location(span, file$1, 105, 74, 4827);
    			attr_dev(div0, "class", "inline-block mr-4 align-bottom");
    			add_location(div0, file$1, 102, 12, 4508);
    			attr_dev(i, "class", "fas fa-cart-arrow-down");
    			add_location(i, file$1, 109, 16, 5063);
    			attr_dev(button, "class", "btn-p btn-m mt-2");
    			attr_dev(button, "type", "submit");
    			add_location(button, file$1, 108, 12, 4999);
    			attr_dev(form, "class", "bg-white p-4 shadow-md text-center rounded");
    			add_location(form, file$1, 84, 8, 3227);
    			attr_dev(div1, "class", "inline-block px-3 md:w-1/2 text-left");
    			add_location(div1, file$1, 73, 4, 2718);
    			attr_dev(div2, "class", "min-h-fit text-center");
    			add_location(div2, file$1, 62, 0, 2314);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, p0);
    			append_dev(p0, a0);
    			append_dev(p0, t1);
    			append_dev(p0, a1);
    			append_dev(p0, t3);
    			append_dev(p0, t4);
    			append_dev(div2, t5);
    			mount_component(slider, div2, null);
    			append_dev(div2, t6);
    			append_dev(div2, div1);
    			append_dev(div1, h1);
    			append_dev(h1, t7);
    			append_dev(h1, t8);
    			if (if_block0) if_block0.m(h1, null);
    			append_dev(div1, t9);
    			append_dev(div1, t10);
    			append_dev(div1, t11);
    			append_dev(div1, form);
    			if (if_block1) if_block1.m(form, null);
    			append_dev(form, t12);
    			append_dev(form, div0);
    			append_dev(div0, p1);
    			append_dev(p1, t13);
    			append_dev(p1, t14);
    			append_dev(p1, t15);
    			append_dev(p1, t16);
    			append_dev(p1, t17);
    			append_dev(div0, t18);
    			append_dev(div0, input);
    			append_dev(div0, span);
    			append_dev(span, t19);
    			append_dev(form, t20);
    			append_dev(form, button);
    			append_dev(button, i);
    			append_dev(button, t21);
    			append_dev(form, t22);
    			if (if_block2) if_block2.m(form, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(link.call(null, a1)),
    					listen_dev(
    						form,
    						"submit",
    						prevent_default(function () {
    							if (is_function(/*addToCart*/ ctx[4](/*$productDetail*/ ctx[2]))) /*addToCart*/ ctx[4](/*$productDetail*/ ctx[2]).apply(this, arguments);
    						}),
    						false,
    						true,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*$productDetail*/ 4) && t4_value !== (t4_value = /*$productDetail*/ ctx[2].name + "")) set_data_dev(t4, t4_value);
    			const slider_changes = {};
    			if (dirty & /*$productDetail*/ 4) slider_changes.cover = /*$productDetail*/ ctx[2].image_url;
    			if (dirty & /*$productDetail*/ 4) slider_changes.images = /*$productDetail*/ ctx[2].image_urls;
    			if (dirty & /*$productDetail*/ 4) slider_changes.videos = /*$productDetail*/ ctx[2].video_urls;
    			if (dirty & /*$productDetail*/ 4) slider_changes.name = /*$productDetail*/ ctx[2].name;
    			slider.$set(slider_changes);
    			if ((!current || dirty & /*$productDetail*/ 4) && t7_value !== (t7_value = /*$productDetail*/ ctx[2].name + "")) set_data_dev(t7, t7_value);

    			if (/*$userLocation*/ ctx[3] === "IN" && /*$productDetail*/ ctx[2].discount_price) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					if_block0.m(h1, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if ((!current || dirty & /*$productDetail*/ 4) && t10_value !== (t10_value = /*$productDetail*/ ctx[2].description + "")) set_data_dev(t10, t10_value);

    			if (/*$userLocation*/ ctx[3] === "IN") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_2(ctx);
    					if_block1.c();
    					if_block1.m(form, t12);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if ((!current || dirty & /*$productDetail*/ 4) && t14_value !== (t14_value = /*$productDetail*/ ctx[2].moq + "")) set_data_dev(t14, t14_value);
    			if ((!current || dirty & /*$productDetail*/ 4) && t16_value !== (t16_value = /*$productDetail*/ ctx[2].units + "")) set_data_dev(t16, t16_value);

    			if (!current || dirty & /*$productDetail*/ 4 && input_min_value !== (input_min_value = /*$productDetail*/ ctx[2].moq)) {
    				attr_dev(input, "min", input_min_value);
    			}

    			if (!current || dirty & /*$productDetail*/ 4 && input_value_value !== (input_value_value = /*$productDetail*/ ctx[2].moq)) {
    				prop_dev(input, "value", input_value_value);
    			}

    			if ((!current || dirty & /*$productDetail*/ 4) && t19_value !== (t19_value = /*$productDetail*/ ctx[2].units + "")) set_data_dev(t19, t19_value);

    			if (/*error*/ ctx[0]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_1(ctx);
    					if_block2.c();
    					if_block2.m(form, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slider.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slider.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(slider);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(61:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (52:0) {#if $isLoading}
    function create_if_block$1(ctx) {
    	let div;
    	let p;
    	let t1;
    	let svg;
    	let path;
    	let animateTransform;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "Loading...";
    			t1 = space();
    			svg = svg_element("svg");
    			path = svg_element("path");
    			animateTransform = svg_element("animateTransform");
    			attr_dev(p, "class", "text-grey-500 mb-5");
    			add_location(p, file$1, 53, 4, 1778);
    			attr_dev(animateTransform, "attributeName", "transform");
    			attr_dev(animateTransform, "type", "rotate");
    			attr_dev(animateTransform, "from", "0 25 25");
    			attr_dev(animateTransform, "to", "360 25 25");
    			attr_dev(animateTransform, "dur", "0.5s");
    			attr_dev(animateTransform, "repeatCount", "indefinite");
    			add_location(animateTransform, file$1, 56, 10, 2139);
    			attr_dev(path, "fill", "#C779D0");
    			attr_dev(path, "d", "M25,5A20.14,20.14,0,0,1,45,22.88a2.51,2.51,0,0,0,2.49,2.26h0A2.52,2.52,0,0,0,50,22.33a25.14,25.14,0,0,0-50,0,2.52,2.52,0,0,0,2.5,2.81h0A2.51,2.51,0,0,0,5,22.88,20.14,20.14,0,0,1,25,5Z");
    			add_location(path, file$1, 55, 8, 1919);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "50");
    			attr_dev(svg, "height", "50");
    			attr_dev(svg, "viewBox", "0 0 50 50");
    			add_location(svg, file$1, 54, 4, 1827);
    			attr_dev(div, "class", "w-full h-fit flex justify-center items-center flex-col");
    			add_location(div, file$1, 52, 0, 1705);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(div, t1);
    			append_dev(div, svg);
    			append_dev(svg, path);
    			append_dev(path, animateTransform);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(52:0) {#if $isLoading}",
    		ctx
    	});

    	return block;
    }

    // (77:12) {#if $userLocation === 'IN' && $productDetail.discount_price}
    function create_if_block_4(ctx) {
    	let span;
    	let t0_value = Math.round((/*$productDetail*/ ctx[2].price - /*$productDetail*/ ctx[2].discount_price) / /*$productDetail*/ ctx[2].price * 100) + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = text("% OFF");
    			attr_dev(span, "class", "inline-block px-1 text-lg rounded font-bold bg-accent-500 text-white h-full");
    			add_location(span, file$1, 77, 12, 2919);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$productDetail*/ 4 && t0_value !== (t0_value = Math.round((/*$productDetail*/ ctx[2].price - /*$productDetail*/ ctx[2].discount_price) / /*$productDetail*/ ctx[2].price * 100) + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(77:12) {#if $userLocation === 'IN' && $productDetail.discount_price}",
    		ctx
    	});

    	return block;
    }

    // (86:12) {#if $userLocation === 'IN'}
    function create_if_block_2(ctx) {
    	let div;
    	let p0;
    	let t1;
    	let p1;
    	let span1;
    	let t2;
    	let span0;
    	let t3_value = Math.trunc(/*$productDetail*/ ctx[2].price) + "";
    	let t3;
    	let span0_class_value;
    	let t4;
    	let span2;
    	let t5_value = String(/*$productDetail*/ ctx[2].price).split(".")[1] + "";
    	let t5;
    	let p1_class_value;
    	let t6;
    	let if_block = /*$productDetail*/ ctx[2].discount_price && create_if_block_3(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			p0.textContent = "Unit Price";
    			t1 = space();
    			p1 = element("p");
    			span1 = element("span");
    			t2 = text("₹");
    			span0 = element("span");
    			t3 = text(t3_value);
    			t4 = space();
    			span2 = element("span");
    			t5 = text(t5_value);
    			t6 = space();
    			if (if_block) if_block.c();
    			attr_dev(p0, "class", "text-grey-400 text-xs -mb-1");
    			add_location(p0, file$1, 87, 16, 3461);

    			attr_dev(span0, "class", span0_class_value = "font-bold " + (/*$productDetail*/ ctx[2].discount_price
    			? "text-accent-700"
    			: "text-grey-700"));

    			add_location(span0, file$1, 89, 52, 3702);
    			attr_dev(span1, "class", "align-top ");
    			add_location(span1, file$1, 89, 20, 3670);
    			attr_dev(span2, "class", "align-top -ml-1 text-sm");
    			add_location(span2, file$1, 91, 20, 3890);

    			attr_dev(p1, "class", p1_class_value = "inline-block " + (/*$productDetail*/ ctx[2].discount_price
    			? "text-accent-500 opacity-60 line-through"
    			: "text-grey-500"));

    			add_location(p1, file$1, 88, 16, 3531);
    			attr_dev(div, "class", "inline-block mr-4 align-bottom text-2xl");
    			add_location(div, file$1, 86, 12, 3391);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(div, t1);
    			append_dev(div, p1);
    			append_dev(p1, span1);
    			append_dev(span1, t2);
    			append_dev(span1, span0);
    			append_dev(span0, t3);
    			append_dev(p1, t4);
    			append_dev(p1, span2);
    			append_dev(span2, t5);
    			append_dev(div, t6);
    			if (if_block) if_block.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$productDetail*/ 4 && t3_value !== (t3_value = Math.trunc(/*$productDetail*/ ctx[2].price) + "")) set_data_dev(t3, t3_value);

    			if (dirty & /*$productDetail*/ 4 && span0_class_value !== (span0_class_value = "font-bold " + (/*$productDetail*/ ctx[2].discount_price
    			? "text-accent-700"
    			: "text-grey-700"))) {
    				attr_dev(span0, "class", span0_class_value);
    			}

    			if (dirty & /*$productDetail*/ 4 && t5_value !== (t5_value = String(/*$productDetail*/ ctx[2].price).split(".")[1] + "")) set_data_dev(t5, t5_value);

    			if (dirty & /*$productDetail*/ 4 && p1_class_value !== (p1_class_value = "inline-block " + (/*$productDetail*/ ctx[2].discount_price
    			? "text-accent-500 opacity-60 line-through"
    			: "text-grey-500"))) {
    				attr_dev(p1, "class", p1_class_value);
    			}

    			if (/*$productDetail*/ ctx[2].discount_price) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_3(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(86:12) {#if $userLocation === 'IN'}",
    		ctx
    	});

    	return block;
    }

    // (95:16) {#if $productDetail.discount_price}
    function create_if_block_3(ctx) {
    	let i;
    	let t0;
    	let span1;
    	let t1;
    	let span0;
    	let t2_value = Math.trunc(/*$productDetail*/ ctx[2].discount_price) + "";
    	let t2;
    	let t3;
    	let span2;
    	let t4_value = String(/*$productDetail*/ ctx[2].discount_price).split(".")[1] + "";
    	let t4;

    	const block = {
    		c: function create() {
    			i = element("i");
    			t0 = space();
    			span1 = element("span");
    			t1 = text("₹");
    			span0 = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			span2 = element("span");
    			t4 = text(t4_value);
    			attr_dev(i, "class", "text-primary-600 fas fa-caret-right");
    			add_location(i, file$1, 95, 20, 4090);
    			attr_dev(span0, "class", "font-bold text-grey-700");
    			add_location(span0, file$1, 96, 65, 4207);
    			attr_dev(span1, "class", "align-top text-grey-500");
    			add_location(span1, file$1, 96, 20, 4162);
    			attr_dev(span2, "class", "align-top -ml-1 text-sm text-grey-500");
    			add_location(span2, file$1, 97, 20, 4323);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span1, anchor);
    			append_dev(span1, t1);
    			append_dev(span1, span0);
    			append_dev(span0, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, span2, anchor);
    			append_dev(span2, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$productDetail*/ 4 && t2_value !== (t2_value = Math.trunc(/*$productDetail*/ ctx[2].discount_price) + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*$productDetail*/ 4 && t4_value !== (t4_value = String(/*$productDetail*/ ctx[2].discount_price).split(".")[1] + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(span2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(95:16) {#if $productDetail.discount_price}",
    		ctx
    	});

    	return block;
    }

    // (112:12) {#if error}
    function create_if_block_1(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*error*/ ctx[0]);
    			attr_dev(p, "class", "bg-accent-200 px-2 py-1 my-1 text-accent-800");
    			add_location(p, file$1, 112, 16, 5176);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*error*/ 1) set_data_dev(t, /*error*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(112:12) {#if error}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$isLoading*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
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
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
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
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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

    const getProductDetail = "hi";

    function instance$1($$self, $$props, $$invalidate) {
    	let $cartItems;
    	let $isLoading;
    	let $productDetail;
    	let $userLocation;
    	validate_store(cartItems, "cartItems");
    	component_subscribe($$self, cartItems, $$value => $$invalidate(6, $cartItems = $$value));
    	validate_store(isLoading, "isLoading");
    	component_subscribe($$self, isLoading, $$value => $$invalidate(1, $isLoading = $$value));
    	validate_store(productDetail, "productDetail");
    	component_subscribe($$self, productDetail, $$value => $$invalidate(2, $productDetail = $$value));
    	validate_store(userLocation, "userLocation");
    	component_subscribe($$self, userLocation, $$value => $$invalidate(3, $userLocation = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ProductPage", slots, []);
    	let { params } = $$props;
    	let error = null;

    	const addToCart = async data => {
    		let addQty = document.getElementById("addQty").value;
    		let item = {};
    		item.id = data.id;
    		item.moq = data.moq;
    		let n = addQty && addQty > data.moq ? addQty : data.moq;

    		// console.log('addQty', addQty, 'n', n, 'data.moq', data.moq);
    		if (!addQty || addQty < data.moq) {
    			$$invalidate(0, error = `Minimum order quantity is ${data.moq}`);

    			// console.log('error', error);
    			return;
    		} else {
    			$$invalidate(0, error = null);
    			let iId = await addItem(item, n);

    			for (let i = 0; i < $cartItems.length; i++) {
    				if ($cartItems[i].product.id === data.id) {
    					set_store_value(cartItems, $cartItems[i].quantity += n, $cartItems);
    					cartItems.set($cartItems);
    					return;
    				}
    			}

    			let temp = {};
    			temp.id = iId;
    			temp.product = {};
    			temp.product = data;
    			temp.quantity = n;
    			cartItems.update(items => [...items, temp]);
    		}
    	};

    	onMount(async () => {
    		isLoading.set(true);
    		let product = await axios.get(`/api/fullproduct/${params.id}`).then(res => res.data);
    		setProductDetails(product);
    	}); // console.log($productDetail.image_urls);

    	const writable_props = ["params"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ProductPage> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("params" in $$props) $$invalidate(5, params = $$props.params);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		link,
    		isLoading,
    		userLocation,
    		setProductDetails,
    		productDetail,
    		cartItems,
    		addItem,
    		Slider,
    		params,
    		error,
    		addToCart,
    		getProductDetail,
    		$cartItems,
    		$isLoading,
    		$productDetail,
    		$userLocation
    	});

    	$$self.$inject_state = $$props => {
    		if ("params" in $$props) $$invalidate(5, params = $$props.params);
    		if ("error" in $$props) $$invalidate(0, error = $$props.error);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [error, $isLoading, $productDetail, $userLocation, addToCart, params];
    }

    class ProductPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { params: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProductPage",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*params*/ ctx[5] === undefined && !("params" in props)) {
    			console.warn("<ProductPage> was created without expected prop 'params'");
    		}
    	}

    	get params() {
    		throw new Error("<ProductPage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<ProductPage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.37.0 */
    const file = "src/App.svelte";

    // (16:0) {#if $userLocation==='xx'}
    function create_if_block(ctx) {
    	let div1;
    	let div0;
    	let h1;
    	let t1;
    	let button0;
    	let svg0;
    	let path0;
    	let br0;
    	let t2;
    	let t3;
    	let button1;
    	let svg1;
    	let path1;
    	let br1;
    	let t4;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Please select a region";
    			t1 = space();
    			button0 = element("button");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			br0 = element("br");
    			t2 = text("\n\t\t\tOutside India");
    			t3 = space();
    			button1 = element("button");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			br1 = element("br");
    			t4 = text("\n\t\t\tWithin India");
    			attr_dev(h1, "class", "text-grey-500 text-xl mb-2");
    			add_location(h1, file, 18, 2, 687);
    			attr_dev(path0, "d", "M6.61.08A6.59 6.59 0 00.07 6.75a6.6 6.6 0 005.88 6.38 6.59 6.59 0 006.76-4.14A6.56 6.56 0 006.61.1zm.02.16c1.23 0 2.45.37 3.47 1.04-.65-.31-.5.37-.13.62.23.25.42.48.04.11-.07.28-.43 1.3-.8.6-.5-.5-.95.39-1.17.77-.52.76 1.03 1.02.69.12.22-.5.88.87.11.91-.43.25-1.08.39-1.18.96-.15.27-.48 1.32.15.84.2-.61 1.29-.3 1.3-.33-.16-.87.4.73.69.02.48-.32.8.84.09.75-.7.33-1.2-.46-1.84-.23-.66.3-1.18.93-1.39 1.62-.1.8.8 1.3 1.5 1.15.88.01.67 1.1.64 1.7-.17.82.83.85 1.1.21.56-.69.87-1.53 1.36-2.26.2-.75-1.17-.9-.83-1.72.38-.2.48 1.44 1.12.75.66-.41-.02-.9-.28-1.27.75-.35 1.45.65 1.26 1.15.18-.23.23-1.49.42-.65A6.35 6.35 0 011.7 10.68a6.35 6.35 0 01-.05-8.05C1.32 3.9.45 5.17.87 6.53c.07-.64.17.53.27.67.23.52.77.83 1.06 1.31.4.4.28 1.03.45 1.47.53.62 1 1.31 1.25 2.1.12.27 1.08.75.5.18.02-.77.93-1.22.9-2-.24-.5-.89-.6-1.24-1.04-.43-.35-.89-.72-1.45-.83-.7.17-.53-1.08-1.1-1.31-.34-.47.57-.37.86-.41.13-.75.95-1.06 1.38-1.65.11-.3.82-.34.49-.89-.23-.78-.99-.57-1.15.1-.4.15-.49-1.02.04-1.11.33-.04.89-.83.44-.81-.75.52-.97-.7-.47-1.09.48-.34 1.1-.46 1.64-.7C5.35.35 6 .25 6.64.25zm-1.36.79c-.46-.28-1.26 1.04-.46.54.22-.05 1.23-.45.46-.54zm.95.06C5.38 1 4.79 1.86 5.1 2.54c-.42.59.1 1.58.64.73.49-.41 1.03-1 .93-1.7-.06-.23-.25-.4-.46-.48zm-2.26.22c-.4-.02-.25.37 0 0zm-.16.17c-.63.11.27.35 0 0zm-.39.12c-.66.05-.02 1.08.06.27-.1-.05-.19-.2-.06-.27zm.81.4c-.39.29-.26 1.07-.14 1.34.4-.24.5-1.04.14-1.35zm2.2 1.2c-.07.57.83 0 .17 0H6.5zm1.1.9c-.42.38.6 1.14.22.37l-.22-.36zm-.1.4c-.56.16.3.58 0 0zm-3.97.4c-.05.22-.28-.05 0 0zM2.14 7.23c.14.57.73.12 0 0zm.63.42c-.19.49.54 0 0 0zm8.25 2.4c-.45.04-.6 1.2-.15.46.09-.14.16-.3.15-.46z");
    			attr_dev(path0, "fill", "#9999a0");
    			add_location(path0, file, 22, 4, 924);
    			attr_dev(svg0, "class", "inline-block h-8");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 13.23 13.23");
    			add_location(svg0, file, 21, 3, 828);
    			add_location(br0, file, 23, 11, 2587);
    			attr_dev(button0, "class", "btn-local btn-m");
    			add_location(button0, file, 20, 2, 757);
    			attr_dev(path1, "d", "M4.454 12.008c-.53-.357-.365-1.118-.739-1.594-.113-.478-.304-.924-.47-1.382-.173-.604-.26-1.25-.145-1.87-.024-.24-.053-.669-.166-.222-.385.452-1.122-.145-1.06-.56.234.077.467-.108.083-.153-.577-.113-.214-.725.249-.58.363.044.652-.091.339-.436-.4-.473.143-.757.55-.822.358-.428.944-.632 1.156-1.176.52-.335-.632-.465-.279-.986.16-.405-.407-.89.24-.98.5-.147.799.364 1.264.448.355.058.851.24.403.616-.402.199.022.656-.342.904.432.285.629.832.528 1.252.41.465 1.062.464 1.562.748.345.123 1.061.352.908-.223.34-.535.337.42.783.263.333.047.78-.113.639-.479.303-.126.593-.362.786-.516.414-.264 1.103.265.708.652-.426.249-.636.685-.647 1.165-.307.259-.433.604-.548.994-.17.042.142-.85-.18-.582-.196.366-.572-.288-.104-.323.416-.434-.413-.223-.606-.346-.072-.223-.503-.55-.633-.31.153.213.188.32-.02.511.165.29.502.837.304 1.14-.43-.031-.825.07-.907.555-.495.28-.855.698-1.308 1.019-.387.27-.927.427-1.128.865.193.51-.126 1.001-.165 1.51-.225.325-.596.842-1.055.898z");
    			attr_dev(path1, "fill", "#9999a0");
    			attr_dev(path1, "stroke-width", "1.857");
    			add_location(path1, file, 29, 4, 2793);
    			attr_dev(svg1, "class", "inline-block h-8");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 13.229 13.229");
    			add_location(svg1, file, 28, 3, 2695);
    			add_location(br1, file, 30, 9, 3809);
    			attr_dev(button1, "class", "btn-local btn-m");
    			add_location(button1, file, 27, 2, 2624);
    			attr_dev(div0, "class", "bg-white p-6 text-center shadow-md rounded");
    			add_location(div0, file, 17, 1, 628);
    			attr_dev(div1, "class", "flex justify-center items-center bg-primary-200 fixed bottom-0 h-fit w-full bg-opacity-70 z-40");
    			add_location(div1, file, 16, 0, 518);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    			append_dev(div0, t1);
    			append_dev(div0, button0);
    			append_dev(button0, svg0);
    			append_dev(svg0, path0);
    			append_dev(button0, br0);
    			append_dev(button0, t2);
    			append_dev(div0, t3);
    			append_dev(div0, button1);
    			append_dev(button1, svg1);
    			append_dev(svg1, path1);
    			append_dev(button1, br1);
    			append_dev(button1, t4);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[1], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(16:0) {#if $userLocation==='xx'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let t0;
    	let div;
    	let router;
    	let t1;
    	let cart;
    	let current;
    	let if_block = /*$userLocation*/ ctx[0] === "xx" && create_if_block(ctx);

    	router = new Router({
    			props: {
    				routes: {
    					"/": Shop,
    					"/product/:id": ProductPage,
    					"/checkout": Checkout
    				}
    			},
    			$$inline: true
    		});

    	cart = new Cart({ $$inline: true });

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			div = element("div");
    			create_component(router.$$.fragment);
    			t1 = space();
    			create_component(cart.$$.fragment);
    			attr_dev(div, "class", "relative min-h-fit bg-grey-100");
    			add_location(div, file, 37, 0, 3864);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(router, div, null);
    			append_dev(div, t1);
    			mount_component(cart, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$userLocation*/ ctx[0] === "xx") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(t0.parentNode, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			transition_in(cart.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			transition_out(cart.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			destroy_component(router);
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
    	let $userLocation;
    	validate_store(userLocation, "userLocation");
    	component_subscribe($$self, userLocation, $$value => $$invalidate(0, $userLocation = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	onMount(() => {
    		if ($userLocation === null) getLocation();
    	});

    	onMount(fetchCart);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => setLocation("oo");
    	const click_handler_1 = () => setLocation("IN");

    	$$self.$capture_state = () => ({
    		onMount,
    		Router,
    		getLocation,
    		fetchCart,
    		Cart,
    		Shop,
    		Checkout,
    		ProductPage,
    		userLocation,
    		setLocation,
    		$userLocation
    	});

    	return [$userLocation, click_handler, click_handler_1];
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
