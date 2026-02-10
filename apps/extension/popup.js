const STORAGE_KEYS = { lastCopied: "lastCopied", token: "token" };

chrome.storage.local.get("lastCopied").then(({ lastCopied }) => {
  const el = document.getElementById("lastCopied");
  const text = lastCopied || "";
  el.textContent = "Last copied: " + (text ? text.slice(0, 80) + (text.length > 80 ? "…" : "") : "(none)");
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
