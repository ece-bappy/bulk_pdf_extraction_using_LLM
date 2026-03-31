import * as pdfjsLib from 'pdfjs-dist';

// Set worker source globally
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';

export const extractTextFromPdf = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n\n';
  }

  return removeReferences(fullText);
};

const removeReferences = (text: string): string => {
  // Heuristic: Find the last major "References" or "Bibliography" header
  // This is a simple regex approach and might need refinement for specific journal styles
  
  const referencePatterns = [
    /\n\s*References\s*\n/i,
    /\n\s*Bibliography\s*\n/i,
    /\n\s*[0-9]+\.?\s*References\s*\n/i,
    /\n\s*LITERATURE CITED\s*\n/i
  ];

  let cutoffIndex = -1;

  for (const pattern of referencePatterns) {
    const match = text.match(pattern);
    // We look for the LAST occurrence to avoid false positives in TOCs, though normally Refs are at end.
    // Actually, simpler approach: find the last match index.
    if (match && match.index !== undefined) {
        // If we find multiple, we typically want the one near the end.
        // simpler: lastIndexOf equivalent with regex is tricky, so we iterate matches
        // For safety, let's just take the last found match in the text
        const allMatches = [...text.matchAll(new RegExp(pattern, 'gi'))];
        if (allMatches.length > 0) {
            const lastMatch = allMatches[allMatches.length - 1];
            if (lastMatch.index !== undefined && lastMatch.index > text.length * 0.6) {
                // Only cut if it's in the last 40% of the document
                cutoffIndex = Math.max(cutoffIndex, lastMatch.index);
            }
        }
    }
  }

  if (cutoffIndex !== -1) {
    return text.substring(0, cutoffIndex);
  }

  return text;
};