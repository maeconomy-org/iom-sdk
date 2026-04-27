/**
 * Encode a File or Blob as a base64 string (no data-URL prefix).
 * Works in browsers (FileReader) and in Node (Buffer).
 */
export async function blobToBase64(file: File | Blob): Promise<string> {
  if (typeof FileReader !== 'undefined') {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result !== 'string') {
          reject(new Error('FileReader returned non-string result'));
          return;
        }
        const commaIdx = result.indexOf(',');
        resolve(commaIdx >= 0 ? result.slice(commaIdx + 1) : result);
      };
      reader.onerror = () =>
        reject(reader.error ?? new Error('FileReader error'));
      reader.readAsDataURL(file);
    });
  }

  const arrayBuffer = await (file as Blob).arrayBuffer();
  return Buffer.from(arrayBuffer).toString('base64');
}
