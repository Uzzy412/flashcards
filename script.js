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
const showDataBtn = document.querySelector(".show-data-btn");
const openedFolder = document.querySelector(".opened-folder");
const rightSection = document.querySelector(".right-section");
const learnText = document.querySelector(".learn-text");
const toLearnWrapper = document.querySelector(".to-learn-wrapper");



// ---------------- MODAL CODE --------------------- //

const modal = document.createElement("div");
const modalContent = document.createElement("div");
const closeModalButton = document.createElement("span");
const spanFrontData = document.createElement("span");
const spanBackData = document.createElement("span");
const nextBtn = document.createElement("button");
const backBtn = document.createElement("button");
const showAnswerBtn = document.createElement("button");
const flashcardsLength = document.createElement("span");

nextBtn.textContent = "Next";
backBtn.textContent = "Back";
showAnswerBtn.textContent = "Show answer";

nextBtn.classList.add("next-btn");
backBtn.classList.add("back-btn");
showAnswerBtn.classList.add("show-answer-btn");
flashcardsLength.classList.add("flashcards-length");
      
closeModalButton.innerHTML = "&times;";
closeModalButton.classList.add("close-modal");
modal.classList.add("modal");
modalContent.classList.add("modal-content");
spanFrontData.classList.add("span-front-data");
spanBackData.classList.add("span-back-data");
      
document.body.append(modal);
modal.append(modalContent);
modalContent.append(closeModalButton);
modalContent.append(spanFrontData);
modalContent.append(spanBackData);
modalContent.append(nextBtn);
modalContent.append(backBtn);
modalContent.append(showAnswerBtn);
modalContent.append(flashcardsLength);

modal.style.display = "none";


// ---------------- MODAL CODE --------------------- //



yourProfilesLabel.style.display = "none";
select.style.display = "none";
folderNameInput.style.display = "none";
addFolderBtn.style.display = "none";
frontTextarea.style.display = "none";
backTextarea.style.display = "none";
createDataBtn.style.display = "none";
showDataBtn.style.display = "none";

let profilesAndData = [

  // { profileName: Alex,
  //   data: [ 
  //     { folderName: 1, data: [{front: "text", back: "text"}, {}, {}] }, 
  //     { folderName: 2, data: [1, 2, 3] },
  //   ]
  // },

];

let currentIndex = 0;
let currentFolder;
let targetedFolder;
let folder;
let foldersArray = [];
let foldersArrayCopy = [...foldersArray];
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

  foldersDataList.innerHTML = '';
  frontTextarea.style.display = "none";
  backTextarea.style.display = "none";
  showDataBtn.style.display = "none";
  createDataBtn.style.display = "none";
  foldersDataList.style.display = "none";
  openedFolder.style.display = "none";

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
      folderText.innerText = "Your folders\n\n";
    }
  };
  search.onerror = function() {console.log("error")};
  studyMenu(db, foldersArray);
}



function selectProfile(e) {
  db = request.result;
  const tr = db.transaction("profiles", "readwrite");
  const store = tr.objectStore("profiles");
  const index = store.index("by_name");
  if (e.target.tag = "option") {
    profile = e.target.value;
    console.log(profile);
  }
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
      folderText.innerText = "Your folders\n\n";
    }
  };
  search.onerror = function() {console.log("error")};

  foldersDataList.innerHTML = '';
  frontTextarea.style.display = "none";
  backTextarea.style.display = "none";
  showDataBtn.style.display = "none";
  createDataBtn.style.display = "none";
  foldersDataList.style.display = "none";
  dataMessage.innerText = '';
  openedFolder.innerText = '';

}
select.addEventListener("change", function(e) {
  selectProfile(e);
  showFolders(db, profile);
  studyMenu(db, foldersArray);
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
    profilesAndData.data.push({ folderName: `${name} copy`, data: [] });
    
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
  studyMenu(db, foldersArray);
  folderNameInput.value = '';
});



