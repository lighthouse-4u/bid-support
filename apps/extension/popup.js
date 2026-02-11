const STORAGE_KEYS = { lastCopied: "lastCopied", token: "token", model: "model" };
const DEFAULT_MODEL = "gpt-4o";

chrome.storage.local.get(["lastCopied", "model"]).then(({ lastCopied, model }) => {
  const el = document.getElementById("lastCopied");
  const text = lastCopied || "";
  el.textContent = "Last copied: " + (text ? text.slice(0, 80) + (text.length > 80 ? "…" : "") : "(none)");
  const modelSelect = document.getElementById("model");
  if (modelSelect) modelSelect.value = model || DEFAULT_MODEL;
});

document.getElementById("model").addEventListener("change", (e) => {
  const value = e.target.value || DEFAULT_MODEL;
  chrome.storage.local.set({ [STORAGE_KEYS.model]: value });
});

document.getElementById("saveToken").addEventListener("click", () => {
  const input = document.getElementById("token");
  const errEl = document.getElementById("tokenError");
  const token = (input.value || "").trim();
  if (!token) {
    errEl.textContent = "Enter a token.";
    return;
  }
  chrome.storage.local.set({ [STORAGE_KEYS.token]: token }).then(() => {
    errEl.textContent = "";
    input.value = "";
    errEl.textContent = "Saved.";
    setTimeout(() => { errEl.textContent = ""; }, 2000);
  });
});
