#!/usr/bin/env python3
# TV'de YouTube araması yapar ve ilk sonucu açar (OK).
# Kullanım: tv-search.py <aranacak metin>
# Siri/Kısayollar'dan "Run Shell Script" ile çağrılır.
import json, sys, time, os, urllib.parse, urllib.request

q = " ".join(sys.argv[1:]).strip()
if not q:
    print("boş sorgu"); sys.exit(0)

cfg_path = os.path.expanduser("~/Library/Application Support/TVRemote/config.json")
cfg = json.load(open(cfg_path))
token, dev = cfg["token"], cfg["deviceId"]
api = f"https://api.smartthings.com/v1/devices/{dev}/commands"

def cmd(cap, command, args):
    body = json.dumps({"commands": [{"component": "main", "capability": cap,
                                     "command": command, "arguments": args}]}).encode()
    req = urllib.request.Request(api, data=body, method="POST",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"})
    try:
        urllib.request.urlopen(req, timeout=10)
    except Exception as e:
        print("hata:", e)

url = "https://www.youtube.com/results?search_query=" + urllib.parse.quote(q)
cmd("custom.tvsearch", "search", [q, url])   # ara
time.sleep(7)                                 # sonuçlar yüklensin
cmd("samsungvd.remoteControl", "send", ["OK", "PRESS_AND_RELEASED"])  # ilk sonucu aç
print("ok:", q)