function showFolders(db, value) {
  db = request.result;
  let tr = db.transaction("profiles");
  let store = tr.objectStore("profiles");
  let index = store.index("by_name");
  let search = index.get(value);

  search.onsuccess = function() {
    folders.innerHTML = search.result.data.map((folder) => {
      if (folder.folderName.match(/copy/)) {
        return;
      } else {
        return `<button class="folder-buttons">${folder.folderName}</button>`;
      }
    }).join(" ");
  }
}



function openFolders(e, db, whose) {
  db = request.result;
  let tr = db.transaction("profiles");
  let store = tr.objectStore("profiles");
  let index = store.index("by_name");
  let search = index.get(whose);

  search.onsuccess = function() {
    foldersArray = search.result;

    if (e.target.tagName === "BUTTON") {
      currentFolder = e.target.innerText;
      const index = foldersArray.data.map(i => i.folderName).indexOf(currentFolder);
      console.log(currentFolder);
      openedFolder.innerText = currentFolder;
      openedFolder.style.display = "block";

      if (search.result.data[index].data.length <= 0) {
        dataMessage.innerText = "\nNo data in this folder";
        foldersDataList.style.display = "none";
        showDataBtn.style.display = "none";
      } else {
        dataMessage.innerText = "";
        showDataBtn.style.display = "block";
      }

      console.log("Your folder:", e.target.innerText, search.result.data[index]);
      frontTextarea.style.display = "block";
      backTextarea.style.display = "block";
      createDataBtn.style.display = "block";
    } else {
      return;
    }
  };
}
folders.addEventListener("click", function(e, db) {
  db = request.result;
  openFolders(e, db, profile);
  foldersDataList.style.display = "none";
});



function showData(db, whose) {
  db = request.result;
  let tr = db.transaction("profiles");
  let store = tr.objectStore("profiles");
  let index = store.index("by_name");
  let search = index.get(whose);
  
  search.onsuccess = function() {
    foldersArray = search.result;
    const index = foldersArray.data.map(i => i.folderName).indexOf(currentFolder);
  
    if (search.result.data[index].data.length > 0) {
      foldersDataList.innerHTML = search.result.data[index].data.map((datas) => {
        return `<div id="data-div"><span class="data-span">${datas.front}</span><span class="data-span">${datas.back}</span></div>`;
      }).join("");
    } else {
      foldersDataList.innerHTML = '';
      dataMessage.innerText = "\nNo data in this folder";
    }
  }    
}
showDataBtn.addEventListener("click", function(db) {
  db = request.result;
  showData(db, profile);
});
showDataBtn.addEventListener("click", () => {
  if (foldersDataList.style.display === "block") {
    foldersDataList.style.display = "none";
  } else {
    foldersDataList.style.display = "block";
  }
});



function createData(db, front, back) {
  db = request.result;
  let tr = db.transaction("profiles", "readwrite");
  let store = tr.objectStore("profiles");
  let index = store.index("by_name");
  let search = index.get(profile);

  search.onsuccess = function() {
    foldersArray = search.result;
    const index = foldersArray.data.map(i => i.folderName).indexOf(currentFolder);
    const index2 = foldersArray.data.map(i => i.folderName).indexOf(`${currentFolder} copy`);
    foldersArray.data[index].data.push({front: front, back: back});
    foldersArray.data[index2].data.push({front: front, back: back});

    const indexDelete = store.index("by_name");
    const deletion = indexDelete.getKey(profile);
    deletion.onsuccess = function() {
      let id = deletion.result;
      const deleteRequest = store.delete(id);
    }

    const create = store.add(foldersArray);
    create.onsuccess = () => console.log("New data on folder", currentFolder, "on profile", profile);
    create.onerror = () => console.log("Error");
  }
}
createDataBtn.addEventListener("click", function(db) {
  createData(db, frontTextarea.value, backTextarea.value);
  showDataBtn.style.display = "block";
  update(db);
  studyMenu(db);
  frontTextarea.value = '';
  backTextarea.value = '';
  dataMessage.innerText = '';
});


