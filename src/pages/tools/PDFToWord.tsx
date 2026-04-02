import ToolLayout from "@/src/components/ToolLayout";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export default function PDFToWord() {
  const handleConvert = async (files: File[]) => {
    if (files.length !== 1) {
      throw new Error("Please select exactly 1 PDF file.");
    }

    const file = files[0];
    const arrayBuffer = await file.arrayBuffer();
    
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = "";
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += `${pageText}\n\n`;
    }

    // Create a simple HTML structure that MS Word can read as a .doc file
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Exported Document</title></head>
      <body>
        ${fullText.replace(/\n/g, '<br>')}
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: "application/msword;charset=utf-8" });
    
    return {
      blob,
      filename: `${file.name.replace('.pdf', '')}.doc`
    };
  };

  return (
    <ToolLayout
      title="PDF to Word"
      description="Extract text from your PDF files and download as a Word document (.doc)."
      accept={{ "application/pdf": [".pdf"] }}
      maxFiles={1}
      actionButtonText="Convert to Word"
      onProcess={handleConvert}
    />
  );
}

