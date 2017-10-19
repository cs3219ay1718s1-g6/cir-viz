const fs = require('fs')
const path = require('path')
const readline = require('readline')

module.exports = (fileName) => (lineFn, closeFn) => {
    const filePath = path.join(__dirname, fileName)

    const readStream = fs.createReadStream(filePath, {
        flags: 'r',
        encoding: 'utf8',
        autoClose: false
    })

    const rl = readline.createInterface({
        input: readStream
    })

    rl.on('line', lineFn).on('close', () => {
        closeFn && closeFn()
        readStream.close()
    })
}

