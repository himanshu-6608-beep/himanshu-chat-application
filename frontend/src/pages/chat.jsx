import { useState } from "react";
import Sidebar from "../partials/sidebar";
import UsersSidebar from "../partials/UsersSidebar";
import ChatWindow from "../partials/chatwindow";
import "../css/chat.css";

  const ChatLayout = ()=> {
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");

  return (
    <div className="chat-layout">
      <Sidebar search={search} setSearch={setSearch} />

      <UsersSidebar
        search={search}
        setSearch={setSearch}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
      />

      <ChatWindow selectedUser={selectedUser} />
    </div>
  );
}

export default ChatLayout;