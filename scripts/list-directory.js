#!/usr/bin/env node

const fs = require('fs')
const getDirTree = require('directory-tree')

const defaultDir = 'files/example-photos'
const regexGitDir = /\.git/

const outputFilename = 'currentDirectoryTree.txt'

const o = JSON.stringify(getDirTree(process.argv[2] || defaultDir,  { exclude: regexGitDir }), null , 2)
// process.stdout.write(o)

const writeStream = fs.createWriteStream('scripts/output/' + outputFilename) // overwrites; TODO improve
writeStream.write(o, 'utf8')
// Emitted when all data has been flushed from the stream:
writeStream.on('finish', () => {
    console.log('Directory Tree Output created at scripts/output/' + outputFilename)
})
writeStream.end()
