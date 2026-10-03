import SwiftUI
import AppKit
import Speech
import AVFoundation

// MARK: - Dil (sistem diline göre TR / EN)
enum Lang {
    static let isTR: Bool = (Locale.preferredLanguages.first?.prefix(2).lowercased() ?? "en") == "tr"
    /// Türkçe sistemde ilk, diğerlerinde ikinci metni döndürür.
    static func s(_ tr: String, _ en: String) -> String { isTR ? tr : en }
    static var speechLocale: Locale { Locale(identifier: isTR ? "tr-TR" : "en-US") }
}

// MARK: - Yapılandırma (token + TV device id)
enum Config {
    static let path = NSHomeDirectory() + "/Library/Application Support/TVRemote/config.json"
    static let defaultDeviceId = "4567d7b7-0092-e6d8-df40-cc63eb0afe07"  // 65" Neo QLED
    static func load() -> (token: String, deviceId: String) {
        guard let data = FileManager.default.contents(atPath: path),
              let obj = try? JSONSerialization.jsonObject(with: data) as? [String: String]
        else { return ("", "") }
        return (obj["token"] ?? "", obj["deviceId"] ?? "")
    }
    static func save(token: String, deviceId: String) {
        let dir = (path as NSString).deletingLastPathComponent
        try? FileManager.default.createDirectory(atPath: dir, withIntermediateDirectories: true)
        let obj = ["token": token, "deviceId": deviceId.isEmpty ? defaultDeviceId : deviceId]
        if let data = try? JSONSerialization.data(withJSONObject: obj, options: .prettyPrinted) {
            try? data.write(to: URL(fileURLWithPath: path))
            try? FileManager.default.setAttributes([.posixPermissions: 0o600], ofItemAtPath: path)
        }
    }
}

// MARK: - SmartThings çağrıları
final class TV: ObservableObject {
    @Published var status: String = ""
    private let api = "https://api.smartthings.com/v1"
    private var blockedUntil: Date = .distantPast

    private func set(_ s: String) {
        status = s
        DispatchQueue.main.asyncAfter(deadline: .now() + 3) { if self.status == s { self.status = "" } }
    }

    private func command(_ capability: String, _ command: String, _ args: [Any]) {
        let (token, deviceId) = Config.load()
        guard !token.isEmpty, !deviceId.isEmpty else { set(Lang.s("⚠︎ yapılandırma yok", "⚠︎ no config")); return }
        if Date() < blockedUntil { set("⏳ rate limit"); return }
        guard let url = URL(string: "\(api)/devices/\(deviceId)/commands") else { return }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body: [String: Any] = ["commands": [[
            "component": "main", "capability": capability, "command": command, "arguments": args
        ]]]
        req.httpBody = try? JSONSerialization.data(withJSONObject: body)
        URLSession.shared.dataTask(with: req) { _, resp, err in
            let code = (resp as? HTTPURLResponse)?.statusCode ?? 0
            DispatchQueue.main.async {
                if let err = err { self.set(Lang.s("hata: ", "error: ") + err.localizedDescription) }
                else if code == 429 { self.blockedUntil = Date().addingTimeInterval(12); self.set("⏳ rate limit") }
                else if (200..<300).contains(code) { self.set("✓ \(command)") }
                else { self.set("✗ \(code)") }
            }
        }.resume()
    }

    func youtubeSearch(_ q: String) {
        let enc = q.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
        command("custom.tvsearch", "search", [q, "https://www.youtube.com/results?search_query=\(enc)"])
    }
    // Ara, sonuçlar yüklensin diye bekle, sonra ilk sonucu aç (OK).
    func searchAndEnter(_ q: String, openDelay: Double = 6.5) {
        youtubeSearch(q)
        set("🔎 \(q)")
        DispatchQueue.main.asyncAfter(deadline: .now() + openDelay) { self.key("OK") }
    }
    func key(_ k: String) { command("samsungvd.remoteControl", "send", [k, "PRESS_AND_RELEASED"]) }
    func volUp()   { command("audioVolume", "volumeUp", []) }
    func volDown() { command("audioVolume", "volumeDown", []) }
    func mute(_ on: Bool) { command("audioMute", on ? "mute" : "unmute", []) }
    func power(_ on: Bool) { command("switch", on ? "on" : "off", []) }
}

