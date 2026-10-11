import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';

const ChatContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const STORAGE_KEY = 'shippulse_chats_v4';
const CHANNEL_NAME = 'shippulse_chat_channel_v4';

const INITIAL_CONVERSATIONS = [];

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter(c => !c.id.startsWith('conv_demo_'));
      }
    } catch (e) { }
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

  // Sauvegarde globale : Supabase (Cloud) + Serveur Local + Cache Navigateur
  const saveAndBroadcast = async (updatedConvs, targetConv = null) => {
    try {
      conversationsRef.current = updatedConvs;
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConvs)); } catch (e) { }

      // 1. Sauvegarde dans Supabase Cloud en Temps Réel
      if (isSupabaseConfigured && supabase) {
        if (targetConv && targetConv.id) {
          await supabase.from('chats').upsert({
            id: targetConv.id,
            data: JSON.stringify(targetConv),
            updated_at: new Date().toISOString()
          });
        } else {
          // Sauvegarde par lot
          for (const c of updatedConvs) {
            await supabase.from('chats').upsert({
              id: c.id,
              data: JSON.stringify(c),
              updated_at: new Date().toISOString()
            });
          }
        }
      }

      // 2. Repli API locale Express (si disponible)
      fetch(`${API_BASE_URL}/chats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedConvs)
      }).catch(() => { });

      // 3. Relais onglets locaux
      if (channelRef.current) {
        channelRef.current.postMessage({
          type: 'CHATS_UPDATE',
          data: updatedConvs,
          timestamp: Date.now()
        });
      }
    } catch (e) {
      console.warn("Erreur saveAndBroadcast:", e);
    }
  };

  // Chargement et écoute Realtime Supabase
  useEffect(() => {
    let isMounted = true;

    async function loadFromSupabase() {
      if (!isSupabaseConfigured || !supabase) return false;
      try {
        const { data, error } = await supabase
          .from('chats')
          .select('*')
          .order('updated_at', { ascending: false });

        if (!error && Array.isArray(data) && isMounted) {
          const list = data.map(r => (typeof r.data === 'string' ? JSON.parse(r.data) : r.data));
          const filtered = list.filter(c => c && c.id && !c.id.startsWith('conv_demo_'));
          conversationsRef.current = filtered;
          setConversations(filtered);
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered)); } catch (e) { }
          return true;
        }
      } catch (err) {
        console.warn("Supabase chat fetch error:", err);
      }
      return false;
    }

    loadFromSupabase();

    // Abonnement aux WebSockets Supabase pour recevoir les messages en DIRECT
    let realTimeChannel = null;
    if (isSupabaseConfigured && supabase) {
      realTimeChannel = supabase
        .channel('public:chats')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, () => {
          loadFromSupabase();
        })
        .subscribe();
    }

    // Repli de synchronisation périodique toutes les 3s
    const syncInterval = setInterval(() => {
      if (isSupabaseConfigured && supabase) {
        loadFromSupabase();
      } else {
        fetch(`${API_BASE_URL}/chats`)
          .then(res => res.json())
          .then(res => {
            if (res.success && Array.isArray(res.data) && isMounted) {
              const filtered = res.data.filter(c => !c.id.startsWith('conv_demo_'));
              conversationsRef.current = filtered;
              setConversations(filtered);
            }
          })
          .catch(() => { });
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(syncInterval);
      if (realTimeChannel) supabase.removeChannel(realTimeChannel);
    };
  }, []);

  const extractTrackingCode = (text) => {
    if (!text) return null;
    const match = text.match(/SP-[A-Z0-9]{4,7}/i);
    return match ? match[0].toUpperCase() : null;
  };

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
      saveAndBroadcast(result, updated);
      setConversations(result);
    }, 800);
  };

  const sendMessageAsClient = (convId, text, userLang = 'fr', optionalTrackingCode = null) => {
    if (!text || !text.trim() || isSendingRef.current) return;
    isSendingRef.current = true;
    setTimeout(() => { isSendingRef.current = false; }, 300);

    const trimmedText = text.trim();
    const nowIso = new Date().toISOString();
    const prevConvs = conversationsRef.current;
    const detectedCode = optionalTrackingCode || extractTrackingCode(trimmedText);

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

    const updatedTargetConv = {
      ...targetConv,
      lang: userLang || targetConv.lang || 'fr',
      trackingCode: detectedCode || targetConv.trackingCode,
      unreadAdminCount: targetConv.unreadAdminCount + 1,
      lastMessageAt: nowIso,
      messages: [...targetConv.messages, newMsg]
    };

    const otherConvs = prevConvs.filter(c => c.id !== updatedTargetConv.id);
    const updatedList = [updatedTargetConv, ...otherConvs];

    saveAndBroadcast(updatedList, updatedTargetConv);
    setConversations(updatedList);

    if (currentBotCount < 2) {
      triggerAutoBotResponse(updatedTargetConv.id, trimmedText, userLang);
    }

    return updatedTargetConv;
  };

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
    saveAndBroadcast(result, updatedConv);
    setConversations(result);
  };

  const markAsReadByAdmin = (convId) => {
    const prevConvs = conversationsRef.current;
    const targetConv = prevConvs.find(c => c.id === convId);
    if (!targetConv || targetConv.unreadAdminCount === 0) return;

    const updatedConv = { ...targetConv, unreadAdminCount: 0 };
    const result = prevConvs.map(c => c.id === convId ? updatedConv : c);
    saveAndBroadcast(result, updatedConv);
    setConversations(result);
  };

  const markAsReadByClient = (convId) => {
    const prevConvs = conversationsRef.current;
    const targetConv = prevConvs.find(c => c.id === convId);
    if (!targetConv || targetConv.unreadClientCount === 0) return;

    const updatedConv = { ...targetConv, unreadClientCount: 0 };
    const result = prevConvs.map(c => c.id === convId ? updatedConv : c);
    saveAndBroadcast(result, updatedConv);
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
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};