import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Globe, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { formatTownLocationString, searchOpenStreetMapLocations, findWorldwideLocation } from '../utils/geo';

export default function LocationAutocompleteInput({ 
  value, 
  onChange, 
  onSelectLocation, 
  placeholder = "Type departure town or city (e.g. Plattsburgh, NY)..." 
}) {
  const [query, setQuery] = useState(() => formatTownLocationString(value));
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [isVerified, setIsVerified] = useState(() => {
    if (!value) return false;
    if (typeof value === 'object' && value.lat !== undefined && value.lng !== undefined && (value.town || value.city)) return true;
    return !!findWorldwideLocation(value);
  });

  const wrapperRef = useRef(null);
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    const formatted = formatTownLocationString(value);
    setQuery(formatted);
    if (value && typeof value === 'object' && value.lat !== undefined && value.lng !== undefined) {
      setIsVerified(true);
    } else if (value && findWorldwideLocation(value)) {
      setIsVerified(true);
    } else {
      setIsVerified(false);
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setIsVerified(false); // Unverified until selected from propositions!

    if (onChange) onChange(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (val.trim().length >= 2) {
      setIsLoading(true);
      debounceTimerRef.current = setTimeout(async () => {
        const matches = await searchOpenStreetMapLocations(val);
        setSuggestions(matches);
        setIsLoading(false);
        setIsOpen(true);
      }, 300); // 300ms debounce for smooth OpenStreetMap search
    } else {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
    }
  };

  const handleSelect = (item) => {
    const townFormatted = item.town || item.city;
    setQuery(townFormatted);
    setIsVerified(true);
    setIsOpen(false);

    if (onSelectLocation) {
      onSelectLocation({
        country: item.country,
        town: item.town,
        city: item.city,
        lat: item.lat,
        lng: item.lng,
        isVerified: true
      });
    }
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative' }}>
        <MapPin size={16} color={isVerified ? "#059669" : "var(--primary-cyan)"} style={{ position: 'absolute', left: 12, top: 13 }} />
        
        <input 
          type="text" 
          className="glass-input" 
          value={query} 
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          style={{ 
            paddingLeft: '36px',
            paddingRight: '36px',
            borderColor: query ? (isVerified ? '#059669' : '#F59E0B') : '#CBD5E1',
            background: query ? (isVerified ? '#F0FDF4' : '#FFFBEB') : '#FFFFFF'
          }}
        />

        {isLoading ? (
          <Loader2 size={16} color="var(--primary-cyan)" style={{ position: 'absolute', right: 12, top: 13, animation: 'spin 1s linear infinite' }} />
        ) : isVerified ? (
          <CheckCircle2 size={16} color="#059669" style={{ position: 'absolute', right: 12, top: 13 }} />
        ) : null}
      </div>

      {/* Validation Status Indicator */}
      {query && !isVerified && !isOpen && !isLoading && (
        <div style={{ fontSize: '0.73rem', color: '#B45309', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px', fontWeight: 600 }}>
          <AlertTriangle size={12} color="#B45309" /> Select a valid location from the proposed list
        </div>
      )}

      {/* OpenStreetMap Autocomplete Propositions Dropdown */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          background: '#FFFFFF',
          border: '1px solid var(--primary-cyan)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: '0 10px 25px rgba(11, 25, 44, 0.18)',
          zIndex: 9999,
          maxHeight: '280px',
          overflowY: 'auto'
        }}>
          <div style={{ padding: '6px 12px', fontSize: '0.72rem', color: 'var(--text-muted)', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Worldwide Map Location Propositions ({suggestions.length}):</span>
            <span style={{ color: 'var(--primary-cyan)', fontSize: '0.68rem' }}>OpenStreetMap Telemetry</span>
          </div>

          {suggestions.length > 0 ? (
            suggestions.map((item, index) => (
              <div
                key={index}
                onClick={() => handleSelect(item)}
                style={{
                  padding: '10px 14px',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  borderBottom: '1px solid #F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#E0F2FE'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
              >
                <div>
                  <strong style={{ color: 'var(--primary-navy)' }}>{item.town}</strong>
                  {item.country && (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '6px' }}>
                      ({item.country})
                    </span>
                  )}
                </div>
                <Globe size={13} color="var(--primary-cyan)" />
              </div>
            ))
          ) : (
            <div style={{ padding: '14px', fontSize: '0.82rem', color: '#E11D48', textAlign: 'center' }}>
              ⚠️ No recognized world map location matches "{query}". Please check spelling.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
