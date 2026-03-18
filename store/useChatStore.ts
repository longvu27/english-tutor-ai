import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Mode = "grammar" | "chat" | "ielts";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
}

interface ChatStore {
  chats: Chat[];
  currentChatId: string;
  mode: Mode;

  setMode: (mode: Mode) => void;
  addChat: () => void;
  setCurrentChat: (id: string) => void;
  addMessage: (msg: Message) => void;
  updateLastMessage: (content: string) => void;
  setTitle: (title: string) => void;
  deleteChat: (id: string) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: [],
      currentChatId: "",
      mode: "grammar",

      setMode: (mode) => set({ mode }),

      addChat: () => {
        const newChat: Chat = {
          id: crypto.randomUUID(),
          title: "",
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

        const updated = chats.map((chat) => {
          if (chat.id !== currentChatId) return chat;

          const newMessages = [...chat.messages, msg];

          const newTitle =
            !chat.title && msg.role === "user"
              ? msg.content.slice(0, 50)
              : chat.title;

          return {
            ...chat,
            messages: newMessages,
            title: newTitle,
          };
        });

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

      setTitle: (title) => {
        const { chats, currentChatId } = get();

        const updated = chats.map((chat) =>
          chat.id === currentChatId ? { ...chat, title } : chat
        );

        set({ chats: updated });
      },
      deleteChat: (id) => {
        const { chats, currentChatId } = get();

        const filtered = chats.filter((chat) => chat.id !== id);

        const newCurrentId =
          id === currentChatId ? filtered[0]?.id || "" : currentChatId;

        set({ chats: filtered, currentChatId: newCurrentId });
      },
    }),
    {
      name: "chat-storage",
    }
  )
);