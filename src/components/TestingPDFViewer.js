import React, { useState, useEffect } from "react";
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";
import pdfUrl from "../assets/files/pdf1.pdf";

// Import the pdf.js styles for annotations
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

const PdfViewer = ({ fileUrl, polygons }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  // Callback to get the number of pages when PDF is loaded
  const onLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  // Function to draw polygons on a specific page
  const drawPolygonsOnPage = async (pageNumber) => {
    // Load the PDF document using pdfjs
    const pdf = await pdfjs.getDocument(fileUrl).promise;
    const page = await pdf.getPage(pageNumber);

    // Get the page viewport and create a canvas context
    const viewport = page.getViewport({ scale: 1.0 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render the page onto the canvas
    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    // Now, draw the polygons (annotations) on the page
    polygons.forEach((polygon) => {
      // Ensure we have pairs of x, y coordinates
      if (polygon.length % 2 === 0) {
        context.beginPath();
        context.moveTo(polygon[0], polygon[1]); // Start at the first point (x1, y1)

        // Loop through the rest of the points and draw lines
        for (let i = 2; i < polygon.length; i += 2) {
          context.lineTo(polygon[i], polygon[i + 1]);
        }

        // Close the polygon (return to the starting point)
        context.closePath();
        context.strokeStyle = "red"; // Set polygon color
        context.lineWidth = 2; // Set polygon border thickness
        context.stroke(); // Apply stroke (border)

        // Optionally, fill the polygon (remove this line if you don't want filled shapes)
        context.fillStyle = "rgba(255, 0, 0, 0.3)"; // Semi-transparent red fill
        context.fill();
      }
    });
  };

  // Draw polygons when the page changes
  useEffect(() => {
    drawPolygonsOnPage(pageNumber);
  }, [pageNumber, polygons]);

  return (
    <div>
      <h3>PDF Viewer with Dynamic Polygon Annotations</h3>
      <Document
        file={fileUrl}
        onLoadSuccess={onLoadSuccess}
        loading="Loading PDF..."
      >
        <Page
          pageNumber={pageNumber}
          renderTextLayer={false} // Disable text layer if you want only the canvas
          renderAnnotationLayer={true} // Enable annotation layer rendering
        />
      </Document>

      <div>
        <button
          onClick={() => setPageNumber(pageNumber - 1)}
          disabled={pageNumber <= 1}
        >
          Previous
        </button>
        <span>
          Page {pageNumber} of {numPages}
        </span>
        <button
          onClick={() => setPageNumber(pageNumber + 1)}
          disabled={pageNumber >= numPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

// Sample Polygon Coordinates (as example)
const polygons = [
  // Example 1: Rectangle (or any polygon)
  [2.4031, 2.6665, 3.3265, 2.6717, 3.3258, 2.8087, 2.4023, 2.8035],
  // Example 2: Another polygon (could be a triangle, hexagon, etc.)
  [6.3728, 7.8935, 6.6669, 7.8935, 6.6669, 8.0304, 6.3728, 8.0304],

  // Add more polygons here
];
const convertPolygonToPoints = (arr, size) => {
    return arr.reduce((acc, _, index) => {
      if (index % size === 0) {
        acc.push(arr.slice(index, index + size));
      }
      return acc;
    }, []);
  };
  const scale = 72
const updatedPolygons = convertPolygonToPoints(polygons.map((item) => item * scale), 2)
console.log({updatedPolygons})
function TestingPDFViewer() {
  return (
    <div className="TestingPDFViewer">
      <h1>React PDF Viewer with Annotations</h1>
      <PdfViewer fileUrl={pdfUrl} polygons={updatedPolygons} />
    </div>
  );
}

export default TestingPDFViewer;
