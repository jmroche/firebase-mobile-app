import { initializeApp  } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, set, child, get,  onValue, push, update, remove } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";



const dbSettings = {
    databaseURL: ""
}

const addItemsButton = document.getElementById("add-item-button");
const itemsInput = document.getElementById("item-input");


document.addEventListener("DOMContentLoaded", () => {
    clearULList();
})


// **************************** Firebase DB Setup ****************************
// initialize app
const app = initializeApp(dbSettings)

// get the DB
const db = getDatabase(app);

// Create reference point (i.e., DB document)
const shoppingListInDB = ref(db, "shoppingList");
// **************************** Firebase DB Setup ****************************

addItemsButton.addEventListener("click", () => {
    let itemsInputValue = itemsInput.value;

    console.log(itemsInputValue);
    push(shoppingListInDB, itemsInputValue);
    console.log(`${itemsInputValue} added to database`);

    // appendToShoppingList(itemsInputValue)
    clearInputFieldItems();
    

});

onValue(shoppingListInDB, (snapshot) => {
    // console.log(`Items in DB: ${snapshot.val()}`);
    clearULList();
    // if (snapshot.val() != null && snapshot.val() != undefined && Object.keys(snapshot.val()).length > 0) {
        if (snapshot.exists()){
        for (const [key, value] of Object.entries(snapshot.val())) {
            // console.log(`${key}: ${value}`);
            appendToShoppingList(key, value);
        }
    }
    else{
        console.log("No items in DB");
    
    }
    
    // console.log(`${key}: ${value}`);
    // console.log(typeof snapshot.val());
 
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
        let itemLocationinDB = ref(db, `shoppingList/${event.target.id}`);
        remove(itemLocationinDB); // Remove from Firebase DB
    
    })

}

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