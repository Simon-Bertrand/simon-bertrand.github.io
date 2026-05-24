export function estimateReadingTime(text: string, wordsPerMinute = 220) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));

  return {
    words,
    minutes,
    label: `${minutes} min read`,
  };
}