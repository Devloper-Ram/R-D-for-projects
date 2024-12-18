import React, { useEffect, useState } from "react";
import { Document, Page } from "react-pdf";
import "./PDFViewer.css";
import pdfData1 from "../assets/files/pdf1JsonData.json";
import pdfData2 from "../assets/files/pdf2JsonData.json";
import pdfData3 from "../assets/files/pdf3JsonData.json";

const Highlight = ({
  points,
  tooltip,
  itemData,
  selectedItem,
  onItemSelectHandler,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const scale = 72;
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
    border: `1px solid ${
      selectedItem.fieldName === itemData.fieldName ? "red" : "green"
    }`,
    // zIndex: selectedItem.fieldName === itemData.fieldName ? 2 : 1,
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
      onClick={() => onItemSelectHandler(itemData, itemData.pageNumber)}
    >
      {/* {showTooltip && (
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
      )} */}
    </div>
  );
};

const CustomPDFViewer = ({ pdfFile }) => {
  const [numPages, setNumPages] = useState();
  const [pageNumber, setPageNumber] = useState(1);
  const [tableData, setTableData] = useState([]);
  const [pdfJsonData, setPdfJsonData] = useState([]);
  const [selectedItem, setSelectedItem] = useState({});
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };
console.log({selectedItem})
  useEffect(() => {
    setPdfJsonData(pdfData3);
    const parsedTableData = Object.entries(
      pdfData3.analyzeResult.documents[0].fields
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
    // console.log({ parsedTableData });
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

  const onItemSelectHandler = (item, itemPageNumber) => {
    setSelectedItem(item)
    setPageNumber(itemPageNumber)
  }

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
                  onClick={() => {
                    onItemSelectHandler(item, item.pageNumber)
                  }}
                  style={{
                    cursor: "pointer",
                    backgroundColor:
                      selectedItem?.fieldName === item.fieldName
                        ? "red"
                        : "transparent",
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

      {tableData
        .filter((data) => data.pageNumber === pageNumber)
        .map((data, index) => (
          <Highlight
            key={index}
            itemData={data}
            selectedItem={selectedItem}
            onItemSelectHandler={onItemSelectHandler}
            points={convertPolygonToPoints(data.polygon, 2)}
            tooltip={data.fieldValue}
          />
        ))}
    </div>
  );
};

export default CustomPDFViewer;
