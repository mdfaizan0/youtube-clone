import { Outlet } from "react-router-dom"
import Header from "./components/Header"

// Only rendering Header and Outlet
function App() {
  return (
    <div className="app-wrapper">
      <Header />
      <Outlet />
    </div>
  )
}

export default App