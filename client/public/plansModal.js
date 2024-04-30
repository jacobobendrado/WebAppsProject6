var plansmodal = document.getElementById("plans-modal");

var plansbtn = document.getElementById("manage-plans");

var plansspan = document.getElementById("close-plans-modal");

plansbtn.onclick = function() {
  plansmodal.style.display = "block";
  getPlans();
}

plansspan.onclick = function() {
  plansmodal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == plansmodal) {
    plansmodal.style.display = "none";
  }
}


function getPlans() {
  $.ajax({
    url: "http://localhost:8081/getplans", 
    method: "GET", 
    data: {username: urlParameters.get('username')},
    headers: {"Authorization": localStorage.getItem('token')},
    dataType:"json"
  }).done(function(plansData) {
      localStorage.setItem("studentplans", JSON.stringify({
        plans: plansData.studentplans,
      }));
      showPlans();
  });
}

function showPlans() {
  let plans = localStorage.getItem("studentplans");
  
  if (plans == null) {
    plansObj = [];
  } else {
    plansObj = JSON.parse(plans);
  }

  let html = "";
  
  plansObj.plans.forEach(function(element, index) {
      html += `
      <input type="radio" name="button-plan" value="`+ element + `">`+ element +`</input>
      <br></br>
      `;
  });

  html += `<button id="submit-plan" name="submit-plan"> View </button>`;

  let plansElm = document.getElementById("plan-form");
  if (plansObj.length != 0) {
    plansElm.innerHTML = html;
  } else {
    plansElm.innerHTML = `Bruh you have zero plans you biddness major.`;
  }
}
