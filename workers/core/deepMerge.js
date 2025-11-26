export function deepMerge(base, update) {
    for (const k in update) {
      if (
        typeof base[k] === "object" &&
        base[k] !== null &&
        typeof update[k] === "object" &&
        update[k] !== null &&
        !Array.isArray(base[k])
      ) {
        deepMerge(base[k], update[k]);
      } else {
        base[k] = update[k];
      }
    }
    return base;
  }
  