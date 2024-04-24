import { useState } from 'react'

function RightMain() {
  const [count, setCount] = useState(0)

  return (
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
  )
}

export default RightMain