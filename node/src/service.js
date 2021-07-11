import {  isLoading, setFetchedProducts, setFetchedCart, setLocation } from './stores.js';

// Query 3rd party server for IP location
export const getLocation = async () => {
    let index = document.cookie.search('sf-l-c=')
    if (index > -1) {
        setLocation(document.cookie.slice(index+7,index+9));
        } else {
        try {
            let data = await axios.get('https://ipinfo.io/json?token=31d38724631f1c')
                .then(res => res.data.country)
            setLocation(data)
        } catch (_) {
            setLocation('xx');
        }
    }
}

// Get all products from database 
export const fetchProducts = async () => {
    isLoading.set(true)
    let products = await axios.get('/api/listproducts/')
        .then(res => res.data);
    setFetchedProducts(products)
}

// Check cookies for cart, else check database
export const fetchCart = async () => {
    let userCart = []
    if (user != "AnonymousUser") {
        userCart = await axios.get(`/api/getcart/${userId}`)
            .then(res => res.data["items"]);
        if (userCart.length <= 0)  {
            let lsCart = JSON.parse(localStorage.getItem('sf-ct'))
            if (lsCart.length && lsCart.length > 0) {
                lsCart = lsCart.map(x => ({id: x.id}))
                for (let i = 0; i < lsCart.length; i++) {
                    let iId = await addItem(lsCart[i].product, lsCart.quantity);
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
        data.n = n
        data.userId = userId;
        let itemId = await axios.post('/api/additem/', data)
            .then(res => res.data.iId);
        return itemId
    }
}


// Update cart quantity
export const updateItem = async (data) => {
    if (user === "AnonymousUser") {
    } else {
        let userCart = await axios.post('/api/updateitem/', data)
            .then(res => res.data);
    }
}

export const removeItem = async (data) => {
    if (user != "AnonymousUser") {
        let item = await axios.post('/api/removeitem/', data)
            // .then(res => console.log("from addItem in service.js", res.data));
    }
}