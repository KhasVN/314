type PdfTextItem = {
  str?: string;
  hasEOL?: boolean;
};

export async function extractResumeText(file: File) {
  if (isPdf(file)) {
    return extractPdfText(file);
  }

  return file.text();
}

function isPdf(file: File) {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

async function extractPdfText(file: File) {
  const pdfjs = await import('pdfjs-dist');

  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data }).promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const text = textContent.items
      .map((item) => {
        const textItem = item as PdfTextItem;
        return `${textItem.str ?? ''}${textItem.hasEOL ? '\n' : ' '}`;
      })
      .join('')
      .trim();

    if (text) {
      pages.push(text);
    }

    page.cleanup();
  }

  await pdf.destroy();
  return pages.join('\n\n');
}
