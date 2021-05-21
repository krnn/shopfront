import { baseURL, isLoading, setFetchedProducts, setFetchedCart } from './stores.js';

// Get all products from database 
export const fetchProducts = async () => {
    isLoading.set(true)
    let products = await axios.get(`${baseURL}listproducts/`)
        .then(res => res.data);
    setFetchedProducts(products)
}

// Check cookies for cart, else check database
export const fetchCart = async () => {
    let userCart = []
    console.log("fetchCart, user:", user);
    if (user != "AnonymousUser") {
        userCart = await axios.get(`${baseURL}getcart/${userId}`)
            .then(res => res.data["items"]);
            console.log("fetchCart checking backend. Cart:", userCart);
        if (userCart.length <= 0)  {
            let lsCart = JSON.parse(localStorage.getItem('sf-ct'))
            console.log("fetchCart lsCart:", lsCart);
            if (lsCart.length && lsCart.length > 0) {
                lsCart = lsCart.map(x => ({id: x.id}))
                for (let i = 0; i < lsCart.length; i++) {
                    let iId = await addItem(lsCart[i].product, lsCart.quantity);
                    console.log("fetchCart adding to bckend:", lsCart[i]);
                    let temp = lsCart[i]
                    temp.id = iId
                    userCart.push(temp)
                }
            }
        }
        setFetchedCart(userCart)
    }
}

// Add product to cart
export const addItem = async (data, n = 1) => {
    if (user != "AnonymousUser")  {
        console.log("addItem", data);
        data.n = n
        data.userId = userId;
        console.log('addItem, querying backend:', data);
        let itemId = await axios.post(`${baseURL}additem/`, data)
            .then(res => res.data.iId);
        return itemId
    }
}

// Update cart quantity
export const updateItem = async (data) => {
    if (user === "AnonymousUser") {
        console.log('updateItem, Not Signed in');
    } else {
        let userCart = await axios.post(`${baseURL}updateitem/`, data)
            .then(res => res.data);
        console.log('updateItem, userCart:', userCart);
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