function update(db) {
  db = request.result;
  let tr = db.transaction("profiles");
  let store = tr.objectStore("profiles");
  let index = store.index("by_name");
  let search = index.get(profile);
  
  search.onsuccess = function() {
    foldersArray = search.result;
    const index = foldersArray.data.map(i => i.folderName).indexOf(currentFolder);
    foldersDataList.innerHTML = foldersArray.data[index].data.map((datas) => {
      return `<div><span class="data-span">${datas.front}</span><span class="data-span">${datas.back}</span></div>`;
    }).join("");
  };
}


// --------------------- STUDY FEATURES ------------------------ //
function studyMenu(db) {
  db = request.result;
  let tr = db.transaction("profiles", "readwrite");
  let store = tr.objectStore("profiles");
  let index = store.index("by_name");
  let search = index.get(profile);

  search.onsuccess = function() {
    foldersArrayCopy = search.result;

    toLearnWrapper.innerHTML = foldersArrayCopy.data.map((folder) => {
      if (folder.data.length <= 0 && folder.folderName.match(/copy/)) {
        const arr = [...folder.folderName];
        arr.splice(-5, 5);
        const joined = arr.join("");
        return `<div><span>${joined}</span>
              <span class="f-length ${joined}">${folder.data.length}</span>
              <button id="${joined}" class="learn-btn" disabled="true">Practice</button></div>`;
      }

      if (folder.folderName.match(/copy/)) {
        const arr = [...folder.folderName];
        arr.splice(-5, 5);
        const joined = arr.join("");
        return `<div><span>${joined}</span>
              <span class="f-length ${joined}">${folder.data.length}</span>
              <button id="${joined}" class="learn-btn">Practice</button></div>`;
      } else {
        return;
      }
    }).join("");
  }  
}


function study(e, db, profile) {
  currentIndex = 0;
  db = request.result;
  let tr = db.transaction("profiles", "readwrite");
  let store = tr.objectStore("profiles");
  let index = store.index("by_name");
  let search = index.get(profile);

  search.onsuccess = function() {
    foldersArray = search.result;
    foldersArrayCopy = search.result;

    if (e.target.tagName = "BUTTON") {
      modal.style.display = "block";
      backBtn.disabled = true;
      nextBtn.disabled = true;
      spanBackData.innerText = '';
      currentFolder = e.target.id;

      const index = foldersArrayCopy.data.map(folder => folder.folderName).indexOf(`${currentFolder} copy`);
      const currentData = foldersArrayCopy.data[index].data;
      spanFrontData.innerText = currentData[0].front;
    }
  }
}
toLearnWrapper.addEventListener("click", function(e, db) {
  study(e, db, profile);
});

// show answer...
showAnswerBtn.addEventListener("click", function(db) {
  showFlashcardAnswer(db);
});
function showFlashcardAnswer(db) {
  db = request.result;
  let tr = db.transaction("profiles", "readwrite");
  let store = tr.objectStore("profiles");
  let index = store.index("by_name");
  let search = index.get(profile);

  search.onsuccess = function() {
    foldersArray = search.result;
    foldersArrayCopy = search.result;

    const i = foldersArray.data.map(folder => folder.folderName).indexOf(currentFolder);
    const index = foldersArrayCopy.data.map(folder => folder.folderName).indexOf(`${currentFolder} copy`);
    const currentData = foldersArrayCopy.data[index].data;

    showAnswerBtn.disabled = true;
    if (foldersArrayCopy.data[index].data.length === 0) {
      spanBackData.innerText = foldersArray.data[i].data[foldersArray.data[i].data.length - 1].back;
    } else {
      spanBackData.innerText = currentData[0].back;
      nextBtn.disabled = false;
    }

    // flashcard deletion from session...
    foldersArrayCopy.data[index].data.splice(0, 1);
    let tr = db.transaction("profiles", "readwrite");
    let store = tr.objectStore("profiles");
    let indexDelete = store.index("by_name");
    const deletion = indexDelete.getKey(profile);
    deletion.onsuccess = function() {
      store.delete(deletion.result);
    }
    const addition = store.add(foldersArrayCopy);
    addition.onsuccess = function() {
    }
    studyMenu(db);

    if (foldersArrayCopy.data[index].data.length === 0) {
      nextBtn.disabled = true;
    }
  }
}

