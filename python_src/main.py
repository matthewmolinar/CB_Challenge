# ClearBlade Coding Challenge
# Matthew Molinar
from clearblade.ClearBladeCore import System, Query, Developer
from dotenv import load_dotenv
load_dotenv()
import os
import psutil
import datetime
import time
import json

# Prerequisites for MQTT
EMAIL = os.getenv('EMAIL')
PASSWORD = os.getenv('PASSWORD')

# Connect to broker
USER_TOKEN = os.getenv('USER_TOKEN')
SYSTEM_KEY = os.getenv('SYSTEM_KEY')
SYSTEM_SECRET = os.getenv('SYSTEM_SECRET')

# Auth over MQTT
# 1. Connect
my_system = System(SYSTEM_KEY, SYSTEM_SECRET)
matthew = my_system.User(EMAIL, PASSWORD)
mqtt = my_system.Messaging(matthew)

# Connect and send messages about computer.
mqtt.connect()


while(True):
    # Sending memory information via mqtt.
    mem = psutil.virtual_memory()
    payload = json.dumps([proc.as_dict(attrs=['pid', 'name', 'memory_percent','create_time']) for proc in psutil.process_iter()])
    mqtt.publish("memory_usage", payload)
    time.sleep(90)

mqtt.disconnect()


