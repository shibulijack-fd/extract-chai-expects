const recast = require('recast');
const fs = require('fs');

const source = fs.readFileSync('test.js');
const ast = recast.parse(source);

let expectStatements = [];

recast.visit(ast, { 
  visitCallExpression: function(path) {
    if (path.node.callee.name === 'expect') {
      const prettyPrint = recast.print(path.parentPath.parentPath.parentPath.node).code;
      console.log(prettyPrint);
      let chaiPart = prettyPrint;
      if (prettyPrint.indexOf('.to.')) {
        chaiPart = prettyPrint.slice(prettyPrint.indexOf('.to.'));
      }
      expectStatements.push(chaiPart);
      // return false to avoid looking further
      // we stop our search at this level
      return false;
    }
    this.traverse(path);
  }
});

let uniqueExpectStatements = new Set(expectStatements);
const data = JSON.stringify(Array.from(uniqueExpectStatements), null, '\t');
fs.writeFile('output.txt', data, (err) => {
  if (err) throw err;
  console.log('The file has been saved!');
});
