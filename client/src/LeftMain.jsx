import { useState } from 'react'

function LeftMain() {
  const [count, setCount] = useState(0)

  return (
    <>
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
    </>
  )
}

export default LeftMain