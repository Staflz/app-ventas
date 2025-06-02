import {createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./Components/LoginPage/Login";
import HomePage from "./Components/HomePage/HomePage";
import Register from "./Components/RegisterPage/Register";
import Dashboard from "./Components/Dashboard/Dashboard";

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
    },
    {
      path: "/dashboard",
      element: <div><Dashboard/></div>
    }
  ])

  return (
    <div>
      <RouterProvider router={ router}/>
    </div>
  )
}

export default App
