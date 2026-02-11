const STORAGE_KEYS = { lastCopied: "lastCopied", token: "token", model: "model" };
const API_URL = "https://bot.fusion-tech.dev/api";

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "COPIED_TEXT") {
    chrome.storage.local.set({ [STORAGE_KEYS.lastCopied]: msg.text ?? "" }).then(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg.type === "GENERATE_BID") {
    handleGenerateBid(msg.keyword, msg.copiedText)
      .then((text) => sendResponse({ text }))
      .catch((err) => sendResponse({ error: err?.message ?? "Failed" }));
    return true;
  }
});

async function handleGenerateBid(keyword, copiedText) {
  const stored = await chrome.storage.local.get([STORAGE_KEYS.token, STORAGE_KEYS.lastCopied, STORAGE_KEYS.model]);
  const token = stored[STORAGE_KEYS.token];
  if (!token) throw new Error("Not logged in. Open the extension popup and paste your token from the dashboard.");
  const textToUse = copiedText != null ? copiedText : (stored[STORAGE_KEYS.lastCopied] ?? "");
  const model = stored[STORAGE_KEYS.model] || "gpt-4o";
  const res = await fetch(`${API_URL}/api/bid/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
    body: JSON.stringify({ keyword: keyword.replace(/^@/, ""), copiedText: textToUse, model }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? res.statusText);
  return data.text ?? "";
}
