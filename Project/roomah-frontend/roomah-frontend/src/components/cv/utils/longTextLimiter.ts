interface NormalizeLongTextOptions {
  maxWords?: number;
  titleCase?: boolean;
}

/**
 * Normalizes long text input by limiting words and applying title case
 */
export function normalizeLongText(
  input: string,
  options: NormalizeLongTextOptions = {}
): string {
  const { maxWords = 20, titleCase = true } = options;

  if (!input) return "";

  // Split into words and filter out empty strings
  const words = input
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);

  // Limit to maxWords
  const limitedWords = words.slice(0, maxWords);

  // Join back
  let result = limitedWords.join(" ");

  // Apply title case if requested
  if (titleCase) {
    result = toTitleCase(result);
  }

  return result;
}

/**
 * Converts text to title case (capitalize each word)
 */
export function toTitleCase(text: string): string {
  return text.replace(
    /\w\S*/g,
    (word) => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()
  );
}

/**
 * Counts words in a string
 */
export function countWords(text: string): number {
  if (!text) return 0;
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

/**
 * Hook for handling long text fields with word limit and title case
 */
export function createLongTextHandler(
  setValue: (name: string, value: string) => void,
  fieldName: string,
  options: NormalizeLongTextOptions = {}
) {
  return (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const normalizedValue = normalizeLongText(event.target.value, options);
    setValue(fieldName, normalizedValue);
  };
}

/**
 * Validates if text exceeds word limit
 */
export function validateWordLimit(
  text: string,
  maxWords: number = 20
): {
  isValid: boolean;
  wordCount: number;
  message?: string;
} {
  const wordCount = countWords(text);
  const isValid = wordCount <= maxWords;

  return {
    isValid,
    wordCount,
    message: isValid
      ? undefined
      : `Maksimal ${maxWords} kata (saat ini: ${wordCount} kata)`,
  };
}
