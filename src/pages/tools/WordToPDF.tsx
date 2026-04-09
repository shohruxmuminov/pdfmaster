import ToolLayout from "@/src/components/ToolLayout";
import { renderAsync } from "docx-preview";
import html2pdf from "html2pdf.js";

export default function WordToPDF() {
  const handleConvert = async (files: File[]) => {
    if (files.length !== 1) {
      throw new Error("Please select exactly 1 Word document (.docx).");
    }

    const file = files[0];
    const arrayBuffer = await file.arrayBuffer();
    
    // Create a temporary container to hold the rendered Word document
    const container = document.createElement("div");
    
    // Apply some basic styling to make it look like a document
    container.style.padding = "0";
    container.style.margin = "0";
    container.style.width = "210mm"; // A4 width
    container.style.background = "#fff";
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "-9999px";
    document.body.appendChild(container);

    try {
      // Render the .docx file into the container using docx-preview
      await renderAsync(arrayBuffer, container, undefined, {
        className: "docx-preview",
        inWrapper: false,
        ignoreWidth: false,
        ignoreHeight: false,
        ignoreLastRenderedPageBreak: false,
        experimental: true,
        trimXmlDeclaration: true,
        useBase64URL: true,
      });

      // Wait for all images in the container to load
      const images = container.getElementsByTagName('img');
      const imagePromises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      });
      await Promise.all(imagePromises);

      // Wait a bit more for any fonts or complex layouts
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Configure html2pdf options
      const opt = {
        margin:       0,
        filename:     `${file.name.replace('.docx', '')}.pdf`,
        image:        { type: 'jpeg' as const, quality: 1.0 },
        html2canvas:  { 
          scale: 2, 
          useCORS: true,
          logging: false,
          allowTaint: true,
        },
        jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };

      // Generate PDF as a blob
      const pdfBlob = await html2pdf().set(opt).from(container).output('blob');
      
      return {
        blob: pdfBlob,
        filename: opt.filename
      };
    } catch (error) {
      console.error("Conversion error:", error);
      throw new Error("Failed to convert Word document. The file might be too complex or corrupted.");
    } finally {
      // Clean up the temporary container
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    }
  };

  return (
    <ToolLayout
      title="Word to PDF"
      description="Convert Word documents (.docx) into PDF files with high fidelity, preserving layout and images."
      accept={{ "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"] }}
      maxFiles={1}
      actionButtonText="Convert to PDF"
      onProcess={handleConvert}
    />
  );
}
