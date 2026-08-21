# ♻️ SmartWaste AI — Intelligent City & Campus Waste Management Ecosystem

> **"Don't throw it. Find it, scan it, recycle it."**  
> *An AI-powered smart civic tech platform connecting citizens, municipal authorities, and waste-collection workers into a unified intelligent recycling ecosystem.*

---

## 🌟 Overview

**SmartWaste AI** is a production-quality, full-stack web application designed to solve key urban sanitation challenges:
1. **Citizens throwing waste roadside** due to inability to locate nearby dustbins.
2. **Lack of waste stream segregation** (plastic, organic, glass, e-waste).
3. **Absence of real-time visibility** into dustbin capacity and fill levels.

By integrating **interactive OpenStreetMap Leaflet layers**, **high-precision hardware GPS positioning**, and **dynamic waste stream filtering**, SmartWaste AI enables citizens to locate the nearest suitable dustbin in seconds and follow turn-by-turn walking navigation.

---

## 🔥 Key Features

### 📍 1. Interactive Dustbin Map & Real-Time Capacity Tracking
- **Color-Coded Status Markers**:
  - 🟢 **Available (`< 60%`)**: Ample space for disposal.
  - 🟡 **Partially Full (`60% - 80%`)**: Approaching capacity.
  - 🔴 **Nearly Full / Critical (`> 80%`)**: Needs collection.
- **Dynamic Popup Information**: View bin ID, exact address, fill meter, accepted materials, and estimated walking distance.
- **Visual Navigation Path**: Displays a dashed polyline routing from the user's live position directly to the selected bin.

### 🛰️ 2. High-Precision GPS & Reverse Geocoding
- **Hardware-Level Geolocation**: Uses `{ enableHighAccuracy: true }` to leverage GPS hardware and Wi-Fi triangulation for pin-point accuracy (down to `±5m`).
- **Reverse Geocoding**: Integrates OpenStreetMap Nominatim API to resolve raw GPS coordinates into human-readable street names and campus landmarks.

### 🏫 3. Dedicated Campus Network (JSS University & Sector 62)
- Pre-configured with **10+ smart dustbins** across **JSS Academy of Technical Education (JSSATE) Campus** and surrounding Sector 62 areas:
  - JSS Main Gate 1
  - JSS Central Canteen Courtyard *(Critical Fill Demo)*
  - JSS Academic Block 1 (CS & IT Dept)
  - JSS Mechanical & Civil Block Annex
  - JSS Central Library Quadrangle
  - JSS Boys & Girls Hostels
  - JSS Technology Business Incubator (TBI E-Waste Drop)
  - JSS Sports Ground Pavilion

### ➕ 4. Interactive Dustbin Management Modal
- **Live "+ Add Bin" Button**: Users or admins can add new dustbins directly from the web interface.
- **Form Controls**: Set bin name, waste category, address, capacity fill level, and accepted items. The new bin renders immediately as a live interactive marker on the map.

### 🧭 5. Turn-by-Turn Walking Directions
- Opens a dedicated navigation modal providing total distance, walking time (at 4.8 km/h pace), and step-by-step turn-by-turn walking instructions.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend Framework** | [Next.js 16 (App Router)](https://nextjs.org/), [React 19](https://react.dev/) |
| **Styling & UI** | [Tailwind CSS v4](https://tailwindcss.com/), [Lucide Icons](https://lucide.dev/), [React Icons](https://react-icons.github.io/react-icons/) |
| **Map Engine** | [Leaflet](https://leafletjs.com/), OpenStreetMap Tiles |
| **Geolocation & Geocoding** | HTML5 High-Accuracy Geolocation API, OpenStreetMap Nominatim |
| **Build & Tooling** | Turbopack, ESLint |

---

## 📂 Project Structure

```text
smart_waste_ai/
├── public/
│   └── favicon.ico               # Custom SmartWaste AI Icon
├── src/
│   ├── app/
│   │   ├── citizen/
│   │   │   └── find-bin/
│   │   │       └── page.js       # Main "Find Nearby Bins" Map Page
│   │   ├── globals.css           # Global Tailwind CSS v4 & Leaflet styles
│   │   ├── layout.js             # Root Layout with Font & Metadata
│   │   └── page.js               # SmartWaste AI Landing Page
│   ├── components/
│   │   ├── AddBinModal.js        # Form modal for adding custom dustbins
│   │   ├── BinCard.js            # Bin details & fill meter list item
│   │   ├── BinMap.js             # Client wrapper with SSR disabled
│   │   ├── BinMapInner.js        # Leaflet map instance, SVG markers & popups
│   │   ├── DirectionsModal.js    # Turn-by-turn walking instructions drawer
│   │   └── Navbar.js             # Top navigation header with role selector
│   └── lib/
│       ├── geoUtils.js           # Haversine distance, walking time & geocoding
│       └── mockBins.js           # Smart dustbin dataset & category definitions
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have **Node.js 18+** and **npm** installed on your system.

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/smart_waste_ai.git
cd smart_waste_ai
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Open in Browser
Open [http://localhost:3000/citizen/find-bin](http://localhost:3000/citizen/find-bin) to explore the live interactive dustbin locator map.

---

## ⚡ How to Add Custom Bins

### Option A: From Web Interface
1. Navigate to `/citizen/find-bin`.
2. Click **`+ Add Bin`** in the top action bar.
3. Fill in the bin name, category, capacity fill %, and landmark.
4. Click **`Add Dustbin to Map`**.

### Option B: Via Code
Edit `src/lib/mockBins.js` and append a new bin object to `MOCK_BINS`:

```javascript
{
  id: "BIN-JSS-11",
  name: "JSS Robotics Lab Annex Bin",
  lat: 28.6219,
  lng: 77.3642,
  address: "Robotics & AI Lab, JSSATE Campus",
  area: "JSS University Campus",
  category: "recyclable",
  wasteType: "Plastic & Metal Cans",
  fillLevel: 35,
  capacityLiters: 200,
  lastCollected: "1 hour ago",
  suitableItems: ["3D Printing Scrap", "PET Bottles", "Aluminium Cans"],
  sensorStatus: "Online",
}
```

---

## 🏆 Hackathon Submission Details

- **Event**: College Hackathon Project Submission
- **Institution**: JSS Academy of Technical Education (JSSATE)
- **Domain**: AI-Powered Civic Tech & Smart City Infrastructure

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
