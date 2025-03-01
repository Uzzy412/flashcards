// ----------- --- -- HTML REFERENCES -- --- ----------- //

// ------------profiles------------ //
const container = document.querySelector(".container");
const createProfileBtn = document.querySelector(".create-profile-btn");
const profileNameInput = document.querySelector(".profile-name");
const yourProfilesLabel = document.querySelector('label[for="select"]');
const select = document.querySelector(".select-profile");
const profileText = document.querySelector(".profile-text");
const deleteProfileBtn = document.querySelector(".delete-profile");

// ------------folders------------ //
const folderNameInput = document.querySelector(".add-folder-text");
const addFolderBtn = document.querySelector(".add-folder-btn");
const folderText = document.querySelector(".folder-text");
const openedFolder = document.querySelector(".opened-folder");
const folders = document.querySelector(".folders");
const deleteFolderBtn = document.querySelector(".delete-folder");

// -----------flashcards---------- //
const foldersDataList = document.querySelector(".folders-data-list");
const dataMessage = document.querySelector(".data-message");
const frontTextarea = document.querySelector(".front");
const backTextarea = document.querySelector(".back");
const createDataBtn = document.querySelector(".create-data-btn");
const showDataBtn = document.querySelector(".show-data-btn");
const flashcardsModal = document.querySelector(".flashcards-modal");
const flashcardsModalContent = document.querySelector(
  ".flashcards-modal-content"
);
const flashcardsModalCloseBtn = document.querySelector(
  ".flashcards-modal-close"
);
const flashcardsModalFront = document.querySelector(".flashcards-modal-front");
const flashcardsModalBack = document.querySelector(".flashcards-modal-back");
const flashcardsEditConfirmBtn = document.querySelector(
  ".flashcards-edit-confirm"
);
const flashcardsTotal = document.querySelector(".flashcards-total");

// -------------study------------ //
const rightSection = document.querySelector(".right-section");
const learnText = document.querySelector(".learn-text");
const toLearnWrapper = document.querySelector(".to-learn-wrapper");
const modal = document.querySelector(".modal");
const modalContent = document.querySelector(".modal-content");
const closeModalButton = document.querySelector(".close-modal-button");
const spanFrontData = document.querySelector(".span-front-data");
const spanBackData = document.querySelector(".span-back-data");
const reviewsSpacing = document.querySelector(".reviews-spacing");
const nextBtn = document.querySelector(".next-btn");
const backBtn = document.querySelector(".back-btn");
const showAnswerBtn = document.querySelector(".show-answer-btn");
const flashcardsLength = document.querySelector(".flashcards-length");
const reviewsLength = document.querySelector(".reviews-length");

// ------------settings----------- //
const settingsSection = document.querySelector(".settings-section");
const inputForNew = document.querySelector("#new");
const selectForNew = document.querySelector("#order-for-new");
const inputForReview = document.querySelector("#review");
const selectForReview = document.querySelector("#order-for-review");
const saveSettingsBtn = document.querySelector(".save-settings-btn");
const whichFolder = document.querySelector(".which-folder");

// ------variables declarations------//
let profile;
let currentFolder;
let currentFlashcard;
let currentIndex = 0;
let currentClass;
let dayPassed;
let neuCount = 5;
let reviewCount = 5;
let orderForNew;
let orderForReview;
let folderSettings;
let foldersArray = [];
let foldersArrayCopy = [];
let arrayToShow = [];

let profilesAndData = [
  // { profileName: Alex,
  //   data: [
  //     { folderName: 1, data: [{id: 1, front: "text", back: "text"}, {}, {}], reviews: [] },
  //     { folderName: 2, data: [1, 2, 3], reviews: [] },
  //   ]
  // },
];

// --------------- INITIALIZE DATA BASE ----------------- //

let db;
let request = indexedDB.open("flashcardsDatabase", 1);

request.onerror = function () {
  console.log("Error accessing database" + request.error);
};
request.onupgradeneeded = function () {
  db = request.result;
  const profileStore = db.createObjectStore("profiles", {
    autoIncrement: true,
  });
  const nameIndex = profileStore.createIndex("by_name", "profileName", {
    unique: false,
  });
  const dataIndex = profileStore.createIndex("by_data", "data", {
    unique: false,
  });
};
request.onsuccess = function () {
  db = request.result;
  console.log("Database is open.");
  showProfiles();
  checkTime();
};

// --------------------- FEATURES ---------------------- //

function checkTime() {
  db = request.result;
  const tr = db.transaction("profiles", "readwrite");
  const store = tr.objectStore("profiles");
  const search = store.getAll();

  search.onsuccess = function () {
    foldersArray = search.result;
    const yesterday = new Date("2025-02-28");
    yesterday.setHours(0, 0, 0, 0);
    const yesterdayMs = yesterday.getTime();

    foldersArray.push(yesterdayMs);
    // in case there is a second access time, delete it...
    for (let i = 1; i < foldersArray.length; i++) {
      if (typeof foldersArray[i] === "number") {
        foldersArray.splice(i, 1);
      }
    }
    const tr4 = db.transaction("profiles", "readwrite");
    const store4 = tr4.objectStore("profiles");
    const deletion = store4.clear();
    for (let i = 0; i < foldersArray.length; i++) {
      const addition = store4.add(foldersArray[i]);
    }

    const today = new Date("2025-03-01");
    today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();
    const elapsedMs = todayMs - foldersArray[0];
    const elapsedHours = Math.floor(elapsedMs / 1000 / 60 / 60);
    console.log("Elapsed hours:", elapsedHours);

    function hasOneDayPassed() {
      if (elapsedHours >= 24) {
        foldersArray.shift();
        foldersArray.unshift(yesterdayMs);
        console.log("A day just passed.");
        return true;
      } else {
        console.log("The day didn't pass yet.");
        return false;
      }
    }

    runOnce();
    function runOnce() {
      if (hasOneDayPassed()) {
        console.log("Reseting learned flashcards because one day passed.");
        foldersArray.forEach((profile) => {
          profile.data?.forEach((folder) => {
            folder.flashcardsLearned = 0;
            folder.flashcardsReviewed = 0;
          });
        });

        console.log("Add new flashcards");
        const tr4 = db.transaction("profiles", "readwrite");
        const store4 = tr4.objectStore("profiles");
        const deletion = store4.clear();
        for (let i = 0; i < foldersArray.length; i++) {
          const addition = store4.add(foldersArray[i]);
        }

        addFlashAndReviews();
        dayPassed = true;
        return true;
      } else {
        console.log("Waiting for one day to pass before reseting.");
        dayPassed = false;
        return false;
      }
    }
  };
}

// function clearAdd() {
//   console.log("Delete everything and add back");
//   db = request.result;
//   const tr = db.transaction("profiles", "readwrite");
//   const store = tr.objectStore("profiles");
//   store.clear();
//   for (let j = 0; j < foldersArray.length; j++) {
//     store.add(foldersArray[j]);
//   }
// }