// next answer...
nextBtn.addEventListener("click", function(db) {
  nextFlashcard(db)
});
function nextFlashcard(db) {
  db = request.result;
  let tr = db.transaction("profiles", "readwrite");
  let store = tr.objectStore("profiles");
  let index = store.index("by_name");
  let search = index.get(profile);

  search.onsuccess = function() {
    foldersArray = search.result;
    foldersArrayCopy = search.result;

    const i = foldersArrayCopy.data.map(folder => folder.folderName).indexOf(`${currentFolder} copy`); 
    const currentData = foldersArrayCopy.data[i].data;

    showAnswerBtn.disabled = false;
    nextBtn.disabled = true;
    spanFrontData.innerText = currentData[0].front;
    spanBackData.innerText = '';
  }
}

// back answer...
// backBtn.addEventListener("click", nextFlashcard);
// function nextFlashcard() {
//   spanBackData.innerText = '';
//   spanFrontData.innerText = currentData[currentIndex].front;
//   console.log(currentData);
// }


// close study...
window.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});
closeModalButton.addEventListener("click", (e) => {
  if (modal.style.display === "block") {
    modal.style.display = "none";
  } else {
    modal.style.display = "block";
  }
});



// function practice(e, db, profile) {
//   console.log("Hello");

//   showAnswerBtn.disabled = false;
//   nextBtn.style.display = "none";
//   backBtn.style.display = "none";
//   spanBackData.innerText = '';
//   currentIndex = 0;

//   db = request.result;
//   let tr = db.transaction("profiles", "readwrite");
//   let store = tr.objectStore("profiles");
//   let index = store.index("by_name");
//   let search = index.get(profile);

//   search.onsuccess = function() {
//     foldersArray = search.result;
//     foldersArrayCopy = search.result;

//     if (e.target.tagName === "BUTTON") {
//       modal.style.display = "block";
      
//       currentFolder = e.target.id;
//       const index = foldersArray.data.map(i => i.folderName).indexOf(currentFolder);
//       const indexCopy = foldersArrayCopy.data.map(i => i.folderName).indexOf(`${currentFolder} copy`);
      
//       console.log("The length of the folder:", foldersArrayCopy.data[indexCopy].data.length);
//       let datasFront = foldersArray.data[index].data[currentIndex].front;
//       let datasBack = foldersArray.data[index].data[currentIndex].back;

//       let length = foldersArrayCopy.data[indexCopy].data.length;
//       spanFrontData.innerText = foldersArrayCopy.data[indexCopy].data[currentIndex].front;
//       flashcardsLength.innerText = length;

//       showAnswerBtn.addEventListener("click", showAnswerFunction);
//       function showAnswerFunction() {
//         console.log("The length of the folder with show button:", length);
//         console.log(foldersArrayCopy);
//         nextBtn.style.display = "block";
//         showAnswerBtn.disabled = true;
//         if (length === 0) {
//           spanBackData.innerText = foldersArrayCopy.data[indexCopy].data[currentIndex].back;
//           foldersArrayCopy.data[indexCopy].data.shift();
//           db = request.result;
//           const tr = db.transaction("profiles", "readwrite");
//           const store = tr.objectStore("profiles");
//           const indexDelete = store.index("by_name");

//           const deletion = indexDelete.getKey(profile);
//           deletion.onsuccess = function() {
//             let id = deletion.result;
//             const deleteRequest = store.delete(id);
//             console.log("deleted");
//           }

//           const creation = store.add(foldersArrayCopy);
//           creation.onsuccess = function() {
//             console.log("added back");
//           };

