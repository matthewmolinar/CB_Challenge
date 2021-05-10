# ClearBlade Coding Challenge
# Matthew Molinar
from clearblade.ClearBladeCore import System, Query, Developer
from dotenv import load_dotenv
load_dotenv()
import os
import psutil
import datetime
import time

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
    payload = '{'
    for i in range(len(psutil.pids())):
        pid = psutil.pids()[i]
        p = psutil.Process(pid)
        with p.oneshot():
            current_time = time.time()
            start_time = p.create_time()
            time_running = current_time - start_time
            dt = datetime.datetime.utcfromtimestamp(time_running)
            running_time_iso = dt.isoformat() + 'Z'
        if i == (len(psutil.pids()) - 1):
            payload += f'"process{pid}": {{"processName":"{p.name()}", "memoryPercent": "{p.memory_percent()}", "pid": "{pid}", "status": "{p.status()}", "runningTime": "{running_time_iso}"}}'
        else:
            payload += f'"process{pid}": {{"processName":"{p.name()}", "memoryPercent": "{p.memory_percent()}", "pid": "{pid}", "status": "{p.status()}", "runningTime": "{running_time_iso}"}},'
    payload += '}'
    mqtt.publish("memory_usage", payload)
    time.sleep(90)

mqtt.disconnect()


