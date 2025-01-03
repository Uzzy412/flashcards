const container = document.querySelector(".container");
const createProfileBtn = document.querySelector(".create-profile-btn");
const profileNameInput = document.querySelector(".profile-name");
const select = document.querySelector("select");
const folderNameInput = document.getElementById("add-folder-text");
const addFolderBtn = document.querySelector(".add-folder-btn");
const folderText = document.querySelector(".folder-text");
const profileText = document.querySelector(".profile-text");
const showBtn = document.getElementById("show");
const folders = document.querySelector(".folders");


select.style.display = "none";
folderNameInput.style.display = "none";
addFolderBtn.style.display = "none";

let profilesAndData = [
  // {profileName: Alex, data: [ {folderName: 1, data: [1, 2, 3]}, {folderName: 2, data: [1, 2, 3]} ]},
  // {profileName: Alex, data: [ {folderName: 1, data: [1, 2, 3]}, {folderName: 2, data: [1, 2, 3]} ]},
];

let profile;
let db;
let request = indexedDB.open("flashcardsDatabase", 1);

request.onerror = function() {
  console.log("Error accessing database" + request.error);
};

request.onupgradeneeded = function() {
  db = request.result;
  const profileStore = db.createObjectStore("profiles", { autoIncrement: true });
  const nameIndex = profileStore.createIndex("by_name", "profileName", { unique: false });
  const dataIndex = profileStore.createIndex("by_data", "data", { unique: false });
};

request.onsuccess = function() {
  db = request.result;
  console.log("Database is open.");
  showProfiles(db);
}


function createProfile(db, name) {
  const tr = db.transaction("profiles", "readwrite");
  const store = tr.objectStore("profiles");

  profilesAndData.unshift( {profileName: name, data: []} );
  store.add(profilesAndData[0]);

  console.log(`${profileNameInput.value} profile was created!`);
  console.log(db.objectStoreNames.length);

  profileNameInput.value = '';
}
createProfileBtn.addEventListener("click", function(db) {
  db = request.result;
  createProfile(db, profileNameInput.value);
  showProfiles(db);
});


function showProfiles(db) {
  const tr = db.transaction("profiles");
  const store = tr.objectStore("profiles");
  const search = store.count();

  search.onsuccess = function() {
    if (search.result >= 1) {
      console.log("There are profiles.");
      profileText.innerText = '';

      select.style.display = "inline-block";

      const tr2 = db.transaction("profiles");
      const store2 = tr2.objectStore("profiles");
      let result2 = store2.getAll();
      
      result2.onsuccess = function() {
        select.innerHTML = result2.result.map(profile => {
          return `<option id="${profile.profileName}">${profile.profileName}</option>`;
        });
        profileAutoselect();
        showFolders(db);
      }
    } else {
      profileText.innerText = "\n\nThere is no profile";
      console.log("There is no profile. Please create one.");
    }
  };
  search.onerror = function() {console.log("Error searching");};
}


function profileAutoselect() {
  profile = select.value;

  db = request.result;
  const tr = db.transaction("profiles");
  const store = tr.objectStore("profiles");
  const index = store.index("by_name");
  const search = index.get(profile);

  search.onsuccess = function() {
    if (search.result.data.length === 0) {
      console.log("This profile doesn't have any data saved.");
      folderNameInput.style.display = "inline-block";
      addFolderBtn.style.display = "inline-block";
      folderText.innerText = "\n\nYou don't have a folder. Please create one before adding any data.";
    } else {
      console.log("There is data.");
      folderNameInput.style.display = "inline-block";
      addFolderBtn.style.display = "inline-block";
      folderText.innerText = "\n\nYour folders\n\n";
    }
  };
  search.onerror = function() {console.log("error")};
}



function selectProfile(e) {
  db = request.result;

  if (e.target.tag = "option") {
    profile = e.target.value;
    console.log(profile);
  }

  const tr = db.transaction("profiles");
  const store = tr.objectStore("profiles");
  const index = store.index("by_name");
  const search = index.get(profile);

  search.onsuccess = function() {
    console.log(search.result);
    if (search.result.data.length === 0) {
      console.log("This profile doesn't have any data saved.");
      folderNameInput.style.display = "inline-block";
      addFolderBtn.style.display = "inline-block";
      folderText.innerText = "\n\nYou don't have a folder. Please create one before adding any data.";
    } else {
      console.log("There is data.");
      folderNameInput.style.display = "inline-block";
      addFolderBtn.style.display = "inline-block";
      folderText.innerText = "\n\nYour folders";
    }
  };
  search.onerror = function() {console.log("error")};
}
select.addEventListener("change", function(e) {
  selectProfile(e);
  showFolders(db);
});


function addFolder(db, name) {
  db = request.result;
  let tr = db.transaction("profiles", "readwrite");
  let store = tr.objectStore("profiles");

  let index = store.index("by_name");
  let search = index.get(profile);

  search.onsuccess = function() {
    const profilesCopy = [...profilesAndData];
    profilesAndData = search.result;

    profilesAndData.data.push({ folderName: name, data: [] });
    
    const indexDelete = store.index("by_name");
    const deletion = indexDelete.getKey(profile);
    
    deletion.onsuccess = function() {
      let id = deletion.result;
      const deleteRequest = store.delete(id);
    }
    
    const storeFolder = store.add(profilesAndData);
    storeFolder.onsuccess = () => console.log(`${name} folder was added to profile`);
    storeFolder.onerror = () => console.log(storeFolder.error);
    profilesAndData = [...profilesCopy];
  };
}
addFolderBtn.addEventListener("click", function(db) {
  db = request.result;
  addFolder(db, folderNameInput.value);
  showFolders(db);
  folderNameInput.value = '';
});


function showFolders(db) {
  db = request.result;
  let tr = db.transaction("profiles");
  let store = tr.objectStore("profiles");

  let index = store.index("by_name");
  let search = index.get(profile);

  search.onsuccess = function() {
    folders.innerHTML = search.result.data.map((folder) => {
      return `<button class="folderButtons">${folder.folderName}</button>`;
    }).join(" ");
  }
}

  


