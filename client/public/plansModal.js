var plansmodal = document.getElementById("plans-modal");

var plansbtn = document.getElementById("manage-plans");

var plansspan = document.getElementById("close-plans-modal");

plansbtn.onclick = function() {
  plansmodal.style.display = "block";
  
}

plansspan.onclick = function() {
  plansmodal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == plansmodal) {
    plansmodal.style.display = "none";
  }
}