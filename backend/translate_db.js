
const mysql = require('mysql2/promise');

const translations = {
    "בולבה משוגר מצוללת יורי דולגורוקי": "Bulava launched from Yuri Dolgorukiy submarine",
    "בולבה על משאית הובלה": "Bulava on transport truck",
    "מבנה אחוד": "Integrated Structure",
    "חלקי הבולבה": "Bulava Parts",
    "בולבה שלב 1": "Bulava Stage 1",
    "בולבה שלב 2": "Bulava Stage 2",
    "בולבה שלב 3": "Bulava Stage 3",
    "אינפוגרפיקה איראנית שהוכנה בנובמבר 2024": "Iranian infographic prepared in November 2024",
    "לקראת אפשרות של מתקפה שלישית על ישראל": "In anticipation of a third attack on Israel",
    "חתימה טרמית של הגוף החודר": "Thermal signature of the penetrating body",
    "משקל שלב 1": "Stage 1 Weight",
    "מרחק מרכז הכובד מהחרטום שלב 1": "Stage 1 Center of Gravity distance from nose",
    "מומנט אינרציה רוחבי שלב 1": "Stage 1 Transverse Moment of Inertia",
    "מומנט אינרציה צירי שלב 1": "Stage 1 Axial Moment of Inertia",
    "משקל שלב 2": "Stage 2 Weight",
    "מומנט אינרציה רוחבי שלב 2": "Stage 2 Transverse Moment of Inertia",
    "מומנט אינרציה צירי שלב 2": "Stage 2 Axial Moment of Inertia",
    "משקל שלב 3": "Stage 3 Weight",
    "מומנט אינרציה רוחבי שלב 3": "Stage 3 Transverse Moment of Inertia",
    "מומנט אינרציה צירי שלב 3": "Stage 3 Axial Moment of Inertia",
    "משקל": "Weight",
    "מרחק מרכז הכובד מהחרטום": "Center of Gravity distance from nose",
    "מומנט אינרציה רוחבי": "Transverse Moment of Inertia",
    "מומנט אינרציה צירי": "Axial Moment of Inertia",
    "משקל גוף חודר": "Penetrating body weight",
    "מרחק מרכז הכובד מהחרטום גוף חודר": "Penetrating body COG from nose",
    "מומנט אינרציה רוחבי גוף חודר": "Penetrating body Transverse MOI",
    "מומנט אינרציה צירי גוף חודר": "Penetrating body Axial MOI",
    "משקל יחידת הנעה": "Propulsion unit weight",
    "מרחק מרכז הכובד מהחרטום יחידת הנעה": "Propulsion unit COG from nose",
    "מומנט אינרציה רוחבי יחידת הנעה": "Propulsion unit Transverse MOI",
    "מומנט אינרציה צירי יחידת הנעה": "Propulsion unit Axial MOI",
    "קוטר(יחוס)": "Diameter (Reference)",
    "אורך כללי": "Total Length",
    "אורך מקטע החרטום": "Nose segment length",
    "אורך המקטע הקוני הקדמי בחרטום": "Fore conical nose segment length",
    "אורך המקטע הקוני האחורי בחרטום": "Aft conical nose segment length",
    "\"עובי דופן הרש\"\"ק\"": "Warhead casing thickness",
    "אורך מקטע יחידת ההנעה": "Propulsion unit segment length",
    "עובי דופן המנוע": "Motor casing thickness",
    "אורך מקטע הנחיר": "Nozzle segment length",
    "מוטת מייצבים כוללת": "Total stabilizer span",
    "מוטת מייצבים חשופה": "Exposed stabilizer span",
    "מיתר שורש של סט מייצבים אחורי 3": "Root chord of aft stabilizer set 3",
    "מיתר קצה של סט מייצבים אחורי 3": "Tip chord of aft stabilizer set 3",
    "מיתר שורש של סט מייצבים אחורי 2": "Root chord of aft stabilizer set 2",
    "מיתר קצה של סט מייצבים אחורי 2": "Tip chord of aft stabilizer set 2",
    "מוטת הגאים כוללת": "Total control fin span",
    "מוטת הגאים חשופה": "Exposed control fin span",
    "מיתר שורש של סט הגאים 1": "Root chord of control fin set 1",
    "מיתר קצה של סט הגאים 1": "Tip chord of control fin set 1",
    "עובי מירבי של ההגאים": "Max control fin thickness",
    "עובי מירבי של המייצבים 2": "Max stabilizer thickness 2",
    "עובי מירבי של המייצבים 3": "Max stabilizer thickness 3",
    "\"משקל רש\"\"ק\"": "Warhead weight",
    "\"משקל חנ\"\"ם\"": "Explosive weight",
    "\"אורך רש\"\"ק\"": "Warhead length",
    "\"אורך חנ\"\"ם\"": "Explosive length",
    "\"מיקום תחילת החנ\"\"ם\"": "Explosive start position",
    "\"קוטר חנ\"\"ם מירבי\"": "Max explosive diameter",
    "\"קוטר חנ\"\"ם מזערי\"": "Min explosive diameter",
    "משקל מעטפת": "Casing weight",
    "משקל חרטום ומרעום": "Nose and fuse weight",
    "משקל בהמראה": "Launch Weight",
    "קוטר תא הבעירה": "Combustion chamber diameter",
    "אורך תא הבעירה": "Combustion chamber length",
    "ארוך הנחיר": "Nozzle length",
    "קוטר פתח יציאה": "Exit diameter",
    "אורך כללי של המנוע": "Total engine length",
    "*אורך מקטע החרטום": "Nose segment length*",
    "*אורך המקטע הקוני הקדמי בחרטום": "Fore conical nose segment length*",
    "*אורך המקטע הקוני האחורי בחרטום": "Aft conical nose segment length*",
    "*מוטת מייצבים כוללת": "Total stabilizer span*",
    "*מוטת מייצבים חשופה": "Exposed stabilizer span*",
    "*מיתר שורש של סט מייצבים אחורי 3": "Root chord of aft stabilizer set 3*",
    "*מיתר קצה של סט מייצבים אחורי 3": "Tip chord of aft stabilizer set 3*",
    "*מיתר שורש של סט מייצבים אחורי 2": "Root chord of aft stabilizer set 2*",
    "*מיתר קצה של סט מייצבים אחורי 2": "Tip chord of aft stabilizer set 2*",
    "*מוטת הגאים כוללת": "Total control fin span*",
    "*מוטת הגאים חשופה": "Exposed control fin span*",
    "*מיתר שורש של סט הגאים 1": "Root chord of control fin set 1*",
    "*מיתר קצה של סט הגאים 1": "Tip chord of control fin set 1*",
    "טווח מקסימום": "Maximum Range",
    "קוטר": "Diameter",
    "משקל רשק": "Warhead weight"
};

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

                // Only target string types
                if (colType.includes('char') || colType.includes('text')) {
                    for (let [hebrew, english] of Object.entries(translations)) {
                        await connection.query(
                            `UPDATE ${tableName} SET \`${colName}\` = ? WHERE \`${colName}\` = ?`,
                            [english, hebrew]
                        );

                        // Handle potential escaped variants
                        const escapedHebrew = hebrew.replace(/\"\"/g, '\"');
                        if (escapedHebrew !== hebrew) {
                            await connection.query(
                                `UPDATE ${tableName} SET \`${colName}\` = ? WHERE \`${colName}\` = ?`,
                                [english, escapedHebrew]
                            );
                        }
                    }
                }
            }
        }

        console.log('Database translation completed.');
        await connection.end();
    } catch (err) {
        console.error('Translation failed:', err.message);
    }
}

translate();
