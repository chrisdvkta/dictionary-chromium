let tooltip = null;

document.addEventListener("dblclick", async () => {
  const word = window.getSelection().toString().trim();

  if (!word || word.includes(" ")) return; // single words only

  removeTooltip();

  try {
    const res = await fetch(
      `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`,
    );
    if (!res.ok) throw new Error("not found");

    const data = await res.json();
    const definitions = (data.en || [])
      .flatMap((entry) =>
        (entry.definitions || []).map((item) => ({
          partOfSpeech: entry.partOfSpeech,
          definition: item.definition,
        })),
      )
      .filter((item) => item.definition)
      .slice(0, 5);

    if (!definitions.length) throw new Error("not found");

    showTooltip(word, definitions);
  } catch {
    showTooltip(word, [], "No definition found.");
  }
});

document.addEventListener("click", removeTooltip);

function showTooltip(word, definitions, fallback) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  const rect = selection.getRangeAt(0).getBoundingClientRect();

  const definitionMarkup = definitions.length
    ? definitions
        .map(
          ({ partOfSpeech, definition }) => `
            <div class="qd-entry">
              ${partOfSpeech ? `<span class="qd-pos">${escapeHTML(partOfSpeech)}</span>` : ""}
              <p class="qd-def">${escapeHTML(stripHTML(definition))}</p>
            </div>`,
        )
        .join("")
    : `<p class="qd-def">${escapeHTML(fallback)}</p>`;

  tooltip = document.createElement("div");
  tooltip.id = "qd-tooltip";
  tooltip.innerHTML = `
  <button class="qd-close">✕</button>
  <span class="qd-word">${escapeHTML(word)}</span>
  ${definitionMarkup}
`;
  tooltip.querySelector(".qd-close").addEventListener("click", (e) => {
    e.stopPropagation(); // prevent the doc click listener firing twice
    removeTooltip();
  });

  tooltip.style.top = `${rect.bottom + window.scrollY + 8}px`;
  tooltip.style.left = `${rect.left + window.scrollX}px`;

  document.body.appendChild(tooltip);
}

function escapeHTML(value) {
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}

function stripHTML(value) {
  const element = document.createElement("div");
  element.innerHTML = value;
  return element.textContent;
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") removeTooltip();
});

function removeTooltip() {
  if (tooltip) {
    tooltip.remove();
    tooltip = null;
  }
}
