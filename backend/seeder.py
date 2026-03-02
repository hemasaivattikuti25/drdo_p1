"""
DRDO DAMS — Equipment Database Seeder
======================================
Populates the database with realistic DRDO lab equipment items.
All images are LOCAL (/images/products/*.jpg) — no internet required.

Usage:
    python seeder.py              # seed (skips if data exists)
    python seeder.py --destroy    # wipe all data first, then seed
    python seeder.py --wipe-only  # wipe only, no re-seed
"""

import asyncio
import sys
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime


# ── DRDO Lab Equipment — All images are offline-safe local paths ──────────────
EQUIPMENT = [
    {
        "name": "Digital Storage Oscilloscope (4-Channel, 1 GHz)",
        "price": 3_85_000,
        "description": (
            "High-bandwidth 4-channel digital storage oscilloscope for PCB debugging, "
            "signal integrity analysis, and waveform capture in electronics labs. "
            "1 GHz bandwidth, 5 GSa/s sample rate, 20 Mpts memory depth. "
            "Includes USB-TRIG, HDMI output, and built-in FFT analyser. "
            "Asset no: DRDL-EL-OSC-001. Location: Electronics Lab, Block-C."
        ),
        "ratings": 4.8,
        "images": [{"image": "/images/products/1.jpg"}],
        "category": "Test & Measurement",
        "seller": "Keysight Technologies (BEL Authorised)",
        "stock": 4,
        "numOfReviews": 3,
        "reviews": []
    },
    {
        "name": "Vector Network Analyser (VNA), 9 kHz – 8.5 GHz",
        "price": 18_50_000,
        "description": (
            "Two-port VNA for RF component characterisation, antenna measurement, "
            "and filter tuning in the microwave frequency range. "
            "Dynamic range: 130 dB. Trace noise: < 0.003 dB rms. "
            "Includes calibration kit (3.5 mm SOLT), test cables, and DRDO CAL certificate. "
            "Asset no: DRDL-RF-VNA-003. Location: Microwave Lab, Block-A."
        ),
        "ratings": 4.9,
        "images": [{"image": "/images/products/2.jpg"}],
        "category": "RF & Microwave",
        "seller": "Rohde & Schwarz (Authorised India)",
        "stock": 2,
        "numOfReviews": 5,
        "reviews": []
    },
    {
        "name": "Spectrum Analyser, 9 kHz – 26.5 GHz",
        "price": 12_20_000,
        "description": (
            "Signal and spectrum analyser for EMI/EMC testing, radar signal analysis, "
            "and electronic warfare research. DANL: -163 dBm/Hz. Phase noise: -110 dBc/Hz. "
            "Integrated preamplifier and tracking generator. MIL-STD-461G compliant test setup. "
            "Asset no: DRDL-RF-SA-007. Location: EW Lab, Block-B."
        ),
        "ratings": 4.7,
        "images": [{"image": "/images/products/3.jpg"}],
        "category": "RF & Microwave",
        "seller": "Tektronix India Pvt. Ltd.",
        "stock": 3,
        "numOfReviews": 4,
        "reviews": []
    },
    {
        "name": "Thermal Shock & Temperature Cycling Chamber",
        "price": 9_75_000,
        "description": (
            "Environmental test chamber for MIL-STD-810H temperature shock testing. "
            "Working volume: 216 litres. Temperature range: -70°C to +180°C. "
            "Transition time < 30 seconds between zones. RS-232/Ethernet control interface. "
            "Used for qualification of electronic assemblies and sub-systems. "
            "Asset no: DRDL-ENV-TC-002. Location: Env. Test Lab, Block-D."
        ),
        "ratings": 4.6,
        "images": [{"image": "/images/products/4.jpg"}],
        "category": "Environmental Testing",
        "seller": "ESAK Environmental Systems, Chennai",
        "stock": 1,
        "numOfReviews": 6,
        "reviews": []
    },
    {
        "name": "Ruggedised Field Server (1U, MIL-STD-810H)",
        "price": 4_65_000,
        "description": (
            "Mission-ready 1U rack-mount server for C2, data logging, and processing "
            "in deployed environments. Intel Xeon E-2388G, 64 GB ECC DDR4, 4×2TB NVMe RAID-1. "
            "Operates -40°C to +60°C. TPM 2.0, secure boot. Independent power supply (12V DC). "
            "Asset no: DRDL-IT-SRV-011. Location: System Integration Lab, Block-F."
        ),
        "ratings": 4.7,
        "images": [{"image": "/images/products/5.jpg"}],
        "category": "Computing",
        "seller": "ECIL, Hyderabad",
        "stock": 5,
        "numOfReviews": 2,
        "reviews": []
    },
    {
        "name": "6-DOF Vibration Test System (Electrodynamic, 5 kN)",
        "price": 42_00_000,
        "description": (
            "Electrodynamic shaker system for structural vibration qualification per MIL-STD-810H. "
            "Force rating: 5 kN sine / 4 kN random. Frequency range: 2 Hz – 3 kHz. "
            "Includes power amplifier, head expander, cooling blower, and PC-based control. "
            "Calibrated to NABL standards. "
            "Asset no: DRDL-ENV-VIB-001. Location: Structural Test Facility, Block-G."
        ),
        "ratings": 4.9,
        "images": [{"image": "/images/products/6.jpg"}],
        "category": "Environmental Testing",
        "seller": "Data Physics Corporation (India Authorised)",
        "stock": 1,
        "numOfReviews": 7,
        "reviews": []
    },
    {
        "name": "High-Speed Infrared Thermography Camera (640×512)",
        "price": 8_40_000,
        "description": (
            "Research-grade cooled MWIR camera for thermal characterisation of electronic "
            "components, motor winding analysis, and missile seeker development support. "
            "Sensor: InSb 640×512, NETD < 20 mK. Frame rate: up to 400 Hz. "
            "Spectral range: 3–5 μm. Includes multiple lenses (25/50/100 mm). "
            "Asset no: DRDL-IRDE-CAM-004. Location: IRDE Support Cell, Block-A."
        ),
        "ratings": 4.8,
        "images": [{"image": "/images/products/7.jpg"}],
        "category": "Imaging & Optics",
        "seller": "FLIR Systems India (DRDO Approved)",
        "stock": 2,
        "numOfReviews": 4,
        "reviews": []
    },
    {
        "name": "Real-Time Signal Processing Workstation (GPU-Accelerated)",
        "price": 6_85_000,
        "description": (
            "High-performance computing workstation for radar signal processing, "
            "SDR development, and AI/ML inference tasks. "
            "Dual Intel Xeon Gold 6248R, 256 GB DDR4 ECC, NVIDIA A6000 (48 GB VRAM). "
            "CUDA 12.x toolkit, OpenCL, GNU Radio pre-installed. "
            "Asset no: DRDL-IT-WKS-009. Location: DSP Lab, Block-C."
        ),
        "ratings": 4.6,
        "images": [{"image": "/images/products/8.jpg"}],
        "category": "Computing",
        "seller": "HCL Technologies (Govt. Division)",
        "stock": 3,
        "numOfReviews": 5,
        "reviews": []
    },
    {
        "name": "Arbitrary Waveform Generator (AWG), 2 Ch, 2 GSa/s",
        "price": 2_95_000,
        "description": (
            "Dual-channel arbitrary waveform generator for stimulating DUT with custom "
            "modulated signals (AM, FM, PM, chirp, pulsed). "
            "Sample rate: 2 GSa/s per channel. Bandwidth: 750 MHz. 32 Mpts waveform memory. "
            "IVI-compliant, GPIB + LAN + USB. Used in radar waveform design lab. "
            "Asset no: DRDL-RF-AWG-006. Location: Radar Lab, Block-B."
        ),
        "ratings": 4.5,
        "images": [{"image": "/images/products/9.jpg"}],
        "category": "Test & Measurement",
        "seller": "Keysight Technologies (BEL Authorised)",
        "stock": 4,
        "numOfReviews": 3,
        "reviews": []
    },
    {
        "name": "Portable LIDAR Scanning System (Indoor/Outdoor)",
        "price": 14_50_000,
        "description": (
            "3D LIDAR scanner for terrain mapping, UGV navigation research, and structural "
            "inspection at field sites. Range: 300 m @ 90% reflectivity. "
            "Angular resolution: 0.001°. Output: point cloud (LAS/PCD). "
            "Tripod-mounted with integrated GNSS+IMU for georeferencing. "
            "Asset no: DRDL-SEN-LDR-002. Location: Autonomous Systems Lab, Block-E."
        ),
        "ratings": 4.7,
        "images": [{"image": "/images/products/10.jpg"}],
        "category": "Sensors & Navigation",
        "seller": "Leica Geosystems (India) Pvt. Ltd.",
        "stock": 2,
        "numOfReviews": 2,
        "reviews": []
    },
    {
        "name": "Vacuum Reflow Soldering Oven (8-Zone, SMT)",
        "price": 22_80_000,
        "description": (
            "8-zone vacuum reflow oven for soldering lead-free SMT assemblies on "
            "avionics-grade PCBs. Void-free solder joint guarantee < 1% void area. "
            "Atmosphere: N2 with < 100 ppm O2. Profile logging, automatic flux recovery. "
            "IPC J-STD-020 and IPC-7530 compliant. "
            "Asset no: DRDL-MFG-OVN-001. Location: PCB Assembly Shop, Block-H."
        ),
        "ratings": 4.9,
        "images": [{"image": "/images/products/11.jpg"}],
        "category": "Manufacturing Equipment",
        "seller": "Rehm Thermal Systems (India Authorised)",
        "stock": 1,
        "numOfReviews": 8,
        "reviews": []
    },
    {
        "name": "3U VPX Embedded Computing Module (Xilinx UltraScale+)",
        "price": 7_20_000,
        "description": (
            "FPGA-based embedded processing board for real-time signal processing in "
            "radar, EW, and comms payload development. "
            "Xilinx VU9P-3 UltraScale+ FPGA, 8 GB DDR4 SDRAM, 100G Ethernet, PCIe Gen4. "
            "VITA 65 OpenVPX compliant. Includes Vivado design suite license (DRDO academic). "
            "Asset no: DRDL-RF-FPGA-014. Location: Embedded Lab, Block-C."
        ),
        "ratings": 4.8,
        "images": [{"image": "/images/products/12.jpg"}],
        "category": "Embedded Systems",
        "seller": "Pentek Inc. (NovaTech India Authorised)",
        "stock": 6,
        "numOfReviews": 4,
        "reviews": []
    }
]

