const { existsSync, readFileSync, statSync } = require('fs');
const { join } = require('path');

const defaultOptions = {
    message:undefined
}

const identity = (_) => _;
const tautology = () => true;
const formats = {
    default(format) {
        throw new Error(`format not supported: ${format}`);
    }
};
const getFormat = (format) => {
    if (typeof format === 'function') {
        return format;
    }
    return formats[format]
        ? formats
        : () => formats.default(format);
}

const validate = (folder_context
    , tree = []
    , {
        message = defaultOptions.message
    } = defaultOptions, prefix = '-', index=0) => {
    let pass = true;
    const messages = [];
    for (const {
        name,
        stringContent,
        regularExpression,
        test,
        format,
        stringIndicies,
        message,
        children,
        mode,
        missing,
        file,
        folder
        } of tree) {
            index++;
            const target = `${folder_context}/${name}`;
            const subMessages = [];
            const okayMessage = `ok ${prefix + index} ${message || ''}`;
            if (!existsSync(target)) {
                if (missing) {
                    messages.push(`ok ${prefix + index} ${message || 'should not exist'}`);
                } else {
                    pass = false;
                    subMessages.push(`not ok ${prefix + index} ${message || 'should exist'}`);
                }
                continue;
            }
            else if (existsSync(target)) {
                if (missing) {
                    pass = false;
                    subMessages.push(`not ok ${prefix + index} ${message || 'should not exist'}`);
                    continue;
                } else {
                    subMessages.push(`ok ${prefix + index} ${message || 'should exist'}`);
                }
                const targetMode = statSync(target).mode & (8 ** 3 - 1);
                if (mode !== undefined && (mode !== targetMode)) {
                    pass = false;
                    subMessages.push(
`not ok ${ prefix + index } ${message || 'mode should match'}
expected:
${mode.toString(8)}
actual:
${targetMode.toString(8)}`);
                }
                if (stringContent !== undefined) {
                    const fileContent = readFileSync(target).toString();
                    if (stringContent !== fileContent) {
                        pass = false;
                        subMessages.push(
`not ok ${ prefix + index } ${ message || 'content should match string' }
expected:
${ stringContent }
actual:
${ fileContent }`
                    );
                    }
                }
                if (regularExpression !== undefined) {
                    const fileContent = readFileSync(target).toString();
                        if (!regularExpression.test(fileContent)) {
                        pass = false;
                        subMessages.push(
    `not ok ${ prefix + index } ${message || 'content should match regular expression'}
    expected:
    ${regularExpression}
    actual:
    ${fileContent}`);
                    }
                }
                if (test) {
                    const fileContent = readFileSync(target);
                    if (!test(fileContent)) {
                        pass = false;
                        subMessages.push(
`${message || 'content should pass test'}
actual:
${fileContent}`);
                    }
                }
                if (format) {
                    const fileContent = readFileSync(target).toString();
                    format = getFormat(format);
                    if (!format(fileContent)) {
                        pass = false;
                        subMessages.push(
`${message || 'content should match specific format'}
actual:
${fileContent}`);
                    }
                }
                if (stringIndicies) {
                    const fileContent = readFileSync(target).toString();
                    for (const { index, content } of stringIndicies) {
                        if(index === -1 && fileContent.includes(content)){
                            pass = false;
                            subMessages.push(
`not ok ${ prefix + index } ${ message || 'string should not exist within file' }
found:
${ content }
at index: ${ fileContent.indexOf(content) }`);
                        } else if (index !== fileContent.indexOf(content)) {
                        pass = false;
                        subMessages.push(
`not ok ${ prefix + index } ${ message || 'string should be found at specific index' }
expected:
${ content }
at index: ${ index }
found:
${ fileContent.substr(index, content.length) }...`);
                    }
                    }
                }
            if (file) {
                pass = false;
                if (!statSync(target).isFile()) {
                    pass = false;
                    subMessages.push(
                        `not ok ${prefix + index} ${message || 'target must be file'}
location: ${target}
not a file
`);
                };
            } else if (folder) {
                if (!statSync(target).isDirectory()) {
                    pass = false;
                    subMessages.push(
                        `not ok ${prefix + index} ${message || 'target must be folder'}
location: ${target}
not a folder
`);
                };
            }



                if (children) {
                    const [childResult, childMessage] =
                        validate(target, children, {
                            message
                        }, `${prefix}${index}-`);
                    if (!childResult) {
                        pass = false;
                        subMessages.push(`not ok ${ prefix + index } ${childMessage}`);
                    }else{
                        subMessages.push(`ok ${ prefix + index } ${childMessage}`);
                    }
                }
        }
        if(!subMessages.length){
            subMessages.push(okayMessage);
        }
        messages.push(subMessages.join('\n'));
    }
    return [pass, `${message} (${messages.join('\n')})`];
}

const validateError = (...args) => {
    const [result, message] = validateFileTree(...args);
    if (result) {
        return message;
    }
    throw new Error(message);
}
module.exports = { validate, validateError };
