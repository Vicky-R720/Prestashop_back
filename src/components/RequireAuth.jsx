import { Navigate, useLocation } from "react-router-dom";

export default function RequireAuth({ children }) {
  const isAuthed = localStorage.getItem("auth") === "1";
  const location = useLocation();

  if (!isAuthed) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}