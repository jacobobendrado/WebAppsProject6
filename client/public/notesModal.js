var notesmodal = document.getElementById("notes-modal");

var notesbtn = document.getElementById("manage-notes");

var notesspan = document.getElementById("close-notes-modal");

notesbtn.onclick = function() {
    notesmodal.style.display = "block";
    getNotes();
}

notesspan.onclick = function() {
    notesmodal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == notesmodal) {
    notesmodal.style.display = "none";
  }
}


let addBtn = document.getElementById("addBtn");
addBtn.addEventListener("click", function (e) {
  let addTxt = document.getElementById("addTxt");
  let notes = localStorage.getItem("notes");
  if (notes == null) {
    notesObj = { notes: [] };
  } else {
    notesObj = JSON.parse(notes);
  }

  if (userIsFaculty()) {
    if (!notesObj.facultyNotes) {
      notesObj.facultyNotes = [];
    }
    notesObj.facultyNotes.push(addTxt.value);
  } else {
    notesObj.push(addTxt.value);
  }

  localStorage.setItem("notes", JSON.stringify(notesObj));
  addTxt.value = "";
  showNotes();
});

function showNotes() {
  let notes = localStorage.getItem("notes");
  if (notes == null) {
    notesObj = [];
  } else {
    notesObj = JSON.parse(notes);
  }

  let html = "";
  
  if (userIsFaculty()) {
    html += `<h3>Faculty Notes:</h3>`;
    notesObj.facultyNotes.forEach(function(element, index) {
      html += `
        <div class="noteCard my-2 mx-2 card" style="width: 18rem;">
          <div class="card-body">
            <h5 class="card-title">Note ${index + 1}</h5>
            <p class="card-text">${element}</p>
            <button class="btn btn-primary" onclick="deleteNote(${index})">Delete Note</button>
          </div>
        </div>`;
    });
    
    html += `<h3>Student Notes:</h3>`;
    notesObj.studentNotes.forEach(function(element, index) {
      html += `
        <div class="noteCard my-2 mx-2 card" style="width: 18rem;">
          <div class="card-body">
            <h5 class="card-title">Note ${index + 1}</h5>
            <p class="card-text">${element}</p>
          </div>
        </div>`;
    });
  } else {
    notesObj.forEach(function(element, index) {
      html += `
        <div class="noteCard my-2 mx-2 card" style="width: 18rem;">
          <div class="card-body">
            <h5 class="card-title">Note ${index + 1}</h5>
            <p class="card-text">${element}</p>
            <button class="btn btn-primary" onclick="deleteNote(${index})">Delete Note</button>
          </div>
        </div>`;
    });
  }

  let notesElm = document.getElementById("notes");
  if (notesObj.length != 0) {
    notesElm.innerHTML = html;
  } else {
    notesElm.innerHTML = `Nothing to show! Use "Add a Note" section above to add notes.`;
  }
}


function deleteNote(index) {
  let notes = localStorage.getItem("notes");
  if (notes == null) {
    notesObj = { notes: [] };
  } else {
    notesObj = JSON.parse(notes);
  }

  if (userIsFaculty()) {
    if (notesObj.facultyNotes) {
      notesObj.facultyNotes.splice(index, 1);
    }
  } else {
      notesObj.splice(index, 1);
  }

  localStorage.setItem("notes", JSON.stringify(notesObj));

  showNotes();
}



function getNotes() {
  $.ajax({
    url: "http://localhost:8081/getnotes", 
    method: "GET", 
    data: {username: urlParameters.get('username')},
    headers: {"Authorization": localStorage.getItem('token')},
    dataType:"json"
  }).done(function(notesData) {
    if (userIsFaculty()) {
      localStorage.setItem("notes", JSON.stringify({
        facultyNotes: notesData.facultyNotes,
        studentNotes: notesData.studentNotes
      }));
    } else {
      localStorage.setItem("notes", JSON.stringify(notesData.notes));
    }
    showNotes();
  });
}

function userIsFaculty() {
  const token = localStorage.getItem('token');
  if (token) {
    const tokenData = atob(token.split('.')[1]);
    const data = JSON.parse(tokenData);
    return data.faculty.isFaculty;
  }
  return false;
}
