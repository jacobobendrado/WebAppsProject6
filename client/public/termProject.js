class Plan {
    constructor(planName, catalogYear, majors, minors, studentName, currentYear, currentTerm) {
        this.planName = planName;
        this.catalogYear = catalogYear;
        this.majors = majors;
        this.minors = minors;
        this.studentName = studentName;
        this.currentSemester = {year: currentYear, term: currentTerm.toLowerCase()};
        this.courses = [];
    }
    addCourse(newCourse, index = this.courses.length) {
        this.courses[index] = newCourse;
    }
    removeCourse(courseId) {
        for(let i = 0; i < this.courses.length; i++){
            if(this.courses[i].courseDesignator == courseId) {
                return this.courses.splice(i, 1)[0];
            }
        }
    }
    checkHistory(year, term) {
        if (year < this.currentSemester.year) {
            return true;
        }
        else if (year == this.currentSemester.year) {
            if (this.currentSemester.term == "fall") {
                return true;
            }
            else if (this.currentSemester.term == "summer" && term == "fall") {
                return false;
            }
            else if (this.currentSemester.term == "summer") {
                return true;
            }
            else if (this.currentSemester.term == "spring" && term == "spring") {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }
}

class Years {
    constructor(input = 4) {
        let years = [];
        let indexYear = 0;
        if (typeof(input) == "number") {
            let numYears = input;
            for (let i = 0; i < numYears; i++) {
                years[i] = new Year();
            }
        }
        else if (input instanceof Plan) {
            indexYear = input.catalogYear;
            input.courses.forEach(function(course) {
                let currYear = course.year;
                if (course.term != "fall") {
                    currYear--;
                }
                if (currYear < indexYear) {
                    indexYear = currYear;
                }
            });
            input.courses.forEach(function(course, i) {
                let index = course.year - indexYear;
                if (course.term != "fall") {
                    index--;
                }
                if (!years[index]) {
                    years[index] = new Year();
                }
                years[index][course.term].addCourse(course);
            });
        }
        this.years = years;
        this.firstYear = indexYear;
    }
    calculateHours() {
        let hours = 0;
        this.years.forEach(function(year, i) {
            hours += year.fall.hours + year.spring.hours + year.summer.hours;
        });
        return hours;
    }
}

class Year {
    constructor(fall = new Term(), spring = new Term(), summer = new Term()) {
        this.fall = fall;
        this.spring = spring;
        this.summer = summer;
    } 
}

class Term {
    constructor(courses = []) {
        this.courses = courses;
        this.hours = this.#calculateHours(courses);
    }
    addCourse(newCourse, index = this.courses.length) {
        this.courses[index] = newCourse;
        this.hours = this.#calculateHours();
    }
    removeCourse(index) {
        return this.courses.splice(index,1)[0];
    }
    #calculateHours(courses = this.courses) {
        let hours = 0;
        for (let i = 0; i < courses.length; i++) {
            hours += courses[i].credits;
        }
        return hours;
    }
}

class Course {
    constructor(term, year, credits, courseDesignator, courseName, description) {
        this.term = term;
        this.year = year;
        this.credits = credits;
        this.courseDesignator = courseDesignator;
        this.courseName = courseName;
        this.description = description;
    }
}
let myPlan;
let schedule;
let courses = {};
let gpa;
let planInfo = {planId: null, username: null};
const urlParameters = new URLSearchParams(window.location.search);
if (urlParameters.get('username')) {
    planInfo.username = urlParameters.get('username');
}
if (urlParameters.get('planname')) {
    planInfo.planId = urlParameters.get('planname');
} let loadData = function() {
    $.ajax({ url: "/user", method: "GET", data: {username: "asteele"}, dataType: "json"}).done(function(userData) {
        if (!planInfo.planId) {
            planInfo.planId = userData.default_plan;
        }
        $.ajax({url: "/plan", method: "GET", data: "test", dataType: "json"}).done(function(planData) {
            myPlan = new Plan(planData.plan_name, planData.catalog_year, planData.majors, planData.minors, userData.name, planData.currYear, planData.currTerm);
            $.ajax({url: "/catalog", method: "GET", data: {yr: "2021"}, dataType: "json"}).done(function(catalogData) {
                for (let c_id in catalogData) {
                    let credits = parseFloat(catalogData[c_id].credits);
                    let name = catalogData[c_id].name;
                    let description = catalogData[c_id].description;
                    courses[c_id] = new Course(undefined, undefined, credits, c_id, name, description);
                }

                for (let i in planData.courses) {
                    let course = planData.courses[i];
                    let c_id = course.course_id;
                    myPlan.addCourse(courses[c_id]);
                    courses[c_id].term = course.term.toLowerCase();
                    courses[c_id].year = course.year;
                }
                schedule = new Years(myPlan);

                document.getElementById("accordion-wrapper").innerHTML = '<div id="accordion"></div>';

                let accord = document.getElementById("accordion");
                let getMajor = function(majorName) {
                    let userInfo = {major: majorName};
                    $.ajax({url: "", method: "GET", data: userInfo, dataType: "json"}).done(function(data) {
                        for (let category in data) {
                            if (majorName == "Undeclared") {
                                accord.innerHTML += '<h3>' + category + '</h3>\
                                <div id="accordion-' + category  + "-" + majorName + '" class="accordion-tab"></div>';
                            }
                            else {
                                accord.innerHTML += '<h3>' + majorName + " " + category + '</h3>\
                                <div id="accordion-' + category  + "-" + majorName + '" class="accordion-tab"></div>';
                            }
                            let sectionHTML = document.getElementById("accordion-" + category + "-" + majorName);
                            for (let section in data[category]) {
                                if (section != "null") {
                                    sectionHTML.innerHTML += '<p class="accordian-section">' + section + '</p>';
                                }
                                data[category][section].courses.forEach(function(c_id) {
                                    sectionHTML.innerHTML += '<p id="' + c_id + '" class="accoridan-data' + (courses[c_id].term ? ' taken"' : ' draggable" draggable="true"') + '><span class="course-id">' + 
                                        c_id + '</span> ' + courses[c_id].courseName + '</p>';


                
                                });
                                
                            }
                
                        }
                        setTimeout(function() {
                            makeAccord();
                        });
                        
                    });
                }
                let getMinor = function(minorName) {
                    let userInfo = {minor: minorName};
                    $.ajax({url: "/", method: "GET", data: userInfo, dataType: "json"}).done(function(data) {
                        accord.innerHTML += '<h3>' + minorName + ' Minor</h3>\
                        <div id="accordion-' + minorName + '" class="accordion-tab"></div>';
                        let sectionHTML = document.getElementById("accordion-" + minorName);
                        for (let section in data) {
                            if (section != "null") {
                                sectionHTML.innerHTML += '<p class="accordian-section">' + section + '</p>';
                            }
                            data[section].courses.forEach(function(c_id) {
                                sectionHTML.innerHTML += '<p id="' + c_id + '" class="accoridan-data' + (courses[c_id].term ? ' taken' : ' draggable" draggable="true"') + '"><span class="course-id">' + 
                                            c_id + '</span> ' + courses[c_id].courseName + '</p>';
            
                            });
                            
                        }
                        setTimeout(function() {
                            makeAccord();
                            setupDragAndDrop();
                            removeClass();
                        });
                        
                    });
                }
                accord.innerHTML = "";
                getMajor("Undeclared");
                myPlan.majors.forEach(function(major) {
                    getMajor(major);
                });
                myPlan.minors.forEach(function(minor) {
                    getMinor(minor);
                });

                render();
            });

        });
        gpa = userData.gpa.toFixed(2);
    }).fail(function(error) {
        console.log("There was an error: " + error.responseText);
    });
}
loadData();

let courseSearchText = document.getElementById("search-bar");

let render = function() {
    let upperRight = document.getElementById("grid-container");
    let upperRightData = '\
    <div class="sub-box-header">\
        <a id="sub-box-header-middle"><span class="user-info">Academic Plan:</span> ' + myPlan.planName + '</a>\
        <div class="sub-box-header-right">\
            <a><span class="user-info">GPA:</span> ' + gpa + '</a>&nbsp;\
            <a id="total-hours"><span class="user-info">Total Hours:</span><span id="total-hours-var"> ' + schedule.calculateHours() + ' hours</span></a>&nbsp;\
        </div>\
    </div>';

    schedule.years.forEach(function(year, i) {
        for (let term in year) {
            let thisYear = schedule.firstYear + i;
            if (term != "fall") {
                thisYear++;
            }
            let historyString = (myPlan.checkHistory(thisYear, term) ? " history" : "");
            upperRightData += '<div class="sub-box' + historyString + '">\n'
            + '<h5>' + term.charAt(0).toUpperCase() + term.slice(1) + ' ' + thisYear + '</h5>\n';
            if (year[term].hours > 0) {
                upperRightData += '<p id="hours' + term.toLowerCase() + thisYear + '" class="hours">Hours: ' + year[term].hours + '</p>\n';
            }
            year[term].courses.forEach(function(course, i) {
                let removeButton = (historyString == " history" ? '' : '<span id="' + course.courseDesignator + '" class="remove-class">&times;</span>');
                upperRightData += '<p id="planned-course-' + course.courseDesignator + '" class="planned-course"><span class="course-id">' + course.courseDesignator + '</span><span class="course-name"> ' + course.courseName + '</span>' + removeButton + '</p>\n';
            });
            upperRightData += '</div>\n';
        }
    });
    upperRight.innerHTML = upperRightData;

    let headerLeft = document.getElementById("header-left");
    headerLeft.innerHTML = '\
    <p class="identifiers"><span>Student: </span>' + myPlan.studentName.charAt(0).toUpperCase() + myPlan.studentName.slice(1) + '</p>\
    <p class="identifiers"><span>Catalog: </span>' + String(myPlan.catalogYear) + '</p>\
    ';
    let headerRight = document.getElementById("header-right");
    headerRight.innerHTML = '\
    <p class="identifiers"><span>Major: </span>' + printList(myPlan.majors) + '</p>\
    <p class="identifiers"><span>Minor: </span>' + printList(myPlan.minors) + '</p>';

    let searchTable = document.getElementById("search-table-data");
    searchTable.innerHTML = "";
    for (c_id in courses) {
        let newRow = '<tr id="table-' + c_id + '" class="table-data' + (courses[c_id].term ? ' taken"' : ' draggable" draggable="true"') + '>';
        newRow += "<td id=\"table-" + courses[c_id].courseDesignator + "\">" + courses[c_id].courseDesignator + "</td>\n";
        newRow += "<td>" + courses[c_id].courseName + "</td>\n";
        newRow += "<td>" + courses[c_id].description + "</td>\n";
        newRow += "<td>" + courses[c_id].credits + "</td>\n";
        if (courses[c_id].term) {
            newRow += "<td>Yes</td>\n";
        }
        else {
            newRow += "<td>No</td>\n";
        }
        newRow += "</tr>";
        searchTable.innerHTML += newRow;
    }


};



courseSearchText.addEventListener("input", function(event) {
    let found = false;
    let value = event.target.value.toLowerCase();
    for (c_id in courses) {
        let creds = "c:" + courses[c_id].credits;
        let planned = courses[c_id].term ? "p:yes" : "p:no";
        let element = document.getElementById("table-" + c_id);
        if (c_id.toLowerCase().includes(value) || courses[c_id].courseName.toLowerCase().includes(value)
          || creds.includes(value) || planned.includes(value)) {
            element.hidden = false;
            found = true;
        }
        else {
            element.hidden = true;
        }
    }
    if (!found) {
        courseSearchText.style.backgroundColor = "#FAA0A0";
    }
    else {
        courseSearchText.style.backgroundColor = "#D1D5DB"
    }
    
    
});


let makeAccord = function() {
    $(function() {
        $( "#accordion" ).accordion({
            collapsible: false,
            heightStyle: "fill",
            icons: icons
        });
        
        var icons = {
        header: "iconClosed",   
        activeHeader: "iconOpen"
        };
        
    } );
};

let printList = function(list) {
    let out = list[0] ?? "";
    for (let i = 1; i < list.length; i++) {
        out += ", " + list[i];
    }
    return out;
};

function removeClass(box) {
    const rmButtons = document.querySelectorAll(".remove-class");
    for (let rmButton of rmButtons) {
        rmButton.addEventListener('click', function(e) {
            const class_accordian = document.querySelector("#" + rmButton.id);
            const class_table = document.querySelector("#table-" + rmButton.id);
            console.log(class_accordian);
            console.log(class_table);

            class_accordian.classList.add('draggable');
            class_accordian.setAttribute('draggable', true);
            class_accordian.classList.remove('taken');

            class_table.classList.add('draggable');
            class_table.setAttribute('draggable', true);
            class_table.classList.remove('taken');
            
            const course_plan = document.querySelector("#planned-course-" + rmButton.id);
            let box = rmButton.parentElement.parentElement;
            course_plan.remove();
            myPlan.removeCourse(rmButton.id);
            schedule = new Years(myPlan);
            console.log(rmButton);
            
            console.log(box);
            //console.log(rmButton.parentNode.parentNode);
            class_accordian.addEventListener('dragstart', handleDragStart);
            class_table.addEventListener('dragstart', handleDragStart);
            updateHours(box, 'out');
        });
    }
}
function handleDragStart(e) {
    e.dataTransfer.setData("text/plain", e.target.id);
}
function setupDragAndDrop() {
    const boxes = document.querySelectorAll(".sub-box");
    console.log(boxes);
    const draggable_data_accoridan = document.querySelectorAll(".accoridan-data.draggable");
    const draggable_data_table = document.querySelectorAll(".table-data.draggable");
    for (let elem of draggable_data_accoridan) {
        elem.addEventListener('dragstart', handleDragStart);
    }

    for (let elem of draggable_data_table) {
        elem.addEventListener('dragstart', handleDragStart);
    }

    for (let box of boxes) {
        if(!box.classList.contains('history')) {
            box.addEventListener("dragover", function(e) {
                e.preventDefault();
            });
        
        
            box.addEventListener("drop", function(e) {
                e.preventDefault();
                let selectedId = e.dataTransfer.getData("text");
                let selected = '';
                let fromTable = false;

                selected = document.getElementById(selectedId);

                let courseId = '';
                let courseName = '';
                let credits = '';
                if (selected) {
                    let clonedElement = selected.cloneNode(true);
                    let spanElement = '';
                    if(selectedId.includes('table-')){
                        spanElement = clonedElement.querySelectorAll('td');

                        courseId = spanElement[0].textContent.trim();

                        courseName = " " + spanElement[1].textContent.trim();

                        credits = courses[courseId].credits;

                        spanElement = document.createElement('span');

                        spanElement.textContent = courseId;
                        spanElement.classList.add('course-id');

                        const class_accordian_id = selected.id.replace('table-', '');
                        const class_accordian = document.querySelector("#" + class_accordian_id);
                        if (class_accordian) {
                            class_accordian.classList.remove('draggable');
                            class_accordian.classList.add('taken');
                            class_accordian.setAttribute('draggable', false);
                        }

                    }
                    else{
                        spanElement = clonedElement.querySelector('span');
                        courseId = spanElement.textContent.trim();
                        courseName = clonedElement.textContent.trim().replace(courseId, '');
                        credits = courses[selectedId].credits;

                        const class_table = document.querySelector("#table-" + selected.id);
                        class_table.classList.remove('draggable');
                        class_table.classList.add('taken');
                        class_table.setAttribute('draggable', false);
                    }
                    selected.classList.remove('draggable');
                    selected.classList.add('taken');
                    selected.setAttribute('draggable', false);
                    
                    let newElement = document.createElement('p');
                    newElement.id = "planned-course-" + courseId;
                    newElement.classList.add('planned-course');
                    newElement.appendChild(spanElement);
                    spanNameElement = document.createElement('span');
                    spanNameElement.appendChild(document.createTextNode(courseName));

                    let spanRemoveElement = document.createElement('span');
                    spanRemoveElement.classList.add('remove-class');
                    spanRemoveElement.id = courseId;
                    spanRemoveElement.appendChild(document.createTextNode("×"));

                    newElement.appendChild(spanRemoveElement);
                    newElement.appendChild(spanNameElement);

                    let termYearText = box.querySelector('h5').textContent.trim();
                    let [termUser, year] = termYearText.split(' ');
                    termUser = termUser.toLowerCase();

                    myPlan.addCourse(new Course(termUser, year, credits, courseId, courseName));

                    schedule = new Years(myPlan);
                    updateHours(box, 'in', credits);
                    box.appendChild(newElement);
                    
                    removeClass(box);
                } 
                else {
                    console.error("Element with id", selectedId, "not found");
                }
            });
        }
        
    }
}

function updateHours(box, inOrOut, credHour = 0){
    console.log(box);
    let termYearText = box.querySelector('h5').textContent.trim();
    let [termUser, year] = termYearText.split(' ');
    termUser = termUser.toLowerCase();
    let initHours = 0;
    if(termUser == 'fall'){
        console.log(schedule.years[year - schedule.firstYear][termUser]);
        initHours = schedule.years[year - schedule.firstYear][termUser].hours - credHour;
    }
    else{
        console.log(schedule.years[year - schedule.firstYear - 1][termUser]);
        initHours = schedule.years[year - schedule.firstYear - 1][termUser].hours - credHour;
    }

    let totalHoursElement = document.getElementById("total-hours-var");
    totalHoursElement.innerHTML = " " + schedule.calculateHours() + ' hours';

    let hoursElement = document.getElementById('hours' + termUser + year);

    // Check if there are any courses in the current box
    let coursesPresent = box.querySelectorAll('.planned-course').length > 0;
    console.log(box.querySelectorAll('.planned-course'));
    if (coursesPresent == false && inOrOut == 'out' && hoursElement) {
        // If no courses present, remove the hours tag
        hoursElement.remove();
        exit;
    }
    if(termUser == "spring" || termUser == "summer"){
        if (initHours == 0){
            let hourElement = document.createElement('p');
            let idStr = "hours" + termUser + year;
            hourElement.appendChild(document.createTextNode("Hours: " + schedule.years[year - schedule.firstYear - 1][termUser].hours));
            hourElement.classList.add("hours");
            hourElement.id = idStr;
            box.append(hourElement);
        }
        else{
            hoursElement.textContent = 'Hours: ' + schedule.years[year - schedule.firstYear - 1][termUser].hours;
        }
    }
    else{
        if(initHours == 0){
            let hourElement = document.createElement('p');
            let idStr = "hours" + termUser + year;
            hourElement.appendChild(document.createTextNode("Hours: " + schedule.years[year - schedule.firstYear][termUser].hours));
            hourElement.classList.add("hours");
            hourElement.id = idStr;
            box.append(hourElement);
        }
        else{
            hoursElement.textContent = 'Hours: ' + schedule.years[year - schedule.firstYear][termUser].hours;
        }
    }
}