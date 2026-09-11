export interface CreateFeedbackPayload {
  feedbackable_type: string; // "App\\Models\\Doctor"
  feedbackable_id: number;
  rating: number;            // 1 - 5
  comment?: string;
}
