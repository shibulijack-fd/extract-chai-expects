const recast = require('recast');
const fs = require('fs');
const colors = require('colors');
const walkSync = require('walk-sync');

let expectStatements = [];

const parseFile = (path) => {

  console.log(`Parsing file: ${path}`.green);

  const source = fs.readFileSync(path);
  const ast = recast.parse(source);

  recast.visit(ast, { 
    visitCallExpression: function(path) {
      if (path.node.callee.name === 'expect') {
        let currentNode = path.parentPath.parentPath.parentPath.node;
        currentNode = (currentNode && currentNode.callee) ? currentNode.callee : currentNode;
        const prettyPrint = recast.print(currentNode).code;
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

  console.info(`Parsing complete: ${path}`.grey);
}

const writeOutput = () => {
  let uniqueExpectStatements = new Set(expectStatements);
  const data = JSON.stringify(Array.from(uniqueExpectStatements), null, '\t');
  fs.writeFile('output.txt', data, (err) => {
    if (err) throw err;
    console.log('Output file: output.txt'.green);
  });
}

const extractExpect = () => {
  const args = process.argv.slice(2);
  const rootDir = args && args.length > 0 ? args[0] : null;
  const startTime = process.hrtime();
  const paths = walkSync(rootDir, {globs: ['**/*.js'], directories: false});
  console.log(`EXTRACT EXPECT STATEMENTS :: Found ${paths.length} .js files`.grey);
  paths.forEach((path) => {
    parseFile(`${rootDir}/${path}`);
  });
  writeOutput();
  const endTime = process.hrtime(startTime);
  const timeElapsed = (endTime[0] + endTime[1]/1e9).toFixed(2);
  console.log(`Time elapsed: ${timeElapsed} seconds`.grey);
}

module.exports = extractExpect();
