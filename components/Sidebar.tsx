"use client";

import { Button, Select, Space, Modal } from "antd";
import { Mode, useChatStore } from "@/store/useChatStore";
import { DeleteOutlined } from "@ant-design/icons";
import { EditOutlined } from "@ant-design/icons";

export default function Sidebar() {
  const { chats, setCurrentChat, addChat, currentChatId, setMode, deleteChat } = useChatStore();

  const showDeleteConfirm = (id: string) => {
    Modal.confirm({
      title: "Delete Chat",
      content: "Are you sure you want to delete this chat?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        deleteChat(id);
      },
    });
  };

  return (
    <div className="w-[250px] p-6 bg-[#282a2c]">
      <div className="mb-4">
        <button
          onClick={addChat}
          className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors cursor-pointer"
        >
          <EditOutlined className="h-5 w-5" />
          New Chat
        </button>
      </div>
      {/* <Space style={{ width: "100%", display: "block" }}>
        <Select
          className="w-full mt-3"
          defaultValue="grammar"
          onChange={(value: Mode) => setMode(value)}
          options={[
            { label: "Grammar Fix", value: "grammar" },
            { label: "Conversation", value: "chat" },
            { label: "IELTS", value: "ielts" },
          ]}
        />
      </Space> */}

      <h1> Cuộc trò chuyện </h1>
      <div className="mt-3">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`
              flex justify-between items-center p-2.5 rounded-md mb-1 cursor-pointer
              ${chat.id === currentChatId
                ? "bg-[#1f3760] text-white"
                : "hover:bg-[#575757]"}
            `}
          >
            {/* Tên chat */}
            <div onClick={() => setCurrentChat(chat.id)} className="flex-1">
              {chat.title || `New chat`}
            </div>

            {/* Nút xóa với confirm */}
            <DeleteOutlined
              onClick={(e) => {
                e.stopPropagation(); // tránh trigger setCurrentChat
                showDeleteConfirm(chat.id);
              }}
              className="text-red-500 hover:text-red-700"
            />
          </div>
        ))}
      </div>
    </div>
  );
}