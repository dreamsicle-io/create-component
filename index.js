#!/usr/bin/env node --harmony
'use-strict';

import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import { pascalCase, paramCase } from 'change-case';
import chalk from 'chalk';

// Read the package.json file.
const packageData = fs.readJsonSync('./package.json');

// Initialize the commander program.
const program = new Command();

const args = {
  name: '',
};

// Initialize commander program.
program
  .version(packageData.version)
  .name('npx @dreamsicle.io/create-component')
  .description('Create a component structure in the appropriate directory.')
  .usage('-p src/components MyComponent')
  .option('-p, --path <path>', 'The relative path where the template to be used lives.')
  .arguments('<name>')
  .action((name) => (args.name = pascalCase(name)));

program.parse(process.argv);
const options = program.opts();

// Report options errors and exit if necessary.
if (!fs.existsSync(path.join(options.path, '_Template'))) {
  console.error(chalk.red('Error: No template exists at this path\n'));
  program.help();
}

// Set up paths.
const src = path.join(options.path, '_Template');
const dest = path.join(options.path, args.name);

// declare file structure.
const files = ['_Template.tsx', '_Template.scss', '_Template.stories.tsx', '_Template.test.tsx'];

// Check if the component already exists and exit if necessary.
if (fs.existsSync(dest)) {
  console.error(chalk.red('Error: There is already a component named "%s"\n'), args.name);
  program.help();
}

function create() {
  // Announce start of creation.
  console.info(chalk.bold('Creating component: "%s"\n'), args.name);
  // Copy the template directory.
  fs.copySync(src, dest);
  console.info(chalk.dim('Directory built: "%s"\n'), dest);
  // Loop over the files array inorder to rename and replace
  // the placeholder text in each one.
  files.forEach((file) => {
    const fileSrc = path.join(dest, file);
    const fileDest = path.join(dest, file.replace(/_Template/g, args.name));
    // Ensure to Check if the file exists in this template.
    if (fs.existsSync(fileSrc)) {
      // rename the file.
      fs.renameSync(fileSrc, fileDest);
      // Get the content of the file and replace the
      // placeholder text.
      let content = fs
        .readFileSync(fileDest, 'utf8')
        .replace(/_Template/g, args.name)
        .replace(/_template/g, paramCase(args.name))
        .replace(/_version/g, packageData.version)
        .replace(
          /_date/g,
          new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
          })
        );
      // Write the file back into place.
      fs.writeFile(fileDest, content, 'utf8');
      console.info(chalk.dim('File built: "%s"'), fileDest);
    }
  });
  // Announce end of creation.
  console.info(chalk.bold('\nCreated component "%s"'), args.name);
}

create();
