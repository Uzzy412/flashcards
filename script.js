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
const deleteProfileBtn = document.querySelector(".delete-profile");
const deleteFolderBtn = document.querySelector(".delete-folder");
const profileThings = document.querySelector(".profile-things");
const flashcardsModal = document.querySelector(".flashcards-modal");
const flashcardsModalContent = document.querySelector(".flashcards-modal-content");
const flashcardsModalCloseBtn = document.querySelector(".flashcards-modal-close");
const flashcardsModalFront = document.querySelector(".flashcards-modal-front");
const flashcardsModalBack = document.querySelector(".flashcards-modal-back");
const flashcardsEditConfirmBtn = document.querySelector(".flashcards-edit-confirm");



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


rightSection.style.display = "none";
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
let currentFlashcard;
let currentClass;
let targetedFolder;
let folder;
let foldersArray = [];
let foldersArrayCopy = [...foldersArray];
let arrayToShow = [];
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
  profileAutoselect();
  showFolders(db);
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
      deleteFolderBtn.style.display = "none";

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
      select.style.display = "none";
      deleteProfileBtn.style.display = "none";
      yourProfilesLabel.style.display = "none";
      folderNameInput.style.display = "none";
      addFolderBtn.style.display = "none";
      // folderText.style.display = "none"
    }
  };
  search.onerror = function() {console.log("Error searching");};
}



function profileAutoselect() {
  db = request.result;
  const tr = db.transaction("profiles");
  const store = tr.objectStore("profiles");
  const index = store.index("by_name");
  const search = index.get(profile);

  search.onsuccess = function() {
    deleteProfileBtn.style.display = "inline-block";
    console.log(search.result);
    if (search.result.data.length === 0) {
      console.log("This profile doesn't have any data saved.");
      folderNameInput.style.display = "inline-block";
      addFolderBtn.style.display = "inline-block";
      folderText.innerText = "\n\nYou don't have a folder. Please create one before adding any data.";
      rightSection.style.display = "none";
      deleteFolderBtn.style.display = "none";
    } else {
      console.log("There is data.");
      folderNameInput.style.display = "inline-block";
      addFolderBtn.style.display = "inline-block";
      folderText.innerText = "Your folders\n\n";
    }
  };
  search.onerror = function() {console.log("error")};
  studyMenu(db);
}



function selectProfile(e) {
  db = request.result;
  const tr = db.transaction("profiles", "readwrite");
  const store = tr.objectStore("profiles");
  const index = store.index("by_name");
  if (e.target.tag = "option") {
    profile = e.target.value;
    deleteProfileBtn.style.display = "inline-block";
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
      rightSection.style.display = "none";
      deleteFolderBtn.style.display = "none";
    } else {
      console.log("There is data.");
      folderNameInput.style.display = "inline-block";
      addFolderBtn.style.display = "inline-block";
      folderText.innerText = "Your folders";
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
  showFolders(db);
  studyMenu(db);
});



function addFolder(db, name) {
  db = request.result;
  let tr = db.transaction("profiles", "readwrite");
  let store = tr.objectStore("profiles");
  let index = store.index("by_name");
  let search = index.get(profile);

  search.onsuccess = function() {
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
    // profilesAndData = [...profilesCopy];
    profilesAndData = [];
  };
}
addFolderBtn.addEventListener("click", function(db) {
  db = request.result;
  addFolder(db, folderNameInput.value);
  showFolders(db);
  profileAutoselect();
  studyMenu(db);
  folderNameInput.value = '';
});



function showFolders(db) {
  db = request.result;
  let tr = db.transaction("profiles");
  let store = tr.objectStore("profiles");
  let index = store.index("by_name");
  let search = index.get(profile);

  search.onsuccess = function() {
    folders.style.display = "block";
    folders.innerHTML = search.result.data.map((folder) => {
      if (folder.folderName.match(/copy/)) {
        return;
      } else {
        return `<button class="folder-buttons">${folder.folderName}</button>`;
      }
    }).join(" ");
  }
}



