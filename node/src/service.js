import { baseURL, isLoading } from './stores.js';
import { setFetchedProducts } from './stores.js';

export const fetchProducts = async () => {
    isLoading.set(true)
    let products = await axios.get(`${baseURL}listproducts/`)
        .then(res => res.data);
    setFetchedProducts(products)
}