# Pre-hashed bcrypt of "Drdo@2025"
HASHED_PASSWORD = "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"

ADMIN_USER = {
    "name": "Director, DRDL Hyderabad",
    "email": "admin@drdl.drdo.gov.in",
    "password": HASHED_PASSWORD,
    "role": "admin",
    "avatar": None,
    "createdAt": datetime.utcnow()
}

# ── Seed ───────────────────────────────────────────────────────────────────────
async def seed():
    uri = os.getenv(
        "MONGO_URI_STANDALONE",
        "mongodb://localhost:27017,localhost:27018,localhost:27019/drdo_dams?replicaSet=rs0"
    )
    # Fallback to standalone if replica is unavailable
    try:
        client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=3000)
        await client.admin.command("ping")
        print("✅ Connected to MongoDB Replica Set.")
    except Exception:
        uri = "mongodb://localhost:27017/drdo_dams"
        client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=3000)
        await client.admin.command("ping")
        print("⚠️  Replica Set unavailable. Using standalone MongoDB.")

    db = client.get_database("drdo_dams")

    wipe_only = "--wipe-only" in sys.argv
    destroy   = "--destroy"   in sys.argv

    if wipe_only or destroy:
        print("⚠️  Clearing existing data...")
        await db.products.delete_many({})
        await db.users.delete_many({})
        print("✅  Data cleared.")
        if wipe_only:
            client.close()
            return

    # Products
    existing = await db.products.count_documents({})
    if existing == 0:
        print(f"🌱 Seeding {len(EQUIPMENT)} equipment items...")
        for item in EQUIPMENT:
            item["createdAt"] = datetime.utcnow()
        await db.products.insert_many(EQUIPMENT)
        print(f"✅  {len(EQUIPMENT)} equipment items seeded successfully.")
    else:
        print(f"ℹ️  {existing} items already in DB. Run with --destroy to re-seed.")

    # Admin user
    admin_exists = await db.users.find_one({"email": ADMIN_USER["email"]})
    if not admin_exists:
        await db.users.insert_one(ADMIN_USER)
        print(f"\n✅  Admin user created:")
        print(f"   Email:    {ADMIN_USER['email']}")
        print(f"   Password: Drdo@2025")
    else:
        print(f"ℹ️  Admin user already exists ({ADMIN_USER['email']}).")

    client.close()
    print("\n🎖️  DRDO DAMS database seeding complete.")

if __name__ == "__main__":
    asyncio.run(seed())
