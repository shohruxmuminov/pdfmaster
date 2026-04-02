import ToolLayout from "@/src/components/ToolLayout";
import { PDFDocument } from "pdf-lib";

export default function CompressPDF() {
  const handleCompress = async (files: File[]) => {
    if (files.length !== 1) {
      throw new Error("Please select exactly 1 PDF file to compress.");
    }

    const file = files[0];
    const arrayBuffer = await file.arrayBuffer();
    
    // Load without updating metadata to potentially save space
    const pdfDoc = await PDFDocument.load(arrayBuffer, { updateMetadata: false });
    
    // Save with useObjectStreams to compress the PDF structure
    const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
    
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    
    return {
      blob,
      filename: `compressed-${file.name}`
    };
  };

  return (
    <ToolLayout
      title="Compress PDF"
      description="Reduce file size while optimizing for maximal PDF quality. (Basic structural compression)"
      accept={{ "application/pdf": [".pdf"] }}
      maxFiles={1}
      actionButtonText="Compress PDF"
      onProcess={handleCompress}
    />
  );
}
