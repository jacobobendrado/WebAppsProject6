import { useState } from 'react'
import './App.css'
import Header from './Header.jsx'
import UpperLeft from './UpperLeft.jsx'
import UpperRight from './UpperRight.jsx'
import LowerLeft from './LowerLeft.jsx'
import LowerRight from './LowerRight.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Header />
      <UpperLeft />
      <UpperRight />
      <LowerLeft />
      <LowerRight />
    </>
  )
}

export default App
