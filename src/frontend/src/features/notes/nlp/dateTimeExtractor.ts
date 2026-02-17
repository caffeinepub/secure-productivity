export interface DateTimeSuggestion {
  date: string | null;
  time: string | null;
  confidence: number;
}

export function extractDateTime(text: string): DateTimeSuggestion {
  const lowerText = text.toLowerCase();
  let date: string | null = null;
  let time: string | null = null;
  let confidence = 0;

  // ISO date pattern (YYYY-MM-DD)
  const isoDateMatch = text.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (isoDateMatch) {
    date = isoDateMatch[0];
    confidence = Math.max(confidence, 0.95);
  }

  // Common date formats (MM/DD/YYYY, DD/MM/YYYY)
  const slashDateMatch = text.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/);
  if (slashDateMatch && !date) {
    const [_, part1, part2, year] = slashDateMatch;
    const month = parseInt(part1) <= 12 ? part1 : part2;
    const day = parseInt(part1) <= 12 ? part2 : part1;
    date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    confidence = Math.max(confidence, 0.85);
  }

  // Relative dates
  const today = new Date();
  if (lowerText.includes('today')) {
    date = today.toISOString().split('T')[0];
    confidence = Math.max(confidence, 0.9);
  } else if (lowerText.includes('tomorrow')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    date = tomorrow.toISOString().split('T')[0];
    confidence = Math.max(confidence, 0.9);
  } else if (lowerText.includes('next week')) {
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    date = nextWeek.toISOString().split('T')[0];
    confidence = Math.max(confidence, 0.75);
  }

  // Month names
  const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const monthAbbr = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  
  for (let i = 0; i < monthNames.length; i++) {
    const monthPattern = new RegExp(`\\b(${monthNames[i]}|${monthAbbr[i]})\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:,?\\s+(\\d{4}))?\\b`, 'i');
    const match = text.match(monthPattern);
    if (match && !date) {
      const day = match[2];
      const year = match[3] || today.getFullYear().toString();
      const month = (i + 1).toString().padStart(2, '0');
      date = `${year}-${month}-${day.padStart(2, '0')}`;
      confidence = Math.max(confidence, 0.8);
      break;
    }
  }

  // Time patterns (24-hour)
  const time24Match = text.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (time24Match) {
    time = `${time24Match[1].padStart(2, '0')}:${time24Match[2]}`;
    confidence = Math.max(confidence, 0.9);
  }

  // Time patterns (12-hour with am/pm)
  const time12Match = text.match(/\b(\d{1,2}):?(\d{2})?\s*(am|pm)\b/i);
  if (time12Match && !time) {
    let hour = parseInt(time12Match[1]);
    const minute = time12Match[2] || '00';
    const meridiem = time12Match[3].toLowerCase();
    
    if (meridiem === 'pm' && hour !== 12) hour += 12;
    if (meridiem === 'am' && hour === 12) hour = 0;
    
    time = `${hour.toString().padStart(2, '0')}:${minute}`;
    confidence = Math.max(confidence, 0.85);
  }

  // Simple hour mentions (e.g., "at 3pm", "at 14")
  const simpleTimeMatch = text.match(/\bat\s+(\d{1,2})\s*(am|pm)?\b/i);
  if (simpleTimeMatch && !time) {
    let hour = parseInt(simpleTimeMatch[1]);
    const meridiem = simpleTimeMatch[2]?.toLowerCase();
    
    if (meridiem === 'pm' && hour !== 12) hour += 12;
    if (meridiem === 'am' && hour === 12) hour = 0;
    
    time = `${hour.toString().padStart(2, '0')}:00`;
    confidence = Math.max(confidence, 0.7);
  }

  return { date, time, confidence };
}
