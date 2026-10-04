import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const ChatContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const STORAGE_KEY = 'shippulse_chats_v3';
const CHANNEL_NAME = 'shippulse_chat_channel_v3';

// Clean initial state for production (no test conversations)
const INITIAL_CONVERSATIONS = [];

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState(() => {
    try {
      localStorage.removeItem('shippulse_chats_v1');
      localStorage.removeItem('shippulse_chats_v2');

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(c => !c.id.startsWith('conv_demo_'));
        }
      }
    } catch (e) {}
    return INITIAL_CONVERSATIONS;
  });

  const [activeConvId, setActiveConvId] = useState(null);
  const [isBotTyping, setIsBotTyping] = useState(false);

  const conversationsRef = useRef(conversations);
  const channelRef = useRef(null);
  const isSendingRef = useRef(false);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  // Sync to local storage, broadcast channel, AND server REST API
  const saveAndBroadcast = async (updatedConvs) => {
    try {
      conversationsRef.current = updatedConvs;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConvs));
      
      if (channelRef.current) {
        channelRef.current.postMessage({
          type: 'CHATS_UPDATE',
          data: updatedConvs,
          timestamp: Date.now()
        });
      }

      // Persist to SQLite Server Database
      await fetch(`${API_BASE_URL}/chats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedConvs)
      });
    } catch (e) {
      console.warn("Failed to persist chats to backend server:", e);
    }
  };

  // Initial Fetch & Periodic 3-second Polling for Cross-Device Synchronization
  useEffect(() => {
    let isMounted = true;

    // Cross-tab BroadcastChannel & LocalStorage sync
    try {
      if ('BroadcastChannel' in window) {
        channelRef.current = new BroadcastChannel(CHANNEL_NAME);
        channelRef.current.onmessage = (event) => {
          if (event.data && event.data.type === 'CHATS_UPDATE' && Array.isArray(event.data.data)) {
            const filtered = event.data.data.filter(c => !c.id.startsWith('conv_demo_'));
            conversationsRef.current = filtered;
            setConversations(filtered);
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered)); } catch (e) {}
          }
        };
      }
    } catch (e) {}

    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            const filtered = parsed.filter(c => !c.id.startsWith('conv_demo_'));
            conversationsRef.current = filtered;
            setConversations(filtered);
          }
        } catch (err) {}
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Fetch conversations from Backend API Server
    async function syncFromBackendServer() {
      try {
        const res = await fetch(`${API_BASE_URL}/chats`);
        if (res.ok) {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const result = await res.json();
            if (result.success && Array.isArray(result.data) && isMounted) {
              const filtered = result.data.filter(c => !c.id.startsWith('conv_demo_'));
              
              const currentStr = JSON.stringify(conversationsRef.current);
              const fetchedStr = JSON.stringify(filtered);

              if (currentStr !== fetchedStr) {
                conversationsRef.current = filtered;
                setConversations(filtered);
                try { localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered)); } catch (e) {}
              }
            }
          }
        }
      } catch (err) {
        // Silently handle offline / server unreachable
      }
    }

    syncFromBackendServer();

    // Poll every 3 seconds for global cross-device synchronization
    const syncInterval = setInterval(syncFromBackendServer, 3000);

    return () => {
      isMounted = false;
      clearInterval(syncInterval);
      if (channelRef.current) {
        channelRef.current.close();
      }
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Helper to extract tracking code from text e.g. "SP-60414U"
  const extractTrackingCode = (text) => {
    if (!text) return null;
    const match = text.match(/SP-[A-Z0-9]{4,7}/i);
    if (match) return match[0].toUpperCase();
    return null;
  };

  // Automated Bot Response Logic (MAX 2 RESPONSES PER CONVERSATION)
  const triggerAutoBotResponse = (convId, lastClientMessage, langOverride = 'fr') => {
    setIsBotTyping(true);

    setTimeout(() => {
      setIsBotTyping(false);

      const currentConvs = conversationsRef.current;
      const target = currentConvs.find(c => c.id === convId);
      if (!target) return;

      const botMsgCount = target.messages.filter(m => m.sender === 'bot').length;
      if (botMsgCount >= 2) return;

      const newlyDetectedCode = extractTrackingCode(lastClientMessage);
      const effectiveCode = newlyDetectedCode || target.trackingCode;
      const isFR = (langOverride || target.lang || 'fr') === 'fr';

      let botResponseText = '';

      if (botMsgCount === 0) {
        botResponseText = isFR
          ? "Bonjour ! Merci d'avoir contacté le support ShipPulse. Afin d'identifier votre dossier et vous aider au mieux, veuillez nous indiquer votre code d'expédition (ex: au format SP-XXXXX)."
          : "Hello! Thank you for contacting ShipPulse Support. To help us identify your shipment and assist you, please provide your tracking number (e.g., in SP-XXXXX format).";
      } else if (botMsgCount === 1) {
        botResponseText = isFR
          ? `Merci ! Votre code d'expédition ${effectiveCode || 'SP-XXXXX'} a bien été identifié. Un agent de notre équipe support va vous répondre d'ici peu.`
          : `Thank you! Your tracking code ${effectiveCode || 'SP-XXXXX'} has been verified. A live support agent will respond to you shortly.`;
      }

      if (!botResponseText) return;

      const botMsg = {
        id: `bot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        sender: 'bot',
        senderName: 'Assistant Support ShipPulse',
        text: botResponseText,
        timestamp: new Date().toISOString()
      };

      const updated = {
        ...target,
        trackingCode: effectiveCode || target.trackingCode,
        messages: [...target.messages, botMsg],
        lastMessageAt: botMsg.timestamp
      };

      const result = [updated, ...currentConvs.filter(c => c.id !== convId)];
      saveAndBroadcast(result);
      setConversations(result);
    }, 800);
  };

  // 1. Client Sends Message
  const sendMessageAsClient = (convId, text, userLang = 'fr', optionalTrackingCode = null) => {
    if (!text || !text.trim() || isSendingRef.current) return;
    isSendingRef.current = true;

    setTimeout(() => { isSendingRef.current = false; }, 300);

    const trimmedText = text.trim();
    const nowIso = new Date().toISOString();
    const prevConvs = conversationsRef.current;
    const detectedCode = optionalTrackingCode || extractTrackingCode(trimmedText);

    // Search existing conversation by convId OR by trackingCode if client is returning/reconnecting
    let targetConv = prevConvs.find(c => c.id === convId);
    if (!targetConv && detectedCode) {
      targetConv = prevConvs.find(c => c.trackingCode && c.trackingCode.toUpperCase() === detectedCode.toUpperCase());
    }

    if (!targetConv) {
      targetConv = {
        id: convId || `conv_${Date.now()}`,
        trackingCode: detectedCode || null,
        clientName: 'Client Support User',
        clientEmail: null,
        lang: userLang,
        status: 'active',
        unreadAdminCount: 0,
        unreadClientCount: 0,
        lastMessageAt: nowIso,
        messages: []
      };
    }

    const currentBotCount = targetConv.messages.filter(m => m.sender === 'bot').length;

    const newMsg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sender: 'client',
      senderName: targetConv.clientName || 'Client',
      text: trimmedText,
      timestamp: nowIso
    };

    const updatedMessages = [...targetConv.messages, newMsg];
    const finalTrackingCode = detectedCode || targetConv.trackingCode;

    const updatedTargetConv = {
      ...targetConv,
      lang: userLang || targetConv.lang || 'fr',
      trackingCode: finalTrackingCode,
      unreadAdminCount: targetConv.unreadAdminCount + 1,
      lastMessageAt: nowIso,
      messages: updatedMessages
    };

    const otherConvs = prevConvs.filter(c => c.id !== updatedTargetConv.id);
    const updatedList = [updatedTargetConv, ...otherConvs];

    saveAndBroadcast(updatedList);
    setConversations(updatedList);

    if (currentBotCount < 2) {
      triggerAutoBotResponse(updatedTargetConv.id, trimmedText, userLang);
    }
  };

  // 2. Admin Sends Message
  const sendMessageAsAdmin = (convId, text) => {
    if (!text || !text.trim()) return;
    const trimmedText = text.trim();
    const nowIso = new Date().toISOString();
    const prevConvs = conversationsRef.current;

    const targetConv = prevConvs.find(c => c.id === convId);
    if (!targetConv) return;

    const adminMsg = {
      id: `admin_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sender: 'admin',
      senderName: 'Support Agent (Admin)',
      text: trimmedText,
      timestamp: nowIso
    };

    const updatedConv = {
      ...targetConv,
      unreadClientCount: targetConv.unreadClientCount + 1,
      lastMessageAt: nowIso,
      messages: [...targetConv.messages, adminMsg]
    };

    const result = [updatedConv, ...prevConvs.filter(c => c.id !== convId)];
    saveAndBroadcast(result);
    setConversations(result);
  };

  // Mark conversation as read by Admin
  const markAsReadByAdmin = (convId) => {
    const prevConvs = conversationsRef.current;
    const targetConv = prevConvs.find(c => c.id === convId);
    if (!targetConv || targetConv.unreadAdminCount === 0) return;

    const updatedConv = {
      ...targetConv,
      unreadAdminCount: 0
    };

    const result = prevConvs.map(c => c.id === convId ? updatedConv : c);
    saveAndBroadcast(result);
    setConversations(result);
  };

  // Mark conversation as read by Client
  const markAsReadByClient = (convId) => {
    const prevConvs = conversationsRef.current;
    const targetConv = prevConvs.find(c => c.id === convId);
    if (!targetConv || targetConv.unreadClientCount === 0) return;

    const updatedConv = {
      ...targetConv,
      unreadClientCount: 0
    };

    const result = prevConvs.map(c => c.id === convId ? updatedConv : c);
    saveAndBroadcast(result);
    setConversations(result);
  };

  const totalUnreadAdminCount = conversations.reduce((acc, c) => acc + (c.unreadAdminCount || 0), 0);

  return (
    <ChatContext.Provider value={{
      conversations,
      activeConvId,
      setActiveConvId,
      isBotTyping,
      sendMessageAsClient,
      sendMessageAsAdmin,
      markAsReadByAdmin,
      markAsReadByClient,
      totalUnreadAdminCount
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

