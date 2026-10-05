import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { DEFAULT_PUBLIC_LISTS } from './src/data/defaultPublicLists.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Helper to safely extract JSON from AI response text
function extractJson(rawText: string) {
  let cleaned = rawText.trim();
  // Strip code block markers if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
  }

  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  return JSON.parse(cleaned);
}

// System prompt to enforce D&D 5e / 2024 spell format
const SYSTEM_PROMPT = `Eres un diseñador senior de D&D 5e / 2024 y archimago arcano de Dragopedia.
Tu objetivo es diseñar un conjuro de D&D perfectamente balanceado y evocador a partir de la idea del usuario.
Debes responder ÚNICAMENTE con un objeto JSON válido (sin comentarios ni texto introductorio).

Esquema JSON requerido:
{
  "name": "Nombre evocador en Español (ej. Abrazo de la Reina Cuervo)",
  "nameEn": "Nombre en Inglés (ej. Raven Queen's Embrace)",
  "level": 0-9 (número entero, 0 para Truco / Cantrip),
  "school": "Abjuración" | "Adivinación" | "Conjuración" | "Encantamiento" | "Evocación" | "Ilusión" | "Nigromancia" | "Transmutación" | "Reflexión",
  "castingTime": "1 acción" | "1 acción adicional" | "1 reacción" | "1 minuto" | "10 minutos",
  "range": "Personal" | "Toque" | "9 metros (30 pies)" | "18 metros (60 pies)" | "36 metros (120 pies)",
  "duration": "Instantáneo" | "Concentración, hasta 1 minuto" | "Concentración, hasta 10 minutos" | "1 hora" | "24 horas",
  "concentration": true | false,
  "ritual": true | false,
  "verbal": true | false,
  "somatic": true | false,
  "material": true | false,
  "materialDesc": "Descripción breve del componente material si material es true, o dejar vacío",
  "classes": ["Mago", "Brujo", etc. (usar Artífice, Bardo, Brujo, Clérigo, Druida, Explorador, Hechicero, Mago, Paladín)],
  "damageType": "Fuego" | "Frío" | "Relámpago" | "Fuerza" | "Necrótico" | "Radiante" | "Psíquico" | "Ácido" | "Veneno" | "Trueno" | "Contundente" | "Perforante" | "Cortante" | "Ninguno",
  "origin": "Infernal" | "Elemental" | "Feérico" | "Celestial" | "Mortal" | "Shadowfell" | "Astral" | "Onírico",
  "description": "Texto detallado del conjuro. Usa formato Markdown (**negrita** para tiradas como **1d8**, *cursiva* para nombres, etc.). Explica mecánicas precisas de D&D 5e: tirada de ataque o salvación (CD, ventaja/desventaja), efectos en éxito/fallo.",
  "higherLevels": "Descripción de lo que ocurre al lanzarlo usando una ranura de nivel superior (ej. El daño aumenta en **1d8** por cada nivel de ranura superior al actual). Dejar vacío si es truco de nivel 0.",
  "suggestedIcon": "Palabra clave en inglés para sugerir un icono de BG3 (ej. fireball, ice, raven, shadow, blade, lightning, heal, shield, poison, darkness)"
}`;

// AI Status Endpoint
app.get('/api/ai/status', (req, res) => {
  res.json({
    cerebrasAvailable: !!process.env.CEREBRAS_API_KEY,
    mistralAvailable: !!process.env.MISTRAL_API_KEY,
    geminiAvailable: !!process.env.GEMINI_API_KEY,
    providers: ['auto', 'cerebras', 'mistral'],
  });
});

