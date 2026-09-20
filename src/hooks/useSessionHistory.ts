import { useCallback, useState } from 'react';
import {
  loadSessionHistory,
  markHistoryActionComplete,
  recordSessionHistory,
  type NewSessionHistoryEntry,
  type SessionHistoryEntry,
} from '../utils/sessionHistory';

export function useSessionHistory() {
  const [entries, setEntries] = useState<SessionHistoryEntry[]>(() => loadSessionHistory());

  const recordSession = useCallback((input: NewSessionHistoryEntry): SessionHistoryEntry => {
    const result = recordSessionHistory(input);
    setEntries(result.entries);
    return result.entry;
  }, []);

  const completeAction = useCallback((entryId: string) => {
    setEntries(markHistoryActionComplete(entryId));
  }, []);

  return { entries, recordSession, completeAction };
}
