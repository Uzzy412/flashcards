const container = document.querySelector(".container");
const createProfileBtn = document.querySelector(".create-profile-btn");
const profileNameInput = document.querySelector(".profile-name");

let profile;
let db;
let request = indexedDB.open("flashcardsDatabase", 1);

request.onerror = function() {
  console.log("Error accessing database" + request.error);
};

request.onupgradeneeded = function() {
  db = request.result;
  const profileStore = db.createObjectStore("profiles", { autoIncrement: true });
  const nameIndex = profileStore.createIndex("by_name", "profileName", { unique: true });
  const dataIndex = profileStore.createIndex("by_data", "data", { unique: false });
};

request.onsuccess = function() {
  db = request.result;
  console.log("Database is open." + request.result);

  searchForProfileExistence(db);
}

function searchForProfileExistence(db) {
  const tr = db.transaction("profiles");
  // tr.oncomplete = function() {console.log("Transaction complete");};

  const store = tr.objectStore("profiles");
  const search = store.count();

  search.onsuccess = function() {
    let result = search.result;
    if (result === 1) {
      console.log("There is a profile.");
    } else if (result > 1) {
      console.log(`There are ${result} profiles`);
    } else {
      console.log("There is no profile. Please create one.");
    }
    if (result >= 1) {
      const select = document.createElement("select");
      container.append(select);

      const tr2 = db.transaction("profiles");
      const store2 = tr2.objectStore("profiles");
      let result2 = store2.getAll();
      
      result2.onsuccess = function() {
        select.innerHTML = result2.result.map(profile => {
          return `<option id="${profile.profileName}">${profile.profileName}</option>`;
        });
      }

      select.addEventListener("change", (e) => {
        db = request.result;
        if (e.target.tag = "option") {
          console.log("You chose: " + e.target.value + " profile");
        }
    
        const tr = db.transaction("profiles");
        const store = tr.objectStore("profiles");
    
        const index = store.index("by_name");
        const search = index.get(e.target.value);
    
        search.onsuccess = function() {
          console.log("Match!", search.result);
        };
    
        search.onerror = function() {console.log("error")};
        
      });

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

  profileNameInput.value = '';
}

createProfileBtn.addEventListener("click", function(db) {
  db = request.result;
  createProfile(db, profileNameInput.value);
  location.reload();
});
  


