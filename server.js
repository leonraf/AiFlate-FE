const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const { CartesiaClient } = require('@cartesia/cartesia-js');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());

// Map in memoria per sessioni attive
const activeSessions = new Map();

// Config Cartesia
const cartesia = new CartesiaClient({
    apiKey: process.env.CARTESIA_API_KEY,
});

// Genera sessionId univoco
function generateSessionId() {
    return uuidv4();
}

// Endpoint callback da n8n
app.post('/callback/n8n', async (req, res) => {
    const { sessionId, message_text } = req.body;

    console.log(`[CALLBACK] Ricevuto per sessionId: ${sessionId}`);

    const ws = activeSessions.get(sessionId);
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        console.log(`[CALLBACK] Sessione ${sessionId} non trovata o chiusa`);
        return res.status(404).json({ error: 'Session not found' });
    }

    // Rispondi subito a n8n (200 OK)
    res.status(200).json({ status: 'received' });

    // In background: TTS streaming
    (async () => {
        try {
            console.log(`[TTS] Inizio streaming per ${sessionId}`);

            // Invia TTS start
            ws.send(JSON.stringify({
                type: 'tts_start',
                message: message_text
            }));

            // Crea una connessione WebSocket Cartesia per il TTS
            const websocket = cartesia.tts.websocket({
                container: 'raw',
                encoding: 'pcm_s16le',
                sampleRate: 44100
            });

            console.log(`[TTS] WebSocket Cartesia creato`);

            // Invia la richiesta TTS
            const response = await websocket.send({
                modelId: 'sonic-2',
                transcript: message_text,
                voice: {
                    mode: 'id',
                    id: 'd609f27f-f1a4-410f-85bb-10037b4fba99'
                }
            });

            console.log(`[TTS] Richiesta inviata, in attesa di audio...`);

            let chunkCount = 0;

            let isDoneSent = false;

            // Ascolta gli eventi
            response.on('message', (message) => {
                // Cartesia SDK emits OBJECTS (already parsed JSON) or JSON strings.
                // Doc: { type: "chunk", data: "base64...", ... }

                try {
                    let msgObj = message;
                    if (typeof message === 'string') {
                        try {
                            msgObj = JSON.parse(message);
                        } catch (e) {
                            console.error("[TTS] Failed to parse message string:", e);
                            return;
                        }
                    }

                    if (msgObj && msgObj.type === 'chunk' && msgObj.data) {
                        if (ws.readyState === WebSocket.OPEN) {
                            ws.send(JSON.stringify({
                                type: 'audio_chunk',
                                data: msgObj.data
                            }));
                            chunkCount++;
                        }
                    } else if (msgObj && msgObj.type === 'done') {
                        // Explicit 'done' message from Cartesia
                        console.log(`[TTS] Ricevuto messaggio 'done' da Cartesia`);
                        if (ws.readyState === WebSocket.OPEN && !isDoneSent) {
                            ws.send(JSON.stringify({
                                type: 'tts_end',
                                message: 'Done'
                            }));
                            isDoneSent = true;
                        }
                    } else if (msgObj && msgObj.type === 'error') {
                        console.error(`[TTS] Errore da Cartesia:`, msgObj.error);
                    }

                } catch (err) {
                    console.error(`[TTS] Error handling message:`, err.message);
                }
            });

            response.on('error', (error) => {
                console.error(`[TTS] Evento error:`, error.message);
            });

            response.on('end', () => {
                console.log(`[TTS] Evento stream end (socket closed)`);
                if (ws.readyState === WebSocket.OPEN && !isDoneSent) {
                    ws.send(JSON.stringify({
                        type: 'tts_end',
                        message: 'Stream Ended'
                    }));
                    isDoneSent = true;
                }
            });

            // Aspetta il completamento dello stream (max 30 secondi)
            await new Promise((resolve) => {
                const timeout = setTimeout(() => {
                    console.log(`[TTS] Timeout di 30 secondi raggiunto`);
                    resolve();
                }, 30000);

                response.once('end', () => {
                    clearTimeout(timeout);
                    resolve();
                });
            });

            console.log(`[TTS] Streaming completato - ${chunkCount} chunks inviati`);

        } catch (error) {
            console.error('[TTS] Errore:', error.message);
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'tts_error',
                    message: error.message
                }));
            }
        }
    })();
});

// WebSocket connections
wss.on('connection', (ws) => {
    const sessionId = generateSessionId();

    activeSessions.set(sessionId, ws);

    console.log(`[WS] Nuova connessione, sessionId: ${sessionId}`);

    ws.send(JSON.stringify({
        type: 'session_start',
        sessionId
    }));

    ws.on('close', () => {
        activeSessions.delete(sessionId);
        console.log(`[WS] Sessione ${sessionId} chiusa`);
    });

    ws.on('error', (err) => {
        console.error(`[WS] Errore ${sessionId}:`, err.message);
        activeSessions.delete(sessionId);
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        activeSessions: activeSessions.size,
        cartesiaConfigured: !!process.env.CARTESIA_API_KEY
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] Listening on port ${PORT}`);
});