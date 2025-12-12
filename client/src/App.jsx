import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { 
  Search, MapPin, Home, Heart, User, List, Map as MapIcon, 
  School, Star, X, ChevronDown, CheckCircle, Plus, Upload, Layout, Lock, Mail, ArrowRight, 
  Wifi, Wind, Coffee, Shield, MessageCircle, AlertTriangle, Bath, Tv, PawPrint, ZoomIn, ZoomOut, ArrowLeft, Phone, Trash2, Image as ImageIcon, Eye, Menu, DollarSign, Send, ThumbsUp, MessageSquare, Globe, FileText, Bot
} from 'lucide-react';

// CONSTANTS
const AMENITIES_LIST = ["Wifi", "AC", "Kitchen", "Security", "Bathtub", "TV", "Pet Friendly", "Elevator", "Balcony"];
const API_URL = 'http://127.0.0.1:5000/api';

// --- HELPER COMPONENTS ---

const Logo = () => (
  <div className="flex items-center gap-3 cursor-pointer transition-transform hover:scale-105">
    <img 
      src="/logo.png" 
      alt="67 YZUers" 
      className="h-12 w-auto object-contain drop-shadow-md"
      onError={(e) => { e.target.style.display = 'none'; }} 
    />
    <span className="font-black text-2xl tracking-tighter hidden md:block">
      <span className="text-blue-700 drop-shadow-sm">67</span>
      <span className="text-red-600 drop-shadow-sm">YZUers</span>
    </span>
  </div>
);

const GlassCard = ({ children, className = "", onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden ${className}`}
  >
    {children}
  </div>
);

const AmenityIcon = ({ name }) => {
  if (name === "Wifi") return <Wifi size={14} className="text-blue-600" />;
  if (name === "AC") return <Wind size={14} className="text-cyan-600" />;
  if (name === "Kitchen") return <Coffee size={14} className="text-orange-600" />;
  if (name === "Security") return <Shield size={14} className="text-emerald-600" />;
  if (name === "Bathtub") return <Bath size={14} className="text-sky-500" />;
  if (name === "TV") return <Tv size={14} className="text-purple-600" />;
  if (name === "Pet Friendly") return <PawPrint size={14} className="text-amber-700" />;
  return <CheckCircle size={14} className="text-slate-400" />;
};

// --- CHATBOT COMPONENT (Smarter Version) ---
const ChatBot = ({ rooms, setView, handleImageClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: "Hi! 👋 I'm the YZU Bot. I can help you find a room. Which area are you looking for?", options: ["Xingren Road", "Neili Station", "Yuandong Road", "Any"] }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [step, setStep] = useState('area'); 
  const [criteria, setCriteria] = useState({ area: 'Any', budget: 20000 });
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const processInput = (input) => {
    const text = input.toLowerCase();

    // 1. BASIC CONVERSATION HANDLING
    if (text.match(/\b(hi|hello|hey|greetings)\b/)) {
       setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: "Hello! 👋 I'm here to help you find a room. Please tell me which area you prefer?" }]);
       return;
    }
    
    if (text.includes('help') || text.includes('start over') || text.includes('reset')) {
       setStep('area');
       setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: "Okay, let's start fresh! Which area are you interested in?", options: ["Xingren Road", "Neili Station", "Yuandong Road", "Any"] }]);
       return;
    }

    if (text.includes('thank') || text.includes('cool') || text.includes('good')) {
       setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: "You're welcome! Let me know if you need anything else. 😊" }]);
       return;
    }
    
    // 2. AREA LOGIC
    if (step === 'area') {
      if (text.includes('xingren')) return handleOptionClick("Xingren Road");
      if (text.includes('neili')) return handleOptionClick("Neili Station");
      if (text.includes('yuandong')) return handleOptionClick("Yuandong Road");
      if (text.includes('any') || text.includes('all')) return handleOptionClick("Any");
      if (text.includes('r building')) return handleOptionClick("R Building Area");
      
      // If not recognized
      setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: "I didn't quite get that area. Try typing 'Neili', 'Xingren', or just say 'Any' to see everything!" }]);
      return;
    }

    // 3. BUDGET LOGIC
    if (step === 'budget') {
      const numbers = text.match(/\d+/);
      if (numbers) {
        return handleOptionClick(numbers[0]); // Pass the number directly
      }
      if (text.includes('no limit') || text.includes('any')) return handleOptionClick("No Limit");
      
      setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: "I need a number for the budget (e.g. 6000). Or just say 'No Limit'." }]);
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const text = inputValue;
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text }]);
    setInputValue("");
    setTimeout(() => processInput(text), 500);
  };

  const handleOptionClick = (option) => {
    // Avoid duplicate user messages
    setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg.sender === 'user' && lastMsg.text.toLowerCase().includes(String(option).toLowerCase())) return prev;
        return [...prev, { id: Date.now(), sender: 'user', text: option }];
    });
    
    if (step === 'area') {
      setCriteria({ ...criteria, area: option });
      setStep('budget');
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          id: Date.now() + 1, 
          sender: 'bot', 
          text: `Got it! Looking in ${option}. What is your maximum monthly budget?`, 
          options: ["5000", "7000", "10000", "15000", "No Limit"] 
        }]);
      }, 500);
    } else if (step === 'budget') {
      const budgetVal = option === "No Limit" ? 99999 : parseInt(option);
      const finalCriteria = { ...criteria, budget: budgetVal };
      setCriteria(finalCriteria);
      setStep('result');
      
      setTimeout(() => {
        const matches = rooms.filter(r => 
          (finalCriteria.area === "Any" || r.location.includes(finalCriteria.area)) &&
          r.price <= budgetVal
        );

        if (matches.length > 0) {
          setMessages(prev => [...prev, { 
            id: Date.now() + 1, 
            sender: 'bot', 
            text: `I found ${matches.length} rooms for you! Click below to view details:`,
            data: matches.slice(0, 3) 
          }]);
        } else {
           setMessages(prev => [...prev, { 
            id: Date.now() + 1, 
            sender: 'bot', 
            text: "I couldn't find any rooms matching that criteria. Try increasing your budget or changing the area.",
            options: ["Start Over"]
          }]);
          setStep('restart');
        }
      }, 500);
    } else if (step === 'restart' || step === 'result') {
       setMessages([{ id: Date.now(), sender: 'bot', text: "Let's try again! Which area do you prefer?", options: ["Xingren Road", "Neili Station", "Yuandong Road", "Any"] }]);
       setStep('area');
    }
  };

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end">
       {isOpen && (
         <div className="bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl w-80 md:w-96 h-[500px] mb-4 overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-300">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center text-white">
               <div className="flex items-center gap-2">
                 <div className="bg-white/20 p-1.5 rounded-full"><Bot size={20} /></div>
                 <div>
                   <h3 className="font-bold text-sm">YZU Helper</h3>
                   <span className="text-[10px] opacity-80 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> Online</span>
                 </div>
               </div>
               <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors"><X size={18}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
               {messages.map((msg) => (
                 <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm font-medium shadow-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-700 rounded-bl-none border border-slate-100'}`}>
                      {msg.text}
                    </div>
                    {msg.options && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {msg.options.map(opt => (
                          <button key={opt} onClick={() => handleOptionClick(opt)} className="text-xs bg-white border border-blue-200 text-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-50 font-bold transition-all shadow-sm">
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                    {msg.data && (
                      <div className="mt-2 space-y-2 w-full">
                        {msg.data.map(room => (
                          <div 
                            key={room._id} 
                            onClick={() => { 
                              handleImageClick(room); // Calls the App's detail view handler
                              setIsOpen(false); 
                            }} 
                            className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm flex gap-3 cursor-pointer hover:shadow-md transition-all group"
                          >
                             <img src={room.image} className="w-12 h-12 rounded-lg object-cover bg-slate-200" />
                             <div className="flex-1 min-w-0">
                               <p className="text-xs font-bold text-slate-800 truncate">{room.title}</p>
                               <p className="text-[10px] text-slate-500">{room.location}</p>
                               <p className="text-xs font-black text-blue-600">${room.price}</p>
                             </div>
                             <div className="self-center bg-blue-50 p-1.5 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors"><ArrowRight size={14}/></div>
                          </div>
                        ))}
                        <button onClick={() => handleOptionClick("Start Over")} className="text-xs text-slate-400 underline w-full text-center mt-2 hover:text-blue-600">Start New Search</button>
                      </div>
                    )}
                 </div>
               ))}
               <div ref={chatEndRef} />
            </div>

            {/* INPUT AREA */}
            <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
               <input 
                 className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                 placeholder="Type here..."
                 value={inputValue}
                 onChange={(e) => setInputValue(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleSend()}
               />
               <button onClick={handleSend} className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50" disabled={!inputValue.trim()}>
                 <ArrowRight size={18} />
               </button>
            </div>
         </div>
       )}

       <button 
         onClick={() => setIsOpen(!isOpen)}
         className={`p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center ${isOpen ? 'bg-slate-800 text-white rotate-90' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'}`}
       >
         {isOpen ? <X size={24} /> : <Bot size={28} />}
       </button>
    </div>
  );
};