function addFlashAndReviews() {
  db = request.result;
  const tr = db.transaction("profiles", "readwrite");
  const store = tr.objectStore("profiles");
  const search = store.getAll();
  search.onsuccess = function () {
    foldersArray = search.result;

    foldersArray.forEach((profile) => {
      if (typeof profile === "object") {
        profile.data?.forEach((folder) => {
          if (folder.folderName.match(/copy/)) {
            folder.data = [];
          }
        });
      }
    });

    foldersArray.forEach((profile) => {
      for (let i = 0; i < profile.data?.length; i++) {
        if (profile.data[i].folderName.match(/copy/)) {

          // add flashcards daily...
          if (
            profile.data[i - 1].data.length >= profile.data[i - 1].settings.new
          ) {
            const onlyNewFlashcards = [];
            console.log("This is case A");
            for (let j = 0; j < profile.data[i - 1].data.length; j++) {
              if (profile.data[i - 1].data[j].old) {
                continue;
              } else {
                onlyNewFlashcards.push(profile.data[i - 1].data[j]);
              }
            }

            for (let k = 0; k < profile.data[i - 1].settings.new; k++) {
              if (!onlyNewFlashcards[k]) {
                continue;
              } else {
                profile.data[i].data.push(onlyNewFlashcards[k]);
                console.log("You got some new flashcards");
              }
            }
          } else {
            const onlyNewFlashcards = [];
            console.log("This is Case B");
            for (let j = 0; j < profile.data[i - 1].data.length; j++) {
              if (profile.data[i - 1].data[j].old) {
                continue;
              } else {
                onlyNewFlashcards.push(profile.data[i - 1].data[j]);
              }
            }

            for (let k = 0; k < profile.data[i - 1].settings.new; k++) {
              if (!onlyNewFlashcards[k]) {
                continue;
              } else {
                profile.data[i].data.push(onlyNewFlashcards[k]);
                console.log("You got some new flashcards");
              }
            }
          }

          
          // add reviews if any...
          const onlySessionFlash = [];
          for (let j = 0; j < profile.data[i].reviews?.length; j++) {
            let msToElapse =
              profile.data[i].reviews[j].get - profile.data[i].reviews[j].sent;
            let hoursToElapse = Math.floor(msToElapse / 1000 / 60 / 60);
            let sending = profile.data[i].reviews[j].sent;
            let elapsedMs = Date.now() - sending;
            let elapsedHours = Math.floor(elapsedMs / 1000 / 60 / 60);
            console.log(
              "Passed time:",
              elapsedHours,
              "Minimum time to pass:",
              hoursToElapse
            );

            if (elapsedHours >= hoursToElapse) {
              console.log("You got some reviews for today");


              // if (profile.data[i].reviews.length >= profile.data[i].settings.review) {
              //   console.log("This is case A - reviews");
                // const onlySessionFlash = [];
                // for (let j = 0; j < profile.data[i - 1].reviews.length; j++) {
                //   onlySessionFlash.push(profile.data[i - 1].reviews[j]);
                // }

                // for (let k = 0; k < profile.data[i - 1].settings.review; k++) {
                  // if (!onlySessionFlash[k]) {
                    // continue;
                  // } else {
              //     if (
              //       !profile.data[i].sessionReviews
              //       ?.map(review => review.front)
              //       .includes(profile.data[i - 1].reviews.map(review => review.front)[k])
              //     ) {
              //       profile.data[i].sessionReviews.push(profile.data[i - 1].reviews[k]);
              //     } else {
              //       continue;
              //     }
              //   }
              // }


              // else {
              //   for (let j = 0; j < profile.data[i - 1].reviews.length; j++) {
              //     if (
              //       !profile.data[i].sessionReviews
              //       .map(review => review.front)
              //       .includes(profile.data[i - 1].reviews.map(review => review.front)[j])
              //     ) {
              //       profile.data[i].sessionReviews.push(profile.data[i - 1].reviews[j]);
              //     } else {
              //       continue;
              //     }  
              //   }
              // }


              // now
              if (
                !onlySessionFlash?.map(review => review.front).includes(
                  profile.data[i].reviews.map(review => review.front)[j]
                )
              ) {
                onlySessionFlash.push(profile.data[i].reviews[j]);
              } else {
                continue;
              }

              console.log(onlySessionFlash);

              if (onlySessionFlash.length >= profile.data[i - 1].settings.review) {
                console.log("Reviews Case A");
                for (let k = 0; k < profile.data[i - 1].settings.review; k++) {
                  if (
                    !profile.data[i].sessionReviews.map(review => review?.front)
                    .includes(onlySessionFlash.map(review => review.front)[k])
                  ) {
                    profile.data[i].sessionReviews.push(onlySessionFlash[k]);
                  } else {
                    continue;
                  }
                }

              } else {
                console.log("Reviews Case B");
                for (let k = 0; k < onlySessionFlash.length; k++) {
                  if (
                    !profile.data[i].sessionReviews?.map(review => review?.front)
                    .includes(onlySessionFlash.map(review => review.front)[k])
                  ) {
                    profile.data[i].sessionReviews.push(onlySessionFlash[k]);
                  } else {
                    continue;
                  }
                }
              }


            // before...
              // if (
              //   !profile.data[i].sessionReviews?.map(review => review.front).includes(
              //     profile.data[i].reviews.map(review => review.front)[j]
              //   )
              // ) {
              //   profile.data[i].sessionReviews.push(profile.data[i].reviews[j]);
              // } else {
              //   continue;
              // }



            } else {
              console.log("Wait more to get reviews");
            }

          }
        }
      }
    });

    const tr = db.transaction("profiles", "readwrite");
    const store = tr.objectStore("profiles");
    store.clear();
    for (let i = 0; i < foldersArray.length; i++) {
      store.add(foldersArray[i]);
    }
  };
}


createProfileBtn.addEventListener("click", function () {
  createProfile(profileNameInput.value);
});
function createProfile(name) {
  profile = name;
  db = request.result;
  const tr = db.transaction("profiles", "readwrite");
  const store = tr.objectStore("profiles");

  if (profileNameInput.value === "") {
    profileNameInput.focus();
    alert("Please add a name for your profile");
    return;
  }

  profilesAndData.unshift({ profileName: name, data: [] });
  store.add(profilesAndData[0]);
  console.log(`${profileNameInput.value} profile was created!`);

  showProfiles(name);
  profileAutoselect();
  showFolders();
  profileNameInput.value = "";
  foldersDataList.innerHTML = "";
  frontTextarea.style.display = "none";

  backTextarea.style.display = "none";
  showDataBtn.style.display = "none";
  createDataBtn.style.display = "none";
  foldersDataList.style.display = "none";
  openedFolder.style.display = "none";
}


function showProfiles(value) {
  db = request.result;
  const tr = db.transaction("profiles");
  const store = tr.objectStore("profiles");
  const search = store.count();

  search.onsuccess = function () {
    if (search.result >= 1) {
      console.log("There are profiles.");
      profileText.innerText = "";
      select.style.display = "inline-block";
      yourProfilesLabel.style.display = "inline-block";
      deleteFolderBtn.style.display = "none";

      const tr2 = db.transaction("profiles");
      const store2 = tr2.objectStore("profiles");
      let result2 = store2.getAll();
      result2.onsuccess = function () {
        select.innerHTML = result2.result.map((profile) => {
          if (profile instanceof Object) {
            return `<option id="${profile.profileName}" value="${profile.profileName}">${profile.profileName}</option>`;
          }
          if (profile instanceof Number) {
            return;
          }
        });
        select.value = value;
      };
    } else {
      profileText.innerText = "\n\nThere is no profile";
      console.log("There is no profile. Please create one.");
      select.style.display = "none";
      deleteProfileBtn.style.display = "none";
      yourProfilesLabel.style.display = "none";
      folderNameInput.style.display = "none";
      addFolderBtn.style.display = "none";
    }
  };
  search.onerror = function () {
    console.log("Error searching");
  };
}


function profileAutoselect() {
  db = request.result;
  const tr = db.transaction("profiles");
  const store = tr.objectStore("profiles");
  const index = store.index("by_name");
  const search = index.get(profile);

  search.onsuccess = function () {
    deleteProfileBtn.style.display = "inline-block";
    console.log(search.result);
    if (search.result.data.length === 0) {
      console.log("This profile doesn't have any data saved.");
      folderNameInput.style.display = "inline-block";
      addFolderBtn.style.display = "inline-block";
      folderText.innerText =
        "\nYou don't have a folder. Please create one before adding any data.";
      rightSection.style.display = "none";
      deleteFolderBtn.style.display = "none";
      settingsSection.style.display = "none";
    } else {
      console.log("There is data.");
      folderNameInput.style.display = "inline-block";
      addFolderBtn.style.display = "inline-block";
      folderText.innerText = "\nYour folders\n";
      settingsSection.style.display = "block";
      rightSection.style.display = "block";
      autoFolderSettings();
    }
  };
  search.onerror = function () {
    console.log("error");
  };
  studyMenu();
  flashcardsTotal.style.display = "none";
}


select.addEventListener("change", selectProfile);
function selectProfile(e) {
  db = request.result;
  const tr = db.transaction("profiles", "readwrite");
  const store = tr.objectStore("profiles");
  const index = store.index("by_name");
  if ((e.target.tag = "option")) {
    profile = e.target.value;
    deleteProfileBtn.style.display = "inline-block";
    console.log(profile);
  }
  const search = index.get(profile);

  search.onsuccess = function () {
    foldersArray = search.result;
    console.log(foldersArray);

    if (foldersArray.data.length === 0) {
      console.log("This profile doesn't have any data saved.");
      folderNameInput.style.display = "inline-block";
      addFolderBtn.style.display = "inline-block";
      folderText.innerText =
        "\nYou don't have a folder. Please create one before adding any data.";
      rightSection.style.display = "none";
      deleteFolderBtn.style.display = "none";
      settingsSection.style.display = "none";
    } else {
      console.log("There is data.");
      folderNameInput.style.display = "inline-block";
      addFolderBtn.style.display = "inline-block";
      folderText.innerText = "\nYour folders\n";
      rightSection.style.display = "block";
      settingsSection.style.display = "block";
      autoFolderSettings();
    }
  };
  search.onerror = function () {
    console.log("error");
  };

  foldersDataList.innerHTML = "";
  frontTextarea.style.display = "none";
  backTextarea.style.display = "none";
  showDataBtn.style.display = "none";
  createDataBtn.style.display = "none";
  flashcardsTotal.style.display = "none";

  foldersDataList.style.display = "none";
  dataMessage.innerText = "";
  openedFolder.innerText = "";
  showFolders();
  studyMenu();
}


// delete profile...
deleteProfileBtn.addEventListener("click", deleteProfile);
function deleteProfile() {
  db = request.result;
  let tr = db.transaction("profiles", "readwrite");
  let store = tr.objectStore("profiles");
  let index = store.index("by_name");
  let search = index.getAll();

  search.onsuccess = function () {
    profilesAndData = search.result;
    const index = profilesAndData
      .map((profile) => profile.profileName)
      .indexOf(profile);
    const confirmation = confirm(
      "Are you sure you want to delete " + profile + " profile?"
    );
    if (confirmation) {
      profilesAndData.splice(index, 1);
      const tr2 = db.transaction("profiles", "readwrite");
      const store = tr2.objectStore("profiles");
      const indexDelete = store.index("by_name");
      const deletion = indexDelete.getKey(profile);
      deletion.onsuccess = function () {
        const deleted = store.delete(deletion.result);
        console.log("deleted");
      };

      showProfiles();
      flashcardsTotal.style.display = "none";
      select.style.display = "none";
      deleteProfileBtn.style.display = "none";
      folderNameInput.style.display = "none";
      deleteFolderBtn.style.display = "none";
      addFolderBtn.style.display = "none";

      folderText.innerText = "";
      folders.style.display = "none";
      rightSection.style.display = "none";
      frontTextarea.style.display = "none";
      backTextarea.style.display = "none";
      settingsSection.style.display = "none";

      createDataBtn.style.display = "none";
      showDataBtn.style.display = "none";
      foldersDataList.style.display = "none";
      dataMessage.innerText = "";
      openedFolder.innerText = "";
    } else {
      return;
    }
  };
}


