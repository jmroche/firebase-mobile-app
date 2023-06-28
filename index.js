import { initializeApp  } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, set, child, get,  onValue, push, update, remove } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
//Update the below URL with the appropriate version if necessary.
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";



const dbSettings = {
    databaseURL: "https://playground-1d441-default-rtdb.firebaseio.com/"
}

const firebaseConfig = {
    apiKey: "AIzaSyAFpAdyJcZxTwjmC8W4t0W1KvFuUXtDKHw",
    authDomain: "playground-1d441.firebaseapp.com",
    databaseURL: "https://playground-1d441-default-rtdb.firebaseio.com",
    projectId: "playground-1d441",
    storageBucket: "playground-1d441.appspot.com",
    messagingSenderId: "970289978499",
    appId: "1:970289978499:web:ea69513a42c9d53421cfb6"
  };

const addItemsButton = document.getElementById("add-item-button");
const itemsInput = document.getElementById("item-input");


document.addEventListener("DOMContentLoaded", () => {
    checkAuthState();
    clearULList();
})


// **************************** Firebase DB Setup ****************************
// initialize app
const app = initializeApp(firebaseConfig);

// initialize the Auth
const auth = getAuth(app);

// get the DB
const db = getDatabase(app);

// Create reference point (i.e., DB document)
const shoppingListInDB = ref(db, "shoppingList");

// Create a reference point for the user
const userRef = ref(db, "users");
// **************************** Firebase DB Setup ****************************


// **************************** Setup User Authentication  ****************************
const userEmail = document.getElementById("user-email");
const userPassword = document.getElementById("user-password");
const authForm = document.getElementById("auth-form");
const loginButton = document.getElementById("login-button");
const signupButton = document.getElementById("signup-button");
const signOutButton = document.getElementById("signout-button");
const mainApp = document.getElementById("main-app");
const label = document.getElementById("alert-label");

const userSignUp = async() => {
    const signUpEmail = userEmail.value;
    const signUpPassword = userPassword.value;
    createUserWithEmailAndPassword(auth, signUpEmail, signUpPassword)
    .then((userCredential) => {
        const user = userCredential.user;
        console.log(user);
        label.style.color = "green";
        label.innerText = "Account created successfully!"
            setTimeout(() => {
                label.innerHTML = "";
            }, 3000);
            loginButton.style.display = "none";
        loginButton.disabled = false;
        location.href = location.href;
        set(ref(db, 'users/' + user.uid), {
            email: user.email
          });
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode + errorMessage)
    })
}

const userLogIn = async() => {
    const signInEmail = userEmail.value;
    const signInPassword = userPassword.value;
    signInWithEmailAndPassword(auth, signInEmail, signInPassword)
    .then((userCredential) => {
        const user = userCredential.user;
        setTimeout(() => {
            checkAuthState();
        }, 3000);
        
        location.href = location.href;
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(`Error Code: ${errorCode}, Error Message: ${errorMessage}`)
        
        if (errorCode == "auth/user-not-found") {
            loginButton.disabled = true;
            loginButton.style.backgroundColor = "gray";
            label.innerText = "User not found. Please sign up"
            setTimeout(() => {
                label.innerHTML = "";
            }, 3000);
            loginButton.style.display = "none";

        }

        if (errorCode == "auth/wrong-password"){
            label.innerText = "Wrong password!"
            setTimeout(() => {
                label.innerHTML = "";
            }, 3000);

        }
        
    })
}

const checkAuthState = async() => {
    onAuthStateChanged(auth, user => {
        if(user) {
            authForm.style.display = "none";
            mainApp.style.display = "flex";
  
        }
        else {
            authForm.style.display = "flex";
            mainApp.style.display = "none";
            
        }   
    })
}


const userSignOut = async() => {
    await signOut(auth);
    location.href = location.href;
}

checkAuthState();

signupButton.addEventListener('click', userSignUp);
loginButton.addEventListener('click', userLogIn);
signOutButton.addEventListener('click', userSignOut);
// **************************** Setup User Authentication  ****************************


addItemsButton.addEventListener("click", () => {
    let itemsInputValue = itemsInput.value;

    console.log(itemsInputValue);
    // push(shoppingListInDB, itemsInputValue);
    push(ref(db, `users/${auth.currentUser.uid}/shoppingList`), itemsInputValue);
    console.log(`${itemsInputValue} added to database`);

    clearInputFieldItems();
    

});



let getCurrentUSer = async() => {
onAuthStateChanged(auth, user => {
    if (user) {
        console.log(user.uid);
        let itemUserList = ref(db, `users/${user.uid}/shoppingList`);
        onValue(itemUserList, (snapshot) => {
            console.log(`Items in DB: ${snapshot.val()}`);
            clearULList();
            // if (snapshot.val() != null && snapshot.val() != undefined && Object.keys(snapshot.val()).length > 0) {
                if (snapshot.exists()){
                for (const [key, value] of Object.entries(snapshot.val())) {
                    appendToShoppingList(key, value);
                }
            }
            else{
                console.log("No items in DB");
                let itemsUL = document.getElementById("shopping-list");
                itemsUL.innerHTML = "No items here...yet"
            }
        });

        function appendToShoppingList(itemId, itemValue) {
            let itemsUL = document.getElementById("shopping-list");
            // itemsUL.innerHTML += `<li>${item}</li>`
            let newElement = document.createElement("li");
            newElement.innerText = itemValue;
            newElement.setAttribute("id", itemId)
            itemsUL.appendChild(newElement);
            newElement.addEventListener("click", (event) => {
                console.log(event.target.id);
                let itemLocationinDB = ref(db, `users/${user.uid}/shoppingList/${event.target.id}`);
                remove(itemLocationinDB); // Remove from Firebase DB
            
            })
        
        }

    } else {
      console.log("No user??");
    }
  });

}

getCurrentUSer();



function clearInputFieldItems(){
    itemsInput.value = "";
}


function clearULList(){
    let itemsUL = document.getElementById("shopping-list");
    itemsUL.innerHTML = "";
}


function deleteItemfromDB(itemId){
    remove(shoppingListInDB, itemId)
}