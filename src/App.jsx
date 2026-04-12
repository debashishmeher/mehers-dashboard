import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

// 🔁 Hooks
import { useScrollToTop } from './hooks/useScrollToTop';

// 🌐 Layouts
import Main from './components/Main/Main';

// 🌐 Pages
import Card from './components/Card/Card';
import Enquary from './components/Enquary/Enquary';
import Reviews from './components/Reviews/Reviews';


// 🌐 Account
import Login from './components/Account/Login';
import SignupPage from './components/Account/SignupPage';
import ForgotPasswordPage from './components/Account/ForgotPasswordPage';
import ResetPasswordPage from './components/Account/ResetPasswordPage';
import Me from './components/Account/Me';

// 🌐 Common
import ErrorHandler from './components/Common/ErrorHandler';
import { UserProvider, useUser } from './Context/ContextApt';
import Loading from './components/Common/Loading';

import SetDiscountPage from './components/Coupon/SetDiscountPage';
import RegistrationInfo from './components/WhatsApp/RegistrationInfo';
import Dashboard from './components/Dashboard/Dashboard';
import WhatsAppConnect from './components/WhatsApp/WhatsAppConnect';
import Template from './components/WhatsApp/Template';

// 🔁 Scroll Wrapper
function ScrollToTop() {
  useScrollToTop();
  return <Outlet />;
}

function App() {
  const { userData, loading } = useUser();

  if (loading) return <Loading />;

  const isAuthenticated = !!userData?.user;


  // Protected Route Wrapper Component
  const ProtectedRoute = ({ children, roles }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (roles && !roles.includes(role)) {
      return <Navigate to="/" replace />;
    }

    return children;
  };

  const router = createBrowserRouter([
    // Public Routes
    {
      path: '/login',
      element: !isAuthenticated ? <Login /> : <Navigate to="/" replace />
    },
    {
      path: '/signup',
      element: !isAuthenticated ? <SignupPage /> : <Navigate to="/" replace />
    },
    { path: '/forgot', element: <ForgotPasswordPage /> },
    { path: '/resetpassword/:token', element: <ResetPasswordPage /> },

    // Protected Routes
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <Main />
        </ProtectedRoute>
      ),
      children: [
        {
          element: <ScrollToTop />,
          children: [
            // Common routes
            { index: true, element: <Dashboard /> },
            { path: 'me', element: <Me /> },
            { path: 'whatsapp/connect', element: <WhatsAppConnect /> },
            { path: 'whatsapp/registration', element: <RegistrationInfo /> },
            { path: 'whatsapp/templates', element: <Template /> },

          ]
        }
      ]
    },

    // Error Handling
    { path: '*', element: <ErrorHandler /> }
  ]);

  return <RouterProvider router={router} />;
}

export default App;
