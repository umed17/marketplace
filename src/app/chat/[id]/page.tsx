"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Avatar } from "@/components/MasterCard";
import { CONTACT_WARNING } from "@/lib/constants";
import { formatDate, isOnline } from "@/lib/utils";
import { IconCamera } from "@/components/icons";

type Conversation = {
  id: string;
  order: { id: string; title: string; status: string };
  other: { id: string; firstName: string; lastName: string; avatar?: string | null; lastSeenAt?: string | null };
};

type Message = {
  id: string;
  senderId: string;
  body: string;
  attachmentUrl?: string | null;
  createdAt: string;
  isRead: boolean;
  hasContactHint?: boolean;
};

export default function ChatThreadPage() {
  const { id } = useParams<{ id: string }>();
  const [meId, setMeId] = useState("");
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [warning, setWarning] = useState("");
  const [text, setText] = useState("");
  const bottom = useRef<HTMLDivElement>(null);

  async function load() {
    const [c, m, me] = await Promise.all([
      fetch(`/api/conversations/${id}`).then((r) => r.json()),
      fetch(`/api/conversations/${id}/messages`).then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
    ]);
    setConversation(c.conversation);
    setMessages(m.messages || []);
    setMeId(me.user?.id || "");
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [id]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const res = await fetch(`/api/conversations/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: text }),
    });
    const data = await res.json();
    if (data.warning) setWarning(data.warning);
    setText("");
    load();
  }

  async function upload(file: File) {
    const fd = new FormData();
    fd.set("file", file);
    fd.set("folder", "chat");
    const up = await fetch("/api/upload", { method: "POST", body: fd }).then((r) => r.json());
    if (!up.url) return;
    await fetch(`/api/conversations/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: "📷 Сурат", attachmentUrl: up.url }),
    });
    load();
  }

  if (!conversation) return <div className="page-wrap py-10">Боргирӣ...</div>;
  const name = `${conversation.other.firstName} ${conversation.other.lastName}`;

  return (
    <div className="page-wrap grid min-h-[70vh] grid-rows-[auto_1fr_auto] py-4">
      <div className="card mb-3 flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Avatar name={name} src={conversation.other.avatar} size={44} />
          <div>
            <div className="font-bold">{name}</div>
            <div className="text-xs text-[var(--color-muted)]">
              {isOnline(conversation.other.lastSeenAt) ? "● Online" : "Offline"} · {conversation.order.title}
            </div>
          </div>
        </div>
        <Link href={`/orders/${conversation.order.id}`} className="btn btn-ghost text-sm">
          Заказ
        </Link>
      </div>
      <div className="card space-y-3 overflow-auto p-4">
        {messages.map((m) => (
          <div key={m.id} className={`max-w-[85%] rounded-xl p-3 ${m.senderId === meId ? "ml-auto bg-[var(--color-primary)] text-white" : "bg-[var(--color-muted-bg)] text-[var(--color-ink)]"}`}>
            {m.attachmentUrl && <img src={m.attachmentUrl} alt="" className="mb-2 max-h-48 rounded-xl" />}
            <div>{m.body}</div>
            <div className={`mt-1 text-[10px] ${m.senderId === meId ? "text-white/70" : "text-[var(--color-muted)]"}`}>
              {formatDate(m.createdAt)} {m.isRead && m.senderId === meId ? " · хонда шуд" : ""}
            </div>
          </div>
        ))}
        <div ref={bottom} />
      </div>
      {warning && <p className="mt-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{warning || CONTACT_WARNING}</p>}
      <form onSubmit={send} className="mt-3 flex gap-2">
        <label className="btn btn-ghost cursor-pointer px-3" aria-label="Сурат">
          <IconCamera size={18} />
          <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        </label>
        <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Паём нависед..." />
        <button className="btn btn-primary">Фиристодан</button>
      </form>
    </div>
  );
}
