import os
import sys
import subprocess
import time

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
client_dir = os.path.join(BASE_DIR, "client")
server_dir = os.path.join(BASE_DIR, "server")
playemt_dir = os.path.join(BASE_DIR, "playemt")

print("=" * 65)
print("🚀 កំពុងដំណើរការប្រព័ន្ធទាំងអស់ (Client, Server, Slip Scanner)...")
print("📌 ចុច Ctrl + C ដើម្បីបិទសេវាកម្មទាំងអស់រួមគ្នា")
print("=" * 65)

# ដំណើរការ processes ទាំង ៣ ក្នុង Terminal តែមួយ
procs = [
    ("Backend Server", subprocess.Popen("npm run dev", cwd=server_dir, shell=True)),
    ("Slip Scanner", subprocess.Popen(f'"{sys.executable}" server.py', cwd=playemt_dir, shell=True)),
    ("Frontend Client", subprocess.Popen("npm run dev", cwd=client_dir, shell=True)),
]

try:
    # រក្សា Python ឱ្យនៅរត់ជាប់រហូត (មិន Exit ទេ)
    while True:
        time.sleep(1)
except (KeyboardInterrupt, SystemExit):
    print("\n🛑 កំពុងបិទសេវាកម្មទាំងអស់...")
    for name, p in procs:
        try:
            subprocess.run(
                f"taskkill /F /T /PID {p.pid}",
                shell=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
        except Exception:
            pass
    print("✅ បានបិទសេវាកម្មទាំងអស់ដោយជោគជ័យ!")
