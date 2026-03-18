"use client";

import { Button } from "antd";
import { Mode, useChatStore } from "@/store/useChatStore";
import { Select } from "antd";


export default function Sidebar() {
  const { chats, setCurrentChat, addChat, currentChatId, setMode } = useChatStore();

  return (
    <div
      style={{
        borderRight: "1px solid #eee",
      }}
      className="w-[250px] p-6"
    >
      <Button type="primary" block onClick={addChat}>
        + New Chat
      </Button>
      <Select
        // className="w-full mt-5"
        style={{ width: "100%", marginTop: 10 }}
        defaultValue="grammar"
        onChange={(value: Mode) => setMode(value)}
        options={[
          { label: "Grammar Fix", value: "grammar" },
          { label: "Conversation", value: "chat" },
          { label: "IELTS", value: "ielts" },
        ]}
      />

      <div style={{ marginTop: 10 }}>
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => setCurrentChat(chat.id)}
            style={{
              padding: 10,
              cursor: "pointer",
              background:
                chat.id === currentChatId ? "#6f6464" : "transparent",
              borderRadius: 6,
              marginBottom: 5,
            }}
          >
            Chat {chat.id.slice(-4)}
          </div>
        ))}
      </div>
    </div>
  );
}