#!/usr/bin/env node --harmony
'use-strict';

import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import { pascalCase, paramCase } from 'change-case';
import chalk from 'chalk';

// Read the package.json file.
const packageData = fs.readJsonSync(path.join(process.cwd(), 'package.json'));

// Initialize the commander program.
const program = new Command();

const args = {
  name: '',
};

// Set up the commander program.
program
  .version(packageData.version)
  .name('npx @dreamsicle.io/create-component')
  .description('Create a component structure in the appropriate directory.')
  .option('-p, --path <path>', 'The relative path where the template to be used lives.')
  .arguments('<name>')
  .action((name) => (args.name = pascalCase(name)));

program.parse(process.argv);
const options = program.opts();

// Report options errors and exit if necessary.
if (!fs.existsSync(path.join(options.path, '_Template'))) {
  console.error(chalk.redBright('❌ Error: No template exists at this path\n'));
  program.help();
}

// Set up paths.
const src = path.join(options.path, '_Template');
const dest = path.join(options.path, args.name);

// Check if the component already exists and exit if necessary.
if (fs.existsSync(dest)) {
  console.error(chalk.redBright('❌ Error: There is already a component named %s\n'), chalk.bold(chalk.yellow(args.name)));
  program.help();
}

function walkDirectories(dirPath) {
	const results = [];
	const dirFiles = fs.readdirSync(dirPath);
	dirFiles.forEach(function(file) {
			const filePath = path.join(dirPath, file);
			const stat = fs.statSync(filePath);
			if (stat.isDirectory()) { 
					const nestedFiles = walkDirectories(filePath);
					results.push(...nestedFiles);
			} else { 
					results.push(filePath);
			}
	});
	return results;
}

function replaceInContent(content) {
	return content.replace(/_Template/g, args.name)
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
}

function replaceInFileName(fileName) {
	return fileName.replace(/_Template/g, args.name)
	.replace(/_template/g, paramCase(args.name));
}

function create() {
  // Announce start of creation.
  console.info(chalk.bold('⚡ Creating component: %s\n'), chalk.yellowBright(args.name));
  // Copy the template directory.
  fs.copySync(src, dest);
  console.info(chalk.dim('📁 Directory cloned: %s\n'), chalk.yellow(dest));
	// Get list of all file paths
	const files = walkDirectories(dest);
  // Loop over the files array inorder to rename and replace
  // the placeholder text in each one.
  files.forEach((file) => {
		// set up individual file paths and perform file name replacements.
		const fileSrcDir = path.dirname(file);
		const fileSrcName = path.basename(file);
		const fileDestName = replaceInFileName(fileSrcName);
    const fileDest = path.join(fileSrcDir, fileDestName);
    // Ensure to Check if the file exists in this template.
    if (fs.existsSync(file)) {
      // rename the file.
      fs.renameSync(file, fileDest);
      // Get the content of the file and replace the
      // placeholder text.
      let content = fs.readFileSync(fileDest, 'utf8');
			content = replaceInContent(content);
      // Write the file back into place.
      fs.writeFile(fileDest, content, 'utf8');
      console.info(chalk.dim('🔨 File built: %s'), chalk.yellow(fileDest));
    }
  });
  // Announce end of creation.
  console.info(chalk.bold('\n🎉 Created component: %s'), chalk.yellowBright(args.name));
}

create();