// MARK: - Sesli giriş (konuşma → metin)
final class Speech: ObservableObject {
    @Published var listening = false
    private let recognizer = SFSpeechRecognizer(locale: Lang.speechLocale)
    private let engine = AVAudioEngine()
    private var request: SFSpeechAudioBufferRecognitionRequest?
    private var task: SFSpeechRecognitionTask?
    var onText: ((String) -> Void)?       // canlı metin
    var onFinal: ((String) -> Void)?      // bittiğinde

    func toggle() { listening ? stop() : start() }

    func start() {
        SFSpeechRecognizer.requestAuthorization { auth in
            guard auth == .authorized else { DispatchQueue.main.async { self.onText?(Lang.s("⚠︎ konuşma izni yok", "⚠︎ no speech permission")) }; return }
            AVCaptureDevice.requestAccess(for: .audio) { granted in
                guard granted else { DispatchQueue.main.async { self.onText?(Lang.s("⚠︎ mikrofon izni yok", "⚠︎ no mic permission")) }; return }
                DispatchQueue.main.async { self.begin() }
            }
        }
    }

    private func begin() {
        guard let recognizer = recognizer, recognizer.isAvailable else { onText?(Lang.s("⚠︎ tanıma yok", "⚠︎ recognizer unavailable")); return }
        request = SFSpeechAudioBufferRecognitionRequest()
        request?.shouldReportPartialResults = true
        let node = engine.inputNode
        let format = node.outputFormat(forBus: 0)
        node.installTap(onBus: 0, bufferSize: 1024, format: format) { buf, _ in self.request?.append(buf) }
        engine.prepare()
        do { try engine.start() } catch { onText?(Lang.s("⚠︎ ses başlatılamadı", "⚠︎ couldn't start audio")); return }
        listening = true
        task = recognizer.recognitionTask(with: request!) { result, error in
            if let result = result {
                let text = result.bestTranscription.formattedString
                DispatchQueue.main.async { self.onText?(text) }
                if result.isFinal { DispatchQueue.main.async { self.finish(text) } }
            }
            if error != nil { DispatchQueue.main.async { self.stop() } }
        }
    }

    func stop() {
        guard listening || task != nil else { return }
        engine.inputNode.removeTap(onBus: 0)
        engine.stop()
        request?.endAudio()
        task?.cancel()
        task = nil; request = nil
        listening = false
    }

    private func finish(_ text: String) {
        stop()
        let t = text.trimmingCharacters(in: .whitespacesAndNewlines)
        if !t.isEmpty { onFinal?(t) }
    }
}

// MARK: - Panel (popover içeriği)
struct PanelView: View {
    @StateObject private var tv = TV()
    @StateObject private var speech = Speech()
    @State private var q = ""
    @State private var muted = false
    @State private var tvOn = true
    @State private var tokenField = ""
    @State private var showToken = false
    @FocusState private var focused: Bool

    private func search() {
        let s = q.trimmingCharacters(in: .whitespacesAndNewlines)
        if !s.isEmpty { tv.searchAndEnter(s) }
    }

    private func saveToken() {
        let dev = Config.load().deviceId
        Config.save(token: tokenField.trimmingCharacters(in: .whitespacesAndNewlines), deviceId: dev)
        tv.status = Lang.s("✓ token kaydedildi", "✓ token saved")
        showToken = false
    }

    private let accent = Color(red: 0.34, green: 0.55, blue: 1.0)

    // Yön tuşu (dairesel pad'in çevresine yerleşir)
    private func dir(_ icon: String, _ key: String) -> some View {
        Button(action: { tv.key(key) }) {
            Image(systemName: icon)
                .font(.system(size: 16, weight: .semibold))
                .foregroundStyle(.primary)
                .frame(width: 50, height: 50)
                .background(Circle().fill(.quaternary))
                .overlay(Circle().stroke(.white.opacity(0.06), lineWidth: 1))
        }
        .buttonStyle(.plain)
    }

