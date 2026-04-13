import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { JOURNEY_STEPS, TOTAL_STEPS } from "@/data/journeyPath";

interface JourneyValidation {
  step_index: number;
  exercise_id: string;
  session_id: string | null;
}

export const useJourneyProgress = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [validations, setValidations] = useState<JourneyValidation[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch progress
  useEffect(() => {
    if (!user) return;

    const fetchProgress = async () => {
      const [profileRes, progressRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("current_journey_step")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("journey_progress")
          .select("step_index, exercise_id, session_id")
          .eq("user_id", user.id),
      ]);

      if (profileRes.data) {
        setCurrentStep((profileRes.data as any).current_journey_step ?? 0);
      }
      if (progressRes.data) {
        setValidations(progressRes.data);
      }
      setLoading(false);
    };

    fetchProgress();
  }, [user]);

  // Get validated exercise IDs for a given step
  const getValidatedExercises = useCallback(
    (stepIndex: number): string[] => {
      return validations
        .filter((v) => v.step_index === stepIndex)
        .map((v) => v.exercise_id);
    },
    [validations]
  );

  // Check if a step is completed
  const isStepCompleted = useCallback(
    (stepIndex: number): boolean => {
      const step = JOURNEY_STEPS[stepIndex];
      if (!step) return false;
      const validated = getValidatedExercises(stepIndex);
      return validated.length >= step.requiredValidations;
    },
    [getValidatedExercises]
  );

  // Check if a step is unlocked
  const isStepUnlocked = useCallback(
    (stepIndex: number): boolean => {
      if (stepIndex === 0) return true;
      return isStepCompleted(stepIndex - 1);
    },
    [isStepCompleted]
  );

  // Validate an exercise after a successful session
  const validateExercise = useCallback(
    async (
      stepIndex: number,
      exerciseId: string,
      sessionId: string
    ): Promise<{ stepAdvanced: boolean; newStep: number }> => {
      if (!user) return { stepAdvanced: false, newStep: currentStep };

      // Insert validation (upsert to avoid duplicates)
      const { error } = await supabase.from("journey_progress").upsert(
        {
          user_id: user.id,
          step_index: stepIndex,
          exercise_id: exerciseId,
          session_id: sessionId,
        },
        { onConflict: "user_id,step_index,exercise_id" }
      );

      if (error) {
        console.error("Error saving journey progress:", error);
        return { stepAdvanced: false, newStep: currentStep };
      }

      // Update local state
      setValidations((prev) => {
        const exists = prev.some(
          (v) => v.step_index === stepIndex && v.exercise_id === exerciseId
        );
        if (exists) return prev;
        return [...prev, { step_index: stepIndex, exercise_id: exerciseId, session_id: sessionId }];
      });

      // Check if step is now complete
      const step = JOURNEY_STEPS[stepIndex];
      const currentValidated = getValidatedExercises(stepIndex);
      const nowValidated = currentValidated.includes(exerciseId)
        ? currentValidated.length
        : currentValidated.length + 1;

      if (nowValidated >= step.requiredValidations && stepIndex === currentStep) {
        const newStep = Math.min(currentStep + 1, TOTAL_STEPS - 1);
        setCurrentStep(newStep);

        // Update profile
        await supabase
          .from("profiles")
          .update({ current_journey_step: newStep } as any)
          .eq("id", user.id);

        return { stepAdvanced: true, newStep };
      }

      return { stepAdvanced: false, newStep: currentStep };
    },
    [user, currentStep, getValidatedExercises]
  );

  // Overall progress percentage
  const totalValidations = validations.length;
  const totalRequired = JOURNEY_STEPS.reduce((sum, s) => sum + s.requiredValidations, 0);
  const overallProgress = Math.round((totalValidations / totalRequired) * 100);

  return {
    currentStep,
    validations,
    loading,
    getValidatedExercises,
    isStepCompleted,
    isStepUnlocked,
    validateExercise,
    overallProgress,
    totalSteps: TOTAL_STEPS,
  };
};
