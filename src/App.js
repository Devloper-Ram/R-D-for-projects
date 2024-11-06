import CustomPdfInterface from "./components/CustomPdfInterface";
import { pdfjs } from "react-pdf";
import CustomPDFViewer from "./components/CustomPdfViewer";

import myPdfFile from "./assets/files/pdf1.pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

function App() {
  const highlights = [
    {
      pageNumber: 1,
      points: [
        [2.4082, 6.3574], // x1, y1
        [2.6008, 6.3574], // x2, y1
        [2.6008, 6.4689], // x2, y2
        [2.4082, 6.4689], // x1, y2
      ],
      tooltip: "Ash",
    },
    {
      pageNumber: 1,
      points: [
        [4.9735, 6.9505,],
        [5.2625, 6.9505,],
        [5.2625, 7.0773,],
        [4.9735, 7.0773],
      ],
      tooltip: "(ARB)",
    },

    {
      pageNumber: 2,
      points: [
        [2.398, 5.9772,],
        [3.0673, 5.9772,],
        [3.0673, 6.1039,],
        [2.4031, 6.1039],
      ],
      tooltip: "Deformation",
    },
    // Add more highlights as needed
  ];
  return (
    <div className="App">
      <h3>Hello</h3>
      <>
        {/* <CustomPdfInterface /> */}
        <CustomPDFViewer pdfFile={myPdfFile} highlights={highlights} />
      </>
    </div>
  );
}

export default App;
