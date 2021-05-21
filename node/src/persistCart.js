import { writable } from 'svelte/store'

export const persistCart = () => {
  const persist = localStorage.getItem('sf-ct')
  const data = persist ? JSON.parse(persist) : []
  //if sub is broken, sets value to current local storage value
  const lsCart = writable(data, () => {
    const unsubscribe = lsCart.subscribe(value => {
      localStorage.setItem('sf-ct', JSON.stringify(value))
    })
    return unsubscribe
  })
  return lsCart
} 