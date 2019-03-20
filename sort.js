const fs = require("fs");
const util = require("util");
const path = require("path");
const { sort, sortLess } = require("./src/sort");
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const stat = util.promisify(fs.stat);

let getStat = async (f) => {
    try {
        return await stat(f);
    } catch (e) {
        return null
    }
};

const availableExtentions = [ ".css", ".less" ];

const validate = async (f) => {
    let fileStat = await getStat(f);
    let ext = path.extname(f);

    if (!fileStat || !fileStat.isFile()) {
        throw Error(`Wrong file path ${ f }`);
    }

    if (availableExtentions.indexOf(ext) < 0) {
        throw Error(`Wrong file extention "${ ext }". Supported extentions: ${ availableExtentions.join(",") }`);
    }
}

let getSorter = ext => {
    switch (ext) {
        case ".less":
            return sortLess
        default:
            return sort;
    }
}

let main = async (f) => {
    await validate(f);

    let ext = path.extname(f);

    let fileContent = await readFile(f, "utf-8");
    let rulesSorter = getSorter(ext);
    let sortedContent = await rulesSorter(fileContent, true);

    await writeFile(path.join(__dirname, `./example/result${ ext }`), sortedContent);
};

let file = process.argv[2];

main(path.join(__dirname, file)).catch(e => {
    process.stderr.write(e.message + "\r");
});