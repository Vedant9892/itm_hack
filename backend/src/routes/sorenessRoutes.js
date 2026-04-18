/**
 * Soreness Relief Routes
 *
 * POST /soreness/trigger
 *   - Validates the request body
 *   - Calls Groq directly (no n8n dependency)
 *   - Returns the AI-generated recovery plan
 *
 * POST /soreness/feedback
 *   - Stores the post-plan feedback score in Supabase
 */

const express = require('express');
const Groq = require('groq-sdk');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// ─── Supabase Client ──────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// ─── Groq Client ──────────────────────────────────────────────────────────────
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── POST /soreness/trigger ───────────────────────────────────────────────────
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

  const muscleList = sore_muscles.join(', ');

  const prompt = `You are a professional sports physiotherapist and recovery coach.
A user reports soreness in the following muscle groups: ${muscleList}.

Create a targeted recovery plan with:
1. 4-6 rehabilitation exercises (low intensity, recovery-focused)
2. 4-6 targeted stretches (static and dynamic)

For each exercise or stretch, provide:
- id: unique string (e.g., "ex_1", "st_1")
- name: clear exercise name
- sets: number of sets (for exercises only, null for stretches)
- reps: rep range as string (e.g., "12-15") or null
- duration: time string (e.g., "30s", "45s", "1 min")
- description: 1-2 sentence clear instruction
- muscle: which muscle group this targets
- intensity: "low" | "medium" | "rest"
- tips: one key form tip

Respond ONLY with valid JSON in this exact structure (no markdown, no explanation):
{
  "plan_title": "Recovery Plan for ${muscleList}",
  "estimated_duration": "X mins",
  "exercises": [...],
  "stretches": [...],
  "recovery_tips": ["tip1", "tip2", "tip3"]
}`;

  try {
    // ── Call Groq directly ─────────────────────────────────────────────────
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a professional sports physiotherapist. Always respond with valid JSON only, no markdown.'
        },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.4,
      max_tokens: 2048,
      response_format: { type: 'json_object' }
    });

    const rawContent = chatCompletion.choices[0]?.message?.content || '';
    let planData;
    try {
      const cleaned = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
      planData = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('[Soreness] Failed to parse Groq response:', parseErr.message);
      return res.status(500).json({
        success: false,
        error: 'Failed to parse AI response. Please try again.'
      });
    }

    // ── Normalise IDs on every item ──────────────────────────────────────
    const exercises = (planData.exercises || []).map((ex, i) => ({
      ...ex,
      id: ex.id || `ex_${i + 1}`,
      type: 'exercise'
    }));

    const stretches = (planData.stretches || []).map((st, i) => ({
      ...st,
      id: st.id || `st_${i + 1}`,
      type: 'stretch',
      sets: st.sets || null,
      reps: st.reps || null
    }));

    const responsePayload = {
      success: true,
      plan_title: planData.plan_title || `Recovery Plan for ${muscleList}`,
      estimated_duration: planData.estimated_duration || '20-30 mins',
      muscles: sore_muscles,
      exercises,
      stretches,
      recovery_tips: planData.recovery_tips || [],
      generated_at: new Date().toISOString(),
      user_id: user_id || 'anonymous'
    };

    // ── Optionally persist the generated plan in Supabase ────────────────
    if (user_id) {
      try {
        await supabase.from('soreness_plans').insert({
          user_id,
          sore_muscles,
          plan_data: responsePayload,
          generated_at: responsePayload.generated_at
        });
      } catch (dbErr) {
        // Non-blocking — don't fail the response if DB insert fails
        console.warn('[Soreness] DB insert skipped:', dbErr.message);
      }
    }

    return res.status(200).json(responsePayload);

  } catch (error) {
    console.error('[Soreness] Trigger error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate soreness plan.'
    });
  }
});

// ─── POST /soreness/feedback ──────────────────────────────────────────────────
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
