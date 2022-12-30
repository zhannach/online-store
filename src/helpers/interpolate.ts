export default function interpolate<T>(str: string, params: {} | T[]): string {
  const names = Object.keys(params);
  const vals = Object.values(params);
  return new Function(...names, `return \`${str}\`;`)(...vals);
}
