let showAuthModal = false;

const hamburger = document.getElementById('hamburger')
const authModal = document.getElementById('auth-modal');
const authFormReel = document.getElementById('auth-form-reel');

const cartInput = document.getElementsByName('ls-cart')
const lsCheck = localStorage.getItem('sf-ct')
let lsCartItems = '[]'
if (lsCheck) {
    lsCartItems = JSON.stringify(JSON.parse(lsCheck).map(x => ({id: x.product.id, qty: x.quantity})))
}
for (let i = 0; i < cartInput.length; i++) {
    cartInput[i].value = lsCartItems;
}

function toggleAuthModal(isReg) {
    hamburger.checked=false;
    if(isReg === 'R') {
        authFormReel.classList.remove("-ml-80")
        showAuthModal
    } else if (isReg === 'L') {
        authFormReel.classList.add("-ml-80")
    }
    authModal.classList.toggle("invisible")
    showAuthModal = !showAuthModal;
}

let notification = document.getElementsByClassName('notification')
if (notification.length > 0) {
    for (let i = 0; i < notification.length; i++) {
        setTimeout(() => {
            notification[i].style.display = "none";
        }, 5000);
    }
}

// let regForm = document.getElementById("reg-form");
// let loginForm = document.getElementById("login-form");

// regForm.addEventListener("submit", (e) => {
//     e.preventDefault();
//     let errors = [];
    
//     let rEmail = document.getElementById("r-email").value;
//     let rPassword1 = document.getElementById("r-password1").value;
//     let rPassword2 = document.getElementById("r-password2").value;

//     if (rPassword1 !== rPassword2) {
//         errors.push('Passwords do not match!')
//     }
//     if (rPassword1.length < 8) {
//         errors.push('Password should be at least 8 characters long!')
//     }
//     console.log("errors", errors);
//     if (errors.length == 0) {
//         let formData = {
//             email: rEmail,
//             username: rEmail,
//             password: rPassword1
//         }
//         axios.post("/auth/users/", formData)
//             .then(response => console.log("response", response))
//             .catch(error => {
//                 if (error.response) {
//                     for (const property in error.response.data) {
//                         this.errors.push(`${property}: ${error.response.data[property]}`)
//                     }
//                 } else {
//                     this.errors.push("Something went wrong. Please try again.")
//                 }
//             })
            
//     }
    
// });

// loginForm.addEventListener("submit", async (e) => {
//     e.preventDefault();
//     console.log("start");
//     axios.defaults.headers.common["Authorization"] = "";
//     localStorage.removeItem("token");
//     console.log("remove token");

//     let lEmail = document.getElementById("l-email").value;
//     let lPassword = document.getElementById("l-password").value;
//     let errors = [];
//     console.log("errors.length", errors.length);
//     if (errors.length === 0) {
//         console.log("no errors");
//         let formData = {
//             username: lEmail,
//             password: lPassword
//         }
//         await axios.post("/auth/token/login/", formData)
//             .then(response => {
//                 const token = response.data.auth_token;
//                 axios.defaults.headers.common["Authorization"] = "Token " + token;
//                 localStorage.setItem("token", token);
//                 location.reload()
//             })
//             .catch(error => {
//                 if (error.response) {
//                     for (const property in error.response.data) {
//                         errors.push(`${error.response.data[property]}`)
//                         console.log(`${error.response.data[property]}`)
//                     }
//                 } else {
//                     errors.push("Something went wrong. Please try again.")
//                 }
//             })
//     }
// });