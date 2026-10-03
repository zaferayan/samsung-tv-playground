"use client";
import { useEffect, useRef } from "react";

/* kumanda.html'den birebir CSS (sağdaki kumanda dahil) */
const CSS = `
:root{
  --page:#eef1f5; --fg:#1a2029; --muted:#5c6773; --line:#d9dee6; --card:#fff; --card2:#f3f6f9;
  --accent:#2f6bff; --accent-ink:#fff; --on:#1a9d55; --warn:#c23b3b;
  --body1:#33343a; --body2:#17181c; --btn:#2d2e33; --btn-hi:#3a3b42; --btn-line:#45474f; --ink:#f3f5f7; --ok1:#4a4c55; --ok2:#303138;
  --f-display:"Sora",system-ui,sans-serif; --f-body:"IBM Plex Sans",system-ui,sans-serif; --f-mono:"IBM Plex Mono",ui-monospace,monospace;
  --shadow:0 1px 2px rgba(20,30,45,.06),0 10px 26px rgba(20,30,45,.08);
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --page:#0b0f16; --fg:#e7edf3; --muted:#8a95a3; --line:#222a36; --card:#141a24; --card2:#0f141d; --accent:#3b82f6; --accent-ink:#fff; color-scheme:dark;
}}
:root[data-theme="dark"]{ --page:#0b0f16; --fg:#e7edf3; --muted:#8a95a3; --line:#222a36; --card:#141a24; --card2:#0f141d; --accent:#3b82f6; --accent-ink:#fff; color-scheme:dark; }
.rwrap *{box-sizing:border-box}
.rwrap{max-width:1100px; margin:0 auto; padding:20px 18px 48px; color:var(--fg); font-family:var(--f-body); font-size:14px}
.rwrap .card{background:var(--card); border:1px solid var(--line); border-radius:16px; box-shadow:var(--shadow)}
.rwrap svg.lucide{stroke-width:2; vertical-align:middle}
.rwrap input,.rwrap select,.rwrap textarea{font:inherit; font-size:14px; color:var(--fg); background:var(--card2); border:1px solid var(--line); border-radius:10px; padding:11px 13px; width:100%}
.rwrap input:focus,.rwrap select:focus,.rwrap textarea:focus{outline:2px solid var(--accent); outline-offset:1px; border-color:transparent}
.rwrap textarea{font-family:var(--f-mono); min-height:60px; resize:vertical}
.rwrap button{font:inherit; font-weight:600; cursor:pointer; border:1px solid var(--line); background:var(--card2); color:var(--fg); border-radius:10px; padding:10px 14px}
.rwrap .primary{background:var(--accent); color:var(--accent-ink); border-color:transparent}
.rwrap .linkbtn{background:none; border:0; color:var(--accent); padding:0; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:3px}
.rwrap .linkbtn svg{width:15px; height:15px}
.rwrap .topbar{display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; margin-bottom:22px}
.rwrap .brand{display:flex; gap:13px; align-items:center}
.rwrap .logo{width:46px; height:46px; border-radius:13px; background:var(--card2); border:1px solid var(--line); display:grid; place-items:center; color:var(--accent)}
.rwrap .logo svg{width:24px; height:24px}
.rwrap h1{font-family:var(--f-display); font-size:21px; margin:0; font-weight:700}
.rwrap .sub{font-size:12.5px; color:var(--muted); margin-top:1px}
.rwrap .hdr-actions{display:flex; align-items:center; gap:4px; color:var(--muted)}
.rwrap .hbtn{background:none; border:0; color:var(--muted); font-weight:600; display:flex; align-items:center; gap:6px; padding:8px 10px; border-radius:9px; cursor:pointer}
.rwrap .hbtn:hover{color:var(--fg); background:var(--card2)}
.rwrap .hbtn svg{width:17px; height:17px}
.rwrap .hdr-actions .divider{width:1px; height:20px; background:var(--line); margin:0 4px}
.rwrap .lang{display:inline-flex; border:1px solid var(--line); border-radius:9px; overflow:hidden}
.rwrap .lang button{background:none; border:0; padding:7px 10px; font-weight:700; font-size:12px; color:var(--muted); cursor:pointer; border-radius:0}
.rwrap .lang button.active{background:var(--accent); color:var(--accent-ink)}
.rwrap .devcard{display:flex; gap:16px; align-items:center; padding:16px 18px; margin-bottom:24px}
.rwrap .thumb{width:94px; height:64px; border-radius:12px; flex:none; object-fit:cover; display:block}
.rwrap .devmeta{min-width:0}
.rwrap .devname{font-family:var(--f-display); font-weight:700; font-size:18px}
.rwrap .devrow{display:flex; align-items:center; gap:14px; margin-top:5px; font-size:13px; color:var(--muted); flex-wrap:wrap}
.rwrap .dot{width:9px; height:9px; border-radius:50%; background:#9aa4b0; display:inline-block; margin-right:6px}
.rwrap .dot.on{background:var(--on)} .rwrap .dot.off{background:#9aa4b0}
.rwrap .devselect{margin-top:11px; max-width:300px}
.rwrap .hero h2{font-family:var(--f-display); font-size:28px; margin:0 0 4px; font-weight:700; letter-spacing:-.02em}
.rwrap .hero p{margin:0 0 16px; color:var(--muted)}
.rwrap .search{position:relative; margin-bottom:12px}
.rwrap .search .mag{position:absolute; left:18px; top:50%; transform:translateY(-50%); width:20px; height:20px; color:var(--muted); pointer-events:none}
.rwrap .search input{height:58px; border-radius:14px; padding-left:48px; padding-right:64px; font-size:15px}
.rwrap .search .go{position:absolute; right:8px; top:50%; transform:translateY(-50%); width:44px; height:44px; border-radius:11px; background:var(--accent); color:#fff; border:0; display:grid; place-items:center; cursor:pointer}
.rwrap .search .go svg{width:20px; height:20px}
.rwrap .searchsub{font-size:12.5px; color:var(--muted); margin-bottom:22px}
.rwrap .tiles{display:grid; grid-template-columns:repeat(auto-fit,minmax(118px,1fr)); gap:12px; margin-bottom:24px}
.rwrap .tile{display:flex; flex-direction:column; align-items:center; gap:10px; padding:16px 10px; background:var(--card2); border:1px solid var(--line); border-radius:14px; cursor:pointer; transition:transform .06s,border-color .1s}
.rwrap .tile:hover{transform:translateY(-2px); border-color:var(--accent)}
.rwrap .brandimg{width:48px; height:48px; border-radius:12px; display:block}
.rwrap .tl{font-size:12.5px; color:var(--fg); font-weight:500}
.rwrap .twocol{display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px}
@media (max-width:560px){ .rwrap .twocol{grid-template-columns:1fr} }
.rwrap .block{padding:16px}
.rwrap .block h3{font-family:var(--f-display); font-size:15px; margin:0 0 3px; display:flex; gap:8px; align-items:baseline; flex-wrap:wrap}
.rwrap .block .cap{font-size:12px; color:var(--muted); margin:0 0 12px; font-weight:400}
.rwrap .seg-wrap{display:flex; gap:10px; flex-wrap:wrap}
.rwrap .seg{flex:1 1 90px; min-width:0; display:flex; align-items:center; justify-content:center; gap:9px; padding:14px 10px; border-radius:12px; background:var(--card2); border:1px solid var(--line); color:var(--fg); font-weight:600; font-size:14px; cursor:pointer; transition:background .1s,border-color .1s,color .1s,box-shadow .1s}
.rwrap .seg:hover{border-color:var(--accent)}
.rwrap .seg.active{background:var(--accent); color:var(--accent-ink); border-color:transparent; box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 28%,transparent)}
.rwrap .seg svg{width:18px; height:18px; flex:none}
.rwrap .seg span{overflow:hidden; text-overflow:ellipsis; white-space:nowrap}
.rwrap .chrow{display:flex; gap:10px}
.rwrap .prefixed{position:relative; flex:1; min-width:0}
.rwrap .prefixed .pfx{position:absolute; left:13px; top:50%; transform:translateY(-50%); color:var(--muted); font-weight:600}
.rwrap .prefixed input{padding-left:30px}
.rwrap .volcard{padding:16px; margin-bottom:16px}
.rwrap .volrow{display:flex; align-items:center; gap:12px; margin-top:12px}
.rwrap .volrow input[type=range]{accent-color:var(--accent); flex:1; background:transparent; border:0; padding:0}
.rwrap .volrow>svg{width:20px; height:20px; color:var(--muted); flex:none}
.rwrap .vol-val{font-family:var(--f-mono); min-width:2.5ch; text-align:right}
.rwrap .iconbtn{width:44px; height:44px; display:grid; place-items:center; border-radius:10px; padding:0; flex:none}
.rwrap .iconbtn svg{width:18px; height:18px}
.rwrap .acc{margin-bottom:12px}
.rwrap .acc summary{list-style:none; cursor:pointer; display:flex; align-items:center; gap:10px; padding:15px 16px; font-family:var(--f-display); font-weight:600; font-size:14px}
.rwrap .acc summary::-webkit-details-marker{display:none}
.rwrap .acc summary svg{width:18px; height:18px; color:var(--muted)}
.rwrap .acc summary .chev{margin-left:auto; transition:transform .15s}
.rwrap .acc[open] summary .chev{transform:rotate(180deg)}
.rwrap .acc .acc-body{padding:0 16px 16px}
.rwrap .row{display:flex; gap:10px; flex-wrap:wrap; align-items:end}
.rwrap .row>.grow{flex:1 1 150px; min-width:0}
.rwrap label{display:block; font-size:11px; font-weight:600; letter-spacing:.03em; text-transform:uppercase; color:var(--muted); margin:0 0 5px}
.rwrap #log{font-family:var(--f-mono); font-size:12px; line-height:1.6; max-height:160px; overflow:auto; margin:12px 0 0; white-space:pre-wrap; word-break:break-word; color:var(--muted)}
.rwrap #log .ok{color:var(--on)} .rwrap #log .err{color:var(--warn)} .rwrap #log b{color:var(--fg); font-weight:500}
.rwrap .hintlink{font-size:12px; color:var(--muted); margin-top:11px}.rwrap .hintlink a{color:var(--accent)}
#toast{position:fixed; left:50%; bottom:18px; transform:translateX(-50%) translateY(20px); background:var(--card); border:1px solid var(--line); box-shadow:var(--shadow); color:var(--fg); padding:10px 16px; border-radius:12px; font-size:13px; opacity:0; transition:opacity .2s,transform .2s; pointer-events:none; z-index:50; max-width:90vw}
#toast.show{opacity:1; transform:translateX(-50%) translateY(0)}
.rwrap .disabled-area{opacity:.5; pointer-events:none; filter:grayscale(.3)}
.rwrap .layout{display:grid; grid-template-columns:minmax(0,1fr) 250px; gap:28px; align-items:start}
.rwrap .left{min-width:0}
.rwrap .right{position:sticky; top:16px; justify-self:center}
@media (max-width:860px){ .rwrap .layout{grid-template-columns:1fr} .rwrap .right{position:static} }
/* ================= SAĞDAKİ KUMANDA — DOKUNULMADI ================= */
.rwrap .remote{position:relative; width:238px; background:linear-gradient(170deg,var(--body1),var(--body2) 72%);
  border-radius:40px; padding:22px 18px 34px; box-shadow:0 16px 40px rgba(0,0,0,.33), inset 0 1px 0 rgba(255,255,255,.05);
  display:flex; flex-direction:column; align-items:center; gap:16px; user-select:none; transition:opacity .2s}
.rwrap .remote.off{opacity:.45; pointer-events:none; filter:grayscale(.4)}
.rwrap .ib{background:transparent;border:0;padding:0;cursor:pointer;display:block;line-height:0;
  transition:transform .05s,filter .1s;-webkit-tap-highlight-color:transparent}
.rwrap .ib:hover{filter:brightness(1.1)} .rwrap .ib:active{transform:translateY(1px) scale(.95)}
.rwrap .ib img{display:block;width:100%;height:auto;pointer-events:none}
.rwrap .topline{display:flex;width:100%;justify-content:center}
.rwrap .power{width:72px}
.rwrap .row3{display:flex;width:100%;justify-content:space-between;align-items:center}
.rwrap .k{width:52px} .rwrap .m{width:50px}
.rwrap .ringwrap{position:relative;width:168px;height:170px;display:grid;place-items:center;touch-action:none;cursor:pointer}
.rwrap .ringimg{width:168px;display:block;pointer-events:none}
.rwrap .okbtn{position:absolute;width:90px;height:90px;border:0;background:transparent;padding:0;cursor:pointer;border-radius:50%;z-index:2;line-height:0}
.rwrap .okbtn img{width:90px;display:block;pointer-events:none}
.rwrap .okbtn:active{transform:scale(.96)}
.rwrap .dflash{position:absolute;inset:0;display:grid;place-items:center;font-size:33px;color:var(--accent);opacity:0;transition:opacity .2s;pointer-events:none;z-index:3}
.rwrap .vc{position:relative;width:184px}
.rwrap .vc>img{width:184px;display:block;pointer-events:none}
.rwrap .vz{position:absolute;top:-6px;height:calc(100% + 12px);background:transparent;border:0;cursor:pointer;border-radius:12px;-webkit-tap-highlight-color:transparent}
.rwrap .vz:active{background:rgba(255,255,255,.1)}
.rwrap .apps{position:relative;width:192px;height:130px;margin-top:2px}
.rwrap .appbtn{position:absolute;width:58px;border:0;background:transparent;padding:0;cursor:pointer;line-height:0;-webkit-tap-highlight-color:transparent;transition:transform .05s}
.rwrap .appbtn img{width:58px;display:block;pointer-events:none}
.rwrap .appbtn:active{transform:scale(.95)}
.rwrap .appbtn.netflix{left:0;top:38px} .rwrap .appbtn.prime{left:67px;top:0}
.rwrap .appbtn.disney{left:134px;top:38px} .rwrap .appbtn.youtube{left:67px;top:74px}
.rwrap .rcaption{font-size:11px;color:var(--muted);text-align:center;margin-top:10px}
.rwrap .led{width:7px;height:7px;border-radius:50%;background:#202126;box-shadow:inset 0 0 2px rgba(0,0,0,.7);
  transition:background .08s,box-shadow .08s;flex:none}
.rwrap .led.on{background:#ff3b30;box-shadow:0 0 10px 3px rgba(255,59,48,.9),0 0 4px rgba(255,130,120,.95)}
@media (prefers-reduced-motion:reduce){ .rwrap .led{transition:none} }
`;

