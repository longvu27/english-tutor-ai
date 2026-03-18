"use client";

import { useState, useRef, useEffect } from "react";
import { Input, Button } from "antd";
import { useChatStore } from "@/store/useChatStore";
import ReactMarkdown from "react-markdown";
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

export default function ChatBox() {
  const { chats, currentChatId, addChat, addMessage, updateLastMessage, mode } = useChatStore();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const chat = chats.find((c) => c.id === currentChatId);
  const messages = chat?.messages || [];

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const { chats, currentChatId, addChat, addMessage, updateLastMessage, mode } = useChatStore.getState();

    let chat = chats.find((c) => c.id === currentChatId);

    if (!chat) {
      addChat();
      const newCurrentId = useChatStore.getState().currentChatId;
      chat = useChatStore.getState().chats.find((c) => c.id === newCurrentId);
    }

    if (!chat) return;

    addMessage({ role: "user", content: input });
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: input, mode }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let result = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (let line of lines) {
            line = line.trim();
            if (!line.startsWith("data:")) continue;

            const jsonStr = line.replace("data: ", "").trim();
            if (!jsonStr || jsonStr === "[DONE]") continue;

            try {
              const json = JSON.parse(jsonStr);
              const content = json.choices?.[0]?.delta?.content;
              if (content) {
                result += content;
                updateLastMessage(result);
              }
            } catch (err) {
              console.warn("Skipped invalid JSON chunk:", jsonStr);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-5 h-full max-w-[900px] m-auto">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
              }`}
          >
            <div
              className={`
                px-4 py-2 rounded-2xl max-w-[70%] whitespace-pre-wrap
                ${msg.role === "user"
                  ? "bg-[#282a2c] text-white"
                  : "text-[#e3e3e3]"
                }
              `}
            >
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-3 relative w-full">
        <textarea
          rows={3}
          value={input}
          disabled={loading}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type your message..."
          className="w-full bg-[#282a2c] text-white placeholder-white rounded-2xl p-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Icon gửi nằm bên trong */}
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="absolute right-2 bottom-2 p-2 rounded-full bg-[#10a37f] hover:bg-[#0e8e6a] transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          <PaperAirplaneIcon className={`h-5 w-5 text-white ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
}