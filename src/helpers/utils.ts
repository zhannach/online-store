export function shuffle<T>(array: T[]): T[] {
  const result = array.slice();
  const len = result.length;
  for (let i = len - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export const randomInt = (a = 1, b = 0) => {
  const lower = Math.ceil(Math.min(a, b));
  const upper = Math.floor(Math.max(a, b));
  return Math.floor(lower + Math.random() * (upper - lower + 1));
};

export function arrayRemove<T>(arr: T[], value: T): T[] {
  return arr.filter((ele) => ele != value);
}
