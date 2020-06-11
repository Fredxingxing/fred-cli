/**
 * git clone, checkout and clear etc.
 */

const spawn = require('child_process').spawn;
const fs = require('fs-extra')

function download(url, Path, callback) {
    const targetPath = `./${Path}`;
    // git clone
    const gitClone = spawn('git', ['clone', '--depth', '1', '--', url, targetPath]);

    gitClone.on('close', (status) => {
        if (status === 0) {
            checkout();
        } else {
            callback && callback(new Error(`'git checkout' failed with status ${status}`));
        }
    });

    // checkout branch
    function checkout() {
        const branchArr = url.split('#');
        const branch = branchArr[1] || 'master';
        const args = ['checkout', branch];
        const process = spawn('git', args, {cwd: targetPath});
        process.on('close', function (status) {
            if (status === 0) {
                removeDotGit();
            } else {
                callback && callback(new Error(`'git checkout' failed with status ${status}`));
            }
        });
    }

    // remove .git directory
    function removeDotGit() {
        fs.removeSync(`${targetPath}/.git`)
        callback && callback()
    }
}

module.exports = download;