//           studyNoDb();
//           flashcardsLength.innerText = '';
//           backBtn.style.display = "block";
//           document.querySelector(`#${currentFolder}`).disabled = true;
//         }
//         spanBackData.innerText = foldersArrayCopy.data[indexCopy].data[currentIndex].back;
//         if (currentIndex >= foldersArrayCopy.data[indexCopy].data.length - 1) {
//           nextBtn.style.display = "none";
//           currentIndex = foldersArrayCopy.data[indexCopy].data.length - 1;
//         }
//       };

      
//       nextBtn.addEventListener("click", nextFlashcard);
//       function nextFlashcard() {
//         foldersArrayCopy.data[indexCopy].data.splice(currentIndex, 1);
//         console.log("The length of the folder:", length);
//         flashcardsLength.innerText = length;
//         console.log(foldersArrayCopy.data[indexCopy].data);

//         db = request.result;
//         const tr = db.transaction("profiles", "readwrite");
//         const store = tr.objectStore("profiles");
//         const indexDelete = store.index("by_name");
//         const deletion = indexDelete.getKey(profile);
//         deletion.onsuccess = function() {
//           let id = deletion.result;
//           const deleteRequest = store.delete(id);
//           console.log("deleted");
//         }
//         const creation = store.add(foldersArrayCopy);
//         creation.onsuccess = function() {
//           console.log("added back");
//         };
//         studyNoDb();
//         showAnswerBtn.disabled = false;
//         currentIndex++;
//         spanFrontData.innerText = foldersArrayCopy.data[indexCopy].data[currentIndex].front;
//         spanBackData.innerText = '';
//         if (currentIndex >= foldersArrayCopy.data[indexCopy].data.length - 1) {
//           nextBtn.style.display = "none";
//           currentIndex = foldersArrayCopy.data[indexCopy].data.length - 1;
//         }
//         nextBtn.style.display = "none";
//       }

//       back button...
//       backBtn.addEventListener("click", prevFlashcard);
//       function prevFlashcard() {
//         showAnswerBtn.disabled = false;
//         nextBtn.style.display = "block";
//         nextBtn.removeEventListener("click", nextFlashcard);
//         nextBtn.onclick = function() {
//           backBtn.style.display = "block";
//           showAnswerBtn.disabled = false;
//           currentIndex++;
//           spanFrontData.innerText = foldersArrayCopy.data[indexCopy].data[currentIndex].front;
//           spanBackData.innerText = '';
//           if (currentIndex >= foldersArrayCopy.data[indexCopy].data.length - 1) {
//             nextBtn.style.display = "none";
//             backBtn.style.display = "block";
//             currentIndex = foldersArrayCopy.data[index].data.length - 1;
//           }
//         };

//         showAnswerBtn.removeEventListener("click", showAnswerFunction);
//         showAnswerBtn.onclick = function() {
//           showAnswerBtn.disabled = true;
//           spanBackData.innerText = foldersArrayCopy.data[indexCopy].data[currentIndex].back;
//           if (currentIndex >= foldersArrayCopy.data[indexCopy].data.length - 1) {
//             nextBtn.style.display = "none";
//             backBtn.style.display = "block";
//             currentIndex = foldersArrayCopy.data[indexCopy].data.length - 1;
//           } else if (currentIndex <= 0) {
//             backBtn.style.display = "none";
//           }  
//         };

//         flashcardsLength.innerText = '';
//         currentIndex--;
//         spanFrontData.innerText = foldersArrayCopy.data[indexCopy].data[currentIndex].front;
//         if (currentIndex <= 0) {
//           backBtn.style.display = "none";
//         }
//         spanBackData.innerText = '';
//       }

//       closeModalButton.onclick = function() {
//         modal.style.display = "none";
//       };
//       window.onclick = function(e) {
//         if (e.target === modal) {
//           modal.style.display = "none";
//         }
//       };

//     }
    
//   }
// }
// toLearnWrapper.addEventListener("click", function(e, db) {
//   practice(e, db, profile);
// });



