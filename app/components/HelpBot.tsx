"use client";

import React, { useEffect, useRef, useState } from "react";
import { Bot, MessageCircle, Send, Volume2, VolumeX, X } from "lucide-react";

type Lang = "en" | "hi" | "hinglish";
type Answered = { en: string; hi: string; hinglish: string };
interface Msg { id: number; by: "user" | "bot"; text: string }

const LANGS: { key: Lang; label: string }[] = [
  { key: "en", label: "English" },
  { key: "hi", label: "हिंदी" },
  { key: "hinglish", label: "Hinglish" },
];

const KB: { kw: string[]; a: Answered }[] = [
  {
    kw: ["who are you", "your name", "tum kaun", "kaun ho", "aap kaun", "sakhi", "तुम कौन", "आप कौन"],
    a: {
      en: "I'm Sakhi, your AI guide here. I can help you learn how to use this website — measuring land, earning credits, selling them, and more. I speak Hindi, English and Hinglish, and I can read answers aloud in a female voice.",
      hi: "मैं सखी हूँ, आपकी AI सहेली। मैं इस वेबसाइट का उपयोग सिखाने में मदद करती हूँ — ज़मीन नापना, क्रेडिट कमाना, उन्हें बेचना, और बहुत कुछ। मैं हिंदी, अंग्रेज़ी और हिंग्लिश बोलती हूँ, और जवाब महिला आवाज़ में पढ़कर सुनाती हूँ।",
      hinglish: "Main Sakhi hoon, aapki AI saheli. Main is website ko seekhne mein madad karti hoon — zameen naapna, credits kamana, bechna, aur bahut kuch. Main Hindi, English aur Hinglish bolti hoon, aur jawab female awaaz mein padhkar sunati hoon.",
    },
  },
  {
    kw: ["register", "sign up", "signup", "account banao", "account", "join", "create account", "रजिस्टर", "रजिस्ट्रेशन", "खाता", "अकाउंट"],
    a: {
      en: "Easy! Open the Farmer Carbon Hub and tap Register. Fill your name, village, state, phone and email, and set a password. An OTP is shown on screen (or sent to email/SMS) — verify both email and phone. Done! Now you can register land and start earning credits.",
      hi: "बहुत आसान! फ़ार्मर कार्बन हब खोलें और रजिस्टर दबाएँ। नाम, गाँव, राज्य, फ़ोन और ईमेल भरें, पासवर्ड रखें। ओटीपी स्क्रीन पर दिखेगा (या ईमेल/SMS पर आएगा) — ईमेल और फ़ोन दोनों वेरिफाई करें। हो गया! अब ज़मीन रजिस्टर कर क्रेडिट कमा सकते हैं।",
      hinglish: "Bahut aasaan! Farmer Carbon Hub kholo aur Register dabao. Naam, gaon, rajya, phone aur email bharo, password rakho. OTP screen par dikhega (ya email/SMS par aayega) — email aur phone dono verify karo. Ho gaya! Ab zameen register karke credits kama sakte ho.",
    },
  },
  {
    kw: ["login", "log in", "sign in", "log kare", "लॉगिन", "लॉग इन"],
    a: {
      en: "Tap Login on the Farmer Hub, enter your email and password. Already verified? You land straight on your dashboard. Or try the one-tap Login with Demo Farmer to explore everything instantly.",
      hi: "फ़ार्मर हब पर लॉगिन दबाएँ, ईमेल और पासवर्ड डालें। अगर पहले वेरिफाई कर लिया है तो सीधे डैशबोर्ड खुल जाएगा। डेमो फ़ार्मर से लॉगिन एक क्लिक में पूरी वेबसाइट देखने का आसान तरीका है।",
      hinglish: "Farmer Hub par Login dabao, email aur password daalo. Agar pehle verify kar liya hai to seedha dashboard khul jayega. Demo Farmer se Login ek click mein poori website dekhne ka aasaan tarika hai.",
    },
  },
  {
    kw: ["otp", "verify", "verification", "code", "ओटीपी", "वेरिफाई", "सत्यापन", "कोड"],
    a: {
      en: "When you register, the OTP is shown on screen as green chips (demo mode) or sent to your email/SMS. Enter the email OTP and phone OTP to verify both, then tap Verify & Continue. A green check mark means it worked.",
      hi: "रजिस्ट्रेशन पर ओटीपी स्क्रीन पर हरे चिप में दिखता है या ईमेल/SMS पर आता है। ईमेल और फ़ोन दोनों का ओटीपी डालकर वेरिफाई एंड कंटिन्यू दबाएँ। हरा टिक मतलब सफल।",
      hinglish: "Registration par OTP screen par green chip mein dikhta hai ya email/SMS par aata hai. Email aur phone dono ka OTP daalke Verify & Continue dabao. Hara tick matlab success.",
    },
  },
  {
    kw: ["land", "farm", "field", "plot", "acre", "hectare", "zameen", "jameen", "khet", "जमीन", "ज़मीन", "खेत", "भूमि"],
    a: {
      en: "Go to My Lands and tap Register Land. Add a title, village, district, state and area (hectares or acres) — you can drop a pin on the map or use your GPS. On save, the app automatically estimates your carbon credits and rupee value from the area.",
      hi: "माई लैंड्स जाकर रजिस्टर लैंड दबाएँ। नाम, गाँव, ज़िला, राज्य और रकबा (हेक्टेयर या एकड़) भरें — नक्शे पर पिन डालें या GPS इस्तेमाल करें। सेव करते ही ऐप रकबे से कार्बन क्रेडिट और रुपये में कीमत खुद लगा देता है।",
      hinglish: "My Lands jao aur Register Land dabao. Naam, gaon, jila, rajya aur rakba (hectare ya acre) bharo — map par pin daalo ya GPS use karo. Save karte hi app rakbe se carbon credits aur rupees mein value khud lagata hai.",
    },
  },
  {
    kw: ["calculator", "calculate", "measure", "kaalkuleter", "calculation", "गणना", "कैलकुलेटर", "नाप"],
    a: {
      en: "The Carbon Calculator estimates credits from satellite imagery of any area — pick a location, choose your land type, and it shows the credits and live value. Inside the Farmer Hub, the Measure & Calculate tab works directly with your registered land.",
      hi: "कार्बन कैलकुलेटर किसी भी इलाके की सैटेलाइट इमेजरी से क्रेडिट का अंदाज़ा लगाता है — लोकेशन चुनें, ज़मीन का प्रकार चुनें, क्रेडिट और लाइव वैल्यू दिख जाती है। फ़ार्मर हब के अंदर मेज़र एंड कैलकुलेट टैब रजिस्टर ज़मीन से सीधे काम करता है।",
      hinglish: "Carbon Calculator kisi bhi area ki satellite imagery se credits ka andaaza lagata hai — location chuno, zameen ka type chuno, credits aur live value dikh jaati hai. Farmer Hub ke andar Measure & Calculate tab registered zameen se seedha kaam karta hai.",
    },
  },
  {
    kw: ["tree", "plant", "ped", "pehda", "पेड़", "पौधा", "वृक्ष", "plants"],
    a: {
      en: "Tap My Trees and add a tree: pick the species, age and height, and optionally a photo. The app estimates how much CO₂ the tree absorbs and its value in rupees.",
      hi: "माई ट्रीज़ दबाकर पेड़ जोड़ें: प्रजाति, उम्र और ऊँचाई चुनें, चाहें तो फ़ोटो भी। ऐप बताता है कि पेड़ कितना CO₂ सोखता है और रुपये में उसकी कीमत।",
      hinglish: "My Trees dabakar ped add karo: species, umar aur unchai chuno, chahe toh photo bhi. App batata hai ki ped kitna CO2 sokhta hai aur rupees mein value.",
    },
  },
  {
    kw: ["credit", "carbone", "carbon", "certificate", "kredit", "कार्बन", "क्रेडिट", "कर्बन"],
    a: {
      en: "A carbon credit equals 1 tonne of CO₂ genuinely saved. Your land and trees earn these credits automatically. Your dashboard shows Total Credits (your pool) and Potential Earnings (their current rupee value).",
      hi: "एक कार्बन क्रेडिट = 1 टन CO₂ जो सच में बचाया गया। आपकी ज़मीन और पेड़ ये क्रेडिट अपने आप कमाते हैं। डैशबोर्ड टोटल क्रेडिट्स (आपका पूल) और पोटेंशियल अर्निंग्स (रुपये में वैल्यू) दिखाता है।",
      hinglish: "1 carbon credit = 1 ton CO2 jo sach mein bachaya gaya. Aapki zameen aur ped ye credits khud kamate hain. Dashboard Total Credits (aapka pool) aur Potential Earnings (rupees mein value) dikhata hai.",
    },
  },
  {
    kw: ["market", "sell", "sale", "buy", "sell kar", "bech", "markat", "खरीद", "मार्केट", "बेच", "बाज़ार", "बाजार"],
    a: {
      en: "Open the Marketplace tab. Sell Credits lists your credits at your price — buyers pay you via UPI or bank. The live price comes from the digital carbon market and refreshes every 10 minutes. You can also contact sellers to buy.",
      hi: "मार्केटप्लेस टैब खोलें। सेल क्रेडिट्स आपके क्रेडिट आपकी कीमत पर लिस्ट करता है — खरीदार UPI या बैंक से भुगतान करते हैं। लाइव कीमत डिजिटल मार्केट से आती है और हर 10 मिनट में रिफ़्रेश होती है। खरीदने के लिए विक्रेता से संपर्क भी कर सकते हैं।",
      hinglish: "Marketplace tab kholo. Sell Credits aapke credits aapki keemat par list karta hai — khareedar UPI ya bank se pay karte hain. Live price digital market se aati hai aur har 10 minute mein refresh hoti hai. Khareedne ke liye sellers se contact bhi kar sakte ho.",
    },
  },
  {
    kw: ["price", "rate", "cost", "dam", "keemat", "bhav", "भाव", "कीमत", "दाम"],
    a: {
      en: "The current market rate shows on your dashboard chip and in Potential Earnings. It is a live price from the digital carbon market, cached for 10 minutes so it also works offline.",
      hi: "मौजूदा रेट डैशबोर्ड के चिप और पोटेंशियल अर्निंग्स में दिखता है। यह डिजिटल कार्बन मार्केट का लाइव भाव है, जो 10 मिनट के लिए कैश रहता है (ऑफ़लाइन भी चलता है)।",
      hinglish: "Current rate dashboard ke chip aur Potential Earnings mein dikhta hai. Ye digital carbon market ka live bhaav hai, jo 10 minute ke liye cache rehta hai (offline bhi chalta hai).",
    },
  },
  {
    kw: ["payment", "money", "upi", "withdraw", "paisa", "निकाल", "यूपीआई", "पैसे", "पेमेंट", "bank", "vapas"],
    a: {
      en: "Add your UPI ID or bank details in Payment & Wallet. Buyers pay you directly — no middle fees. Your total earnings and sold credits also appear there.",
      hi: "पेमेंट एंड वॉलेट में अपना UPI ID या बैंक विवरण जोड़ें। खरीदार आपको सीधे भुगतान करते हैं — बीच में कोई फ़ीस नहीं। आपकी कुल कमाई और बिके क्रेडिट भी वहीं दिखते हैं।",
      hinglish: "Payment & Wallet mein apna UPI ID ya bank details add karo. Khareedar seedha pay karte hain — beech mein koi fee nahi. Aapki total earning aur beche credits bhi wahi dikhte hain.",
    },
  },
  {
    kw: ["vehicle", "car", "bike", "taxi", "pollution", "fuel", "emission", "gadi", "vahan", "गाड़ी", "प्रदूषण", "वाहन"],
    a: {
      en: "The Vehicles & Pollution tab lets you add your car or bike, see its CO₂ emission per km, and log trips. It shows your pollution footprint and how many carbon credits that equals.",
      hi: "व्हीकल्स एंड पॉल्यूशन टैब में गाड़ी या बाइक जोड़ें, प्रति किमी CO₂ उत्सर्जन देखें और सफ़र लॉग करें। यह आपका प्रदूषण फ़ुटप्रिंट और उसके बराबर कार्बन क्रेडिट दिखाता है।",
      hinglish: "Vehicles & Pollution tab mein gadi ya bike add karo, per km CO2 emission dekho aur trips log karo. Ye aapka pollution footprint aur uske barabar carbon credits dikhata hai.",
    },
  },
  {
    kw: ["admin", "administrator", "एडमिन"],
    a: {
      en: "Admins use a separate panel (the Admin Panel card on the homepage). There they manage farmers, verify email/phone, view stats and remove bad marketplace listings. Admin login works only for the admin role.",
      hi: "एडमिन के लिए अलग पैनल है (होमपेज का एडमिन पैनल कार्ड)। वहाँ फ़ार्मर मैनेज, ईमेल/फ़ोन वेरिफाई, आँकड़े देखना और मार्केटप्लेस की ख़राब लिस्टिंग हटाना होता है। एडमिन लॉगिन सिर्फ़ एडमिन रोल के लिए है।",
      hinglish: "Admin ke liye alag panel hai (homepage ka Admin Panel card). Wahan farmers manage, email/phone verify, stats dekhna aur marketplace ki kharab listings hatana hota hai. Admin login sirf admin role ke liye hai.",
    },
  },
  {
    kw: ["install", "download", "app", "apk", "instal", "इंस्टॉल", "ऐप", "डाउनलोड", "home screen"],
    a: {
      en: "You can install this site like an app! On Chrome, open the menu (⋮) and tap Install app or Add to Home screen. After the first load it even works fully offline.",
      hi: "इस साइट को ऐप की तरह इंस्टॉल कर सकते हैं! Chrome में मेन्यू (⋮) खोलें और इंस्टॉल ऐप या होम स्क्रीन पर जोड़ें दबाएँ। पहली बार खोलने के बाद यह पूरी तरह ऑफ़लाइन भी चलती है।",
      hinglish: "Is site ko app ki tarah install kar sakte ho! Chrome mein menu (⋮) kholo aur Install app ya Add to Home Screen dabao. Pehli baar kholne ke baad ye poora offline bhi chalti hai.",
    },
  },
  {
    kw: ["hindi", "hinglish", "english", "language", "bhasha", "हिंदी", "भाषा", "english mein", "hindi mein"],
    a: {
      en: "Choose any language you like — we speak English, Hindi and Hinglish. Just tap the language pill. Answers appear in that language, and I read them aloud in a female voice.",
      hi: "आप कोई भी भाषा चुनें — हम अंग्रेज़ी, हिंदी और हिंग्लिश तीनों बोलते हैं। बस भाषा की पिल दबाएँ। जवाब उसी भाषा में होंगे, और मैं उन्हें महिला आवाज़ में पढ़कर सुनाती हूँ।",
      hinglish: "Aap koi bhi language chuno — hum English, Hindi aur Hinglish teeno bolte hain. Bas language pill dabao. Jawab usi bhasha mein honge, aur main unhein female awaaz mein padhkar sunati hoon.",
    },
  },
];

