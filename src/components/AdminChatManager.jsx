import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { useShipments } from '../context/ShipmentContext';
import { 
  MessageSquare, Send, Headphones, ShieldCheck, User, Search, 
  ArrowLeft, FileCheck, CheckCircle2, AlertCircle
} from 'lucide-react';

export const AdminChatManager = ({ currentLang = 'fr' }) => {
  const { 
    conversations, 
    activeConvId, 
    setActiveConvId, 
    sendMessageAsAdmin, 
    markAsReadByAdmin 
  } = useChat();

  const { shipments } = useShipments();

  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'thread'
  const messagesEndRef = useRef(null);

  const isFR = currentLang === 'fr';

  // Filter conversations
  const filteredConversations = conversations.filter(conv => {
    const query = searchQuery.toLowerCase();
    return (
      (conv.trackingCode && conv.trackingCode.toLowerCase().includes(query)) ||
      (conv.clientName && conv.clientName.toLowerCase().includes(query)) ||
      conv.messages.some(m => m.text.toLowerCase().includes(query))
    );
  });

  const selectedConv = conversations.find(c => c.id === activeConvId) || conversations[0];

  // Lookup matching shipment by tracking code in database
  const currentShipment = shipments.find(s => 
    selectedConv?.trackingCode && 
    s.id.toUpperCase() === selectedConv.trackingCode.toUpperCase()
  );

  // Check if verification message has already been generated or sent for this conversation
  const isVerificationAlreadySent = Boolean(
    selectedConv?.messages.some(m => 
      m.text && (
        m.text.includes('FICHE DE CONTRÔLE COLIS') ||
        m.text.includes('SHIPMENT VERIFICATION FORM') ||
        m.text.includes('s\'agit bien de votre colis') ||
        m.text.includes('correspond to your shipment')
      )
    ) || 
    replyText.includes('FICHE DE CONTRÔLE COLIS') || 
    replyText.includes('SHIPMENT VERIFICATION FORM')
  );

  // Auto-scroll message container & mark as read
  useEffect(() => {
    if (selectedConv) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      if (selectedConv.unreadAdminCount > 0) {
        markAsReadByAdmin(selectedConv.id);
      }
    }
  }, [selectedConv, selectedConv?.messages]);

  const handleSelectConv = (convId) => {
    setActiveConvId(convId);
    markAsReadByAdmin(convId);
    setMobileView('thread');
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConv) return;

    sendMessageAsAdmin(selectedConv.id, replyText);
    setReplyText('');
  };

  // Generate Pre-filled Verification Message based on shipment details
  const handleGenerateVerificationMessage = () => {
    if (!selectedConv || isVerificationAlreadySent) return;
    const code = selectedConv.trackingCode || 'SP-XXXXX';
    
    let text = '';
    if (currentShipment) {
      const senderName = ((currentShipment.sender?.firstName || '') + ' ' + (currentShipment.sender?.lastName || '')).trim() || 'Expéditeur';
      const recipientName = ((currentShipment.recipient?.firstName || '') + ' ' + (currentShipment.recipient?.lastName || '')).trim() || 'Destinataire';
      const origin = currentShipment.originCity || 'Ville de départ';
      const dest = currentShipment.destinationCity || 'Ville de destination';
      const goods = currentShipment.packageDetails?.goodsType || 'Fret marchandise';
      const weight = currentShipment.packageDetails?.weightKg ? `${currentShipment.packageDetails.weightKg} kg` : '';
      
      if (isFR) {
        text = `Bonjour ! D'après votre code d'expédition [${code}], voici la fiche d'informations identifiée :\n\n` +
               `📦 FICHE DE CONTRÔLE COLIS :\n` +
               `👤 Expéditeur : ${senderName} (${origin})\n` +
               `📍 Destinataire : ${recipientName} (${dest})\n` +
               `📦 Marchandise : ${goods} ${weight ? '(' + weight + ')' : ''}\n` +
               `🚚 Trajet officiel : ${origin} ➔ ${dest}\n\n` +
               `Pouvez-vous nous confirmer s'il s'agit bien de votre colis afin de poursuivre ?`;
      } else {
        text = `Hello! Based on your tracking code [${code}], here are your shipment details:\n\n` +
               `📦 SHIPMENT VERIFICATION FORM:\n` +
               `👤 Shipper: ${senderName} (${origin})\n` +
               `📍 Consignee: ${recipientName} (${dest})\n` +
               `📦 Cargo Item: ${goods} ${weight ? '(' + weight + ')' : ''}\n` +
               `🚚 Official Route: ${origin} ➔ ${dest}\n\n` +
               `Could you please confirm if these details correspond to your shipment?`;
      }
    } else {
      if (isFR) {
        text = `Bonjour ! Concernant votre code d'expédition [${code}], pouvez-vous nous confirmer qu'il s'agit bien de votre colis afin de vérifier vos informations d'expédition ?`;
      } else {
        text = `Hello! Regarding your tracking code [${code}], could you please confirm if this is your shipment so we can verify your cargo details?`;
      }
    }

    setReplyText(text);
  };

  return (
    <div className="admin-chat-container">
      
      {/* Sidebar - Conversation List */}
      <div className={`admin-chat-sidebar ${mobileView === 'thread' ? 'hide-mobile' : ''}`}>
        
        {/* Sidebar Header */}
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.9rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={16} color="#00A8E8" />
              {isFR ? 'Support Client Live' : 'Live Client Support'}
            </h3>
            <span style={{
              fontSize: '0.7rem',
              backgroundColor: 'rgba(0, 168, 232, 0.15)',
              color: '#00A8E8',
              border: '1px solid rgba(0, 168, 232, 0.3)',
              padding: '2px 8px',
              borderRadius: '9999px',
              fontWeight: 600
            }}>
              {conversations.length} {isFR ? 'discussions' : 'chats'}
            </span>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={14} color="#64748B" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isFR ? 'Rechercher code, nom...' : 'Search code, name...'}
              style={{
                width: '100%',
                background: '#0F172A',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '8px 10px 8px 32px',
                fontSize: '0.78rem',
                color: '#F8FAFC',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>
        </div>

        {/* Conversation List Items */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredConversations.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748B', fontSize: '0.8rem' }}>
              {isFR ? 'Aucune conversation trouvée' : 'No conversations found'}
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = selectedConv && selectedConv.id === conv.id;
              const lastMsg = conv.messages[conv.messages.length - 1];

              return (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConv(conv.id)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    textAlign: 'left',
                    background: isSelected ? 'rgba(0, 168, 232, 0.12)' : 'transparent',
                    border: 'none',
                    borderLeft: isSelected ? '4px solid #00A8E8' : '4px solid transparent',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    transition: 'background 0.2s ease'
                  }}
                >
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#1E293B',
                      border: '1px solid #334155',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#E2E8F0',
                      fontWeight: 700,
                      fontSize: '0.85rem'
                    }}>
                      {conv.clientName ? conv.clientName.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <span style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: '9px',
                      height: '9px',
                      backgroundColor: '#10B981',
                      border: '1.5px solid #070C18',
                      borderRadius: '50%'
                    }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <h4 style={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.82rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {conv.clientName}
                      </h4>
                      <span style={{ fontSize: '0.68rem', color: '#64748B' }}>
                        {lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      {conv.trackingCode ? (
                        <span style={{
                          fontSize: '0.68rem',
                          background: '#1E293B',
                          color: '#00A8E8',
                          border: '1px solid rgba(0, 168, 232, 0.3)',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          fontFamily: 'monospace'
                        }}>
                          {conv.trackingCode}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.68rem', color: '#F59E0B', fontStyle: 'italic' }}>
                          {isFR ? 'Code non renseigné' : 'No code'}
                        </span>
                      )}
                      <span style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                        [{conv.lang || 'fr'}]
                      </span>
                    </div>

                    <p style={{
                      fontSize: '0.75rem',
                      color: '#94A3B8',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {lastMsg ? lastMsg.text : ''}
                    </p>
                  </div>

                  {conv.unreadAdminCount > 0 && (
                    <span style={{
                      backgroundColor: '#00A8E8',
                      color: '#0B192C',
                      fontWeight: 800,
                      fontSize: '0.68rem',
                      borderRadius: '9999px',
                      minWidth: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      alignSelf: 'center'
                    }}>
                      {conv.unreadAdminCount}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Message Panel */}
      {selectedConv ? (
        <div className={`admin-chat-main ${mobileView === 'list' ? 'hide-mobile' : ''}`}>
          
          {/* Active Conversation Header */}
          <div style={{
            padding: '12px 16px',
            background: '#070C18',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              
              {/* Back to List button for mobile view */}
              <button
                onClick={() => setMobileView('list')}
                className="show-mobile-back-btn"
                style={{
                  background: '#1E293B',
                  border: '1px solid #334155',
                  color: '#00A8E8',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <ArrowLeft size={14} />
                {isFR ? 'Liste' : 'Chats'}
              </button>

              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(0, 168, 232, 0.12)',
                border: '1px solid rgba(0, 168, 232, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00A8E8',
                flexShrink: 0
              }}>
                <User size={18} />
              </div>
              <div style={{ minWidth: 0 }}>
                <h3 style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.88rem', margin: 0, display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedConv.clientName}</span>
                  <span style={{
                    fontSize: '0.68rem',
                    background: '#1E293B',
                    color: '#00A8E8',
                    border: '1px solid rgba(0, 168, 232, 0.3)',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontFamily: 'monospace'
                  }}>
                    {selectedConv.trackingCode || (isFR ? 'Code En Attente' : 'Code Pending')}
                  </span>
                </h3>
                <p style={{ color: '#64748B', fontSize: '0.72rem', margin: '2px 0 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedConv.clientEmail || 'client@shippulse.com'}</span>
                  <span>•</span>
                  <span style={{ color: '#00A8E8', textTransform: 'uppercase', fontFamily: 'monospace', fontSize: '0.68rem' }}>
                    [{selectedConv.lang || 'fr'}]
                  </span>
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                fontSize: '0.7rem',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#10B981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '3px 8px',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
                {isFR ? 'Active' : 'Active'}
              </span>
            </div>
          </div>

          {/* Messages Stream */}
          <div style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: '#090F20'
          }}>
            {selectedConv.messages.map((msg) => {
              const isClient = msg.sender === 'client';
              const isBot = msg.sender === 'bot';
              const isAdmin = msg.sender === 'admin';

              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isAdmin ? 'flex-end' : 'flex-start',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', color: '#64748B', padding: '0 4px' }}>
                    {isBot && <Headphones size={12} color="#00A8E8" />}
                    {isAdmin && <ShieldCheck size={12} color="#10B981" />}
                    {isClient && <User size={12} color="#00A8E8" />}
                    <span style={{ fontWeight: 600, color: '#CBD5E1' }}>{msg.senderName}</span>
                    <span>•</span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div
                    style={{
                      maxWidth: '85%',
                      borderRadius: isAdmin ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                      padding: '10px 14px',
                      fontSize: '0.82rem',
                      lineHeight: '1.45',
                      whiteSpace: 'pre-line',
                      background: isAdmin
                        ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                        : isBot
                        ? '#070C18'
                        : '#1E293B',
                      border: isAdmin
                        ? 'none'
                        : isBot
                        ? '1px solid rgba(0, 168, 232, 0.35)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      color: isAdmin ? '#FFFFFF' : isBot ? '#38BDF8' : '#F8FAFC',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply Form Input */}
          <form onSubmit={handleSendReply} style={{
            padding: '12px 14px',
            background: '#050914',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <textarea
              rows={2}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={
                isFR
                  ? "Répondre au client..."
                  : "Reply to client..."
              }
              style={{
                flex: 1,
                background: '#0F172A',
                border: '1px solid #334155',
                borderRadius: '10px',
                padding: '10px 14px',
                fontSize: '0.82rem',
                color: '#FFFFFF',
                outline: 'none',
                fontFamily: 'inherit',
                resize: 'none'
              }}
            />
            
            {/* Quick 1-click verification card generator icon (Hidden if already sent) */}
            {!isVerificationAlreadySent && (
              <button
                type="button"
                onClick={handleGenerateVerificationMessage}
                style={{
                  background: 'rgba(0, 168, 232, 0.15)',
                  border: '1px solid rgba(0, 168, 232, 0.4)',
                  color: '#00A8E8',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '44px',
                  flexShrink: 0,
                  transition: 'all 0.2s ease'
                }}
                title={isFR ? "⚡ Insérer la Fiche Colis Pré-remplie" : "⚡ Insert Pre-filled Cargo Verification Form"}
              >
                <FileCheck size={18} />
              </button>
            )}

            <button
              type="submit"
              disabled={!replyText.trim()}
              style={{
                background: replyText.trim()
                  ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                  : '#334155',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 16px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: replyText.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
                flexShrink: 0,
                height: '44px'
              }}
            >
              <Send size={16} />
              <span className="hide-mobile-text">{isFR ? 'Envoyer' : 'Send'}</span>
            </button>
          </form>

        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justify: 'center', padding: '30px', color: '#64748B' }}>
          <MessageSquare size={48} color="#334155" style={{ marginBottom: '12px' }} />
          <p style={{ fontSize: '0.9rem' }}>
            {isFR ? 'Sélectionnez une conversation pour échanger' : 'Select a conversation to start chatting'}
          </p>
        </div>
      )}

      <style>{`
        .admin-chat-container {
          background: #0B132B;
          border: 1px solid rgba(0, 168, 232, 0.25);
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: row;
          height: calc(100vh - 220px);
          min-height: 480px;
          max-height: 750px;
          overflow: hidden;
          font-family: Inter, system-ui, sans-serif;
        }

        .admin-chat-sidebar {
          width: 320px;
          background: #070C18;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }

        .admin-chat-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #0B132B;
          min-width: 0;
        }

        .show-mobile-back-btn {
          display: none;
        }

        @media (max-width: 768px) {
          .admin-chat-sidebar {
            width: 100%;
          }

          .admin-chat-sidebar.hide-mobile {
            display: none !important;
          }

          .admin-chat-main.hide-mobile {
            display: none !important;
          }

          .show-mobile-back-btn {
            display: inline-flex !important;
          }

          .hide-mobile-text {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
