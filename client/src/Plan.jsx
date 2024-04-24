import { useState } from 'react'
import './Plan.css'
function Plan() {
  const [count, setCount] = useState(0)

  return (
    <>
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
                <button class="tr" id="manage">Plan Manager</button>
                <button class="tr" id="save">Save</button>
                <a href="#">
                    <button class="tr" id="logout">Log out</button>
                </a>
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
                    <a href="http://judah.cedarville.edu/" class="home-pages" id="course-home">Course Page</a>
                    <a href="http://judah.cedarville.edu/~bender/cs3220.html" class="home-pages">Jacob Bender</a>
                    <a href="http://judah.cedarville.edu/~ceppich/cs3220.html" class="home-pages">Christian Eppich</a>
                    <a href="http://judah.cedarville.edu/~asteele/cs3220.html" class="home-pages">Alex Steele</a>
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
