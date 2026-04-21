
let mode = "clock";
let swSecs = 0, swOn = false;
let pomSecs = 25 * 60, pomOn = false;
let cards = {};
let useFlip = true;

function pad(n) { return String(n).padStart(2, "0"); }

function makeCard(id, small) {
  const div = document.createElement("div");
  div.className = "flip-card" + (small ? " small" : "");
  div.innerHTML = `
    <div class="upper"><span id="u-${id}">00</span></div>
    <div class="lower"><span id="l-${id}">00</span></div>
    <div class="flap-top" id="ft-${id}"><span id="fts-${id}">00</span></div>
    <div class="flap-bottom" id="fb-${id}"><span id="fbs-${id}">00</span></div>
  `;
  cards[id] = {
    u: div.querySelector("#u-" + id), l: div.querySelector("#l-" + id),
    ft: div.querySelector("#ft-" + id), fts: div.querySelector("#fts-" + id),
    fb: div.querySelector("#fb-" + id), fbs: div.querySelector("#fbs-" + id),
    prev: null
  };
  return div;
}

function setVal(id, num) {
  const val = pad(num);
  const c = cards[id];
  if (!c || c.prev === val) return;
  const old = c.prev || val;
  c.prev = val;
  c.u.textContent = val;
  c.l.textContent = val;
  c.fts.textContent = old;
  c.fbs.textContent = val;
  if (useFlip) {
    c.ft.classList.remove("fold");
    c.fb.classList.remove("unfold");
    void c.ft.offsetWidth;
    c.ft.classList.add("fold");
    c.fb.classList.add("unfold");
  } else {
    c.ft.classList.remove("fold");
    c.fb.classList.remove("unfold");
  }
}

function buildHMS() {
  const row = document.getElementById("mainRow");
  row.innerHTML = ""; cards = {};
  row.appendChild(makeCard("h", false));
  const col = document.createElement("div");
  col.className = "colon"; col.textContent = ":";
  row.appendChild(col);
  row.appendChild(makeCard("m", false));
  const sw = document.createElement("div");
  sw.className = "seconds-wrap";
  sw.appendChild(makeCard("s", true));
  const sl = document.createElement("div");
  sl.className = "seconds-label"; sl.textContent = "SS";
  sw.appendChild(sl);
  row.appendChild(sw);
}

function buildMS() {
  const row = document.getElementById("mainRow");
  row.innerHTML = ""; cards = {};
  row.appendChild(makeCard("m", false));
  const col = document.createElement("div");
  col.className = "colon"; col.textContent = ":";
  row.appendChild(col);
  row.appendChild(makeCard("s", false));
}

function renderClock() {
  const n = new Date();
  setVal("h", n.getHours());
  setVal("m", n.getMinutes());
  setVal("s", n.getSeconds());
}
function renderSW() {
  setVal("h", Math.floor(swSecs / 3600));
  setVal("m", Math.floor((swSecs % 3600) / 60));
  setVal("s", swSecs % 60);
}
function renderPom() {
  setVal("m", Math.floor(pomSecs / 60));
  setVal("s", pomSecs % 60);
}

function setMode(m, el) {
  mode = m;
  document.querySelectorAll(".nav button").forEach(b => b.classList.remove("active"));
  el.classList.add("active");
  document.getElementById("status").textContent = "";
  const t = { clock: "FLIP CLOCK", sw: "STOPWATCH", pom: "POMODORO · FOCUS" };
  document.getElementById("title").textContent = t[m];
  const bs = document.getElementById("bStart"),
        bo = document.getElementById("bStop"),
        br = document.getElementById("bReset");
  bs.classList.remove("on"); bo.classList.remove("on");
  if (m === "clock") {
    buildHMS(); bs.disabled = bo.disabled = br.disabled = true; renderClock();
  } else if (m === "sw") {
    buildHMS(); bs.disabled = bo.disabled = br.disabled = false; renderSW();
  } else {
    buildMS(); bs.disabled = bo.disabled = br.disabled = false; renderPom();
  }
}

function doStart() {
  if (mode === "sw")  { swOn = true;  document.getElementById("status").textContent = "● RUNNING"; }
  if (mode === "pom") { pomOn = true; document.getElementById("status").textContent = "● FOCUSING"; }
  document.getElementById("bStart").classList.add("on");
  document.getElementById("bStop").classList.remove("on");
}
function doStop() {
  swOn = false; pomOn = false;
  document.getElementById("status").textContent = "■ PAUSED";
  document.getElementById("bStop").classList.add("on");
  document.getElementById("bStart").classList.remove("on");
}
function doReset() {
  swOn = false; pomOn = false;
  if (mode === "sw")  { swSecs = 0; renderSW(); }
  if (mode === "pom") { pomSecs = 25 * 60; renderPom(); }
  document.getElementById("status").textContent = "";
  document.getElementById("bStart").classList.remove("on");
  document.getElementById("bStop").classList.remove("on");
}

function toggleAnim() {
  useFlip = !document.getElementById("animToggle").checked;
  document.getElementById("lbl-flip").classList.toggle("active", useFlip);
  document.getElementById("lbl-normal").classList.toggle("active", !useFlip);
  document.body.classList.toggle("normal-mode", !useFlip);
}

setInterval(() => {
  if (mode === "clock") renderClock();
  if (mode === "sw" && swOn)  { swSecs++; renderSW(); }
  if (mode === "pom" && pomOn) {
    if (pomSecs > 0) { pomSecs--; renderPom(); }
    else { pomOn = false; document.getElementById("status").textContent = "✓ Done!"; }
  }
}, 1000);

// Init
buildHMS();
document.getElementById("bStart").disabled = true;
document.getElementById("bStop").disabled  = true;
document.getElementById("bReset").disabled = true;
renderClock();
