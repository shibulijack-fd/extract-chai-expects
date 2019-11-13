#!/usr/bin/env node
// console.log(process.argv)
const program = require("commander");

program
  .version("1.2.0", "-v, --version", "CLI Version")
  .usage("[path...] [options]")
  .description(
    "Node CLI tool to extract chai assertions - expect statements from JS test files."
  )
  .option("-s, --sourceDir [directory]", "Specify the directory of JS files.")
  .arguments("<path>")
  .parse(process.argv);

const app = require("../index");
const options = {
  sourceDir: program.sourceDir
};

if (program.sourceDir) {
  app(options);
} else {
  program.help();
}
