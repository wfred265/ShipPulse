import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const ChatContext = createContext();

const STORAGE_KEY = 'shippulse_chats_v1';
const CHANNEL_NAME = 'shippulse_chat_channel_v1';

// Initial demo conversations for Admin testing
const INITIAL_CONVERSATIONS = [
  {
    id: 'conv_demo_1',
    trackingCode: 'SP-60414U',
    clientName: 'Robert Vance',
    clientEmail: 'robert.vance@example.com',
    lang: 'en',
    status: 'active',
    unreadAdminCount: 1,
    unreadClientCount: 0,
    lastMessageAt: new Date(Date.now() - 5 * 60000).toISOString(),
    messages: [
      {
        id: 'm1',
        sender: 'client',
        senderName: 'Robert Vance',
        text: 'Hello, I would like to check if my shipment is moving according to schedule.',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString()
      },
      {
        id: 'm2',
        sender: 'bot',
        senderName: 'Assistant Support ShipPulse',
        text: 'Hello! Thank you for contacting ShipPulse Support. To help us identify your shipment and assist you, please provide your tracking number (e.g., in SP-XXXXX format).',
        timestamp: new Date(Date.now() - 14 * 60000).toISOString()
      },
      {
        id: 'm3',
        sender: 'client',
        senderName: 'Robert Vance',
        text: 'My tracking code is SP-60414U.',
        timestamp: new Date(Date.now() - 10 * 60000).toISOString()
      },
      {
        id: 'm4',
        sender: 'bot',
        senderName: 'Assistant Support ShipPulse',
        text: 'Thank you! Your tracking code SP-60414U has been verified. A live support agent will respond to you shortly.',
        timestamp: new Date(Date.now() - 9 * 60000).toISOString()
      },
      {
        id: 'm5',
        sender: 'client',
        senderName: 'Robert Vance',
        text: 'Great, I will wait for an agent here.',
        timestamp: new Date(Date.now() - 5 * 60000).toISOString()
      }
    ]
  },
  {
    id: 'conv_demo_2',
    trackingCode: 'SP-88219E',
    clientName: 'Élodie Laurent',
    clientEmail: 'elodie.laurent@example.fr',
    lang: 'fr',
    status: 'active',
    unreadAdminCount: 0,
    unreadClientCount: 0,
    lastMessageAt: new Date(Date.now() - 40 * 60000).toISOString(),
    messages: [
      {
        id: 'm1',
        sender: 'client',
        senderName: 'Élodie Laurent',
        text: 'Bonjour, pouvez-vous me confirmer le jour exact de livraison à Madrid ?',
        timestamp: new Date(Date.now() - 60 * 60000).toISOString()
      },
      {
        id: 'm2',
        sender: 'bot',
        senderName: 'Assistant Support ShipPulse',
        text: "Bonjour ! Merci d'avoir contacté le support ShipPulse. Afin d'identifier votre dossier et vous aider au mieux, veuillez nous indiquer votre code d'expédition (ex: au format SP-XXXXX).",
        timestamp: new Date(Date.now() - 59 * 60000).toISOString()
      },
      {
        id: 'm3',
        sender: 'client',
        senderName: 'Élodie Laurent',
        text: 'Mon numéro est SP-88219E',
        timestamp: new Date(Date.now() - 55 * 60000).toISOString()
      },
      {
        id: 'm4',
        sender: 'bot',
        senderName: 'Assistant Support ShipPulse',
        text: "Merci ! Votre code d'expédition SP-88219E a bien été identifié. Un agent de notre équipe support va vous répondre d'ici peu.",
        timestamp: new Date(Date.now() - 54 * 60000).toISOString()
      },
      {
        id: 'm5',
        sender: 'admin',
        senderName: 'Support Agent (Admin)',
        text: 'Bonjour Élodie ! La livraison est estimée au 10 septembre à 09:00. Le navire est actuellement en transit dans le port de Rotterdam.',
        timestamp: new Date(Date.now() - 40 * 60000).toISOString()
      }
    ]
  }
];

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_CONVERSATIONS;
  });

  const [activeConvId, setActiveConvId] = useState(INITIAL_CONVERSATIONS[0].id);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const channelRef = useRef(null);
  const isSendingRef = useRef(false);

  // BroadcastChannel & LocalStorage synchronization across tabs
  useEffect(() => {
    try {
      if ('BroadcastChannel' in window) {
        channelRef.current = new BroadcastChannel(CHANNEL_NAME);
        channelRef.current.onmessage = (event) => {
          if (event.data && event.data.type === 'CHATS_UPDATE' && Array.isArray(event.data.data)) {
            setConversations(event.data.data);
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(event.data.data)); } catch (e) {}
          }
        };
      }
    } catch (e) {}

    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setConversations(parsed);
          }
        } catch (err) {}
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (channelRef.current) {
        channelRef.current.close();
      }
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const saveAndBroadcast = (updatedConvs) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConvs));
      if (channelRef.current) {
        channelRef.current.postMessage({
          type: 'CHATS_UPDATE',
          data: updatedConvs,
          timestamp: Date.now()
        });
      }
    } catch (e) {}
  };

  // Helper to extract tracking code from message string e.g. "SP-60414U"
  const extractTrackingCode = (text) => {
    if (!text) return null;
    const match = text.match(/SP-[A-Z0-9]{4,7}/i);
    if (match) return match[0].toUpperCase();
    return null;
  };

  // Automated Bot Response Logic (MAX 2 RESPONSES PER CONVERSATION)
  const triggerAutoBotResponse = (convId, lastClientMessage) => {
    let currentConv = null;
    setConversations(prev => {
      currentConv = prev.find(c => c.id === convId);
      return prev;
    });

    if (!currentConv) return;

    const botMsgCount = currentConv.messages.filter(m => m.sender === 'bot').length;
    
    // CRITICAL: Bot MUST ONLY respond to the first 2 messages MAX!
    if (botMsgCount >= 2) {
      return;
    }

    const newlyDetectedCode = extractTrackingCode(lastClientMessage);
    const effectiveCode = newlyDetectedCode || currentConv.trackingCode;
    const isFR = (currentConv.lang || 'fr') === 'fr';

    setIsBotTyping(true);

    setTimeout(() => {
      setIsBotTyping(false);

      let botResponseText = '';

      if (botMsgCount === 0) {
        // Step 1 Bot Message: Ask for tracking code format
        botResponseText = isFR
          ? "Bonjour ! Merci d'avoir contacté le support ShipPulse. Afin d'identifier votre dossier et vous aider au mieux, veuillez nous indiquer votre code d'expédition (ex: au format SP-XXXXX)."
          : "Hello! Thank you for contacting ShipPulse Support. To help us identify your shipment and assist you, please provide your tracking number (e.g., in SP-XXXXX format).";
      } else if (botMsgCount === 1) {
        // Step 2 Bot Message: Code identified, agent will respond shortly
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

      setConversations(prev => {
        const target = prev.find(c => c.id === convId);
        if (!target) return prev;

        // Ensure bot didn't exceed 2 responses
        if (target.messages.filter(m => m.sender === 'bot').length >= 2) {
          return prev;
        }

        const updated = {
          ...target,
          trackingCode: effectiveCode || target.trackingCode,
          messages: [...target.messages, botMsg],
          lastMessageAt: botMsg.timestamp
        };

        const result = [updated, ...prev.filter(c => c.id !== convId)];
        saveAndBroadcast(result);
        return result;
      });
    }, 800);
  };

  // 1. Client Sends Message (Clean non-duplicating function)
  const sendMessageAsClient = (convId, text, userLang = 'fr', optionalTrackingCode = null) => {
    if (!text || !text.trim() || isSendingRef.current) return;
    isSendingRef.current = true;

    setTimeout(() => { isSendingRef.current = false; }, 300);

    const trimmedText = text.trim();
    const nowIso = new Date().toISOString();
    let updatedTargetConv = null;

    setConversations(prevConvs => {
      let targetConv = prevConvs.find(c => c.id === convId);
      
      if (!targetConv) {
        targetConv = {
          id: convId || `conv_${Date.now()}`,
          trackingCode: optionalTrackingCode || extractTrackingCode(trimmedText) || null,
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

      const newMsg = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        sender: 'client',
        senderName: targetConv.clientName || 'Client',
        text: trimmedText,
        timestamp: nowIso
      };

      const updatedMessages = [...targetConv.messages, newMsg];
      const detectedCode = optionalTrackingCode || extractTrackingCode(trimmedText) || targetConv.trackingCode;

      updatedTargetConv = {
        ...targetConv,
        lang: userLang || targetConv.lang || 'fr',
        trackingCode: detectedCode,
        unreadAdminCount: targetConv.unreadAdminCount + 1,
        lastMessageAt: nowIso,
        messages: updatedMessages
      };

      const otherConvs = prevConvs.filter(c => c.id !== updatedTargetConv.id);
      const updatedList = [updatedTargetConv, ...otherConvs];

      saveAndBroadcast(updatedList);
      return updatedList;
    });

    // Trigger bot outside of setState updater, only if bot has responded < 2 times
    if (updatedTargetConv) {
      triggerAutoBotResponse(updatedTargetConv.id, trimmedText);
    }
  };

  // 2. Admin Sends Message
  const sendMessageAsAdmin = (convId, text) => {
    if (!text || !text.trim()) return;
    const trimmedText = text.trim();
    const nowIso = new Date().toISOString();

    setConversations(prevConvs => {
      const targetConv = prevConvs.find(c => c.id === convId);
      if (!targetConv) return prevConvs;

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
      return result;
    });
  };

  // Mark conversation as read by Admin
  const markAsReadByAdmin = (convId) => {
    setConversations(prevConvs => {
      const targetConv = prevConvs.find(c => c.id === convId);
      if (!targetConv || targetConv.unreadAdminCount === 0) return prevConvs;

      const updatedConv = {
        ...targetConv,
        unreadAdminCount: 0
      };

      const result = prevConvs.map(c => c.id === convId ? updatedConv : c);
      saveAndBroadcast(result);
      return result;
    });
  };

  // Mark conversation as read by Client
  const markAsReadByClient = (convId) => {
    setConversations(prevConvs => {
      const targetConv = prevConvs.find(c => c.id === convId);
      if (!targetConv || targetConv.unreadClientCount === 0) return prevConvs;

      const updatedConv = {
        ...targetConv,
        unreadClientCount: 0
      };

      const result = prevConvs.map(c => c.id === convId ? updatedConv : c);
      saveAndBroadcast(result);
      return result;
    });
  };

  // Total unread messages for Admin badge
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