// --- CORE COMPONENTS ---

const Footer = ({ setView }) => (
  <footer className="bg-white/80 backdrop-blur-md border-t border-white/50 mt-auto pt-16 pb-28 md:pb-8 relative z-10">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="col-span-1 md:col-span-1 space-y-4">
           <div onClick={() => setView('home')}><Logo /></div>
           <p className="text-slate-500 text-sm leading-relaxed font-medium">
             The trusted housing platform exclusively for Yuan Ze University students. Find your perfect home today.
           </p>
        </div>
        <div>
          <h4 className="font-black text-slate-800 mb-6 text-sm uppercase tracking-widest">Company</h4>
          <ul className="space-y-3 text-sm text-slate-500 font-medium">
            <li><button onClick={() => setView('about')} className="hover:text-blue-600 transition-colors text-left">About 67 YZUers</button></li>
          </ul>
        </div>
        <div>
          <h4 className="font-black text-slate-800 mb-6 text-sm uppercase tracking-widest">Support</h4>
          <ul className="space-y-3 text-sm text-slate-500 font-medium">
            <li><button className="hover:text-blue-600 transition-colors text-left">Help Center</button></li>
          </ul>
        </div>
        <div>
          <h4 className="font-black text-slate-800 mb-6 text-sm uppercase tracking-widest">Legal</h4>
          <ul className="space-y-3 text-sm text-slate-500 font-medium">
            <li><button onClick={() => setView('terms')} className="hover:text-blue-600 transition-colors flex items-center gap-2 text-left"><FileText size={14}/> Terms of Service</button></li>
            <li><button onClick={() => setView('privacy')} className="hover:text-blue-600 transition-colors flex items-center gap-2 text-left"><Lock size={14}/> Privacy Policy</button></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200/60 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-slate-400">
        <p>© 2025 67 YZUers Inc. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

const RoomCard = ({ room, isSaved, onToggleBookmark, onClick, onImageClick, onDelete, isAdmin, minimal = false }) => {
  return (
    <GlassCard 
      onClick={() => onClick && onClick(room)}
      className={`group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${minimal ? 'w-full' : ''} flex flex-col h-full bg-white`}
    >
      <div className={`relative ${minimal ? 'h-32' : 'h-60'} overflow-hidden shrink-0`}>
        <img 
          src={room.image} 
          alt={room.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          onClick={(e) => {
            if (onImageClick) {
              e.stopPropagation();
              onImageClick(room);
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60"></div>
        
        <div className="absolute top-3 right-3 flex gap-2">
          {isAdmin && onDelete && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if(window.confirm(`Delete "${room.title}"?`)) onDelete(room._id);
              }}
              className="p-2 rounded-full bg-red-500/90 text-white backdrop-blur-md shadow-lg hover:bg-red-600 transition-all z-20"
            >
              <Trash2 size={16} />
            </button>
          )}

          <button 
            onClick={(e) => onToggleBookmark(room._id, e)}
            className="p-2 rounded-full bg-white/20 backdrop-blur-md border border-white/40 shadow-lg hover:bg-white transition-all group/heart"
          >
            <Heart size={18} className={`transition-colors ${isSaved ? "fill-red-500 text-red-500" : "text-white group-hover/heart:text-red-500"}`} />
          </button>
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
           <span className="bg-white/95 backdrop-blur text-slate-900 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg">
             <Star size={12} className="text-yellow-500 fill-yellow-500"/> {room.rating || 5.0}
           </span>
           {!minimal && (
             <span className="bg-blue-600 text-white px-3 py-1 rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20">
               ${room.price}
             </span>
           )}
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-1 bg-white">
        <div className="flex justify-between items-start mb-2">
          <h3 className={`font-bold text-slate-800 leading-tight ${minimal ? 'text-sm' : 'text-lg line-clamp-1'}`}>{room.title}</h3>
          {minimal && <span className="text-blue-600 font-extrabold text-sm">${room.price}</span>}
        </div>
        
        {!minimal && (
          <>
            <div className="flex flex-wrap items-center gap-3 text-slate-500 text-sm mb-4 font-medium">
              <div className="flex items-center gap-1.5">
                <MapPin size={14} className="text-blue-500" /> {room.location}
              </div>
              <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
              <div className="flex items-center gap-1.5 text-orange-600 font-bold">
                <School size={14} /> {room.distance} min to YZU
              </div>
            </div>
            
            <div className="flex-1">
              {room.landlord && (
                <div className="flex items-center gap-3 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                    {room.landlord.name ? room.landlord.name.charAt(0) : "L"}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700">{room.landlord?.name || "Host"}</span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <MessageCircle size={10} className="text-emerald-500" /> {room.landlord?.phone || "Contact"}
                    </span>
                  </div>
                  {room.deposit && (
                     <span className="ml-auto text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                       {room.deposit}Mo Dep.
                     </span>
                  )}
                </div>
              )}
              <div className="flex flex-wrap gap-2 mb-4">
                {room.amenities && room.amenities.slice(0, 3).map((item, i) => (
                  <span key={i} className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                    <AmenityIcon name={item} /> {item}
                  </span>
                ))}
                {room.amenities && room.amenities.length > 3 && (
                  <span className="bg-slate-100 text-slate-400 px-2 py-1 rounded-lg text-xs font-bold">+{room.amenities.length - 3}</span>
                )}
              </div>
            </div>

            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (onImageClick) onImageClick(room);
              }}
              className="w-full mt-auto bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-600 hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.98]"
            >
              <Eye size={16} /> View Details
            </button>
          </>
        )}

        {/* Minimal View Button */}
        {minimal && (
           <button 
             onClick={(e) => {
               e.stopPropagation();
               if (onImageClick) onImageClick(room);
             }}
             className="w-full mt-2 bg-blue-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
           >
             <Eye size={14} /> View Room
           </button>
        )}
      </div>
    </GlassCard>
  );
};

