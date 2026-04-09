import { useEffect, useState } from "react";
import ToolLayout from "@/src/components/ToolLayout";
import * as pdfjsLib from "pdfjs-dist";
import { useGemini } from "@/src/components/GeminiContext";
import { useNavigate } from "react-router-dom";
import { analyzeContent } from "@/src/services/geminiService";
import { Loader2 } from "lucide-react";

// @ts-ignore
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export default function PDFToWord() {
  const { isGeminiEnabled } = useGemini();
  const navigate = useNavigate();
  const [isGeminiProcessing, setIsGeminiProcessing] = useState(false);

  useEffect(() => {
    if (!isGeminiEnabled) {
      navigate("/");
    }
  }, [isGeminiEnabled, navigate]);

  const handleConvert = async (files: File[]) => {
    if (files.length !== 1) {
      throw new Error("Please select exactly 1 PDF file.");
    }

    const file = files[0];
    const arrayBuffer = await file.arrayBuffer();
    
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = "";
    let fullHtml = "";
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\n\n";

      let pageHtml = `<div style="position:relative; width:${viewport.width}px; height:${viewport.height}px; background:white; page-break-after:always; overflow:hidden; border:1px solid #eee; margin-bottom:20px;">`;
      
      // 1. Handle Text with absolute positioning
      for (const item of textContent.items as any[]) {
        const { str, transform } = item;
        const tx = [
          viewport.transform[0] * transform[0] + viewport.transform[2] * transform[1],
          viewport.transform[1] * transform[0] + viewport.transform[3] * transform[1],
          viewport.transform[0] * transform[2] + viewport.transform[2] * transform[3],
          viewport.transform[1] * transform[2] + viewport.transform[3] * transform[3],
          viewport.transform[0] * transform[4] + viewport.transform[2] * transform[5] + viewport.transform[4],
          viewport.transform[1] * transform[4] + viewport.transform[3] * transform[5] + viewport.transform[5]
        ];
        
        const fontSize = Math.sqrt(tx[0] * tx[0] + tx[1] * tx[1]);
        const style = `
          position: absolute;
          left: ${tx[4]}px;
          top: ${tx[5] - fontSize}px;
          font-size: ${fontSize}px;
          font-family: Arial, sans-serif;
          white-space: pre;
          line-height: 1;
          color: black;
          transform: rotate(${Math.atan2(tx[1], tx[0])}rad);
          transform-origin: 0 100%;
          z-index: 2;
        `;
        
        pageHtml += `<span style="${style}">${str}</span>`;
      }

      // 2. Handle Images
      try {
        const operatorList = await page.getOperatorList();
        let ctm = [1, 0, 0, 1, 0, 0];
        const ctmStack = [];

        for (let j = 0; j < operatorList.fnArray.length; j++) {
          const fn = operatorList.fnArray[j];
          const args = operatorList.argsArray[j];

          if (fn === (pdfjsLib as any).OPS.save) {
            ctmStack.push([...ctm]);
          } else if (fn === (pdfjsLib as any).OPS.restore) {
            ctm = ctmStack.pop() || [1, 0, 0, 1, 0, 0];
          } else if (fn === (pdfjsLib as any).OPS.transform) {
            const m2 = args;
            const m1 = ctm;
            ctm = [
              m1[0] * m2[0] + m1[2] * m2[1],
              m1[1] * m2[0] + m1[3] * m2[1],
              m1[0] * m2[2] + m1[2] * m2[3],
              m1[1] * m2[2] + m1[3] * m2[3],
              m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
              m1[1] * m2[4] + m1[3] * m2[5] + m1[5]
            ];
          } else if (fn === (pdfjsLib as any).OPS.paintImageXObject || fn === (pdfjsLib as any).OPS.paintInlineImageXObject) {
            const imgKey = args[0];
            const img = await new Promise((resolve) => {
              page.objs.get(imgKey, (obj: any) => resolve(obj));
            });

            if (img && (img as any).data) {
              const canvas = document.createElement('canvas');
              canvas.width = (img as any).width;
              canvas.height = (img as any).height;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                const imageData = ctx.createImageData(canvas.width, canvas.height);
                const data = (img as any).data;
                
                if (data.length === canvas.width * canvas.height * 3) {
                  const rgba = new Uint8ClampedArray(canvas.width * canvas.height * 4);
                  for (let k = 0, l = 0; k < data.length; k += 3, l += 4) {
                    rgba[l] = data[k];
                    rgba[l+1] = data[k+1];
                    rgba[l+2] = data[k+2];
                    rgba[l+3] = 255;
                  }
                  imageData.data.set(rgba);
                } else if (data.length === canvas.width * canvas.height) {
                  const rgba = new Uint8ClampedArray(canvas.width * canvas.height * 4);
                  for (let k = 0, l = 0; k < data.length; k++, l += 4) {
                    rgba[l] = data[k];
                    rgba[l+1] = data[k];
                    rgba[l+2] = data[k];
                    rgba[l+3] = 255;
                  }
                  imageData.data.set(rgba);
                } else {
                  imageData.data.set(data);
                }
                ctx.putImageData(imageData, 0, 0);
                
                const dataUrl = canvas.toDataURL('image/png');
                const m1 = viewport.transform;
                const m2 = ctm;
                const tx = [
                  m1[0] * m2[0] + m1[2] * m2[1],
                  m1[1] * m2[0] + m1[3] * m2[1],
                  m1[0] * m2[2] + m1[2] * m2[3],
                  m1[1] * m2[2] + m1[3] * m2[3],
                  m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
                  m1[1] * m2[4] + m1[3] * m2[5] + m1[5]
                ];

                const imgWidth = Math.sqrt(tx[0] * tx[0] + tx[1] * tx[1]);
                const imgHeight = Math.sqrt(tx[2] * tx[2] + tx[3] * tx[3]);
                
                pageHtml += `<img src="${dataUrl}" style="position:absolute; left:${tx[4]}px; top:${tx[5] - imgHeight}px; width:${imgWidth}px; height:${imgHeight}px; z-index:1;" />`;
              }
            }
          }
        }
      } catch (e) {
        console.warn("Image extraction failed for page", i, e);
      }
      
      pageHtml += `</div>`;
      fullHtml += pageHtml;
    }

    // If Gemini is enabled, we can use it to generate a cleaner Word-compatible HTML
    if (isGeminiEnabled) {
      setIsGeminiProcessing(true);
      try {
        const cleanedText = await analyzeContent(fullText, "Convert this extracted PDF text into a clean, well-structured HTML document that preserves the original layout, headings, and paragraphs. Use standard HTML tags like <h1>, <p>, <ul>, etc. Return ONLY the HTML body content.");
        fullHtml = cleanedText || fullHtml;
      } catch (e) {
        console.error("Gemini Word conversion failed:", e);
      } finally {
        setIsGeminiProcessing(false);
      }
    }

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Exported Document</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          @page { size: A4; margin: 1in; }
        </style>
      </head>
      <body>
        ${fullHtml}
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
    <div className="space-y-8">
      <ToolLayout
        title="PDF to Word"
        description={isGeminiEnabled ? "AI-Powered Word Conversion. Gemini AI will reconstruct your document for maximum fidelity." : "Extract text from your PDF files and download as a Word document (.doc)."}
        accept={{ "application/pdf": [".pdf"] }}
        maxFiles={1}
        actionButtonText={isGeminiProcessing ? "Gemini is reconstructing..." : "Convert to Word"}
        onProcess={handleConvert}
      />

      {isGeminiProcessing && (
        <div className="container mx-auto max-w-4xl px-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-6 flex items-center gap-4 animate-pulse">
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            <p className="text-blue-700 dark:text-blue-300 font-medium">Gemini AI is reconstructing your Word document for perfect formatting...</p>
          </div>
        </div>
      )}
    </div>
  );
}

