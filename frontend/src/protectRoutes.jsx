import { Navigate } from "react-router-dom";
import Login from "./login";

const ProtectedUser = ({ children }) => {
  const storedRole = localStorage.getItem("user");

  if (!storedRole) {
    return <Navigate to= "/login" replace />;
  }

  return children;
};
    
export default ProtectedUser;