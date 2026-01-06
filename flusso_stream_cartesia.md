🎯 Obiettivo
Creare un servizio backend Node.js che funge da bridge WebSocket per lo streaming audio vocale tramite Cartesia TTS. Il server riceve callback da n8n e streama audio al client FE corretto tramite sessionId.
🏗️ Architettura
Stack tecnologico:
Express.js (HTTP server)
WebSocket (ws library)
Cartesia API (TTS streaming)
Node.js 18+
Deployabile su Railway
Database: NO - solo Map JavaScript in memoria per tracciare sessioni attive
🔄 FLUSSO CORRETTO (CRITICO)
text
1. FE connette a WebSocket
├─ Server genera sessionId univoco (UUID)
├─ Invia al FE: { type: 'session_start', sessionId }
└─ FE riceve e salva sessionId

2. Utente invia messaggio dal FE
└─ FE chiama n8n webhook (HTTP POST DIRETTO)
├─ URL: https://primary-production-2282.up.railway.app/webhook/voicechat
├─ Body: { sessionId, userMessage, conversationHistory }
└─ n8n elabora (Deepgram STT + Requesty LLM)

3. n8n completa elaborazione
└─ n8n chiama endpoint server (HTTP POST CALLBACK)
├─ URL: https://cartesia-stream-production.up.railway.app/callback/n8n
├─ Body: { sessionId, message_text: "risposta" }
└─ Non aspetta risposta (fire and forget)

4. server.js riceve callback
├─ Cerca sessionId nella Map activeSessions
├─ Se trovata: rispondi subito a n8n con 200 OK
├─ In background: chiama Cartesia TTS per il testo
├─ Riceve stream audio WAV da Cartesia
├─ Suddivide in chunks
└─ Invia via WebSocket al client:
├─ { type: 'tts_start', message: testo }
├─ { type: 'audio_chunk', data: base64Chunk } × N
└─ { type: 'tts_end', message: 'Done' }

5. FE riceve audio via WebSocket
├─ Decodifica base64 chunks
├─ Accumula in Blob WAV
├─ Riproduce audio