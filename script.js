const createProfileBtn = document.querySelector(".create-profile-btn");
const profileNameInput = document.querySelector(".profile-name");

let db;
let request = indexedDB.open("flashcardsDatabase", 1);

request.onerror = function() {
  console.log("Error accessing database" + request.error);
};

request.onupgradeneeded = function() {
  db = request.result;
  if (!db.objectStoreNames.contains("profiles")) {
    const profileStore = db.createObjectStore("profiles", { autoIncrement: true });  
  }
};

request.onsuccess = function() {
  db = request.result;
  console.log("Database is open." + request.result);

  searchForProfileExistence(db);
}

function searchForProfileExistence(db) {
  const tr = db.transaction("profiles");
  tr.oncomplete = function() {console.log("Transaction complete");};

  const store = tr.objectStore("profiles");
  const search = store.count();

  search.onsuccess = function() {
    let result = search.result;
    if (result === 1) {
      console.log("There is a profile.", result);
    } else if (result > 1) {
      console.log("There are more profiles", result);
    } else {
      console.log("There is no profile. Please create one.");
    }  
  };

  search.onerror = function() {
    console.log("Error searching");
  };
}

function createProfile(db, name) {
  const tr = db.transaction("profiles", "readwrite");
  const store = tr.objectStore("profiles");
  store.add({ profileName: name, data: [] });

  console.log(`${profileNameInput.value} profile was created!`);
  console.log(db.objectStoreNames.length);
}

createProfileBtn.addEventListener("click", function(db) {
  db = request.result;
  createProfile(db, profileNameInput.value);
});

// console.log("No profile");
// alert("You don't have a profile. Please create one.");

