document.addEventListener('DOMContentLoaded', () => {
  const chatWindow = document.getElementById('chat-window');
  const userInput = document.getElementById('user-input');
  const sendBtn = document.getElementById('send-btn');

  const archiveConsole = document.getElementById('archive-console');
  const archiveFileInput = document.getElementById('archive-file-input');
  const archiveFetchBtn = document.getElementById('archive-fetch-btn');
  const archiveDisplay = document.getElementById('archive-display');

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function formatInline(str) {
    return str
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/__([^_]+)__/g, '<strong>$1</strong>')
      .replace(/_([^_]+)_/g, '<em>$1</em>');
  }

  function renderMarkdown(text) {
    if (!text) return '';

    let escaped = escapeHtml(text);

    // Code blocks
    escaped = escaped.replace(/```(?:[a-zA-Z0-9_-]+)?\n?([\s\S]*?)```/g, (match, p1) => {
      return `<pre><code>${p1.trim()}</code></pre>`;
    });

    // Inline code
    escaped = escaped.replace(/`([^`]+)`/g, '<code>$1</code>');

    const lines = escaped.split('\n');
    let output = [];
    let inUl = false;
    let inOl = false;
    let inTable = false;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();

      // Table parsing
      if (line.startsWith('|') && line.endsWith('|')) {
        if (inUl) { output.push('</ul>'); inUl = false; }
        if (inOl) { output.push('</ol>'); inOl = false; }

        if (/^\|(\s*[-:]+\s*\|)+$/.test(line)) {
          continue;
        }

        const cells = line.slice(1, -1).split('|').map(c => c.trim());
        if (!inTable) {
          output.push('<div class="table-container"><table><thead><tr>');
          cells.forEach(c => output.push(`<th>${formatInline(c)}</th>`));
          output.push('</tr></thead><tbody>');
          inTable = true;
        } else {
          output.push('<tr>');
          cells.forEach(c => output.push(`<td>${formatInline(c)}</td>`));
          output.push('</tr>');
        }
        continue;
      } else {
        if (inTable) {
          output.push('</tbody></table></div>');
          inTable = false;
        }
      }

      const ulMatch = line.match(/^[-*]\s+(.*)$/);
      const olMatch = line.match(/^\d+\.\s+(.*)$/);
      const h3Match = line.match(/^###\s+(.*)$/);
      const h2Match = line.match(/^##\s+(.*)$/);
      const h1Match = line.match(/^#\s+(.*)$/);

      if (ulMatch) {
        if (inOl) { output.push('</ol>'); inOl = false; }
        if (!inUl) { output.push('<ul>'); inUl = true; }
        output.push(`<li>${formatInline(ulMatch[1])}</li>`);
      } else if (olMatch) {
        if (inUl) { output.push('</ul>'); inUl = false; }
        if (!inOl) { output.push('<ol>'); inOl = true; }
        output.push(`<li>${formatInline(olMatch[1])}</li>`);
      } else {
        if (inUl) { output.push('</ul>'); inUl = false; }
        if (inOl) { output.push('</ol>'); inOl = false; }

        if (h3Match) {
          output.push(`<h4>${formatInline(h3Match[1])}</h4>`);
        } else if (h2Match) {
          output.push(`<h3>${formatInline(h2Match[1])}</h3>`);
        } else if (h1Match) {
          output.push(`<h2>${formatInline(h1Match[1])}</h2>`);
        } else if (line.startsWith('&gt;')) {
          output.push(`<blockquote>${formatInline(line.substring(4).trim())}</blockquote>`);
        } else if (line.startsWith('<pre>') || line.endsWith('</pre>')) {
          output.push(line);
        } else if (line.length > 0) {
          output.push(`<p>${formatInline(line)}</p>`);
        }
      }
    }
    if (inUl) output.push('</ul>');
    if (inOl) output.push('</ol>');
    if (inTable) output.push('</tbody></table></div>');

    return output.join('');
  }

  function addMessage(content, type) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', type);
    if (type === 'bot') {
      msgDiv.innerHTML = renderMarkdown(content);
    } else {
      msgDiv.textContent = content;
    }
    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    return msgDiv;
  }

  function addHintMessage(hintText) {
    const hintDiv = document.createElement('div');
    hintDiv.classList.add('message', 'hint-bubble');
    hintDiv.innerHTML = `<span class="hint-tag">💡 HINT</span> <span>${escapeHtml(hintText)}</span>`;
    chatWindow.appendChild(hintDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  function addSuccessMessage(text) {
    const successDiv = document.createElement('div');
    successDiv.classList.add('message', 'success-bubble');
    successDiv.textContent = text;
    chatWindow.appendChild(successDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  // Welcome message from CANDLE
  addMessage(
    "Welcome to GlitchHunt's 1st Anniversary! I am CANDLE, your anniversary archivist. How can I assist you with exploring our public memories and community milestones today?",
    "bot"
  );

  async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    userInput.value = '';
    userInput.disabled = true;
    sendBtn.disabled = true;

    // Loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('message', 'bot', 'loading');
    loadingDiv.innerHTML = '<em>[CANDLE is analyzing archival records...]</em>';
    chatWindow.appendChild(loadingDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    try {
      const res = await fetch('/api/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      loadingDiv.remove();

      if (data.error) {
        addMessage(`Error: ${data.error}`, 'bot');
      } else {
        addMessage(data.reply, 'bot');

        // Check if elevated archive session was unlocked
        if (data.archiveUnlocked) {
          archiveConsole.style.display = 'flex';
        }

        // Show hint if triggered
        if (data.hint) {
          addHintMessage(data.hint);
        }

        // Check for flag match in reply
        const flagMatch = (data.reply || '').match(/SDC\{[A-F0-9_]+\}/i);
        if (data.flagFound || flagMatch) {
          const found = flagMatch ? flagMatch[0] : 'Flag';
          addSuccessMessage(`🎉 Flag captured! ${found}`);
        }
      }
    } catch (err) {
      loadingDiv.remove();
      addMessage('Network error: Could not contact CANDLE archivist service.', 'bot');
    } finally {
      userInput.disabled = false;
      sendBtn.disabled = false;
      userInput.focus();
    }
  }

  // Stage 2 Archive File Retrieval
  async function fetchArchiveFile(filename) {
    const file = filename || archiveFileInput.value.trim();
    if (!file) return;

    archiveDisplay.textContent = `[Requesting /archive/download?file=${file}...]`;

    try {
      const res = await fetch(`/archive/download?file=${encodeURIComponent(file)}`);
      const text = await res.text();

      archiveDisplay.textContent = text;

      // Check if retrieved file contains the flag
      const flagMatch = text.match(/SDC\{[A-F0-9_]+\}/i);
      if (flagMatch) {
        addSuccessMessage(`🎉 Flag captured from Time Capsule! ${flagMatch[0]}`);
      }
    } catch (e) {
      archiveDisplay.textContent = `Request failed: ${e.message}`;
    }
  }

  sendBtn.addEventListener('click', sendMessage);
  userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  archiveFetchBtn.addEventListener('click', () => {
    fetchArchiveFile();
  });

  document.querySelectorAll('.chip-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const file = btn.getAttribute('data-file');
      archiveFileInput.value = file;
      fetchArchiveFile(file);
    });
  });

  // Initial status sync
  fetch('/api/status')
    .then((r) => r.json())
    .then((data) => {
      if (data.archiveUnlocked) {
        archiveConsole.style.display = 'flex';
      }
    })
    .catch(() => {});
});
