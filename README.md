# Create WP Theme

`create-component` is a node command line tool that will scaffold a new multi-file component directory with a project's opinionated component structure ideally containing just the right amount of starter code to get a developer started building.

## Usage

From the project directory root, fire the `create-component` command, pointing to any directory that contains a `_Template` directory.

```shell 
npx @dreamsicle.io/create-component [options] <name>
```

## Getting Started

All that is necessary to start using the tool is a component name `name`, which corresponds to a pascal-cased string that will serve as the component name, and a relative `--path`/`-p` that contains a `_Template` directory.

### 1. Run the `create-component` command

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