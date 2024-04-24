import { useState } from 'react'
import './index.css'

function Header() {
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
                <a href="php/logout.php">
                    <button class="tr" id="logout">Log out</button>
                </a>
            </div>
        </div>
    </>
  )
}

export default Header