    var body: some View {
        VStack(spacing: 16) {
            // Üst başlık
            HStack(spacing: 6) {
                Image(systemName: "tv").font(.system(size: 11)).foregroundStyle(accent)
                Text(Lang.s("TV Kumanda", "TV Remote")).font(.system(size: 12, weight: .semibold)).foregroundStyle(.secondary)
                Spacer()
                Button(action: { showToken.toggle() }) {
                    Image(systemName: "key").font(.system(size: 11)).foregroundStyle(.secondary)
                }.buttonStyle(.plain).help(Lang.s("Token", "Token"))
            }

            // Token girişi (gizli, anahtar ikonuyla açılır)
            if showToken {
                VStack(spacing: 6) {
                    HStack(spacing: 6) {
                        SecureField("SmartThings PAT…", text: $tokenField)
                            .textFieldStyle(.roundedBorder)
                        Button(Lang.s("Kaydet", "Save")) { saveToken() }
                    }
                    HStack {
                        Link(Lang.s("token al ↗", "get token ↗"),
                             destination: URL(string: "https://account.smartthings.com/tokens")!)
                            .font(.system(size: 10)).foregroundStyle(accent)
                        Spacer()
                        Text(Lang.s("24 saatte yenilenir", "expires in 24h"))
                            .font(.system(size: 10)).foregroundStyle(.secondary)
                    }
                }
            }

            // Arama çubuğu
            HStack(spacing: 8) {
                Image(systemName: "magnifyingglass").font(.system(size: 12)).foregroundStyle(.secondary)
                TextField(Lang.s("YouTube'da ara…", "Search YouTube…"), text: $q)
                    .textFieldStyle(.plain)
                    .focused($focused)
                    .onSubmit(search)
                Button(action: { speech.toggle() }) {
                    Image(systemName: speech.listening ? "mic.fill" : "mic")
                        .font(.system(size: 13))
                        .foregroundStyle(speech.listening ? Color.red : Color.secondary)
                }
                .buttonStyle(.plain).help(Lang.s("Sesli ara", "Voice search"))
                Button(action: search) {
                    Image(systemName: "arrow.right.circle.fill")
                        .font(.system(size: 20)).foregroundStyle(accent)
                }
                .buttonStyle(.plain).keyboardShortcut(.defaultAction)
            }
            .padding(.horizontal, 11).padding(.vertical, 8)
            .background(RoundedRectangle(cornerRadius: 11).fill(.quaternary))
            .overlay(RoundedRectangle(cornerRadius: 11).stroke(focused ? accent : .clear, lineWidth: 1.5))

            // Dairesel D-pad
            ZStack {
                Circle()
                    .fill(.ultraThinMaterial)
                    .overlay(Circle().stroke(.white.opacity(0.07), lineWidth: 1))
                    .frame(width: 196, height: 196)
                dir("chevron.up", "UP").offset(y: -68)
                dir("chevron.down", "DOWN").offset(y: 68)
                dir("chevron.left", "LEFT").offset(x: -68)
                dir("chevron.right", "RIGHT").offset(x: 68)
                Button(action: { tv.key("OK") }) {
                    Text("OK")
                        .font(.system(size: 16, weight: .bold)).foregroundStyle(.white)
                        .frame(width: 74, height: 74)
                        .background(Circle().fill(accent))
                        .shadow(color: accent.opacity(0.5), radius: 9, y: 2)
                }
                .buttonStyle(.plain)
            }
            .frame(width: 196, height: 196)

            // Ses pill
            HStack(spacing: 0) {
                Button(action: { tv.volDown() }) {
                    Image(systemName: "minus").frame(maxWidth: .infinity, minHeight: 36)
                }.buttonStyle(.plain)
                Divider().frame(height: 20)
                Button(action: { muted.toggle(); tv.mute(muted) }) {
                    Image(systemName: muted ? "speaker.slash.fill" : "speaker.wave.2.fill")
                        .foregroundStyle(muted ? Color.red : Color.primary)
                        .frame(maxWidth: .infinity, minHeight: 36)
                }.buttonStyle(.plain)
                Divider().frame(height: 20)
                Button(action: { tv.volUp() }) {
                    Image(systemName: "plus").frame(maxWidth: .infinity, minHeight: 36)
                }.buttonStyle(.plain)
            }
            .font(.system(size: 14, weight: .medium))
            .background(RoundedRectangle(cornerRadius: 11).fill(.quaternary))

            // Durum + TV güç
            HStack {
                Text(tv.status.isEmpty ? " " : tv.status)
                    .font(.system(size: 11)).foregroundStyle(.secondary).lineLimit(1)
                Spacer()
                Button(action: { tvOn.toggle(); tv.power(tvOn) }) {
                    Image(systemName: "power")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(tvOn ? Color.secondary : Color.red)
                }.buttonStyle(.plain).help(tvOn ? Lang.s("TV'yi kapat", "Turn TV off") : Lang.s("TV'yi aç", "Turn TV on"))
            }
        }
        .padding(16)
        .frame(width: 252)
        .onAppear {
            tokenField = Config.load().token
            speech.onText = { q = $0 }
            speech.onFinal = { q = $0; search() }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) { focused = true }
        }
        .onDisappear { speech.stop() }
    }
}

