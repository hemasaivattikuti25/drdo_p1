"""
DRDO DAMS — Equipment Database Seeder  (30 items, no images)
=============================================================
python3 seeder.py            # seed (skips if data exists)
python3 seeder.py --destroy  # wipe + re-seed
"""

import asyncio, sys, os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

NOW = datetime.utcnow()

EQUIPMENT = [
    # ── Test & Measurement ───────────────────────────────────────────────────
    {
        "name": "Digital Storage Oscilloscope (4-Ch, 1 GHz)",
        "price": 3_85_000,
        "description": "High-bandwidth 4-channel DSO for PCB debugging and waveform analysis. 5 GSa/s, 20 Mpts memory, FFT analyser. Asset no: DRDL-EL-OSC-001. Electronics Lab, Block-C.",
        "ratings": 4.8, "category": "Test & Measurement",
        "seller": "Keysight Technologies (BEL Authorised)", "stock": 4, "numOfReviews": 3, "reviews": [], "images": [], "createdAt": NOW
    },
    {
        "name": "Arbitrary Waveform Generator (2-Ch, 2 GSa/s)",
        "price": 2_95_000,
        "description": "Dual-channel AWG for custom modulated signals (chirp, pulsed, AM/FM). 750 MHz BW, 32 Mpts memory, GPIB+LAN. Asset no: DRDL-RF-AWG-006. Radar Lab, Block-B.",
        "ratings": 4.5, "category": "Test & Measurement",
        "seller": "Keysight Technologies (BEL Authorised)", "stock": 4, "numOfReviews": 3, "reviews": [], "images": [], "createdAt": NOW
    },
    {
        "name": "LCR Meter, Precision (20 Hz – 2 MHz)",
        "price": 78_000,
        "description": "High-accuracy bench LCR meter for characterising inductors, capacitors, and resistors. Basic accuracy 0.05%, 4-terminal Kelvin connection. Asset no: DRDL-EL-LCR-008. Components Lab.",
        "ratings": 4.4, "category": "Test & Measurement",
        "seller": "Hioki E.E. Corporation (India Office)", "stock": 6, "numOfReviews": 2, "reviews": [], "images": [], "createdAt": NOW
    },
    {
        "name": "Bench Multimeter, 6.5-Digit (Reference Grade)",
        "price": 1_45_000,
        "description": "6.5-digit DMM with resistance, capacitance, frequency, and temperature measurement. GPIB/USB/LAN interfaces, SCPI compatible. Asset no: DRDL-EL-DMM-012. Calibration Lab.",
        "ratings": 4.6, "category": "Test & Measurement",
        "seller": "Keithley Instruments (Tektronix Group)", "stock": 5, "numOfReviews": 4, "reviews": [], "images": [], "createdAt": NOW
    },
    # ── RF & Microwave ───────────────────────────────────────────────────────
    {
        "name": "Vector Network Analyser (VNA), 9 kHz – 8.5 GHz",
        "price": 18_50_000,
        "description": "Two-port VNA for RF component characterisation and antenna measurement. 130 dB dynamic range, < 0.003 dB trace noise. Asset no: DRDL-RF-VNA-003. Microwave Lab, Block-A.",
        "ratings": 4.9, "category": "RF & Microwave",
        "seller": "Rohde & Schwarz (Authorised India)", "stock": 2, "numOfReviews": 5, "reviews": [], "images": [], "createdAt": NOW
    },
    {
        "name": "Spectrum Analyser, 9 kHz – 26.5 GHz",
        "price": 12_20_000,
        "description": "Signal and spectrum analyser for EMI/EMC testing, radar signal analysis. DANL: -163 dBm/Hz, integrated preamp. Asset no: DRDL-RF-SA-007. EW Lab, Block-B.",
        "ratings": 4.7, "category": "RF & Microwave",
        "seller": "Tektronix India Pvt. Ltd.", "stock": 3, "numOfReviews": 4, "reviews": [], "images": [], "createdAt": NOW
    },
    {
        "name": "RF Signal Generator, 100 kHz – 20 GHz",
        "price": 9_40_000,
        "description": "High-purity CW and modulated signal source. Phase noise: -130 dBc/Hz (1 GHz, 10 kHz offset). AM/FM/PM/Pulse modulation. Asset no: DRDL-RF-SIG-010. Radar Lab, Block-B.",
        "ratings": 4.7, "category": "RF & Microwave",
        "seller": "Rohde & Schwarz (Authorised India)", "stock": 2, "numOfReviews": 3, "reviews": [], "images": [], "createdAt": NOW
    },
    {
        "name": "Microwave Power Meter & Sensor (50 MHz – 50 GHz)",
        "price": 1_65_000,
        "description": "Dual-channel power measurement with thermal sensors. Dynamic range: -70 to +20 dBm. Used to calibrate antennas and validate transmitter power. Asset no: DRDL-RF-PWR-015.",
        "ratings": 4.5, "category": "RF & Microwave",
        "seller": "Anritsu India Pvt. Ltd.", "stock": 5, "numOfReviews": 2, "reviews": [], "images": [], "createdAt": NOW
    },
    # ── Environmental Testing ─────────────────────────────────────────────────
    {
        "name": "Thermal Shock & Temperature Cycling Chamber",
        "price": 9_75_000,
        "description": "MIL-STD-810H compliant temp shock chamber. Range: -70°C to +180°C, 216L working volume, < 30 sec transition. DRDL-ENV-TC-002. Env. Test Lab, Block-D.",
        "ratings": 4.6, "category": "Environmental Testing",
        "seller": "ESAK Environmental Systems, Chennai", "stock": 1, "numOfReviews": 6, "reviews": [], "images": [], "createdAt": NOW
    },
    {
        "name": "Electrodynamic Vibration Shaker System (5 kN)",
        "price": 42_00_000,
        "description": "Structural vibration qualification per MIL-STD-810H. Force: 5 kN sine / 4 kN random, 2 Hz–3 kHz range. NABL calibrated. DRDL-ENV-VIB-001. Structural Test Facility, Block-G.",
        "ratings": 4.9, "category": "Environmental Testing",
        "seller": "Data Physics Corporation (India Authorised)", "stock": 1, "numOfReviews": 7, "reviews": [], "images": [], "createdAt": NOW
    },
    {
        "name": "Salt Fog / Humidity Test Chamber (MIL-STD-810H)",
        "price": 5_20_000,
        "description": "1000L stainless steel salt fog chamber to test corrosion resistance per IEC 60068-2-11 and MIL-STD-810H Method 509.6. DRDL-ENV-SF-003. Env. Test Lab, Block-D.",
        "ratings": 4.4, "category": "Environmental Testing",
        "seller": "Ascott Analytical (UK; DRDO Approved)", "stock": 1, "numOfReviews": 3, "reviews": [], "images": [], "createdAt": NOW
    },
    {
        "name": "High-Altitude Simulation Chamber (Low Pressure)",
        "price": 14_80_000,
        "description": "Altitude chamber simulating pressures from sea-level to 30,000 m. Used for avionics and sensor qualification. MIL-STD-810H Method 500.6. DRDL-ENV-ALC-001.",
        "ratings": 4.6, "category": "Environmental Testing",
        "seller": "Cincinnati Sub-Zero (CSZ), USA", "stock": 1, "numOfReviews": 2, "reviews": [], "images": [], "createdAt": NOW
    },
    # ── Computing ─────────────────────────────────────────────────────────────
    {
        "name": "Ruggedised Field Server (1U, MIL-STD-810H)",
        "price": 4_65_000,
        "description": "Mission-ready 1U rack server for C2 and data logging. Xeon E-2388G, 64 GB ECC DDR4, 4×2TB NVMe RAID-1. Operates -40 to +60°C. DRDL-IT-SRV-011. System Integration Lab, Block-F.",
        "ratings": 4.7, "category": "Computing",
        "seller": "ECIL, Hyderabad", "stock": 5, "numOfReviews": 2, "reviews": [], "images": [], "createdAt": NOW
    },
    {
        "name": "GPU-Accelerated Signal Processing Workstation",
        "price": 6_85_000,
        "description": "HPC workstation for radar DSP and AI/ML inference. Dual Xeon Gold 6248R, 256 GB ECC, NVIDIA A6000 (48 GB). CUDA 12, GNU Radio pre-installed. DRDL-IT-WKS-009. DSP Lab.",
        "ratings": 4.6, "category": "Computing",
        "seller": "HCL Technologies (Govt. Division)", "stock": 3, "numOfReviews": 5, "reviews": [], "images": [], "createdAt": NOW
    },
    {
        "name": "Ruggedised Tablet (Android 13, MIL-STD-810H)",
        "price": 88_000,
        "description": "10.1\" WUXGA military-grade tablet. Snapdragon 778G, 8 GB RAM, 256 GB UFS 3.1. IP68, MIL-STD-810H shock/vibration. DRDL-IT-TAB-020. Field Teams.",
        "ratings": 4.3, "category": "Computing",
        "seller": "ECIL, Hyderabad", "stock": 12, "numOfReviews": 4, "reviews": [], "images": [], "createdAt": NOW
    },
    # ── Embedded Systems ──────────────────────────────────────────────────────
    {
        "name": "3U VPX Embedded Processor (Xilinx UltraScale+)",
        "price": 7_20_000,
        "description": "FPGA-based real-time DSP board for radar, EW, and comms. VU9P-3 FPGA, 8 GB DDR4, 100G Ethernet, PCIe Gen4. VITA 65 OpenVPX compliant. DRDL-RF-FPGA-014. Embedded Lab, Block-C.",
        "ratings": 4.8, "category": "Embedded Systems",
        "seller": "Pentek Inc. (NovaTech India Authorised)", "stock": 6, "numOfReviews": 4, "reviews": [], "images": [], "createdAt": NOW
    },
    {
        "name": "Ruggedised Single Board Computer (COM Express, -40 to +85°C)",
        "price": 1_85_000,
        "description": "Intel Core i7-1185G7E, 32 GB LPDDR4X, wide-temp SOM for embedded defence avionics. PCIe, USB 3.2, CAN FD, UART. DRDL-SBC-017. EW Payload Dev Lab.",
        "ratings": 4.5, "category": "Embedded Systems",
        "seller": "congatec (Munich; India Distributor)", "stock": 8, "numOfReviews": 2, "reviews": [], "images": [], "createdAt": NOW
    },
    {
        "name": "RISC-V Development Platform (FPGA-hosted)",
        "price": 62_000,
        "description": "RISC-V SoC evaluation kit running on Xilinx Artix-7. 1 GB DDR3, 16 MB flash, UART, SPI, I2C, GPIO. Used for secure MCU firmware R&D. DRDL-SBC-022.",
        "ratings": 4.2, "category": "Embedded Systems",
        "seller": "SiFive (India Distributor)", "stock": 10, "numOfReviews": 3, "reviews": [], "images": [], "createdAt": NOW
    },
    # ── Sensors & Navigation ──────────────────────────────────────────────────
    {
        "name": "Portable 3D LIDAR Scanning System (300 m)",
        "price": 14_50_000,
        "description": "3D LIDAR for terrain mapping and UGV navigation research. Range 300 m, 0.001° angular resolution, integrated GNSS+IMU for georeferencing. DRDL-SEN-LDR-002. Autonomous Systems Lab, Block-E.",
        "ratings": 4.7, "category": "Sensors & Navigation",
        "seller": "Leica Geosystems (India) Pvt. Ltd.", "stock": 2, "numOfReviews": 2, "reviews": [], "images": [], "createdAt": NOW
    },
    {
        "name": "Tactical-Grade IMU (Fibre-Optic Gyroscope)",
        "price": 24_50_000,
        "description": "FOG-based Inertial Measurement Unit for missile and UAV navigation. Bias stability < 0.01°/hr, ARW < 0.003°/√hr. MIL-STD-1750A processor interface. DRDL-NAV-FOG-005.",
        "ratings": 4.9, "category": "Sensors & Navigation",
        "seller": "KVARZ (Russia; DRDO Agreement) / NPOL Backup", "stock": 3, "numOfReviews": 6, "reviews": [], "images": [], "createdAt": NOW
    },
    {
        "name": "Dual-Frequency GNSS Receiver (L1/L2 + NavIC L5)",
        "price": 1_10_000,
        "description": "Survey-grade GNSS for field ops. Supports GPS L1/L2, GLONASS, NavIC L5, Galileo E1. RTK accuracy < 1 cm. DRDL-NAV-GPS-018. Land Systems Division.",
        "ratings": 4.5, "category": "Sensors & Navigation",
        "seller": "Trimble Inc. (India Office)", "stock": 7, "numOfReviews": 3, "reviews": [], "images": [], "createdAt": NOW
    },
    # ── Imaging & Optics ──────────────────────────────────────────────────────
    {
        "name": "Cooled MWIR Thermal Camera (InSb, 640×512)",
        "price": 8_40_000,
        "description": "Research MWIR camera for thermal characterisation and seeker development support. NETD < 20 mK, 400 Hz, spectral range 3–5 μm. Includes 25/50/100 mm lenses. DRDL-IRDE-CAM-004.",
        "ratings": 4.8, "category": "Imaging & Optics",
        "seller": "FLIR Systems India (DRDO Approved)", "stock": 2, "numOfReviews": 4, "reviews": [], "images": [], "createdAt": NOW
    },
    {
        "name": "Laser Range Finder (Eyesafe, 10 km)",
        "price": 5_60_000,
        "description": "Eyesafe 1550 nm pulsed laser rangefinder for target acquisition research. Range 50 m–10 km, accuracy ±1 m, MIL-STD-461G CE102/RE102 compliant. DRDL-OPT-LRF-009.",
        "ratings": 4.7, "category": "Imaging & Optics",
        "seller": "Jenoptik AG (Germany; India Authorised)", "stock": 3, "numOfReviews": 3, "reviews": [], "images": [], "createdAt": NOW
    },
    {
        "name": "High-Speed Industrial Camera (10,000 fps, 2 MP)",
        "price": 6_90_000,
        "description": "For ballistic event capture, explosion dynamics, and structural test imaging. 2 MP monochrome CMOS, 10,000 fps @ full res, internal RAM 32 GB, GigE Vision interface. DRDL-OPT-HSC-006.",
        "ratings": 4.6, "category": "Imaging & Optics",
        "seller": "Vision Research (Phantom), UK", "stock": 2, "numOfReviews": 2, "reviews": [], "images": [], "createdAt": NOW
    },
    # ── Communication ─────────────────────────────────────────────────────────
    {
        "name": "Tactical HF/VHF Software Defined Radio (SDR)",
        "price": 3_60_000,
        "description": "Field-programmable SDR for tactical comms research. Frequency: 1 MHz–6 GHz, 200 MHz instantaneous BW, GNU Radio and MATLAB compatible. DRDL-COM-SDR-003.",
        "ratings": 4.7, "category": "Communication",
        "seller": "Ettus Research (NI), DRDO-Licensed", "stock": 4, "numOfReviews": 5, "reviews": [], "images": [], "createdAt": NOW
    },
    {
        "name": "Portable Encrypted Satellite Terminal (VSAT, Ku-Band)",
        "price": 18_75_000,
        "description": "Man-pack VSAT for secure field communications. 1.2 m auto-deploy antenna, COMSEC encryption, AES-256, FHSS. Operates -30 to +55°C. DRDL-COM-SAT-001.",
        "ratings": 4.8, "category": "Communication",
        "seller": "ISRO SATCOM (DRDO Inter-Agency)", "stock": 2, "numOfReviews": 3, "reviews": [], "images": [], "createdAt": NOW
    },
    # ── Electronic Warfare ────────────────────────────────────────────────────
    {
        "name": "Broadband RF Jamming Simulator (100 MHz – 6 GHz)",
        "price": 36_00_000,
        "description": "Lab-contained RF jamming signal generator for EW receiver testing. Covers GPS L1/L2, BT, Wi-Fi, LTE, satcom bands. Fully shielded, compliant with RSE 2019. DRDL-EW-JAM-002.",
        "ratings": 4.8, "category": "Electronic Warfare",
        "seller": "Rohde & Schwarz (Authorised India)", "stock": 1, "numOfReviews": 5, "reviews": [], "images": [], "createdAt": NOW
    },
    {
        "name": "Direction Finding Antenna Array (HF, 2–30 MHz)",
        "price": 22_50_000,
        "description": "Circular array for HF emitter DF in EW research. 8-element Adcock / Watson-Watt DF, < 2° bearing accuracy. DRDL-EW-DFA-001. EW Field Site, Block-B.",
        "ratings": 4.6, "category": "Electronic Warfare",
        "seller": "Rockwell Collins (Collins Aerospace), India", "stock": 1, "numOfReviews": 2, "reviews": [], "images": [], "createdAt": NOW
    },
    # ── Manufacturing Equipment ───────────────────────────────────────────────
    {
        "name": "Vacuum Reflow Soldering Oven (8-Zone, SMT)",
        "price": 22_80_000,
        "description": "8-zone vacuum reflow oven for void-free lead-free SMT on avionics PCBs. < 1% void area, N2 atmosphere, IPC J-STD-020 compliant. DRDL-MFG-OVN-001. PCB Assembly, Block-H.",
        "ratings": 4.9, "category": "Manufacturing Equipment",
        "seller": "Rehm Thermal Systems (India Authorised)", "stock": 1, "numOfReviews": 8, "reviews": [], "images": [], "createdAt": NOW
    },
    {
        "name": "5-Axis CNC Milling Machine (High-Speed, Ti-Grade)",
        "price": 85_00_000,
        "description": "5-axis CNC for precision aerospace alloy machining (Ti-6Al-4V, Inconel). Spindle: 40,000 rpm, positioning accuracy ±2 μm. DRDL-MFG-CNC-001. Precision Manufacturing, Block-G.",
        "ratings": 4.9, "category": "Manufacturing Equipment",
        "seller": "DMG MORI (India Operations)", "stock": 1, "numOfReviews": 4, "reviews": [], "images": [], "createdAt": NOW
    },
]

