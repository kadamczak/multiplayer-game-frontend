import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import HomePage from "../Pages/HomePage/HomePage";
import LoginPage from "../Pages/LoginPage/LoginPage";
import UserItemsPage from "../Pages/UserItemsPage/UserItemsPage";
import RegisterPage from "../Pages/RegisterPage/RegisterPage";
import ProtectedRoute from "./ProtectedRoute";
import ProfilePage from "../Pages/ProfilePage/ProfilePage";
import ItemsPage from "../Pages/ItemsPage/ItemsPage";
import OffersPage from "../Pages/OffersPage/OffersPage";
import AccountActionsPage from "../Pages/AccountActionsPage/AccountActionsPage";
import ForgotPasswordPage from "../Pages/ForgotPasswordPage/ForgotPasswordPage";
import ResetPasswordPage from "../Pages/ResetPasswordPage/ResetPasswordPage";
import ConfirmEmailPage from "../Pages/ConfirmEmailPage/ConfirmEmailPage";
import FriendsPage from "../Pages/FriendsPage/FriendsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "", element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "reset-password", element: <ResetPasswordPage /> },
      { path: "confirm-email", element: <ConfirmEmailPage/>},

      { path: "my-items",
        element: (
          <ProtectedRoute>
            <UserItemsPage />
          </ProtectedRoute>
        )
      },

      { path: "marketplace",
        element: (
          <ProtectedRoute>
            <OffersPage />
          </ProtectedRoute>
        )
      },

      { path: "friends",
        element: (
          <ProtectedRoute>
            <FriendsPage />
          </ProtectedRoute>
        )
      },

      // { path: "items",
      //   element: (
      //     <ProtectedRoute>
      //       <ItemsPage />
      //     </ProtectedRoute>
      //   )
      // },

      { path: "profile",
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        )
      },

      { path: "account-actions",
        element: (
          <ProtectedRoute>
            <AccountActionsPage />
          </ProtectedRoute>
        )
      },
    ],
  },
]);