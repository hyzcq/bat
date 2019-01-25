const fs = require('fs');
const program = require('commander');
const downloadGit = require('download-git-repo');
const handlebars = require('handlebars');
const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
const symbols = require('log-symbols');
const childProcess = require('child_process');
const rimraf = require('rimraf');
const commandExists = require('command-exists');

const apicloudTempUrl = 'direct:https://github.com/hyzcq/apicloud-template.git#master';
const h5TempUrl = 'direct:https://github.com/hyzcq/apicloud-template.git#master';

let path;

program.command('init <name>')
       .action((name) => {
            path = name;
            if(fs.existsSync(path)){
                console.log();
                inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'isCover',
                        message: '文件目录已存在，是否继续？',
                        default: false
                    }
                ]).then((answer)=> {
                    if(answer.isCover){
                        init();
                    }
                })
            }else{
                init();
            }
       })

// 选择项目类型，初始化项目
function init() {
    console.log();
    inquirer.prompt([
        {
            type: 'list',
            name: 'template',
            message: '选择需要构建的项目',
            choices: [
                {name: 'h5页面', value: 'h5'},
                {name: 'apiclound APP应用', value: 'apicloud'},
                {name: 'vue项目', value: 'vue'},
                {name: 'mpvue小程序', value: 'mpvue'},
                {name: 'react-native应用', value: 'react-native'},
            ]
        }
    ]).then(answer => {
        switch (answer.template){
            case 'h5':
                generateWeb();
                break;
            case 'apicloud':
                generateApicloud();
                break;
            case 'vue':
                generateVueSpa();
                break;
            case 'react-native':
                generateRN();
                break;
        }
    })
}

function generateWeb() {
    rimraf(path, (err)=> {
        if(!err)
            download(h5TempUrl, path);
    });
}

function generateApicloud() {
    rimraf(path, (err)=> {
        if(!err)
            download(apicloudTempUrl, path);
    });
}

function generateVueSpa() {
    commandExists('vue')
    .then(function(command){
        console.log(chalk.greenBright('---------------正在初始化Vue项目---------------\n'));
        childProcess.spawn('vue create', [path], {stdio: 'inherit', shell: true})
    }).catch(function(){
        console.log(chalk.redBright('---------------命令不存在，请安装最新vue-cli脚手架工具---------------\n'));
    });
}

function generateRN() {
    commandExists('react-native')
    .then(function(command){
        console.log(chalk.greenBright('---------------正在初始化react-native项目---------------\n'));
        childProcess.spawn('react-native init', [path], {stdio: 'inherit', shell: true})
    }).catch(function(){
        console.log(chalk.redBright('---------------命令不存在，请安装最新react-native-cli脚手架工具---------------\n'));
    });
}

// 下载项目模板
function download(url, path) {
    const spinner = ora('正在下载模板...').start();
    downloadGit(url, path, {clone: true}, (err) => {
        if(err){
            spinner.fail();
            console.log(symbols.error, chalk.red(err + '\n'));
        }else{
            spinner.succeed();
            console.log(symbols.success, chalk.greenBright('项目初始化完成\n'));
        }
    })
}

program.parse(process.argv);
