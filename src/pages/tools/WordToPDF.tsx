import ToolLayout from "@/src/components/ToolLayout";
import mammoth from "mammoth";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export default function WordToPDF() {
  const handleConvert = async (files: File[]) => {
    if (files.length !== 1) {
      throw new Error("Please select exactly 1 Word document (.docx).");
    }

    const file = files[0];
    const arrayBuffer = await file.arrayBuffer();
    
    // Extract raw text from the Word document
    const result = await mammoth.extractRawText({ arrayBuffer });
    let text = result.value;
    
    if (!text) {
      throw new Error("Could not extract text from the document or document is empty.");
    }

    // Sanitize text for WinAnsi encoding (StandardFonts.Helvetica)
    text = text
      .replace(/[\u2018\u2019\u02BC\u02BB\u0060\u00B4]/g, "'") // Smart single quotes and modifier commas
      .replace(/[\u201C\u201D]/g, '"') // Smart double quotes
      .replace(/[\u2013\u2014]/g, '-') // En and em dashes
      .replace(/[\u2026]/g, '...') // Ellipsis
      .replace(/[^\x00-\x7F\xA0-\xFF\n\r\t]/g, ''); // Remove other unsupported characters

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    const fontSize = 12;
    const margin = 50;
    const width = 595.28; // A4 width
    const height = 841.89; // A4 height
    const maxWidth = width - margin * 2;
    
    // Simple text wrapping
    const words = text.split(/\s+/);
    let lines: string[] = [];
    let currentLine = words[0] || "";

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const textWidth = font.widthOfTextAtSize(currentLine + " " + word, fontSize);
      if (textWidth < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);

    // Handle newlines from original text
    const finalLines: string[] = [];
    lines.forEach(line => {
      const splitByNewline = line.split('\n');
      finalLines.push(...splitByNewline);
    });

    let page = pdfDoc.addPage([width, height]);
    let y = height - margin;

    for (const line of finalLines) {
      if (y < margin) {
        page = pdfDoc.addPage([width, height]);
        y = height - margin;
      }
      page.drawText(line, {
        x: margin,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
      y -= fontSize + 4; // line height
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    
    return {
      blob,
      filename: `${file.name.replace('.docx', '')}.pdf`
    };
  };

  return (
    <ToolLayout
      title="Word to PDF"
      description="Convert Word documents (.docx) into PDF files easily."
      accept={{ "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"] }}
      maxFiles={1}
      actionButtonText="Convert to PDF"
      onProcess={handleConvert}
    />
  );
}
