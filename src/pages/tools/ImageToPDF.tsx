import ToolLayout from "@/src/components/ToolLayout";
import { PDFDocument } from "pdf-lib";

export default function ImageToPDF() {
  const handleConvert = async (files: File[]) => {
    if (files.length === 0) {
      throw new Error("Please select at least 1 image.");
    }

    const pdfDoc = await PDFDocument.create();

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      let image;
      
      if (file.type === "image/jpeg" || file.type === "image/jpg") {
        image = await pdfDoc.embedJpg(arrayBuffer);
      } else if (file.type === "image/png") {
        image = await pdfDoc.embedPng(arrayBuffer);
      } else {
        throw new Error(`Unsupported image type: ${file.type}. Only JPG and PNG are supported.`);
      }

      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    
    return {
      blob,
      filename: "images-converted.pdf"
    };
  };

  return (
    <ToolLayout
      title="Image to PDF"
      description="Convert JPG or PNG images to PDF in seconds. Easily adjust orientation and margins."
      accept={{ "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] }}
      actionButtonText="Convert to PDF"
      onProcess={handleConvert}
    />
  );
}
