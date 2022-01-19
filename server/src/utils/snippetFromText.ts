export const snippetFromText = (text: string) => {
  if(text.length <= 50) return text;
  return text.slice(0, 50) + '...';
}