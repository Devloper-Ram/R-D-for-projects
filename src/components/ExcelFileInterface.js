import React, { useState } from "react";
import * as XLSX from "xlsx";

import { convertExcelDateToJSDate } from "../utils/DateFormatUtil";

import { ExcelSheetJsonCellRange } from "../appConstants";

const ExcelFileInterface = () => {
  const [jsonData, setJsonData] = useState([]);

  const getJsonDataBetweenCells = (
    workSheet,
    startCell,
    endCell,
    fieldName
  ) => {
    const range = XLSX.utils.decode_range(`${startCell}:${endCell}`);
    const json = [];

    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = workSheet[cellAddress];
        const cellData = cell ? cell.v : null;
        json.push(
          cellData
          //fieldName === "date" ? convertExcelDateToJSDate(cellData) : cellData // Convert excel date into JS Date
        );
      }
    }
    return json;
  };

  function replaceNaNWithEmptyString(data) {
    return data.map((obj) => {
      // Create a new object by mapping through each property in the original object
      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => {
          // Check if the value is NaN, if so replace it with an empty string
          if (typeof value === "number" && isNaN(value)) {
            return [key, ""];
          }
          return [key, value];
        })
      );
    });
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[2];
        const workSheet = workbook.Sheets[sheetName];
        console.log({
          last_month_stock_silo1: workSheet["D38"],
          last_month_stock_silo: workSheet["D40"],
        });

        const jsonObj = Object.entries(ExcelSheetJsonCellRange)
          .map((item) => {
            const [key, value] = item;
            return {
              [key]: getJsonDataBetweenCells(
                workSheet,
                value.start,
                value.end,
                key
              ),
            };
          })
          .reduce((acc, obj) => {
            return { ...acc, ...obj };
          }, {});

        // dfData is the first csv named "ash_info_table_all_sheet_merged_new.csv"
        let dfData = [];
        jsonObj["date"].forEach((_, outerIndex) => {
          let obj = {};
          Object.entries(jsonObj).forEach((jsonObjData, index) => {
            const [objKey, objValue] = jsonObjData;
            obj = { ...obj, [objKey]: objValue[outerIndex] };
          });
          dfData.push(obj);
        });
        // Here we are getting the calculated dfData [1st Csv Data]
        console.log({ dfData });
        // console.log({ jsonObj });
        // Get two new json
        const lastMonthStockSilo1 = workSheet["D38"].v;
        const lastMonthStockSilo2 = workSheet["D40"].v;
        let lastMonthStockDf = [];
        // const [siloStockDf, siloSentDf] = fillStockAndSentInfo2(
        //   dfData,
        //   lastMonthStockSilo1,
        //   lastMonthStockSilo2,
        //   lastMonthStockDf
        // );

        // console.log({ siloStockDf, siloSentDf });
        setJsonData(jsonObj);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  function excelSerialToUnixDate(excelDateNumber) {
    return (excelDateNumber - 25569) * 86400 * 1000;
  }

  function fillStockAndSentInfo2(
    df,
    lastMonthStockSilo1,
    lastMonthStockSilo2,
    lastMonthStockDf = [] // Empty dataset with ["date", "silo", "amount"] attributes
  ) {
    let siloStockDf = []; // Empty dataset with ["date","silo","coal_name", "ukeire_day", "amount"] attributes
    let siloSentDf = []; // Empty dataset with ["date","silo","coal_name", "ukeire_day", "amount"] attributes

    df = df.map((item) => ({
      ...item,
      date: excelSerialToUnixDate(item["date"]),
    }));
    const date = df[0]["date"];

    const lastMonthSilo1Info = lastMonthStockDf.filter(
      (row) =>
        row.date === new Date(date - 24 * 60 * 60 * 1000) &&
        row.silo === "silo1"
    );

    const lastMonthSilo2Info = lastMonthStockDf.filter(
      (row) =>
        row.date === new Date(date - 24 * 60 * 60 * 1000) &&
        row.silo === "silo2"
    );
    console.log({ lastMonthSilo1Info, lastMonthSilo2Info });
    //前月データがあり、かつ数値が一致するならその情報を取得。なければunknownとする

    if (
      lastMonthStockSilo1 ===
      lastMonthSilo1Info.reduce((sum, row) => sum + row?.amount, 0)
    ) {
      siloStockDf.push(...lastMonthSilo1Info);
    } else {
      siloStockDf.push({
        date: new Date(date - 24 * 60 * 60 * 1000),
        silo: "silo1",
        coal_name: "unknown",
        ukeire_day: null,
        amount: lastMonthStockSilo1,
      });
    }

    if (
      lastMonthStockSilo2 ===
      lastMonthSilo2Info.reduce((sum, row) => sum + row?.amount, 0)
    ) {
      siloStockDf.push(...lastMonthSilo2Info);
    } else {
      siloStockDf.push({
        date: new Date(date - 24 * 60 * 60 * 1000),
        silo: "silo2",
        coal_name: "unknown",
        ukeire_day: null,
        amount: lastMonthStockSilo2,
      });
    }

    [siloStockDf, siloSentDf] = getStockInfo2(
      df,
      siloStockDf,
      siloSentDf,
      date,
      "silo1"
    );
    [siloStockDf, siloSentDf] = getStockInfo2(
      df,
      siloStockDf,
      siloSentDf,
      date,
      "silo2"
    );

    //fill silo info for all day
    for (let item of df.slice(1)) {
      [siloStockDf, siloSentDf] = getStockInfo2(
        df,
        siloStockDf,
        siloSentDf,
        item["date"],
        "silo1"
      );
      [siloStockDf, siloSentDf] = getStockInfo2(
        df,
        siloStockDf,
        siloSentDf,
        item["date"],
        "silo2"
      );
    }

    //前月データは除去
    siloStockDf = siloStockDf.filter((row) => row.date >= df[0]["date"]);
    return [siloStockDf, siloSentDf];
  }

  function getStockInfo2(df, stock_df, sent_df, date, silo_num) {
    const dfDate = replaceNaNWithEmptyString(df).find(
      (ele) => ele["date"] === date
    );
    // const coal_name = df[date]["coal_type"] || "";
    const coal_name = dfDate?.["coal_type"];
    // const stock_amount = df[date][`${silo_num}_stock`]; // this is the stock amount at the end of the day
    const stock_amount = dfDate?.[`${silo_num}_stock`]; // this is the stock amount at the end of the day
    const income = dfDate?.[`${silo_num}_income`] || 0;
    let sent =
      (dfDate?.[`coal_send_5T_${silo_num}`] || 0) +
      (dfDate?.[`coal_send_6T_${silo_num}`] || 0);
    const hosei_amount = dfDate?.[`${silo_num}_hosei`] || 0;
    const chotanba_ukeire_amount = dfDate?.[`${silo_num}_chotanba_ukeire`] || 0;

    let sent_original = sent;
    const last_day_stock_df = stock_df.filter(
      (row) => row.date === new Date(date - 86400000) && row.silo === silo_num
    );

    let next_day_stock_df = [...last_day_stock_df];
    next_day_stock_df[0] = {
      ...next_day_stock_df[0],
      amount:
        last_day_stock_df[0]?.amount + hosei_amount - chotanba_ukeire_amount,
    };

    if (income > 0) {
      next_day_stock_df.push({
        date: date,
        silo: silo_num,
        coal_name: coal_name,
        ukeire_day: date,
        amount: income,
      }); // this is the stock amount at the beginning of the day
    }

    while (sent > 0) {
      if (next_day_stock_df[0]?.amount > sent) {
        next_day_stock_df[0].amount -= sent;
        sent_df.push({
          date: date,
          silo: silo_num,
          coal_name: next_day_stock_df[0].coal_name,
          ukeire_day: next_day_stock_df[0].ukeire_day,
          amount: sent,
        });
        sent = 0;
      } else {
        sent -= next_day_stock_df[0]?.amount;
        sent_df.push({
          date: date,
          silo: silo_num,
          coal_name: next_day_stock_df[0].coal_name,
          ukeire_day: next_day_stock_df[0].ukeire_day,
          amount: next_day_stock_df[0]?.amount,
        });
        next_day_stock_df.shift();
      }
    }

    const total_stock = next_day_stock_df.reduce(
      (sum, row) => sum + row?.amount,
      0
    );

    if (total_stock !== stock_amount) {
      console.log(`stock mismatch!
        Actual is ${stock_amount} but calculated total is ${total_stock}
        new_stock_detail ${JSON.stringify(next_day_stock_df)}
        income ${income}
        hosei ${hosei_amount}
        chotanba_ukeire ${chotanba_ukeire_amount}`);
      console.log("");
    }

    const total_sent = sent_df
      .filter((row) => row.date === date && row.silo === silo_num)
      .reduce((sum, row) => sum + row?.amount, 0);
    if (total_sent !== sent_original) {
      console.log(`sent mismatch!
        Actual is ${sent_original} but calculated total is ${total_sent}
        sent_detail ${JSON.stringify(sent_df)}
        income ${income}
        hosei ${hosei_amount}
        chotanba_ukeire ${chotanba_ukeire_amount}`);
      console.log("");
    }

    next_day_stock_df.forEach((row) => (row.date = date));

    stock_df = [...stock_df, ...next_day_stock_df];

    return [stock_df, sent_df];
  }

  /*
    @params:-
    df -> ash_info_table_all_sheet_merged_new.csv/ First json
    loadedSheet -> Worksheet e.g- 23.1
    lastMonthSheet -> 23.1 - 1 = 22.12 if available else empty array []

  */
  function fillReceivedCoalInfo2(
    df,
    loadedSheet,
    lastMonthSheet,
    monthLength,
    colNames,
    lastMonthLength,
    lastMonthColNames
  ) {
    const mask = loadedSheet["Unnamed: 1"]
      .map((item) => (item === null ? "" : item)) // Replace `null` (NaN equivalent) with an empty string
      .map((item) => item.includes("炭種")) // Check if the item contains "炭種"
      .map((item) => (item === null ? false : item)); // Replace `null` results with `false`
    console.log({mask})
    }

  return (
    <div>
      <h3>Excel File Interface</h3>
      <input type="file" onChange={handleFileUpload} />
      <pre>{JSON.stringify(jsonData, null, 2)}</pre>
    </div>
  );
};

export default ExcelFileInterface;
