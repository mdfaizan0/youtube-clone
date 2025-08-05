import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { lazy, Suspense } from 'react'
import { GuideProvider } from './utils/GuideContext.jsx'
import VideoPlayer from './pages/VideoPlayer.jsx'
import { Provider } from "react-redux"
import appStore from './utils/appStore.js'

const Home = lazy(() => import('./pages/Home.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const SignUp = lazy(() => import('./pages/SignUp.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))

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
      { path: "/player/:id", element: <VideoPlayer /> }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <Provider store={appStore}>
    <Suspense fallback={<div>Loading...</div>}>
      <GuideProvider>
        <RouterProvider router={appRouter} />
      </GuideProvider>
    </Suspense>
  </Provider>
)