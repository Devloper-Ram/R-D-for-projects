import CustomPdfInterface from "./components/CustomPdfInterface";
import { pdfjs } from "react-pdf";
import CustomPDFViewer from "./components/CustomPdfViewer";

import myPdfFile1 from "./assets/files/pdf1.pdf";
import myPdfFile2 from "./assets/files/pdf2.pdf";
import myPdfFile3 from "./assets/files/pdf3.pdf";
import ExcelFileInterface from "./components/ExcelFileInterface";
import TestingPDFViewer from "./components/TestingPDFViewer";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

function App() {
  return (
    <div className="App">
      <h3>Hello</h3>
      <>
        {/* <CustomPdfInterface /> */}
        <CustomPDFViewer pdfFile={myPdfFile3} />
        {/* <ExcelFileInterface /> */}
        {/* <TestingPDFViewer /> */}
      </>
    </div>
  );
}

export default App;