// AI Spell Generation Endpoint
app.post('/api/ai/generate-spell', async (req, res) => {
  try {
    const { prompt, level, school, provider = 'auto', language = 'es' } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      res.status(400).json({ error: 'El prompt descriptivo es requerido.' });
      return;
    }

    const userMessage = `Idea para el conjuro: "${prompt.trim()}".
${level !== undefined && level !== null ? `Nivel deseado: ${level}.` : ''}
${school ? `Escuela deseada: ${school}.` : ''}
Idioma de salida: ${language === 'en' ? 'Inglés' : 'Español'}.`;

    const cerebrasKey = process.env.CEREBRAS_API_KEY || '';
    const mistralKey = process.env.MISTRAL_API_KEY || '';

    let lastError: any = null;

    // 1. Try Cerebras if requested or in auto mode
    if ((provider === 'cerebras' || provider === 'auto') && cerebrasKey) {
      try {
        const cerebrasResp = await fetch('https://api.cerebras.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cerebrasKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-oss-120b',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: userMessage },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
          }),
        });

        if (cerebrasResp.ok) {
          const data = await cerebrasResp.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const parsed = extractJson(content);
            res.json({
              spell: parsed,
              providerUsed: 'Cerebras AI (gpt-oss-120b)',
            });
            return;
          }
        } else {
          const errBody = await cerebrasResp.text();
          console.warn('Cerebras API non-ok:', cerebrasResp.status, errBody);
          lastError = new Error(`Cerebras error (${cerebrasResp.status}): ${errBody}`);
        }
      } catch (err: any) {
        console.warn('Cerebras API exception:', err.message);
        lastError = err;
      }
    }

    // 2. Try Mistral AI if requested, or as robust fallback
    if ((provider === 'mistral' || provider === 'auto' || lastError) && mistralKey) {
      try {
        const mistralResp = await fetch('https://api.mistral.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mistralKey}`,
          },
          body: JSON.stringify({
            model: 'open-mistral-7b',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: userMessage },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
          }),
        });

        if (mistralResp.ok) {
          const data = await mistralResp.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const parsed = extractJson(content);
            res.json({
              spell: parsed,
              providerUsed: 'Mistral AI (ministral-8b)',
            });
            return;
          }
        } else {
          const errBody = await mistralResp.text();
          console.warn('Mistral API non-ok:', mistralResp.status, errBody);
          lastError = new Error(`Mistral error (${mistralResp.status}): ${errBody}`);
        }
      } catch (err: any) {
        console.warn('Mistral API exception:', err.message);
        lastError = err;
      }
    }

    // If both failed or requested provider failed
    res.status(500).json({
      error: 'No se pudo generar el hechizo con la IA seleccionada.',
      details: lastError?.message || 'Error desconocido del proveedor de IA.',
    });
  } catch (error: any) {
    console.error('AI generate spell error:', error);
    res.status(500).json({
      error: 'Error interno en el servidor al generar el hechizo.',
      details: error.message,
    });
  }
});

// --- Public Spell Lists System ---
const DATA_FILE = path.join(__dirname, 'public_spell_lists.json');
let publicLists: any[] = [];

// Load persisted lists if available
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      publicLists = parsed;
    }
  }
} catch (e) {
  console.warn('Could not read public_spell_lists.json:', e);
}

function savePublicLists() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(publicLists, null, 2), 'utf8');
  } catch (e) {
    console.warn('Could not save public_spell_lists.json', e);
  }
}

// Get all public spell lists
app.get('/api/public-lists', (req, res) => {
  res.json({ lists: publicLists });
});

// Get a specific public spell list by ID
app.get('/api/public-lists/:id', (req, res) => {
  const found = publicLists.find((l) => l.id === req.params.id);
  if (!found) {
    res.status(404).json({ error: 'Lista de conjuros no encontrada' });
    return;
  }
  res.json({ list: found });
});

// Create or update a public spell list
app.post('/api/public-lists', (req, res) => {
  try {
    const { id, name, description, icon, color, spellIds, author, tags } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ error: 'El nombre de la lista es requerido' });
      return;
    }

    const listId = id || `pub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const existingIndex = publicLists.findIndex((l) => l.id === listId);

    const newList = {
      id: listId,
      name: name.trim(),
      description: (description || '').trim(),
      icon: icon || '📖',
      color: color || '#bafafd',
      spellIds: Array.isArray(spellIds) ? spellIds : [],
      author: (author || 'Archimago Viajero').trim(),
      isPublic: true,
      likes: existingIndex >= 0 ? (publicLists[existingIndex].likes || 0) : 0,
      createdAt: existingIndex >= 0 ? publicLists[existingIndex].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: Array.isArray(tags) && tags.length > 0 ? tags : ['Comunidad'],
    };

    if (existingIndex >= 0) {
      publicLists[existingIndex] = newList;
    } else {
      publicLists.unshift(newList);
    }

    savePublicLists();
    res.json({ success: true, list: newList });
  } catch (err: any) {
    res.status(500).json({ error: 'Error guardando lista', details: err.message });
  }
});

// Increment like on a public spell list
app.post('/api/public-lists/:id/like', (req, res) => {
  const found = publicLists.find((l) => l.id === req.params.id);
  if (!found) {
    res.status(404).json({ error: 'Lista no encontrada' });
    return;
  }
  found.likes = (found.likes || 0) + 1;
  savePublicLists();
  res.json({ success: true, likes: found.likes });
});

// Serve public static assets
app.use(express.static(path.join(__dirname, 'public')));

// Configure Vite middleware in development or serve static in production
const isProd = process.env.NODE_ENV === 'production';

if (!isProd) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      host: '0.0.0.0',
    },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port} [${isProd ? 'production' : 'development'}]`);
});
