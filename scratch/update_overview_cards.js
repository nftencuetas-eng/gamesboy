import fs from 'fs';

let html = fs.readFileSync('client/admin.html', 'utf8');

// 1. Add Herramientas de Trabajo & IA card to Bloque 2 in Overview
const block2Target = `              <!-- Módulo 7: Servicios de Streaming -->
              <div class="admin-module-card" onclick="switchAdminTab('tab-streaming-moderation')">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div class="admin-module-icon-wrap" style="color: #ef4444; background: rgba(239, 68, 68, 0.1);">📺</div>
                    <span class="btn-admin-action emerald" style="padding: 2px 8px; font-size: 0.7rem;">2 Pestañas</span>
                  </div>
                  <h4><span>7. Servicios de Streaming</span></h4>
                  <p>Catálogo de plataformas oficiales (precios por asiento en Gs., cupos, portadas e íconos) y moderación de cuentas de vendedores.</p>
                </div>
                <div class="admin-module-footer">
                  <span style="font-size: 0.74rem; color: var(--text-tertiary);">Catálogo & Moderación</span>
                  <span class="admin-module-btn">Entrar al Módulo ➔</span>
                </div>
              </div>`;

const block2Replacement = `              <!-- Módulo 7: Servicios de Streaming -->
              <div class="admin-module-card" onclick="switchAdminTab('tab-streaming-moderation')">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div class="admin-module-icon-wrap" style="color: #ef4444; background: rgba(239, 68, 68, 0.1);">📺</div>
                    <span class="btn-admin-action emerald" style="padding: 2px 8px; font-size: 0.7rem;">Streaming</span>
                  </div>
                  <h4><span>07. Cuentas Streaming</span></h4>
                  <p>Catálogo oficial (precios por asiento en Gs., cupos, portadas e íconos) y moderación de cuentas en Bóveda.</p>
                </div>
                <div class="admin-module-footer">
                  <span style="font-size: 0.74rem; color: var(--text-tertiary);">Entretenimiento</span>
                  <span class="admin-module-btn">Entrar al Módulo ➔</span>
                </div>
              </div>

              <!-- Módulo 8: Herramientas de Trabajo & IA -->
              <div class="admin-module-card" onclick="switchAdminTab('tab-work-tools')" style="border-color: rgba(168, 85, 247, 0.3);">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div class="admin-module-icon-wrap" style="color: #c084fc; background: rgba(168, 85, 247, 0.12);">🤖</div>
                    <span class="btn-admin-action purple" style="padding: 2px 8px; font-size: 0.7rem;">Productividad & IA</span>
                  </div>
                  <h4><span>08. Herramientas & IA</span></h4>
                  <p>Cuentas compartidas oficiales de ChatGPT Plus (GPT-4o), Claude Pro, Gemini, Minea Dropshipping, Canva y Midjourney.</p>
                </div>
                <div class="admin-module-footer">
                  <span style="font-size: 0.74rem; color: var(--text-tertiary);">Cuentas de IA</span>
                  <span class="admin-module-btn">Entrar al Módulo ➔</span>
                </div>
              </div>`;

if (html.includes(block2Target)) {
  html = html.replace(block2Target, block2Replacement);
  console.log('✅ Added Herramientas & IA card to Overview Bloque 2!');
}

// 2. Add WhatsApp IA & Muro de Notas card to Bloque 3 in Overview
const block3Target = `              <!-- Módulo 10: Impulso Digital SMM -->
              <div class="admin-module-card" onclick="switchAdminTab('tab-smm-orders')">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div class="admin-module-icon-wrap" style="color: #ec4899; background: rgba(236, 72, 153, 0.1);">📈</div>
                    <span class="btn-admin-action red" style="padding: 2px 8px; font-size: 0.7rem;" id="overview-badge-smm-count">0 pedidos</span>
                  </div>
                  <h4><span>10. Redes Sociales (Crecimiento)</span></h4>
                  <p>Gestión y despacho manual de seguidores, likes, vistas y miembros en redes sociales con entrega en 24 a 48 hs.</p>
                </div>
                <div class="admin-module-footer">
                  <span style="font-size: 0.74rem; color: var(--text-tertiary);">SMM Digital</span>
                  <span class="admin-module-btn">Entrar al Módulo ➔</span>
                </div>
              </div>`;

const block3Replacement = `              <!-- Módulo 10: Impulso Digital SMM -->
              <div class="admin-module-card" onclick="switchAdminTab('tab-smm-orders')">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div class="admin-module-icon-wrap" style="color: #ec4899; background: rgba(236, 72, 153, 0.1);">📈</div>
                    <span class="btn-admin-action red" style="padding: 2px 8px; font-size: 0.7rem;" id="overview-badge-smm-count">0 pedidos</span>
                  </div>
                  <h4><span>03. Redes Sociales (SMM)</span></h4>
                  <p>Gestión y despacho manual de seguidores, likes, vistas y miembros en redes sociales con entrega en 24 a 48 hs.</p>
                </div>
                <div class="admin-module-footer">
                  <span style="font-size: 0.74rem; color: var(--text-tertiary);">SMM Digital</span>
                  <span class="admin-module-btn">Entrar al Módulo ➔</span>
                </div>
              </div>

              <!-- Módulo 9: Agente WhatsApp IA & Muro de Notas -->
              <div class="admin-module-card" onclick="switchAdminTab('tab-ai-whatsapp')" style="border-color: rgba(37, 211, 102, 0.35);">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div class="admin-module-icon-wrap" style="color: #25D366; background: rgba(37, 211, 102, 0.12);">💬</div>
                    <span class="btn-admin-action emerald" style="padding: 2px 8px; font-size: 0.7rem;">WhatsApp 24/7</span>
                  </div>
                  <h4><span>09. WhatsApp IA & Muro Notas</span></h4>
                  <p>Entrenamiento del asistente de atención al cliente, enrutamiento telefónico por área y notas de leads detectados.</p>
                </div>
                <div class="admin-module-footer">
                  <span style="font-size: 0.74rem; color: var(--text-tertiary);">Soporte IA</span>
                  <span class="admin-module-btn">Entrar al Módulo ➔</span>
                </div>
              </div>`;

if (html.includes(block3Target)) {
  html = html.replace(block3Target, block3Replacement);
  console.log('✅ Added WhatsApp IA & Notas card to Overview Bloque 3!');
}

fs.writeFileSync('client/admin.html', html, 'utf8');
console.log('✅ Overview block cards updated successfully in client/admin.html!');
