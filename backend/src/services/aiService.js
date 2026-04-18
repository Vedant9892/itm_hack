const Groq = require('groq-sdk');

/**
 * AI Service using Groq (Ultra-fast LPU inference).
 * Model: llama-3.3-70b-versatile
 */
class AIService {
  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.warn('GROQ_API_KEY is not defined in .env');
    }
    this.client = new Groq({ apiKey });
  }

  async generateDay1Workout(userProfile) {
    try {
      // Readiness defaults: assume average values if not provided
      const readiness = userProfile.todayReadiness || userProfile.readiness || {};
      const energetic =
        readiness.energetic ??
        readiness.energy ??
        readiness.energy_level ??
        5;
      const soreness =
        readiness.soreness ??
        readiness.soreness_level ??
        3;
      const stress =
        readiness.stress ??
        readiness.stress_level ??
        3;
      const sleepHours =
        readiness.sleep ??
        readiness.sleepDuration ??
        readiness.sleep_quality ??
        7;

      const equipment = Array.isArray(userProfile.equipment) ? userProfile.equipment : [];
      const injuries = Array.isArray(userProfile.injuries) ? userProfile.injuries : [];
      const strengthAssessment = userProfile.strengthAssessment || {};
      const pushups = strengthAssessment.pushups ?? 0;
      const squats = strengthAssessment.squats ?? 0;
      const plankSeconds = strengthAssessment.plankSeconds ?? 0;

      const prompt = `You are an expert AI Fitness Coach. Analyze the user profile and generate a personalized "Day 1 Workout" plan.

USER DATA:
- Gender: ${userProfile.gender}, Weight: ${userProfile.weight}kg, Height: ${userProfile.height}cm
- Goal: ${userProfile.goal}, Workout Type: ${userProfile.workoutType}
- Equipment: ${equipment.join(', ') || 'None'}
- Injuries/Conditions: ${injuries.join(', ') || 'None'}

STRENGTH ASSESSMENT:
- Pushups: ${pushups}
- Squats: ${squats}
- Plank: ${plankSeconds} seconds

TODAY'S READINESS:
- Energy Level: ${energetic}/10
- Muscle Soreness: ${soreness}/10
- Stress Level: ${stress}/10
- Sleep Last Night: ${sleepHours}/10

Based on this data, determine their experience level and generate a Day 1 workout, with estimated duration in minutes.
Give it a title for example, "Back - Biceps", "Chest - Triceps", "Legs - Shoulders", "Full Body", etc.
IMPORTANT: If the user has injuries, avoid exercises that aggravate those areas.
IMPORTANT: If sleep < 5 or stress > 7 or soreness > 7: REDUCE volume by 20% and use lighter exercises.
IMPORTANT: If energy >= 8 and stress <= 3 and soreness <= 3: INCREASE intensity.
Based on all the data, provide a readiness score (0-100) and a brief reason for any workout adjustments.

Return ONLY a valid JSON object (no markdown, no explanation):
{
  "experienceLevel": "Beginner | Intermediate | Advanced",
  "strengthScore": <number 0-100>,
  "title": "<title>",
  "estimatedDuration": "<duration>",
  "workoutAdjustment": "normal | reduced | increased",
  "readinessScore": <number 0-100>,
  "adjustmentReason": "<brief reason based on readiness>",
  "day1Workout": [
    { "exercise": "<name>", "sets": "<number>", "reps": "<range>", "reason": "<brief reason>" }
  ],
  "safetyNotes": "<specific advice based on injuries or conditions, or 'None' if no injuries>"
}`;

      const chatCompletion = await this.client.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });

      const text = chatCompletion.choices[0]?.message?.content || '';
      const parsed = JSON.parse(text);

      // Ensure readinessScore is always present even if model omits it.
      if (typeof parsed.readinessScore !== 'number' || Number.isNaN(parsed.readinessScore)) {
        const score = ((energetic * 10) + ((10 - soreness) * 10) + ((10 - stress) * 10) + ((sleepHours / 10) * 100)) / 4;
        parsed.readinessScore = Math.max(0, Math.min(100, Math.round(score)));
      }

      return parsed;

    } catch (error) {
      console.error('Groq AI Error:', error.message);
      throw new Error('AI analysis failed.');
    }
  }

  async generateNextWorkout(userProfile, feedbackData, lastWorkoutLogs) {
    try {
      const model = 'llama-3.3-70b-versatile';

      const prompt = `You are an expert AI Fitness Coach. Generate the NEXT adaptive workout based on:

USER PROFILE:
- Goal: ${userProfile.fitness_goal}, Type: ${userProfile.workout_type}
- Equipment: ${(userProfile.available_equipment || []).join(', ')}
- Injuries: ${(userProfile.injuries || []).join(', ') || 'None'}
- Experience Level: ${userProfile.experience_level || 'Unknown'}

TODAY'S FEEDBACK (Readiness Check):
- Sleep Quality: ${feedbackData.sleep_quality}/10
- Stress Level: ${feedbackData.stress_level}/10
- Soreness Level: ${feedbackData.soreness_level}/10

LAST WORKOUT PERFORMANCE:
${lastWorkoutLogs.length > 0
          ? lastWorkoutLogs.map(l => `- ${l.exercise_name}: ${l.set_number} sets x ${l.reps} reps @ ${l.weight_kg}kg (RPE ${l.rpe ?? 'N/A'})`).join('\n')
          : 'No previous workout data available.'}

INSTRUCTIONS:
- If sleep < 5 or stress > 7 or soreness > 7: REDUCE volume by 20%, use lighter exercises.
- If all scores >= 7: INCREASE intensity (more reps or weight).
- Apply Progressive Overload: if RPE was < 7 last session, suggest slightly more volume/weight.

Return ONLY valid JSON:
{
  "readinessScore": <number 0-100>,
  "workoutAdjustment": "normal | reduced | increased",
  "adjustmentReason": "<brief reason>",
  "workout": [
    { "exercise": "<name>", "sets": "<number>", "reps": "<range>", "weightKg": <number or 0 for bodyweight>, "reason": "<why>" }
  ],
  "safetyNotes": "<injury related advice or None>"
}`;

      const chatCompletion = await this.client.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model,
        temperature: 0.6,
        response_format: { type: 'json_object' }
      });

      const text = chatCompletion.choices[0]?.message?.content || '';
      return JSON.parse(text);

    } catch (error) {
      console.error('Groq Next Workout Error:', error.message);
      throw new Error('Next workout generation failed.');
    }
  }
}

module.exports = new AIService();
