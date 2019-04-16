# Testafile!

"Yes! I have seen the files!"

Library for testing file trees. Made to unit test templating libraries such as [fileable](https://github.com/johnhenry/fileable) and [jsonnet](https://github.com/google/jsonnet).

## Installation

```sh
npm install --save testafile
```

## Exmple Usage

```javascript
const { validate } = require('testafile');
const tape = require('tape');
tape('basic test', ({ ok, end }) => {
    ok(...validate('.', [
        {
            name: 'readme.md',
            message: 'readme.md should exist'
        },
        {
            name: 'package.json',
            message: 'package.json should exist'
        },
        {
            name: 'index.js',
            message: 'index.js should exist'
        },
        {
            name: 'test',
            missing: false,
            children: [{
                name: 'index.js',
                message: 'test/index.js should exist'
            }],
            message: 'test should exist'
        }
    ]), { message: '' })
    end();
});
```

# API

Testifile has two exports: validate and validateError

### Vaildate

For usage with testing libraries like [tape]() and [jest](https://github.com/facebook/jest).

```javascript
validate(path, tree, {message});
```

Returns an array: [result, resultMessage]

#### path:string

Path of folder to validate

#### tree: array[objects]

Representation of desired file tree

#### message: string

Description of test

#### result: boolean

Result of test

### resultMessage : string

Messages concatinated with messages from sub-tests.

#### Example: Tape

```javascript
const { validate } = require('testafile');
const tape = require('tape');
const parentFolder = './dist';
const tree = [/*...*/];
tape('basic test', ({ ok, end }) => {
    ok(...validate(parentFolder, tree, { message: 'it should work' });
});
```

#### Example: Jest

```javascript
const { validate } = require('testafile');
const tape = require('tape');
const parentFolder = './dist';
const tree = [/*...*/];
test('basic test', () => {
  expect(validate(parentFolder, tree, { message: 'it should work' })[0]).toBe(true);
});
```

Note: Because This is a single test, messages are concatinated. This can get messy due to the way that some testing libraries (tape) handle new-line characters. It's useful, however; as new lines do render properly when tests fail -- allowing one to easily hone in on the error.

### ValidateError

Works like validate, but throws an error if the test fails and returns the message if it passes.

```javascript
const { validateError } = require('testafile');
const tape = require('tape');
const parentFolder = './dist';
const tree = [/*...*/];
tape('basic test', ({ ok, end }) => {
    try{
        const message = validateError(parentFolder, tree, { message: 'it should work' });
        ok(true, message);
    }catch({message}){
        ok(false, message);
    }finally{
        end();
    }
});
```

### Tree Representation Format

The desired file tree is represented by an array of objects.

Each object represents a file or a folder and may have a number of specific field.

#### name

The only reqiured field - this is the name of the object.

### message

Used as a result message of sub test.

#### stringContent

String content of file will be tested to match this exactly.

#### stringIndicies

Array containing objects describing strings to be found in file.

Each object has two fields:

##### content

The string to be found.

##### index

The index at which to find the string.

#### test

A function that test the content (buffer). Must return 'true' to pass.

#### format

String content of file will be tested agains a specific format.

Note: o formats are currently supported :/

#### mode

Mode of the file to match.

#### file

If set to true, the object must be a file to pass the test.

#### folder

If set to true, the object must be a folder to pass the test.

#### missing

Instead of checking if a file exists,

setting this to true will check that it DOES NOT exist.


#### childeren

Array of children of a folder. Objects within the folder follow this same format.
