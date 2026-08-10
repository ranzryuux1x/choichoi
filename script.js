const htmlCode = document.getElementById("htmlCode");
const cssCode = document.getElementById("cssCode");
const jsCode = document.getElementById("jsCode");
const preview = document.getElementById("preview");
const prompt = document.getElementById("prompt");
const statusEl = document.getElementById("status");

function runCode() {
  const html = htmlCode.value;
  const css = cssCode.value;
  const js = jsCode.value.replace(/<\/script>/gi, "<\\/script>");

  const documentContent = `
<!doctype html>
<html>
<head>
<meta charset="UTF-8">
<style>${css}</style>
</head>
<body>
${html}
<script>
try {
${js}
} catch (error) {
  document.body.insertAdjacentHTML(
    "beforeend",
    '<pre style="color:red;background:#fff;padding:10px">' +
    String(error) +
    '</pre>'
  );
}
<\/script>
</body>
</html>`;

  preview.srcdoc = documentContent;
}

document.getElementById("runBtn").addEventListener("click", runCode);

document.getElementById("clearBtn").addEventListener("click", () => {
  htmlCode.value = "";
  cssCode.value = "";
  jsCode.value = "";
  runCode();
});

document.getElementById("askBtn").addEventListener("click", async () => {
  const text = prompt.value.trim();

  if (!text) {
    statusEl.textContent = "Masukkan prompt terlebih dahulu.";
    return;
  }

  statusEl.textContent = "AI sedang membuat kode...";

  try {
    const response = await fetch("/.netlify/functions/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: text,
        currentCode: {
          html: htmlCode.value,
          css: cssCode.value,
          js: jsCode.value
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "AI request gagal.");
    }

    htmlCode.value = data.html || "";
    cssCode.value = data.css || "";
    jsCode.value = data.js || "";

    runCode();
    statusEl.textContent = "Kode berhasil dibuat AI.";
  } catch (error) {
    console.error(error);
    statusEl.textContent = "Error: " + error.message;
  }
});

[htmlCode, cssCode, jsCode].forEach(el => {
  el.addEventListener("keydown", e => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = el.selectionStart;
      const end = el.selectionEnd;
      el.value = el.value.substring(0, start) + "  " + el.value.substring(end);
      el.selectionStart = el.selectionEnd = start + 2;
    }
  });
});

runCode();
