// ============================================================================
// BUSINESS LOGIC (BONUS SYSTEM)
// ============================================================================

export function evaluateWeeklyBonus(dailyCount) {
    if (dailyCount >= 15)
      return {
        award: "ADVANCED",
        days: 30,
        expiresAt: Date.now() + 30 * 86400000
      };
  
    if (dailyCount >= 8)
      return {
        award: "COMFORT",
        days: 30,
        expiresAt: Date.now() + 30 * 86400000
      };
  
    if (dailyCount >= 5)
      return {
        award: "BASIC",
        days: 30,
        expiresAt: Date.now() + 30 * 86400000
      };
  
    return {
      award: null,
      days: 0,
      expiresAt: null
    };
  }