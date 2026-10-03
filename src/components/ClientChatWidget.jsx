import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { MessageCircle, MessageSquare, X, Send, ShieldCheck, User, Minimize2, LifeBuoy } from 'lucide-react';

const ModernChatIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 13.6706 3.45491 15.2355 4.25 16.5833L3.5 20.5L7.54167 19.75C8.88947 20.5451 10.4544 21 12 21Z" fill="url(#chatIconGrad)" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="8.5" cy="12" r="1.3" fill="white"/>
    <circle cx="12" cy="12" r="1.3" fill="white"/>
    <circle cx="15.5" cy="12" r="1.3" fill="white"/>
    <defs>
      <linearGradient id="chatIconGrad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00A8E8"/>
        <stop offset="1" stopColor="#0077B6"/>
      </linearGradient>
    </defs>
  </svg>
);

export const ClientChatWidget = ({ currentLang = 'fr' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [clientConvId] = useState(() => {
    return localStorage.getItem('shippulse_client_conv_id') || `conv_${Date.now()}`;
  });

  const { conversations, sendMessageAsClient, markAsReadByClient, isBotTyping } = useChat();
  const messagesEndRef = useRef(null);

  // Persist client conversation ID
  useEffect(() => {
    try {
      localStorage.setItem('shippulse_client_conv_id', clientConvId);
    } catch (e) {}
  }, [clientConvId]);

  // Find active conversation for current client
  const activeConv = conversations.find(c => c.id === clientConvId);
  const messages = activeConv ? activeConv.messages : [];
  const unreadCount = activeConv ? activeConv.unreadClientCount : 0;

  // Auto scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      if (activeConv && activeConv.unreadClientCount > 0) {
        markAsReadByClient(clientConvId);
      }
    }
  }, [messages, isOpen, isBotTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendMessageAsClient(clientConvId, inputText, currentLang);
    setInputText('');
  };

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState && activeConv && activeConv.unreadClientCount > 0) {
      markAsReadByClient(clientConvId);
    }
  };

  const isFR = currentLang === 'fr';

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 99999, fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="client-chat-window" style={{
          position: 'fixed',
          bottom: '92px',
          right: '24px',
          width: '380px',
          maxWidth: 'calc(100vw - 32px)',
          height: '530px',
          maxHeight: 'calc(100vh - 120px)',
          background: '#0B132B',
          border: '1px solid rgba(0, 168, 232, 0.4)',
          borderRadius: '16px',
          boxShadow: '0 20px 50px rgba(11, 25, 44, 0.5), 0 0 25px rgba(0, 168, 232, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'chatSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #0B192C 0%, #1E293B 100%)',
            padding: '14px 16px',
            borderBottom: '1px solid rgba(0, 168, 232, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #00A8E8 0%, #0077B6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 12px rgba(0, 168, 232, 0.35)'
                }}>
                  <MessageCircle size={20} />
                </div>
                <span style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  width: '10px',
                  height: '10px',
                  backgroundColor: '#10B981',
                  border: '2px solid #0B192C',
                  borderRadius: '50%'
                }} />
              </div>
              <div>
                <h4 style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>
                  {isFR ? 'Support Client ShipPulse' : 'ShipPulse Customer Desk'}
                </h4>
                <p style={{ color: '#00A8E8', fontSize: '0.75rem', margin: '2px 0 0 0', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }}></span>
                  {isFR ? 'En ligne • Assistance & Agents' : 'Online • Desk Support & Agents'}
                </p>
              </div>
            </div>

            <button
              onClick={handleToggle}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={isFR ? 'Fermer' : 'Close'}
            >
              <Minimize2 size={18} />
            </button>
          </div>

          {/* Messages Body */}
          <div style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: '#090F20'
          }}>
            {messages.length === 0 ? (
              <div style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '20px',
                color: '#94A3B8'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(0, 168, 232, 0.1)',
                  border: '1px solid rgba(0, 168, 232, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                  color: '#00A8E8'
                }}>
                  <LifeBuoy size={24} />
                </div>
                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#F8FAFC', margin: '0 0 6px 0' }}>
                  {isFR ? "Besoin d'aide pour votre expédition ?" : 'Need assistance with your cargo?'}
                </p>
                <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0, maxWidth: '240px', lineHeight: '1.45' }}>
                  {isFR 
                    ? "Posez vos questions ou indiquez votre code de suivi (ex: au format SP-XXXXX)." 
                    : "Ask your question or state your tracking code (e.g., in SP-XXXXX format)."}
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isClient = msg.sender === 'client';
                const isBot = msg.sender === 'bot';
                const isAdmin = msg.sender === 'admin';

                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isClient ? 'flex-end' : 'flex-start',
                      gap: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', color: '#64748B', padding: '0 4px' }}>
                      {isBot && <MessageCircle size={12} color="#00A8E8" />}
                      {isAdmin && <ShieldCheck size={12} color="#10B981" />}
                      {isClient && <User size={12} color="#38BDF8" />}
                      <span>{msg.senderName}</span>
                      <span>•</span>
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div
                      style={{
                        maxWidth: '85%',
                        borderRadius: isClient ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                        padding: '10px 14px',
                        fontSize: '0.82rem',
                        lineHeight: '1.45',
                        whiteSpace: 'pre-line',
                        background: isClient
                          ? 'linear-gradient(135deg, #00A8E8 0%, #0077B6 100%)'
                          : isAdmin
                          ? '#064E3B'
                          : '#1E293B',
                        border: isClient
                          ? 'none'
                          : isAdmin
                          ? '1px solid rgba(16, 185, 129, 0.4)'
                          : '1px solid rgba(0, 168, 232, 0.25)',
                        color: isClient ? '#FFFFFF' : isAdmin ? '#ECFDF5' : '#F8FAFC',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}

            {/* Support Typing Indicator */}
            {isBotTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94A3B8' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#0B192C',
                  border: '1px solid rgba(0, 168, 232, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#00A8E8'
                }}>
                  <MessageCircle size={14} />
                </div>
                <div style={{
                  background: '#1E293B',
                  border: '1px solid rgba(0, 168, 232, 0.25)',
                  borderRadius: '12px 12px 12px 2px',
                  padding: '8px 12px',
                  fontSize: '0.8rem',
                  color: '#00A8E8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span>{isFR ? 'Support écrit' : 'Support typing'}</span>
                  <span className="dot-typing">...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSend} style={{
            padding: '12px 14px',
            background: '#050914',
            borderTop: '1px solid rgba(0, 168, 232, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isFR 
                  ? "Votre message ou code SP-XXXXX..." 
                  : "Type message or tracking code..."
              }
              style={{
                flex: 1,
                background: '#1E293B',
                border: '1px solid #334155',
                borderRadius: '10px',
                padding: '10px 14px',
                fontSize: '0.82rem',
                color: '#FFFFFF',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              style={{
                background: inputText.trim() 
                  ? 'linear-gradient(135deg, #00A8E8 0%, #0077B6 100%)' 
                  : '#334155',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                width: '40px',
                height: '40px',
                cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Corporate Modern Trigger Button Container */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        
        {/* Callout Pill Tooltip (Shown when chat is closed) */}
        {!isOpen && (
          <div
            onClick={handleToggle}
            className="client-chat-tooltip"
            style={{
              position: 'absolute',
              right: '72px',
              whiteSpace: 'nowrap',
              background: 'rgba(11, 25, 44, 0.95)',
              border: '1.5px solid rgba(0, 168, 232, 0.6)',
              boxShadow: '0 8px 25px rgba(0, 168, 232, 0.35), 0 0 15px rgba(0, 168, 232, 0.2)',
              borderRadius: '20px',
              padding: '8px 16px',
              color: '#FFFFFF',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backdropFilter: 'blur(8px)',
              animation: 'tooltipFloat 3s ease-in-out infinite'
            }}
          >
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              boxShadow: '0 0 10px #10B981',
              display: 'inline-block'
            }} />
            <span>{isFR ? 'Chat Support • En direct' : 'Live Chat • Desk Support'}</span>
            <MessageCircle size={15} color="#00A8E8" />
          </div>
        )}

        {/* Outer Pulsing Radar Rings */}
        {!isOpen && (
          <>
            <div className="radar-ring ring-1" />
            <div className="radar-ring ring-2" />
          </>
        )}

        {/* Main Ultra-Modern Trigger Button */}
        <button
          onClick={handleToggle}
          className={`corporate-chat-btn ${!isOpen ? 'btn-floating' : ''}`}
          style={{
            width: '62px',
            height: '62px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0B192C 0%, #00A8E8 100%)',
            color: '#FFFFFF',
            border: '2px solid rgba(255, 255, 255, 0.9)',
            boxShadow: '0 10px 30px rgba(0, 168, 232, 0.5), 0 0 20px rgba(11, 25, 44, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 10,
            transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          title="ShipPulse Support Desk"
        >
          {isOpen ? <X size={28} /> : <ModernChatIcon />}

          {/* Unread count badge */}
          {!isOpen && unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              backgroundColor: '#EF4444',
              color: '#FFFFFF',
              fontSize: '0.75rem',
              fontWeight: 800,
              borderRadius: '9999px',
              width: '22px',
              height: '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #0F172A',
              boxShadow: '0 0 10px rgba(239, 68, 68, 0.8)',
              animation: 'badgePulse 1s infinite alternate'
            }}>
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .dot-typing {
          animation: dotPulse 1.5s infinite;
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }

        /* Radar Wave Rings */
        .radar-ring {
          position: absolute;
          width: 62px;
          height: 62px;
          border-radius: 50%;
          border: 2px solid #00A8E8;
          pointer-events: none;
          z-index: 1;
        }

        .ring-1 {
          animation: radarWave 2.6s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
        }

        .ring-2 {
          animation: radarWave 2.6s cubic-bezier(0.1, 0.8, 0.3, 1) infinite 1.3s;
        }

        @keyframes radarWave {
          0% {
            transform: scale(1);
            opacity: 0.9;
            border-color: #00A8E8;
            box-shadow: 0 0 10px #00A8E8;
          }
          50% {
            border-color: #0077B6;
            box-shadow: 0 0 20px #0077B6;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
            border-color: #10B981;
            box-shadow: 0 0 30px #10B981;
          }
        }

        /* Floating Bounce */
        .btn-floating {
          animation: floatWiggle 4s ease-in-out infinite;
        }

        @keyframes floatWiggle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes tooltipFloat {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(-6px); }
        }

        @keyframes badgePulse {
          from { transform: scale(1); }
          to { transform: scale(1.2); }
        }

        @media (max-width: 640px) {
          .client-chat-window {
            right: 12px !important;
            left: 12px !important;
            width: calc(100vw - 24px) !important;
            bottom: 80px !important;
            height: calc(100vh - 100px) !important;
            max-height: 560px !important;
            border-radius: 14px !important;
          }

          .client-chat-tooltip {
            right: 68px !important;
            max-width: calc(100vw - 90px) !important;
            font-size: 0.72rem !important;
            padding: 6px 12px !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }
        }
      `}</style>
    </div>
  );
};
