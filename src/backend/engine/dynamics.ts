// Pure helper for assessment risk dynamics. No supabase or react imports.

import { isResultV2 } from './riskEngineV2'

export interface AssessmentDelta {
  // Positive means the value rose relative to the previous assessment.
  exposureDelta: number
  readinessDelta: number
}

// Compares two stored breakdowns. Returns deltas only when both are version 2,
// because the v1 score is not comparable to the v2 exposure axis.
export function compareAssessments(latest: unknown, previous: unknown): AssessmentDelta | null {
  if (!isResultV2(latest) || !isResultV2(previous)) {
    return null
  }
  return {
    exposureDelta: latest.exposureScore - previous.exposureScore,
    readinessDelta: latest.readinessScore - previous.readinessScore,
  }
}