# Pre-computed bcrypt hash of "Drdo@2025"
HASHED_PASSWORD = "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"

ADMIN = {
    "name": "Director, DRDL Hyderabad",
    "email": "admin@drdl.drdo.gov.in",
    "password": HASHED_PASSWORD,
    "role": "admin",
    "avatar": None,
    "createdAt": datetime.utcnow()
}

async def seed():
    uri = os.getenv("MONGO_URI_STANDALONE", "mongodb://localhost:27017/drdo_dams")
    try:
        replica_uri = "mongodb://localhost:27017,localhost:27018,localhost:27019/drdo_dams?replicaSet=rs0"
        client = AsyncIOMotorClient(replica_uri, serverSelectionTimeoutMS=2000)
        await client.admin.command("ping")
        print("✅ Replica Set connected.")
    except Exception:
        client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=3000)
        await client.admin.command("ping")
        print("⚠️  Standalone MongoDB (replica set not available locally).")

    db = client.get_database("drdo_dams")

    if "--destroy" in sys.argv:
        await db.products.delete_many({})
        await db.users.delete_many({})
        print("✅ Data cleared.")

    if "--wipe-only" in sys.argv:
        client.close(); return

    existing = await db.products.count_documents({})
    if existing == 0:
        await db.products.insert_many(EQUIPMENT)
        print(f"✅ {len(EQUIPMENT)} equipment items seeded.")
    else:
        print(f"ℹ️  {existing} items already present. Use --destroy to re-seed.")

    if not await db.users.find_one({"email": ADMIN["email"]}):
        await db.users.insert_one(ADMIN)
        print(f"✅ Admin: {ADMIN['email']} / Drdo@2025")
    else:
        print(f"ℹ️  Admin already exists.")

    client.close()
    print("🎖️  Done.")

if __name__ == "__main__":
    asyncio.run(seed())
