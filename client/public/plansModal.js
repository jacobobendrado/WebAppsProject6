// Get the modal
var plansmodal = document.getElementById("plans-modal");

// Get the button that opens the modal
var plansbtn = document.getElementById("manage-plans");

// Get the <span> element that closes the modal
var plansspan = document.getElementById("close-plans-modal");

// When the user clicks on the button, open the modal
plansbtn.onclick = function() {
  plansmodal.style.display = "block";
  
}

// When the user clicks on <span> (x), close the modal
plansspan.onclick = function() {
  plansmodal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == plansmodal) {
    plansmodal.style.display = "none";
  }
}