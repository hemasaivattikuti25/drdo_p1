import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import logging

load_dotenv("backend/config/config.env")

class DatabaseManager:
    def __init__(self):
        self.client = None
        self.db = None
        self.mode = "standalone"
        self.logger = logging.getLogger("DatabaseManager")
        logging.basicConfig(level=logging.INFO)

    async def connect(self, mode=None):
        if mode is None:
            mode = os.getenv("MONGO_DEFAULT_MODE", "replica")
            
        self.mode = mode
        
        # Select URI based on mode
        if mode == "replica":
            uri = os.getenv("MONGO_URI_REPLICA", "mongodb://localhost:27017,localhost:27018,localhost:27019/favcart?replicaSet=rs0")
            self.logger.info("Connecting to Replica Set...")
        else:
            uri = os.getenv("MONGO_URI_STANDALONE", "mongodb://localhost:27017/favcart")
            self.logger.info("Connecting to Standalone Backup...")

        try:
            self.client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=5000)
            self.db = self.client.get_default_database()
            
            # Verify connection
            await self.client.admin.command('ping')
            self.logger.info(f"Successfully connected to MongoDB in {mode} mode.")
            
        except Exception as e:
            self.logger.error(f"Failed to connect to database in {mode} mode: {e}")
            # Simple failover logic
            if mode == "replica":
                self.logger.warning("Replica Set failed. Switching to Standalone...")
                await self.connect("standalone")
            else:
                self.logger.critical("All database connections failed.")
                raise e

    async def disconnect(self):
        if self.client:
            self.client.close()
            self.logger.info("Database disconnected.")

    def get_db(self):
        return self.db

# Create a global instance
db_manager = DatabaseManager()

