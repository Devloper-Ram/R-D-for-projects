import React, { useState } from "react";
import * as XLSX from "xlsx";

import { ExcelSheetJsonCellRange } from "../appConstants";

const ExcelFileInterface = () => {
  const [jsonData, setJsonData] = useState([]);

  const getJsonDataBetweenCells = (workSheet, startCell, endCell) => {
    const range = XLSX.utils.decode_range(`${startCell}:${endCell}`);
    const json = [];

    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = workSheet[cellAddress];
        json.push(cell ? cell.v : null); // Assign cell value or null if cell is empty
      }
    }
    return json
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[2];
        const workSheet = workbook.Sheets[sheetName]

        const jsonArr = Object.entries(ExcelSheetJsonCellRange).map((item) => {
          const [key, value] = item
          return ({
            [key]: getJsonDataBetweenCells(workSheet, value.start, value.end)
          })
        })
        console.log(jsonArr)
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        
        setJsonData(json);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div>
      <h3>Excel File Interface</h3>
      <input type="file" onChange={handleFileUpload} />
      <pre>{JSON.stringify(jsonData, null, 2)}</pre>
    </div>
  );
};

export default ExcelFileInterface;
