
const mysql = require('mysql2/promise');

const translations = {
    // Whole string translations
    "חתימה טרמית של הגוף האחוד": "Thermal signature of the integrated body",
    "רשק ומנוע": "Warhead and motor",
    "הפרדה מנוע 1": "Stage 1 separation",
    "רשק ושני מנועים": "Warhead and two motors",
    "סקיצה לחישוב מודל תלת מימד": "Sketch for 3D model calculation",
    "חישוב שחמ של הגוף האחוד כפונקציה של זוית theta": "RCS calculation of the integrated body as a function of theta angle",
    "רשק": "Warhead",
    "מנוע": "Motor",
    "גוף": "Body",
    "אחוד": "Integrated",
    "חישוב": "Calculation",
    "שחמ": "RCS",
    "זוית": "Angle",
    "הפרדה": "Separation",
    "חרטום": "Nose",
    "שלב": "Stage",
    "משקל": "Weight",
    "קוטר": "Diameter",
    "אורך": "Length",
    "טווח": "Range",
    "מקסימום": "Maximum",
    "מירבי": "Maximum",
    "מינימום": "Minimum",
    "תא הבעירה": "Combustion chamber",
    "נחיר": "Nozzle",
    "מייצבים": "Stabilizers",
    "הגאים": "Control fins",
    "חתימה טרמית": "Thermal signature",
    "גוף חודר": "Penetrating body",
    "יחידת הנעה": "Propulsion unit",
    "מרכז הכובד": "Center of Gravity",
    "אינרציה": "Inertia",
    "רוחבי": "Transverse",
    "צירי": "Axial",
    "מומנט": "Moment",
    "מבנה": "Structure",
    "חנ\"ם": "Explosives",
    "רש\"ק": "Warhead",
    "מרחק מרכז הכובד מהחרטום": "COG distance from nose",
    "מומנט אינרציה רוחבי": "Transverse inertia moment",
    "מומנט אינרציה צירי": "Axial inertia moment",
    "משקל גוף חודר": "Penetrating body weight",
    "משקל יחידת הנעה": "Propulsion unit weight",
    "קוטר(יחוס)": "Diameter (Reference)",
    "אורך כללי": "Total Length",
    "אורך מקטע החרטום": "Nose segment length",
    "עובי דופן הרשק": "Warhead wall thickness",
    "עובי דופן המנוע": "Motor wall thickness",
    "מוטת מייצבים כוללת": "Total stabilizer span",
    "מוטת מייצבים חשופה": "Exposed stabilizer span",
    "מוטת הגאים כוללת": "Total control fin span",
    "מוטת הגאים חשופה": "Exposed control fin span",
    "עובי מירבי של ההגאים": "Maximum fin thickness",
    "עובי מירבי של המייצבים": "Maximum stabilizer thickness",
    "משקל חנ\"ם": "Explosives weight",
    "אורך חנ\"ם": "Explosives length",
    "מיקום תחילת החנ\"ם": "Explosives start position",
    "קוטר חנ\"ם מירבי": "Maximum explosives diameter",
    "קוטר חנ\"ם מזערי": "Minimum explosives diameter",
    "משקל מעטפת": "Casing weight",
    "משקל חרטום ומרעום": "Nose and fuse weight",
    "חתימה טרמית של הגוף החודר": "Thermal signature of penetrating body",
    "חישוב שחמ של הגוף החודר כפונקציה של זוית theta": "RCS of penetrating body vs theta",
    "חישוב שחמ של המנוע כפונקציה של זוית theta": "RCS of motor vs theta"
};

// More specific mappings for remaining identified strings
const exactMatchTranslations = {
    "רשק": "Warhead",
    "משקל רשק": "Warhead weight",
    "חתימה טרמית של הגוף האחוד": "Thermal signature of integrated body",
    "חישוב שחמ של הגוף האחוד כפונקציה של זוית theta": "RCS calculation of integrated body vs theta",
    "סקיצה לחישוב מודל תלת מימד": "3D model calculation sketch",
    "מרחק מרכז הכובד מהחרטום גוף חודר": "Penetrating body COG from nose"
};

async function translate() {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'qwerty',
        database: process.env.DB_NAME || 'alumadb2'
    };

    try {
        const connection = await mysql.createConnection(config);
        const [tables] = await connection.query('SHOW TABLES');

        for (const tableObj of tables) {
            const tableName = Object.values(tableObj)[0];
            const [columns] = await connection.query('SHOW COLUMNS FROM ' + tableName);

            for (const col of columns) {
                const colName = col.Field;
                const colType = col.Type.toLowerCase();

                if (colType.includes('char') || colType.includes('text')) {
                    // Fetch all rows with Hebrew for this column
                    const [rows] = await connection.query(`SELECT * FROM ${tableName} WHERE \`${colName}\` REGEXP '[\\u0590-\\u05FF]'`);

                    for (const row of rows) {
                        let originalVal = row[colName];
                        if (!originalVal) continue;

                        let newVal = originalVal.trim();
                        // Primary mapping logic
                        for (const [heb, eng] of Object.entries(translations)) {
                            if (newVal === heb) {
                                newVal = eng;
                                break;
                            }
                        }

                        // Fallback logic for substrings if full match not found
                        if (newVal === originalVal.trim()) {
                            if (newVal.includes('שחמ') && newVal.includes('theta')) newVal = 'RCS vs Theta';
                            else if (newVal.includes('חתימה טרמית') && newVal.includes('הגוף החודר')) newVal = 'Thermal signature of penetrating body';
                            else if (newVal.includes('חתימה טרמית') && newVal.includes('הגוף האחוד')) newVal = 'Thermal signature of integrated body';
                            else if (newVal.includes('רשק') && newVal.includes('מנוע') && newVal.includes('שני')) newVal = 'Warhead and two motors';
                            else if (newVal.includes('רשק') && newVal.includes('מנוע')) newVal = 'Warhead and motor';
                            else if (newVal.includes('הפרדה') && newVal.includes('1')) newVal = 'Stage 1 separation';
                        }

                        if (newVal !== originalVal) {
                            await connection.query(`UPDATE ${tableName} SET \`${colName}\` = ? WHERE \`${colName}\` = ?`, [newVal, originalVal]);
                        }
                    }
                }
            }
        }

        console.log('Database translation (Phase 2) completed.');
        await connection.end();
    } catch (err) {
        console.error('Translation failed:', err.message);
    }
}

translate();
