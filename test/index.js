const { validate } = require('../');
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
