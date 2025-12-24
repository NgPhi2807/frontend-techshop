import React, { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../../stores/authStore1";
import {
    Bot,
    User,
    UserRound,
    Send,
    Circle,
    RefreshCw,
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
    senderType: "USER" | "BOT" | "STAFF" | "SYSTEM";
    content: string;
    createdAt: string;
}

const CustomerChat: React.FC = () => {
    const { accessToken } = useAuthStore();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [chatMode, setChatMode] = useState<"bot" | "staff">("bot");
    const [isTyping, setIsTyping] = useState(false);

    const socketRef = useRef<WebSocket | null>(null);

    // THAY ĐỔI 1: Dùng ref cho container chứa tin nhắn thay vì div cuối cùng
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const isFirstLoad = useRef(true);

    // --- Logic xử lý nội dung Bot (JSON/Text) ---
    const parseBotContent = (content: string) => {
        let textResult = "";
        let productsResult: Product[] = [];

        const extract = (input: any) => {
            if (!input) return;
            if (typeof input === 'object') {
                if (input.reply_text) {
                    if (typeof input.reply_text === 'string' && input.reply_text.includes('{')) {
                        extract(input.reply_text);
                    } else {
                        textResult = input.reply_text;
                    }
                }
                if (input.suggested_products && Array.isArray(input.suggested_products)) {
                    productsResult = input.suggested_products;
                }
                return;
            }
            try {
                const data = JSON.parse(input);
                extract(data);
            } catch (e) {
                const jsonMatch = input.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        const cleanJson = jsonMatch[0].replace(/\\n/g, "\n").replace(/\u00A0/g, " ");
                        extract(JSON.parse(cleanJson));
                    } catch (innerError) {
                        textResult = input.replace(/```json\n?|```/g, "").trim();
                    }
                } else {
                    textResult = input.replace(/```json\n?|```/g, "").trim();
                }
            }
        };
        extract(content);
        return { replyText: textResult, products: productsResult };
    };

    // --- WebSocket Logic ---
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

    const sendMessage = () => {
        if (!inputValue.trim()) return;
        if (chatMode === "bot") setIsTyping(true);
        sendFrame("SEND", { destination: "/app/chat.send", "content-type": "application/json" }, JSON.stringify({ content: inputValue }));
        setInputValue("");
    };

    // --- THAY ĐỔI 2: Logic Scroll Thông Minh (Chỉ cuộn bên trong) ---
    const scrollToBottom = (smooth = true) => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                top: scrollContainerRef.current.scrollHeight,
                behavior: smooth ? "smooth" : "auto", // Animation nhẹ nhàng
            });
        }
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container || messages.length === 0) return;

        // Lần đầu load: Cuộn ngay lập tức (không animation để user không thấy bị trượt)
        if (isFirstLoad.current) {
            scrollToBottom(false);
            isFirstLoad.current = false;
            return;
        }

        // Logic Smart Scroll:
        // 1. Tính toán xem user có đang đứng gần đáy không
        const { scrollTop, scrollHeight, clientHeight } = container;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 200; // Sai số 200px
        const lastMessage = messages[messages.length - 1];
        const isUserMessage = lastMessage?.senderType === "USER";

        // 2. Chỉ cuộn xuống nếu: User vừa nhắn tin HOẶC User đang xem ở đáy
        if (isUserMessage || isNearBottom) {
            scrollToBottom(true);
        }
    }, [messages, isTyping]);


    useEffect(() => {
        const savedToken = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
        const currentToken = accessToken || savedToken;
        if (socketRef.current) { socketRef.current.close(); socketRef.current = null; }

        let url = "";
        if (currentToken) {
            localStorage.removeItem("guestId");
            url = `${WS_BASE_URL}/ws/customer?token=${encodeURIComponent(currentToken)}`;
        } else {
            let guestId = localStorage.getItem("guestId") || crypto.randomUUID();
            localStorage.setItem("guestId", guestId);
            url = `${WS_BASE_URL}/ws/customer?guestId=${guestId}`;
        }

        const ws = new WebSocket(url);
        socketRef.current = ws;
        ws.onopen = () => sendFrame("CONNECT", { "accept-version": "1.1,1.2", "heart-beat": "10000,10000" });
        ws.onmessage = (event) => {
            const data = event.data as string;
            if (data.startsWith("CONNECTED")) {
                ["/user/queue/chat_init", "/user/queue/chat", "/user/queue/chat_mode_changed"].forEach((dest, i) =>
                    sendFrame("SUBSCRIBE", { id: `sub-${i}`, destination: dest })
                );
                sendFrame("SEND", { destination: "/app/chat.load_history" });
            }
            if (data.startsWith("MESSAGE")) {
                const bodyStr = data.substring(data.indexOf("\n\n") + 2, data.lastIndexOf("\0"));
                const dest = data.match(/destination:(.+)\n/)?.[1];
                try {
                    const parsed = JSON.parse(bodyStr);
                    if (dest?.includes("chat_init")) {
                        setMessages(parsed);
                        isFirstLoad.current = true; // Reset flag khi reload
                    }
                    else if (dest?.includes("chat_mode_changed")) setChatMode(parsed.chatMode);
                    else if (dest?.includes("chat")) {
                        setMessages(prev => [...prev, parsed]);
                        if (parsed.senderType !== "USER") setIsTyping(false);
                    }
                } catch (e) { }
            }
        };
        return () => ws.close();
    }, [accessToken]);

    // --- Render Message Content ---
    const renderMessageContent = (m: Message) => {
        if (m.senderType === "BOT") {
            const { replyText, products } = parseBotContent(m.content);
            return (
                <div className="w-full flex flex-col gap-4">
                    <p className="whitespace-pre-wrap leading-relaxed text-gray-800 text-[14px] font-medium">{replyText || "Đang xử lý..."}</p>
                    {products.length > 0 && (
                        <div className="space-y-3 border-l-2 border-red-200 pl-3">
                            {products.map((p, index) => (
                                <div key={`text-${p.id}`} className="text-[13px] text-gray-700">
                                    <p className="font-bold text-red-700">{index + 1}. {p.name}</p>
                                    {p.highlights && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {p.highlights.map((h, i) => (
                                                <span key={i} className="bg-red-50 text-black text-[10px] px-1.5 py-0.5 rounded border border-red-100 font-medium">{h}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    {products.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 w-full mt-2">
                            {products.map((p) => (
                                <div key={p.id} className="bg-white rounded-xl overflow-hidden flex flex-col p-2 h-full shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                                    <div className="w-full aspect-square mb-1 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                                        <img src={`${IMAGE_BASE_URL}${p.image_url}`} alt={p.name} className="w-full h-full object-contain mix-blend-multiply p-1 hover:scale-105 transition-transform duration-300" />
                                    </div>
                                    <h4 className="text-[10px] text-gray-700 font-bold line-clamp-2 h-7 mb-1">{p.name}</h4>
                                    <span className="text-red-600 font-extrabold text-[11px] mb-2 block">{p.price.toLocaleString('vi-VN')}đ</span>
                                    <a href={`/san-pham/${p.link}`} target="_blank" rel="noreferrer" className="mt-auto block text-center bg-red-500 text-white py-1.5 rounded-lg text-[9px] font-bold uppercase hover:bg-red-600 transition-colors">Xem ngay</a>
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
        <div className="max-w-6xl mx-auto ">
            {/* --- HEADER --- */}
            <div className="flex items-center justify-between mb-6 border-b border-indigo-100 pb-2">
                <h1 className="text-xl font-extrabold text-gray-800 lg:text-2xl">Hỗ trợ trực tuyến</h1>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 rounded-full border border-green-100">
                        <Circle size={8} fill="currentColor" className="text-green-500 animate-pulse" />
                        <span className="text-xs font-semibold text-green-700">Hệ thống sẵn sàng</span>
                    </div>
                </div>
            </div>

            {/* --- MAIN CHAT CARD --- */}
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col h-[75vh] md:max-h-[65vh] overflow-hidden">
                {/* Chat Header Inside Card */}
                <div className="bg-[#FFDDE0] p-4 flex justify-between items-center border-b border-red-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                            {chatMode === "bot" ? <Bot size={24} className="text-indigo-600" /> : <UserRound size={24} className="text-green-600" />}
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-red-800">{chatMode === "bot" ? "Trợ lý ảo AI ✨" : "Nhân viên hỗ trợ"}</h3>
                            <p className="text-[11px] text-red-600 opacity-80">{chatMode === "bot" ? "Trả lời tự động 24/7" : "Phản hồi trong vài phút"}</p>
                        </div>
                    </div>
                    <button
                        onClick={toggleChatMode}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold shadow-sm transition-all active:scale-95 ${chatMode === "bot" ? "bg-white text-indigo-600 hover:bg-indigo-50" : "bg-green-500 text-white hover:bg-green-600"}`}
                    >
                        <RefreshCw size={14} className={isTyping ? "animate-spin" : ""} />
                        {chatMode === "bot" ? " Nhân viên" : "Trợ Lý AI"}
                    </button>
                </div>

                {/* Chat Area */}
                <div
                    ref={scrollContainerRef} // Gắn ref vào container này
                    className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-6 bg-[#FFF0F1] scroll-smooth"
                >
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2 opacity-60 animate-in fade-in zoom-in duration-500">
                            <Bot size={48} className="text-red-200" />
                            <p className="text-sm">Bắt đầu cuộc trò chuyện ngay...</p>
                        </div>
                    )}
                    {messages.map((m, i) => (
                        <div
                            key={i}
                            // THAY ĐỔI 3: Thêm Animation animate-in fade-in slide-in-from-bottom
                            className={`flex gap-3 items-start max-w-[90%] md:max-w-[75%] animate-in fade-in slide-in-from-bottom-2 duration-300 ${m.senderType === "USER" ? "self-end flex-row-reverse" : "self-start flex-row"}`}
                        >
                            <div className="shrink-0 w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center border border-red-50 mt-1">
                                {m.senderType === "BOT" ? <Bot size={20} className="text-indigo-500" /> : m.senderType === "STAFF" ? <UserRound size={20} className="text-green-500" /> : <User size={20} className="text-red-500" />}
                            </div>
                            <div className={`flex flex-col ${m.senderType === "USER" ? "items-end" : "items-start"}`}>
                                <div className={`px-5 py-3 rounded-2xl shadow-sm text-sm ${m.senderType === "USER" ? "bg-red-500 text-white rounded-tr-none" : "bg-white text-gray-800 rounded-tl-none border border-red-50"}`}>
                                    {renderMessageContent(m)}
                                </div>
                                <span className="text-[10px] text-gray-400 mt-1.5 px-1 font-medium">{new Date(m.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex gap-2 items-center self-start ml-2 animate-in fade-in slide-in-from-bottom-2">
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-red-50">
                                <Bot size={16} className="text-indigo-500" />
                            </div>
                            <span className="bg-white text-gray-500 text-xs rounded-full py-2 px-4 shadow-sm italic animate-pulse border border-red-50">Đang nhập tin nhắn...</span>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 md:p-5 bg-white border-t border-red-50 shrink-0">
                    <div className="flex gap-3 items-center bg-gray-50 rounded-2xl px-2 py-2 border border-gray-100 focus-within:ring-2 focus-within:ring-red-100 transition-all">
                        <input
                            type="text" value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Nhập câu hỏi hoặc nội dung cần hỗ trợ..."
                            className="flex-1 bg-transparent border-none text-sm outline-none px-3 text-gray-700 placeholder:text-gray-400"
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!inputValue.trim()}
                            className="bg-red-500 p-3 rounded-xl text-white hover:bg-red-600 active:scale-95 disabled:bg-gray-300 disabled:scale-100 transition-all shadow-sm"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerChat;