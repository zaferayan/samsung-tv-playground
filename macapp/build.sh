#!/bin/bash
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
PROJ="$(cd "$HERE/.." && pwd)"
APP="$HOME/Applications/TVRemote.app"
BIN="$APP/Contents/MacOS/TVRemote"
SUPPORT="$HOME/Library/Application Support/TVRemote"
AGENT="$HOME/Library/LaunchAgents/com.zafer.tvremote.plist"
BUNDLE_ID="com.zafer.tvremote"
DEVICE_ID="4567d7b7-0092-e6d8-df40-cc63eb0afe07"

echo "→ .app iskeleti"
rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"

echo "→ derleniyor"
swiftc -O "$HERE/main.swift" -o "$BIN"

echo "→ Info.plist"
cat > "$APP/Contents/Info.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleName</key><string>TVRemote</string>
  <key>CFBundleDisplayName</key><string>TV Remote</string>
  <key>CFBundleIdentifier</key><string>$BUNDLE_ID</string>
  <key>CFBundleVersion</key><string>1.0</string>
  <key>CFBundleShortVersionString</key><string>1.0</string>
  <key>CFBundleExecutable</key><string>TVRemote</string>
  <key>CFBundlePackageType</key><string>APPL</string>
  <key>LSUIElement</key><true/>
  <key>LSMinimumSystemVersion</key><string>13.0</string>
  <key>NSMicrophoneUsageDescription</key><string>Sesli arama için mikrofon kullanılır.</string>
  <key>NSSpeechRecognitionUsageDescription</key><string>Konuşmanızı metne çevirmek için kullanılır.</string>
</dict>
</plist>
PLIST

echo "→ ad-hoc imzalama (TCC izin istemleri için)"
codesign --force --deep -s - "$APP" 2>/dev/null || echo "  (imzalama atlandı)"

echo "→ config.json (token + device id)"
mkdir -p "$SUPPORT"
TOKEN=$(sed -n 's/^ACCESSTOKEN=//p' "$PROJ/.env" | tr -d "\"' \r\n")
if [ -z "$TOKEN" ]; then echo "HATA: .env icinde ACCESSTOKEN yok"; exit 1; fi
cat > "$SUPPORT/config.json" <<JSON
{ "token": "$TOKEN", "deviceId": "$DEVICE_ID" }
JSON
chmod 600 "$SUPPORT/config.json"

echo "→ LaunchAgent (login'de otomatik başlat)"
cat > "$AGENT" <<AGENTPLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$BUNDLE_ID</string>
  <key>ProgramArguments</key><array><string>$BIN</string></array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><false/>
  <key>ProcessType</key><string>Interactive</string>
</dict>
</plist>
AGENTPLIST

echo "→ LaunchAgent yükleniyor"
launchctl unload "$AGENT" 2>/dev/null || true
launchctl load "$AGENT"

echo "✓ Kuruldu: $APP"
echo "✓ Menü çubuğunda 'tv' simgesi görünmeli."
