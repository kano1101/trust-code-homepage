
import { createContext, useContext, ReactNode } from 'react';
import { useWordPressConfig, WordPressConfig } from '../hooks/useWordPressConfig';

interface WordPressConfigContextType {
  config: WordPressConfig | null;
  loading: boolean;
  error: string | null;
}

const WordPressConfigContext = createContext<WordPressConfigContextType | undefined>(undefined);

interface WordPressConfigProviderProps {
  children: ReactNode;
}

export function WordPressConfigProvider({ children }: WordPressConfigProviderProps) {
  const { config, loading, error } = useWordPressConfig();

  return (
    <WordPressConfigContext.Provider value={{ config, loading, error }}>
      {children}
    </WordPressConfigContext.Provider>
  );
}

export function useWordPressConfigContext() {
  const context = useContext(WordPressConfigContext);
  if (context === undefined) {
    throw new Error('useWordPressConfigContext must be used within a WordPressConfigProvider');
  }
  return context;
}
