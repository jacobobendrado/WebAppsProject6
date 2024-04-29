
let table = document.getElementById("student-table-data");

let token = localStorage.getItem("token");
if (!token) {
    window.location.href = "/login";
}
let tokenData = atob(token.split('.')[1]);
let data = JSON.parse(tokenData);

if (!data.faculty.isFaculty) {
    window.location.href = "/";
}

data.faculty.students.forEach(function(student) {
    let row = document.createElement("tr");
    let name = document.createElement("td");
    name.classList.add("student-table-data-name");
    name.appendChild(document.createTextNode(student));
    row.appendChild(name);
    let linkData = document.createElement("td");
    linkData.classList.add("student-table-data-link");
    let link = document.createElement("a");
    link.href = "/?username=" + student;
    link.appendChild(document.createTextNode("See default plan"));
    linkData.appendChild(link);
    row.appendChild(linkData);
    table.appendChild(row);
});