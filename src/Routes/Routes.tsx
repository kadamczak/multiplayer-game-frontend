import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import HomePage from "../Pages/HomePage/HomePage";
import LoginPage from "../Pages/Identity/LoginPage/LoginPage";
import UserItemsPage from "../Pages/Items/UserItemsPage/UserItemsPage";
import RegisterPage from "../Pages/Identity/RegisterPage/RegisterPage";
import ProtectedRoute from "./ProtectedRoute";
import ProfilePage from "../Pages/Account/ProfilePage/ProfilePage";
import OffersPage from "../Pages/Items/OffersPage/OffersPage";
import AccountActionsPage from "../Pages/Account/AccountActionsPage/AccountActionsPage";
import ForgotPasswordPage from "../Pages/Account/ForgotPasswordPage/ForgotPasswordPage";
import ResetPasswordPage from "../Pages/Account/ResetPasswordPage/ResetPasswordPage";
import ConfirmEmailPage from "../Pages/Account/ConfirmEmailPage/ConfirmEmailPage";
import FriendsPage from "../Pages/Friends/FriendsPage/FriendsPage";
import SentFriendRequestsPage from "../Pages/Friends/SentFriendRequestsPage/SentFriendRequestsPage";

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

      { path: "friends/requests/sent",
        element: (
          <ProtectedRoute>
            <SentFriendRequestsPage />
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