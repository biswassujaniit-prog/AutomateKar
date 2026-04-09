import { useState, useEffect, useRef } from "react";

const openWA = (msg) => { window.open(`/chat?m=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer"); };

const FLOWS = {
  clinic: { name: "City Care Clinic", icon: "🏥", steps: [
    { id: "start", from: "bot", text: "Welcome to City Care Clinic! 👋\n\nHow can I help you today?", buttons: ["📅 Book Appointment", "⏰ Clinic Timings", "📍 Location"] },
    { trigger: "📅 Book Appointment", from: "bot", text: "Please select a doctor:", buttons: ["Dr. Mehta (General)", "Dr. Shah (Dental)", "Dr. Iyer (Ortho)"] },
    { trigger: "Dr. Mehta (General)", from: "bot", text: "Dr. Mehta's slots tomorrow:\n\n🟢 10:00 AM\n🟢 11:30 AM\n🟢 2:00 PM\n🟢 4:30 PM", buttons: ["10:00 AM", "11:30 AM", "2:00 PM", "4:30 PM"] },
    { trigger: "Dr. Shah (Dental)", from: "bot", text: "Dr. Shah's slots tomorrow:\n\n🟢 9:30 AM\n🟢 12:00 PM\n🟢 3:30 PM", buttons: ["9:30 AM", "12:00 PM", "3:30 PM"] },
    { trigger: "Dr. Iyer (Ortho)", from: "bot", text: "Dr. Iyer's slots tomorrow:\n\n🟢 10:30 AM\n🟢 1:00 PM\n🟢 5:00 PM", buttons: ["10:30 AM", "1:00 PM", "5:00 PM"] },
    ...(["10:00 AM","11:30 AM","2:00 PM","4:30 PM","9:30 AM","12:00 PM","3:30 PM","10:30 AM","1:00 PM","5:00 PM"].map(t=>({ trigger: t, from: "bot", text: "Selected: "+t+" ✓\n\nPlease share the patient's name:", expectInput: true }))),
    { trigger: "__input__", from: "bot", text: "✅ Appointment Confirmed!\n\n👨‍⚕️ Tomorrow at your selected time\n📍 City Care Clinic, Vashi\n\n⏰ Reminder 2 hrs before.\n\nAnything else?", buttons: ["📅 Book Another", "⭐ Rate Us", "👋 Thank you!"] },
    { trigger: "📅 Book Another", from: "bot", text: "Please select a doctor:", buttons: ["Dr. Mehta (General)", "Dr. Shah (Dental)", "Dr. Iyer (Ortho)"] },
    { trigger: "⏰ Clinic Timings", from: "bot", text: "🕐 Clinic Hours:\n\nMon–Fri: 9 AM – 8 PM\nSat: 9 AM – 2 PM\nSun: Closed\n\n📞 Emergency: +91 98765 43210", buttons: ["📅 Book Appointment", "📍 Location"] },
    { trigger: "📍 Location", from: "bot", text: "📍 City Care Clinic\nPlot 45, Sector 17, Vashi\nNavi Mumbai 400703\n\n🚇 Vashi Station (5 min walk)", buttons: ["📅 Book Appointment", "⏰ Clinic Timings"] },
    { trigger: "⭐ Rate Us", from: "bot", text: "Thank you! 🙏\n\n⭐ Leave a Google Review:\n[Review Link]\n\nYour review helps others!", buttons: ["📅 Book Another", "👋 Thank you!"] },
    { trigger: "👋 Thank you!", from: "bot", text: "Thank you! 🙏 We're here whenever you need us. Just say Hi! 👋", buttons: ["🔄 Start Over"] },
    { trigger: "🔄 Start Over", from: "bot", text: "Welcome back! 👋 How can I help?", buttons: ["📅 Book Appointment", "⏰ Clinic Timings", "📍 Location"] },
  ]},
  salon: { name: "Glow Studio", icon: "💇", steps: [
    { id: "start", from: "bot", text: "Hi! Welcome to Glow Studio ✨\n\nWhat would you like to do?", buttons: ["✂️ Book Service", "💰 View Prices", "🎁 Today's Offers"] },
    { trigger: "✂️ Book Service", from: "bot", text: "Choose a category:", buttons: ["💇 Hair", "💅 Nails", "🧖 Skin/Facial", "💄 Bridal"] },
    { trigger: "💇 Hair", from: "bot", text: "Hair Services:\n\n✂️ Haircut — ₹500\n🎨 Color — ₹1,500\n💆 Hair Spa — ₹800", buttons: ["Haircut ₹500", "Color ₹1,500", "Hair Spa ₹800"] },
    { trigger: "💅 Nails", from: "bot", text: "Nail Services:\n\n💅 Manicure — ₹400\n💅 Pedicure — ₹500\n✨ Gel Nails — ₹1,200", buttons: ["Manicure ₹400", "Pedicure ₹500", "Gel Nails ₹1,200"] },
    { trigger: "🧖 Skin/Facial", from: "bot", text: "Skin Services:\n\n🧖 Classic Facial — ₹800\n✨ Gold Facial — ₹1,500\n🌿 Cleanup — ₹500", buttons: ["Facial ₹800", "Gold Facial ₹1,500", "Cleanup ₹500"] },
    { trigger: "💄 Bridal", from: "bot", text: "💄 Bridal Packages:\n\n👰 Basic: ₹15,000\n👰 Premium: ₹25,000\n\nBook a consultation?", buttons: ["Book Consultation", "✂️ Book Service"] },
    ...(["Haircut ₹500","Color ₹1,500","Hair Spa ₹800","Manicure ₹400","Pedicure ₹500","Gel Nails ₹1,200","Facial ₹800","Gold Facial ₹1,500","Cleanup ₹500","Book Consultation"].map(s=>({ trigger: s, from: "bot", text: "Great choice! ✨ Slots tomorrow:\n\n🟢 10:00 AM\n🟢 12:30 PM\n🟢 3:00 PM\n🟢 5:30 PM", buttons: ["10 AM — Book", "12:30 PM — Book", "3 PM — Book", "5:30 PM — Book"] }))),
    ...(["10 AM — Book","12:30 PM — Book","3 PM — Book","5:30 PM — Book"].map(t=>({ trigger: t, from: "bot", text: "✅ Booking Confirmed!\n\n📅 Tomorrow, "+t.replace(" — Book","")+"\n📍 Glow Studio, Vashi\n\n⏰ Reminder 1 hr before.\nReply CANCEL anytime.", buttons: ["🎁 Today's Offers", "⭐ Rate Us", "👋 Thanks!"] }))),
    { trigger: "🎁 Today's Offers", from: "bot", text: "🔥 This Week:\n\n✨ Hair Spa + Facial Combo\n₹1,800 → ₹1,299 (28% OFF)\n\n✨ Refer a friend = 20% off!", buttons: ["✂️ Book Service", "💰 View Prices", "👋 Thanks!"] },
    { trigger: "💰 View Prices", from: "bot", text: "💰 Price Menu:\n\n💇 Hair: ₹500–₹3,500\n💅 Nails: ₹300–₹1,200\n🧖 Facials: ₹500–₹2,500\n💄 Bridal: ₹15,000+", buttons: ["✂️ Book Service", "🎁 Today's Offers"] },
    { trigger: "⭐ Rate Us", from: "bot", text: "Loved it? 💕\n\n⭐ Leave a Google Review and get 10% off next visit!", buttons: ["✂️ Book Service", "👋 Thanks!"] },
    { trigger: "👋 Thanks!", from: "bot", text: "Thank you! See you soon! 💕✨", buttons: ["🔄 Start Over"] },
    { trigger: "🔄 Start Over", from: "bot", text: "Welcome back! ✨ What would you like?", buttons: ["✂️ Book Service", "💰 View Prices", "🎁 Today's Offers"] },
  ]},
  coaching: { name: "Excel Academy", icon: "📚", steps: [
    { id: "start", from: "bot", text: "Welcome to Excel Academy! 📚\n\nHow can we help?", buttons: ["📋 Course Enquiry", "📅 Book Demo Class", "💰 Fee Structure"] },
    { trigger: "📋 Course Enquiry", from: "bot", text: "Which program?", buttons: ["🧪 IIT-JEE", "🔬 NEET", "📊 CA Foundation", "📖 Board Prep (8-10)"] },
    { trigger: "🧪 IIT-JEE", from: "bot", text: "IIT-JEE:\n\n📗 2-Year (Class 11)\n📘 1-Year Crash (Class 12)\n📙 Dropper Batch", buttons: ["2-Year Program", "1-Year Crash", "Dropper Batch"] },
    { trigger: "🔬 NEET", from: "bot", text: "NEET:\n\n📗 2-Year (Class 11)\n📘 1-Year Crash\n📙 Repeater Batch", buttons: ["NEET 2-Year", "NEET 1-Year", "NEET Repeater"] },
    { trigger: "📊 CA Foundation", from: "bot", text: "CA Foundation:\n\n📗 Full Course (6 months)\n📘 Crash Course (3 months)", buttons: ["CA Full", "CA Crash"] },
    { trigger: "📖 Board Prep (8-10)", from: "bot", text: "Board Prep:\n\n📗 Class 8-9 (CBSE/ICSE)\n📘 Class 10 Board", buttons: ["Class 8-9", "Class 10 Board"] },
    ...(["2-Year Program","1-Year Crash","Dropper Batch","NEET 2-Year","NEET 1-Year","NEET Repeater","CA Full","CA Crash","Class 8-9","Class 10 Board"].map(p=>({ trigger: p, from: "bot", text: p+" — Great choice! ✅\n\nStudent's name?", expectInput: true }))),
    { trigger: "__input__", from: "bot", text: "✅ Enquiry Registered!\n\n📅 FREE Demo: This Saturday, 10 AM\n📍 Excel Academy, Kharghar\n\n📞 Counselor will call within 2 hrs.", buttons: ["💰 Fee Structure", "📍 Location", "👋 Thanks!"] },
    { trigger: "📅 Book Demo Class", from: "bot", text: "Free demos this week:\n\n🧪 JEE Physics — Sat 10 AM\n🔬 NEET Bio — Sat 11 AM\n📊 CA Accounts — Sun 10 AM", buttons: ["JEE Physics", "NEET Bio", "CA Accounts"] },
    ...(["JEE Physics","NEET Bio","CA Accounts"].map(d=>({ trigger: d, from: "bot", text: "✅ Demo Booked: "+d+"\n\n📍 Excel Academy, Kharghar\n📝 Free study material!\n\nAnything else?", buttons: ["📅 Book Demo Class", "💰 Fee Structure", "👋 Thanks!"] }))),
    { trigger: "💰 Fee Structure", from: "bot", text: "💰 Fees 2026-27:\n\n🧪 JEE 2yr: ₹1,80,000\n🧪 JEE 1yr: ₹1,20,000\n🔬 NEET 2yr: ₹1,60,000\n📊 CA: ₹80,000\n📖 Board: ₹40,000\n\n✅ 0% EMI · Merit scholarship up to 50%", buttons: ["📋 Course Enquiry", "📅 Book Demo Class"] },
    { trigger: "📍 Location", from: "bot", text: "📍 Excel Academy\nSector 35, Kharghar\nNavi Mumbai 410210\n\n🚇 Kharghar Station (8 min)\n📞 98765 43210", buttons: ["📋 Course Enquiry", "📅 Book Demo Class"] },
    { trigger: "👋 Thanks!", from: "bot", text: "Thank you! 🎓 We're here to help. Just message anytime!", buttons: ["🔄 Start Over"] },
    { trigger: "🔄 Start Over", from: "bot", text: "Welcome back! 📚 How can we help?", buttons: ["📋 Course Enquiry", "📅 Book Demo Class", "💰 Fee Structure"] },
  ]}
};

function ChatSim({ flow }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [buttons, setButtons] = useState([]);
  const [typing, setTyping] = useState(false);
  const [waitingInput, setWaitingInput] = useState(false);
  const chatRef = useRef(null);
  const timerRef = useRef(null);

  const resetChat = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessages([]); setButtons([]); setWaitingInput(false); setInput(""); setTyping(false);
    timerRef.current = setTimeout(() => {
      const s = FLOWS[flow].steps.find(s => s.id === "start");
      if (s) addBotMsg(s);
    }, 400);
  };

  useEffect(() => { resetChat(); return () => { if (timerRef.current) clearTimeout(timerRef.current); }; }, [flow]);
  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [messages, buttons, typing]);

  const addBotMsg = (step) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(p => [...p, { from: "bot", text: step.text, time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) }]);
      if (step.buttons) { setButtons(step.buttons); setWaitingInput(false); }
      else if (step.expectInput) { setButtons([]); setWaitingInput(true); }
      else { setButtons([]); setWaitingInput(false); }
    }, 700 + Math.random() * 400);
  };

  const handleBtn = (label) => {
    setMessages(p => [...p, { from: "user", text: label, time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) }]);
    setButtons([]);
    const next = FLOWS[flow].steps.find(s => s.trigger === label);
    if (next) addBotMsg(next);
  };

  const handleSend = () => {
    if (!input.trim() || !waitingInput) return;
    setMessages(p => [...p, { from: "user", text: input.trim(), time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) }]);
    setInput(""); setWaitingInput(false);
    const next = FLOWS[flow].steps.find(s => s.trigger === "__input__");
    if (next) addBotMsg(next);
  };

  const fd = FLOWS[flow];
  return (
    <div style={{ width: "100%", maxWidth: 380, borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.18)", fontFamily: "'Segoe UI',sans-serif" }}>
      <div style={{ background: "#075E54", padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{fd.icon}</div>
        <div style={{ flex: 1 }}><div style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>{fd.name}</div><div style={{ color: "#b5dbb5", fontSize: 10 }}>online</div></div>
        <span onClick={resetChat} style={{ color: "#b5dbb5", fontSize: 10, cursor: "pointer", padding: "3px 8px", borderRadius: 6, border: "1px solid #25D366" }}>↻ Reset</span>
      </div>
      <div ref={chatRef} style={{ background: "#ECE5DD", height: 360, overflowY: "auto", padding: "10px 8px", display: "flex", flexDirection: "column", gap: 5 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.from === "user" ? "flex-end" : "flex-start", maxWidth: "82%", animation: "msgIn 0.25s ease-out" }}>
            <div style={{ background: m.from === "user" ? "#DCF8C6" : "#fff", padding: "7px 10px 3px", borderRadius: m.from === "user" ? "10px 10px 2px 10px" : "10px 10px 10px 2px", boxShadow: "0 1px 2px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize: 13, lineHeight: 1.45, whiteSpace: "pre-wrap", color: "#111" }}>{m.text}</div>
              <div style={{ fontSize: 9.5, color: "#888", textAlign: "right", marginTop: 1 }}>{m.time}{m.from === "user" ? " ✓✓" : ""}</div>
            </div>
          </div>
        ))}
        {typing && <div style={{ alignSelf: "flex-start", background: "#fff", padding: "9px 14px", borderRadius: 10 }}>
          <div style={{ display: "flex", gap: 4 }}>{[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#999", animation: `dotPulse 1.2s ease-in-out ${i*0.2}s infinite` }}/>)}</div>
        </div>}
        {buttons.length > 0 && <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 3, alignSelf: "flex-start", maxWidth: "85%" }}>
          {buttons.map(b => <button key={b} onClick={() => handleBtn(b)} style={{ background: "#fff", border: "1px solid #25D366", borderRadius: 8, padding: "8px 12px", fontSize: 12.5, color: "#075E54", fontWeight: 600, cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "all 0.15s" }}
            onMouseOver={e => { e.currentTarget.style.background = "#25D366"; e.currentTarget.style.color = "#fff"; }}
            onMouseOut={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#075E54"; }}>{b}</button>)}
        </div>}
      </div>
      <div style={{ background: "#F0F0F0", padding: "7px 8px", display: "flex", gap: 7, alignItems: "center" }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()}
          disabled={!waitingInput} placeholder={waitingInput ? "Type your name..." : "Tap a button above ☝️"}
          style={{ flex: 1, border: "none", borderRadius: 20, padding: "9px 14px", fontSize: 13, outline: "none", fontFamily: "inherit", background: waitingInput ? "#fff" : "#e8e8e8", color: waitingInput ? "#111" : "#999" }} />
        <button onClick={handleSend} disabled={!waitingInput} style={{ width: 36, height: 36, borderRadius: "50%", background: waitingInput ? "#075E54" : "#aaa", border: "none", color: "#fff", fontSize: 16, cursor: waitingInput ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center" }}>➤</button>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [activeDemo, setActiveDemo] = useState("clinic");
  const [visibleSections, setVisibleSections] = useState(new Set(["industries","services","demo","pricing","howitworks"]));
  const [annual, setAnnual] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { const o = new IntersectionObserver(es => { es.forEach(e => { if (e.isIntersecting) setVisibleSections(p => new Set([...p, e.target.id])); }); }, { threshold: 0.1 }); document.querySelectorAll("[data-animate]").forEach(el => o.observe(el)); return () => o.disconnect(); }, []);
  const vis = id => visibleSections.has(id) ? { opacity: 1, transform: "translateY(0)" } : { opacity: 0, transform: "translateY(30px)" };
  const services = [
    { icon: "💬", title: "WhatsApp Appointment Bot", desc: "Patients/customers book directly on WhatsApp. Auto-reminders reduce no-shows by 35%.", price: "Included in all plans" },
    { icon: "🤖", title: "AI-Powered FAQ Bot", desc: "Answers 70% of repetitive queries instantly. Works 24/7, never takes a leave.", price: "From Growth plan" },
    { icon: "⭐", title: "Google Review Booster", desc: "Auto-collects reviews after every visit. 20 to 200+ reviews in 3 months.", price: "Add-on ₹1,499/mo" },
    { icon: "📢", title: "Bulk Campaign Engine", desc: "Send offers & updates to 1000s of customers with 95% open rate.", price: "Included in all plans" },
    { icon: "💳", title: "Payment Collection", desc: "Razorpay payment links on WhatsApp. Fee reminders with one-tap pay.", price: "From Growth plan" },
    { icon: "📊", title: "Analytics Dashboard", desc: "Track bookings, messages, reviews & revenue impact. Mobile-friendly.", price: "From Premium plan" },
  ];
  const industries = [
    { icon: "🏥", name: "Clinics & Doctors", stat: "35% fewer no-shows" },{ icon: "📚", name: "Coaching Centres", stat: "3x faster lead follow-up" },
    { icon: "💇", name: "Salons & Spas", stat: "25% more rebookings" },{ icon: "🏠", name: "Real Estate", stat: "10-sec lead response" },
    { icon: "📋", name: "CA & Tax Firms", stat: "80% less manual follow-up" },{ icon: "🔬", name: "Diagnostic Labs", stat: "Instant report delivery" },
    { icon: "🍕", name: "Restaurants", stat: "WhatsApp ordering" },{ icon: "💪", name: "Gyms & Fitness", stat: "Automated renewals" },
  ];
  const NL = ["Services","Demo","Pricing","Industries"];
  return (
    <div style={{ fontFamily: "'DM Sans','Helvetica Neue',sans-serif", background: "#FAFAF8", color: "#1a1a1a", overflowX: "hidden" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
        @keyframes msgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes dotPulse{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        [data-animate]{transition:opacity 0.7s ease,transform 0.7s ease}
        *{box-sizing:border-box;margin:0;padding:0} html{scroll-behavior:smooth}
        @media(max-width:768px){.hero-title{font-size:28px!important}.hero-flex{flex-direction:column!important;gap:28px!important;padding-top:36px!important}.hero-chat{animation:none!important}.nav-links{display:none!important}.burger{display:flex!important}.mobile-menu-show{display:flex!important}}
        @media(min-width:769px){.burger{display:none!important}}
      `}</style>
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(250,250,248,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #e8e6e1", padding: "0 20px" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 58 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#075E54,#25D366)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>A</div>
            <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 18, color: "#1a1a1a" }}>AutomateKar</span>
          </div>
          <div className="nav-links" style={{ display: "flex", gap: 22, alignItems: "center", fontSize: 13.5 }}>
            {NL.map(l => <a key={l} href={`#${l.toLowerCase()}`} style={{ color: "#555", textDecoration: "none", fontWeight: 500 }}>{l}</a>)}
            <span onClick={() => openWA("Hi, I want to automate my business")} style={{ background: "#25D366", color: "#fff", padding: "8px 16px", borderRadius: 8, fontWeight: 600, fontSize: 12.5, textDecoration: "none", cursor: "pointer" }}>💬 Get Started</span>
          </div>
          <div className="burger" onClick={() => setMenuOpen(!menuOpen)} style={{ display: "none", flexDirection: "column", gap: 5, cursor: "pointer", padding: 8 }}>
            <div style={{ width: 22, height: 2, background: "#333", borderRadius: 2, transition: "0.3s", transform: menuOpen ? "rotate(45deg) translateY(7px)" : "none" }}/><div style={{ width: 22, height: 2, background: "#333", opacity: menuOpen ? 0 : 1, transition: "0.3s" }}/><div style={{ width: 22, height: 2, background: "#333", borderRadius: 2, transition: "0.3s", transform: menuOpen ? "rotate(-45deg) translateY(-7px)" : "none" }}/>
          </div>
        </div>
        {menuOpen && <div className="mobile-menu-show" style={{ display: "flex", flexDirection: "column", paddingBottom: 10, borderTop: "1px solid #eee" }}>
          {NL.map(l => <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMenuOpen(false)} style={{ padding: "11px 16px", color: "#333", textDecoration: "none", fontWeight: 500, fontSize: 14, borderBottom: "1px solid #f0f0f0" }}>{l}</a>)}
          <span onClick={() => { setMenuOpen(false); openWA("Hi, I want to automate my business"); }} style={{ margin: "8px 16px", background: "#25D366", color: "#fff", padding: "10px 0", borderRadius: 8, fontWeight: 600, fontSize: 13, textDecoration: "none", textAlign: "center", cursor: "pointer", display: "block" }}>💬 Get Started Free</span>
        </div>}
      </nav>

      <section className="hero-flex" style={{ maxWidth: 1140, margin: "0 auto", padding: "60px 20px 46px", display: "flex", alignItems: "center", gap: 46, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 450px", minWidth: 270 }}>
          <div style={{ display: "inline-block", background: "#e8f5e9", color: "#2e7d32", padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, marginBottom: 16 }}>🚀 For Mumbai & Navi Mumbai businesses</div>
          <h1 className="hero-title" style={{ fontFamily: "'Playfair Display',serif", fontSize: 42, lineHeight: 1.15, fontWeight: 700, color: "#0d1117", marginBottom: 16 }}>Turn WhatsApp into your <span style={{ color: "#075E54" }}>24/7 receptionist</span></h1>
          <p style={{ fontSize: 15.5, lineHeight: 1.65, color: "#4a4a4a", marginBottom: 26, maxWidth: 480 }}>Automate appointments, follow-ups, payments & reviews for your clinic, salon, or coaching centre. Starting at just ₹2,499/month.</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <span onClick={() => openWA("Hi, I want a free demo")} style={{ background: "#075E54", color: "#fff", padding: "12px 24px", borderRadius: 10, fontWeight: 600, fontSize: 14.5, textDecoration: "none", boxShadow: "0 4px 14px rgba(7,94,84,0.3)", cursor: "pointer" }}>Get Free Demo →</span>
            <a href="#demo" style={{ background: "#fff", color: "#075E54", padding: "12px 24px", borderRadius: 10, fontWeight: 600, fontSize: 14.5, textDecoration: "none", border: "2px solid #075E54" }}>See it Live ↓</a>
          </div>
          <div style={{ display: "flex", gap: 26, marginTop: 30 }}>
            {[["95%","Open rate"],["35%","Fewer no-shows"],["<10s","Response"]].map(([n,l]) => <div key={l}><div style={{ fontSize: 22, fontWeight: 700, color: "#075E54" }}>{n}</div><div style={{ fontSize: 11, color: "#888" }}>{l}</div></div>)}
          </div>
        </div>
        <div className="hero-chat" style={{ flex: "0 1 390px", minWidth: 290, animation: "float 4s ease-in-out infinite" }}><ChatSim flow="clinic" /></div>
      </section>

      <section id="industries" data-animate style={{ ...vis("industries"), maxWidth: 1140, margin: "0 auto", padding: "46px 20px" }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, fontWeight: 700, textAlign: "center", marginBottom: 32 }}>Built for <span style={{ color: "#075E54" }}>every local business</span></h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 10 }}>
          {industries.map(ind => <div key={ind.name} style={{ background: "#fff", border: "1px solid #eee", borderRadius: 10, padding: "14px 12px", display: "flex", alignItems: "center", gap: 10, transition: "box-shadow 0.2s" }} onMouseOver={e => e.currentTarget.style.boxShadow = "0 3px 14px rgba(0,0,0,0.06)"} onMouseOut={e => e.currentTarget.style.boxShadow = "none"}>
            <div style={{ fontSize: 24 }}>{ind.icon}</div><div><div style={{ fontWeight: 600, fontSize: 13 }}>{ind.name}</div><div style={{ fontSize: 11.5, color: "#25D366", fontWeight: 600 }}>{ind.stat}</div></div>
          </div>)}
        </div>
      </section>

      <section id="services" data-animate style={{ ...vis("services"), background: "#fff", padding: "56px 20px" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, fontWeight: 700, textAlign: "center", marginBottom: 10 }}>What we <span style={{ color: "#075E54" }}>build for you</span></h2>
          <p style={{ color: "#666", textAlign: "center", fontSize: 13.5, marginBottom: 36 }}>Everything runs on WhatsApp. No app downloads needed.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 16 }}>
            {services.map(s => <div key={s.title} style={{ border: "1px solid #eee", borderRadius: 12, padding: "22px 20px", transition: "box-shadow 0.3s, border-color 0.3s" }} onMouseOver={e => { e.currentTarget.style.boxShadow = "0 6px 22px rgba(7,94,84,0.06)"; e.currentTarget.style.borderColor = "#25D366"; }} onMouseOut={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#eee"; }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{s.icon}</div><div style={{ fontWeight: 700, fontSize: 15, marginBottom: 5 }}>{s.title}</div><div style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 10 }}>{s.desc}</div><div style={{ fontSize: 12, fontWeight: 700, color: "#075E54" }}>{s.price}</div>
            </div>)}
          </div>
        </div>
      </section>

      <section id="demo" data-animate style={{ ...vis("demo"), maxWidth: 1140, margin: "0 auto", padding: "56px 20px" }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, fontWeight: 700, textAlign: "center", marginBottom: 8 }}>Try it <span style={{ color: "#075E54" }}>yourself</span></h2>
        <p style={{ color: "#666", textAlign: "center", fontSize: 13.5, marginBottom: 28 }}>Pick an industry and interact with a live bot demo</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {[["clinic","🏥 Clinic"],["salon","💇 Salon"],["coaching","📚 Coaching"]].map(([k,l]) => <button key={k} onClick={() => setActiveDemo(k)} style={{ padding: "9px 20px", borderRadius: 8, border: activeDemo===k ? "2px solid #075E54" : "2px solid #ddd", background: activeDemo===k ? "#075E54" : "#fff", color: activeDemo===k ? "#fff" : "#333", fontWeight: 600, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit" }}>{l}</button>)}
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}><ChatSim flow={activeDemo} /></div>
      </section>

      <section id="pricing" data-animate style={{ ...vis("pricing"), background: "#fff", padding: "56px 20px" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, fontWeight: 700, textAlign: "center", marginBottom: 8 }}>Simple, <span style={{ color: "#075E54" }}>affordable pricing</span></h2>
          <p style={{ color: "#666", textAlign: "center", fontSize: 13.5, marginBottom: 20 }}>Built for Indian small businesses. No hidden costs.</p>
          <div style={{ background: "linear-gradient(135deg,#075E54,#128C7E)", borderRadius: 10, padding: "13px 18px", marginBottom: 26, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 18 }}>🎉</span><span style={{ color: "#fff", fontWeight: 700, fontSize: 13.5 }}>LAUNCH OFFER:</span><span style={{ color: "#b5dbb5", fontSize: 13 }}>First month FREE + 20% off annual</span><span style={{ background: "#25D366", color: "#fff", padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>Limited</span>
          </div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginBottom: 30 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: !annual ? "#075E54" : "#888" }}>Monthly</span>
            <div onClick={() => setAnnual(!annual)} style={{ width: 48, height: 26, borderRadius: 13, background: annual ? "#075E54" : "#ccc", cursor: "pointer", position: "relative", transition: "background 0.3s" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: annual ? 25 : 3, transition: "left 0.3s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: annual ? "#075E54" : "#888" }}>Annual</span>
            {annual && <span style={{ background: "#e8f5e9", color: "#2e7d32", padding: "2px 9px", borderRadius: 10, fontSize: 11, fontWeight: 700 }}>Save 20%</span>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {[
              { name: "Starter", price: annual ? "₹1,999" : "₹2,499", was: annual ? "₹2,499" : null, save: annual ? "Save ₹6,000/yr" : null, features: ["WhatsApp auto-reply bot","Appointment booking","500 messages/month","1 bot flow","Business hours responder","Basic analytics","Email + chat support"], ideal: "Solo doctors, tutors, small salons", cta: false },
              { name: "Growth", price: annual ? "₹4,799" : "₹5,999", was: annual ? "₹5,999" : null, save: annual ? "Save ₹14,400/yr" : null, features: ["Everything in Starter","AI FAQ bot (70% auto-replies)","Google Review automation","2,000 messages/month","Up to 3 bot flows","Razorpay payment links","Auto reminders (appt + fee)","Weekly reports","Priority WhatsApp support"], ideal: "Growing clinics, coaching centres", cta: true },
              { name: "Premium", price: annual ? "₹9,599" : "₹11,999", was: annual ? "₹11,999" : null, save: annual ? "Save ₹28,800/yr" : null, features: ["Everything in Growth","Unlimited bot flows","Full lifecycle automation","5,000+ messages/month","Custom CRM integration","WhatsApp catalog + mini-store","Real-time dashboard","Dedicated account manager","Multi-location support"], ideal: "Multi-doctor clinics, chains", cta: false },
            ].map(plan => (
              <div key={plan.name} style={{ border: plan.cta ? "2px solid #075E54" : "1px solid #eee", borderRadius: 14, padding: "26px 20px", background: plan.cta ? "linear-gradient(180deg,#f0faf4 0%,#fff 100%)" : "#fff", position: "relative", transition: "transform 0.2s, box-shadow 0.2s" }} onMouseOver={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(0,0,0,0.06)"; }} onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                {plan.cta && <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: "#075E54", color: "#fff", padding: "3px 12px", borderRadius: 10, fontSize: 10, fontWeight: 700 }}>BEST VALUE</div>}
                <div style={{ fontSize: 11.5, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: 1 }}>{plan.name}</div>
                <div style={{ marginTop: 5, display: "flex", alignItems: "baseline", gap: 5 }}><span style={{ fontSize: 32, fontWeight: 700, color: "#0d1117" }}>{plan.price}</span><span style={{ fontSize: 13, color: "#888" }}>/mo</span></div>
                {plan.was && <div style={{ display: "flex", gap: 6, marginTop: 3, alignItems: "center" }}><span style={{ fontSize: 12, color: "#999", textDecoration: "line-through" }}>{plan.was}/mo</span><span style={{ fontSize: 10, fontWeight: 700, color: "#2e7d32", background: "#e8f5e9", padding: "2px 6px", borderRadius: 5 }}>{plan.save}</span></div>}
                <div style={{ fontSize: 11, color: "#075E54", fontWeight: 600, marginTop: 5, fontStyle: "italic" }}>Ideal: {plan.ideal}</div>
                <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 7 }}>
                  {plan.features.map(f => <div key={f} style={{ display: "flex", gap: 6, fontSize: 12.5, color: "#444", lineHeight: 1.4 }}><span style={{ color: "#25D366", fontWeight: 700, flexShrink: 0 }}>✓</span>{f}</div>)}
                </div>
                <span onClick={() => openWA(`Hi, I'm interested in ${plan.name} plan`)} style={{ display: "block", textAlign: "center", marginTop: 18, padding: "11px 0", borderRadius: 9, fontWeight: 600, fontSize: 13.5, textDecoration: "none", background: plan.cta ? "#075E54" : "transparent", color: plan.cta ? "#fff" : "#075E54", border: plan.cta ? "none" : "2px solid #075E54", cursor: "pointer" }}>Start Free Trial →</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 26, background: "#f8f9fa", borderRadius: 10, padding: "18px 20px" }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 10 }}>💡 Add-ons (mix with any plan)</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 8 }}>
              {[["⭐ Google Reviews","₹1,499/mo"],["💳 Payment Bot","₹999/mo"],["📢 +1,000 msgs","₹799/mo"],["🌐 Landing Page","₹2,999 once"],["📊 Analytics","₹1,499/mo"],["🔗 Custom API","₹4,999 once"]].map(([n,p]) => <div key={n} style={{ display: "flex", justifyContent: "space-between", background: "#fff", borderRadius: 7, padding: "8px 11px", border: "1px solid #eee", fontSize: 12 }}><span>{n}</span><span style={{ fontWeight: 700, color: "#075E54" }}>{p}</span></div>)}
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: 20, display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap", fontSize: 12, color: "#666" }}>
            <span>✅ 7-day free trial</span><span>✅ No credit card</span><span>✅ Cancel anytime</span><span>✅ Setup in 3 days</span><span>✅ GST invoice</span>
          </div>
          <div style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: "#999" }}>Setup: Starter ₹2,999 | Growth ₹4,999 | Premium ₹9,999 · Meta API charges at cost (₹0.13–₹0.88/msg)</div>
        </div>
      </section>

      <section data-animate id="howitworks" style={{ ...vis("howitworks"), maxWidth: 1140, margin: "0 auto", padding: "56px 20px" }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, fontWeight: 700, textAlign: "center", marginBottom: 36 }}>Live in <span style={{ color: "#075E54" }}>3 days</span></h2>
        <div style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
          {[["1","We Understand","30-min call to map your flow & customer journey"],["2","We Build","Custom WhatsApp bot configured in 48 hours"],["3","You Grow","Go live and watch bookings increase weekly"]].map(([n,t,d]) => <div key={n} style={{ flex: "0 1 250px", textAlign: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#075E54", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, fontWeight: 700, margin: "0 auto 12px" }}>{n}</div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 5 }}>{t}</div><div style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>{d}</div>
          </div>)}
        </div>
      </section>

      <section style={{ background: "#075E54", padding: "46px 20px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 10 }}>Ready to automate your business?</h2>
        <p style={{ color: "#b5dbb5", fontSize: 14, marginBottom: 22 }}>First month FREE · Setup in 3 days · Cancel anytime</p>
        <span onClick={() => openWA("Hi, I want to automate my business")} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#25D366", color: "#fff", padding: "13px 30px", borderRadius: 11, fontWeight: 700, fontSize: 15.5, textDecoration: "none", boxShadow: "0 4px 20px rgba(37,211,102,0.4)", cursor: "pointer" }}>💬 Chat with us on WhatsApp</span>
      </section>

      <footer style={{ background: "#0d1117", color: "#888", padding: "32px 20px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: "linear-gradient(135deg,#075E54,#25D366)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 12 }}>A</div>
          <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 16, color: "#fff" }}>AutomateKar</span>
        </div>
        <div style={{ fontSize: 11.5, lineHeight: 1.8 }}>WhatsApp Automation for Local Businesses<br/>Navi Mumbai, Maharashtra · contact@automatekar.com<br/>© 2026 AutomateKar. All rights reserved.</div>
      </footer>
    </div>
  );
}