// --- SECTIONS ---

const CommunitySection = ({ user, setView }) => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [replyText, setReplyText] = useState({});
  const [activeReplyId, setActiveReplyId] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = () => {
    axios.get(`${API_URL}/posts`).then(res => setPosts(res.data)).catch(console.error);
  };

  const handlePost = async () => {
    if (!newPost.trim() || !user) return;
    try {
      await axios.post(`${API_URL}/posts`, {
        userId: user.id,
        username: user.username,
        avatar: user.avatar,
        text: newPost
      });
      setNewPost("");
      fetchPosts();
    } catch (err) { alert("Failed to post"); }
  };

  const handleLike = async (postId) => {
    if (!user) return setView('login');
    try {
      await axios.put(`${API_URL}/posts/${postId}/like`, { userId: user.id });
      fetchPosts();
    } catch (err) { console.error(err); }
  };

  const handleReply = async (postId) => {
    if (!replyText[postId]?.trim() || !user) return;
    try {
      await axios.post(`${API_URL}/posts/${postId}/reply`, {
        userId: user.id,
        username: user.username,
        avatar: user.avatar,
        text: replyText[postId]
      });
      setReplyText({ ...replyText, [postId]: "" });
      setActiveReplyId(null);
      fetchPosts();
    } catch (err) { alert("Failed to reply"); }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm("Delete this post?")) return;
    try {
      await axios.delete(`${API_URL}/posts/${postId}`);
      fetchPosts();
    } catch (err) { alert("Delete failed"); }
  };

  const handleDeleteReply = async (postId, replyId) => {
    if (!confirm("Delete this reply?")) return;
    try {
      await axios.delete(`${API_URL}/posts/${postId}/reply/${replyId}`);
      fetchPosts();
    } catch (err) { alert("Delete failed"); }
  };

  return (
    <div className="mt-16 border-t border-slate-200/60 pt-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
             <MessageCircle className="text-blue-600 fill-blue-100" size={32} /> YZU Community Board
          </h2>
          <p className="text-slate-500 mt-2 font-medium">Ask for roommates, sell books, or find study buddies!</p>
        </div>
      </div>

      {user ? (
        <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-lg border border-white/50 mb-10 flex gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl font-bold text-white shrink-0 overflow-hidden">
             {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover"/> : user.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 flex gap-2">
             <input 
               className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
               placeholder="What's on your mind? (e.g. Looking for a roommate in Neili...)"
               value={newPost}
               onChange={(e) => setNewPost(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handlePost()}
             />
             <button onClick={handlePost} className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50" disabled={!newPost.trim()}>
               <Send size={20} />
             </button>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 p-6 rounded-2xl text-center mb-10 border border-blue-100">
           <p className="text-blue-800 font-bold mb-2">Join the conversation!</p>
           <button onClick={() => setView('login')} className="text-sm bg-white text-blue-600 px-4 py-2 rounded-lg font-bold shadow-sm hover:shadow-md transition-all">Login to Post</button>
        </div>
      )}

      <div className="space-y-6">
        {posts.map(post => (
          <GlassCard key={post._id} className="p-6 !bg-white/60">
             <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 shrink-0 overflow-hidden">
                   {post.avatar ? <img src={post.avatar} className="w-full h-full object-cover"/> : post.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                   <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-slate-800 mr-2">{post.username}</span>
                        <span className="text-xs text-slate-400">{new Date(post.date).toLocaleDateString()}</span>
                      </div>
                      {user && user.id === post.userId && (
                        <button onClick={() => handleDeletePost(post._id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                      )}
                   </div>
                   <p className="text-slate-700 mt-1 mb-3 leading-relaxed">{post.text}</p>
                   
                   <div className="flex items-center gap-4 text-sm text-slate-500">
                      <button 
                        onClick={() => handleLike(post._id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${user && post.likes.includes(user.id) ? 'text-red-500 bg-red-50' : 'hover:bg-slate-100'}`}
                      >
                         <Heart size={16} className={user && post.likes.includes(user.id) ? 'fill-current' : ''} /> {post.likes.length}
                      </button>
                      <button onClick={() => setActiveReplyId(activeReplyId === post._id ? null : post._id)} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                         <MessageSquare size={16} /> Reply ({post.replies.length})
                      </button>
                   </div>

                   {(activeReplyId === post._id || post.replies.length > 0) && (
                     <div className="mt-4 pl-4 border-l-2 border-slate-100 space-y-4">
                        {post.replies.map(reply => (
                           <div key={reply._id} className="flex gap-3 bg-slate-50/50 p-3 rounded-xl">
                              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-bold text-slate-400 border border-slate-100 shrink-0 overflow-hidden">
                                {reply.avatar ? <img src={reply.avatar} className="w-full h-full object-cover"/> : reply.username.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1">
                                 <div className="flex justify-between">
                                   <span className="text-xs font-bold text-slate-700">{reply.username}</span>
                                   {user && user.id === reply.userId && (
                                      <button onClick={() => handleDeleteReply(post._id, reply._id)} className="text-slate-300 hover:text-red-500"><X size={12}/></button>
                                   )}
                                 </div>
                                 <p className="text-sm text-slate-600">{reply.text}</p>
                              </div>
                           </div>
                        ))}
                        
                        {activeReplyId === post._id && user && (
                           <div className="flex gap-2 mt-2">
                              <input 
                                className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                                placeholder="Write a reply..."
                                value={replyText[post._id] || ""}
                                onChange={(e) => setReplyText({...replyText, [post._id]: e.target.value})}
                                onKeyDown={(e) => e.key === 'Enter' && handleReply(post._id)}
                              />
                              <button onClick={() => handleReply(post._id)} className="bg-slate-900 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-slate-800">Reply</button>
                           </div>
                        )}
                     </div>
                   )}
                </div>
             </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

const AboutView = ({ setView }) => (
  <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 min-h-[60vh]">
    <GlassCard className="p-10">
      <div className="mb-8">
         <h1 className="text-4xl font-black text-slate-800 mb-2">About <span className="text-blue-600">67 YZUers</span></h1>
         <p className="text-slate-500 font-medium text-lg">Reimagining student living at Yuan Ze University.</p>
      </div>
      <div className="space-y-6 text-slate-600 leading-relaxed">
        <p>Founded in 2025, <strong>67 YZUers</strong> was born from a simple need: reliable, transparent, and accessible housing information for the Yuan Ze University community.</p>
        <p>Our platform connects students directly with verified local landlords. We prioritize safety, convenience, and community trust.</p>
        <div className="bg-blue-50 p-6 rounded-2xl border-l-4 border-blue-500 my-8">
          <h3 className="font-bold text-blue-800 mb-2">Our Mission</h3>
          <p className="text-blue-700">To create a stress-free housing ecosystem where every YZU student feels at home.</p>
        </div>
      </div>
      <div className="mt-10">
        <button onClick={() => setView('home')} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-all">Back to Home</button>
      </div>
    </GlassCard>
  </div>
);

const TermsView = ({ setView }) => (
  <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 min-h-[60vh]">
    <GlassCard className="p-10">
      <h1 className="text-3xl font-black text-slate-800 mb-8 pb-4 border-b border-slate-200">Terms of Service</h1>
      <div className="space-y-6 text-slate-600">
        <section>
          <h3 className="font-bold text-slate-900 text-lg mb-2">1. Acceptance</h3>
          <p>By using 67 YZUers, you agree to these terms.</p>
        </section>
        <section>
          <h3 className="font-bold text-slate-900 text-lg mb-2">2. Accuracy</h3>
          <p>Users are responsible for providing accurate listing information.</p>
        </section>
      </div>
      <div className="mt-10">
        <button onClick={() => setView('home')} className="text-slate-500 font-bold hover:text-blue-600 transition-all">← Back to Home</button>
      </div>
    </GlassCard>
  </div>
);

const PrivacyView = ({ setView }) => (
  <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 min-h-[60vh]">
    <GlassCard className="p-10">
      <h1 className="text-3xl font-black text-slate-800 mb-8 pb-4 border-b border-slate-200">Privacy Policy</h1>
      <div className="space-y-6 text-slate-600">
        <section>
          <h3 className="font-bold text-slate-900 text-lg mb-2">Data Collection</h3>
          <p>We collect basic user info to facilitate room bookings.</p>
        </section>
        <section>
          <h3 className="font-bold text-slate-900 text-lg mb-2">Security</h3>
          <p>We do not share your personal data with third parties.</p>
        </section>
      </div>
      <div className="mt-10">
        <button onClick={() => setView('home')} className="text-slate-500 font-bold hover:text-blue-600 transition-all">← Back to Home</button>
      </div>
    </GlassCard>
  </div>
);

// --- HOME VIEW ---
const HomeView = ({ 
  searchTerm, setSearchTerm, locationFilter, setLocationFilter, priceRange, setPriceRange, 
  displayMode, setDisplayMode, filteredRooms, bookmarks, toggleBookmark, handleCardClick, 
  handleImageClick, zoomLevel, handleZoomIn, handleZoomOut, selectedMapRoom, setSelectedMapRoom, user, handleDeleteRoom, setView
}) => (
  <div className="animate-in fade-in duration-700 pb-24">
    {/* HERO SECTION */}
    <div className="relative h-[550px] w-full -mt-20 mb-10 overflow-hidden">
      <div className="absolute inset-0 bg-black/50 z-10"></div>
      <img 
        src="/bg.jpg" 
        onError={(e) => e.target.src = "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=2000&q=80"}
        alt="Hero Background" 
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4 pt-32">
        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-2xl tracking-tight leading-tight">
          Welcome Home! <br/> Anywhere you roam.
        </h1>
        <p className="text-white/90 text-lg md:text-xl font-medium mb-10 max-w-2xl drop-shadow-lg">
          Find the perfect student accommodation near Yuan Ze University.
        </p>

        {/* SEARCH BAR */}
        <div className="w-full max-w-4xl bg-white/20 backdrop-blur-md border border-white/40 p-2 rounded-3xl shadow-2xl">
          <div className="flex flex-col md:flex-row gap-2">
            <div className="flex-1 relative group">
               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                 <Search className="text-white/70" size={20} />
               </div>
               <input 
                  type="text" 
                  placeholder="Search rooms..." 
                  className="w-full pl-12 pr-4 py-4 bg-white/90 backdrop-blur-xl rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 placeholder:text-slate-400 transition-all shadow-sm"
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
               />
               {searchTerm && <button onClick={() => setSearchTerm("")} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"><X size={18} /></button>}
            </div>
            
            <div className="flex gap-2">
               <select className="px-6 py-4 bg-white/90 backdrop-blur-xl rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm appearance-none" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
                  <option value="All">All Areas</option>
                  <option value="Xingren">Xingren Rd</option>
                  <option value="Neili">Neili Station</option>
                  <option value="Yuandong">Yuandong Rd</option>
                  <option value="R Building">R Building</option>
               </select>
               <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg transition-all flex items-center gap-2">
                 Search
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* FILTERS & TOGGLES */}
    <div className="max-w-7xl mx-auto px-4 mb-8 flex justify-between items-center">
       <div className="flex gap-4 items-center">
          <div className="flex bg-white/80 backdrop-blur p-1 rounded-2xl shadow-sm border border-slate-200">
             <button onClick={() => setDisplayMode('list')} className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${displayMode === 'list' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}><List size={16} /> List</button>
             <button onClick={() => setDisplayMode('map')} className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${displayMode === 'map' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}><MapIcon size={16} /> Map</button>
          </div>
          <div className="hidden md:flex items-center gap-3 bg-white/80 backdrop-blur px-5 py-2.5 rounded-2xl shadow-sm border border-slate-200">
             <span className="text-xs font-bold text-slate-500 uppercase">Max Price:</span>
             <input type="range" min="3000" max="15000" step="500" value={priceRange} onChange={(e) => setPriceRange(Number(e.target.value))} className="w-32 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
             <span className="text-xs font-bold text-blue-600 min-w-[3rem] text-right">${priceRange/1000}k</span>
          </div>
       </div>
       <div className="text-slate-500 text-sm font-bold">
         Showing {filteredRooms.length} Homes
       </div>
    </div>

    <div className="max-w-7xl mx-auto px-4 h-[calc(100vh-180px)]">
      {displayMode === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
          {filteredRooms.map(room => (
            <RoomCard 
              key={room._id} 
              room={room} 
              isSaved={bookmarks.includes(room._id)} 
              onToggleBookmark={toggleBookmark} 
              onClick={handleCardClick} 
              onImageClick={handleImageClick}
              onDelete={handleDeleteRoom}
              isAdmin={user?.isAdmin}
            />
          ))}
        </div>
      ) : (
        <GlassCard className="relative h-[800px] w-full !bg-slate-50/80 !rounded-[2.5rem] border-4 border-white shadow-2xl group overflow-hidden mb-20">
           <div className="absolute top-6 right-6 z-20 flex flex-col gap-2">
              <button onClick={handleZoomIn} className="bg-white p-3 rounded-2xl shadow-xl hover:bg-slate-50 text-slate-700 transition-all border border-slate-100"><ZoomIn size={24}/></button>
              <button onClick={handleZoomOut} className="bg-white p-3 rounded-2xl shadow-xl hover:bg-slate-50 text-slate-700 transition-all border border-slate-100"><ZoomOut size={24}/></button>
           </div>
           
           <div className="w-full h-full overflow-auto bg-slate-100/50 custom-scrollbar">
             <div style={{ width: `${zoomLevel * 100}%`, minHeight: '100%', position: 'relative' }}>
               <img 
                 src="/map.png" 
                 onError={(e) => { if (e.target.src.includes('map.png')) e.target.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Yuan_Ze_University_Map.svg/1200px-Yuan_Ze_University_Map.svg.png"; }} 
                 alt="YZU Map" 
                 className="w-full h-auto block" 
               />
               {filteredRooms.map(room => (
                 <button 
                    key={room._id} 
                    onClick={(e) => { e.stopPropagation(); setSelectedMapRoom(room); }} 
                    className="absolute transform -translate-x-1/2 -translate-y-full transition-transform hover:scale-110 hover:z-20 group/pin" 
                    style={{ top: room.coords.top, left: room.coords.left }}
                 >
                   <div className="relative flex flex-col items-center">
                     <MapPin size={48} strokeWidth={2.5} className={`drop-shadow-2xl filter ${selectedMapRoom?._id === room._id ? 'text-slate-900 fill-white scale-110' : 'text-red-600 fill-white group-hover/pin:text-orange-500'}`} />
                     <div className={`px-3 py-1.5 rounded-full text-xs font-extrabold shadow-xl backdrop-blur-md border border-white/60 whitespace-nowrap mt-1 ${selectedMapRoom?._id === room._id ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
                       ${room.price}
                     </div>
                   </div>
                 </button>
               ))}
             </div>
           </div>

           {selectedMapRoom && (
             <div className="absolute bottom-6 left-4 right-4 md:left-auto md:right-4 md:w-96 z-30 animate-in slide-in-from-bottom-10 fade-in duration-300">
               <div className="relative">
                 <button onClick={() => setSelectedMapRoom(null)} className="absolute -top-3 -right-3 bg-slate-900 text-white p-2 rounded-full shadow-2xl hover:bg-slate-700 transition-colors z-40 border-2 border-white"><X size={16} /></button>
                 {/* FIXED: Clicking this card now opens the Detail View */}
                 <RoomCard 
                   room={selectedMapRoom} 
                   isSaved={bookmarks.includes(selectedMapRoom._id)} 
                   onToggleBookmark={toggleBookmark} 
                   onClick={() => handleImageClick(selectedMapRoom)} 
                   onImageClick={handleImageClick}
                   onDelete={handleDeleteRoom}
                   isAdmin={user?.isAdmin || true}
                   currentUser={user}
                   minimal={true} 
                 />
               </div>
             </div>
           )}
        </GlassCard>
      )}
    </div>

    {/* --- COMMUNITY BOARD --- */}
    <div className="max-w-7xl mx-auto px-4 pb-20">
      <CommunitySection user={user} setView={setView} />
    </div>
  </div>
);

// ... (HostView, ProfileView, RoomDetailView, AuthView remain the same as previous) ...
const HostView = ({ handleUpload, newRoom, setNewRoom, handleImageFileChange, handleMapClick, toggleAmenitySelection }) => (
  <div className="max-w-6xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4">
    <GlassCard className="p-8 md:p-12 flex flex-col lg:flex-row gap-12">
      <div className="flex-1 space-y-6">
        <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
          <div className="bg-blue-100 p-3 rounded-2xl text-blue-600"><Upload size={28}/></div> 
          Upload New Room
        </h2>
        <form onSubmit={handleUpload} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider">Room Title</label>
            <input required className="w-full p-4 bg-slate-50/50 backdrop-blur-sm rounded-xl border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium" placeholder="e.g. Sunny Studio near R Building" 
              value={newRoom.title} onChange={e => setNewRoom({...newRoom, title: e.target.value})} />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-1 tracking-wider"><ImageIcon size={14}/> Room Image</label>
            <div className="flex gap-3 items-center">
              <label className="flex-1 cursor-pointer group">
                <div className="w-full p-4 bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 text-sm hover:bg-blue-50/50 hover:border-blue-400 hover:text-blue-600 transition-all flex items-center justify-center gap-2">
                  <Upload size={18} /> {newRoom.image && !newRoom.image.startsWith('http') ? "Image Selected" : "Upload File"}
                </div>
                <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
              </label>
              {newRoom.image && !newRoom.image.startsWith('http') && (
                <span className="text-emerald-600 bg-emerald-100 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm border border-emerald-200"><CheckCircle size={14}/> Ready</span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-bold">OR</span></div>
            </div>
            <input className="w-full p-4 bg-slate-50/50 rounded-xl border border-slate-200/80 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="Paste image URL here..." 
              value={newRoom.image.startsWith('http') ? newRoom.image : ''} 
              onChange={e => setNewRoom({...newRoom, image: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider">Price (NT$)</label>
              <input type="number" required className="w-full p-4 bg-slate-50/50 rounded-xl border border-slate-200/80 font-bold text-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="6000" 
                value={newRoom.price} onChange={e => setNewRoom({...newRoom, price: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider">Distance (min)</label>
              <input type="number" required className="w-full p-4 bg-slate-50/50 rounded-xl border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="5" 
                value={newRoom.distance} onChange={e => setNewRoom({...newRoom, distance: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
             <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider">Landlord Name</label>
               <input className="w-full p-4 bg-slate-50/50 rounded-xl border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="Mr. Lin" 
                 value={newRoom.landlordName} onChange={e => setNewRoom({...newRoom, landlordName: e.target.value})} />
             </div>
             <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider">Phone / Line</label>
               <input className="w-full p-4 bg-slate-50/50 rounded-xl border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="0912..." 
                 value={newRoom.landlordPhone} onChange={e => setNewRoom({...newRoom, landlordPhone: e.target.value})} />
             </div>
          </div>
          
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider">Features</label>
            <div className="grid grid-cols-3 gap-3">
              {AMENITIES_LIST.map(amenity => (
                <button 
                  key={amenity} type="button"
                  onClick={() => toggleAmenitySelection(amenity)}
                  className={`p-3 rounded-xl text-xs font-bold border transition-all ${newRoom.amenities.includes(amenity) ? 'bg-slate-800 text-white border-slate-800 shadow-lg transform scale-105' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600'}`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          <button className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-xl hover:bg-blue-600 hover:shadow-blue-500/30 transition-all hover:scale-[1.01] active:scale-95 text-lg">
            Publish Listing
          </button>
        </form>
      </div>

      <div className="flex-1 flex flex-col">
         <label className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2 tracking-wider"><MapPin size={16} className="text-blue-600"/> 1. Scroll & Click Map to set Location</label>
         
         <div className="h-[500px] w-full bg-slate-50 rounded-3xl border-4 border-dashed border-slate-300 hover:border-blue-400 transition-colors group relative overflow-hidden shadow-inner">
            <div className="w-full h-full overflow-auto relative cursor-crosshair custom-scrollbar">
              <div className="relative">
                <img 
                  src="/map.png" 
                  onClick={handleMapClick} 
                  onError={(e) => { if (e.target.src.includes('map.png')) e.target.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Yuan_Ze_University_Map.svg/1200px-Yuan_Ze_University_Map.svg.png"; }} 
                  alt="YZU Map" 
                  className="w-full h-auto block" 
                />
                <div 
                  className="absolute transform -translate-x-1/2 -translate-y-full pointer-events-none flex flex-col items-center transition-all duration-300 ease-out" 
                  style={{ top: newRoom.coords.top, left: newRoom.coords.left }}
                >
                   <MapPin size={56} strokeWidth={2.5} className="text-blue-600 fill-white drop-shadow-2xl animate-bounce" />
                   <span className="bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-xl mt-1">Selected Location</span>
                </div>
              </div>
            </div>
         </div>
         <p className="text-center text-xs text-slate-400 mt-4 font-medium bg-white/60 py-3 rounded-xl border border-white/50">Map is scrollable. Click exact spot to place pin.</p>
      </div>
    </GlassCard>
  </div>
);

const ProfileView = ({ user, handleLogout, rooms, bookmarks, toggleBookmark, handleCardClick, handleImageClick, handleProfilePicChange }) => (
  <div className="max-w-5xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4">
    <GlassCard className="p-10 flex flex-col md:flex-row items-center gap-10 mb-10 !bg-gradient-to-br !from-white/90 !to-white/60">
      <div className="relative group cursor-pointer">
        <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-6xl font-bold text-white shadow-xl border-4 border-white ring-4 ring-blue-50 overflow-hidden">
          {user.avatar ? (
             <img src={user.avatar} className="w-full h-full object-cover" alt="Profile" />
          ) : (
             user.username.charAt(0).toUpperCase()
          )}
        </div>
        <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-all cursor-pointer text-white font-bold text-xs">
           <div className="flex flex-col items-center">
             <Upload size={24} />
             <span>Change</span>
           </div>
           <input type="file" accept="image/*" onChange={handleProfilePicChange} className="hidden" />
        </label>
      </div>
      <div className="text-center md:text-left flex-1 space-y-2">
        <h1 className="text-4xl font-black text-slate-800">{user.username}</h1>
        <p className="text-slate-500 font-medium text-lg flex items-center justify-center md:justify-start gap-2"><Mail size={18} className="text-blue-400"/> {user.email}</p>
        <div className="flex gap-3 justify-center md:justify-start pt-2">
          <span className="bg-emerald-100 text-emerald-700 text-xs px-4 py-1.5 rounded-full font-bold flex items-center gap-2 border border-emerald-200">
            <CheckCircle size={14} /> Verified Host
          </span>
          {user.isAdmin && (
            <span className="bg-purple-100 text-purple-700 text-xs px-4 py-1.5 rounded-full font-bold flex items-center gap-2 border border-purple-200">
              <Layout size={14} /> Admin
            </span>
          )}
        </div>
      </div>
      <button onClick={handleLogout} className="bg-white border-2 border-red-100 text-red-500 font-bold text-sm px-8 py-3 rounded-2xl hover:bg-red-50 hover:border-red-200 transition-all shadow-sm hover:shadow-md">Logout</button>
    </GlassCard>

    <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3 pl-2">
      <div className="bg-red-100 p-2.5 rounded-xl text-red-500 shadow-sm"><Heart size={24} fill="currentColor" /></div> Your Saved Rooms
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {rooms.filter(r => bookmarks.includes(r._id)).map(room => (
        <RoomCard key={room._id} room={room} isSaved={true} onToggleBookmark={toggleBookmark} onClick={handleCardClick} onImageClick={handleImageClick} />
      ))}
      {bookmarks.length === 0 && (
        <div className="col-span-full py-20 text-center text-slate-400 border-2 border-dashed border-slate-300/50 rounded-[2rem] bg-white/40 backdrop-blur-sm">
          <Heart size={64} className="mx-auto mb-6 opacity-20" />
          <p className="font-bold text-lg">Your wishlist is empty.</p>
          <p className="text-sm opacity-60">Go explore and save some rooms!</p>
        </div>
      )}
    </div>
  </div>
);

const RoomDetailView = ({ room, user, bookmarks, setView, toggleBookmark, handleDeleteRoom }) => {
  if (!room) return null;
  const isSaved = bookmarks.includes(room._id);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-in slide-in-from-bottom-8 duration-500">
      <button onClick={() => setView('home')} className="mb-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold bg-white/60 px-5 py-2.5 rounded-full w-fit backdrop-blur-md hover:bg-white transition-all shadow-sm border border-white/50">
        <ArrowLeft size={20} /> Back to Search
      </button>
      
      <GlassCard className="!p-0 !overflow-hidden">
        <div className="relative h-[400px] md:h-[500px]">
          <img src={room.image} alt={room.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>
          
          <div className="absolute top-6 right-6 flex gap-3">
            {user?.isAdmin && (
              <button 
                onClick={() => {
                  if(window.confirm(`Delete "${room.title}"?`)) {
                    handleDeleteRoom(room._id);
                    setView('home');
                  }
                }}
                className="p-3.5 rounded-full bg-red-600 text-white backdrop-blur-md shadow-lg hover:bg-red-500 transition-all border border-red-400 hover:scale-105"
              >
                <Trash2 size={24} />
              </button>
            )}
            <button 
              onClick={(e) => toggleBookmark(room._id, e)}
              className="p-3.5 rounded-full bg-white/20 backdrop-blur-xl shadow-xl hover:bg-white transition-all border border-white/40 group hover:scale-105"
            >
              <Heart size={24} className={isSaved ? "fill-red-500 text-red-500" : "text-white group-hover:text-red-500"} />
            </button>
          </div>
          
          <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
             <div className="space-y-3">
                <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-lg leading-tight">{room.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-white/90 font-medium text-lg">
                  <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur px-3 py-1 rounded-lg border border-white/10"><MapPin size={20} className="text-blue-400"/> {room.location}</span>
                  <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur px-3 py-1 rounded-lg border border-white/10"><School size={20} className="text-orange-400"/> {room.distance} min to YZU</span>
                </div>
             </div>
             <div className="hidden md:block">
               <span className="bg-white text-slate-900 px-6 py-3 rounded-2xl text-2xl font-black shadow-2xl">
                 ${room.price}<span className="text-sm font-bold text-slate-400 ml-1">/mo</span>
               </span>
             </div>
          </div>
        </div>

        <div className="p-8 md:p-12 bg-white/40 backdrop-blur-3xl">
           <div className="flex flex-col lg:flex-row gap-16">
              <div className="flex-1">
                <div className="mb-8 p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="text-blue-600"/> 
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Deposit Required</span>
                  </div>
                  <p className="text-3xl font-black text-slate-800">{room.deposit ? `${room.deposit} Months` : 'None'}</p>
                </div>

                <h3 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest border-b border-slate-200/60 pb-2">Amenities & Features</h3>
                <div className="flex flex-wrap gap-4">
                  {room.amenities && room.amenities.map((item, i) => (
                    <span key={i} className="bg-white/80 border border-white/60 text-slate-700 px-5 py-4 rounded-2xl text-sm font-bold flex items-center gap-3 shadow-sm hover:scale-105 transition-transform cursor-default">
                      <AmenityIcon name={item} /> {item}
                    </span>
                  ))}
                  {(!room.amenities || room.amenities.length === 0) && <p className="text-slate-400 italic">No specific amenities listed.</p>}
                </div>
              </div>

              <div className="lg:w-96">
                 {room.landlord && (
                  <div className="bg-white/70 p-8 rounded-[2rem] border border-white/60 shadow-lg sticky top-24">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-6 tracking-widest">Host Information</h3>
                    <div className="flex items-center gap-5 mb-8">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg rotate-3">
                        {room.landlord.name ? room.landlord.name.charAt(0) : "L"}
                      </div>
                      <div>
                        <p className="font-bold text-xl text-slate-800">{room.landlord.name || "Unknown"}</p>
                        <p className="text-sm text-emerald-600 font-bold flex items-center gap-1.5 mt-0.5">
                          <CheckCircle size={14} /> Verified Host
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                       <div className="flex items-center gap-4 text-slate-600 bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                          <Phone size={20} className="text-slate-400"/> 
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone / Line</p>
                            <span className="font-mono font-bold text-lg">{room.landlord.phone || "No Phone"}</span>
                          </div>
                       </div>
                       <button className="w-full bg-[#00C300] text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-500/20 hover:bg-[#00b300] transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95">
                         <MessageCircle size={20} /> Chat on Line
                       </button>
                    </div>
                  </div>
                )}
              </div>
           </div>
        </div>
      </GlassCard>
    </div>
  );
};

const AuthView = ({ authMode, setAuthMode, authData, setAuthData, error, handleAuth, setView }) => (
  <div className="min-h-[80vh] flex items-center justify-center px-4 animate-in zoom-in-95 duration-300">
    <GlassCard className="w-full max-w-md p-10 !bg-white/80">
      <div className="text-center mb-10">
        <div className="inline-block p-5 rounded-3xl bg-blue-50 text-blue-600 mb-6 shadow-inner">
           <Home size={40} strokeWidth={1.5} />
        </div>
        <h2 className="text-4xl font-black text-slate-800 mb-3 tracking-tight">
          {authMode === 'login' ? (
            <>Welcome to <span className="text-blue-600">67</span> <span className="text-red-600">YZUers</span></>
          ) : (
            <>Join <span className="text-blue-600">67</span> <span className="text-red-600">YZUers</span></>
          )}
        </h2>
        <p className="text-slate-500 font-medium text-lg">The best student housing platform.</p>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm mb-8 text-center font-bold flex items-center justify-center gap-2 border border-red-100"><AlertTriangle size={18}/> {error}</div>}
      
      <form onSubmit={handleAuth} className="space-y-5">
        {authMode === 'register' && (
          <div className="space-y-1.5">
             <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider">Username</label>
             <div className="relative group">
               <User className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
               <input type="text" required className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium" 
                 value={authData.username} onChange={e => setAuthData({...authData, username: e.target.value})} placeholder="Choose a username" />
             </div>
          </div>
        )}
        <div className="space-y-1.5">
           <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider">Email</label>
           <div className="relative group">
             <Mail className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
             <input type="email" required className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium" 
               value={authData.email} onChange={e => setAuthData({...authData, email: e.target.value})} placeholder="student@yzu.edu.tw" />
           </div>
        </div>
        <div className="space-y-1.5">
           <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider">Password</label>
           <div className="relative group">
             <Lock className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
             <input type="password" required className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium" 
               value={authData.password} onChange={e => setAuthData({...authData, password: e.target.value})} placeholder="••••••••" />
           </div>
        </div>
        
        <button className="w-full bg-slate-900 text-white font-bold py-4.5 py-4 rounded-2xl shadow-xl hover:bg-blue-600 hover:shadow-blue-500/30 transition-all flex justify-center items-center gap-2 mt-6 transform active:scale-[0.98] text-lg">
          {authMode === 'login' ? "Sign In" : "Create Account"} <ArrowRight size={20} />
        </button>
      </form>
      
      <div className="mt-10 text-center text-sm text-slate-500">
        <p className="mb-3">{authMode === 'login' ? "Don't have an account?" : "Already have an account?"}</p>
        <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-orange-600 font-black hover:underline uppercase tracking-widest text-xs border border-blue-200 px-6 py-3 rounded-xl hover:bg-blue-50 transition-all">
          {authMode === 'login' ? "Create Account" : "Login Here"}
        </button>
        <div className="mt-8 border-t border-slate-200/60 pt-6">
          <button onClick={() => setView('home')} className="text-slate-400 hover:text-slate-800 text-xs font-bold flex items-center justify-center gap-1 mx-auto transition-colors">
            <ArrowLeft size={12}/> Cancel and browse as guest
          </button>
        </div>
      </div>
    </GlassCard>
  </div>
);

// --- MAIN APP ---

export default function App() {
  const [rooms, setRooms] = useState([]); 
  const [view, setView] = useState('home'); 
  const [displayMode, setDisplayMode] = useState('map'); 
  const [user, setUser] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [selectedMapRoom, setSelectedMapRoom] = useState(null);
  const [authMode, setAuthMode] = useState('login'); 
  const [authData, setAuthData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  
  const [newRoom, setNewRoom] = useState({
    title: '', price: '', location: 'Xingren Road', distance: '', deposit: '',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
    landlordName: '', landlordPhone: '',
    amenities: [],
    coords: { top: '50%', left: '50%' } 
  });

  const [zoomLevel, setZoomLevel] = useState(1);
  const [serverError, setServerError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState(15000);
  const [locationFilter, setLocationFilter] = useState("All");

  useEffect(() => {
    fetchRooms();
    const storedUser = localStorage.getItem('yzu_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setBookmarks(parsedUser.bookmarks || []);
    }
  }, []);

  const fetchRooms = () => {
    axios.get(`${API_URL}/rooms`)
      .then(res => {
        setRooms(res.data);
        setServerError(false);
      })
      .catch(err => {
        console.error(err);
        setServerError(true);
      });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = authMode === 'login' ? '/login' : '/register';
    try {
      const res = await axios.post(`${API_URL}${endpoint}`, authData);
      if (authMode === 'register') {
        alert("Account created! Please login.");
        setAuthMode('login');
      } else {
        setUser(res.data.user);
        setBookmarks(res.data.user.bookmarks);
        localStorage.setItem('yzu_user', JSON.stringify(res.data.user));
        setView('home');
      }
    } catch (err) {
      if (err.code === "ERR_NETWORK") setError("Cannot connect to server. Is backend running?");
      else setError(err.response?.data?.error || "Error");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setBookmarks([]);
    localStorage.removeItem('yzu_user');
    setView('home');
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File is too big! Please use an image under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewRoom(prev => ({ ...prev, image: reader.result })); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (file && user) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File is too big! Please use an image under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;
        try {
          // Send update to server
          await axios.put(`${API_URL}/users/${user.id}`, { avatar: base64 });
          // Update local state
          const updatedUser = { ...user, avatar: base64 };
          setUser(updatedUser);
          localStorage.setItem('yzu_user', JSON.stringify(updatedUser));
        } catch (err) {
          alert("Failed to update profile picture");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      const roomData = {
        ...newRoom,
        price: Number(newRoom.price),
        distance: Number(newRoom.distance),
        deposit: Number(newRoom.deposit),
        rating: 5.0,
        tags: ["New Listing"],
        coords: newRoom.coords, 
        landlord: { name: newRoom.landlordName, phone: newRoom.landlordPhone },
        amenities: newRoom.amenities 
      };
      await axios.post(`${API_URL}/rooms`, roomData);
      alert("Room Published Successfully!");
      setNewRoom({
        title: '', price: '', location: 'Xingren Road', distance: '', deposit: '',
        image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
        landlordName: '', landlordPhone: '', amenities: [], 
        coords: { top: '50%', left: '50%' }
      });
      fetchRooms(); 
      setView('home');
      setDisplayMode('map');
    } catch (err) {
      alert("Upload failed. Is server running?");
    }
  };

  const handleDeleteRoom = async (roomId) => {
    try {
      await axios.delete(`${API_URL}/rooms/${roomId}`);
      setRooms(prev => prev.filter(r => r._id !== roomId));
    } catch (err) {
      alert("Delete failed: " + (err.response?.data?.error || "Server Error"));
    }
  };

  const toggleAmenitySelection = (amenity) => {
    setNewRoom(prev => {
      if (prev.amenities.includes(amenity)) {
        return { ...prev, amenities: prev.amenities.filter(a => a !== amenity) }; 
      } else {
        return { ...prev, amenities: [...prev.amenities, amenity] }; 
      }
    });
  };

  const toggleBookmark = async (id, e) => {
    e?.stopPropagation();
    if (!user) {
      setView('login');
      return;
    }
    const newBookmarks = bookmarks.includes(id) 
      ? bookmarks.filter(b => b !== id) 
      : [...bookmarks, id];
    setBookmarks(newBookmarks);
    try {
      await axios.post(`${API_URL}/bookmark`, { userId: user.id, roomId: id });
      const updatedUser = { ...user, bookmarks: newBookmarks };
      localStorage.setItem('yzu_user', JSON.stringify(updatedUser));
    } catch (err) { console.error(err); }
  };

  const handleCardClick = (room) => {
    setSelectedMapRoom(room);
    setDisplayMode('map');
    setView('home');
  };

  const handleImageClick = (room) => {
    setSelectedMapRoom(room);
    setView('detail');
  };

  const handleMapClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setNewRoom(prev => ({
      ...prev,
      coords: { top: `${y}%`, left: `${x}%` }
    }));
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const lowerSearch = searchTerm.toLowerCase().trim();
      const matchesSearch = 
        room.title.toLowerCase().includes(lowerSearch) ||
        room.location.toLowerCase().includes(lowerSearch) ||
        room.tags.some(tag => tag.toLowerCase().includes(lowerSearch));
      const matchesPrice = room.price <= priceRange;
      const matchesLoc = locationFilter === "All" || room.location.includes(locationFilter);
      return matchesSearch && matchesPrice && matchesLoc;
    });
  }, [rooms, searchTerm, priceRange, locationFilter]);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.5, 1));

  return (
    <div className="min-h-screen font-sans text-slate-900 bg-slate-50 relative selection:bg-blue-200 flex flex-col">
      
      {/* ANIMATED BACKGROUND BLOBS */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-slate-50">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-blue-200/40 rounded-full mix-blend-multiply filter blur-[100px] animate-blob"></div>
        <div className="absolute top-[10%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-[20%] w-[60vw] h-[60vw] bg-sky-200/40 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/20 bg-white/10 backdrop-blur-md shadow-sm h-20 px-4 md:px-8 flex justify-between items-center transition-all">
        <div onClick={() => setView('home')}><Logo /></div>
        {user ? (
          <div className="flex items-center gap-4">
            {/* ANY LOGGED IN USER IS NOW A HOST */}
            <button onClick={() => setView('host')} className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 bg-white/60 px-5 py-2.5 rounded-full border border-white shadow-sm hover:shadow-md transition-all">
              <Plus size={18} /> Add Room
            </button>
            <button onClick={() => setView('profile')} className="flex items-center gap-3 px-2 py-1.5 rounded-full bg-white/40 hover:bg-white/80 transition-all border border-white/50 shadow-sm backdrop-blur-sm">
               <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg ring-2 ring-white overflow-hidden">
                 {user.avatar ? (
                   <img src={user.avatar} className="w-full h-full object-cover" alt="Profile" />
                 ) : (
                   user.username.charAt(0).toUpperCase()
                 )}
               </div>
              <span className="font-bold text-sm hidden sm:block text-slate-800">{user.username}</span>
            </button>
          </div>
        ) : (
          <button onClick={() => { setView('login'); setAuthMode('login'); }} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-blue-600 shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0">Login</button>
        )}
      </nav>
      
      {serverError && (
        <div className="bg-red-500/90 backdrop-blur-md text-white p-3 text-center font-bold sticky top-20 z-40 flex items-center justify-center gap-2 shadow-lg animate-in slide-in-from-top-4">
           <AlertTriangle size={20}/> Network Error: Is your Backend Server running?
        </div>
      )}
      
      <div className="flex-1 w-full">
        {view === 'home' && (
          <HomeView 
            searchTerm={searchTerm} setSearchTerm={setSearchTerm} 
            locationFilter={locationFilter} setLocationFilter={setLocationFilter} 
            priceRange={priceRange} setPriceRange={setPriceRange} 
            displayMode={displayMode} setDisplayMode={setDisplayMode} 
            filteredRooms={filteredRooms} bookmarks={bookmarks} 
            toggleBookmark={toggleBookmark} handleCardClick={handleCardClick} 
            handleImageClick={handleImageClick} zoomLevel={zoomLevel} 
            handleZoomIn={handleZoomIn} handleZoomOut={handleZoomOut} 
            selectedMapRoom={selectedMapRoom} setSelectedMapRoom={setSelectedMapRoom}
            user={user} handleDeleteRoom={handleDeleteRoom} setView={setView}
          />
        )}
        {/* Updated to HostView */}
        {view === 'host' && (
          <HostView 
            handleUpload={handleUpload} newRoom={newRoom} setNewRoom={setNewRoom}
            handleImageFileChange={handleImageFileChange} handleMapClick={handleMapClick}
            toggleAmenitySelection={toggleAmenitySelection}
          />
        )}
        {view === 'profile' && (
          <ProfileView 
            user={user} handleLogout={handleLogout} rooms={rooms} handleProfilePicChange={handleProfilePicChange}
            bookmarks={bookmarks} toggleBookmark={toggleBookmark} 
            handleCardClick={handleCardClick} handleImageClick={handleImageClick} 
          />
        )}
        {view === 'detail' && (
          <RoomDetailView 
            room={selectedMapRoom} user={user} bookmarks={bookmarks} 
            setView={setView} toggleBookmark={toggleBookmark} handleDeleteRoom={handleDeleteRoom}
          />
        )}
        {view === 'login' && (
          <AuthView 
            authMode={authMode} setAuthMode={setAuthMode} 
            authData={authData} setAuthData={setAuthData} 
            error={error} handleAuth={handleAuth} setView={setView} 
          />
        )}
        {view === 'about' && <AboutView setView={setView} />}
        {view === 'terms' && <TermsView setView={setView} />}
        {view === 'privacy' && <PrivacyView setView={setView} />}
      </div>

      {view !== 'login' && <Footer setView={setView} />}
      <ChatBot rooms={rooms} setView={setView} handleImageClick={handleImageClick} />
    </div>
  );
}