addFolderBtn.addEventListener("click", function () {
  addFolder(folderNameInput.value);
  folderNameInput.value = "";
});
function addFolder(name) {
  db = request.result;
  let tr = db.transaction("profiles", "readwrite");
  let store = tr.objectStore("profiles");
  let index = store.index("by_name");
  let search = index.get(profile);

  if (folderNameInput.value === "") {
    folderNameInput.focus();
    alert("Please add a name for your folder");
    return;
  }

  search.onsuccess = function () {
    profilesAndData = search.result;
    profilesAndData.data.push({
      folderName: name,
      reset: true,
      data: [],
      reviews: [],
      sessionReviews: [],
      settings: {
        new: 5,
        newOrder: "from old to new",
        review: 5,
        reviewOrder: "from old to new",
      },
      flashcardsLearned: 0,
      flashcardsReviewed: 0,
    });
    profilesAndData.data.push({
      folderName: `${name} copy`,
      reset: true,
      data: [],
      reviews: [],
      sessionReviews: [],
      settings: {
        new: 5,
        newOrder: "from old to new",
        review: 5,
        reviewOrder: "from old to new",
      },
    });

    const indexDelete = store.index("by_name");
    const deletion = indexDelete.getKey(profile);
    deletion.onsuccess = function () {
      let id = deletion.result;
      const deleteRequest = store.delete(id);
    };

    const storeFolder = store.add(profilesAndData);
    storeFolder.onsuccess = () =>
      console.log(`${name} folder was added to profile`);
    storeFolder.onerror = () => console.log(storeFolder.error);
    profilesAndData = [];
    currentFolder = name;
  };

  showFolders();
  autoOpenFolders();
  profileAutoselect();
  studyMenu();
}


function showFolders() {
  db = request.result;
  let tr = db.transaction("profiles");
  let store = tr.objectStore("profiles");
  let index = store.index("by_name");
  let search = index.get(profile);

  search.onsuccess = function () {
    folders.style.display = "block";
    folders.innerHTML = search.result.data
      .map((folder) => {
        if (folder.folderName.match(/copy/)) {
          return;
        } else {
          return `<button class="folder-buttons ${folder.folderName}">${folder.folderName}</button>`;
        }
      })
      .join(" ");

    whichFolder.innerHTML = search.result.data
      .map((folder) => {
        if (folder.folderName.match(/copy/)) {
          return;
        } else {
          return `<option value="${folder.folderName}">${folder.folderName}</option>`;
        }
      })
      .join(" ");
  };
}


folders.addEventListener("click", openFolders);
function openFolders(e) {
  db = request.result;
  let tr = db.transaction("profiles");
  let store = tr.objectStore("profiles");
  let index = store.index("by_name");
  let search = index.get(profile);

  search.onsuccess = function () {
    foldersArray = search.result;
    if (e.target.tagName === "BUTTON") {
      // e.target.disabled = true;
      // const buttons = folders.querySelectorAll("button");
      // buttons.forEach(button => {
      //   if (e.target.disabled) {
      //     button.disabled = false;
      //   }
      // });

      deleteFolderBtn.style.display = "inline-block";
      currentFolder = e.target.innerText;
      const index = foldersArray.data
        .map((i) => i.folderName)
        .indexOf(currentFolder);
      console.log(currentFolder);
      openedFolder.innerText = currentFolder;
      openedFolder.style.display = "block";
      flashcardsTotal.style.display = "none";

      if (search.result.data[index].data.length <= 0) {
        dataMessage.innerText = "\nNo data in this folder";
        foldersDataList.style.display = "none";
        showDataBtn.style.display = "none";
        flashcardsTotal.style.display = "none";
      } else {
        dataMessage.innerText = "";
        showDataBtn.style.display = "block";
      }

      console.log(
        "Your folder:",
        e.target.innerText,
        search.result.data[index]
      );
      frontTextarea.style.display = "block";
      backTextarea.style.display = "block";
      createDataBtn.style.display = "block";
    } else {
      return;
    }
  };
  foldersDataList.style.display = "none";
}


function autoOpenFolders() {
  db = request.result;
  let tr = db.transaction("profiles");
  let store = tr.objectStore("profiles");
  let index = store.index("by_name");
  let search = index.get(profile);

  search.onsuccess = function () {
    foldersArray = search.result;
    deleteFolderBtn.style.display = "inline-block";
    const index = foldersArray.data
      .map((i) => i.folderName)
      .indexOf(currentFolder);
    openedFolder.innerText = currentFolder;
    openedFolder.style.display = "block";
    flashcardsTotal.style.display = "none";

    foldersDataList.style.display = "none";
    dataMessage.innerText = "\nNo data in this folder";
    showDataBtn.style.display = "none";
    frontTextarea.style.display = "block";
    backTextarea.style.display = "block";
    createDataBtn.style.display = "block";
  };
}


// delete folder...
deleteFolderBtn.addEventListener("click", deleteFolder);
function deleteFolder() {
  db = request.result;
  let tr = db.transaction("profiles", "readwrite");
  let store = tr.objectStore("profiles");
  let index = store.index("by_name");
  let search = index.get(profile);

  search.onsuccess = function () {
    profilesAndData = search.result;
    currentFolder = openedFolder.innerText;
    const index = profilesAndData.data
      .map((folder) => folder.folderName)
      .indexOf(currentFolder);
    const confirmation = confirm(
      "Are you sure you want to delete " + currentFolder + " folder?"
    );

    if (confirmation) {
      profilesAndData.data.splice(index, 1);
      const indexCopy = profilesAndData.data
        .map((folder) => folder.folderName)
        .indexOf(`${currentFolder} copy`);
      profilesAndData.data.splice(indexCopy, 1);
      const tr2 = db.transaction("profiles", "readwrite");
      const store = tr2.objectStore("profiles");
      const indexDelete = store.index("by_name");
      const deletion = indexDelete.getKey(profile);
      deletion.onsuccess = function () {
        const deleted = store.delete(deletion.result);
        console.log("deleted");
      };
      const addition = store.add(profilesAndData);

      studyMenu();
      showFolders();
      profileAutoselect();
      deleteFolderBtn.style.display = "none";
      folderText.innerText = "";

      frontTextarea.style.display = "none";
      backTextarea.style.display = "none";
      createDataBtn.style.display = "none";
      showDataBtn.style.display = "none";

      foldersDataList.style.display = "none";
      dataMessage.innerText = "";
      openedFolder.innerText = "";
      flashcardsTotal.innerText = "";
      profilesAndData = [];
    } else {
      return;
    }
  };
}


createDataBtn.addEventListener("click", function () {
  createData(frontTextarea.value, backTextarea.value);
  frontTextarea.value = "";
  backTextarea.value = "";
  dataMessage.innerText = "";
  showData();
});
function createData(front, back) {
  db = request.result;
  let tr = db.transaction("profiles", "readwrite");
  let store = tr.objectStore("profiles");
  let index = store.index("by_name");
  let search = index.get(profile);

  if (frontTextarea.value === "" || backTextarea.value === "") {
    alert("Please add values for your flashcards");
    return;
  }

  search.onsuccess = function () {
    foldersArray = search.result;
    const index = foldersArray.data
      .map((i) => i.folderName)
      .indexOf(currentFolder);
    const index2 = foldersArray.data
      .map((i) => i.folderName)
      .indexOf(`${currentFolder} copy`);
    let id = foldersArray.data[index].data.length;

    // if (foldersArray.data[index].data.length > foldersArray.data[index].settings.new) {
    //   foldersArray.data[index].data.push({id: id, front: front, back: back});
    // } else {
    //   foldersArray.data[index].data.push({id: id, front: front, back: back});
    //   foldersArray.data[index2].data.push({id: id, front: front, back: back});
    // }

    foldersArray.data[index].data.push({
      id: id,
      front: front,
      back: back,
      interval: { easy: 3, medium: 2, difficult: 1 },
    });
    foldersArray.data[index2].data.push({
      id: id,
      front: front,
      back: back,
      interval: { easy: 3, medium: 2, difficult: 1 },
    });

    if (
      foldersArray.data[index2].data.length >
      foldersArray.data[index].settings.new
    ) {
      foldersArray.data[index2].data.pop();
    }
    if (
      foldersArray.data[index2].data.length >
      foldersArray.data[index].settings.new -
        foldersArray.data[index].flashcardsLearned
    ) {
      foldersArray.data[index2].data.pop();
    }

    const indexDelete = store.index("by_name");
    const deletion = indexDelete.getKey(profile);
    deletion.onsuccess = function () {
      let id = deletion.result;
      const deleteRequest = store.delete(id);
    };
    const create = store.add(foldersArray);
    create.onsuccess = () =>
      console.log("New data on folder", currentFolder, "on profile", profile);
    create.onerror = () => console.log("Error");
  };
  studyMenu();
  showDataBtn.style.display = "block";
}


showDataBtn.addEventListener("click", showData);
function showData() {
  db = request.result;
  let tr = db.transaction("profiles");
  let store = tr.objectStore("profiles");
  let index = store.index("by_name");
  let search = index.get(profile);

  search.onsuccess = function () {
    foldersArray = search.result;
    const index = foldersArray.data
      .map((i) => i.folderName)
      .indexOf(currentFolder);
    if (search.result.data[index].data.length > 0) {
      foldersDataList.innerHTML = search.result.data[index].data
        .map((datas) => {
          return `
            <div class="data-div">
              <span class="data-span">${datas.front}</span>
              <span class="data-span">${datas.back}</span>
              <button class="${datas.front.split(" ").join("")}" data-id="${
            datas.id
          }" data-edit="edit">Edit</button>
              <button class="${datas.front.split(" ").join("")}" data-id="${
            datas.id
          }" data-del="del">X</button>
            </div>`;
        })
        .join("");
      flashcardsTotal.innerText =
        "Total of flashcards: " + search.result.data[index].data.length;
    } else {
      foldersDataList.innerHTML = "";
      dataMessage.innerText = "\nNo data in this folder";
      showDataBtn.style.display = "none";
      flashcardsTotal.innerText = "";
    }

    const dataDiv = document.querySelectorAll(".data-div");
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
  };
}


