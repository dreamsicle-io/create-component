# Create Component

`create-component` is a node command line tool that will scaffold a new multi-file component directory with a project's opinionated component structure, ideally containing just the right amount of starter code to get a developer started building.

## Usage

From the project directory root, fire the `create-component` command, pointing to any directory that contains a `_Template` directory.

```shell 
npx @dreamsicle.io/create-component [options] <name>
```

## Getting Started

All that is necessary to start using the tool is a component name `name`, which corresponds to a pascal-cased string that will serve as the component name, and a relative `--path`/`-p` that contains a `_Template` directory.

### 1. Install `@dreamsicle.io/create-component`

```shell
npm install --save-dev @dreamsicle.io/create-component
```

### 2. Create a `_Template` directory

The `_Template` directory is what will be cloned and manipulated inorder to create the component structure.

### 3. Set up scripts on `package.json`

While it is possible to run this script without this step, it is recommended that you add scripts to your `package.json` file in order to make using this tool easier and faster. The app structure isn't likely to change in any given project often, so this will help in making the usage more consistent.

The scripts `name` arg can be passed through to the script when running it through `npm`, therefore all that is recommended is to set up a script corresponding to each path that contains a `_Template` directory.

**Setting up scripts is simple ― consider an application with the following structure:**

```
root
― src
―― components
―― partials
―― pages

```

**A great way to set up the app in this case would be to add the following to the `scripts` key on the project root's `package.json`.**

```json
{
	"scripts": {
		"create-component": "create-component -p src/components",
		"create-partial": "create-component -p src/partials",
		"create-page": "create-component -p src/pages"
	}
}
```

**Now, all that is needed is to run the script on the command line, followed by the new component's name:**

```shell
npm run create-component MyComponent
```
```shell
npm run create-partal MyPartial
```
```shell
npm run create-page MyPage
```

### 3. Run the `create-component` command

```shell
npx @dreamsicle.io/create-component -p src/components MyComponent
```

> **Note:** Change `MyComponent` to the desired component name.

## Logging

The tool will log its progress and errors in the console, exiting on completion and fatal errors.

```shell
Creating component: "MyComponent"

Directory built: "src\components\MyComponent"

File built: "src\components\MyComponent\MyComponent.tsx"
File built: "src\components\MyComponent\MyComponent.scss"       
File built: "src\components\MyComponent\MyComponent.stories.tsx"
File built: "src\components\MyComponent\MyComponent.test.tsx"

Created component "MyComponent"
```

> **Note:** The above is what would be created and logged given a `src/components/_Template` directory with the following files: `MyComponent.tsx`, `MyComponent.scss`, `MyComponent.stories.tsx`, and `MyComponent.test.tsx`.

## Help 

To get help with the tool and to learn more about usage and the available options, use the `--help` or `-h` flag. This will output all help information available including how to use the command, option flags, option descriptions, and option defaults.

```shell
npx @dreamsicle.io/create-component --help
```

**The above would ouput the following help information:**

```shell
Usage: npx @dreamsicle.io/create-component [options] <name>  

Create a React component in the appropriate components directory.

Options:
  -V, --version      output the version number
  -p, --path <path>  The relative path where the template to be used lives.
  -h, --help         display help for command
```
