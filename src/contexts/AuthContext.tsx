
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Tables } from '@/integrations/supabase/types';

type Citizen = Tables<'citizens'>;

interface AuthContextType {
  user: User | null;
  citizen: Citizen | null;
  userRoles: string[];
  loading: boolean;
  signIn: (nationalId: string, password: string) => Promise<void>;
  signUp: (data: {
    nationalId: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    phoneNumber?: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  isElectionAuthority: boolean;
  isSystemAuditor: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [citizen, setCitizen] = useState<Citizen | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchCitizenData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchCitizenData(session.user.id);
        } else {
          setCitizen(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchCitizenData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('citizens')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setCitizen(data);

      // Fetch user roles from secure user_roles table
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
        setUserRoles([]);
      } else {
        setUserRoles(rolesData?.map(r => r.role) || []);
      }
    } catch (error) {
      console.error('Error fetching citizen data:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (nationalId: string, password: string) => {
    // First, get the email associated with this national ID
    const { data: citizenData, error: citizenError } = await supabase
      .from('citizens')
      .select('email')
      .eq('national_id', nationalId)
      .single();

    if (citizenError || !citizenData) {
      throw new Error('Invalid national ID');
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: citizenData.email,
      password,
    });

    if (error) throw error;
  };

  const signUp = async (data: {
    nationalId: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    phoneNumber?: string;
  }) => {
    // First create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError) throw authError;

    if (authData.user) {
      // Then create the citizen record
      const { error: citizenError } = await supabase
        .from('citizens')
        .insert({
          id: authData.user.id,
          national_id: data.nationalId,
          email: data.email,
          first_name: data.firstName,
          last_name: data.lastName,
          date_of_birth: data.dateOfBirth,
          phone_number: data.phoneNumber,
        });

      if (citizenError) throw citizenError;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const isElectionAuthority = userRoles.includes('election_authority');
  const isSystemAuditor = userRoles.includes('system_auditor');

  const value = {
    user,
    citizen,
    userRoles,
    loading,
    signIn,
    signUp,
    signOut,
    isElectionAuthority,
    isSystemAuditor,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
