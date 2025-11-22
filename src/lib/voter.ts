/**
 * Manages voter identification using localStorage
 * Creates and persists a unique voter ID for each browser
 */

const VOTER_ID_KEY = 'tripPlannerVoterId';

/**
 * Get or create a unique voter ID for this browser
 * @returns The voter ID (UUID)
 */
export function getOrCreateVoterId(): string {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    // Try to get existing voter ID
    let voterId = localStorage.getItem(VOTER_ID_KEY);

    if (!voterId) {
      // Generate a new UUID
      voterId = crypto.randomUUID();
      localStorage.setItem(VOTER_ID_KEY, voterId);
    }

    return voterId;
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    // Fallback to session-based ID if localStorage is not available
    return generateSessionId();
  }
}

/**
 * Generate a session-based ID as fallback
 * @returns A random session ID
 */
function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Clear the voter ID (for testing purposes)
 */
export function clearVoterId(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(VOTER_ID_KEY);
  }
}