showDataBtn.addEventListener("click", () => {
  if (foldersDataList.style.display === "block") {
    foldersDataList.style.display = "none";
  } else {
    foldersDataList.style.display = "block";
  }
  if (flashcardsTotal.style.display === "inline-block") {
    flashcardsTotal.style.display = "none";
  } else {
    flashcardsTotal.style.display = "inline-block";
  }
});


// edit flashcard(data) menu...
function editFlashcardMenu() {
  db = request.result;
  let tr = db.transaction("profiles");
  let store = tr.objectStore("profiles");
  let index = store.index("by_name");
  let search = index.get(profile);

  search.onsuccess = function () {
    profilesAndData = search.result;
    let folderIndex = profilesAndData.data
      .map((folder) => folder.folderName)
      .indexOf(currentFolder);
    let flashcardIndex = profilesAndData.data[folderIndex].data
      .map((flashcard) => flashcard.id)
      .indexOf(Number(currentFlashcard));
    flashcardsModal.style.display = "block";

    const flashcard = document.querySelector(`.${currentClass}`);
    const rect = flashcard.getBoundingClientRect();
    flashcardsModalContent.style.top = `${rect.y - 10}px`;

    flashcardsModalFront.value =
      profilesAndData.data[folderIndex].data[flashcardIndex].front;
    flashcardsModalBack.value =
      profilesAndData.data[folderIndex].data[flashcardIndex].back;
    // close modal...
    flashcardsModalCloseBtn.addEventListener(
      "click",
      () => (flashcardsModal.style.display = "none")
    );
  };
}


// confirm edit...
flashcardsEditConfirmBtn.addEventListener("click", confirmFlashcardEdit);
function confirmFlashcardEdit() {
  db = request.result;
  let tr = db.transaction("profiles");
  let store = tr.objectStore("profiles");
  let index = store.index("by_name");
  let search = index.get(profile);

  search.onsuccess = function () {
    profilesAndData = search.result;
    let folderIndex = profilesAndData.data
      .map((folder) => folder.folderName)
      .indexOf(currentFolder);
    let flashcardIndex = profilesAndData.data[folderIndex].data
      .map((flashcard) => flashcard.id)
      .indexOf(Number(currentFlashcard));
    let folderIndexCopy = profilesAndData.data
      .map((folder) => folder.folderName)
      .indexOf(`${currentFolder} copy`);
    let flashcardIndexCopy = profilesAndData.data[folderIndexCopy].data
      .map((flashcard) => flashcard.id)
      .indexOf(Number(currentFlashcard));

    if (!profilesAndData.data[folderIndexCopy].data[flashcardIndexCopy]) {
      profilesAndData.data[folderIndex].data[flashcardIndex].front =
        flashcardsModalFront.value;
      profilesAndData.data[folderIndex].data[flashcardIndex].back =
        flashcardsModalBack.value;
    } else {
      profilesAndData.data[folderIndex].data[flashcardIndex].front =
        flashcardsModalFront.value;
      profilesAndData.data[folderIndex].data[flashcardIndex].back =
        flashcardsModalBack.value;
      profilesAndData.data[folderIndexCopy].data[flashcardIndexCopy].front =
        flashcardsModalFront.value;
      profilesAndData.data[folderIndexCopy].data[flashcardIndexCopy].back =
        flashcardsModalBack.value;
    }

    if (flashcardsModalFront.value === "" && flashcardsModalBack.value === "") {
      alert("Please add values for your flashcards");
      return;
    }
    if (flashcardsModalFront.value === "") {
      alert("Please add a value for your front flashcard");
      return;
    }
    if (flashcardsModalBack.value === "") {
      alert("Please add a value for your back flashcard");
      return;
    }

    const tr2 = db.transaction("profiles", "readwrite");
    const store = tr2.objectStore("profiles");
    const indexDelete = store.index("by_name");
    const deletion = indexDelete.getKey(profile);
    deletion.onsuccess = function () {
      const deleted = store.delete(deletion.result);
      console.log("deleted");
    };
    const addition = store.add(profilesAndData);

    showData();
    studyMenu();
    flashcardsModal.style.display = "none";
    console.log("Edited successfuly");
    profilesAndData = [];
  };
}


// delete flashcard...
function deleteFlashcard() {
  db = request.result;
  let tr = db.transaction("profiles");
  let store = tr.objectStore("profiles");
  let index = store.index("by_name");
  let search = index.get(profile);

  search.onsuccess = function () {
    profilesAndData = search.result;
    let folderIndex = profilesAndData.data
      .map((folder) => folder.folderName)
      .indexOf(currentFolder);
    let flashcardIndex = profilesAndData.data[folderIndex].data
      .map((flashcard) => flashcard.id)
      .indexOf(Number(currentFlashcard));

    const confirmation = confirm(
      "Are you sure you want to delete this flashcard?"
    );
    if (confirmation) {
      let folderIndexCopy = profilesAndData.data
        .map((folder) => folder.folderName)
        .indexOf(`${currentFolder} copy`);
      let flashcardIndexCopy = profilesAndData.data[folderIndexCopy].data
        .map((flashcard) => flashcard.id)
        .indexOf(Number(currentFlashcard));

      if (!profilesAndData.data[folderIndexCopy].data[flashcardIndexCopy]) {
        profilesAndData.data[folderIndex].data.splice(flashcardIndex, 1);
      } else {
        profilesAndData.data[folderIndex].data.splice(flashcardIndex, 1);
        profilesAndData.data[folderIndexCopy].data.splice(
          flashcardIndexCopy,
          1
        );
      }

      const tr2 = db.transaction("profiles", "readwrite");
      const store = tr2.objectStore("profiles");
      const indexDelete = store.index("by_name");
      const deletion = indexDelete.getKey(profile);
      deletion.onsuccess = function () {
        const deleted = store.delete(deletion.result);
        console.log("deleted");
      };
      const addition = store.add(profilesAndData);
      showData();
      studyMenu();
    } else {
      return;
    }
  };
}


// --------------------- STUDY FEATURES ------------------------ //

function studyMenu() {
  db = request.result;
  let tr = db.transaction("profiles", "readwrite");
  let store = tr.objectStore("profiles");
  let index = store.index("by_name");
  let search = index.get(profile);
  search.onsuccess = function () {
    foldersArrayCopy = search.result;

    toLearnWrapper.innerHTML = foldersArrayCopy.data
      .map((folder) => {
        if (
          folder.folderName.match(/copy/) &&
          folder.data.length === 0 &&
          folder.sessionReviews.length === 0
        ) {
          const arr = [...folder.folderName];
          arr.splice(-5, 5);
          const joined = arr.join("");
          return `<div>
                  <span>${joined}</span>
                  <span class="f-length">${folder.data.length}</span>
                  <span class="r-length">${folder.sessionReviews.length}</span>
                  <button data-practice="${joined}" class="practice-btn" disabled>Practice</button>
                  <button class="personal-session-btn" data-session="${joined}">Personalized session</button>
               </div>`;
        }

        if (
          (folder.folderName.match(/copy/) && folder.data.length > 0) ||
          folder.sessionReviews.length > 0
        ) {
          const arr = [...folder.folderName];
          arr.splice(-5, 5);
          const joined = arr.join("");
          return `<div>
                  <span>${joined}</span>
                  <span class="f-length">${folder.data.length}</span>
                  <span class="r-length">${folder.sessionReviews.length}</span>
                  <button data-practice="${joined}" class="practice-btn">Practice</button>
                  <button class="personal-session-btn" data-session="${joined}">Personalized session</button>
               </div>`;
        }
      })
      .join("");
  };
}


toLearnWrapper.addEventListener("click", function (e) {
  if (e.target.tagName === "BUTTON") {
    if (e.target.dataset.practice) {
      currentFolder = e.target.dataset.practice;
      console.log("You are on practice");
      study();
    }
    if (e.target.dataset.session) {
      currentFolder = e.target.dataset.session;
      console.log("You are on session");
      personalizedStudy();
    }
  }
});

function personalizedStudy() {
  db = request.result;
  let tr = db.transaction("profiles", "readwrite");
  let store = tr.objectStore("profiles");
  let index = store.index("by_name");
  let search = index.get(profile);

  search.onsuccess = function () {
    foldersArray = search.result;
    foldersArrayCopy = search.result;
  };
}


