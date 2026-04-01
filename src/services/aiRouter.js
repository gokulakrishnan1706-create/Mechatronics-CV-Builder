/**
 * aiRouter.js — Smart AI routing across multiple Groq keys and models
 *
 * Routes tasks to the best key+model combination:
 *   'extract' → Key B / llama-3.3-70b (fast, reliable JSON)
 *   'write'   → Key A / gpt-oss-120b (best creative quality)
 *   'polish'  → Key A / gpt-oss-120b (best creative quality)
 *
 * Fallback chain: primary key → other key → OpenRouter
 */

// ─────────────────────────────────────────────────────────────
// MODEL CONFIGS PER TASK TYPE
// ─────────────────────────────────────────────────────────────

const TASK_CONFIGS = {
    extract: {
        // Fast, reliable JSON structuring — uses Key B
        primaryKey: () => import.meta.env.VITE_GROQ_API_KEY_2,
        fallbackKey: () => import.meta.env.VITE_GROQ_API_KEY,
        model: 'llama-3.3-70b-versatile',
        fallbackModel: 'llama-3.3-70b-versatile',
        temperature: 0.2,
        maxTokens: 3000,
        jsonMode: true,
    },
    write: {
        // Creative CV writing — uses Key A
        primaryKey: () => import.meta.env.VITE_GROQ_API_KEY,
        fallbackKey: () => import.meta.env.VITE_GROQ_API_KEY_2,
        model: 'llama-3.3-70b-versatile',
        fallbackModel: 'llama-3.3-70b-versatile',
        temperature: 0.5,
        maxTokens: 4096,
        jsonMode: true,
    },
    polish: {
        // Section-level creative rewrites — uses Key A
        primaryKey: () => import.meta.env.VITE_GROQ_API_KEY,
        fallbackKey: () => import.meta.env.VITE_GROQ_API_KEY_2,
        model: 'llama-3.3-70b-versatile',
        fallbackModel: 'llama-3.3-70b-versatile',
        temperature: 0.5,
        maxTokens: 2048,
        jsonMode: false, // polish can return plain text (objectives) or JSON (bullets)
    },
};

// ─────────────────────────────────────────────────────────────
// GROQ CALL HELPER
// ─────────────────────────────────────────────────────────────

const callGroq = async (apiKey, model, prompt, { temperature, maxTokens, jsonMode }) => {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature,
            max_tokens: maxTokens,
            ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
        }),
    });

    if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg = errData?.error?.message || `HTTP ${res.status}`;
        // Rate limit → let caller try fallback
        if (res.status === 429) throw new Error(`RATE_LIMITED: ${msg}`);
        throw new Error(`GROQ_ERROR: ${msg}`);
    }

    const data = await res.json();
    return data.choices[0].message.content?.trim();
};

// ─────────────────────────────────────────────────────────────
// OPENROUTER FALLBACK
// ─────────────────────────────────────────────────────────────

const callOpenRouter = async (prompt, { temperature, maxTokens }) => {
    const orKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!orKey) throw new Error('No OpenRouter key available');

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${orKey}`,
            'HTTP-Referer': 'https://gokulcv.app',
            'X-Title': 'GokulCV',
        },
        body: JSON.stringify({
            model: 'meta-llama/llama-3.3-70b-instruct:free',
            messages: [{ role: 'user', content: prompt }],
            temperature,
            max_tokens: maxTokens,
        }),
    });

    if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(`OpenRouter error: ${errData?.error?.message || res.status}`);
    }

    const data = await res.json();
    return data.choices[0].message.content?.trim();
};

// ─────────────────────────────────────────────────────────────
// MAIN ROUTER — callAI(prompt, taskType, options?)
// ─────────────────────────────────────────────────────────────

/**
 * Route an AI call to the best key+model for the task type.
 *
 * @param {string} prompt - The full prompt to send
 * @param {'extract'|'write'|'polish'} taskType - What kind of work this is
 * @param {object} [overrides] - Optional overrides: { jsonMode, temperature, maxTokens }
 * @returns {Promise<string>} - Raw AI response text
 */
export const callAI = async (prompt, taskType = 'write', overrides = {}) => {
    const cfg = TASK_CONFIGS[taskType] || TASK_CONFIGS.write;
    const opts = {
        temperature: overrides.temperature ?? cfg.temperature,
        maxTokens: overrides.maxTokens ?? cfg.maxTokens,
        jsonMode: overrides.jsonMode ?? cfg.jsonMode,
    };

    const primaryKey = cfg.primaryKey();
    const fallbackKey = cfg.fallbackKey();

    // ── Attempt 1: primary key + primary model ──
    if (primaryKey) {
        try {
            const result = await callGroq(primaryKey, cfg.model, prompt, opts);
            console.log(`[aiRouter] ✓ ${taskType} → ${cfg.model} (primary key)`);
            return result;
        } catch (err) {
            console.warn(`[aiRouter] Primary failed for ${taskType}:`, err.message);
        }
    }

    // ── Attempt 2: fallback key + fallback model ──
    if (fallbackKey && fallbackKey !== primaryKey) {
        try {
            const result = await callGroq(fallbackKey, cfg.fallbackModel, prompt, opts);
            console.log(`[aiRouter] ✓ ${taskType} → ${cfg.fallbackModel} (fallback key)`);
            return result;
        } catch (err) {
            console.warn(`[aiRouter] Fallback key failed for ${taskType}:`, err.message);
        }
    }

    // ── Attempt 3: OpenRouter ──
    try {
        const result = await callOpenRouter(prompt, opts);
        console.log(`[aiRouter] ✓ ${taskType} → OpenRouter (final fallback)`);
        return result;
    } catch (err) {
        console.error(`[aiRouter] All providers failed for ${taskType}:`, err.message);
        throw new Error('All AI providers failed. Check your API keys and try again.');
    }
};

/**
 * Check if any AI keys are available at all.
 * @returns {boolean}
 */
export const hasAnyKey = () => {
    return !!(
        import.meta.env.VITE_GROQ_API_KEY ||
        import.meta.env.VITE_GROQ_API_KEY_2 ||
        import.meta.env.VITE_OPENROUTER_API_KEY
    );
};
