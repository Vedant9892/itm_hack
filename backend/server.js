const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const { createClient } = require('@supabase/supabase-js');
const aiService = require('./src/services/aiService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Basic Route
app.get('/', (req, res) => {
  res.send('AI Adaptive Workout Planner API is running...');
});

/**
 * Endpoint: /onboarding
 * Description: Initializes the user's starting profile after they sign up.
 */
app.post('/onboarding', async (req, res) => {
  const { 
    userId, 
    fullName, 
    weight, 
    height, 
    gender, 
    injuries, 
    workoutType, 
    equipment, 
    goal,
    strengthAssessment // Accept the assessment data
  } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        full_name: fullName,
        weight_kg: weight,
        height_cm: height,
        gender: gender,
        injuries: injuries,
        workout_type: workoutType,
        available_equipment: equipment, 
        fitness_goal: goal,
        // Map strength assessment fields
        pushups: strengthAssessment?.pushups,
        squats: strengthAssessment?.squats,
        plank_seconds: strengthAssessment?.plankSeconds
      });

    if (error) throw error;

    // Trigger AI analysis and workout generation
    let aiAnalysis = null;
    try {
      aiAnalysis = await aiService.generateDay1Workout({
        gender, weight, height, goal, workoutType, equipment, injuries, strengthAssessment
      });
      
      // Optional: Save AI findings back to the profile
      if (aiAnalysis) {
        await supabase
          .from('profiles')
          .update({
            experience_level: aiAnalysis.experienceLevel,
            strength_score: aiAnalysis.strengthScore
          })
          .eq('id', userId);
      }
    } catch (aiError) {
      console.warn('AI Generation skipped or failed:', aiError.message);
      // We don't fail the whole request if AI fails
    }

    return res.status(200).json({
      message: 'Onboarding successful',
      profile: data,
      strengthAssessment,
      aiAnalysis // Include the AI's suggestions in the response
    });
  } catch (error) {
    console.error('Onboarding Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint: POST /create-workout
 * Description: Creates a new workout session for a user and returns the workoutId.
 * Frontend should call this when the user starts a workout.
 */
app.post('/create-workout', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const { data, error } = await supabase
      .from('workouts')
      .insert({ user_id: userId, status: 'active' })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      message: 'Workout session created',
      workoutId: data.id,
      workout: data
    });
  } catch (error) {
    console.error('Create Workout Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint: POST /log-workout
 * Description: Logs set-by-set performance for an exercise within a workout session.
 *
 * Body:
 * {
 *   "workoutId": "uuid",
 *   "exerciseName": "Push-up",       // Exercise name (we'll use it directly for now)
 *   "sets": [
 *     { "setNumber": 1, "reps": 12, "weightKg": 0, "rpe": 7 },
 *     { "setNumber": 2, "reps": 10, "weightKg": 0, "rpe": 8 }
 *   ],
 *   "markComplete": false              // Optional: marks the whole workout as complete
 * }
 */
app.post('/log-workout', async (req, res) => {
  const { workoutId, exerciseName, rpe, sets, markComplete } = req.body;

  if (!workoutId || !exerciseName || !sets || sets.length === 0) {
    return res.status(400).json({ 
      error: 'workoutId, exerciseName, and at least one set are required' 
    });
  }

  try {
    // Map sets - RPE is applied at the exercise level (same for all sets)
    const logsToInsert = sets.map((set) => ({
      workout_id: workoutId,
      exercise_name: exerciseName,
      set_number: set.setNumber,
      reps: set.reps,
      weight_kg: set.weightKg ?? 0,
      rpe: rpe ?? null, // Single RPE for the whole exercise
    }));

    const { data, error } = await supabase
      .from('exercise_logs')
      .insert(logsToInsert)
      .select();

    if (error) throw error;

    // If the user has finished their workout, mark it as complete
    if (markComplete) {
      const { error: updateError } = await supabase
        .from('workouts')
        .update({ status: 'completed' })
        .eq('id', workoutId);

      if (updateError) console.warn('Could not mark workout as complete:', updateError.message);
    }

    return res.status(200).json({
      message: `Logged ${data.length} set(s) for "${exerciseName}"`,
      logs: data,
      workoutStatus: markComplete ? 'completed' : 'active'
    });
  } catch (error) {
    console.error('Log Workout Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint: POST /submit-feedback
 * Description: Records how the user feels after a workout (Sleep, Stress, Soreness).
 *
 * Body: { "userId": "uuid", "sleepQuality": 7, "stressLevel": 4, "sorenessLevel": 5 }
 */
app.post('/submit-feedback', async (req, res) => {
  const { userId, sleepQuality, stressLevel, sorenessLevel } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const { data, error } = await supabase
      .from('daily_feedback')
      .upsert({
        user_id: userId,
        sleep_quality: sleepQuality,
        stress_level: stressLevel,
        soreness_level: sorenessLevel,
        date: new Date().toISOString().split('T')[0] // Today's date
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      message: 'Feedback submitted successfully',
      feedback: data
    });
  } catch (error) {
    console.error('Feedback Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint: POST /generate-workout
 * Description: Uses today's feedback + last workout history to generate the next adaptive workout.
 *
 * Body: { "userId": "uuid" }
 */
app.post('/generate-workout', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    // 1. Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    // 2. Fetch today's feedback
    const today = new Date().toISOString().split('T')[0];
    const { data: feedback, error: feedbackError } = await supabase
      .from('daily_feedback')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (feedbackError && feedbackError.code !== 'PGRST116') {
      throw feedbackError;
    }

    // Default feedback if not submitted yet
    const feedbackData = feedback || { sleep_quality: 7, stress_level: 5, soreness_level: 5 };

    // 3. Fetch last workout logs
    const { data: lastWorkout } = await supabase
      .from('workouts')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let lastWorkoutLogs = [];
    if (lastWorkout) {
      const { data: logs } = await supabase
        .from('exercise_logs')
        .select('*')
        .eq('workout_id', lastWorkout.id);
      lastWorkoutLogs = logs || [];
    }

    // 4. Call Groq AI to generate the adaptive workout
    const aiWorkout = await aiService.generateNextWorkout(profile, feedbackData, lastWorkoutLogs);

    // 5. Create a new workout session in DB
    const { data: newWorkout } = await supabase
      .from('workouts')
      .insert({ user_id: userId, status: 'pending', readiness_score: aiWorkout.readinessScore })
      .select()
      .single();

    return res.status(200).json({
      message: 'Workout generated successfully',
      workoutId: newWorkout?.id,
      readinessScore: aiWorkout.readinessScore,
      adjustment: aiWorkout.workoutAdjustment,
      adjustmentReason: aiWorkout.adjustmentReason,
      workout: aiWorkout.workout,
      safetyNotes: aiWorkout.safetyNotes
    });

  } catch (error) {
    console.error('Generate Workout Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
