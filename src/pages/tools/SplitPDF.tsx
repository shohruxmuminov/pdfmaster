import ToolLayout from "@/src/components/ToolLayout";
import { PDFDocument } from "pdf-lib";

export default function SplitPDF() {
  const handleSplit = async (files: File[]) => {
    if (files.length !== 1) {
      throw new Error("Please select exactly 1 PDF file to split.");
    }

    const file = files[0];
    const arrayBuffer = await file.arrayBuffer();
    const originalPdf = await PDFDocument.load(arrayBuffer);
    const pageCount = originalPdf.getPageCount();

    if (pageCount <= 1) {
      throw new Error("This PDF only has 1 page. Cannot split.");
    }

    // For simplicity in this demo, we'll just extract the first half of the pages.
    // In a full app, you'd have a UI to select ranges.
    const splitIndex = Math.ceil(pageCount / 2);
    const newPdf = await PDFDocument.create();
    
    const indicesToCopy = Array.from({ length: splitIndex }, (_, i) => i);
    const copiedPages = await newPdf.copyPages(originalPdf, indicesToCopy);
    copiedPages.forEach((page) => newPdf.addPage(page));

    const pdfBytes = await newPdf.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    
    return {
      blob,
      filename: `split-${file.name}`
    };
  };

  return (
    <ToolLayout
      title="Split PDF"
      description="Extract pages from your PDF or split it into multiple files."
      accept={{ "application/pdf": [".pdf"] }}
      maxFiles={1}
      actionButtonText="Split PDF (Extract First Half)"
      onProcess={handleSplit}
    />
  );
}
