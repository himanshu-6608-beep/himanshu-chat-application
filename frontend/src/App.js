import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Chat from "./pages/chat";
import Contacts from "./pages/contacts";
import Settings from "./pages/settings";
import { useEffect } from "react";
import ProtectedUser from "./protectRoutes";
function App() {
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);
  const user =JSON.parse(localStorage.getItem("user"));


  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={
            user ? (
              <Navigate to="/messages" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />


        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />



        <Route
          path="/messages"
          element={
            <ProtectedUser>
              <Chat />
            </ProtectedUser>
          }
        />
        <Route
          path="/contacts"
          element={
            <ProtectedUser>
              <Contacts />
            </ProtectedUser>
          }
        />


        <Route
          path="/settings"
          element={
            <ProtectedUser>
              <Settings />
            </ProtectedUser>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


