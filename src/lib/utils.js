/**
 * Combines class names using clsx and merges Tailwind classes with tailwind-merge
 * @param {...ClassValue} inputs - Class names or class name objects/arrays
 * @returns {string} - Merged and optimized class string
 */
export function cn(...inputs) {
  // First resolve class names with clsx
  const resolvedClasses = clsx(inputs);
  
  // Then merge Tailwind classes with tailwind-merge
  return twMerge(resolvedClasses);
}