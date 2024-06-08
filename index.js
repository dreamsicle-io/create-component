#!/usr/bin/env node
// @ts-check

import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { pascalCase, kebabCase } from 'change-case';
import { Command } from 'commander';
import zod from 'zod';

/**
 * @typedef {object} Options
 * @property {string} path
 * @property {string} outputPath
 * @property {boolean} verbose
 */

/**
 * @typedef {object} LogInfoArgs
 * @property {string} title
 * @property {string} [emoji]
 * @property {string} [description]
 * @property {string} [dataLabel]
 * @property {any} [data]
 * @property {'top' | 'bottom' | 'both'} [padding]
 * @property {boolean} [verbose]
 */

/**
 * @typedef {object} LogErrorArgs
 * @property {unknown} error
 * @property {boolean} [verbose]
 */

// Replicate magic constants in ES module scope.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construct static paths.
const cwd = process.cwd();
const pkgPath = path.join(__dirname, 'package.json');
const userPkgPath = path.join(cwd, 'package.json');
const tmpDirPath = path.join(__dirname, 'tmp');

/**
 * Read the tool's package.json file.
 * @type {Record<string, any>}
 */
const pkg = JSON.parse(fs.readFileSync(pkgPath, { encoding: 'utf8' }).toString());

/**
 * Read the user's package.json file.
 * @type {Record<string, any>}
 */
const userPkg = JSON.parse(fs.readFileSync(userPkgPath, { encoding: 'utf8' }).toString());

/**
 * The component name is a pascal-cased string which serves as the 
 * name of the final directory and is used in file renaming and 
 * content replacements. This is initialized in `program.action()`.
 * @type {string}
 */
let componentName;

/**
 * The path to the template source. Created by combining `options.path`
 * with `_Template`. This is initialized in `program.action()`.
 * @type {string}
 */
let srcPath;

/**
 * The path to the temporary component destination inside the script's directory.
 * This is used to do all replacements and transforms before copying to the final
 * destination path, in order to avoid incomplete components being copied over.
 * Created by combining the `options.outputPath` (or `options.path` if 
 * `options.outputPath` is empty), with `componentName`. This is initialized
 * in `program.action()`.
 * @type {string}
 */
let tmpPath;

/**
 * The path to the component destination. Created by combining the
 * `options.outputPath` (or `options.path` if `options.outputPath`
 * is empty), with `componentName`. This is initialized in `program.action()`.
 * @type {string}
 */
let destPath;

/**
 * Options are initialized in `program.action()`.
 * @type {Options}
 */
let options;

// Set up the commander program.
const program = new Command();
program
	.version(pkg.version)
	.name('npx @dreamsicle.io/create-component')
	.description('Create a templated component structure.')
	// Construct arguments.
	.argument(
		'<name>',
		'The name of the component',
		(value) => {
			const text = zod.string().trim().safeParse(value).data || '';
			return pascalCase(text);
		}
	)
	// Construct options.
	.option(
		'-p, --path <path>',
		'The relative path where the template to be used lives',
		(value) => {
			return zod.string().trim().safeParse(value).data || '';
		}
	)
	.option(
		'-o, --outputPath [path]',
		'The relative path where the component should be placed',
		(value) => {
			return zod.string().trim().safeParse(value).data || '';
		}
	)
	.option(
		'-v, --verbose',
		'Output extra information to the console',
		false
	)
	// Run the program's main action.
	.action((name, opts) => {
		// Initialize args and options.
		options = { ...opts };
		componentName = name;
		srcPath = path.resolve(options.path, '_Template');
		tmpPath = path.resolve(tmpDirPath, componentName);
		destPath = path.resolve(options.outputPath || options.path, componentName);
		// Run creation.
		create();
	});

// Parse the CLI options and store them in the program.
program.parse(process.argv);

/**
 * @param {LogInfoArgs} args 
 */
function logInfo(args) {
	const { title, description, emoji, data, dataLabel, padding, verbose } = args;
	const hasData = (data && verbose);
	/** 
	 * Construct the text.
	 * @type {string}
	 */
	let text = chalk.bold.green(title);
	if (description) text += ` ${chalk.dim('―')} ${description}`;
	if (emoji) text = `${emoji} ${text}`;
	// Add padding.
	if ((padding === 'top') || (padding === 'both')) text = `\n${text}`;
	if (((padding === 'bottom') || (padding === 'both')) && ! hasData) text = `${text}\n`;
	/** 
	 * Construct the params array.
	 * @type {any[]}
	 */
	let params = [text];
	// Construct the data.
	if (hasData) params.push(...[`\n\n💡 ${chalk.bold.cyan(dataLabel || 'Data')} →`, data, '\n']);
	console.info(...params);
}

/**
 * @param {LogErrorArgs} args
 */
function logError(args) {
	const { error, verbose } = args;
	/**
	 * @type {Error}
	 */
	const errorInstance = (error instanceof Error) ? error : new Error((typeof error === 'string') ? error : 'An unknown error has occurred');
	if (verbose) {
		console.error(chalk.bold.redBright(`\n❌ Error: ${errorInstance.message}\n\n`), errorInstance, '\n');
	} else {
		console.error(chalk.bold.redBright(`\n❌ Error: ${errorInstance.message}\n`));
	}
}

/**
 * @param {string} dirPath 
 * @returns {string[]}
 */
