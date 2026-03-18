import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Chat {
  id: string;
  messages: Message[];
}
export type Mode = "grammar" | "chat" | "ielts";

interface ChatStore {
  chats: Chat[];
  currentChatId: string;
  mode: "grammar" | "chat" | "ielts";
  setMode: (mode: Mode) => void;
  addChat: () => void;
  setCurrentChat: (id: string) => void;
  addMessage: (msg: Message) => void;
  updateLastMessage: (content: string) => void;
}
const STORAGE_KEY = "chat-storage";

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: [
        {
          id: Date.now().toString(),
          messages: [],
        },
      ],
      currentChatId: "",
      mode: "grammar",

      setMode: (mode) => set({ mode }),

      addChat: () => {
        const newChat = {
          id: Date.now().toString(),
          messages: [],
        };

        set((state) => ({
          chats: [newChat, ...state.chats],
          currentChatId: newChat.id,
        }));
      },

      setCurrentChat: (id) => set({ currentChatId: id }),

      addMessage: (msg) => {
        const { chats, currentChatId } = get();

        const updated = chats.map((chat) =>
          chat.id === currentChatId
            ? { ...chat, messages: [...chat.messages, msg] }
            : chat
        );

        set({ chats: updated });
      },

      updateLastMessage: (content) => {
        const { chats, currentChatId } = get();

        const updated = chats.map((chat) => {
          if (chat.id !== currentChatId) return chat;

          const msgs = [...chat.messages];
          const last = msgs[msgs.length - 1];

          if (last?.role === "assistant") {
            last.content = content;
          } else {
            msgs.push({ role: "assistant", content });
          }

          return { ...chat, messages: msgs };
        });

        set({ chats: updated });
      },
    }),
    {
      name: "chat-storage", // key trong localStorage
    }
  )
);