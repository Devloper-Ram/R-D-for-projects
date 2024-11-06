import React, { useState } from "react";
import { Document, Page } from "react-pdf";
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib"; // Import pdf-lib

import myPdfFile from "../assets/files/pdf1.pdf";

const CustomPdfInterface = () => {
  const [numPages, setNumPages] = useState();
  const [pageNumber, setPageNumber] = useState(1);
  const [file, setFile] = useState(null);
  const [highlighted, setHighlighted] = useState(false);
  const [highlightedPolygons, setHighlightedPolygons] = useState([]); // State to track highlighted polygons

  // Example polygon coordinates for highlighting
  // const highlightRegions = {
  //   1: [
  //     [2.4082, 5.9772, 2.682, 6.0988], // Polygon 1 for page 1
  //     [2.5, 6.1, 3.0, 6.5], // Polygon 2 for page 1
  //   ],
  //   2: [
  //     [1.0, 3.0, 1.5, 4.0], // Polygon 1 for page 2
  //     [3.0, 2.0, 4.0, 3.0], // Polygon 2 for page 2
  //   ],
  // };

  // Example polygon coordinates for highlighting
  const polygonCoordinates = [
    2.7073, 5.9822, 3.1839, 5.9822, 3.1788, 6.0988, 2.7073, 6.0988,
  ];

  console.log("file", { file });

  const highlightText = async () => {
    if (file) {
      // Fetch the existing PDF
      const existingPdfBytes = await fetch(file).then((res) =>
        res.arrayBuffer()
      );
      console.log("existingPdfBytes", { existingPdfBytes });
      const pdfDoc = await PDFDocument.load(existingPdfBytes);

      // Get the first page to apply the highlight
      const page = pdfDoc.getPage(pageNumber - 1); // Adjust for zero-based index
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();
      // firstPage.drawText('This text was added with JavaScript!', {
      //   x: 5,
      //   y: height / 2 + 300,
      //   size: 50,
      //   font: helveticaFont,
      //   color: rgb(0.95, 0.1, 0.1),
      //   rotate: degrees(-45),
      //   borderColor: rgb(1, 1, 0),
      //   borderWidth: 2,
      //   opacity: 0.5
      // })

      // Scale factor to convert points to visible units
      const scale = 65;
      // const scaledCoordinates = polygonCoordinates.map(
      //   (coord, index) =>
      //     index % 2 === 0 ? coord * scale : page.getHeight() - coord * scale // Invert y coordinate
      // );

      const scaledCoordinates = polygonCoordinates.map(
        (coord) => coord * scale
      );
      const factor = 2;

      // Draw the rectangle using the provided polygon coordinates
      page.drawRectangle({
        x: scaledCoordinates[0], //30,
        y: scaledCoordinates[1], //500,
        width: scaledCoordinates[2] - scaledCoordinates[0], //100,
        height: scaledCoordinates[7] - scaledCoordinates[1], //20,
        borderColor: rgb(1, 1, 0), // Yellow border
        borderWidth: 2,
        opacity: 0.5, // Optional: Make it semi-transparent
      });

      // page.drawRectangle({
      //   x: scaledCoordinates[0], // x1 (bottom-left x)
      //   y: scaledCoordinates[1], // y1 (bottom-left y)
      //   width: scaledCoordinates[2] - scaledCoordinates[0], // width (bottom-right x - bottom-left x)
      //   height: scaledCoordinates[3] - scaledCoordinates[1], // height (top-left y - bottom-left y)
      //   color: rgb(1, 1, 0), // Fill color (yellow)
      //   borderColor: rgb(1, 0, 0), // Border color (red)
      //   borderWidth: 2, // Border width
      // });

      // Save the modified PDF
      const pdfBytes = await pdfDoc.save();

      // Create a new Blob and a URL for the modified PDF
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      // Open the modified PDF in a new tab
      window.open(url);
      setHighlighted(true); // Set highlight state if needed
    }
  };

  // Handle file upload
  const onFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setFile(URL.createObjectURL(uploadedFile));
      setPageNumber(1); // Reset to the first page when a new file is uploaded
    }
  };

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  // Function to handle mouse hover
  // const handleMouseEnter = (page) => {
  //   const polygons = highlightRegions[page];
  //   if (polygons) {
  //     setHighlightedPolygons(polygons); // Set the polygons for the current page as highlighted
  //   }
  // };

  // const handleMouseLeave = () => {
  //   setHighlightedPolygons([]); // Clear the highlighted polygons on mouse leave
  // };

  // const renderHighlight = (coordinates) => {
  //   return (
  //     <div
  //       style={{
  //         position: "absolute",
  //         left: coordinates[0],
  //         top: coordinates[1],
  //         width: coordinates[2] - coordinates[0],
  //         height: coordinates[3] - coordinates[1],
  //         border: "2px solid yellow",
  //         pointerEvents: "none", // Prevent mouse events on the highlight
  //         zIndex: 10,
  //       }}
  //     />
  //   );
  // };

  return (
    <div>
      <input type="file" accept="application/pdf" onChange={onFileChange} />
      <button onClick={highlightText}>Highlight text</button>
      <div className="container-pdf">
        <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
          {/* {Array.from(new Array(numPages), (x, i) => (
            <div
              key={i}
              onMouseEnter={() => handleMouseEnter(i + 1)}
              onMouseLeave={handleMouseLeave}
              style={{ position: "relative" }}
            >
              <Page
                pageNumber={i + 1}
                renderAnnotationLayer={false}
                renderTextLayer={false}
              />
              {highlightedPolygons.map((polygon, index) =>
                renderHighlight(polygon)
              )}
            </div>
          ))} */}
          {Array.from(new Array(numPages), (x, i) => i + 1).map((page, idx) => (
            <Page
              key={idx}
              pageNumber={page}
              renderAnnotationLayer={false}
              renderTextLayer={false}
            />
          ))}
        </Document>
        <p>
          Page {pageNumber} of {numPages}
        </p>
      </div>
    </div>
  );
};

export default CustomPdfInterface;