function walkDirectories(dirPath) {
	/**
	 * Initialize the results array.
	 * @type {string[]}
	 */
	let results = [];
	const files = fs.readdirSync(dirPath);
	files.forEach((file) => {
		const filePath = path.join(dirPath, file);
		const stat = fs.statSync(filePath);
		if (stat.isDirectory()) {
			results = results.concat(walkDirectories(filePath));
		} else {
			results.push(filePath);
		}
	});
	return results;
}

function replaceInContent(content) {
	const date = new Date().toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
	});
	return content
		.replace(/_Template/g, componentName)
		.replace(/_template/g, kebabCase(componentName))
		.replace(/_version/g, userPkg.version)
		.replace(/_date/g, date);
}

function replaceInFileName(fileName) {
	return fileName
		.replace(/_Template/g, componentName)
		.replace(/_template/g, kebabCase(componentName));
}

function create() {
	try {
		validate();
		logStart();
		cloneTemplate();
		replaceRename();
		putComponent();
		logSuccess();
	} catch(error) {
		logError({
			error: error,
			verbose: options.verbose,
		});
	} finally {
		process.exit();
	}
}

function validate() {
	// Check if the requested template exists.
	if (!fs.existsSync(srcPath)) {
		throw new Error(`No templates found at "${path.relative(cwd, srcPath)}"`);
	}
	// Check if the component directory already exists.
	if (fs.existsSync(destPath)) {
		
		throw new Error(`There is already a directory at "${path.relative(cwd, destPath)}"`);
	}
}

function logStart() {
	const relDestPath = path.relative(cwd, destPath);
	logInfo({
		title: 'Creating component',
		description: `Creating "${componentName}" in ${relDestPath}`,
		emoji: '⚡',
		padding: 'bottom',
		verbose: options.verbose,
		dataLabel: 'Options',
		data: options,
	});
}

function cloneTemplate() {
	// Clean the `tmp` directory if artifacts exist.
	fs.rmSync(tmpPath, { recursive: true, force: true });
	// Copy the template directory.
	fs.cpSync(srcPath, tmpPath, { recursive: true, force: true });
	// Log completion.
	logInfo({
		title: 'Template cloned',
		description: path.relative(cwd, srcPath),
		emoji: '📂',
		verbose: options.verbose,
		dataLabel: 'Cloned files',
		data: walkDirectories(srcPath).map((file) => path.relative(srcPath, file))
	});
}

function replaceRename() {
	/**
	 * Initialize an array of renamed files for logging.
	 * @type {string[]}
	 */
	const renamedFiles = [];
	/**
	 * Initialize an array of built files for logging.
	 * @type {string[]}
	 */
	const builtFiles = [];
	// Get list of all file paths
	const files = walkDirectories(tmpPath);
	// Loop over the files array inorder to rename and replace
	// the placeholder text in each one.
	files.forEach((file) => {
		// set up individual file paths and perform file name replacements.
		const fileSrcDir = path.dirname(file);
		const fileSrcName = path.basename(file);
		const fileDestName = replaceInFileName(fileSrcName);
		const fileDest = path.join(fileSrcDir, fileDestName);
		// rename the file.
		fs.renameSync(file, fileDest);
		if (file !== fileDest) renamedFiles.push(fileDest);
		// Get the content of the file and replace the
		// placeholder text.
		const content = fs.readFileSync(fileDest, { encoding: 'utf8' });
		const newContent = replaceInContent(content);
		if (content !== newContent) builtFiles.push(fileDest);
		// Write the file back into place.
		fs.writeFileSync(fileDest, newContent, { encoding: 'utf8' });
	});
	// Log success information.
	const renamedMessage = (renamedFiles.length === 1) ? `${renamedFiles.length} file renamed` : `${renamedFiles.length} files renamed`;
	const builtMessage = (builtFiles.length === 1) ? `${builtFiles.length} file built` : `${builtFiles.length} files built`;
	logInfo({
		title: 'Files built',
		description: `${renamedMessage}, ${builtMessage}`,
		emoji: '🔨',
		verbose: options.verbose,
		dataLabel: 'Modified files',
		data: {
			renamed: renamedFiles.map((file) => path.relative(tmpPath, file)),
			built: builtFiles.map((file) => path.relative(tmpPath, file)),
		},
	});
}

function putComponent() {
	// Double check if the directory exists already and throw an error if not to
	// avoid accidentally removing important data on the machine.
	if (fs.existsSync(destPath)) throw new Error(`There is already a directory at "${destPath}"`);
	// Copy the final build from the tmp directory to the real directory and clean the tmp directory.
	fs.cpSync(tmpPath, destPath, { recursive: true, force: true });
	fs.rmSync(tmpDirPath, { recursive: true, force: true });
	// Log success.
	logInfo({
		title: 'Component relocated',
		description: path.relative(cwd, destPath),
		emoji: '📚',
		verbose: options.verbose,
		dataLabel: 'Component files',
		data: walkDirectories(destPath).map((file) => path.relative(destPath, file)),
	});
}

function logSuccess() {
	logInfo({
		title: 'Component created',
		description: `Created "${componentName}" in ${path.relative(cwd, destPath)}`,
		emoji: '🚀',
		padding: 'top',
		verbose: options.verbose,
		dataLabel: 'Component files',
		data: walkDirectories(destPath).map((file) => path.relative(destPath, file)),
	});
}
