/**
 * Soreness Relief Routes
 * 
 * POST /soreness/trigger
 *   - Validates the request body
 *   - Forwards to n8n webhook
 *   - Returns the AI-generated recovery plan
 * 
 * POST /soreness/feedback
 *   - Stores the post-plan feedback score in Supabase
 */

const express = require('express');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// ─── Supabase Client ──────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// ─── n8n Webhook URL ──────────────────────────────────────────────────────────
// ⚠️  REPLACE THIS with your actual n8n webhook URL after importing the workflow.
// Default (local n8n): http://localhost:5678/webhook/soreness-relief
// Production n8n:      https://your-n8n-domain.com/webhook/soreness-relief
//
// You can also set it via the .env file:  N8N_SORENESS_WEBHOOK=<url>
const N8N_SORENESS_URL =
  process.env.N8N_SORENESS_WEBHOOK || 'http://localhost:5678/webhook/soreness-relief';

// ─── POST /soreness/trigger ───────────────────────────────────────────────────
/**
 * Body:
 * {
 *   "user_id": "uuid",           // optional
 *   "sore_muscles": ["Quadriceps", "Hamstrings"]  // required, 1+ muscles
 * }
 *
 * Response (from n8n):
 * {
 *   "success": true,
 *   "plan_title": "...",
 *   "estimated_duration": "25 mins",
 *   "muscles": [...],
 *   "exercises": [...],
 *   "stretches": [...],
 *   "recovery_tips": [...],
 *   "generated_at": "ISO string"
 * }
 */
router.post('/trigger', async (req, res) => {
  const { user_id, sore_muscles } = req.body;

  // ── Validation ──────────────────────────────────────────────────────────────
  if (!sore_muscles || !Array.isArray(sore_muscles) || sore_muscles.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'sore_muscles array is required and must contain at least one muscle group.'
    });
  }

  if (sore_muscles.length > 10) {
    return res.status(400).json({
      success: false,
      error: 'Maximum 10 muscle groups allowed per request.'
    });
  }

  // ── Build payload for n8n ──────────────────────────────────────────────────
  const payload = {
    user_id: user_id || 'anonymous',
    sore_muscles,
    timestamp: new Date().toISOString(),
    request_type: 'soreness_relief'
  };

  try {
    // ── Forward to n8n Webhook ─────────────────────────────────────────────
    const n8nResponse = await axios.post(N8N_SORENESS_URL, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 60000 // 60 seconds — AI can take a moment
    });

    const planData = n8nResponse.data;

    // ── Optionally persist the generated plan in Supabase ──────────────────
    if (user_id && planData.success) {
      try {
        await supabase.from('soreness_plans').insert({
          user_id,
          sore_muscles,
          plan_data: planData,
          generated_at: planData.generated_at || new Date().toISOString()
        });
      } catch (dbErr) {
        // Non-blocking — don't fail the response if DB insert fails
        console.warn('[Soreness] DB insert skipped:', dbErr.message);
      }
    }

    return res.status(200).json(planData);

  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({
        success: false,
        error: 'n8n service is not reachable. Make sure n8n is running and the webhook URL is correct.',
        webhook_url: N8N_SORENESS_URL
      });
    }

    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        success: false,
        error: 'n8n took too long to respond. The AI model may be overloaded, try again.'
      });
    }

    console.error('[Soreness] Trigger error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.response?.data?.error || error.message
    });
  }
});

// ─── POST /soreness/feedback ──────────────────────────────────────────────────
/**
 * Store user's post-plan pain feedback score.
 *
 * Body:
 * {
 *   "user_id": "uuid",
 *   "sore_muscles": ["Quadriceps"],
 *   "pain_score_before": 7,   // optional, if tracked at selection
 *   "relief_score": 8,        // 1-10, how much better they feel (required)
 *   "plan_title": "..."       // optional, for record keeping
 * }
 */
router.post('/feedback', async (req, res) => {
  const { user_id, sore_muscles, pain_score_before, relief_score, plan_title } = req.body;

  if (!relief_score || relief_score < 1 || relief_score > 10) {
    return res.status(400).json({
      success: false,
      error: 'relief_score is required and must be between 1 and 10.'
    });
  }

  try {
    const { data, error } = await supabase
      .from('soreness_feedback')
      .insert({
        user_id: user_id || null,
        sore_muscles: sore_muscles || [],
        pain_score_before: pain_score_before || null,
        relief_score,
        plan_title: plan_title || null,
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      // Table might not exist yet — non-fatal, still return success
      console.warn('[Soreness] Feedback DB error (table may not exist):', error.message);
      return res.status(200).json({
        success: true,
        message: 'Feedback received (DB storage pending table setup).',
        relief_score
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Feedback saved successfully.',
      feedback: data
    });

  } catch (error) {
    console.error('[Soreness] Feedback error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
