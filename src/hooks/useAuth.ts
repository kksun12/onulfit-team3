import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || '',
          },
        },
      });
      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (err: any) {
      console.error('Logout error:', err);
      window.location.href = '/';
    }
  };

  const getUser = async (): Promise<User | null> => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  return {
    signIn,
    signUp,
    signOut,
    getUser,
    loading,
    error,
  };
};