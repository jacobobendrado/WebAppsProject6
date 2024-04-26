// Get the modal
var notesmodal = document.getElementById("notes-modal");

// Get the button that opens the modal
var notesbtn = document.getElementById("manage-notes");

// Get the <span> element that closes the modal
var notesspan = document.getElementById("close-notes-modal");

// When the user clicks on the button, open the modal
notesbtn.onclick = function() {
    notesmodal.style.display = "block";
    showNotes();
}

// When the user clicks on <span> (x), close the modal
notesspan.onclick = function() {
    notesmodal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == notesmodal) {
    notesmodal.style.display = "none";
  }
}


console.log("Welcome to notes app. This is app.js");


// If user adds a note, add it to the localStorage
/*
let addBtn = document.getElementById("addBtn");
addBtn.addEventListener("click", function (e) {
  let addTxt = document.getElementById("addTxt");
  let notes = localStorage.getItem("notes");
  if (notes == null) {
    notesObj = [];
  } else {
    notesObj = JSON.parse(notes);
  }
  notesObj.push(addTxt.value);
  localStorage.setItem("notes", JSON.stringify(notesObj));
  addTxt.value = "";
  showNotes();
});
*/

// Function to show elements from localStorage
function showNotes() {
  //let notes = localStorage.getItem("notes");
  let notes = '{      "JAC_notes":[{"username":"ceppich", "note":"who is this sapple"},{"username":"asteele", "note":"lalalalala"},        {"username":"ceppich", "note":"who is sus"}      ]    }'

  console.log(notes);

  notes = null;

  if (notes == null) {
    notesObj = [];
  } else {
    notesObj = JSON.parse(notes);
  }
  let html = "";

  notes.forEach(function (element, index) {
    html += `
            <div class="noteCard my-2 mx-2 card" style="width: 18rem">
                    <div class="card-body">
                        <h5 class="card-title">Note ${index + 1}</h5>
                        <p class="card-text"> ${element}</p>
                        <button class="btn btn-primary">Delete Note</button>
                    </div>
                </div>`;
  });
  let notesElm = document.getElementById("notes");
  if (notesObj.length != 0) {
    notesElm.innerHTML = html;
  } else {
    notesElm.innerHTML = `Nothing to show! Use "Add a Note" section above to add notes.`;
  }
}

// Function to delete a note
function deleteNote(index) {
  //   console.log("I am deleting", index);

  let notes = localStorage.getItem("notes");
  if (notes == null) {
    notesObj = [];
  } else {
    notesObj = JSON.parse(notes);
  }

  notesObj.splice(index, 1);
  localStorage.setItem("notes", JSON.stringify(notesObj));
  showNotes();
}