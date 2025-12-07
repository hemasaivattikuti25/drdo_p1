import asyncio
import logging
import platform
from config.database import db_manager

logger = logging.getLogger("HealthMonitor")

async def get_cpu_temperature():
    system = platform.system()
    try:
        if system == "Linux":
            with open("/sys/class/thermal/thermal_zone0/temp", "r") as f:
                temp = int(f.read().strip()) / 1000
                return temp
        elif system == "Windows":
            # PowerShell command for Windows
            cmd = "powershell \"Get-CimInstance -Namespace root/wmi -ClassName MSAcpi_ThermalZoneTemperature | Select-Object -ExpandProperty CurrentTemperature\""
            proc = await asyncio.create_subprocess_shell(
                cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, _ = await proc.communicate()
            if stdout:
                kelvin_deci = int(stdout.decode().strip())
                return (kelvin_deci - 2732) / 10
    except Exception:
        return None
    return None

async def monitor_health():
    logger.info("Starting Health Monitor...")
    while True:
        try:
            # 1. Check Database
            db = db_manager.get_db()
            if db is not None:
                status = await db.command("serverStatus")
                uptime = status.get("uptime", 0)
                host = status.get("host", "unknown")
                
                # 2. Check Temperature
                temp = await get_cpu_temperature()
                temp_str = f", Temp: {temp:.1f}°C" if temp else ""
                
                logger.info(f"Health Check: OK - Host: {host}, Uptime: {uptime}s{temp_str}")

                # 3. Safety Trigger
                if temp and temp > 80:
                    logger.critical(f"OVERHEATING DETECTED ({temp}°C). Initiating Failover...")
                    await db_manager.disconnect()
                    await db_manager.connect("standalone")

        except Exception as e:
            logger.error(f"Health Check Failed: {e}")
            # Trigger failover if not already on standalone
            if db_manager.mode == "replica":
                await db_manager.connect("standalone")

        await asyncio.sleep(30) # Check every 30 seconds
