import { writable, derived } from 'svelte/store';

export const baseURL = 'http://localhost:8000/api/';

export const isLoading = writable(false)

export const productsList = writable([]);

// Properties to filter by
export const nameF = writable('')

// Derived store with filtered list of products
export const filteredProducts = derived(
    [productsList, nameF],
    ([$productlist, $nameF]) => $productlist.filter(p => p.name.toLowerCase().includes($nameF))
)

// Populate productsList store
export const setFetchedProducts = (data) => {
    productsList.set(data)
	isLoading.set(false)
}

// Cart items
export const cartItems = writable([]);

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