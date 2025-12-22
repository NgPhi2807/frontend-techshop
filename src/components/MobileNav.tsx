import React, { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../stores/authStore1";
import {
    Bot,
    User,
    UserRound,
    MessageSquare,
    Send,
    X,
    ChevronsUp,
    Headset,
    Circle,
    MessageCircle,
} from "lucide-react";

// --- Cấu hình Biến Môi trường ---
const IMAGE_BASE_URL = import.meta.env.PUBLIC_IMAGE_BASE_URL || "https://res.cloudinary.com/doy1zwhge/image/upload";
const WS_BASE_URL = import.meta.env.PUBLIC_WS_BASE_URL || "ws://localhost:8080";

interface Product {
    id: string;
    name: string;
    price: number;
    image_url: string;
    link: string;
    short_desc?: string;
    highlights?: string[];
}

interface Message {
    senderType: "USER" | "BOT" | "STAFF";
    content: string;
    createdAt: string;
}

const MobileNav: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [showContact, setShowContact] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const { accessToken } = useAuthStore();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [chatMode, setChatMode] = useState<"bot" | "staff">("bot");
    const [unreadCount, setUnreadCount] = useState(0);
    const [isTyping, setIsTyping] = useState(false);

    const socketRef = useRef<WebSocket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const parseBotContent = (content: string) => {
        let textResult = "";
        let productsResult: Product[] = [];

        const extract = (input: any) => {
            try {
                const data = typeof input === 'string' ? JSON.parse(input.replace(/```json\n?|```/g, "").replace(/\u00A0/g, " ").trim()) : input;

                if (data.reply_text) {
                    if (typeof data.reply_text === 'string' && data.reply_text.includes('{')) {
                        extract(data.reply_text);
                    } else {
                        textResult = data.reply_text;
                    }
                }
                if (data.suggested_products && Array.isArray(data.suggested_products)) {
                    productsResult = data.suggested_products;
                }
            } catch (e) {
                textResult = input.replace(/```json\n?|```/g, "").trim();
            }
        };

        extract(content);
        return { replyText: textResult, products: productsResult };
    };

    const sendFrame = (command: string, headers: Record<string, string> = {}, body: string = "") => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
        let frame = `${command}\n`;
        Object.entries(headers).forEach(([k, v]) => { frame += `${k}:${v}\n`; });
        frame += `\n${body}\0`;
        socketRef.current.send(frame);
    };

    const toggleChatMode = () => {
        const nextMode = chatMode === "bot" ? "staff" : "bot";
        sendFrame("SEND", { destination: "/app/chat.switch_mode", "content-type": "application/json" }, JSON.stringify({ chatMode: nextMode }));
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    useEffect(() => {
        const handleScroll = () => setIsVisible(window.scrollY > 100);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const savedToken = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
        const currentToken = accessToken || savedToken;

        if (socketRef.current) { socketRef.current.close(); socketRef.current = null; }

        let url = "";
        if (currentToken) {
            localStorage.removeItem("guestId");
            url = `${WS_BASE_URL}/ws/customer?token=${encodeURIComponent(currentToken)}`;
        } else if (isChatOpen) {
            let guestId = localStorage.getItem("guestId") || crypto.randomUUID();
            localStorage.setItem("guestId", guestId);
            url = `${WS_BASE_URL}/ws/customer?guestId=${guestId}`;
        } else return;

        const ws = new WebSocket(url);
        socketRef.current = ws;
        ws.onopen = () => sendFrame("CONNECT", { "accept-version": "1.1,1.2", "heart-beat": "10000,10000" });
        ws.onmessage = (event) => {
            const data = event.data as string;
            if (data.startsWith("CONNECTED")) {
                sendFrame("SUBSCRIBE", { id: "sub-0", destination: "/user/queue/chat_init" });
                sendFrame("SUBSCRIBE", { id: "sub-1", destination: "/user/queue/chat" });
                sendFrame("SUBSCRIBE", { id: "sub-2", destination: "/user/queue/chat_mode_changed" });
                sendFrame("SEND", { destination: "/app/chat.load_history" });
            }
            if (data.startsWith("MESSAGE")) {
                const bodyStr = data.substring(data.indexOf("\n\n") + 2, data.lastIndexOf("\0"));
                const dest = data.match(/destination:(.+)\n/)?.[1];
                try {
                    const parsed = JSON.parse(bodyStr);
                    if (dest?.includes("chat_init")) setMessages(parsed);
                    else if (dest?.includes("chat_mode_changed")) setChatMode(parsed.chatMode);
                    else if (dest?.includes("chat")) {
                        setMessages(prev => [...prev, parsed]);
                        if (parsed.senderType !== "USER") setIsTyping(false);
                        if (!isChatOpen) setUnreadCount(c => c + 1);
                    }
                } catch (e) { }
            }
        };
        return () => ws.close();
    }, [accessToken, isChatOpen]);

    const sendMessage = () => {
        if (!inputValue.trim()) return;
        if (chatMode === "bot") setIsTyping(true);
        sendFrame("SEND", { destination: "/app/chat.send", "content-type": "application/json" }, JSON.stringify({ content: inputValue }));
        setInputValue("");
    };

    const renderMessageContent = (m: Message) => {
        if (m.senderType === "BOT") {
            const { replyText, products } = parseBotContent(m.content);
            return (
                <div className="w-full flex flex-col gap-4">
                    {/* 1. Lời dẫn chính */}
                    <p className="whitespace-pre-wrap leading-relaxed text-gray-800 text-[14px] font-medium">
                        {replyText}
                    </p>

                    {/* 2. Chi tiết cấu hình/Highlights từng sản phẩm */}
                    {products.length > 0 && (
                        <div className="space-y-3 border-l-2 border-red-200 pl-3">
                            {products.map((p, index) => (
                                <div key={`text-${p.id}`} className="text-[13px] text-gray-700">
                                    <p className="font-bold text-red-700">{index + 1}. {p.name}</p>
                                    {p.short_desc && <p className="italic text-gray-500 text-[11px] leading-tight">{p.short_desc}</p>}
                                    {p.highlights && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {p.highlights.map((h, i) => (
                                                <span key={i} className="bg-red-50 text-red-600 text-[9px] px-1.5 py-0.5 rounded border border-red-100 font-medium">
                                                    {h}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 3. Grid sản phẩm kèm ảnh và link */}
                    {products.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 w-full mt-2">
                            {products.map((p) => (
                                <div key={p.id} className="bg-white rounded-xl overflow-hidden flex flex-col p-2 h-full shadow-sm border border-gray-100 hover:border-red-200 transition-all">
                                    <div className="w-full aspect-square mb-1 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                                        <img src={`${IMAGE_BASE_URL}${p.image_url}`} alt={p.name} className="w-full h-full object-contain mix-blend-multiply p-1" />
                                    </div>
                                    <h4 className="text-[10px] text-gray-700 font-bold line-clamp-2 h-7 mb-1">{p.name}</h4>
                                    <span className="text-red-600 font-extrabold text-[11px] mb-2 block">{p.price.toLocaleString('vi-VN')}đ</span>
                                    <a href={`/san-pham/${p.link}`} className="mt-auto block text-center bg-red-500 text-white py-1.5 rounded-lg text-[9px] font-bold uppercase hover:bg-red-600 transition-colors">Xem ngay</a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }
        return <p className="text-[14px] font-medium leading-relaxed">{m.content}</p>;
    };

    return (
        <>
            {isChatOpen && <div className="fixed inset-0 bg-black/40 z-[9998] md:hidden" onClick={() => setIsChatOpen(false)} />}
            <div className="fixed bottom-0 right-0 md:bottom-5 md:right-4 flex items-end justify-end gap-2 z-[9999] w-full md:w-auto pointer-events-none">
                {isChatOpen && (
                    <div className="flex flex-col overflow-hidden bg-[#FFF0F1] shadow-2xl fixed bottom-0 left-0 w-full h-[90vh] rounded-t-[2.5rem] z-[10000] md:relative md:w-[420px] md:h-[650px] md:rounded-3xl border border-red-100 animate-in slide-in-from-bottom-5 pointer-events-auto">
                        {/* Header */}
                        <div className="bg-[#FFDDE0] p-4 flex justify-between items-center border-b border-red-100 shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm">
                                    {chatMode === "bot" ? <Bot size={22} className="text-indigo-600" /> : <UserRound size={22} className="text-green-600" />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-[14px] text-red-800">{chatMode === "bot" ? "Trợ lý AI ✨" : "Nhân viên"}</h3>
                                    <div className="flex items-center gap-1"><Circle size={8} fill="currentColor" className="text-green-500 animate-pulse" /><span className="text-[10px] text-green-600 font-medium">Online</span></div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={toggleChatMode} className={`px-3 py-1.5 rounded-full text-[10px] font-bold shadow-sm ${chatMode === "bot" ? "bg-white text-indigo-600" : "bg-green-500 text-white"}`}>
                                    {chatMode === "bot" ? "Gặp nhân viên" : "Dùng AI"}
                                </button>
                                <button onClick={() => setIsChatOpen(false)} className="bg-white/50 p-1.5 rounded-full hover:bg-white transition-colors"><X size={20} className="text-red-600" /></button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 no-scrollbar bg-[#FFF0F1]">
                            {messages.length === 0 && <div className="text-center mt-10 text-gray-400 text-[13px] italic bg-white/40 px-4 py-2 rounded-2xl border border-dashed border-red-200 mx-4">Chào Anh/Chị, em có thể hỗ trợ gì ạ?</div>}
                            {messages.map((m, i) => (
                                <div key={i} className={`flex gap-2 items-start ${m.senderType === "USER" ? "flex-row-reverse" : "flex-row"}`}>
                                    <div className="shrink-0 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center border border-red-50 mt-1">
                                        {m.senderType === "BOT" ? <Bot size={18} className="text-indigo-500" /> : m.senderType === "STAFF" ? <UserRound size={18} className="text-green-500" /> : <User size={18} className="text-red-500" />}
                                    </div>
                                    <div className={`flex flex-col ${m.senderType === "USER" ? "items-end" : "items-start"} max-w-[85%]`}>
                                        <div className={`px-4 py-2 rounded-2xl shadow-sm ${m.senderType === "USER" ? "bg-red-500 text-white rounded-tr-none" : "bg-white text-gray-800 rounded-tl-none border border-red-50"}`}>
                                            {renderMessageContent(m)}
                                        </div>
                                        <span className="text-[9px] text-gray-400 mt-1 px-1">{new Date(m.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            ))}
                            {isTyping && <div className="flex gap-2 items-center text-gray-400 text-xs italic ml-2"><Bot size={14} className="animate-bounce" /> Trợ lý đang xử lý...</div>}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-red-50 shrink-0">
                            <div className="flex gap-2 items-center bg-gray-50 rounded-2xl px-4 py-1.5 border border-gray-100 focus-within:bg-white transition-all shadow-inner">
                                <input
                                    type="text" value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder="Nhập câu hỏi tại đây..."
                                    className="flex-1 bg-transparent border-none text-[14px] outline-none py-2 text-gray-700"
                                />
                                <button onClick={sendMessage} className="bg-red-500 p-2.5 rounded-xl text-white active:scale-90 shadow-md transition-all"><Send size={18} /></button>
                            </div>
                        </div>
                    </div>
                )}

                <div className={`flex flex-col gap-3 pb-5 pr-4 md:p-0 pointer-events-auto transition-all ${isChatOpen ? "hidden md:flex" : "flex"}`}>
                    <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className={`flex items-center justify-center shadow-lg text-white w-14 h-14 flex-col bg-gray-900 text-[9px] rounded-2xl transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}><ChevronsUp size={20} /><span>Lên đầu</span></button>
                    <button onClick={() => { setIsChatOpen(true); setUnreadCount(0); }} className="flex items-center justify-center shadow-lg text-white w-14 h-14 flex-col bg-indigo-600 text-[9px] rounded-2xl relative hover:scale-110 active:scale-95 transition-all">
                        <MessageCircle size={20} /><span>Hỗ Trợ Tư Vấn</span>
                        {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white animate-bounce shadow-sm">{unreadCount}</span>}
                    </button>
                    <button onClick={() => setShowContact(!showContact)} className="flex items-center justify-center shadow-lg text-white w-14 h-14 flex-col bg-red-600 text-[9px] rounded-2xl hover:scale-110 active:scale-95 transition-all"><Headset size={20} /><span>Liên hệ</span></button>
                </div>
            </div>

            {/* Contact Panel */}
            {showContact && (
                <div className="fixed bottom-36 right-4 z-[10000] p-4 rounded-2xl shadow-2xl bg-white border border-red-50 animate-in slide-in-from-right-10 pointer-events-auto">
                    <button onClick={() => setShowContact(false)} className="absolute -top-2 -right-2 bg-white shadow-md rounded-full p-1 border hover:bg-red-50 transition-colors"><X size={14} /></button>
                    <a href="https://zalo.me/" target="_blank" rel="noreferrer" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shadow-sm"><MessageSquare size={24} fill="currentColor" /></div>
                        <div className="flex flex-col font-bold"><span className="text-sm text-blue-600">Zalo hỗ trợ</span><span className="text-[10px] text-gray-400 font-normal italic">Trực tuyến 24/7</span></div>
                    </a>
                </div>
            )}
        </>
    );
};

export default MobileNav;