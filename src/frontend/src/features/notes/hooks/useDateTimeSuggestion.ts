import { useState, useEffect } from 'react';
import { extractDateTime, type DateTimeSuggestion } from '../nlp/dateTimeExtractor';

export function useDateTimeSuggestion(text: string) {
  const [suggestion, setSuggestion] = useState<DateTimeSuggestion>({ date: null, time: null, confidence: 0 });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const result = extractDateTime(text);
      setSuggestion(result);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [text]);

  return suggestion;
}
