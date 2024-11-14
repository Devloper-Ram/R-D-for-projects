export const convertExcelDateToJSDate = (excelDate) => {

// Convert to JavaScript date
    const jsDate = new Date((excelDate - 25569) * 86400 * 1000);
    return jsDate
    // return dateFormat(jsDate)
}

export const dateFormat = (dateStr) => {
    const day = String(dateStr.getDate()).padStart(2, '0');
    const month = String(dateStr.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = dateStr.getFullYear();

    return `${day}/${month}/${year}`
}