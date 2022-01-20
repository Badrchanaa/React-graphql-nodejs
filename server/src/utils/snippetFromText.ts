export const snippetFromText = (text: string) => {
  if(text.length <= 50) return text;

  let i = 50;
  const textLen = text.length;

  for(;i < textLen; i++)
    if (['.', ',', '!', '?'].includes(text[i]) || i >= 100) break
  
  return text.slice(0, i) + (i < textLen ? '...' : '');
}