/* GitHub Pages alt-yolu: asset'ler (/icons, /lib) bu önekle servis edilir */
const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

/* kumanda.html body markup — birebir (token girişi üst bardan, client-side) */
const HTML = `
<div class="rwrap">
  <header class="topbar">
    <div class="brand">
      <div class="logo"><i data-lucide="tv"></i></div>
      <div><h1 data-i18n="appTitle">Samsung Kumanda</h1><div class="sub" data-i18n="appSub">TV'niz, kontrolünüzde.</div></div>
    </div>
    <div class="hdr-actions">
      <div class="lang" id="lang">
        <button data-lang="tr">TR</button>
        <button data-lang="en">EN</button>
      </div>
      <span class="divider"></span>
      <button class="hbtn" id="theme"><i data-lucide="sun"></i> <span data-i18n="theme">Tema</span></button>
    </div>
  </header>

  <div class="layout">
    <div class="left">
      <div class="card devcard">
        <img class="thumb" src="${BP}/icons/tv.png" alt="TV">
        <div class="devmeta">
          <div class="devname" id="devName" data-i18n="noDevice">Cihaz seçilmedi</div>
          <div class="devrow">
            <span><span class="dot off" id="devDot"></span><span id="devStatus">Bağlı değil</span></span>
            <button class="linkbtn" id="devChange"><span data-i18n="changeDevice">Cihazı değiştir</span> <i data-lucide="chevron-right"></i></button>
          </div>
          <div class="devselect" id="devSelectWrap" hidden><select id="device"><option value="">—</option></select></div>
        </div>
      </div>

      <div class="hero">
        <h2 data-i18n="heroTitle">Ne izlemek istersin?</h2>
        <p data-i18n="heroSub">Favori uygulamana hızlıca eriş veya istediğin içeriği ara.</p>
      </div>

      <div class="search needs-conn">
        <i class="mag" data-lucide="search"></i>
        <input id="searchQ" data-i18n-ph="searchPh" placeholder="İçerik veya uygulama ara" spellcheck="false">
        <button id="ytGo" class="go" title="YouTube" aria-label="Ara"><i data-lucide="arrow-right"></i></button>
      </div>
      <div class="searchsub needs-conn"><span data-i18n="searchSub1">YouTube'da aratır · </span><button class="linkbtn" id="searchGo" data-i18n="searchWeb">web'de ara</button></div>

      <div class="tiles needs-conn">
        <button class="tile" data-app="Netflix" data-appid="3201907018807"><img class="brandimg" src="${BP}/icons/brands/netflix.png" alt="Netflix"><span class="tl">Netflix</span></button>
        <button class="tile" data-app="Prime Video" data-appid="3201910019365"><img class="brandimg" src="${BP}/icons/brands/prime-video.png" alt="Prime Video"><span class="tl">Prime Video</span></button>
        <button class="tile" data-app="Disney+ Hotstar" data-appid="3201901017640"><img class="brandimg" src="${BP}/icons/brands/disney-plus.png" alt="Disney+"><span class="tl">Disney+</span></button>
        <button class="tile" data-app="YouTube" data-appid="111299001912"><img class="brandimg" src="${BP}/icons/brands/youtube.png" alt="YouTube"><span class="tl">YouTube</span></button>
        <button class="tile" data-app="Spotify" data-appid="3201606009684"><img class="brandimg" src="${BP}/icons/brands/spotify.png" alt="Spotify"><span class="tl">Spotify</span></button>
      </div>
      <div class="searchsub needs-conn" style="margin-top:-14px" data-i18n="appHint">İpucu: YouTube'ta yazıp arayabilirsin. Diğer uygulamalar tıklayınca açılır.</div>

      <div class="card block needs-conn" style="margin-bottom:14px">
        <h3><i data-lucide="home" style="color:var(--accent)"></i> <span data-i18n="arrivalTitle">Eve gelince</span> <span class="cap" data-i18n="arrivalCap">TV aç → YouTube'da ara → ilk videoyu oynat.</span></h3>
        <div class="chrow">
          <input id="arrQ" value="" spellcheck="false" style="flex:1">
          <button id="arrGo" class="primary"><i data-lucide="play"></i> <span data-i18n="playBtn">Çal</span></button>
        </div>
      </div>

      <div class="twocol">
        <div class="card block needs-conn">
          <h3><span data-i18n="srcTitle">Kaynak</span> <span class="cap" data-i18n="srcCap">Giriş kaynağını seç.</span></h3>
          <div class="seg-wrap" id="srcSeg"><span class="cap">—</span></div>
        </div>
        <div class="card block needs-conn">
          <h3><span data-i18n="chTitle">Kanal</span> <span class="cap" data-i18n="chCap">Kanal numarasını gir.</span></h3>
          <div class="chrow">
            <div class="prefixed"><span class="pfx">#</span><input id="chNum" inputmode="numeric" data-i18n-ph="chPh" placeholder="Kanal no (örn. 5)"></div>
            <button id="chGo" class="primary" data-i18n="go">Git</button>
          </div>
        </div>
      </div>

      <div class="card volcard needs-conn">
        <h3 style="font-family:var(--f-display);font-size:15px;margin:0"><span data-i18n="volTitle">Ses düzeyi</span> <span class="cap" style="font-weight:400;color:var(--muted)" data-i18n="volCap">TV'nin ses seviyesini ayarla.</span></h3>
        <div class="volrow">
          <i data-lucide="volume-2"></i>
          <input type="range" id="vol" min="0" max="100" value="10">
          <span class="vol-val" id="volLabel">10</span>
          <button id="muteBtn" class="iconbtn"><i data-lucide="volume-x"></i></button>
        </div>
      </div>

      <details class="card acc">
        <summary><i data-lucide="sliders-horizontal"></i> <span data-i18n="accAdv">Gelişmiş kontroller</span> <i class="chev" data-lucide="chevron-down"></i></summary>
        <div class="acc-body">
          <div class="row">
            <div class="grow"><label for="rCap">capability</label><input id="rCap" value="samsungvd.remoteControl" spellcheck="false"></div>
            <div class="grow"><label for="rCmd">command</label><input id="rCmd" value="send" spellcheck="false"></div>
          </div>
          <div style="margin-top:9px"><label for="rArgs">arguments (JSON)</label><textarea id="rArgs" spellcheck="false">["HOME","PRESS_AND_RELEASED"]</textarea></div>
          <div style="margin-top:9px"><button id="rSend" class="primary" data-i18n="send">Gönder</button></div>
          <pre id="log"></pre>
        </div>
      </details>
    </div>

    <aside class="right">
      <div class="remote off" id="remote">
        <div class="topline">
          <button class="ib power" id="power" title="Güç" aria-label="Güç"><img src="${BP}/icons/01-guc.png" alt="Güç"></button>
        </div>
        <div class="row3">
          <button class="ib k" data-key="MENU" title="123 / Menü" aria-label="Menü"><img src="${BP}/icons/02-ayarlar-123.png" alt="123 / Menü"></button>
          <span class="led" id="led" title="Gösterge ışığı"></span>
          <button class="ib k" id="mic" title="Sesle ara" aria-label="Mikrofon"><img src="${BP}/icons/03-mikrofon.png" alt="Mikrofon"></button>
        </div>
        <div class="ringwrap" id="dring">
          <img class="ringimg" src="${BP}/icons/04-yon-halkasi.png" alt="Yön halkası">
          <button class="okbtn" id="ok" data-key="OK" title="OK" aria-label="OK"><img src="${BP}/icons/05-tamam.png" alt="OK"></button>
          <span class="dflash" id="dflash"></span>
        </div>
        <div class="row3" style="justify-content:space-evenly">
          <button class="ib m" data-key="BACK" title="Geri" aria-label="Geri"><img src="${BP}/icons/06-geri.png" alt="Geri"></button>
          <button class="ib m" data-key="HOME" title="Ana ekran" aria-label="Home"><img src="${BP}/icons/07-ana-sayfa.png" alt="Ana ekran"></button>
          <button class="ib m" id="playpause" title="Oynat / Duraklat" aria-label="Oynat Duraklat"><img src="${BP}/icons/08-oynat-duraklat.png" alt="Oynat Duraklat"></button>
        </div>
        <div class="vc" title="Ses (sol) / Kanal (sağ)">
          <img src="${BP}/icons/09-ses-kanal.png" alt="Ses / Kanal">
          <button class="vz" style="left:1%;width:23%"  data-cap="audioVolume" data-cmd="volumeDown" aria-label="Ses azalt"></button>
          <button class="vz" style="left:25%;width:23%" data-cap="audioVolume" data-cmd="volumeUp"   aria-label="Ses artır"></button>
          <button class="vz" style="left:52%;width:23%" data-cap="tvChannel"  data-cmd="channelDown" aria-label="Kanal azalt"></button>
          <button class="vz" style="left:76%;width:23%" data-cap="tvChannel"  data-cmd="channelUp"   aria-label="Kanal artır"></button>
        </div>
        <div class="apps">
          <button class="appbtn netflix" data-app="Netflix" data-appid="3201907018807" title="Netflix"><img src="${BP}/icons/10-netflix.png" alt="Netflix"></button>
          <button class="appbtn prime" data-app="Prime Video" data-appid="3201910019365" title="Prime Video"><img src="${BP}/icons/11-prime-video.png" alt="Prime Video"></button>
          <button class="appbtn disney" data-app="Disney+ Hotstar" data-appid="3201901017640" title="Disney+ Hotstar"><img src="${BP}/icons/12-disney-hotstar.png" alt="Disney+ Hotstar"></button>
          <button class="appbtn youtube" data-app="YouTube" data-appid="111299001912" title="YouTube"><img src="${BP}/icons/13-youtube.png" alt="YouTube"></button>
        </div>
      </div>
      <div class="rcaption" data-i18n="remoteHint">Halka: dokun = OK · kaydır = yön · Ses/Kanal çubuğu: sol = −, sağ = +</div>
    </aside>
  </div>
</div>
<div id="toast"></div>
`;

