import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { INITIAL_SHIPMENTS } from '../utils/mockData';
import { interpolatePosition, calculateRatioFromCoords } from '../utils/geo';

const ShipmentContext = createContext();

const API_BASE_URL = '/api';
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

  // 1. Initial Load: Fetch from Production SQLite REST API
  useEffect(() => {
    async function fetchFromDatabase() {
      try {
        const res = await fetch(`${API_BASE_URL}/shipments`);
        if (res.ok) {
          const result = await res.json();
          if (result.success && Array.isArray(result.data) && result.data.length > 0) {
            setShipments(result.data);
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(result.data)); } catch (e) {}
          }
        }
      } catch (err) {
        console.warn("Backend REST API offline, running in local persistence mode:", err);
      }
    }
    fetchFromDatabase();
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

      // Sync to SQLite REST API Backend in background
      if (updatedItem && updatedItem.id) {
        fetch(`${API_BASE_URL}/shipments/${updatedItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedItem)
        }).catch(e => {});
      }
    } catch (err) {
      console.error("Storage error:", err);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channelRef.current = channel;

      channel.onmessage = (event) => {
        if (event.data && event.data.type === 'SHIPMENTS_UPDATE') {
          setShipments(event.data.data);
        }
      };

      return () => {
        channel.close();
      };
    }
  }, []);

  // Intelligent Auto Mode Timer Loop with Financial Payment Dependency Enforced
  useEffect(() => {
    const interval = setInterval(() => {
      setShipments(prevShipments => {
        let hasChanges = false;
        const updated = prevShipments.map(s => {
          const isShippingPending = s.freight?.shippingFeeStatus === 'Pending';
          const isInsurancePending = s.freight?.insuranceFeeStatus === 'Pending';

          // PAYMENT DEPENDENCY HALT RULE: If shipping fee OR insurance fee is Pending, journey CANNOT start!
          if (isShippingPending || isInsurancePending) {
            if (s.status !== 'Payment Pending') {
              hasChanges = true;
              return { ...s, status: 'Payment Pending' };
            }
            return s; // Stationary at origin
          }

          if (!s.autoMode || s.isPaused || s.status === 'Delivered') {
            return s;
          }

          hasChanges = true;
          const totalSeconds = (s.durationHours || 10) * 3600;
          const speedMultiplier = s.speedMultiplier || 10;
          const increment = (100 / totalSeconds) * speedMultiplier * 0.5;
          let newProgress = Math.min(100, (s.progressPercentage || 0) + increment);

          const newCoords = interpolatePosition(
            s.originCoords,
            s.destCoords,
            newProgress / 100
          );

          let newStatus = s.status;
          if (newProgress >= 100) {
            newStatus = 'Delivered';
          } else if (newStatus === 'Created' || newStatus === 'Payment Pending') {
            newStatus = 'In Transit';
          }

          return {
            ...s,
            progressPercentage: parseFloat(newProgress.toFixed(2)),
            currentCoords: newCoords,
            status: newStatus
          };
        });

        if (hasChanges) {
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
          return updated;
        }
        return prevShipments;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const updateShipmentCoords = (id, newCoords) => {
    let targetItem = null;
    const updated = shipments.map(s => {
      if (s.id === id) {
        const isShippingPending = s.freight?.shippingFeeStatus === 'Pending';
        const isInsurancePending = s.freight?.insuranceFeeStatus === 'Pending';

        if (isShippingPending || isInsurancePending) {
          alert("Cannot move vehicle: Both Shipping Fee and Insurance Fee must be Paid or Partially Paid before transit can begin.");
          return s;
        }

        const ratio = calculateRatioFromCoords(s.originCoords, s.destCoords, newCoords);
        const progressPercentage = parseFloat((ratio * 100).toFixed(2));
        
        let newStatus = s.status;
        if (progressPercentage >= 100) {
          newStatus = 'Delivered';
        } else if (s.isPaused) {
          newStatus = 'Paused';
        } else {
          newStatus = 'In Transit';
        }

        targetItem = {
          ...s,
          currentCoords: [parseFloat(newCoords[0].toFixed(5)), parseFloat(newCoords[1].toFixed(5))],
          progressPercentage,
          status: newStatus
        };
        return targetItem;
      }
      return s;
    });

    saveAndBroadcast(updated, targetItem);
  };

  const togglePauseShipment = (id, pauseReason = "") => {
    let targetItem = null;
    const updated = shipments.map(s => {
      if (s.id === id) {
        const nextPaused = !s.isPaused;
        const newStatus = nextPaused ? 'Paused' : (s.progressPercentage >= 100 ? 'Delivered' : 'In Transit');
        
        const newTimelineItem = nextPaused ? {
          id: Date.now(),
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          location: `Current Position (${s.currentCoords[0].toFixed(2)}, ${s.currentCoords[1].toFixed(2)})`,
          title: `PAUSED: ${pauseReason || 'Admin Safety Halt'}`,
          status: 'current'
        } : {
          id: Date.now(),
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          location: `Current Position (${s.currentCoords[0].toFixed(2)}, ${s.currentCoords[1].toFixed(2)})`,
          title: `Resumed - Journey back in progress`,
          status: 'current'
        };

        targetItem = {
          ...s,
          isPaused: nextPaused,
          pauseReason: nextPaused ? (pauseReason || "Administrative hold & safety check") : "",
          status: newStatus,
          timeline: [newTimelineItem, ...s.timeline]
        };
        return targetItem;
      }
      return s;
    });

    saveAndBroadcast(updated, targetItem);
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

    // Save to Production SQLite Database REST API
    fetch(`${API_BASE_URL}/shipments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newShipment)
    }).catch(e => console.warn("API save error:", e));

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
    saveAndBroadcast(updated);

    fetch(`${API_BASE_URL}/shipments/${id}`, {
      method: 'DELETE'
    }).catch(e => {});

    if (activeShipmentId === id && updated.length > 0) {
      setActiveShipmentId(updated[0].id);
    }
  };

  const resetToDemoData = () => {
    saveAndBroadcast(INITIAL_SHIPMENTS);
    setActiveShipmentId("SP-88219");
  };

  const getActiveShipment = () => {
    return shipments.find(s => s.id === activeShipmentId) || shipments[0] || null;
  };

  return (
    <ShipmentContext.Provider value={{
      shipments,
      activeShipmentId,
      setActiveShipmentId,
      getActiveShipment,
      updateShipmentCoords,
      togglePauseShipment,
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
