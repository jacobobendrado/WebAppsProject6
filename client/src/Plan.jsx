import { useState } from 'react'
import {Helmet} from "react-helmet";
import React, { useEffect } from 'react';
function Plan() {
    const [count, setCount] = useState(0)

    if(!localStorage.getItem('token')){
        window.location.href = "/login";
    }

  return (
    <>
        <Helmet>
           <link href="src/Plan.css" rel="stylesheet" type="text/css" />
           <script src="public/termProject.js" defer></script>
           <script src="plansModal.js" defer></script>
            <script src="notesModal.js" defer></script>
           <link rel="stylesheet" href="//code.jquery.com/ui/1.13.2/themes/base/jquery-ui.css"/>
           <script src="https://code.jquery.com/jquery-3.6.0.js" defer></script>
           <script src="https://code.jquery.com/ui/1.13.2/jquery-ui.js" defer></script>
           <script src="https://code.jquery.com/jquery-3.7.1.js" integrity="sha256-eKhayi8LEQwp4NKxN+CfCh+3qOVUtJn3QNZ0TciWLP4=" crossorigin="anonymous" defer></script>
        </Helmet>

        <div id="plans-modal" class="modal">
        <div class="modal-content">
        <span class="close" id='close-plans-modal'>&times;</span>
            <h3 id="medium-header-1">Plan Manager</h3>
                <form id="submit-form">
                    <input type="radio" name="button-plan" value=""></input>
                    <label></label><br></br>
                    <button id="submit-plan" name="submit-plan"> View </button>
                </form>  
            </div>
        </div>

        <div id="notes-modal" class="modal">
            <div class="modal-content">
                <span class="close" id='close-notes-modal'>&times;</span>
                <h3 id="medium-header-2">Notes Manager</h3>
                <div class="form-group">
                    <textarea class="form-control" id="addTxt" rows="8" cols="60"></textarea>
                </div>
                <button id="addBtn"> Add Note </button>
                <div id="notes" class="row container-fluid"></div>
            </div>
        </div>

        <div class="header">
            <div class="name-version">
                <h1 id="name">Academic Planning Enviroment <span id="version">Version 1</span></h1>
            </div>
            <div class="student-info">
                <div id="header-left">
                </div>
                <div id="header-right">
                </div>
            </div>
            <div class="buttons">
                <button class="tr" id="manage-plans">Plan Manager</button>
                <button class="tr" id="save">Save</button>
                <button class="tr" id="logout">Log out</button>
            </div>
        </div>
        <div id="left-main" class="top">
            <div id="upper-left" class="upper left">
                <div id="title">
                    <p class="title">Requirements</p>
                </div>
                <div id="accordion-wrapper"></div>
            </div>
            <div id="lower-left" class="lower left">
                    <h3 id="medium-header-2">Home Pages</h3>
                    <div class="buttons horizontal-buttons">
                        <button class="tr" id="add-year">Add Year</button>
                        <button class="tr" id="remove-year">Remove Year</button>
                        <button class="tr" id="manage-notes">Notes</button>
                    </div>
            </div>
        </div>
        <div id="right-main" class="top">
            <div id="grid-container" class="upper right"></div>
            <div id="lower-right" class="lower right">
                <div id="lower-right-title">
                    <p class="title">Find Course</p>
                </div>
                <div class="course-search">
                    <p id="course-search">Course Search: </p>
                    <form>
                        <input class="search" name="courseID" id="search-bar" type="text" placeholder="Form: CS-0000"></input>
                    </form>
                    <br></br>
                    <div id="search-table">
                        <table>
                            <thead id="search-table-head">
                                <tr>
                                    <th>Course ID</th>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Credits</th>
                                    <th>Planned?</th>
                                </tr>
                            </thead>
                            <tbody id="search-table-data"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </>
  )
}

export default Plan
