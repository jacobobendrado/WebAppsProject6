import { useState } from 'react'
import './App.css'
import Header from './Header.jsx'
import RightMain from './RightMain.jsx'
import LeftMain from './LeftMain.jsx'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Header />
      <LeftMain /> 
      <RightMain />
    </>
  )
}

export default App
