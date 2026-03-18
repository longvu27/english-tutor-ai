"use client";

import { useState, useRef, useEffect } from "react";
import { Input, Button } from "antd";
import { useChatStore } from "@/store/useChatStore";
import ReactMarkdown from "react-markdown";

export default function ChatBox() {
  const { chats, currentChatId, addMessage, updateLastMessage, mode } = useChatStore();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const chat = chats.find((c) => c.id === currentChatId);
  const messages = chat?.messages || [];

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input) return;

    addMessage({ role: "user", content: input });
    setInput("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: input, mode }),
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder("utf-8");

    let result = "";

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (let line of lines) {
        line = line.trim();
        if (!line.startsWith("data:")) continue;

        const jsonStr = line.replace("data: ", "");
        if (jsonStr === "[DONE]") break;

        try {
          const json = JSON.parse(jsonStr);
          const content = json.choices?.[0]?.delta?.content;

          if (content) {
            result += content;
            updateLastMessage(result);
          }
        } catch {}
      }
    }

    setLoading(false);
  };

  return (
    <div style={{ flex: 1, padding: 20 }}>
      {/* Messages */}
      <div style={{ height: "70vh", overflowY: "auto" }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent:
                msg.role === "user" ? "flex-end" : "flex-start",
              marginBottom: 10,
            }}
          >
            <div
              style={{
                background: msg.role === "user" ? "#1677ff" : "#f5f5f5",
                color: msg.role === "user" ? "#fff" : "#000",
                padding: "10px 14px",
                borderRadius: 16,
                maxWidth: "70%",
                whiteSpace: "pre-wrap",
              }}
            >
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <Input.TextArea
        rows={2}
        value={input}
        disabled={loading}
        onChange={(e) => setInput(e.target.value)}
        onPressEnter={(e) => {
          e.preventDefault();
          handleSend();
        }}
      />

      <Button
        type="primary"
        onClick={handleSend}
        loading={loading}
        style={{ marginTop: 10 }}
      >
        Send
      </Button>
    </div>
  );
}