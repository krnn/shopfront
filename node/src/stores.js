import { writable, derived } from 'svelte/store';
import {persistCart} from './persistCart'


export const isLoading = writable(true);

export const userLocation = writable(null);

// Set userLocation
export const setLocation = (data) => {
    userLocation.set(data);
    document.cookie = `sf-l-c=${data}`
}

export const productsList = writable([]);

export const hasLoadedProducts = writable(false);

// Populate productsList store
export const setFetchedProducts = (data) => {
    productsList.set(data);
	isLoading.set(false);
    hasLoadedProducts.set(true);
}

// Properties to filter by
export const nameF = writable('')

// Derived store with filtered list of products
export const filteredProducts = derived(
    [productsList, nameF],
    ([$productlist, $nameF]) => $productlist.filter(p => p.name.toLowerCase().includes($nameF))
)

// Cart items
export const cartItems = persistCart();

// Populate cart if exists in database
export const setFetchedCart = (data) => {
    cartItems.set(data)
}

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


export const productDetail = writable({})

// Populate productDetail store
export const setProductDetails = (data) => {
    productDetail.set(data)
	isLoading.set(false)
}
