#!/usr/bin/env node

// Arg #1: github.com/{input}

const fs = require('fs')
const getDirTree = require('directory-tree')

const tmpDir = 'files/tmp/'
const regexGitFiles = /\.git/
// const regexDotFilesAndDirs = /^\.\w+/

const outputFilename = 'currentDirectoryTree.txt'

const simpleGit = require('simple-git')(tmpDir)
const path = require('path')

// ((git|ssh|http(s)?)|(git@[\w\.]+))(:(//)?)([\w\.@\:/\-~]+)(\.git)(/)?

simpleGit.clone(process.argv[2], err => {
    if (err) return
    console.log('Cloned successfully.')
    const repoName = process.argv[2].split('/').slice(-1)[0]

    // TODO common code (see list-directory.js)
    const o = JSON.stringify(getDirTree(path.join(tmpDir, repoName), { exclude: regexGitFiles }), null , 2)

    const writeStream = fs.createWriteStream('scripts/output/' + outputFilename) // overwrites, TODO improve

    writeStream.write(o, 'utf8')

    writeStream.on('finish', () => {
        console.log('Directory Tree Output created at scripts/output/' + outputFilename)
    })

    writeStream.end()
})