// MARK: - Menü çubuğu öğesi
final class AppDelegate: NSObject, NSApplicationDelegate, NSMenuDelegate {
    private var statusItem: NSStatusItem!
    private var popover = NSPopover()

    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.accessory)
        popover.contentSize = NSSize(width: 252, height: 430)
        popover.behavior = .transient
        popover.contentViewController = NSHostingController(rootView: PanelView())

        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        if let b = statusItem.button {
            b.image = NSImage(systemSymbolName: "tv", accessibilityDescription: "TV")
            b.action = #selector(onClick(_:))
            b.target = self
            b.sendAction(on: [.leftMouseUp, .rightMouseUp])  // sağ tık da yakalansın
        }
    }

    // Sol tık → panel; sağ tık → menü
    @objc private func onClick(_ sender: Any?) {
        if NSApp.currentEvent?.type == .rightMouseUp {
            showMenu()
        } else {
            togglePopover(sender)
        }
    }

    private func togglePopover(_ sender: Any?) {
        guard let b = statusItem.button else { return }
        if popover.isShown {
            popover.performClose(sender)
        } else {
            popover.show(relativeTo: b.bounds, of: b, preferredEdge: .minY)
            NSApp.activate(ignoringOtherApps: true)
            popover.contentViewController?.view.window?.makeKey()
        }
    }

    private func showMenu() {
        let menu = NSMenu()
        menu.delegate = self
        let quit = NSMenuItem(title: Lang.s("Çıkış", "Quit"), action: #selector(quit), keyEquivalent: "q")
        quit.target = self
        let remove = NSMenuItem(title: Lang.s("Kaldır (otomatik başlatmayı kapat)", "Remove (disable auto-start)"),
                                action: #selector(removeApp), keyEquivalent: "")
        remove.target = self
        menu.addItem(quit)
        menu.addItem(.separator())
        menu.addItem(remove)
        statusItem.menu = menu            // menüyü bağla
        statusItem.button?.performClick(nil)  // aç
    }

    // Menü kapanınca bağlantıyı çöz ki sol tık yine paneli açsın
    func menuDidClose(_ menu: NSMenu) {
        DispatchQueue.main.async { self.statusItem.menu = nil }
    }

    @objc private func quit() { NSApp.terminate(nil) }

    // Login öğesini kaldır (artık açılışta gelmez) ve uygulamadan çık
    @objc private func removeApp() {
        let alert = NSAlert()
        alert.messageText = Lang.s("TV Kumanda kaldırılsın mı?", "Remove TV Remote?")
        alert.informativeText = Lang.s(
            "Otomatik başlatma kapatılacak ve uygulama kapanacak. Tekrar açmak için ~/Applications/TVRemote.app'i çalıştırabilirsin.",
            "Auto-start will be disabled and the app will quit. Launch ~/Applications/TVRemote.app to bring it back.")
        alert.addButton(withTitle: Lang.s("Kaldır", "Remove"))
        alert.addButton(withTitle: Lang.s("Vazgeç", "Cancel"))
        NSApp.activate(ignoringOtherApps: true)
        guard alert.runModal() == .alertFirstButtonReturn else { return }
        let plist = NSHomeDirectory() + "/Library/LaunchAgents/com.zafer.tvremote.plist"
        try? FileManager.default.removeItem(atPath: plist)   // önce dosyayı sil (login'de gelmesin)
        let p = Process()
        p.launchPath = "/bin/launchctl"
        p.arguments = ["unload", plist]
        try? p.run(); p.waitUntilExit()
        NSApp.terminate(nil)
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.run()
