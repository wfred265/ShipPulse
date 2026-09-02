import { getCityCoords, interpolatePosition } from './geo.js';

export const INITIAL_SHIPMENTS = [
  {
    id: "SP-88219U",
    region: "USA",
    transportMode: "airplane",
    status: "In Transit",
    originCity: "Plattsburgh, NY",
    destinationCity: "Riverside, CA",
    originLocation: { country: "United States", town: "Plattsburgh, NY", city: "Plattsburgh" },
    destLocation: { country: "United States", town: "Riverside, CA", city: "Riverside" },
    originCoords: getCityCoords("Plattsburgh"),
    destCoords: getCityCoords("Riverside"),
    currentCoords: interpolatePosition(getCityCoords("Plattsburgh"), getCityCoords("Riverside"), 0.42),
    progressPercentage: 42,
    autoMode: true,
    durationHours: 8,
    speedMultiplier: 10,
    isPaused: false,
    pauseReason: "",
    createdAt: new Date(Date.now() - 3600 * 1000 * 3.5).toISOString(),
    
    sender: {
      firstName: "Alexander",
      lastName: "Vance",
      company: "Apex Tech Industries Inc.",
      email: "a.vance@apextech.com",
      phone: "+1 (929) 315-6218",
      address: "44 Wall St, New York, NY 10005, USA",
      idDocument: "US-PASSPORT-982144A"
    },
    
    recipient: {
      firstName: "Victoria",
      lastName: "Sterling",
      email: "v.sterling@quantumuk.co.uk",
      phone: "+44 20 7946 0912",
      deliveryAddress: "12 Hanover Square, Mayfair, London W1S 1JH, UK",
      specialInstructions: "Deliver directly to 4th floor reception. Signature required."
    },
    
    freight: {
      description: "High-precision server blades and optical transceiver arrays.",
      goodsType: "Fragile",
      weightKg: 145.5,
      volumeM3: 0.85,
      dimensions: { length: 120, width: 80, height: 90 },
      declaredValue: 250000.00,
      insuranceAmount: 2500.00,
      shippingFee: 3450.00,
      shippingFeeStatus: "Paid",   // Paid | Pending | Partial
      insuranceFeeStatus: "Paid",  // Paid | Pending | Partial
      paymentStatus: "Paid"
    },
    
    timeline: [
      { id: 1, timestamp: "2026-08-23 07:00", location: "Plattsburgh, NY", title: "Shipment Manifest Generated & Payment Settled", status: "completed" },
      { id: 2, timestamp: "2026-08-23 08:30", location: "Plattsburgh Regional Airport", title: "Loaded onto Flight SP-AIR-701", status: "completed" },
      { id: 3, timestamp: "2026-08-23 10:45", location: "Midwest Air Corridor", title: "In Flight - Cruising Speed 890 km/h", status: "current" }
    ]
  },
  
  {
    id: "SP-44102E",
    region: "EUROPE",
    transportMode: "boat",
    status: "Payment Pending",
    originCity: "Rotterdam",
    destinationCity: "New York, NY",
    originLocation: { country: "Netherlands", town: "Rotterdam", city: "Rotterdam" },
    destLocation: { country: "United States", town: "New York, NY", city: "New York City" },
    originCoords: getCityCoords("Rotterdam"),
    destCoords: getCityCoords("New York City"),
    currentCoords: getCityCoords("Rotterdam"),
    progressPercentage: 0,
    autoMode: true,
    durationHours: 120,
    speedMultiplier: 10,
    isPaused: false,
    pauseReason: "Awaiting settlement of insurance coverage policy fee",
    createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    
    sender: {
      firstName: "Hans",
      lastName: "De Jong",
      company: "Nordic Maritime Logistics BV",
      email: "h.dejong@nordicmaritime.nl",
      phone: "+31 10 400 1234",
      address: "Wilhelminakade 909, 3072 AP Rotterdam, Netherlands",
      idDocument: "NL-ID-3392019X"
    },
    
    recipient: {
      firstName: "Michael",
      lastName: "Reynolds",
      email: "mreynolds@atlantictrade.org",
      phone: "+1 (347) 555-8930",
      deliveryAddress: "Red Hook Container Terminal, Pier 10, Brooklyn, NY 11231",
      specialInstructions: "Requires heavy crane equipment at dock arrival."
    },
    
    freight: {
      description: "Industrial hydraulic pump systems & spare turbine components.",
      goodsType: "Standard",
      weightKg: 4200.00,
      volumeM3: 14.20,
      dimensions: { length: 350, width: 200, height: 210 },
      declaredValue: 180000.00,
      insuranceAmount: 1800.00,
      shippingFee: 8900.00,
      shippingFeeStatus: "Paid",
      insuranceFeeStatus: "Pending", // PENDING INSURANCE FEE HALTS JOURNEY!
      paymentStatus: "Pending"
    },
    
    timeline: [
      { id: 1, timestamp: "2026-08-22 09:00", location: "Rotterdam Port Terminal", title: "Manifeste Généré - En Attente d'Assurance", status: "current" }
    ]
  },

  {
    id: "SP-90155E",
    region: "EUROPE",
    transportMode: "truck",
    status: "In Transit",
    originCity: "Berlin",
    destinationCity: "Madrid",
    originLocation: { country: "Germany", town: "Berlin", city: "Berlin" },
    destLocation: { country: "Spain", town: "Madrid", city: "Madrid" },
    originCoords: getCityCoords("Berlin"),
    destCoords: getCityCoords("Madrid"),
    currentCoords: interpolatePosition(getCityCoords("Berlin"), getCityCoords("Madrid"), 0.65),
    progressPercentage: 65,
    autoMode: true,
    durationHours: 24,
    speedMultiplier: 10,
    isPaused: false,
    pauseReason: "",
    createdAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    
    sender: {
      firstName: "Greta",
      lastName: "Hoffmann",
      company: "Bavarian Precision Goods GmbH",
      email: "g.hoffmann@bavarianpg.de",
      phone: "+49 30 901820",
      address: "Kurfürstendamm 195, 10707 Berlin, Germany",
      idDocument: "DE-PASSPORT-C891002"
    },
    
    recipient: {
      firstName: "Carlos",
      lastName: "Mendoza",
      email: "c.mendoza@madridretail.es",
      phone: "+34 91 555 4321",
      deliveryAddress: "Calle de Alcalá 48, 28014 Madrid, Spain",
      specialInstructions: "Keep refrigerated under 4°C at all times."
    },
    
    freight: {
      description: "Pharmaceutical vaccines & temperature-controlled medical supplies.",
      goodsType: "Perishable",
      weightKg: 620.0,
      volumeM3: 3.40,
      dimensions: { length: 180, width: 120, height: 140 },
      declaredValue: 95000.00,
      insuranceAmount: 950.00,
      shippingFee: 1650.00,
      shippingFeeStatus: "Partial",
      insuranceFeeStatus: "Paid",
      paymentStatus: "Partial"
    },
    
    timeline: [
      { id: 1, timestamp: "2026-08-23 01:00", location: "Berlin Logistics Center", title: "Départ du Centre Logistique", status: "completed" },
      { id: 2, timestamp: "2026-08-23 07:30", location: "Frankfurt Hub", title: "Dédouanement Effectué", status: "completed" },
      { id: 3, timestamp: "2026-08-23 11:00", location: "Autoroute A9 France Sud", title: "En Transit vers les Pyrénées", status: "current" }
    ]
  }
];