const GREET: Record<Lang, string> = {
  en: "Namaste! I'm Sakhi, your digital guide for Kisan Carbon Hub. Ask me anything about the website in Hindi, English or Hinglish — or tap a quick question below.",
  hi: "नमस्ते! मैं सखी हूँ, किसान कार्बन हब के लिए आपकी डिजिटल सहेली। वेबसाइट के बारे में हिंदी, अंग्रेज़ी या हिंग्लिश में कुछ भी पूछिए — या नीचे दिए सवालों में से एक दबाइए।",
  hinglish: "Namaste! Main Sakhi hoon, Kisan Carbon Hub ki aapki digital saheli. Website ke baare mein Hindi, English ya Hinglish mein kuch bhi poochiye — ya neeche diye sawaalon mein se ek dabaiye.",
};

const FALLBACK: Answered = {
  en: "Hmm, I'm not sure about that one. Try asking about: register land, carbon credits, selling, payment, calculator, vehicles, or languages. I speak Hindi, English and Hinglish.",
  hi: "हम्म, यह सवाल मुझे समझ नहीं आया। पूछिए: ज़मीन रजिस्टर, कार्बन क्रेडिट, बेचना, पेमेंट, कैलकुलेटर, वाहन, या भाषा। मैं हिंदी, अंग्रेज़ी और हिंग्लिश बोलती हूँ।",
  hinglish: "Hmm, ye sawaal mujhe samajh nahi aaya. Poojiye: zameen register, carbon credit, bechna, payment, calculator, vehicle, ya bhasha. Main Hindi, English aur Hinglish bolti hoon.",
};

