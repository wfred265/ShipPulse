import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { INITIAL_SHIPMENTS } from '../utils/mockData';
import { interpolatePosition, calculateRatioFromCoords } from '../utils/geo';

const ShipmentContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const STORAGE_KEY = 'shippulse_shipments_v6';
const CHANNEL_NAME = 'shippulse_realtime_channel_v6';

export const ShipmentProvider = ({ children }) => {
  const [shipments, setShipments] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_SHIPMENTS;
  });

  const [activeShipmentId, setActiveShipmentId] = useState("SP-88219U");
  const channelRef = useRef(null);

  // 1. Initial Load & 5-Second Global Database Sync Loop across all devices
  useEffect(() => {
    let isMounted = true;

    async function fetchFromDatabase() {
      try {
        const res = await fetch(`${API_BASE_URL}/shipments`);
        if (res.ok) {
          const result = await res.json();
          if (result.success && Array.isArray(result.data) && isMounted) {
            setShipments(result.data);
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(result.data)); } catch (e) {}
          }
        }
      } catch (err) {
        // Silently catch error if API is offline
      }
    }

    fetchFromDatabase();

    // Poll SQLite database every 5 seconds for multi-device real-time sync
    const syncInterval = setInterval(fetchFromDatabase, 5000);

    return () => {
      isMounted = false;
      clearInterval(syncInterval);
    };
  }, []);

  // 2. Cross-tab BroadcastChannel sync for same-device instant tabs update
  useEffect(() => {
    try {
      if ('BroadcastChannel' in window) {
        channelRef.current = new BroadcastChannel(CHANNEL_NAME);
        channelRef.current.onmessage = (event) => {
          if (event.data && event.data.type === 'SHIPMENTS_UPDATE') {
            setShipments(event.data.data);
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(event.data.data)); } catch (e) {}
          }
        };
      }
    } catch (e) {}

    return () => {
      if (channelRef.current) {
        channelRef.current.close();
      }
    };
  }, []);

  // 3. Real-Time Vehicle Physics Telemetry Simulation Loop
  useEffect(() => {
    const timer = setInterval(() => {
      setShipments(prevShipments => {
        let hasChanges = false;

        const updated = prevShipments.map(s => {
          if (s.isPaused || s.status === 'Delivered' || s.status === 'Cancelled' || s.status === 'Payment Pending' || !s.autoMode) {
            return s;
          }

          hasChanges = true;
          const currentProgress = s.progressPercentage || 0;

          if (currentProgress >= 100) {
            return {
              ...s,
              progressPercentage: 100,
              status: 'Delivered',
              currentCoords: s.destCoords
            };
          }

          const increment = 0.5 * (s.speedMultiplier || 1);
          const nextProgress = Math.min(100, currentProgress + increment);
          const nextCoords = interpolatePosition(s.originCoords, s.destCoords, nextProgress / 100);

          let updatedTimeline = s.timeline || [];
          if (nextProgress >= 100) {
            const hasDeliveredItem = updatedTimeline.some(t => t.title.toLowerCase().includes('delivered'));
            if (!hasDeliveredItem) {
              updatedTimeline = [
                ...updatedTimeline,
                {
                  id: Date.now(),
                  timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
                  location: s.destinationCity || s.destLocation?.city || 'Destination Terminal',
                  title: "Package Delivered & Consignee Signature Verified",
                  status: "completed"
                }
              ];
            }
          }

          return {
            ...s,
            progressPercentage: nextProgress,
            currentCoords: nextCoords,
            status: nextProgress >= 100 ? 'Delivered' : 'In Transit',
            timeline: updatedTimeline
          };
        });

        if (hasChanges) {
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch (e) {}
        }

        return updated;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const saveAndBroadcast = (updatedShipments, updatedItem = null) => {
    setShipments(updatedShipments);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedShipments));
      if (channelRef.current) {
        channelRef.current.postMessage({
          type: 'SHIPMENTS_UPDATE',
          data: updatedShipments,
          timestamp: Date.now()
        });
      }

      // Sync updated item to SQLite REST API Backend in background
      if (updatedItem && updatedItem.id) {
        fetch(`${API_BASE_URL}/shipments/${updatedItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedItem)
        }).catch(e => console.warn("API sync error:", e));
      }
    } catch (err) {
      console.error("Storage error:", err);
    }
  };

  const createShipment = (shipmentData) => {
    const region = (shipmentData.region || 'USA').toUpperCase();
    const suffix = region === 'EUROPE' ? 'E' : 'U';
    const newId = `SP-${Math.floor(10000 + Math.random() * 90000)}${suffix}`;
    const isShippingPending = shipmentData.freight?.shippingFeeStatus === 'Pending';
    const isInsurancePending = shipmentData.freight?.insuranceFeeStatus === 'Pending';
    const initialStatus = (isShippingPending || isInsurancePending) ? 'Payment Pending' : 'In Transit';

    const newShipment = {
      id: newId,
      ...shipmentData,
      progressPercentage: 0,
      currentCoords: shipmentData.originCoords,
      status: initialStatus,
      isPaused: false,
      pauseReason: (isShippingPending || isInsurancePending) ? 'Awaiting settlement of shipping fee and insurance coverage policy' : '',
      autoMode: true,
      speedMultiplier: 10,
      createdAt: new Date().toISOString(),
      timeline: [
        {
          id: 1,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          location: shipmentData.originCity || shipmentData.originLocation?.city || 'Origin Terminal',
          title: (isShippingPending || isInsurancePending) ? "Shipment Manifest Generated - Payment Settlement Pending" : "Shipment Manifest Generated & Carrier Dispatched",
          status: "completed"
        }
      ]
    };

    const updated = [newShipment, ...shipments];
    saveAndBroadcast(updated, newShipment);

    // Save directly to Production SQLite Database REST API
    fetch(`${API_BASE_URL}/shipments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newShipment)
    }).catch(e => console.warn("API POST error:", e));

    setActiveShipmentId(newId);
    return newId;
  };

  const updateShipment = (id, fields) => {
    let targetItem = null;
    const updated = shipments.map(s => {
      if (s.id === id) {
        const merged = { ...s, ...fields };
        const isShippingPending = merged.freight?.shippingFeeStatus === 'Pending';
        const isInsurancePending = merged.freight?.insuranceFeeStatus === 'Pending';

        if (isShippingPending || isInsurancePending) {
          merged.status = 'Payment Pending';
        } else if (merged.status === 'Payment Pending') {
          merged.status = merged.progressPercentage >= 100 ? 'Delivered' : 'In Transit';
        }
        targetItem = merged;
        return merged;
      }
      return s;
    });

    saveAndBroadcast(updated, targetItem);
  };

  const deleteShipment = (id) => {
    const updated = shipments.filter(s => s.id !== id);
    setShipments(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      if (channelRef.current) {
        channelRef.current.postMessage({
          type: 'SHIPMENTS_UPDATE',
          data: updated,
          timestamp: Date.now()
        });
      }
    } catch (e) {}

    // Send HTTP DELETE to SQLite database
    fetch(`${API_BASE_URL}/shipments/${id}`, {
      method: 'DELETE'
    }).catch(e => console.warn("API DELETE error:", e));

    if (activeShipmentId === id && updated.length > 0) {
      setActiveShipmentId(updated[0].id);
    }
  };

  const resetToDemoData = () => {
    saveAndBroadcast(INITIAL_SHIPMENTS);
    setActiveShipmentId("SP-88219U");
  };

  const activeShipment = shipments.find(s => s.id === activeShipmentId) || shipments[0];

  return (
    <ShipmentContext.Provider value={{
      shipments,
      activeShipmentId,
      activeShipment,
      setActiveShipmentId,
      createShipment,
      updateShipment,
      deleteShipment,
      resetToDemoData
    }}>
      {children}
    </ShipmentContext.Provider>
  );
};

export const useShipments = () => {
  const context = useContext(ShipmentContext);
  if (!context) throw new Error("useShipments must be used within ShipmentProvider");
  return context;
};
