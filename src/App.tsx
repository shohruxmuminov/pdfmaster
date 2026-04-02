import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Tools from "./pages/Tools";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import { ThemeProvider } from "./components/ThemeProvider";

// Tools
import MergePDF from "./pages/tools/MergePDF";
import SplitPDF from "./pages/tools/SplitPDF";
import CompressPDF from "./pages/tools/CompressPDF";
import ImageToPDF from "./pages/tools/ImageToPDF";
import PDFToWord from "./pages/tools/PDFToWord";
import TextToPDF from "./pages/tools/TextToPDF";
import WordToPDF from "./pages/tools/WordToPDF";

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="pdf-tools-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="tools" element={<Tools />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="contact" element={<Contact />} />
            
            {/* Tool Routes */}
            <Route path="tools/merge" element={<MergePDF />} />
            <Route path="tools/split" element={<SplitPDF />} />
            <Route path="tools/compress" element={<CompressPDF />} />
            <Route path="tools/image-to-pdf" element={<ImageToPDF />} />
            <Route path="tools/pdf-to-word" element={<PDFToWord />} />
            <Route path="tools/text-to-pdf" element={<TextToPDF />} />
            <Route path="tools/word-to-pdf" element={<WordToPDF />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