export default function RemotePage() {
  const inited = useRef(false);

  useEffect(() => {
    if (inited.current) return;
    inited.current = true;

    const run = () => wireRemote();
    const w = window as unknown as { lucide?: unknown };
    if (w.lucide) {
      run();
    } else {
      const s = document.createElement("script");
      s.src = `${BP}/lib/lucide.min.js`;
      s.onload = run;
      document.body.appendChild(s);
    }
  }, []);

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div dangerouslySetInnerHTML={{ __html: HTML }} />
    </div>
  );
}

/* ================= kumanda.html script — proxy'ye uyarlanmış ================= */
/* Fark: API artık /api/st (token sunucuda), token/connect/forget kaldırıldı, cihazlar otomatik yüklenir. */
function wireRemote() {
  const anyWin = window as any;
  const $ = (s: string): any => document.querySelector(s);
  const LS = {
    get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch {} },
    del: (k: string) => { try { localStorage.removeItem(k); } catch {} },
  };
  let deviceId = "", blockedUntil = 0, lastKeyTs = 0, powerState: any = null, playState: any = null, toastTimer: any = null;

  const I18N: any = {
    tr: { appTitle: "Samsung Kumanda", appSub: "TV'niz, kontrolünüzde.", theme: "Tema", settings: "Ayarlar",
      noDevice: "Cihaz seçilmedi", notConnected: "Bağlı değil", connected: "Bağlı", changeDevice: "Cihazı değiştir",
      heroTitle: "Ne izlemek istersin?", heroSub: "Favori uygulamana hızlıca eriş veya istediğin içeriği ara.",
      searchPh: "İçerik veya uygulama ara", searchSub1: "YouTube'da aratır · ", searchWeb: "web'de ara",
      srcTitle: "Kaynak", srcCap: "Giriş kaynağını seç.", chTitle: "Kanal", chCap: "Kanal numarasını gir.", chPh: "Kanal no (örn. 5)", go: "Git",
      volTitle: "Ses düzeyi", volCap: "TV'nin ses seviyesini ayarla.", accConn: "Bağlantı ayarları", accAdv: "Gelişmiş kontroller",
      send: "Gönder", logDefault: "Üstteki alana SmartThings token'ını gir.", remoteHint: "Halka: dokun = OK · kaydır = yön · Ses/Kanal çubuğu: sol = −, sağ = +",
      loadingDevices: "cihazlar yükleniyor…", noTv: "TV bulunamadı", connectFirst: "Cihaz bulunamadı.", cleared: "silindi",
      enterQuery: "Arama metni gir.", enterChannel: "Geçerli kanal no gir.", micUnsupported: "Bu tarayıcı sesli aramayı desteklemiyor.",
      micListening: "🎤 Dinleniyor… konuş", argsJson: 'arguments JSON dizisi olmalı, örn. ["HOME","PRESS_AND_RELEASED"]', rateLimit: "Hız sınırı", deviceGeneric: "Cihaz", appHint: "İpucu: YouTube'ta yazıp arayabilirsin. Diğer uygulamalar tıklayınca açılır (uygulama içi arama bulut API'sinde yok).", arrivalTitle: "Eve gelince", arrivalCap: "TV aç → YouTube'da ara → ilk videoyu oynat.", playBtn: "Çal", appNoSearch: "uygulama içi arama bulut API'sinde yok, uygulama açılıyor" },
    en: { appTitle: "Samsung Remote", appSub: "Your TV, in your hands.", theme: "Theme", settings: "Settings",
      noDevice: "No device selected", notConnected: "Not connected", connected: "Connected", changeDevice: "Change device",
      heroTitle: "What do you want to watch?", heroSub: "Jump to a favorite app or search for content.",
      searchPh: "Search content or apps", searchSub1: "Searches YouTube · ", searchWeb: "search the web",
      srcTitle: "Source", srcCap: "Choose the input source.", chTitle: "Channel", chCap: "Enter the channel number.", chPh: "Channel no (e.g. 5)", go: "Go",
      volTitle: "Volume", volCap: "Adjust the TV volume.", accConn: "Connection settings", accAdv: "Advanced controls",
      send: "Send", logDefault: "Enter your SmartThings token in the top bar.", remoteHint: "Ring: tap = OK · swipe = direction · Vol/Ch bar: left = −, right = +",
      loadingDevices: "loading devices…", noTv: "No TV found", connectFirst: "No device found.", cleared: "cleared",
      enterQuery: "Enter search text.", enterChannel: "Enter a valid channel no.", micUnsupported: "This browser doesn't support voice search.",
      micListening: "🎤 Listening… speak", argsJson: 'arguments must be a JSON array, e.g. ["HOME","PRESS_AND_RELEASED"]', rateLimit: "Rate limit", deviceGeneric: "Device", appHint: "Tip: you can search inside YouTube. Other apps just open on tap (no in-app search via the cloud).", arrivalTitle: "When I get home", arrivalCap: "Turn on TV → search YouTube → play first video.", playBtn: "Play", appNoSearch: "in-app search isn't available via the cloud, opening the app" },
  };
  let lang = (LS.get("st_lang") || ((navigator.language || "tr").slice(0, 2) === "en" ? "en" : "tr"));
  if (!I18N[lang]) lang = "tr";
  const t = (k: string) => (I18N[lang] && I18N[lang][k]) || I18N.tr[k] || k;
  const icons = () => { try { if (anyWin.lucide) anyWin.lucide.createIcons(); } catch {} };
  const applyI18n = () => {
    document.querySelectorAll("[data-i18n]").forEach((e: any) => (e.textContent = t(e.dataset.i18n)));
    document.querySelectorAll("[data-i18n-ph]").forEach((e: any) => (e.placeholder = t(e.dataset.i18nPh)));
  };
  function setLang(l: string) {
    lang = I18N[l] ? l : "tr"; LS.set("st_lang", lang); document.documentElement.lang = lang;
    document.querySelectorAll("#lang button").forEach((b: any) => b.classList.toggle("active", b.dataset.lang === lang));
    applyI18n();
    if (!deviceId) $("#devName").textContent = t("noDevice");
    $("#devStatus").textContent = deviceId ? t("connected") : t("notConnected");
  }

  function log(msg: string, cls?: string) {
    const el = $("#log");
    if (el) { const ts = new Date().toLocaleTimeString(lang === "en" ? "en-US" : "tr-TR"); const d = document.createElement("div"); if (cls) d.className = cls; d.innerHTML = `<b>${ts}</b>  ${msg}`; if (el.firstChild && el.firstChild.nodeType === 3) el.textContent = ""; el.prepend(d); }
    const tt = $("#toast"); if (tt) { tt.innerHTML = msg; tt.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => tt.classList.remove("show"), 2200); }
  }
  const blockedMs = () => Math.max(0, blockedUntil - Date.now());

  async function call(path: string, opts: any = {}) {
    const token = LS.get("st_token") || "";
    const res = await fetch("https://api.smartthings.com/v1" + path, { ...opts, headers: { Authorization: "Bearer " + token, "Content-Type": "application/json", ...(opts.headers || {}) } });
    const text = await res.text(); let body: any; try { body = text ? JSON.parse(text) : null; } catch { body = text; }
    if (res.status === 429) { const mm = JSON.stringify(body || "").match(/retry in\s+(\d+)\s*millis/i); const ms = mm ? parseInt(mm[1], 10) : 15000; blockedUntil = Date.now() + ms + 500; throw new Error(`429 · ${t("rateLimit")} ${Math.ceil(ms / 1000)} sn`); }
    if (!res.ok) { const m = (body && (body.error?.message || body.message)) || res.statusText; throw new Error(res.status + " " + m); }
    return body;
  }
  let refreshTimer: any = null;
  const scheduleRefresh = (d = 1200) => { clearTimeout(refreshTimer); refreshTimer = setTimeout(() => { if (!blockedMs()) refreshStatus(); }, d); };
  const blinkLed = () => { const l = $("#led"); if (!l) return; l.classList.add("on"); clearTimeout(l._t); l._t = setTimeout(() => l.classList.remove("on"), 180); };

  async function sendCommand(capability: string, command: string, args: any[] = [], refresh = true) {
    if (!deviceId) { log(t("connectFirst"), "err"); return; }
    const w = blockedMs(); if (w) { log(`⏳ ${t("rateLimit")}: ${Math.ceil(w / 1000)} sn`, "err"); return; }
    blinkLed();
    try { await call(`/devices/${deviceId}/commands`, { method: "POST", body: JSON.stringify({ commands: [{ component: "main", capability, command, arguments: args }] }) });
      log(`✓ <b>${command}</b>${args.length ? " (" + JSON.stringify(args) + ")" : ""}`, "ok"); if (refresh) scheduleRefresh();
    } catch (e: any) { log("✗ " + command + " → " + e.message, "err"); }
  }
  function sendKey(key: string) { const n = Date.now(); if (n - lastKeyTs < 220) return; lastKeyTs = n; sendCommand("samsungvd.remoteControl", "send", [key, "PRESS_AND_RELEASED"], false); }
  const tvSearch = (q: string, url?: string) => sendCommand("custom.tvsearch", "search", [q, url || ""], false);

  const capsOf = (it: any) => (it.components || []).flatMap((c: any) => (c.capabilities || []).map((x: any) => x.id));
  const isTv = (d: any) => { const n = (d.deviceTypeName || "") + (d.ocf?.ocfDeviceType || ""); return /tv/i.test(n) || capsOf(d).includes("tvChannel") || capsOf(d).includes("samsungvd.remoteControl"); };
  async function loadDevices() {
    log(t("loadingDevices"));
    try {
      const data = await call("/devices"); const items = data.items || []; const tvs = items.filter(isTv); const list = tvs.length ? tvs : items;
      const sel = $("#device"); sel.innerHTML = ""; list.forEach((d: any) => { const o = document.createElement("option"); o.value = d.deviceId; o.textContent = d.label || d.name; sel.appendChild(o); });
      const saved = LS.get("st_device"); sel.value = (saved && list.some((d: any) => d.deviceId === saved)) ? saved : (list[0]?.deviceId || ""); deviceId = sel.value;
      $("#devName").textContent = sel.options[sel.selectedIndex]?.textContent || t("deviceGeneric");
      if (deviceId) { setOn(true); log("✓", "ok"); refreshStatus(); } else { setOn(false); log(t("noTv"), "err"); }
    } catch (e: any) { log("✗ " + e.message, "err"); setOn(false); }
  }
  const val = (m: any, c: string, a: string) => { try { return m[c][a].value; } catch { return null; } };
  const srcLabel = (id: any) => id === "dtv" ? "TV" : String(id).replace(/HDMI(\d)/, "HDMI $1");
  const escapeHtml = (s: any) => String(s).replace(/[&<>"]/g, (c: string) => (({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" } as any)[c]));
  function segIcon(id: any, label: any) {
    const s = ((id || "") + " " + (label || "")).toLowerCase();
    if (/ps5|ps4|playstation|xbox|nintendo|switch|game/.test(s)) return '<i data-lucide="gamepad-2"></i>';
    if (/hdmi/.test(s)) return '<i data-lucide="hdmi-port"></i>';
    if (/tv|dtv|digital|tuner/.test(s)) return '<i data-lucide="tv"></i>';
    if (/usb/.test(s)) return '<i data-lucide="usb"></i>';
    if (/hdd|disk|media|dlna/.test(s)) return '<i data-lucide="hard-drive"></i>';
    return '<i data-lucide="monitor"></i>';
  }
  function fillSrc(arr: any[], cur: any) {
    const box = $("#srcSeg"); if (!box) return; box.innerHTML = "";
    arr.forEach((s: any) => { const b = document.createElement("button"); b.type = "button"; b.className = "seg" + (s.id === cur ? " active" : ""); b.dataset.src = s.id;
      b.innerHTML = segIcon(s.id, s.label) + `<span>${escapeHtml(s.label || s.id)}</span>`;
      b.addEventListener("click", () => sendCommand("mediaInputSource", "setInputSource", [s.id])); box.appendChild(b); });
    icons();
  }
  async function refreshStatus() {
    if (!deviceId) return;
    try {
      const st = await call(`/devices/${deviceId}/status`); const m = st.components?.main || {};
      powerState = val(m, "switch", "switch"); playState = val(m, "mediaPlayback", "playbackStatus");
      const v = val(m, "audioVolume", "volume"); const muted = val(m, "audioMute", "mute") === "muted";
      const src = val(m, "mediaInputSource", "inputSource") || val(m, "samsungvd.mediaInputSource", "inputSource");
      if (v != null) { $("#vol").value = v; $("#volLabel").textContent = v; }
      $("#muteBtn").innerHTML = `<i data-lucide="${muted ? "volume-2" : "volume-x"}"></i>`; icons();
      const smap = val(m, "samsungvd.mediaInputSource", "supportedInputSourcesMap"); const sup = val(m, "mediaInputSource", "supportedInputSources");
      if (Array.isArray(smap) && smap.length) fillSrc(smap.map((x: any) => ({ id: x.id, label: x.name || srcLabel(x.id) })), src);
      else if (Array.isArray(sup) && sup.length) fillSrc(sup.map((x: any) => ({ id: x, label: srcLabel(x) })), src);
      else fillSrc([{ id: "dtv", label: "TV" }, { id: "HDMI1", label: "HDMI 1" }, { id: "HDMI2", label: "HDMI 2" }], src);
    } catch {}
  }
  function setOn(on: boolean) {
    $("#remote").classList.toggle("off", !on);
    document.querySelectorAll(".needs-conn").forEach((c: any) => c.classList.toggle("disabled-area", !on));
    const dot = $("#devDot"), stt = $("#devStatus"); if (dot) dot.className = "dot " + (on ? "on" : "off"); if (stt) stt.textContent = on ? t("connected") : t("notConnected");
  }

  /* ===== KUMANDA JS ===== */
  document.querySelectorAll("[data-key]").forEach((b: any) => b.addEventListener("click", () => sendKey(b.dataset.key)));
  document.querySelectorAll("[data-cap][data-cmd]").forEach((b: any) => b.addEventListener("click", () => sendCommand(b.dataset.cap, b.dataset.cmd, [])));
  document.querySelectorAll(".appbtn[data-app]").forEach((b: any) => b.addEventListener("click", () => sendCommand("custom.launchapp", "launchApp", [b.dataset.appid || "", b.dataset.app], false)));
  document.querySelectorAll(".tile[data-app]").forEach((b: any) => b.addEventListener("click", () => {
    const q = $("#searchQ").value.trim(), app = b.dataset.app, appid = b.dataset.appid || "";
    if (q && app === "YouTube") { tvSearch(q, "https://www.youtube.com/results?search_query=" + encodeURIComponent(q)); }
    else { if (q) log(app + ": " + t("appNoSearch")); sendCommand("custom.launchapp", "launchApp", [appid, app], false); }
  }));
  $("#power").addEventListener("click", () => { powerState = powerState === "on" ? "off" : "on"; sendCommand("switch", powerState, []); });
  $("#playpause").addEventListener("click", () => { const key = playState === "playing" ? "PAUSE" : "PLAY"; playState = playState === "playing" ? "paused" : "playing"; sendKey(key); });
  $("#mic").addEventListener("click", () => {
    const SR = anyWin.SpeechRecognition || anyWin.webkitSpeechRecognition;
    if (!SR) { log(t("micUnsupported"), "err"); return; }
    if (!deviceId) { log(t("connectFirst"), "err"); return; }
    try {
      const r = new SR(); r.lang = lang === "en" ? "en-US" : "tr-TR"; r.interimResults = false; r.maxAlternatives = 1;
      blinkLed(); log(t("micListening"));
      r.onresult = (e: any) => { const txt = (e.results[0][0].transcript || "").trim(); if (txt) { $("#searchQ").value = txt; tvSearch(txt, "https://www.youtube.com/results?search_query=" + encodeURIComponent(txt)); log("🎤 " + txt, "ok"); } };
      r.onerror = (ev: any) => log("🎤 " + ev.error, "err");
      r.start();
    } catch { log(t("micUnsupported"), "err"); }
  });
  (function () { const ring = $("#dring"), ok = $("#ok");
    const dir = (x: number, y: number) => Math.abs(x) > Math.abs(y) ? (x > 0 ? "RIGHT" : "LEFT") : (y > 0 ? "DOWN" : "UP");
    let sx = 0, sy = 0, act = false;
    ring.addEventListener("pointerdown", (e: any) => { if (ok.contains(e.target)) return; act = true; sx = e.clientX; sy = e.clientY; try { ring.setPointerCapture(e.pointerId); } catch {} });
    ring.addEventListener("pointerup", (e: any) => { if (!act) return; act = false; const dx = e.clientX - sx, dy = e.clientY - sy; let key;
      if (Math.abs(dx) < 16 && Math.abs(dy) < 16) { const r = ring.getBoundingClientRect(); key = dir(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)); } else key = dir(dx, dy);
      sendKey(key); });
    ring.addEventListener("pointercancel", () => (act = false)); ring.addEventListener("contextmenu", (e: any) => e.preventDefault());
  })();

  /* ===== SOL PANEL ===== */
  $("#ytGo").addEventListener("click", () => { const q = $("#searchQ").value.trim(); if (!q) { log(t("enterQuery"), "err"); return; } tvSearch(q, "https://www.youtube.com/results?search_query=" + encodeURIComponent(q)); });
  $("#searchGo").addEventListener("click", () => { const q = $("#searchQ").value.trim(); if (!q) { log(t("enterQuery"), "err"); return; } tvSearch(q, ""); });
  $("#searchQ").addEventListener("keydown", (e: any) => { if (e.key === "Enter") { e.preventDefault(); $("#ytGo").click(); } });
  $("#chGo").addEventListener("click", () => { const n = $("#chNum").value.trim(); if (!/^\d+$/.test(n)) { log(t("enterChannel"), "err"); return; } sendCommand("tvChannel", "setTvChannel", [n]); });
  $("#chNum").addEventListener("keydown", (e: any) => { if (e.key === "Enter") { e.preventDefault(); $("#chGo").click(); } });
  $("#vol").addEventListener("input", (e: any) => ($("#volLabel").textContent = e.target.value));
  $("#vol").addEventListener("change", (e: any) => sendCommand("audioVolume", "setVolume", [parseInt(e.target.value, 10)]));
  $("#muteBtn").addEventListener("click", () => sendCommand("audioMute", "mute", []));
  $("#rSend").addEventListener("click", () => { let a; try { a = JSON.parse($("#rArgs").value || "[]"); if (!Array.isArray(a)) throw 0; } catch { log(t("argsJson"), "err"); return; } sendCommand($("#rCap").value.trim(), $("#rCmd").value.trim(), a); });

  async function playFirstYouTube(q: string) {
    if (!deviceId) { log(t("connectFirst"), "err"); return; }
    const wasOff = powerState !== "on";
    await sendCommand("switch", "on", [], false);
    if (wasOff) log("📺 TV açılıyor…");
    await new Promise((r) => setTimeout(r, wasOff ? 15000 : 800));
    tvSearch(q, "https://www.youtube.com/results?search_query=" + encodeURIComponent(q));
    log("🎬 " + q, "ok");
    setTimeout(() => sendKey("OK"), wasOff ? 9000 : 7000);
    powerState = "on";
  }
  $("#arrGo").addEventListener("click", () => { const q = $("#arrQ").value.trim() || "weekend"; playFirstYouTube(q); });

  $("#device").addEventListener("change", (e: any) => { deviceId = e.target.value; LS.set("st_device", deviceId); $("#devName").textContent = e.target.selectedOptions[0]?.textContent || t("deviceGeneric"); setOn(!!deviceId); refreshStatus(); });
  $("#devChange").addEventListener("click", () => { const w = $("#devSelectWrap"); w.hidden = !w.hidden; });
  $("#theme").addEventListener("click", () => { const c = document.documentElement.getAttribute("data-theme"); const dark = c ? c === "dark" : matchMedia("(prefers-color-scheme: dark)").matches; document.documentElement.setAttribute("data-theme", dark ? "light" : "dark"); LS.set("st_theme", dark ? "light" : "dark"); });
  document.querySelectorAll("#lang button").forEach((b: any) => b.addEventListener("click", () => setLang(b.dataset.lang)));

  (function init() {
    const th = LS.get("st_theme"); if (th) document.documentElement.setAttribute("data-theme", th);
    icons(); setLang(lang); setOn(false);
    $("#log").textContent = t("logDefault");
    const token = LS.get("st_token") || "";
    if (token) loadDevices();
    else log(lang === "en" ? "Enter your SmartThings token in the top bar." : "Üstteki alana SmartThings token'ını gir.");
  })();
}
