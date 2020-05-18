#!/usr/bin/env node
'use strict';
const inquirer = require('inquirer');
const download = require('./download');
const ora = require('ora');
const chalk = require('chalk');
const {fetch} = require('fetch');
const program = require('commander');
const projects = require('../src/template')
const fs = require('fs-extra')
const fs_orgin = require('fs')
const warning = chalk.keyword('orange');

//
//
function start() {
    (() => {
        const options = [
            {
                type: 'list',
                name: 'project',
                message: '选择你要安装的项目',
                choices: projects.map((project) => project.label),
                filter: function (val) {
                    return projects.find((project) => project.label === val);
                },
            },
            {
                type: 'input',
                name: 'name',
                message: '请输入项目名称',
                validate(input) {
                    if (!input) {
                        return '请输入项目名称'
                    }
                    if (fs.pathExistsSync(input)) {
                        return '项目名已重复'
                    }
                    return true
                }
            }
        ];

        inquirer.prompt(options).then(({project, name}) => {
            // const { project } = chooseProject;
            const {repository = '', afterTip = null} = project;
            // 创建文件夹
            fs.mkdirs(name)
            const spinnerDownload = ora({
                color: 'yellow',
                text: `正在下载 `,
            });
            spinnerDownload.start();
            download(repository, name, function (err) {
                if (err) {
                    spinnerDownload.fail('用户名或密码错了, 或目录不空');
                    return;
                }
                spinnerDownload.succeed('下载完成.');
                changeFile(name)
                if (afterTip) {
                    console.log(warning(afterTip));
                }
            });
        });
    })()
}

function changeFile(name) {
    fs_orgin.readFile(`./${name}/package.json`, {flag: 'r+', encoding: 'utf8'}, (err, data) => {
        if (err) {
            console.log(err)
            return
        }
        let newFile = JSON.parse(data)
        newFile.name = name
        newFile = Buffer.from(JSON.stringify(newFile))
        fs.removeSync(`./${name}/package.json`)
        fs_orgin.writeFile(`./${name}/package.json`, newFile, {flag: 'a'}, (err) => {
            if (err) {
                console.error(err);
            }
        })
    });

}

program.version('1.1.0', '-v, --version').action(() => {
    start();
});
program.parse(process.argv);