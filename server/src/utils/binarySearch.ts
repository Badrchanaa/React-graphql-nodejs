export function binarySearch(haystack: number[], needle: number): number {

    let subEnd = haystack.length;
    let subStart: number = Math.floor(subEnd / 2);
    let currentValue = haystack[subStart];

    const subLen = () => subEnd - subStart;
    const found = () => currentValue === needle;

    while (!found() && subLen() > 1) {

      if (currentValue > needle) {
        subEnd = subStart;
        subStart = Math.floor(subStart / 2);
      }
      else if (currentValue < needle) {
        subStart += Math.floor(subLen() / 2);
      }

      currentValue = haystack[subStart];
    }

    if (!found()) throw new Error('Value not in array');
  
    return subStart;
  }
  