import { Link, useLocation } from "react-router-dom";

function NotFound() {
  // using useLocation by React Router, getting the pathname, getting the state value and setting the message
  const location = useLocation();
  const path = location.state?.from || window.location.pathname;
  const status = location.state?.status || 404;
  const message = location.state?.message || "The page you're looking for doesn’t exist.";

  return (
    <div className="notfound-container">
      <h1>{status}</h1>
      <p>Oops! Path: ({path}) — {message}</p>
      <Link to="/" className="notfound-btn">Go Back Home</Link>
    </div>
  );
}

export default NotFound;