const CHIPS: Record<Lang, string[]> = {
  en: ["How do I register land?", "What are carbon credits?", "How do I sell credits?", "How to withdraw money?"],
  hi: ["ज़मीन कैसे रजिस्टर करें?", "कार्बन क्रेडिट क्या है?", "क्रेडिट कैसे बेचें?", "पैसे कैसे निकालें?"],
  hinglish: ["Land kaise register karein?", "Carbon credit kya hai?", "Credits kaise bechein?", "Paisa kaise milega?"],
};

let nextId = 1;

export default function HelpBot() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  const [voice, setVoice] = useState(true);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const greeted = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const load = () => window.speechSynthesis.getVoices();
      load();
      window.speechSynthesis.onvoiceschanged = load;
    }
  }, []);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing, open]);

  const push = (m: Msg) => setMessages((prev) => [...prev, m]);

  const speak = (text: string, l: Lang) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance();
      const hi = l === "hi" || l === "hinglish";
      u.lang = hi ? "hi-IN" : "en-IN";
      const voices = window.speechSynthesis.getVoices();
      let v: SpeechSynthesisVoice | null = null;
      if (hi) {
        v = voices.find((x) => x.lang.toLowerCase().startsWith("hi") && !/male/i.test(x.name)) ||
            voices.find((x) => x.lang.toLowerCase().startsWith("hi")) || null;
      } else {
        v = voices.find((x) => /female|zira|natural/i.test(x.name)) ||
            voices.find((x) => x.lang.toLowerCase().startsWith("en")) || null;
      }
      if (v) { u.voice = v; u.lang = v.lang; }
      u.pitch = 1.08;
      u.rate = 0.95;
      u.volume = 1;
      u.text = text;
      window.speechSynthesis.speak(u);
    } catch {}
  };

  const detectLang = (raw: string): Lang => {
    if (/[\u0900-\u097F]/.test(raw)) return "hi";
    if (lang === "en" && /(kaise|kya|karein|kare|hai|mein|hoon|tum|nahi|meri|akhand|bechna)/i.test(raw)) return "hinglish";
    return lang;
  };

  const replyTo = (raw: string): { text: string; speakText: string; l: Lang } => {
    const q = raw.trim().toLowerCase();
    if (/(\bstop\b|band karo|बंद करो|चुप)/i.test(q)) {
      if (typeof window !== "undefined" && window.speechSynthesis) { try { window.speechSynthesis.cancel(); } catch {} }
      return {
        text: "Voice paused. To speak again, tap the speaker button at the top.",
        speakText: "",
        l: detectLang(raw),
      };
    }
    const l = detectLang(raw);
    let best: Answered | null = null;
    for (const item of KB) {
      if (item.kw.some((k) => q.includes(k.toLowerCase()))) { best = item.a; break; }
    }
    const ans = best || FALLBACK;
    const text = ans[l];
    return { text, speakText: l === "hinglish" ? ans.hi : text, l };
  };

  const send = (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text) return;
    setInput("");
    push({ id: nextId++, by: "user", text });
    setTyping(true);
    const reply = replyTo(text);
    setTimeout(() => {
      setTyping(false);
      push({ id: nextId++, by: "bot", text: reply.text });
      if (voice && reply.speakText) speak(reply.speakText, reply.l);
    }, 650);
  };

  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next && !greeted.current) {
      greeted.current = true;
      const g = GREET[lang];
      push({ id: nextId++, by: "bot", text: g });
      if (voice) speak(g, lang);
    }
  };

  const changeLang = (l: Lang) => {
    setLang(l);
    if (voice) speak(l === "hinglish" ? "मैं हिंदी, अंग्रेज़ी और हिंग्लिश बोलती हूँ।" : GREET[l], l);
  };

  const stopVoice = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) { try { window.speechSynthesis.cancel(); } catch {} }
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-4 right-4 z-[3000] w-[calc(100vw-2rem)] max-w-sm flex flex-col rounded-3xl bg-white shadow-2xl border border-pink-100 overflow-hidden max-h-[75vh]">
          <div className="bg-gradient-to-r from-rose-500 to-pink-600 text-white p-4 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 25% 30%, rgba(255,255,255,.6) 0 1.5px, transparent 1.6px)", backgroundSize: "24px 24px" }} />
            <div className="relative flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                <Bot className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black leading-tight">Sakhi — AI Guide</p>
                <p className="text-[11px] text-rose-100">Female voice · English · हिंदी · Hinglish</p>
              </div>
              <button onClick={() => { stopVoice(); setVoice((v) => !v); }} className="w-9 h-9 bg-white/15 hover:bg-white/25 rounded-lg flex items-center justify-center" aria-label="Toggle voice">
                {voice ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button onClick={() => { stopVoice(); setOpen(false); }} className="w-9 h-9 bg-white/15 hover:bg-white/25 rounded-lg flex items-center justify-center" aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-1 p-2 bg-rose-50 border-b border-rose-100">
            {LANGS.map((l) => (
              <button key={l.key} onClick={() => changeLang(l.key)}
                className={`px-3 py-1.5 text-xs font-bold rounded-full transition-colors ${lang === l.key ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow" : "text-rose-700 hover:bg-rose-100"}`}>
                {l.label}
              </button>
            ))}
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-gradient-to-b from-rose-50/40 to-white min-h-[220px] max-h-[45vh]">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.by === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-3.5 py-2.5 text-sm leading-snug rounded-2xl ${m.by === "user" ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-br-sm" : "bg-white border border-pink-100 shadow-sm rounded-bl-sm"}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-white border border-pink-100 shadow-sm px-3.5 py-2.5 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce [animation-delay:120ms]" />
                  <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce [animation-delay:240ms]" />
                </div>
              </div>
            )}
          </div>

          <div className="px-3 pt-0.5 flex gap-2 overflow-x-auto pb-1">
            {CHIPS[lang].map((c) => (
              <button key={c} onClick={() => send(c)}
                className="shrink-0 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-100 px-3 py-1.5 rounded-full transition-colors">
                {c}
              </button>
            ))}
          </div>

          <div className="p-3 border-t border-gray-100 flex items-center gap-2 bg-white">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send(); }}
              placeholder={lang === "hi" ? "यहाँ लिखें…" : lang === "hinglish" ? "Yahan likhiye…" : "Type your question…"}
              className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
            <button onClick={() => send()} className="w-11 h-11 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/30 transition-all">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {!open && (
        <button onClick={toggleOpen}
          className="fixed bottom-5 right-5 z-[3000] w-14 h-14 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-xl shadow-rose-500/40 hover:scale-105 transition-transform">
          <span className="absolute inset-0 rounded-full bg-rose-400/40 animate-ping" />
          <MessageCircle className="w-7 h-7 relative" />
        </button>
      )}
    </>
  );
}