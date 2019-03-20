const postcss = require("postcss");
const less = require("postcss-less");

const ascSorter = (p1, p2) => p1 > p2 ? 1 : (p1 === p2 ? 0 : -1);
const descSorter = (p1, p2) => p1 > p2 ? -1 : (p1 === p2 ? 0 : 1);

let sortDecls = function (decls, sorter) {
    return decls.slice().sort((d1, d2) => sorter(d1.prop, d2.prop));
};

let typeToSort = type => type === "decl";
let continueToSort = type => type === "rule" || type === "atrule";

let sortNodes = function (node, sorter) {
    if (node.nodes) {
        let { sort, others } = node.nodes.reduce((hash, node) => {
            let key = typeToSort(node.type) ? "sort" : "others";
            hash[key].push(node);
            return hash;
        }, {
            sort: [],
            others: []
        });

        node.nodes = [
            ...sortDecls(sort, sorter),
            ...others.map(n => {
                if (continueToSort(n.type)) {
                    return sortNodes(n, sorter);
                }
    
                return n;
            })
        ];
    }

    return node;
}

module.exports = {
    sort: async (cssText, asc) => {
        let tree = await postcss().process(cssText);
        let sorter = asc ? ascSorter : descSorter;
        return sortNodes(tree.root, sorter).toString()
    },
    sortLess: async (lessText, asc) => {
        let tree = await postcss().process(lessText, { syntax: less });
        let sorter = asc ? ascSorter : descSorter;
        return less.nodeToString(sortNodes(tree.root, sorter));
    }
};