const AT_KEYWORD = /@(\w+)/g;

document.addEventListener("copy", () => {
  const text = window.getSelection?.()?.toString?.()?.trim?.() || "";
  if (text) chrome.runtime.sendMessage({ type: "COPIED_TEXT", text });
});

function isInputOrTextarea(el) {
  return el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
}

function replaceKeywordInField(field, matchStart, matchEnd, newText) {
  if (field.tagName === "INPUT" || field.tagName === "TEXTAREA") {
    const v = field.value;
    field.value = v.slice(0, matchStart) + newText + v.slice(matchEnd);
    field.dispatchEvent(new Event("input", { bubbles: true }));
    return;
  }
  if (field.isContentEditable) {
    const sel = window.getSelection();
    const range = document.createRange();
    range.setStart(field, 0);
    const walker = document.createTreeWalker(field, NodeFilter.SHOW_TEXT);
    let pos = 0;
    let startNode = null;
    let startOffset = 0;
    let endNode = null;
    let endOffset = 0;
    while (walker.nextNode()) {
      const len = walker.currentNode.textContent.length;
      if (pos <= matchStart && matchStart < pos + len) {
        startNode = walker.currentNode;
        startOffset = matchStart - pos;
      }
      if (pos <= matchEnd && matchEnd <= pos + len) {
        endNode = walker.currentNode;
        endOffset = matchEnd - pos;
        break;
      }
      pos += len;
    }
    if (startNode && endNode && sel) {
      range.setStart(startNode, startOffset);
      range.setEnd(endNode, endOffset);
      sel.removeAllRanges();
      sel.addRange(range);
      document.execCommand("insertText", false, newText);
    }
  }
}

let inputDebounce = null;
document.addEventListener("input", (e) => {
  const field = e.target;
  if (!isInputOrTextarea(field)) return;
  const raw = field.tagName === "INPUT" || field.tagName === "TEXTAREA" ? field.value : (field.innerText || "");
  const match = raw.match(AT_KEYWORD);
  if (!match) return;
  const last = match[match.length - 1];
  const keyword = last.replace(/^@/, "");
  const idx = raw.lastIndexOf(last);
  if (idx === -1) return;
  const afterMatch = idx + last.length;
  if (afterMatch < raw.length && raw[afterMatch] !== " " && raw[afterMatch] !== "\n") return;
  clearTimeout(inputDebounce);
  inputDebounce = setTimeout(() => {
    const matchStart = idx;
    const matchEnd = idx + last.length;
    chrome.runtime.sendMessage(
      { type: "GENERATE_BID", keyword, copiedText: null },
      (response) => {
        if (chrome.runtime.lastError || response?.error) return;
        if (response?.text) replaceKeywordInField(field, matchStart, matchEnd, response.text);
      }
    );
  }, 400);
}, true);
