import {createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./Components/LoginPage/Login";
import HomePage from "./Components/HomePage/HomePage";
import Register from "./Components/RegisterPage/Register";
function App() {

  const router = createBrowserRouter([
    {
      path: "/",
      element: <div><HomePage/></div>
    },
    {
      path: "/login",
      element: <div><Login/></div>
    },
    {
      path: "/register",
      element: <div><Register/></div>
    }
  ])

  return (
    <div>
      <RouterProvider router={ router}/>
    </div>
  )
}

export default App
