import { scoringCriteria } from "./pfaCriteria.js";


document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById("file-input");
    const processButton = document.getElementById("process-button");
    const outputWorkbook = XLSX.utils.book_new();

    fileInput.addEventListener("change", loadScoringCriteria);
    processButton.addEventListener("click", () => {
        if (!fileInput.files[0]) {
            console.error("No file selected.");
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(firstSheet);

            processSpreadsheetRows(rows, outputWorkbook);
            XLSX.writeFile(outputWorkbook, "Updated_Scores.xlsx");
        };

        reader.readAsArrayBuffer(fileInput.files[0]);
    });
});

function loadScoringCriteria(event) {
    const file = event.target.files[0];
    if (!file) {
        console.error("No file selected.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        window.scoringCriteria = jsonData;
        console.log("Scoring criteria loaded:", jsonData);
    };

    reader.readAsArrayBuffer(file);
}

function processSpreadsheetRows(rows, outputWorkbook) {
    const updatedRows = rows.map(row => {
        const [lastName, firstName] = row["Last Name, First Name"].split(",").map(name => name.trim());
        const age = getAgeGroup(parseInt(row["Age"], 10) || 0);
        console.log(age);
        const gender = row["Gender"].toLowerCase();

        const pushups = parseInt(row["Push-ups"], 10) || 0;
        const situps = parseInt(row["Sit-ups"], 10) || 0;

        let totalRunTimeInSeconds = 0;
        const officialRunTime = row["Lap 6 (MM:SS) Official Run Time"];
        if (officialRunTime) {
            const [minutes, seconds] = officialRunTime.split(":").map(Number);
            totalRunTimeInSeconds = minutes * 60 + seconds;
        }

        const pushupPoints = getPoints(pushups, "pushup", gender, age);
        const situpPoints = getPoints(situps, "situp", gender, age);
        const runPoints = getPoints(totalRunTimeInSeconds, "1.5_mile_run", gender, age);

        const totalScore = pushupPoints + situpPoints + runPoints;

        console.log(`Results for ${firstName} ${lastName}:`);
        console.log(`Push-ups: ${pushups}, Points: ${pushupPoints}`);
        console.log(`Sit-ups: ${situps}, Points: ${situpPoints}`);
        console.log(`Run Time: ${formatTime(totalRunTimeInSeconds)}, Points: ${runPoints}`);
        console.log(`Total Points: ${totalScore}`);

        return {
            ...row,
            "Push-up Score": pushupPoints,
            "Sit-up Score": situpPoints,
            "Run Score": runPoints,
            "Total Score": totalScore
        };
    });

    const newSheet = XLSX.utils.json_to_sheet(updatedRows);
    const sheetName = "Updated Scores";
    if (outputWorkbook.SheetNames.includes(sheetName)) {
        const index = outputWorkbook.SheetNames.indexOf(sheetName);
        outputWorkbook.SheetNames.splice(index, 1);
        delete outputWorkbook.Sheets[sheetName];
    }
    XLSX.utils.book_append_sheet(outputWorkbook, newSheet, sheetName);
}

function getPoints(score, exercise, gender, ageGroup) {


    console.log({ score, exercise, gender, ageGroup });
      const criteria = scoringCriteria.find(criterion =>
        criterion.exercise === exercise &&
        criterion.gender === gender &&
        criterion.ageGroup === ageGroup &&
        score >= criterion.minPerformanceValue &&
        score <= criterion.maxPerformanceValue
    );

    console.log(criteria ? criteria.points : 0);

    if (!criteria) {
        console.error("No matching criteria found for:", {
            score, exercise, gender, ageGroup,
        });
    }


    return criteria ? criteria.points : 0;
}

function formatTime(totalSeconds) {
    if (!totalSeconds || totalSeconds < 0) return "00:00";
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getAgeGroup(age) {
    if (age < 25) return '<25';
    else if (age < 30) return '25-29';
    else if (age < 35) return '30-34';
    else if (age < 40) return '35-39';
    return '40+'; // Handle case for ages 40 and above, but this won't be reached due to earlier check
}
