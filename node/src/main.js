import App from './App.svelte';

const app = new App({
	target: document.getElementById("shop"),
	props: {
		baseURL: 'http://localhost:8000/api/'
	}
});

export default app;