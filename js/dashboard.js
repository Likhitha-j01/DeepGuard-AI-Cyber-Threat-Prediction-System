import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ============================================================
   ⚠️ PROTOTYPE ONLY: this key is visible to anyone who opens
   dev tools on this page. Do not use in a public/production
   deployment — move this call behind a backend (e.g. a Firebase
   Cloud Function) before shipping.
   ============================================================ */
const CLAUDE_API_KEY = "YOUR_ANTHROPIC_API_KEY_HERE";
const CLAUDE_MODEL = "claude-sonnet-5";

const AI_REFRESH_INTERVAL_MS = 5 * 60 * 1000; // don't call the AI on every snapshot — every 5 min
let lastAiCallAt = 0;

/* ---------- Auth guard ---------- */
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  const emailEl = document.getElementById("userEmail");
  if (emailEl) emailEl.textContent = user.email;
});

/* ---------- Chart setup ---------- */
const chartCtx = document.getElementById("chart");
let threatChart = null;
if (chartCtx) {
  threatChart = new Chart(chartCtx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Threats per day",
          data: [],
          borderColor: "#00c3ff",
          backgroundColor: "rgba(0, 195, 255, 0.15)",
          fill: true,
          tension: 0.35,
          pointRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true } }
    }
  });
}

/* ---------- Firestore live listener ---------- */
const threatsQuery = query(
  collection(db, "threats"),
  orderBy("timestamp", "desc"),
  limit(100)
);

onSnapshot(
  threatsQuery,
  (snapshot) => {
    const threats = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        type: data.type || "Unknown",
        ip: data.ip || "—",
        severity: data.severity || "Low",
        status: data.status || "Detected",
        timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date()
      };
    });

    renderCards(threats);
    renderTable(threats.slice(0, 10));
    renderChart(threats);
    maybeRunAiPrediction(threats);
  },
  (error) => {
    console.error("Firestore listener error:", error);
    const tbody = document.getElementById("threatsTableBody");
    if (tbody) tbody.innerHTML = `<tr><td colspan="5">Failed to load threat data.</td></tr>`;
  }
);

/* ---------- Render: cards ---------- */
function renderCards(threats) {
  const total = threats.length;
  const blocked = threats.filter((t) => t.status === "Blocked").length;

  const today = new Date();
  const todayCount = threats.filter((t) => isSameDay(t.timestamp, today)).length;

  document.getElementById("totalThreats").textContent = total;
  document.getElementById("threatsBlocked").textContent = blocked;
  document.getElementById("todaysAlerts").textContent = todayCount;
}

/* ---------- Render: table ---------- */
function renderTable(recentThreats) {
  const tbody = document.getElementById("threatsTableBody");
  if (!tbody) return;

  if (recentThreats.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5">No threats recorded yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = recentThreats
    .map((t) => {
      const statusClass = `status-${t.status.toLowerCase()}`;
      const time = t.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      return `
        <tr>
          <td>${time}</td>
          <td>${escapeHtml(t.type)}</td>
          <td>${escapeHtml(t.ip)}</td>
          <td>${escapeHtml(t.severity)}</td>
          <td class="${statusClass}">${escapeHtml(t.status)}</td>
        </tr>`;
    })
    .join("");
}

/* ---------- Render: chart (threats per day, last 7 days) ---------- */
function renderChart(threats) {
  if (!threatChart) return;

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }

  const labels = days.map((d) => d.toLocaleDateString([], { weekday: "short" }));
  const counts = days.map(
    (d) => threats.filter((t) => isSameDay(t.timestamp, d)).length
  );

  threatChart.data.labels = labels;
  threatChart.data.datasets[0].data = counts;
  threatChart.update();
}

/* ---------- AI prediction (Claude API) ---------- */
function maybeRunAiPrediction(threats) {
  const now = Date.now();
  if (now - lastAiCallAt < AI_REFRESH_INTERVAL_MS) return;
  if (threats.length === 0) return;

  lastAiCallAt = now;
  runAiPrediction(threats);
}

async function runAiPrediction(threats) {
  const insightEl = document.getElementById("aiInsightText");
  const accuracyEl = document.getElementById("predictionAccuracy");

  if (insightEl) insightEl.textContent = "Analyzing recent threat activity…";

  // Summarize data locally so we don't ship the full raw log to the model
  const bySeverity = countBy(threats, (t) => t.severity);
  const byStatus = countBy(threats, (t) => t.status);
  const byType = countBy(threats, (t) => t.type);

  const summary = {
    total_last_100: threats.length,
    by_severity: bySeverity,
    by_status: byStatus,
    top_attack_types: Object.entries(byType)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  };

  const systemPrompt = `You are a cybersecurity analyst assistant embedded in a threat dashboard.
You will be given aggregate stats (never raw logs) about recent security threats.
Respond with ONLY a valid JSON object, no markdown fences, no preamble, matching exactly:
{"accuracy_estimate": <integer 0-100>, "risk_trend": "rising"|"stable"|"falling", "insight": "<one or two sentence plain-English insight for a security admin, under 240 characters>"}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 300,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Here are the aggregate stats:\n${JSON.stringify(summary)}`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API returned ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.content?.[0]?.text?.trim() ?? "";
    const cleaned = rawText.replace(/^```json\s*|\s*```$/g, "");
    const parsed = JSON.parse(cleaned);

    if (accuracyEl) accuracyEl.textContent = `${parsed.accuracy_estimate}%`;
    if (insightEl) {
      const trendIcon =
        parsed.risk_trend === "rising" ? "📈" : parsed.risk_trend === "falling" ? "📉" : "➡️";
      insightEl.textContent = `${trendIcon} ${parsed.insight}`;
    }
  } catch (err) {
    console.error("AI prediction failed:", err);
    if (insightEl) insightEl.textContent = "AI prediction unavailable right now.";
  }
}

/* ---------- Helpers ---------- */
function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function countBy(arr, keyFn) {
  return arr.reduce((acc, item) => {
    const key = keyFn(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}