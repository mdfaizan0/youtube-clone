import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { lazy, Suspense } from 'react'
import { GuideProvider } from './utils/GuideContext.jsx'
import { Provider } from "react-redux"
import appStore from './utils/appStore.js'
import { ConfirmProvider } from "material-ui-confirm"
import { Toaster } from "react-hot-toast"
import "./utils/style.css"

const Home = lazy(() => import('./pages/Home.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const SignUp = lazy(() => import('./pages/SignUp.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))
const VideoPlayer = lazy(() => import('./pages/VideoPlayer.jsx'))
const ManageChannel = lazy(() => import('./pages/ManageChannel.jsx'))
const PublicChannel = lazy(() => import('./pages/PublicChannel.jsx'))
const CreateChannel = lazy(() => import('./pages/CreateChannel.jsx'))

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFound />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <SignUp /> },
      { path: "/404", element: <NotFound /> },
      { path: "/watch/:videoId", element: <VideoPlayer /> },
      { path: "/channel/create", element: <CreateChannel /> },
      { path: "/channel/manage", element: <ManageChannel /> },
      { path: "/channel/:channelId", element: <PublicChannel /> },
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <Provider store={appStore}>
    <ConfirmProvider
      defaultOptions={{
        dialogProps: {
          PaperProps: {
            sx: {
              backgroundColor: "#212121",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "16px",
              zIndex: 20000
            }
          }
        },
        titleProps: {
          sx: {
            fontWeight: "bold"
          }
        },
        contentProps: {
          sx: {
            color: "#929292 !important",
            fontSize: "14px"
          }
        },
        confirmationButtonProps: {
          sx: {
            backgroundColor: "transparent",
            color: "#1891faff",
            borderRadius: "20px",
            fontWeight: 600,
            textTransform: "capitalize",
            fontSize: "14px",
            "&:hover": {
              backgroundColor: "#3ea5ff41"
            }
          }
        },
        cancellationButtonProps: {
          sx: {
            backgroundColor: "transparent",
            color: "#1891faff",
            borderRadius: "20px",
            fontWeight: 600,
            textTransform: "capitalize",
            fontSize: "14px",
            "&:hover": {
              backgroundColor: "#3ea5ff41"
            }
          }
        }
      }}
    >
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          success: {
            duration: 4000,
            style: {
              backgroundColor: '#212121',
              border: "1px solid #00ED09",
              padding: "12px 16px",
              fontWeight: "500",
              fontSize: "16px",
              color: "white"
            },
          },
          error: {
            duration: 4000,
            style: {
              backgroundColor: '#212121',
              border: "1px solid #FF0000",
              padding: "12px 16px",
              fontWeight: "500",
              fontSize: "16px",
              color: "white"
            },
          },
          style: {
            backgroundColor: '#212121',
            border: "1px solid #F2FF00",
            padding: "12px 16px",
            fontWeight: "500",
            fontSize: "16px",
            color: "white"
          },
          duration: 4000,
        }}
      />
      <Suspense fallback={<div className="loading-container"><div className="loading-msg"></div></div>}>
        <GuideProvider>
          <RouterProvider router={appRouter} />
        </GuideProvider>
      </Suspense>
    </ConfirmProvider>
  </Provider>
)