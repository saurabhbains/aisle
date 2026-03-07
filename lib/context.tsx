'use client';

import React, { createContext, useContext, useReducer, useEffect, useRef, useState, type ReactNode } from 'react';
import type { AppState, Venue, Criteria, MissingInfo } from './types';
import { createClient } from '@/lib/supabase/client';

type Action =
  | { type: 'SET_STEP'; payload: AppState['currentStep'] }
  | { type: 'SET_INPUT_MODE'; payload: 'voice' | 'text' }
  | { type: 'UPDATE_CRITERIA'; payload: Criteria[] }
  | { type: 'CONFIRM_CRITERIA'; payload: string }
  | { type: 'UPDATE_VENUE'; payload: Venue }
  | { type: 'SELECT_VENUE'; payload: string | null }
  | { type: 'UPDATE_MISSING_INFO'; payload: MissingInfo }
  | { type: 'SET_EMAIL_DRAFT'; payload: AppState['emailDraft'] }
  | { type: 'APPROVE_EMAIL' }
  | { type: 'LOAD_STATE'; payload: AppState }
  | { type: 'SET_VENUES'; payload: Venue[] };

const initialState: AppState = {
  currentStep: 'onboarding',
  criteria: [],
  venues: [],
  missingInfo: [],
  selectedVenueId: null,
  inputMode: null,
  emailDraft: null,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_INPUT_MODE':
      return { ...state, inputMode: action.payload };
    case 'UPDATE_CRITERIA':
      return { ...state, criteria: action.payload };
    case 'CONFIRM_CRITERIA':
      return {
        ...state,
        criteria: state.criteria.map(c =>
          c.id === action.payload ? { ...c, confirmed: true } : c
        ),
      };
    case 'UPDATE_VENUE':
      return {
        ...state,
        venues: state.venues.map(v =>
          v.id === action.payload.id ? action.payload : v
        ),
      };
    case 'SELECT_VENUE':
      return { ...state, selectedVenueId: action.payload };
    case 'UPDATE_MISSING_INFO':
      return {
        ...state,
        missingInfo: state.missingInfo.map(m =>
          m.id === action.payload.id ? action.payload : m
        ),
      };
    case 'SET_EMAIL_DRAFT':
      return { ...state, emailDraft: action.payload };
    case 'APPROVE_EMAIL':
      return {
        ...state,
        emailDraft: state.emailDraft ? { ...state.emailDraft, approved: true } : null,
      };
    case 'LOAD_STATE':
      return action.payload;
    case 'SET_VENUES':
      return { ...state, venues: action.payload };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  getVenueById: (id: string) => Venue | undefined;
  getVenuesByStatus: (status: Venue['status']) => Venue[];
  updateVenue: (id: string, updates: Partial<Venue>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const supabase = createClient();
  const [loaded, setLoaded] = useState(false);
  const isFirstCriteriaRender = useRef(true);
  const isFirstVenuesRender = useRef(true);

  // Load user data from Supabase on mount
  useEffect(() => {
    const loadUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoaded(true);
        return;
      }

      const [criteriaRes, venuesRes] = await Promise.all([
        supabase.from('user_criteria').select('criteria').eq('user_id', user.id).single(),
        supabase.from('user_venues').select('venues').eq('user_id', user.id).single(),
      ]);

      console.log('[Supabase Load] criteriaRes:', criteriaRes.data, criteriaRes.error);
      console.log('[Supabase Load] venuesRes:', venuesRes.data, venuesRes.error);

      if (criteriaRes.data?.criteria?.length) {
        dispatch({ type: 'UPDATE_CRITERIA', payload: criteriaRes.data.criteria });
      }
      if (venuesRes.data?.venues?.length) {
        dispatch({ type: 'SET_VENUES', payload: venuesRes.data.venues });
      }

      setLoaded(true);
    };

    loadUserData();
  }, []);

  // Save criteria to Supabase when it changes (skip the first render and until loaded)
  useEffect(() => {
    if (!loaded) return;
    if (isFirstCriteriaRender.current) {
      isFirstCriteriaRender.current = false;
      return;
    }
    const saveCriteria = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('user_criteria').upsert(
        { user_id: user.id, criteria: state.criteria, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );
    };
    saveCriteria();
  }, [state.criteria, loaded]);

  // Save venues to Supabase when they change (skip the first render and until loaded)
  useEffect(() => {
    if (!loaded) return;
    if (isFirstVenuesRender.current) {
      isFirstVenuesRender.current = false;
      return;
    }
    const saveVenues = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      console.log('[Supabase Save] Saving venues:', state.venues.length);
      const result = await supabase.from('user_venues').upsert(
        { user_id: user.id, venues: state.venues, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );
      console.log('[Supabase Save] venues result:', result.error);
    };
    saveVenues();
  }, [state.venues, loaded]);

  const getVenueById = (id: string) => state.venues.find(v => v.id === id);
  
  const getVenuesByStatus = (status: Venue['status']) => 
    state.venues.filter(v => v.status === status);

  const updateVenue = (id: string, updates: Partial<Venue>) => {
    const venue = getVenueById(id);
    if (venue) {
      dispatch({ type: 'UPDATE_VENUE', payload: { ...venue, ...updates } });
    }
  };

  return (
    <AppContext.Provider value={{ state, dispatch, getVenueById, getVenuesByStatus, updateVenue }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
