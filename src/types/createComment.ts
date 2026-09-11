export interface CreateCommentPayload {
  commentable_type: string; // Ej: "App\\Models\\Post"
  commentable_id: number;
  content: string;
}
