// GamesBoy.net - Ultra-Realistic WhatsApp AI Support Widget (whatsapp-widget.js)
// 100% Standalone, Self-Injecting & Fully Responsive

(function() {
  'use strict';

  // Inject CSS Styles
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    /* WhatsApp Floating Trigger */
    .gb-wa-trigger {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 60px;
      height: 60px;
      background: #25D366;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      box-shadow: 0 6px 24px rgba(37, 211, 102, 0.45);
      cursor: pointer;
      z-index: 99998;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      border: none;
      outline: none;
    }
    .gb-wa-trigger:hover {
      transform: scale(1.08);
      box-shadow: 0 8px 30px rgba(37, 211, 102, 0.6);
    }
    .gb-wa-trigger .gb-wa-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      background: #ef4444;
      color: #ffffff;
      font-size: 0.7rem;
      font-weight: 800;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #080a10;
      box-shadow: 0 2px 6px rgba(0,0,0,0.5);
    }
    .gb-wa-trigger .gb-wa-pulse {
      position: absolute;
      inset: -4px;
      border-radius: 50%;
      border: 2px solid #25D366;
      animation: gbWaPulseAnim 2s infinite;
      pointer-events: none;
    }
    @keyframes gbWaPulseAnim {
      0% { transform: scale(0.95); opacity: 0.8; }
      70% { transform: scale(1.3); opacity: 0; }
      100% { transform: scale(1.3); opacity: 0; }
    }

    /* WhatsApp Chat Popup Box */
    .gb-wa-window {
      position: fixed;
      bottom: 96px;
      right: 24px;
      width: 380px;
      max-width: calc(100vw - 32px);
      height: 570px;
      max-height: calc(100vh - 120px);
      background: #0b141a;
      border-radius: 18px;
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.1);
      display: flex;
      flex-direction: column;
      z-index: 99999;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      transform-origin: bottom right;
    }
    .gb-wa-window.hidden {
      opacity: 0;
      transform: scale(0.85) translateY(20px);
      pointer-events: none;
    }

    /* Header */
    .gb-wa-header {
      background: #202c33;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      flex-shrink: 0;
    }
    .gb-wa-profile {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .gb-wa-avatar-wrap {
      position: relative;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: #111b21;
      padding: 2px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      flex-shrink: 0;
    }
    .gb-wa-avatar-img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }
    .gb-wa-online-dot {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 11px;
      height: 11px;
      background: #25D366;
      border-radius: 50%;
      border: 2px solid #202c33;
    }
    .gb-wa-title-box {
      display: flex;
      flex-direction: column;
    }
    .gb-wa-name-row {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .gb-wa-name {
      color: #e9edef;
      font-size: 0.95rem;
      font-weight: 700;
      line-height: 1.2;
    }
    .gb-wa-verified-badge {
      display: inline-flex;
      color: #25D366;
    }
    .gb-wa-status {
      color: #8696a0;
      font-size: 0.74rem;
      margin-top: 2px;
      transition: color 0.2s;
    }
    .gb-wa-status.typing {
      color: #25D366;
      font-weight: 600;
    }
    .gb-wa-header-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .gb-wa-header-btn {
      background: transparent;
      border: none;
      color: #aebac1;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.15s;
    }
    .gb-wa-header-btn:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
    }

    /* Chat Messages Body */
    .gb-wa-body {
      flex: 1;
      overflow-y: auto;
      padding: 16px 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background-color: #0b141a;
      background-image: radial-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 0);
      background-size: 16px 16px;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.15) transparent;
    }
    .gb-wa-body::-webkit-scrollbar {
      width: 5px;
    }
    .gb-wa-body::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.15);
      border-radius: 4px;
    }

    /* Message Bubbles */
    .gb-wa-msg {
      max-width: 82%;
      padding: 8px 12px;
      border-radius: 10px;
      font-size: 0.85rem;
      line-height: 1.45;
      position: relative;
      word-break: break-word;
      animation: gbWaMsgFade 0.25s ease forwards;
    }
    @keyframes gbWaMsgFade {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .gb-wa-msg.incoming {
      background: #202c33;
      color: #e9edef;
      align-self: flex-start;
      border-top-left-radius: 2px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }
    .gb-wa-msg.outgoing {
      background: #005c4b;
      color: #e9edef;
      align-self: flex-end;
      border-top-right-radius: 2px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }
    .gb-wa-msg-meta {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 4px;
      font-size: 0.65rem;
      color: #8696a0;
      margin-top: 4px;
    }
    .gb-wa-msg.outgoing .gb-wa-msg-meta {
      color: rgba(255, 255, 255, 0.7);
    }
    .gb-wa-checks {
      color: #53bdeb;
      display: inline-flex;
    }

    /* Typing Dots Bubble */
    .gb-wa-typing-bubble {
      background: #202c33;
      padding: 10px 14px;
      border-radius: 12px;
      border-top-left-radius: 2px;
      align-self: flex-start;
      display: flex;
      align-items: center;
      gap: 5px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }
    .gb-wa-dot {
      width: 7px;
      height: 7px;
      background: #8696a0;
      border-radius: 50%;
      animation: gbWaBouncingDot 1.4s infinite ease-in-out;
    }
    .gb-wa-dot:nth-child(1) { animation-delay: 0s; }
    .gb-wa-dot:nth-child(2) { animation-delay: 0.2s; }
    .gb-wa-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes gbWaBouncingDot {
      0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
      40% { transform: translateY(-5px); opacity: 1; background: #25D366; }
    }

    /* Escalation / WhatsApp Direct Action Card */
    .gb-wa-action-card {
      background: rgba(37, 211, 102, 0.1);
      border: 1px solid rgba(37, 211, 102, 0.35);
      border-radius: 10px;
      padding: 10px 12px;
      margin-top: 8px;
    }
    .gb-wa-action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 8px 12px;
      background: #25D366;
      color: #0b141a;
      font-weight: 800;
      font-size: 0.8rem;
      border-radius: 8px;
      text-decoration: none;
      transition: background 0.2s, transform 0.1s;
      margin-top: 6px;
    }
    .gb-wa-action-btn:hover {
      background: #22bf5b;
      transform: translateY(-1px);
    }

    /* Quick Suggestion Chips */
    .gb-wa-chips-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 6px;
    }
    .gb-wa-chip {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #e9edef;
      font-size: 0.72rem;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .gb-wa-chip:hover {
      background: rgba(37, 211, 102, 0.2);
      border-color: rgba(37, 211, 102, 0.4);
      color: #25D366;
    }

    /* Input Footer */
    .gb-wa-footer {
      background: #202c33;
      padding: 10px 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      flex-shrink: 0;
    }
    .gb-wa-input {
      flex: 1;
      background: #2a3942;
      border: none;
      color: #e9edef;
      font-size: 0.88rem;
      padding: 9px 14px;
      border-radius: 20px;
      outline: none;
      box-sizing: border-box;
    }
    .gb-wa-input::placeholder {
      color: #8696a0;
    }
    .gb-wa-send-btn {
      width: 38px;
      height: 38px;
      background: #25D366;
      border: none;
      border-radius: 50%;
      color: #0b141a;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.15s, background 0.15s;
      flex-shrink: 0;
    }
    .gb-wa-send-btn:hover {
      transform: scale(1.06);
      background: #22bf5b;
    }
  `;
  document.head.appendChild(styleEl);

  // App State
  const state = {
    isOpen: false,
    isTyping: false,
    history: [],
    phoneNumbers: {
      general: '+595981000000',
      games: '+595982000000',
      streaming: '+595983000000',
      tools: '+595984000000',
      payments: '+595985000000'
    }
  };

  // Helper format time
  function getNowTime() {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Inject Markup
  function initMarkup() {
    // 1. Trigger Button
    const triggerBtn = document.createElement('button');
    triggerBtn.className = 'gb-wa-trigger';
    triggerBtn.id = 'gb-wa-trigger';
    triggerBtn.setAttribute('aria-label', 'Atención al Cliente WhatsApp');
    triggerBtn.innerHTML = `
      <div class="gb-wa-pulse"></div>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
      </svg>
      <div class="gb-wa-badge">1</div>
    `;
    document.body.appendChild(triggerBtn);

    // If an old floating button existed, hide it cleanly
    const oldBtn = document.getElementById('floating-support-btn');
    if (oldBtn) oldBtn.style.display = 'none';

    // 2. Chat Window
    const win = document.createElement('div');
    win.className = 'gb-wa-window hidden';
    win.id = 'gb-wa-window';
    win.innerHTML = `
      <!-- Header -->
      <div class="gb-wa-header">
        <div class="gb-wa-profile">
          <div class="gb-wa-avatar-wrap">
            <img src="/assets/branding/icon.png" alt="GamesBoy" class="gb-wa-avatar-img" onerror="this.src='/favicon.ico';">
            <div class="gb-wa-online-dot"></div>
          </div>
          <div class="gb-wa-title-box">
            <div class="gb-wa-name-row">
              <span class="gb-wa-name">GamesBoy Oficial</span>
              <span class="gb-wa-verified-badge" title="Cuenta Oficial Verificada">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </span>
            </div>
            <span class="gb-wa-status" id="gb-wa-status">en línea</span>
          </div>
        </div>
        <div class="gb-wa-header-actions">
          <button type="button" class="gb-wa-header-btn" id="gb-wa-btn-direct-wa" title="Abrir WhatsApp Externo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          </button>
          <button type="button" class="gb-wa-header-btn" id="gb-wa-btn-close" title="Cerrar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>

      <!-- Chat Body -->
      <div class="gb-wa-body" id="gb-wa-body">
        <!-- Initial Welcome Message -->
        <div class="gb-wa-msg incoming">
          <div>¡Hola! 👋 Bienvenido al canal oficial de atención de <strong>GamesBoy.net</strong>.</div>
          <div style="margin-top: 6px;">Soy tu <strong>Asistente Virtual IA</strong>. Puedo ayudarte con precios, activación de cuentas de streaming, herramientas de trabajo (ChatGPT, Claude), videojuegos y métodos de pago SIPAP.</div>
          
          <div style="margin-top: 8px; font-weight: 700; font-size: 0.76rem; color: #8696a0;">Consultas rápidas frecuentes:</div>
          <div class="gb-wa-chips-row">
            <button type="button" class="gb-wa-chip" data-query="¿Qué cuentas y perfiles de streaming tienen disponibles y a qué precio?">📺 Streaming</button>
            <button type="button" class="gb-wa-chip" data-query="Quiero información sobre ChatGPT Plus, Claude Pro y herramientas de trabajo.">🤖 Herramientas IA</button>
            <button type="button" class="gb-wa-chip" data-query="¿Cómo compro videojuegos digitales y qué catálogo tienen?">🎮 Videojuegos</button>
            <button type="button" class="gb-wa-chip" data-query="¿Cuáles son las opciones de pago en guaraníes o criptomonedas?">💳 Pagos SIPAP</button>
            <button type="button" class="gb-wa-chip" data-query="Deseo hablar directamente con un agente humano por WhatsApp.">💬 Asesor Humano</button>
          </div>
          <div class="gb-wa-msg-meta">${getNowTime()}</div>
        </div>
      </div>

      <!-- Footer Input -->
      <div class="gb-wa-footer">
        <input type="text" class="gb-wa-input" id="gb-wa-input" placeholder="Escribe un mensaje..." autocomplete="off">
        <button type="button" class="gb-wa-send-btn" id="gb-wa-send" title="Enviar Mensaje">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </div>
    `;
    document.body.appendChild(win);

    // Event Listeners
    triggerBtn.addEventListener('click', toggleChat);
    document.getElementById('gb-wa-btn-close')?.addEventListener('click', closeChat);
    document.getElementById('gb-wa-send')?.addEventListener('click', handleSend);
    document.getElementById('gb-wa-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSend();
      }
    });

    // Chips clicks
    win.addEventListener('click', (e) => {
      const chip = e.target.closest('.gb-wa-chip');
      if (chip && chip.dataset.query) {
        const input = document.getElementById('gb-wa-input');
        if (input) {
          input.value = chip.dataset.query;
          handleSend();
        }
      }
    });

    // Direct WhatsApp Header Button
    document.getElementById('gb-wa-btn-direct-wa')?.addEventListener('click', () => {
      const targetPhone = state.phoneNumbers.general || '+595981000000';
      const clean = targetPhone.replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${clean}?text=Hola%20GamesBoy,%20necesito%20asistencia%20personalizada`, '_blank');
    });

    // Load initial config from server
    fetchConfig();
  }

  async function fetchConfig() {
    try {
      const res = await fetch('/api/ai-support/config');
      const data = await res.json();
      if (data.phoneNumbers) {
        state.phoneNumbers = data.phoneNumbers;
      }
    } catch (e) {}
  }

  function toggleChat() {
    if (state.isOpen) closeChat();
    else openChat();
  }

  function openChat() {
    state.isOpen = true;
    const win = document.getElementById('gb-wa-window');
    const badge = document.querySelector('.gb-wa-badge');
    if (win) win.classList.remove('hidden');
    if (badge) badge.style.display = 'none';

    setTimeout(() => {
      const input = document.getElementById('gb-wa-input');
      if (input) input.focus();
    }, 150);
  }

  function closeChat() {
    state.isOpen = false;
    const win = document.getElementById('gb-wa-window');
    if (win) win.classList.add('hidden');
  }

  function appendUserMessage(text) {
    const body = document.getElementById('gb-wa-body');
    if (!body) return;

    const msgEl = document.createElement('div');
    msgEl.className = 'gb-wa-msg outgoing';
    msgEl.innerHTML = `
      <div>${escapeHtml(text)}</div>
      <div class="gb-wa-msg-meta">
        <span>${getNowTime()}</span>
        <span class="gb-wa-checks">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 6 11 15 7 11"></polyline><polyline points="22 10 15 19 13 17"></polyline></svg>
        </span>
      </div>
    `;
    body.appendChild(msgEl);
    body.scrollTop = body.scrollHeight;

    state.history.push({ role: 'user', content: text });
  }

  function showTypingIndicator() {
    state.isTyping = true;
    const body = document.getElementById('gb-wa-body');
    const status = document.getElementById('gb-wa-status');
    if (status) {
      status.textContent = 'escribiendo...';
      status.classList.add('typing');
    }

    if (!body) return;
    const typingEl = document.createElement('div');
    typingEl.className = 'gb-wa-typing-bubble';
    typingEl.id = 'gb-wa-typing-bubble';
    typingEl.innerHTML = `
      <div class="gb-wa-dot"></div>
      <div class="gb-wa-dot"></div>
      <div class="gb-wa-dot"></div>
    `;
    body.appendChild(typingEl);
    body.scrollTop = body.scrollHeight;
  }

  function removeTypingIndicator() {
    state.isTyping = false;
    const typingEl = document.getElementById('gb-wa-typing-bubble');
    if (typingEl) typingEl.remove();

    const status = document.getElementById('gb-wa-status');
    if (status) {
      status.textContent = 'en línea';
      status.classList.remove('typing');
    }
  }

  function appendBotMessage(replyText, actionData = null) {
    removeTypingIndicator();
    const body = document.getElementById('gb-wa-body');
    if (!body) return;

    const formattedReply = formatMarkdown(escapeHtml(replyText));

    const msgEl = document.createElement('div');
    msgEl.className = 'gb-wa-msg incoming';
    msgEl.innerHTML = `
      <div>${formattedReply}</div>
      ${actionData && actionData.whatsappUrl ? `
        <div class="gb-wa-action-card">
          <div style="font-size: 0.74rem; color: #8696a0; margin-bottom: 4px;">¿Deseas continuar directamente por WhatsApp?</div>
          <a href="${actionData.whatsappUrl}" target="_blank" rel="noopener noreferrer" class="gb-wa-action-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
            <span>Chatear con Especialista (${actionData.department || 'Oficial'})</span>
          </a>
        </div>
      ` : ''}
      <div class="gb-wa-msg-meta">${getNowTime()}</div>
    `;
    body.appendChild(msgEl);
    body.scrollTop = body.scrollHeight;

    state.history.push({ role: 'assistant', content: replyText });
  }

  async function handleSend() {
    const input = document.getElementById('gb-wa-input');
    if (!input || state.isTyping) return;

    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    appendUserMessage(text);
    showTypingIndicator();

    // Check user info from localStorage if available
    let clientName = 'Visitante Web';
    let clientPhone = '';
    try {
      const u = JSON.parse(localStorage.getItem('gb_user') || 'null');
      if (u) {
        clientName = u.name || u.username || 'Cliente Registrado';
        clientPhone = u.phone || '';
      }
    } catch (e) {}

    // Dynamic delay simulating natural typing (at least 600ms, plus text length)
    const typingDelay = Math.min(1800, 600 + Math.floor(Math.random() * 500));

    try {
      const res = await fetch('/api/ai-support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: state.history.slice(-6),
          clientName,
          clientPhone
        })
      });

      const data = await res.json();

      setTimeout(() => {
        if (data.reply) {
          appendBotMessage(data.reply, {
            department: data.department,
            whatsappUrl: data.whatsappUrl
          });
        } else {
          appendBotMessage('Disculpa, en este momento estamos actualizando el sistema. Puedes escribirnos directamente al WhatsApp oficial.', {
            department: 'general',
            whatsappUrl: `https://wa.me/${(state.phoneNumbers.general || '+595981000000').replace(/[^0-9]/g, '')}`
          });
        }
      }, typingDelay);
    } catch (err) {
      setTimeout(() => {
        appendBotMessage('¡Hola! Tuvimos un pequeño parpadeo de red. Puedes contactarnos de inmediato vía WhatsApp para ayudarte con tu compra.', {
          department: 'general',
          whatsappUrl: `https://wa.me/${(state.phoneNumbers.general || '+595981000000').replace(/[^0-9]/g, '')}`
        });
      }, 700);
    }
  }

  // Helpers
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatMarkdown(str) {
    if (!str) return '';
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  // Auto Init on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMarkup);
  } else {
    initMarkup();
  }
})();
