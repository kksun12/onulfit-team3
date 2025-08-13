import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  gender: string;
  birth_date: string;
  height_cm: string;
  weight_kg: string;
  activity_level: string;
  preferred_workout_time: string;
  available_days: string[];
  diet_type: string;
}

export const useProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProfile = async (userId: string): Promise<UserProfile | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (userId: string, profile: Partial<UserProfile>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          ...profile,
          last_updated: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProfile = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    getProfile,
    updateProfile,
    deleteProfile,
    loading,
    error,
  };
};