import ToolLayout from "@/src/components/ToolLayout";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export default function TextToPDF() {
  const handleConvert = async (files: File[]) => {
    if (files.length !== 1) {
      throw new Error("Please select exactly 1 text file.");
    }

    const file = files[0];
    let text = await file.text();
    
    // Sanitize text for WinAnsi encoding (StandardFonts.Helvetica)
    text = text
      .replace(/[\u2018\u2019\u02BC\u02BB\u0060\u00B4]/g, "'") // Smart single quotes and modifier commas
      .replace(/[\u201C\u201D]/g, '"') // Smart double quotes
      .replace(/[\u2013\u2014]/g, '-') // En and em dashes
      .replace(/[\u2026]/g, '...') // Ellipsis
      .replace(/[^\x00-\x7F\xA0-\xFF\n\r\t]/g, ''); // Remove other unsupported characters

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
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = font.widthOfTextAtSize(currentLine + " " + word, fontSize);
      if (width < maxWidth) {
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
      filename: `${file.name.replace('.txt', '')}.pdf`
    };
  };

  return (
    <ToolLayout
      title="Text to PDF"
      description="Convert plain text files (.txt) into PDF documents."
      accept={{ "text/plain": [".txt"] }}
      maxFiles={1}
      actionButtonText="Convert to PDF"
      onProcess={handleConvert}
    />
  );
}
