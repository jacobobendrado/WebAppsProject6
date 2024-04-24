import { useState } from 'react'
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, createBrowserRouter, RouterProvider } from "react-router-dom";

import Plan from './Plan.jsx'
import Login from './Login.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Plan />
  },
  {
    path: "/login",
    element: <Login />
  }
])

function App() {
  const [count, setCount] = useState(0)

  return (
    <RouterProvider router = {router}/>
  )
}

export default App
