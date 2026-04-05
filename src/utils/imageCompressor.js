/**
 * Compresses an image file using the browser Canvas API and returns a
 * base64-encoded data URL (JPEG, 80% quality, max width/height provided).
 * Non-image files are returned as-is via FileReader.
 */
export const compressImageToBase64 = (file, maxWidth = 1200, maxHeight = 900) =>
  new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      // Non-image (e.g. PDF) — just base64-encode the raw bytes
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > maxWidth) { h = Math.round((h * maxWidth) / w); w = maxWidth; }
        if (h > maxHeight) { w = Math.round((w * maxHeight) / h); h = maxHeight; }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
