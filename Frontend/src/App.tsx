import {createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./Components/LoginPage/Login";
import HomePage from "./Components/HomePage/HomePage";
import Register from "./Components/RegisterPage/Register";
import Dashboard from "./Components/Dashboard/Dashboard";
import ResetPassword from "./Components/ResetPasswordPage/ResetPassword";
import NotFound from "./Components/common/NotFound";
import ProtectedRoute from "./Components/common/ProtectedRoute";

function App() {

  const router = createBrowserRouter([
    {
      path: "/",
      element: <HomePage />
    },
    {
      path: "/login",
      element: <Login />
    },
    {
      path: "/register",
      element: <Register />
    },
    {
      path: "/dashboard",
      element: (
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      )
    },
    {
      path: "/reset-password",
      element: <ResetPassword />
    },
    {
      path: "*",
      element: <NotFound />
    }
  ])

  return (
    <div>
      <RouterProvider router={ router}/>
    </div>
  )
}

export default App
