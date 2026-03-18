"use client";

import Sidebar from "@/components/Sidebar";
import ChatBox from "@/components/ChatBox";
import { useEffect, useState } from "react";
import { useChatStore } from "@/store/useChatStore";

export default function Home() {
  const { chats, setCurrentChat } = useChatStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (chats.length > 0) {
      setCurrentChat(chats[0].id);
    }
  }, []);
  if (!mounted) return null;

  return (
    <div className="flex h-full">
      <Sidebar />
      <ChatBox />
    </div>
  );
}