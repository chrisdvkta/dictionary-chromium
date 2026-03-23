 let tooltip = null;

document.addEventListener('dblclick', async () => {
  const word = window.getSelection().toString().trim();
  
  if (!word || word.includes(' ')) return; // single words only
  
  removeTooltip();
  
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    if (!res.ok) throw new Error('not found');
    
    const data = await res.json();
    const entry = data[0];
    const meaning = entry.meanings[0];
    
    const partOfSpeech = meaning.partOfSpeech;
    const definition = meaning.definitions[0].definition;

    showTooltip(word, partOfSpeech, definition);
  } catch {
    showTooltip(word, null, 'No definition found.');
  }
});

document.addEventListener('click', removeTooltip);

function showTooltip(word, pos, definition) {
  const sel = window.getSelection();
  const range = sel.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  tooltip = document.createElement('div');
  tooltip.id = 'qd-tooltip';
  tooltip.innerHTML = `
    <span class="qd-word">${word}</span>
    ${pos ? `<span class="qd-pos">${pos}</span>` : ''}
    <p class="qd-def">${definition}</p>
  `;

  tooltip.style.top = `${rect.bottom + window.scrollY + 8}px`;
  tooltip.style.left = `${rect.left + window.scrollX}px`;

  document.body.appendChild(tooltip);
}

function removeTooltip() {
  if (tooltip) {
    tooltip.remove();
    tooltip = null;
  }
}
