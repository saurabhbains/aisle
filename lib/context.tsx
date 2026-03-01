'use client';

import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { AppState, Venue, Criteria, MissingInfo } from './types';
import { mockVenues, mockCriteria, mockMissingInfo } from './mock-data';

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

const STATE_VERSION = 2; // Increment when data structure changes

const initialState: AppState = {
  currentStep: 'onboarding',
  criteria: mockCriteria,
  venues: mockVenues,
  missingInfo: mockMissingInfo,
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

  // Load state from localStorage on mount (with version check)
  useEffect(() => {
    const savedVersion = localStorage.getItem('aisle-app-version');
    const saved = localStorage.getItem('aisle-app-state');
    
    // If version mismatch, clear old state and use fresh mock data
    if (savedVersion !== String(STATE_VERSION)) {
      localStorage.removeItem('aisle-app-state');
      localStorage.setItem('aisle-app-version', String(STATE_VERSION));
      return;
    }
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'LOAD_STATE', payload: parsed });
      } catch (e) {
        console.error('Failed to load saved state:', e);
      }
    }
  }, []);

  // Save state to localStorage on change
  useEffect(() => {
    localStorage.setItem('aisle-app-state', JSON.stringify(state));
  }, [state]);

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
