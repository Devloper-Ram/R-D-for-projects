import React, { useEffect, useState } from "react";
import { Document, Page } from "react-pdf";
import "./PDFViewer.css";
import pdfData from "../assets/files/pdf1JsonData.json";

const Highlight = ({ points, tooltip }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const scale = 71.8;
  const style = {
    position: "absolute",
    top: Math.min(...points.map((p) => p[1])) * scale,
    left: Math.min(...points.map((p) => p[0])) * scale,
    width:
      (Math.max(...points.map((p) => p[0])) -
        Math.min(...points.map((p) => p[0]))) *
      scale,
    height:
      (Math.max(...points.map((p) => p[1])) -
        Math.min(...points.map((p) => p[1]))) *
      scale,
    border: "2px solid yellow",
    // backgroundColor: "rgba(255, 255, 0, 0.5)", // Highlight color with transparency
    pointerEvents: "auto",
  };

  const mouseEnterHandler = (event) => {
    console.log("entered tooltip", { x: event.clientX, y: event.clientY });
    setShowTooltip(true);
    setTooltipPosition({
      top: event.clientY + 10,
      left: event.clientX + 10,
    }); // Adjust position based on mouse event
  };

  const mouseLeaveHandler = () => {
    console.log("left tooltip");
    setShowTooltip(false);
    setTooltipPosition({ top: 0, left: 0 });
  };

  return (
    <div
      id={`highlights-${tooltip}`}
      style={style}
      title={tooltip}
      onMouseEnter={(event) => mouseEnterHandler(event)}
      onMouseLeave={mouseLeaveHandler}
    >
      {showTooltip && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            backgroundColor: "#333",
            color: "white",
            padding: "5px 10px",
            borderRadius: "5px",
            zIndex: 10,
            transform: "translate(-50%, -100%)",
          }}
        >
          {tooltip}
        </div>
      )}
    </div>
  );
};

const CustomPDFViewer = ({ pdfFile, highlights }) => {
  const [numPages, setNumPages] = useState();
  const [pageNumber, setPageNumber] = useState(1);
  const [tableData, setTableData] = useState([]);
  const [pdfJsonData, setPdfJsonData] = useState([]);
  const [selectedItem, setSelectedItem] = useState({})
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  useEffect(() => {
    setPdfJsonData(pdfData);
    const parsedTableData = Object.entries(
      pdfData.analyzeResult.documents[0].fields
    )
      .map((item, index) => {
        const [key, value] = item;
        return {
          fieldName: key,
          fieldValue: value.content,
          pageNumber: value.boundingRegions?.[0]?.pageNumber,
          polygon: value.boundingRegions?.[0]?.polygon,
        };
      })
      .filter((item) => item.fieldValue && item.polygon);
    console.log({ parsedTableData });
    setTableData(parsedTableData);
  }, []);

  const convertPolygonToPoints = (arr, size) => {
    return arr.reduce((acc, _, index) => {
      if (index % size === 0) {
        acc.push(arr.slice(index, index + size));
      }
      return acc;
    }, []);
  };

  return (
    <div id="pdf-container" style={{ position: "relative" }}>
      <div className="d-flex flex-row">
        <div>
          <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
            {/* {Array.from(new Array(numPages), (x, i) => i + 1).map((page, idx) => ( */}
            <Page
              pageNumber={pageNumber}
              renderAnnotationLayer={false}
              renderTextLayer={false}
            />
            {/* ))} */}
          </Document>
          <div>
            <button
              onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
              disabled={pageNumber <= 1}
            >
              Previous
            </button>
            <button
              onClick={() =>
                setPageNumber((prev) => Math.min(prev + 1, numPages))
              }
              disabled={pageNumber >= numPages}
            >
              Next
            </button>
            <p>
              Page {pageNumber} of {numPages}
            </p>
          </div>
        </div>
        <div style={{ flex: 1, padding: "10px" }}>
          <h3>Analysis Results</h3>
          <table
            border="1"
            cellPadding="5"
            style={{ width: "100%", borderCollapse: "collapse" }}
          >
            <thead>
              <tr>
                <th>Field Name</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((item) => (
                <tr
                  key={item.fieldName}
                  onClick={() => setSelectedItem(item)}
                  style={{
                    cursor: "pointer",
                    backgroundColor: selectedItem?.fieldName === item.fieldName ? "red" : "transparent",
                  }}
                >
                  <td>{item.fieldName}</td>
                  <td>{item.fieldValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* {highlights
        .filter((highlight) => highlight.pageNumber === pageNumber)
        .map((highlight, index) => (
          <Highlight
            key={index}
            points={highlight.points}
            tooltip={highlight.tooltip}
          />
        ))} */}
      {tableData
        .filter((data) => data.pageNumber === pageNumber)
        .map((data, index) => (
          <Highlight
            key={index}
            itemData={data}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            points={convertPolygonToPoints(data.polygon, 2)}
            tooltip={data.fieldValue}
          />
        ))}
    </div>
  );
};

export default CustomPDFViewer;
