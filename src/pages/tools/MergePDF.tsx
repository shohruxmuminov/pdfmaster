import ToolLayout from "@/src/components/ToolLayout";
import { PDFDocument } from "pdf-lib";

export default function MergePDF() {
  const handleMerge = async (files: File[]) => {
    if (files.length < 2) {
      throw new Error("Please select at least 2 PDF files to merge.");
    }

    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const pdfBytes = await mergedPdf.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    
    return {
      blob,
      filename: "merged-document.pdf"
    };
  };

  return (
    <ToolLayout
      title="Merge PDF"
      description="Combine multiple PDFs into one unified document. Drag and drop your files to get started."
      accept={{ "application/pdf": [".pdf"] }}
      actionButtonText="Merge PDFs"
      onProcess={handleMerge}
    />
  );
}
