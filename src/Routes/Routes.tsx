import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import HomePage from "../Pages/HomePage/HomePage";
import LoginPage from "../Pages/LoginPage/LoginPage";
import UserItemsPage from "../Pages/UserItemsPage/UserItemsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "", element: <HomePage /> },
      { path: "my-items", element: <UserItemsPage /> },
      { path: "login", element: <LoginPage /> },
    ],
  },
]);
