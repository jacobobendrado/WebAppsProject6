import { useState } from 'react'
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, createBrowserRouter, RouterProvider } from "react-router-dom";

import Plan from './Plan.jsx'
import Login from './Login.jsx'
import Faculty from './Faculty.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Plan />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/faculty",
    element: <Faculty />
  }
])

function App() {
  const [count, setCount] = useState(0)

  return (
    <RouterProvider router = {router}/>
  )
}

export default App