function study() {
  db = request.result;
  let tr = db.transaction("profiles", "readwrite");
  let store = tr.objectStore("profiles");
  let index = store.index("by_name");
  let search = index.get(profile);

  search.onsuccess = function () {
    foldersArray = search.result;
    foldersArrayCopy = structuredClone(foldersArray);

    modal.style.display = "block";
    showAnswerBtn.disabled = false;
    backBtn.disabled = true;
    nextBtn.disabled = true;
    spanBackData.innerText = "";

    const i = foldersArray.data
      .map((folder) => folder.folderName)
      .indexOf(currentFolder);
    const index = foldersArrayCopy.data
      .map((folder) => folder.folderName)
      .indexOf(`${currentFolder} copy`);
    foldersArrayCopy.data[index].data = [];

    // ---------------- Case A ----------------- //
    if (!dayPassed) {
      if (
        foldersArray.data[i].data.length < foldersArrayCopy.data[i].settings.new
      ) {
        for (let j = 0; j < foldersArray.data[i].data.length; j++) {
          if (foldersArray.data[i].data[j].old) {
            continue;
          } else {
            foldersArrayCopy.data[index].data.push(
              foldersArray.data[i].data[j]
            );
          }
        }
        console.log("Case A - first condition");
        arrayToShow.push(...foldersArrayCopy.data[index].data);

        if (foldersArray.data[index].sessionReviews.length > 0) {
          arrayToShow.push(...foldersArrayCopy.data[index].sessionReviews);
        }

        const tr2 = db.transaction("profiles", "readwrite");
        const store = tr2.objectStore("profiles");
        const indexDelete = store.index("by_name");
        const deletion = indexDelete.getKey(profile);
        deletion.onsuccess = function () {
          const deleted = store.delete(deletion.result);
          console.log("deleted");
        };
        const addition = store.add(foldersArrayCopy);
        studyMenu();
      } else {
        if (
          foldersArrayCopy.data[i].settings.new >
          foldersArrayCopy.data[i].flashcardsLearned
        ) {
          for (let j = 0; j < foldersArrayCopy.data[i].settings.new; j++) {
            if (foldersArrayCopy.data[i].data[j].old) {
              continue;
            } else {
              foldersArrayCopy.data[index].data.push(
                foldersArray.data[i].data[j]
              );
            }
          }
          console.log("Case A - second condition");
          arrayToShow.push(...foldersArrayCopy.data[index].data);

          if (foldersArray.data[index].sessionReviews.length > 0) {
            arrayToShow.push(...foldersArrayCopy.data[index].sessionReviews);
          }

          const tr2 = db.transaction("profiles", "readwrite");
          const store = tr2.objectStore("profiles");
          const indexDelete = store.index("by_name");
          const deletion = indexDelete.getKey(profile);
          deletion.onsuccess = function () {
            const deleted = store.delete(deletion.result);
            console.log("deleted");
          };
          const addition = store.add(foldersArrayCopy);
          studyMenu();
        }
      }
    }

    // ---------------- Case B ----------------- //
    // if it is a new day, add new flashcards...
    if (dayPassed) {
      console.log("Case B - Let s study, checktime is true", dayPassed);
      if (
        foldersArray.data[i].data.length < foldersArrayCopy.data[i].settings.new
      ) {
        for (let j = 0; j < foldersArray.data[i].data.length; j++) {
          if (foldersArray.data[i].data[j].old) {
            continue;
          } else {
            foldersArrayCopy.data[index].data.push(
              foldersArray.data[i].data[j]
            );
          }
        }
        console.log("Case B - first condition");
        arrayToShow.push(...foldersArrayCopy.data[index].data);

        if (foldersArray.data[index].sessionReviews.length > 0) {
          arrayToShow.push(...foldersArrayCopy.data[index].sessionReviews);
        }

        const tr2 = db.transaction("profiles", "readwrite");
        const store = tr2.objectStore("profiles");
        const indexDelete = store.index("by_name");
        const deletion = indexDelete.getKey(profile);
        deletion.onsuccess = function () {
          const deleted = store.delete(deletion.result);
          console.log("deleted");
        };
        const addition = store.add(foldersArrayCopy);
        studyMenu();
      } else {
        let onlyNewFlashcards = [];
        for (let j = 0; j < foldersArrayCopy.data[i].data.length; j++) {
          if (foldersArrayCopy.data[i].data[j].old) {
            continue;
          } else {
            onlyNewFlashcards.push(foldersArray.data[i].data[j]);
          }
        }

        if (onlyNewFlashcards.length < foldersArrayCopy.data[i].settings.new) {
          for (let k = 0; k < onlyNewFlashcards.length; k++) {
            foldersArrayCopy.data[index].data.push(onlyNewFlashcards[k]);
          }
        } else {
          if (
            foldersArrayCopy.data[i].settings.new >
            foldersArrayCopy.data[i].flashcardsLearned
          ) {
            for (
              let k = 0;
              k <
              foldersArrayCopy.data[i].settings.new -
                foldersArrayCopy.data[i].flashcardsLearned;
              k++
            ) {
              foldersArrayCopy.data[index].data.push(onlyNewFlashcards[k]);
            }
          }
        }

        console.log("Case B - second condition");
        arrayToShow.push(...foldersArrayCopy.data[index].data);

        if (foldersArray.data[index].sessionReviews.length > 0) {
          arrayToShow.push(...foldersArrayCopy.data[index].sessionReviews);
        }

        const tr2 = db.transaction("profiles", "readwrite");
        const store = tr2.objectStore("profiles");
        const indexDelete = store.index("by_name");
        const deletion = indexDelete.getKey(profile);
        deletion.onsuccess = function () {
          const deleted = store.delete(deletion.result);
          console.log("deleted");
        };
        const addition = store.add(foldersArrayCopy);
        studyMenu();
      }
    } else {
      console.log("Case A - We cannot study, checktime is false", dayPassed);
    }

    // const tr = db.transaction("profiles", "readwrite");
    // const store = tr.objectStore("profiles");
    // const indexDelete = store.index("by_name");
    // const deletion = indexDelete.getKey(profile);
    // deletion.onsuccess = function() {
    //   store.delete(deletion.result);
    // };
    // store.add(foldersArrayCopy);
    // studyMenu();

    console.log(arrayToShow);
    spanFrontData.innerText = arrayToShow[currentIndex].front;
    flashcardsLength.innerText = foldersArrayCopy.data[index].data.length;
    reviewsLength.innerText =
      foldersArrayCopy.data[index].sessionReviews.length;
  };
  reviewsSpacing.style.display = "none";
}


// show answer...
showAnswerBtn.addEventListener("click", showFlashcardAnswer);
function showFlashcardAnswer() {
  db = request.result;
  let tr = db.transaction("profiles", "readwrite");
  let store = tr.objectStore("profiles");
  let index = store.index("by_name");
  let search = index.get(profile);

  search.onsuccess = function () {
    foldersArrayCopy = search.result;
    // const i = foldersArrayCopy.data.map(folder => folder.folderName).indexOf(currentFolder);
    // const index = foldersArrayCopy.data.map(folder => folder.folderName).indexOf(`${currentFolder} copy`);

    showAnswerBtn.disabled = true;
    spanBackData.innerText = arrayToShow[currentIndex].back;

    // if (currentIndex === arrayToShow.length - 1) {
    //   if (foldersArrayCopy.data[index].sessionReviews.length) {
    //     arrayToShow.push(...foldersArrayCopy.data[index].sessionReviews);
    //   } else {
    //     return;
    //   }
    // }

    // if (currentIndex >= arrayToShow.length - 1) {
    //   currentIndex = arrayToShow.length - 1;
    //   nextBtn.disabled = true;
    //   backBtn.disabled = true;
    // } else {
    //   nextBtn.disabled = true;
    // }

    // mark flashcard as old and send it to review...
    // for (let j = 0; j < foldersArrayCopy.data[i].data.length; j++) {
    //   if (arrayToShow[currentIndex].front === foldersArrayCopy.data[i].data[j].front) {
    //     foldersArrayCopy.data[i].data[j].old = "old";
    //   }
    // }
    // for (let j = 0; j < foldersArrayCopy.data[i].data.length; j++) {
    //   if (!foldersArrayCopy.data[i].reviews.includes(arrayToShow[currentIndex])) {
    //     foldersArrayCopy.data[i].reviews.push(arrayToShow[currentIndex]);
    //     foldersArrayCopy.data[index].reviews.push(arrayToShow[currentIndex]);
    //   }
    // }
    // foldersArrayCopy.data[i].flashcardsLearned++;

    // delete flashcard from session...
    // foldersArrayCopy.data[index].data.splice(0, 1);
    // let tr = db.transaction("profiles", "readwrite");
    // let store = tr.objectStore("profiles");
    // let indexDelete = store.index("by_name");
    // const deletion = indexDelete.getKey(profile);
    // deletion.onsuccess = function() {
    //   store.delete(deletion.result);
    // }
    // const addition = store.add(foldersArrayCopy);

    // studyMenu();
    // flashcardsLength.innerText = foldersArrayCopy.data[index].data.length;
    // reviewsLength.innerText = foldersArrayCopy.data[index].sessionReviews.length;
    // if (currentIndex <= 0) {
    //   backBtn.disabled = true;

    reviewsSpacing.style.display = "flex";
    const buttons = reviewsSpacing.querySelectorAll("button");
    buttons.forEach((button) => (button.disabled = false));

    let difficultTime =
      arrayToShow[currentIndex].interval.difficult > 1 ? "days" : "day";

    changeInterval(
      "easy",
      "Easy:",
      "easyCount",
      Math.ceil(arrayToShow[currentIndex].interval.easy),
      "days"
    );

    changeInterval(
      "medium",
      "Medium:",
      "mediumCount",
      Math.ceil(arrayToShow[currentIndex].interval.medium),
      "days"
    );

    changeInterval(
      "difficult",
      "Difficult:",
      "difficultCount",
      Math.ceil(arrayToShow[currentIndex].interval.difficult),
      difficultTime
    );
  };
}


