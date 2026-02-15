
const mysql = require('mysql2/promise');

const fullTranslations = {
    "בולבה משוגר מצוללת יורי דולגורוקי": "Bulava launched from Yuri Dolgorukiy submarine",
    "בולבה על משאית הובלה": "Bulava on transport truck",
    "מבנה אחוד": "Integrated Structure",
    "חלקי הבולבה": "Bulava Parts",
    "בולבה שלב 1": "Bulava Stage 1",
    "בולבה שלב 2": "Bulava Stage 2",
    "בולבה שלב 3": "Bulava Stage 3",
    "חתימה טרמית של הגוף החודר": "Thermal signature of penetrating body",
    "חתימה טרמית של הגוף האחוד": "Thermal signature of integrated body",
    "רשק ומנוע": "Warhead and motor",
    "רשק ושני מנועים": "Warhead and two motors",
    "הפרדה מנוע 1": "Stage 1 separation",
    "סקיצה לחישוב מודל תלת מימד": "3D model sketch",
    "חישוב שחמ של הגוף האחוד כפונקציה של זוית theta": "RCS calculation of integrated body vs theta",
    "רשק": "Warhead",
    "משקל רשק": "Warhead weight",
    "טווח מקסימום": "Maximum Range",
    "משקל": "Weight",
    "קוטר": "Diameter",
    "אורך מקטע החרטום": "Nose segment length"
};

const subTranslations = [
    { heb: 'רשק', eng: 'Warhead' },
    { heb: 'רש\"ק', eng: 'Warhead' },
    { heb: 'מנוע', eng: 'Motor' },
    { heb: 'הפרדה', eng: 'Separation' },
    { heb: 'חתימה טרמית', eng: 'Thermal signature' },
    { heb: 'הגוף האחוד', eng: 'Integrated body' },
    { heb: 'הגוף החודר', eng: 'Penetrating body' },
    { heb: 'חישוב שחמ', eng: 'RCS calculation' },
    { heb: 'שלב 1', eng: 'Stage 1' },
    { heb: 'שלב 2', eng: 'Stage 2' },
    { heb: 'שלב 3', eng: 'Stage 3' },
    { heb: 'אורך', eng: 'Length' },
    { heb: 'קוטר', eng: 'Diameter' },
    { heb: 'משקל', eng: 'Weight' },
    { heb: 'טווח', eng: 'Range' },
    { heb: 'מקסימום', eng: 'Maximum' },
    { heb: 'מינימום', eng: 'Minimum' },
    { heb: 'חרטום', eng: 'Nose' },
    { heb: 'בנובמבר', eng: 'in November' },
    { heb: 'מבט', eng: 'View' },
    { heb: 'פריסה', eng: 'Deployment' },
    { heb: 'לפני', eng: 'Before' },
    { heb: 'שיגור', eng: 'Launch' },
    { heb: 'אינפוגרפיקה', eng: 'Infographic' },
    { heb: 'מבט על', eng: 'Top View' }
];

async function translate() {
    const config = {
        host: 'localhost',
        user: 'root',
        password: 'qwerty',
        database: 'alumadb2'
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
                    const [rows] = await connection.query(`SELECT * FROM ${tableName}`);

                    for (const row of rows) {
                        const originalVal = row[colName];
                        if (typeof originalVal !== 'string') continue;
                        if (!/[\u0590-\u05FF]/.test(originalVal)) continue;

                        let newVal = originalVal;
                        // 1. Clean wrappers
                        newVal = newVal.replace(/^\*+/, '').replace(/^\"+/, '').replace(/\"+$/, '').trim();

                        // 2. Check full translations
                        let foundFull = false;
                        for (const [heb, eng] of Object.entries(fullTranslations)) {
                            if (newVal === heb) {
                                newVal = eng;
                                foundFull = true;
                                break;
                            }
                        }

                        if (!foundFull) {
                            // 3. Substring translations
                            for (const pair of subTranslations) {
                                newVal = newVal.split(pair.heb).join(pair.eng);
                            }
                            // Cleanup remaining Hebrew or double spaces
                            newVal = newVal.replace(/[\u0590-\u05FF]/g, '').replace(/\s+/g, ' ').trim();
                        }

                        // If newVal became empty or just punctuation, use a fallback or don't update to empty
                        if (newVal.length < 2 && originalVal.length > 2) {
                            newVal = "Data Info";
                        }

                        if (newVal !== originalVal) {
                            // Use all columns for WHERE if there's no ID? 
                            // For simplicity in this task, let's just use the original value
                            await connection.query(`UPDATE ${tableName} SET \`${colName}\` = ? WHERE \`${colName}\` = ?`, [newVal, originalVal]);
                        }
                    }
                }
            }
        }

        console.log('Final database translation completed.');
        await connection.end();
    } catch (err) {
        console.error('Translation failed:', err.message);
    }
}

translate();
