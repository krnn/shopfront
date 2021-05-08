import { baseURL, isLoading, setFetchedProducts, setFetchedCart } from './stores.js';

export const fetchProducts = async () => {
    isLoading.set(true)
    let products = await axios.get(`${baseURL}listproducts/`)
        .then(res => res.data);
    setFetchedProducts(products)
}

export const fetchCart = async () => {
    if (user != "AnonymousUser") {
        let userCart = await axios.get(`${baseURL}getcart/${userId}`)
            .then(res => res.data["items"]);
        setFetchedCart(userCart)
    }
}

export const addItem = async (data) => {
    if (user === "AnonymousUser") {
        console.log('Not Signed in');
    } else {
        data.userId = userId;
        let itemId = await axios.post(`${baseURL}additem/`, data)
            .then(res => res.data.iId);
        return itemId
    }
}

export const updateItem = async (data) => {
    if (user === "AnonymousUser") {
        console.log('Not Signed in');
    } else {
        let userCart = await axios.post(`${baseURL}updateitem/`, data)
            // .then(res => console.log(res.data));
    }
}

export const removeItem = async (data) => {
    if (user === "AnonymousUser") {
        console.log('Not Signed in');
    } else {
        let item = await axios.post(`${baseURL}removeitem/`, data)
            // .then(res => console.log("from addItem in service.js", res.data));
    }
}