function changeInterval(button, difficulty, span, count, time) {
  const html = `
    ${difficulty} <span class="${span}">${count}</span> ${time}
  `;
  document.querySelector(`.${button}`).innerHTML = html;
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


reviewsSpacing.addEventListener("click", addSpacedRepetition);
function addSpacedRepetition(e) {
  if (e.target.tagName === "BUTTON") {
    let target = Number(e.target.querySelector("span").innerText);
    let currTarget = e.target;
    dry(target, currTarget);
  }
  if (e.target.tagName === "SPAN") {
    let target = Number(e.target.innerText);
    let currTarget = e.target.parentNode;
    dry(target, currTarget);
  }

  function dry(target, currTarget) {
    let currentTarget = currTarget;
    console.log("Current target:", currentTarget);
    const buttons = reviewsSpacing.querySelectorAll("button");
    buttons.forEach((button) => (button.disabled = true));

    db = request.result;
    let tr = db.transaction("profiles", "readwrite");
    let store = tr.objectStore("profiles");
    let index = store.index("by_name");
    let search = index.get(profile);

    search.onsuccess = function () {
      foldersArray = search.result;
      const index = foldersArray.data
        .map((folder) => folder.folderName)
        .indexOf(currentFolder);
      const indexCopy = foldersArray.data
        .map((folder) => folder.folderName)
        .indexOf(`${currentFolder} copy`);

      // mark flashcard as old and send it to review...
      for (let j = 0; j < foldersArray.data[index].data.length; j++) {
        if (
          arrayToShow[currentIndex].front ===
          foldersArray.data[index].data[j].front
        ) {
          foldersArray.data[index].data[j].old = "old";
        }
      }

      if (
        !foldersArray.data[index].reviews
          ?.map((review) => review.front)
          .includes(arrayToShow[currentIndex].front)
      ) {
        foldersArray.data[index].reviews.push(arrayToShow[currentIndex]);
        foldersArray.data[indexCopy].reviews.push(arrayToShow[currentIndex]);
      }

      if (arrayToShow[currentIndex].sent) {
        foldersArray.data[index].flashcardsReviewed++;
      } else {
        foldersArray.data[index].flashcardsLearned++;
      }

      // delete flashcard and review from session...
      foldersArray.data[indexCopy].data.splice(0, 1);
      flashcardsLength.innerText = foldersArray.data[indexCopy].data.length;

      for (
        let i = 0;
        i < foldersArray.data[indexCopy].sessionReviews.length;
        i++
      ) {
        if (
          arrayToShow[currentIndex].front ===
          foldersArray.data[indexCopy].sessionReviews[i].front
        ) {
          foldersArray.data[indexCopy].sessionReviews.splice(i, 1);
        }
      }
      reviewsLength.innerText =
        foldersArray.data[indexCopy].sessionReviews.length;
      console.log(
        "Reviews:",
        foldersArray.data[indexCopy].sessionReviews.length
      );

      // add spaced repetition...
      const sendingDate = new Date("2025-02-28");
      sendingDate.setHours(0, 0, 0, 0);
      const sendingDateMs = sendingDate.getTime();
      const getDates = new Date(sendingDate);
      getDates.setDate(sendingDate.getDate() + target);
      getDates.setHours(0, 0, 0, 0);
      const getDatesMs = getDates.getTime();
      console.log("Sent:", sendingDate, "\nGet:", getDates);

      if (arrayToShow[currentIndex].sent || !arrayToShow[currentIndex].sent) {
        arrayToShow[currentIndex].sent = sendingDateMs;
        arrayToShow[currentIndex].get = getDatesMs;

        if (currTarget.className === "easy") {
          const easyCount = arrayToShow[currentIndex].interval.easy;
          const mediumCount = arrayToShow[currentIndex].interval.medium;
          const difficultCount = arrayToShow[currentIndex].interval.difficult;
          arrayToShow[currentIndex].interval.easy =
            (20 / 100) * easyCount + easyCount;
          arrayToShow[currentIndex].interval.medium =
            (20 / 100) * mediumCount + mediumCount;
          arrayToShow[currentIndex].interval.difficult =
            (20 / 100) * difficultCount + difficultCount;
        }

        if (currTarget.className === "medium") {
          const easyCount = arrayToShow[currentIndex].interval.easy;
          const mediumCount = arrayToShow[currentIndex].interval.medium;
          const difficultCount = arrayToShow[currentIndex].interval.difficult;
          arrayToShow[currentIndex].interval.easy =
            (15 / 100) * easyCount + easyCount;
          arrayToShow[currentIndex].interval.medium =
            (15 / 100) * mediumCount + mediumCount;
          arrayToShow[currentIndex].interval.difficult =
            (15 / 100) * difficultCount + difficultCount;
        }

        if (currTarget.className === "difficult") {
          const easyCount = arrayToShow[currentIndex].interval.easy;
          const mediumCount = arrayToShow[currentIndex].interval.medium;
          const difficultCount = arrayToShow[currentIndex].interval.difficult;
          arrayToShow[currentIndex].interval.easy =
            (10 / 100) * easyCount + easyCount;
          arrayToShow[currentIndex].interval.medium =
            (10 / 100) * mediumCount + mediumCount;
          arrayToShow[currentIndex].interval.difficult =
            (10 / 100) * difficultCount + difficultCount;
        }

        for (let i = 0; i < foldersArray.data[index].reviews.length; i++) {
          if (
            foldersArray.data[index].reviews.map((review) => review.front)[
              i
            ] === arrayToShow[currentIndex].front
          ) {
            foldersArray.data[index].reviews.splice(
              i,
              1,
              arrayToShow[currentIndex]
            );
            foldersArray.data[indexCopy].reviews.splice(
              i,
              1,
              arrayToShow[currentIndex]
            );
          }
        }
      }

      let tr = db.transaction("profiles", "readwrite");
      let store = tr.objectStore("profiles");
      let indexDelete = store.index("by_name");
      const deletion = indexDelete.getKey(profile);
      deletion.onsuccess = function () {
        store.delete(deletion.result);
      };
      store.add(foldersArray);
      studyMenu();

      currentIndex++;
      console.log("Current index:", currentIndex);
      if (!arrayToShow[currentIndex]) {
        spanFrontData.innerText = arrayToShow[currentIndex - 1].front;
        spanBackData.innerText = arrayToShow[currentIndex - 1].back;
      } else {
        spanFrontData.innerText = arrayToShow[currentIndex]?.front;
        spanBackData.innerText = "";
      }

      if (currentIndex > arrayToShow.length - 1) {
        currentIndex = arrayToShow.length - 1;
        showAnswerBtn.disabled = true;
        nextBtn.disabled = true;
        backBtn.disabled = false;
      } else {
        showAnswerBtn.disabled = false;
        nextBtn.disabled = true;
      }
      if (currentIndex <= 0) {
        backBtn.disabled = true;
      }
    };
  }
}

// nextBtn.addEventListener("click", nextFlashcard);
// function nextFlashcard() {
//   db = request.result;
//   let tr = db.transaction("profiles", "readwrite");
//   let store = tr.objectStore("profiles");
//   let index = store.index("by_name");
//   let search = index.get(profile);

//   search.onsuccess = function() {
//     foldersArrayCopy = search.result;
//     const i = foldersArrayCopy.data.map(folder => folder.folderName).indexOf(currentFolder);
//     const index = foldersArrayCopy.data.map(folder => folder.folderName).indexOf(`${currentFolder} copy`);

//     showAnswerBtn.disabled = false;
//     nextBtn.disabled = true;
//     currentIndex++;
//     console.log('Current index:', currentIndex);
//     spanFrontData.innerText = arrayToShow[currentIndex].front;
//     spanBackData.innerText = '';
//     if (currentIndex >= arrayToShow.length - 1) {
//       currentIndex = arrayToShow.length - 1;
//       nextBtn.disabled = true;

//       mark flashcard as old and send it to review...
//       for (let j = 0; j < foldersArrayCopy.data[i].data.length; j++) {
//         if (arrayToShow[currentIndex].front === foldersArrayCopy.data[i].data[j].front) {
//           foldersArrayCopy.data[i].data[j].old = "old";
//         } else {
//           return;
//         }
//       }
//       for (let j = 0; j < foldersArrayCopy.data[i].data.length; j++) {
//         if (!foldersArrayCopy.data[i].reviews.includes(arrayToShow[currentIndex])) {
//           foldersArrayCopy.data[i].reviews.push(arrayToShow[currentIndex]);
//           foldersArrayCopy.data[index].reviews.push(arrayToShow[currentIndex]);
//         }
//       }
//       foldersArrayCopy.data[i].flashcardsLearned++;
//     }

//     reviewsLength.innerText = foldersArrayCopy.data[index].sessionReviews.length;;
//   }
//   reviewsSpacing.style.display = "none";
// }

// next answer...
nextBtn.addEventListener("click", newNextFlashcard);
function newNextFlashcard() {
  showAnswerBtn.disabled = false;
  nextBtn.disabled = false;
  currentIndex++;
  spanFrontData.innerText = arrayToShow[currentIndex].front;
  spanBackData.innerText = "";
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

  search.onsuccess = function () {
    foldersArrayCopy = search.result;
    currentIndex--;
    spanFrontData.innerText = arrayToShow[currentIndex].front;
    spanBackData.innerText = "";
    showAnswerBtn.disabled = false;
    nextBtn.disabled = false;
    if (currentIndex <= 0) {
      backBtn.disabled = true;
    }

    reviewsSpacing.style.display = "none";
    showAnswerBtn.removeEventListener("click", showFlashcardAnswer);
    showAnswerBtn.addEventListener("click", newShowFlashcardAnswer);
  };
}

// close study modal...
closeModalButton.addEventListener("click", () => {
  if (modal.style.display === "block") {
    modal.style.display = "none";
    arrayToShow.splice(0, arrayToShow.length);
    showAnswerBtn.removeEventListener("click", newShowFlashcardAnswer);
    showAnswerBtn.addEventListener("click", showFlashcardAnswer);
    // nextBtn.removeEventListener("click", newNextFlashcard);
    // nextBtn.addEventListener("click", nextFlashcard);
    currentIndex = 0;
  } else {
    modal.style.display = "block";
  }
});

// ----------------------study features end-------------------------- //


// ----------------------- SETTINGS FEATURES ------------------------- //

saveSettingsBtn.addEventListener("click", settings);
function settings() {
  db = request.result;
  let tr = db.transaction("profiles");
  let store = tr.objectStore("profiles");
  let index = store.index("by_name");
  let search = index.get(profile);

  search.onsuccess = function () {
    foldersArray = search.result;
    neuCount = inputForNew.value;
    folderSettings = whichFolder.value;
    console.log(folderSettings);

    foldersArrayCopy = structuredClone(foldersArray);
    let index = foldersArrayCopy.data
      .map((folder) => folder.folderName)
      .indexOf(folderSettings);
    let indexCopy = foldersArrayCopy.data
      .map((folder) => folder.folderName)
      .indexOf(`${folderSettings} copy`);
    foldersArrayCopy.data[indexCopy].data = [];



    // for new flashcards...
    let newFlashcards = [];
    // ---------------------- New flash Case A ---------------------- //
    if (neuCount < foldersArrayCopy.data[index].data.length) {
      console.log('New settings, case A');
      for (let i = 0; i < foldersArrayCopy.data[index].data.length; i++) {
        if (foldersArrayCopy.data[index].data[i].old) {
          continue;
        } else {
          newFlashcards.push(foldersArrayCopy.data[index].data[i]);
        }
      }

      // THE IF IN CASE A
      if (foldersArrayCopy.data[index].flashcardsLearned < neuCount) {
        console.log("The if in case A");
        for (
          let i = 0;
          i < neuCount - foldersArrayCopy.data[index].flashcardsLearned;
          i++
        ) {
          foldersArrayCopy.data[indexCopy].data.push(newFlashcards[i]);
        }
        foldersArrayCopy.data[index].settings.new = neuCount;
        foldersArrayCopy.data[indexCopy].settings.new = neuCount;
      }

      // the old if
      // if ( 
      //   foldersArray.data[indexCopy].data.length > 0 &&
      //   foldersArrayCopy.data[index].flashcardsLearned <= neuCount
      // ) {
      //   console.log("The if in case A");
      //   if (neuCount > foldersArray.data[indexCopy].data.length) {
      //     console.log("The if in case A - 1");
      //     foldersArrayCopy.data[index].settings.new = neuCount;
      //     foldersArrayCopy.data[indexCopy].settings.new = neuCount;
      //     for (
      //       let i = 0;
      //       i < neuCount - foldersArrayCopy.data[index].flashcardsLearned;
      //       i++
      //     ) {
      //       foldersArrayCopy.data[indexCopy].data.push(newFlashcards[i]);
      //       console.log(foldersArrayCopy.data[indexCopy].data);
      //     }
      //   } else {
      //     console.log("The if in case A - 2");
      //     foldersArrayCopy.data[index].settings.new = neuCount;
      //     foldersArrayCopy.data[indexCopy].settings.new = neuCount;
      //     for (let i = 0; i < neuCount; i++) {
      //       foldersArrayCopy.data[indexCopy].data.push(newFlashcards[i]);
      //       console.log(foldersArrayCopy.data[indexCopy].data);
      //     }
      //   }
      // }

      // THE ELSE IN CASE A
      if (foldersArrayCopy.data[index].flashcardsLearned >= neuCount) {
        console.log("The else in case A");
        foldersArrayCopy.data[index].settings.new = neuCount;
        foldersArrayCopy.data[indexCopy].settings.new = neuCount;
      }

      // the old else
      // if (
      //   foldersArray.data[indexCopy].data.length > 0 &&
      //   foldersArrayCopy.data[index].flashcardsLearned > neuCount
      // ) {
      //   console.log("The else in case A");
      //   foldersArrayCopy.data[index].settings.new = neuCount;
      //   foldersArrayCopy.data[indexCopy].settings.new = neuCount;
      //   inputForNew.value = neuCount;
      // }

      // const tr = db.transaction("profiles", "readwrite");
      // const store = tr.objectStore("profiles");
      // const indexDelete = store.index("by_name");
      // const deletion = indexDelete.getKey(profile);
      // deletion.onsuccess = function () {
      //   const deleted = store.delete(deletion.result);
      // };
      // store.add(foldersArrayCopy);
      // studyMenu();
    }

    // ----------------------- New flash Case B ---------------------- //
    if (neuCount >= foldersArrayCopy.data[index].data.length) {
      console.log('New settings, case B');
      for (let i = 0; i < foldersArrayCopy.data[index].data.length; i++) {
        if (foldersArrayCopy.data[index].data[i].old) {
          continue;
        } else {
          newFlashcards.push(foldersArrayCopy.data[index].data[i]);
        }
      }

      for (
        let i = 0;
        i < foldersArrayCopy.data[index].data.length -
          foldersArrayCopy.data[index].flashcardsLearned;
        i++
      ) {
        foldersArrayCopy.data[indexCopy].data.push(newFlashcards[i]);
      }

      foldersArrayCopy.data[index].settings.new = neuCount;
      foldersArrayCopy.data[indexCopy].settings.new = neuCount;
    }

      // new
      // if (foldersArrayCopy.data[index].flashcardsLearned < neuCount) {
      //   console.log("The if in case B");

        // if (
        //   neuCount - foldersArrayCopy.data[index].flashcardsLearned <
        //   foldersArrayCopy.data[index].data.length
        // ) {
        //   console.log("The if in case B - 1");
        //   for (
        //     let i = 0;
        //     i < neuCount - foldersArrayCopy.data[index].flashcardsLearned;
        //     i++
        //   ) {
        //     foldersArrayCopy.data[indexCopy].data.push(newFlashcards[i]);
        //   }
        // }

        // if (
        //   neuCount - foldersArrayCopy.data[index].flashcardsLearned >=
        //   foldersArrayCopy.data[index].data.length
        // ) {
        //   console.log("The if in case B - 2");
        //   for (
          //   let i = 0;
          //   i < foldersArrayCopy.data[index].data.length;
          //   i++
          // ) {
          //   foldersArrayCopy.data[indexCopy].data.push(newFlashcards[i]);
          // }
        // }
       
        // foldersArrayCopy.data[index].settings.new = neuCount;
        // foldersArrayCopy.data[indexCopy].settings.new = neuCount;
      // }

      // else {
      //   console.log("The else in case B");
      //   foldersArrayCopy.data[index].settings.new = neuCount;
      //   foldersArrayCopy.data[indexCopy].settings.new = neuCount;
      // }

      // old
      // for (
      //   let i = 0;
      //   i <
      //   foldersArrayCopy.data[index].data.length -
      //     foldersArrayCopy.data[index].flashcardsLearned;
      //   i++
      // ) {
      //   foldersArrayCopy.data[indexCopy].data.push(newFlashcards[i]);
      //   if (
      //     foldersArrayCopy.data[indexCopy].data.length > newFlashcards.length
      //   ) {
      //     foldersArrayCopy.data[indexCopy].data.pop();
      //   }
      // }

      // foldersArrayCopy.data[index].settings.new = neuCount;
      // foldersArrayCopy.data[indexCopy].settings.new = neuCount;

      // const tr2 = db.transaction("profiles", "readwrite");
      // const store = tr2.objectStore("profiles");
      // const indexDelete = store.index("by_name");
      // const deletion = indexDelete.getKey(profile);
      // deletion.onsuccess = function () {
      //   const deleted = store.delete(deletion.result);
      // };
      // store.add(foldersArrayCopy);
      // studyMenu();
    // }




    //  for reviews...
    foldersArrayCopy.data[indexCopy].sessionReviews = [];
    let reviews = [];

    for (
      let i = 0;
      i < foldersArrayCopy.data[indexCopy].reviews?.length;
      i++
    ) {
      let msToElapse =
        foldersArrayCopy.data[indexCopy].reviews[i].get -
        foldersArrayCopy.data[indexCopy].reviews[i].sent;
      let hoursToElapse = Math.floor(msToElapse / 1000 / 60 / 60);
      let sending = foldersArrayCopy.data[indexCopy].reviews[i].sent;
      let elapsedMs = Date.now() - sending;
      let elapsedHours = Math.floor(elapsedMs / 1000 / 60 / 60);

      if (elapsedHours >= hoursToElapse) {
        if (
          !reviews.map(review => review.front)
          .includes(foldersArrayCopy.data[indexCopy]
            .reviews.map(review => review.front)[i])
        ) {
          reviews.push(foldersArrayCopy.data[indexCopy].reviews[i]);
        } else {
          continue;
        }
      }
    }
    console.log("Reviews:", reviews);  

    //  -------------------------- REVIEWS CASE A --------------------------- //
    if (inputForReview.value < reviews.length) {
      console.log("Settings, reviews: Case A");

      if (
        foldersArrayCopy.data[index].flashcardsReviewed < inputForReview.value
      ) {
        console.log("if");
        for (
          let j = 0; j < inputForReview.value -
          foldersArrayCopy.data[index].flashcardsReviewed; j++
        ) {

          if (!foldersArrayCopy.data[indexCopy]
            .sessionReviews.map(review => review?.front)
            .includes(reviews.map(review => review?.front)[j])
          ) {
            foldersArrayCopy.data[indexCopy].sessionReviews.push(reviews[j]);
            console.log("Reviews session:", foldersArrayCopy.data[indexCopy].sessionReviews);
          } else {
            console.log("Reviews session:", foldersArrayCopy.data[indexCopy].sessionReviews);
            continue;
          }

        }
        foldersArrayCopy.data[index].settings.review = inputForReview.value;
        foldersArrayCopy.data[indexCopy].settings.review = inputForReview.value;
      } 
      
      if (foldersArrayCopy.data[index].flashcardsReviewed >= inputForReview.value) {
        console.log("else or equal")
        foldersArrayCopy.data[index].settings.review = inputForReview.value;
        foldersArrayCopy.data[indexCopy].settings.review = inputForReview.value;
      }
      
        // if (foldersArrayCopy.data[index].flashcardsReviewed === inputForReview.value) {
        //   console.log("equal");
        //   foldersArrayCopy.data[index].settings.review = inputForReview.value;
        //   foldersArrayCopy.data[indexCopy].settings.review = inputForReview.value;

        // for (let j = 0; j < inputForReview.value; j++) {
        //   if (!foldersArrayCopy.data[indexCopy]
        //     .sessionReviews.map(review => review?.front)
        //     .includes(reviews.map(review => review?.front)[j])
        //   ) {
        //     foldersArrayCopy.data[indexCopy].sessionReviews.push(reviews[j]);
        //     console.log("Reviews session:", foldersArrayCopy.data[indexCopy].sessionReviews);
        //   } else {
        //     console.log("Reviews session:", foldersArrayCopy.data[indexCopy].sessionReviews);
        //     continue;
        //   }
        // }
        // }
    
    } 

      
    
    //  --------------------------- REVIEWS CASE B -------------------------- //
    if (inputForReview.value >= reviews.length) {
      console.log("Settings, reviews: Case B");
      if (foldersArrayCopy.data[index].flashcardsReviewed < inputForReview.value) {
        console.log("if");

        console.log(
          'Reviews', reviews.length, 'Reviewed',
           foldersArrayCopy.data[index].flashcardsReviewed
        );

        if (
          inputForReview.value -
          foldersArrayCopy.data[index].flashcardsReviewed <=
          reviews.length
        ) {
          for (
            let j = 0;
            j < inputForReview.value -
            foldersArrayCopy.data[index].flashcardsReviewed;
            j++) {
  
            if (!foldersArrayCopy.data[indexCopy]
              .sessionReviews.map(review => review?.front)
              .includes(reviews.map(review => review?.front)[j])
            ) {
              foldersArrayCopy.data[indexCopy].sessionReviews.push(reviews[j]);
            } else {
              continue;
            }
          }
        }

        if (
          inputForReview.value -
          foldersArrayCopy.data[index].flashcardsReviewed >
          reviews.length
        ) {
          for (
            let j = 0;
            j < reviews.length;
            j++) {
  
            if (!foldersArrayCopy.data[indexCopy]
              .sessionReviews.map(review => review?.front)
              .includes(reviews.map(review => review?.front)[j])
            ) {
              foldersArrayCopy.data[indexCopy].sessionReviews.push(reviews[j]);
            } else {
              continue;
            }
          }
        }

        foldersArrayCopy.data[index].settings.review = inputForReview.value;
        foldersArrayCopy.data[indexCopy].settings.review = inputForReview.value;
      } 

      // else if (foldersArrayCopy.data[index].flashcardsReviewed === inputForReview.value) {
      //   console.log("else if");
      //   for (let j = 0; j < inputForReview.value; j++) {
      //     if (!foldersArrayCopy.data[indexCopy]
      //       .sessionReviews.map(review => review?.front)
      //       .includes(reviews.map(review => review?.front)[j])
      //     ) {
      //       foldersArrayCopy.data[indexCopy].sessionReviews.push(reviews[j]);
      //     } else {
      //       continue;
      //     }
      //   }
      //   foldersArrayCopy.data[index].settings.review = inputForReview.value;
      //   foldersArrayCopy.data[indexCopy].settings.review = inputForReview.value;
      // }
      
      else {
        console.log("else");
        foldersArrayCopy.data[index].settings.review = inputForReview.value;
        foldersArrayCopy.data[indexCopy].settings.review = inputForReview.value;
      }
    }   
        

    


    




    // if (
    //   inputForReview.value < foldersArrayCopy.data[indexCopy].reviews.length
    // ) {
    //   console.log("Reviews: case A");
    //   for (
    //     let i = 0;
    //     i < foldersArrayCopy.data[indexCopy].reviews?.length;
    //     i++
    //   ) {
    //     let msToElapse =
    //       foldersArrayCopy.data[indexCopy].reviews[i].get -
    //       foldersArrayCopy.data[indexCopy].reviews[i].sent;
    //     let hoursToElapse = Math.floor(msToElapse / 1000 / 60 / 60);
    //     let sending = foldersArrayCopy.data[indexCopy].reviews[i].sent;
    //     let elapsedMs = Date.now() - sending;
    //     let elapsedHours = Math.floor(elapsedMs / 1000 / 60 / 60);

    //     if (elapsedHours >= hoursToElapse) {
    //       console.log("Settings reviews:", elapsedHours, hoursToElapse);
    //       if (
    //         !reviews
    //           ?.map(review => review.front)
    //           .includes(foldersArrayCopy.data[indexCopy].reviews[i].front)
    //       ) {
    //         reviews.push(foldersArrayCopy.data[indexCopy].reviews[i]);
    //       } else {
    //         continue;
    //       }
    //     }
    //   }

    //   if (
    //     foldersArrayCopy.data[index].flashcardsReviewed < inputForReview.value
    //   ) {
    //     for (
    //       let j = 0;
    //       j <
    //       inputForReview.value -
    //         foldersArrayCopy.data[index].flashcardsReviewed;
    //       j++
    //     ) {
    //       foldersArrayCopy.data[indexCopy].sessionReviews.push(reviews[j]);
    //     }
    //     foldersArrayCopy.data[index].settings.review = inputForReview.value;
    //     foldersArrayCopy.data[indexCopy].settings.review = inputForReview.value;
    //     inputForReview.value = foldersArrayCopy.data[index].settings.review;
    //     console.log(
    //       "Session:",
    //       foldersArrayCopy.data[indexCopy].sessionReviews
    //     );
    //   } else {
    //     console.log("else");
    //     foldersArrayCopy.data[index].settings.review = inputForReview.value;
    //     foldersArrayCopy.data[indexCopy].settings.review = inputForReview.value;
    //     inputForReview.value = foldersArrayCopy.data[index].settings.review;
    //   }

      // const tr = db.transaction("profiles", "readwrite");
      // const store = tr.objectStore("profiles");
      // const indexDelete = store.index("by_name");
      // const deletion = indexDelete.getKey(profile);
      // deletion.onsuccess = function () {
      //   store.delete(deletion.result);
      // };
      // store.add(foldersArrayCopy);
      // studyMenu();
    // }

    //  --------------------------- REVIEWS CASE B -------------------------- //
    // if (
    //   inputForReview.value >= foldersArrayCopy.data[indexCopy].reviews.length
    // ) {
    //   console.log("Reviews: case B");
    //   for (
    //     let i = 0;
    //     i < foldersArrayCopy.data[indexCopy].reviews?.length;
    //     i++
    //   ) {
    //     let msToElapse =
    //       foldersArrayCopy.data[indexCopy].reviews[i].get -
    //       foldersArrayCopy.data[indexCopy].reviews[i].sent;
    //     let hoursToElapse = Math.floor(msToElapse / 1000 / 60 / 60);
    //     let sending = foldersArrayCopy.data[indexCopy].reviews[i].sent;
    //     let elapsedMs = Date.now() - sending;
    //     let elapsedHours = Math.floor(elapsedMs / 1000 / 60 / 60);

    //     if (elapsedHours >= hoursToElapse) {
    //       console.log("Settings reviews:", elapsedHours, hoursToElapse);
    //       if (
    //         !reviews
    //           ?.map((review) => review.front)
    //           .includes(foldersArrayCopy.data[indexCopy].reviews[i].front)
    //       ) {
    //         reviews.push(foldersArrayCopy.data[indexCopy].reviews[i]);
    //       } else {
    //         continue;
    //       }
    //     }
    //   }

    //   for (
    //     let j = 0;
    //     j <
    //     foldersArrayCopy.data[index].reviews.length -
    //       foldersArrayCopy.data[index].flashcardsReviewed;
    //     j++
    //   ) {
    //     foldersArrayCopy.data[indexCopy].sessionReviews.push(reviews[j]);
    //     if (
    //       foldersArrayCopy.data[indexCopy].sessionReviews.length >
    //       reviews.length
    //     ) {
    //       foldersArrayCopy.data[indexCopy].sessionReviews.pop();
    //     }
    //   }
    //   foldersArrayCopy.data[index].settings.review = inputForReview.value;
    //   foldersArrayCopy.data[indexCopy].settings.review = inputForReview.value;
    //   inputForReview.value = foldersArrayCopy.data[index].settings.review;
    //   console.log("Session:", foldersArrayCopy.data[indexCopy].sessionReviews);

      // const tr = db.transaction("profiles", "readwrite");
      // const store = tr.objectStore("profiles");
      // const indexDelete = store.index("by_name");
      // const deletion = indexDelete.getKey(profile);
      // deletion.onsuccess = function () {
      //   store.delete(deletion.result);
      // };
      // store.add(foldersArrayCopy);
      // studyMenu();
   // }

    const tr = db.transaction("profiles", "readwrite");
    const store = tr.objectStore("profiles");
    const indexDelete = store.index("by_name");
    const deletion = indexDelete.getKey(profile);
    deletion.onsuccess = function() {
      store.delete(deletion.result);
    };
    store.add(foldersArrayCopy);
    studyMenu();

  };
}


function autoFolderSettings() {
  db = request.result;
  let tr = db.transaction("profiles");
  let store = tr.objectStore("profiles");
  let index = store.index("by_name");
  let search = index.get(profile);

  search.onsuccess = function () {
    foldersArray = search.result;
    let index = foldersArray.data
      .map((folder) => folder.folderName)
      .indexOf(whichFolder.value);
    inputForNew.value = foldersArray.data[index].settings.new;
    inputForReview.value = foldersArray.data[index].settings.review;
  };
}
whichFolder.addEventListener("change", selectFolderSettings);
function selectFolderSettings(e) {
  folderSettings = e.target.value;
  db = request.result;
  let tr = db.transaction("profiles");
  let store = tr.objectStore("profiles");
  let index = store.index("by_name");
  let search = index.get(profile);

  search.onsuccess = function () {
    foldersArray = search.result;
    let index = foldersArray.data
      .map((folder) => folder.folderName)
      .indexOf(folderSettings);
    inputForNew.value = foldersArray.data[index].settings.new;
    inputForReview.value = foldersArray.data[index].settings.review;
  };
}
