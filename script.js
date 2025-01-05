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
const yourProfilesLabel = document.querySelector('label[for="select"]');
const foldersDataList = document.querySelector(".folders-data-list");
const dataMessage = document.querySelector(".data-message");
const frontTextarea = document.querySelector(".front");
const backTextarea = document.querySelector(".back");
const createDataBtn = document.querySelector(".create-data-btn");

yourProfilesLabel.style.display = "none";
select.style.display = "none";
folderNameInput.style.display = "none";
addFolderBtn.style.display = "none";

let profilesAndData = [
  // {profileName: Alex, data: [ {folderName: 1, data: [1, 2, 3]}, {folderName: 2, data: [1, 2, 3]} ]},
  // {profileName: Alex, data: [ {folderName: 1, data: [1, 2, 3]}, {folderName: 2, data: [1, 2, 3]} ]},
];

let targetedFolder;
let folder;
let foldersArray = [];
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
  profile = name;
  
  const tr = db.transaction("profiles", "readwrite");
  const store = tr.objectStore("profiles");

  profilesAndData.unshift( {profileName: name, data: []} );
  store.add(profilesAndData[0]);

  console.log(`${profileNameInput.value} profile was created!`);
  console.log(db.objectStoreNames.length);

  showProfiles(db, name);
  profileAutoselect(profileNameInput.value);
  showFolders(db, name);

  profileNameInput.value = '';

}
createProfileBtn.addEventListener("click", function(db) {
  db = request.result;
  createProfile(db, profileNameInput.value);
});


function showProfiles(db, value) {
  const tr = db.transaction("profiles");
  const store = tr.objectStore("profiles");
  const search = store.count();

  search.onsuccess = function() {
    if (search.result >= 1) {
      console.log("There are profiles.");
      profileText.innerText = '';

      select.style.display = "inline-block";
      yourProfilesLabel.style.display = "inline-block";

      const tr2 = db.transaction("profiles");
      const store2 = tr2.objectStore("profiles");
      let result2 = store2.getAll();
      
      result2.onsuccess = function() {
        select.innerHTML = result2.result.map(profile => {
          if (profile instanceof Object) {
            return `<option id="${profile.profileName}" value="${profile.profileName}">${profile.profileName}</option>`;
          }  
        });
        select.value = value;
      }
    } else {
      profileText.innerText = "\n\nThere is no profile";
      console.log("There is no profile. Please create one.");
    }
  };
  search.onerror = function() {console.log("Error searching");};
}


function profileAutoselect(who) {
  profile = who;

  db = request.result;
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

  const tr = db.transaction("profiles", "readwrite");
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
      folderText.innerText = "\n\nYour folders\n\n";
    }
  };
  search.onerror = function() {console.log("error")};
}
select.addEventListener("change", function(e) {
  selectProfile(e);
  showFolders(db, profile);
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
  showFolders(db, profile);
  profileAutoselect(profile);
  folderNameInput.value = '';
});


function showFolders(db, value, e) {
  db = request.result;
  let tr = db.transaction("profiles");
  let store = tr.objectStore("profiles");

  let index = store.index("by_name");
  let search = index.get(value);

  search.onsuccess = function() {
    folders.innerHTML = search.result.data.map((folder) => {
      return `<button class="folderButtons">${folder.folderName}</button>`;
    }).join(" ");
    // checkForFolders();
  }
}

// function checkForFolders() {
//   if (folders.children.length > 0) {
//     console.log("TRUE");
//     return true;
//   } else {
//     console.log("FALSE");
//     return false;
//   }
// }

function openFolders(e, db, whose) {
  db = request.result;
  let tr = db.transaction("profiles");
  let store = tr.objectStore("profiles");
  let index = store.index("by_name");
  let search = index.get(whose);
  
  search.onsuccess = function() {
    foldersArray = search.result.data;

    if (e.target.tagName === "BUTTON") {
      targetedFolder = foldersArray.filter((folder) => {
        return folder.folderName === e.target.innerText;
      });

      folder = targetedFolder[0];

      if (folder.data > 0) {
        foldersDataList.innerHTML = folder.data.map((datas) => {
          return `<li>${datas}</li>`;
        });
      } else {
        console.error("TargetedFolder datas are empty");
        dataMessage.innerText = "\nNo data in this folder";
      }
      
      console.log("Your folder:", e.target.innerText, JSON.stringify(folder));
    }
  };
}
folders.addEventListener("click", function(e, db) {
  db = request.result;
  openFolders(e, db, profile);
});

function createData(db) {

}













  




  


