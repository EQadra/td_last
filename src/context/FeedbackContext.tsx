import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from 'react';
import api from '../utils/axios';
import { Feedback } from '../types/feedback';
import { CreateFeedbackPayload } from '../types/createfeedback';

interface FeedbackContextProps {
  feedbacks: Feedback[];
  loading: boolean;
  error: string | null;

  fetchFeedbacks: () => Promise<void>;
  createFeedback: (data: CreateFeedbackPayload) => Promise<Feedback>;
  deleteFeedback: (id: number) => Promise<void>;
}

const FeedbackContext = createContext<FeedbackContextProps>(
  {} as FeedbackContextProps
);

export const FeedbackProvider = ({ children }: { children: ReactNode }) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* -----------------------------
   | GET /feedbacks
   ----------------------------- */
  const fetchFeedbacks = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get('/feedbacks');
      setFeedbacks(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar feedbacks');
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
   | POST /feedbacks
   ----------------------------- */
  const createFeedback = async (
    data: CreateFeedbackPayload
  ): Promise<Feedback> => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/feedbacks', data);
      const newFeedback = res.data.data;

      setFeedbacks((prev) => [newFeedback, ...prev]);
      return newFeedback;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al enviar feedback');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
   | DELETE /feedbacks/{id}
   ----------------------------- */
  const deleteFeedback = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      await api.delete(`/feedbacks/${id}`);
      setFeedbacks((prev) => prev.filter((f) => f.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'No autorizado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FeedbackContext.Provider
      value={{
        feedbacks,
        loading,
        error,
        fetchFeedbacks,
        createFeedback,
        deleteFeedback,
      }}
    >
      {children}
    </FeedbackContext.Provider>
  );
};

export const useFeedbacks = () => useContext(FeedbackContext);