function openFolders(e, db) {
  db = request.result;
  let tr = db.transaction("profiles");
  let store = tr.objectStore("profiles");
  let index = store.index("by_name");
  let search = index.get(profile);

  search.onsuccess = function() {
    foldersArray = search.result;
    if (e.target.tagName === "BUTTON") {
      deleteFolderBtn.style.display = "inline-block";
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
  openFolders(e, db);
  foldersDataList.style.display = "none";
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
    let id = foldersArray.data[index].data.length;
    foldersArray.data[index].data.push({id: id, front: front, back: back});
    foldersArray.data[index2].data.push({id: id, front: front, back: back});

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
  showData(db);
  studyMenu(db);
  frontTextarea.value = '';
  backTextarea.value = '';
  dataMessage.innerText = '';
});


function showData(db) {
  db = request.result;
  let tr = db.transaction("profiles");
  let store = tr.objectStore("profiles");
  let index = store.index("by_name");
  let search = index.get(profile);
  
  search.onsuccess = function() {
    foldersArray = search.result;
    const index = foldersArray.data.map(i => i.folderName).indexOf(currentFolder);
    if (search.result.data[index].data.length > 0) {
      foldersDataList.innerHTML = search.result.data[index].data.map((datas) => {
        return `
            <div class="data-div">
              <span class="data-span">${datas.front}</span>
              <span class="data-span">${datas.back}</span>
              <button class="${datas.front.split(' ').join('')}" data-id="${datas.id}" data-edit="edit">Edit</button>
              <button class="${datas.front.split(' ').join('')}" data-id="${datas.id}" data-del="del">X</button>
            </div>`;
      }).join("");
    } else {
      foldersDataList.innerHTML = '';
      dataMessage.innerText = "\nNo data in this folder";
      showDataBtn.style.display = "none";
    }

    const dataDiv = document.querySelectorAll('.data-div');
    dataDiv.forEach((flash) => {
      flash.addEventListener("click", (e) => {
        if (e.target.tagName === "BUTTON") {
          currentFlashcard = e.target.dataset.id;
          currentClass = e.target.className;
        }
        if (e.target.dataset.del === "del") {
          deleteFlashcard();
        }
        if (e.target.dataset.edit === "edit") {
          editFlashcardMenu();
        }
      });
    });


    // const edit = document.querySelectorAll('button[data-edit="edit"]');
    // edit.forEach(button => edit.addEventListener("click", function(e) {
    //   currentFlashcard = e.target.className;
    //   console.log(currentFlashcard);  
    //   editFlashcard(currentFlashcard);
    // }));

    // const del = document.querySelector('button[data-del="del"]');
    // del.addEventListener("click", function() {
    //   deleteFlashcard(currentFlashcard);
    // });


    // const dataDiv = document.querySelectorAll('.data-div');
    // dataDiv.forEach((flash) => {
    //   flash.addEventListener("click", (e) => {
    //     if (e.target.tagName === "BUTTON") {
    //       currentFlashcard = e.target.className;
    //     }  
    //   });
    // });
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


// function update(db) {
//   db = request.result;
//   let tr = db.transaction("profiles");
//   let store = tr.objectStore("profiles");
//   let index = store.index("by_name");
//   let search = index.get(profile);
  
//   search.onsuccess = function() {
//     foldersArray = search.result;
//     const index = foldersArray.data.map(i => i.folderName).indexOf(currentFolder);
//     foldersDataList.innerHTML = foldersArray.data[index].data.map((datas) => {
//       return `
//         <div>
//           <span class="data-span">${datas.front}</span>
//           <span class="data-span">${datas.back}</span>
//         </div>`;
//     }).join("");
//   };
// }


// --------------------- STUDY FEATURES ------------------------ //

function studyMenu(db) {
  db = request.result;
  let tr = db.transaction("profiles", "readwrite");
  let store = tr.objectStore("profiles");
  let index = store.index("by_name");
  let search = index.get(profile);

  search.onsuccess = function() {
    foldersArrayCopy = search.result;

    rightSection.style.display = "block";
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

function study(e, db) {
  if (e.target.tagName === "BUTTON") {
    db = request.result;
    let tr = db.transaction("profiles", "readwrite");
    let store = tr.objectStore("profiles");
    let index = store.index("by_name");
    let search = index.get(profile);

    search.onsuccess = function () {
      foldersArray = search.result;
      foldersArrayCopy = search.result;

      modal.style.display = "block";
      showAnswerBtn.disabled = false;
      backBtn.disabled = true;
      nextBtn.disabled = true;
      spanBackData.innerText = '';
      currentFolder = e.target.id;

      const index = foldersArrayCopy.data.map(folder => folder.folderName).indexOf(`${currentFolder} copy`);
      arrayToShow.push(...foldersArrayCopy.data[index].data);
      console.log('Array length', arrayToShow.length);
      console.log('Array content', arrayToShow);
      spanFrontData.innerText = arrayToShow[currentIndex].front;
      flashcardsLength.innerText = foldersArrayCopy.data[index].data.length;
    }
  }
}
toLearnWrapper.addEventListener("click", function(e, db) {
  study(e, db);
});

// show answer...
showAnswerBtn.addEventListener("click", showFlashcardAnswer);
function showFlashcardAnswer() {
  db = request.result;
  let tr = db.transaction("profiles", "readwrite");
  let store = tr.objectStore("profiles");
  let index = store.index("by_name");
  let search = index.get(profile);

  search.onsuccess = function() {
    console.log('Current index:', currentIndex);
    foldersArrayCopy = search.result;
    const index = foldersArrayCopy.data.map(folder => folder.folderName).indexOf(`${currentFolder} copy`);
    showAnswerBtn.disabled = true;
    spanBackData.innerText = arrayToShow[currentIndex].back;

    if (currentIndex >= arrayToShow.length - 1) {
      currentIndex = arrayToShow.length - 1;
      nextBtn.disabled = true;
      backBtn.disabled = false;
    } else {
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
    flashcardsLength.innerText = foldersArrayCopy.data[index].data.length;

    if (currentIndex <= 0) {
      backBtn.disabled = true;
    }
  }
}
function newShowFlashcardAnswer() {
  showAnswerBtn.disabled = true;
  spanBackData.innerText = arrayToShow[currentIndex].back;
  if (currentIndex >= arrayToShow.length - 1) {
    currentIndex = arrayToShow.length - 1;
    nextBtn.disabled = true;
    backBtn.disabled = false;
  } else {
    nextBtn.disabled = false;
  }
  if (currentIndex <= 0) {
    backBtn.disabled = true;
    nextBtn.disabled = false;
  }
}

// next answer...
nextBtn.addEventListener("click", nextFlashcard);
function nextFlashcard() {
  db = request.result;
  let tr = db.transaction("profiles", "readwrite");
  let store = tr.objectStore("profiles");
  let index = store.index("by_name");
  let search = index.get(profile);

  search.onsuccess = function() {
    foldersArrayCopy = search.result; 
    showAnswerBtn.disabled = false;
    nextBtn.disabled = true;
    currentIndex++;
    console.log('Current index:', currentIndex);
    spanFrontData.innerText = arrayToShow[currentIndex].front;
    spanBackData.innerText = '';
    if (currentIndex >= arrayToShow.length - 1) {
      currentIndex = arrayToShow.length - 1;
      nextBtn.disabled = true;
    }
  }
}
function newNextFlashcard() {
  showAnswerBtn.disabled = false;
  nextBtn.disabled = false;
  currentIndex++;
  spanFrontData.innerText = arrayToShow[currentIndex].front;
  spanBackData.innerText = '';
  if (currentIndex >= arrayToShow.length - 1) {
    currentIndex = arrayToShow.length - 1;
    nextBtn.disabled = true;
    backBtn.disabled = false;
  } else {
    backBtn.disabled = false;
  }
}


// back answer...
backBtn.addEventListener("click", backFlashcard);
function backFlashcard() {
  db = request.result;
  let tr = db.transaction("profiles", "readwrite");
  let store = tr.objectStore("profiles");
  let index = store.index("by_name");
  let search = index.get(profile);

  search.onsuccess = function() {
    foldersArrayCopy = search.result;
    currentIndex--;
    spanFrontData.innerText = arrayToShow[currentIndex].front;
    spanBackData.innerText = '';
    showAnswerBtn.disabled = false;
    nextBtn.disabled = false;
    if (currentIndex <= 0) {
      backBtn.disabled = true;
    }
    
    showAnswerBtn.removeEventListener("click", showFlashcardAnswer);
    showAnswerBtn.addEventListener("click", newShowFlashcardAnswer);
    nextBtn.removeEventListener("click", nextFlashcard);
    nextBtn.addEventListener("click", newNextFlashcard);
  }
}


// close study...
// window.addEventListener("click", (e) => {
//   if (e.target === modal) {
//     modal.style.display = "none";
//     arrayToShow.splice(0, arrayToShow.length);
//     showAnswerBtn.removeEventListener("click", newShowFlashcardAnswer);
//     showAnswerBtn.addEventListener("click", showFlashcardAnswer);
//     nextBtn.removeEventListener("click", newNextFlashcard);
//     nextBtn.addEventListener("click", nextFlashcard);
//     currentIndex = 0;
//   }  
// });
closeModalButton.addEventListener("click", () => {
  if (modal.style.display === "block") {
    modal.style.display = "none";
    arrayToShow.splice(0, arrayToShow.length);
    showAnswerBtn.removeEventListener("click", newShowFlashcardAnswer);
    showAnswerBtn.addEventListener("click", showFlashcardAnswer);
    nextBtn.removeEventListener("click", newNextFlashcard);
    nextBtn.addEventListener("click", nextFlashcard);
    currentIndex = 0;
  } else {
    modal.style.display = "block";
  }
});

// -----------------------------//------------------------------ //


// delete profile...
deleteProfileBtn.addEventListener("click", deleteProfile);
function deleteProfile() {
  db = request.result;
  let tr = db.transaction("profiles", "readwrite");
  let store = tr.objectStore("profiles");
  let index = store.index("by_name");
  let search = index.getAll();

  search.onsuccess = function() {
    profilesAndData = search.result;
    const index = profilesAndData.map(profile => profile.profileName).indexOf(profile);
    const confirmation = confirm("Are you sure you want to delete " + profile + " profile?");
    if (confirmation) {
      profilesAndData.splice(index, 1);
      const tr2 = db.transaction("profiles", "readwrite");
      const store = tr2.objectStore("profiles");
      const indexDelete = store.index("by_name");
      const deletion = indexDelete.getKey(profile);
      deletion.onsuccess = function() {
        const deleted = store.delete(deletion.result);
        console.log('deleted');
      };

      showProfiles(db);
      select.style.display = "none";
      deleteProfileBtn.style.display = "none";
      folderNameInput.style.display = "none";
      addFolderBtn.style.display = "none";

      folderText.innerText = '';
      folders.style.display = "none";
      rightSection.style.display = "none";
      frontTextarea.style.display = "none";
      backTextarea.style.display = "none";

      createDataBtn.style.display = "none";
      showDataBtn.style.display = "none";
      foldersDataList.style.display = "none";
      dataMessage.innerText = "";
      openedFolder.innerText = "";
    } else {
      return;
    }  
  }  
}

// delete folder...
deleteFolderBtn.addEventListener("click", deleteFolder);
function deleteFolder() {
  db = request.result;
  let tr = db.transaction("profiles", "readwrite");
  let store = tr.objectStore("profiles");
  let index = store.index("by_name");
  let search = index.get(profile);

  search.onsuccess = function() {
    profilesAndData = search.result;
    currentFolder = openedFolder.innerText;
    const index = profilesAndData.data.map(folder => folder.folderName).indexOf(currentFolder);
    const confirmation = confirm("Are you sure you want to delete " + currentFolder + " folder?");

    if (confirmation) {
      profilesAndData.data.splice(index, 1);
      const indexCopy = profilesAndData.data.map(folder => folder.folderName).indexOf(`${currentFolder} copy`);
      profilesAndData.data.splice(indexCopy, 1);
      const tr2 = db.transaction("profiles", "readwrite");
      const store = tr2.objectStore("profiles");
      const indexDelete = store.index("by_name");
      const deletion = indexDelete.getKey(profile);
      deletion.onsuccess = function() {
        const deleted = store.delete(deletion.result);
        console.log('deleted');
      };
      const addition = store.add(profilesAndData);

      studyMenu(db);
      showFolders(db);
      profileAutoselect();
      deleteFolderBtn.style.display = "none";
      folderText.innerText = '';

      frontTextarea.style.display = "none";
      backTextarea.style.display = "none";
      createDataBtn.style.display = "none";
      showDataBtn.style.display = "none";

      foldersDataList.style.display = "none";
      dataMessage.innerText = "";
      openedFolder.innerText = "";
      profilesAndData = [];
      
    } else {
      return;
    }  
  }  
}

// delete flashcard...
function deleteFlashcard() {
  db = request.result;
  let tr = db.transaction("profiles");
  let store = tr.objectStore("profiles");
  let index = store.index("by_name");
  let search = index.get(profile);

  search.onsuccess = function() {
    profilesAndData = search.result;
    let folderIndex = profilesAndData.data.map(folder => folder.folderName).indexOf(currentFolder);
    let flashcardIndex = profilesAndData.data[folderIndex].data.map(flashcard => flashcard.id).indexOf(Number(currentFlashcard));

    const confirmation = confirm("Are you sure you want to delete this flashcard?");
    if (confirmation) {
      profilesAndData.data[folderIndex].data.splice(flashcardIndex, 1);
      let folderIndexCopy = profilesAndData.data.map(folder => folder.folderName).indexOf(`${currentFolder} copy`);
      let flashcardIndexCopy = profilesAndData.data[folderIndexCopy].data.map(flashcard => flashcard.id).indexOf(Number(currentFlashcard));
      profilesAndData.data[folderIndexCopy].data.splice(flashcardIndexCopy, 1);

      const tr2 = db.transaction("profiles", "readwrite");
      const store = tr2.objectStore("profiles");
      const indexDelete = store.index("by_name");
      const deletion = indexDelete.getKey(profile);
      deletion.onsuccess = function() {
        const deleted = store.delete(deletion.result);
        console.log("deleted");
      };
      const addition = store.add(profilesAndData);

      showData(db);
      studyMenu(db);
    } else {return;}
  }
}

// edit flashcard menu...
function editFlashcardMenu() {
  db = request.result;
  let tr = db.transaction("profiles");
  let store = tr.objectStore("profiles");
  let index = store.index("by_name");
  let search = index.get(profile);

  search.onsuccess = function() {
    profilesAndData = search.result;
    let folderIndex = profilesAndData.data.map(folder => folder.folderName).indexOf(currentFolder);
    let flashcardIndex = profilesAndData.data[folderIndex].data.map(flashcard => flashcard.id).indexOf(Number(currentFlashcard));
    flashcardsModal.style.display = "block";
   
    const flashcard = document.querySelector(`.${currentClass}`);
    const rect = flashcard.getBoundingClientRect();
    flashcardsModalContent.style.top = `${rect.y - 10}px`;

    flashcardsModalFront.value = profilesAndData.data[folderIndex].data[flashcardIndex].front;
    flashcardsModalBack.value = profilesAndData.data[folderIndex].data[flashcardIndex].back;
    // close modal...
    flashcardsModalCloseBtn.addEventListener("click", () => flashcardsModal.style.display = "none");
  }  
}

// confirm edit... 
flashcardsEditConfirmBtn.addEventListener("click", confirmFlashcardEdit);
function confirmFlashcardEdit() {
  db = request.result;
  let tr = db.transaction("profiles");
  let store = tr.objectStore("profiles");
  let index = store.index("by_name");
  let search = index.get(profile);

  search.onsuccess = function() {
    profilesAndData = search.result;
    let folderIndex = profilesAndData.data.map(folder => folder.folderName).indexOf(currentFolder);
    let flashcardIndex = profilesAndData.data[folderIndex].data.map(flashcard => flashcard.id).indexOf(Number(currentFlashcard));
    let folderIndexCopy = profilesAndData.data.map(folder => folder.folderName).indexOf(`${currentFolder} copy`);
    let flashcardIndexCopy = profilesAndData.data[folderIndexCopy].data.map(flashcard => flashcard.id).indexOf(Number(currentFlashcard));

    if (!profilesAndData.data[folderIndexCopy].data[flashcardIndexCopy]) {
      profilesAndData.data[folderIndex].data[flashcardIndex].front = flashcardsModalFront.value;
      profilesAndData.data[folderIndex].data[flashcardIndex].back = flashcardsModalBack.value;
    } else {
      profilesAndData.data[folderIndex].data[flashcardIndex].front = flashcardsModalFront.value;
      profilesAndData.data[folderIndex].data[flashcardIndex].back = flashcardsModalBack.value;
      profilesAndData.data[folderIndexCopy].data[flashcardIndexCopy].front = flashcardsModalFront.value;
      profilesAndData.data[folderIndexCopy].data[flashcardIndexCopy].back = flashcardsModalBack.value;
    }

    if (flashcardsModalFront.value === '' && flashcardsModalBack.value === '') {
      alert("Please add values for your flashcards");
      return;
    }
    if (flashcardsModalFront.value === '') {
      alert("Please add a value for your front flashcard");
      return;
    } 
    if (flashcardsModalBack.value === '') {
      alert("Please add a value for your back flashcard");
      return;
    }
    
    const tr2 = db.transaction("profiles", "readwrite");
    const store = tr2.objectStore("profiles");
    const indexDelete = store.index("by_name");
    const deletion = indexDelete.getKey(profile);
    deletion.onsuccess = function() {
      const deleted = store.delete(deletion.result);
      console.log('deleted');
    };
    const addition = store.add(profilesAndData);

    showData(db);
    studyMenu(db);
    flashcardsModal.style.display = "none";
    console.log("Edited successfuly");
    profilesAndData = [];
  }
}



