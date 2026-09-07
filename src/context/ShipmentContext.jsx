import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { INITIAL_SHIPMENTS } from '../utils/mockData';
import { interpolatePosition, calculateRatioFromCoords } from '../utils/geo';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import { calcFreightDimensions, calcEstArrivalDate, computeShipmentTelemetry } from '../utils/cargoUtils';

const ShipmentContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const STORAGE_KEY = 'shippulse_shipments_v6';
const CHANNEL_NAME = 'shippulse_realtime_channel_v6';

export const ShipmentProvider = ({ children }) => {
  const [shipments, setShipments] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map(s => computeShipmentTelemetry(s));
        }
      }
    } catch (e) {}
    return INITIAL_SHIPMENTS.map(s => computeShipmentTelemetry(s));
  });

  const [activeShipmentId, setActiveShipmentId] = useState("SP-88219U");
  const channelRef = useRef(null);

  // 1. Initial Load & Supabase Cloud Database Realtime Listener
  useEffect(() => {
    let isMounted = true;

    async function loadFromSupabase() {
      if (!isSupabaseConfigured || !supabase) return false;
      try {
        const { data, error } = await supabase
          .from('shipments')
          .select('*')
          .order('updated_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0 && isMounted) {
          const list = data.map(row => (typeof row.data === 'string' ? JSON.parse(row.data) : row.data));
          const computedList = list.map(s => computeShipmentTelemetry(s));
          setShipments(computedList);
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(computedList)); } catch (e) {}
          return true;
        }
      } catch (err) {
        console.warn("Supabase fetch error:", err);
      }
      return false;
    }

    loadFromSupabase();

    // Subscribe to Supabase Realtime Postgres Changes across all devices
    let channel = null;
    if (isSupabaseConfigured && supabase) {
      channel = supabase
        .channel('public:shipments')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'shipments' }, () => {
          loadFromSupabase();
        })
        .subscribe();
    }

    // Fallback: fetch from local Express REST API if Supabase is not configured
    if (!isSupabaseConfigured) {
      async function fetchFromDatabase() {
        try {
          const res = await fetch(`${API_BASE_URL}/shipments`);
          if (res.ok) {
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              const result = await res.json();
              if (result.success && Array.isArray(result.data) && result.data.length > 0 && isMounted) {
                const computed = result.data.map(s => computeShipmentTelemetry(s));
                setShipments(computed);
                try { localStorage.setItem(STORAGE_KEY, JSON.stringify(computed)); } catch (e) {}
              }
            }
          }
        } catch (err) {}
      }
      fetchFromDatabase();
      const syncInterval = setInterval(fetchFromDatabase, 5000);
      return () => {
        isMounted = false;
        clearInterval(syncInterval);
        if (channel) supabase.removeChannel(channel);
      };
    }

    return () => {
      isMounted = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  // 2. Cross-tab BroadcastChannel & LocalStorage sync for instant multi-tab updates
  useEffect(() => {
    try {
      if ('BroadcastChannel' in window) {
        channelRef.current = new BroadcastChannel(CHANNEL_NAME);
        channelRef.current.onmessage = (event) => {
          if (event.data && event.data.type === 'SHIPMENTS_UPDATE' && Array.isArray(event.data.data)) {
            const computed = event.data.data.map(s => computeShipmentTelemetry(s));
            setShipments(computed);
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(computed)); } catch (e) {}
          }
        };
      }
    } catch (e) {}

    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const computed = parsed.map(s => computeShipmentTelemetry(s));
            setShipments(computed);
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

  // 3. Real-Time Vehicle Physics Telemetry Simulation Loop based on real durationHours
  useEffect(() => {
    const timer = setInterval(() => {
      setShipments(prevShipments => {
        let hasChanges = false;

        const updated = prevShipments.map(s => {
          const telemetry = computeShipmentTelemetry(s);
          if (
            telemetry.progressPercentage !== s.progressPercentage ||
            telemetry.status !== s.status ||
            telemetry.currentCoords?.[0] !== s.currentCoords?.[0] ||
            telemetry.currentCoords?.[1] !== s.currentCoords?.[1]
          ) {
            hasChanges = true;
          }
          return telemetry;
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

      // Sync updated item to Supabase Cloud Database or Express API
      if (isSupabaseConfigured && supabase && updatedItem && updatedItem.id) {
        supabase
          .from('shipments')
          .upsert({ id: updatedItem.id, data: updatedItem, updated_at: new Date().toISOString() })
          .then(({ error }) => {
            if (error) console.warn("Supabase upsert error:", error);
          });
      } else if (updatedItem && updatedItem.id) {
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
    const depDate = shipmentData.departureDate || new Date().toISOString().substring(0, 10);
    const depTime = shipmentData.departureTime || new Date().toTimeString().substring(0, 5);
    const duration = parseFloat(shipmentData.durationHours) || 12;

    const rawFreight = shipmentData.freight || {};
    const isShippingPending = rawFreight.shippingFeeStatus === 'Pending';
    const isInsurancePending = rawFreight.insuranceFeeStatus === 'Pending';
    const isPaymentPending = isShippingPending || isInsurancePending || rawFreight.paymentStatus === 'Pending';

    const depDateTime = new Date(`${depDate}T${depTime}`).getTime();
    const nowMs = Date.now();

    let initialStatus = 'In Transit';
    if (isPaymentPending) {
      initialStatus = 'Payment Pending';
    } else if (!isNaN(depDateTime) && nowMs < depDateTime) {
      initialStatus = 'Scheduled';
    }

    const estArrStr = shipmentData.estimatedArrivalDate || calcEstArrivalDate(depDate, depTime, duration, 0, false);
    const computedDimensions = calcFreightDimensions(rawFreight.weightKg, rawFreight.volumeM3, rawFreight.dimensions);

    const newShipment = {
      id: newId,
      ...shipmentData,
      freight: {
        ...rawFreight,
        dimensions: computedDimensions
      },
      departureDate: depDate,
      departureTime: depTime,
      departureDateTime: isNaN(depDateTime) ? new Date().toISOString() : new Date(depDateTime).toISOString(),
      durationHours: duration,
      estimatedArrivalDate: estArrStr,
      hideInsuranceFee: shipmentData.hideInsuranceFee || false,
      progressPercentage: 0,
      currentCoords: shipmentData.originCoords,
      status: initialStatus,
      isPaused: false,
      pauseReason: isPaymentPending ? 'Awaiting settlement of shipping fee prior to dispatch' : '',
      autoMode: true,
      createdAt: new Date().toISOString(),
      timeline: [
        {
          id: 1,
          timestamp: `${depDate} ${depTime}`,
          location: shipmentData.originCity || shipmentData.originLocation?.city || 'Origin Terminal',
          title: isPaymentPending ? "Shipment Manifest Generated - Payment Settlement Pending" : "Shipment Manifest Generated & Carrier Dispatched",
          status: "completed"
        }
      ]
    };

    const updated = [newShipment, ...shipments];
    saveAndBroadcast(updated, newShipment);

    setActiveShipmentId(newId);
    return newId;
  };

  const updateShipment = (id, fields) => {
    let targetItem = null;
    const updated = shipments.map(s => {
      if (s.id === id) {
        const merged = { ...s, ...fields };
        if (merged.freight) {
          merged.freight.dimensions = calcFreightDimensions(merged.freight.weightKg, merged.freight.volumeM3, merged.freight.dimensions);
        }
        
        // Recalculate estimatedArrivalDate if departureDate, departureTime, or durationHours change
        const depDate = merged.departureDate || new Date().toISOString().substring(0, 10);
        const depTime = merged.departureTime || new Date().toTimeString().substring(0, 5);
        const duration = parseFloat(merged.durationHours) || 12;
        const depDateTimeMs = new Date(`${depDate}T${depTime}`).getTime();

        if (!isNaN(depDateTimeMs)) {
          merged.departureDateTime = new Date(depDateTimeMs).toISOString();
          if (!fields.estimatedArrivalDate) {
            merged.estimatedArrivalDate = calcEstArrivalDate(depDate, depTime, duration, merged.progressPercentage, merged.isPaused);
          }
        }

        const isShippingPending = merged.freight?.shippingFeeStatus === 'Pending';
        const isInsurancePending = merged.freight?.insuranceFeeStatus === 'Pending';

        if (isShippingPending || isInsurancePending) {
          merged.status = 'Payment Pending';
          merged.progressPercentage = 0;
          merged.currentCoords = merged.originCoords;
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

    if (isSupabaseConfigured && supabase) {
      supabase
        .from('shipments')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.warn("Supabase delete error:", error);
        });
    } else {
      fetch(`${API_BASE_URL}/shipments/${id}`, { method: 'DELETE' }).catch(e => console.warn("API DELETE error:", e));
    }

    if (activeShipmentId === id && updated.length > 0) {
      setActiveShipmentId(updated[0].id);
    }
  };

  const togglePauseShipment = (id, pauseReason = '') => {
    let targetItem = null;
    const updated = shipments.map(s => {
      if (s.id === id) {
        const nextPaused = !s.isPaused;
        const newEstArrival = calcEstArrivalDate(s.departureDate, s.departureTime, s.durationHours, s.progressPercentage, nextPaused);
        const merged = {
          ...s,
          isPaused: nextPaused,
          estimatedArrivalDate: newEstArrival,
          pauseReason: nextPaused ? (pauseReason || s.pauseReason || 'Vehicle operations temporarily paused by dispatch command') : ''
        };
        targetItem = merged;
        return merged;
      }
      return s;
    });

    saveAndBroadcast(updated, targetItem);
  };

  const updateShipmentCoords = (id, newCoords) => {
    let targetItem = null;
    const updated = shipments.map(s => {
      if (s.id === id) {
        const newRatio = calculateRatioFromCoords(s.originCoords, s.destCoords, newCoords);
        const nextProgress = Math.min(100, Math.max(0, Math.round(newRatio * 100)));
        const merged = {
          ...s,
          currentCoords: newCoords,
          progressPercentage: nextProgress,
          status: nextProgress >= 100 ? 'Delivered' : (s.isPaused ? s.status : 'In Transit')
        };
        targetItem = merged;
        return merged;
      }
      return s;
    });

    saveAndBroadcast(updated, targetItem);
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
      togglePauseShipment,
      updateShipmentCoords,
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
