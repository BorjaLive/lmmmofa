#!/usr/bin/env node

import chalk from 'chalk';
import inquirer from 'inquirer';
import { createSpinner } from 'nanospinner';
import fs from 'fs';
import path from 'path';

const installationDir = fs.lstatSync(process.argv[1]).isDirectory() ? process.argv[1] : path.dirname(process.argv[1]);
function readTemplate(template, inserts = {}) {
    const templateFile = fs.readFileSync(path.resolve(installationDir, `templates/${template}`), "utf8");
    let result = templateFile;
    for (const key in inserts) {
        result = result.replace(new RegExp(`{{${key}}}`, "g"), inserts[key]);
    }
    return result;
}


async function showHelp() {
    console.log(`
    LMMMOFA - Let Me Make My Own F*king API (F*king Facebook)

    Usage:
        lmmmofa init - Starts a new project
        lmmmofa update - Updates the method list
        lmmmofa help - Shows this help page
    `);
}

async function startProject() {
    //Comprobar si ya existen ficheros que se vallan a crear
    if (fs.existsSync("./api/installation_constants.php") ||
        fs.existsSync("./api/constants.php") ||
        fs.existsSync("./api/main.php") ||
        fs.existsSync("./api/index.php") ||
        fs.existsSync("./js/api.js")) {
        console.log(chalk.red("You already have a project in this directory"));
        const answares = await inquirer.prompt({
            type: 'input',
            name: 'override',
            message: 'Override current files?',
            default() {
                return 'yes';
            }
        });
        if (answares.override === 'yes') {
            const spinner = createSpinner("Deleting files...").start();
            try{
                if(fs.existsSync("./api/installation_constants.php")) fs.unlinkSync("./api/installation_constants.php");
                if(fs.existsSync("./api/constants.php")) fs.unlinkSync("./api/constants.php");
                if(fs.existsSync("./api/main.php")) fs.unlinkSync("./api/main.php");
                if(fs.existsSync("./api/index.php")) fs.unlinkSync("./api/index.php");
                if(fs.existsSync("./js/api.js")) fs.unlinkSync("./js/api.js");
                spinner.success({text: "Files deleted"});
            }catch(e){
                spinner.error({text: "Error deleting files: "+e});
            }
        } else {
            throw new Error("Project already exists");
        }
    }

    //Preguntar si va a usar composer
    let composerLine = "";
    const answares = await inquirer.prompt({
        type: 'input',
        name: 'composer',
        message: 'Will you use Composer?',
        default() {
            return 'yes';
        }
    });
    if(answares.composer === 'yes'){
        composerLine = "\n\trequire 'vendor/autoload.php';";
    }

    //Crear ficheros
    const spinner = createSpinner("Creating project...").start();
    try{
        if(!fs.existsSync("./api")) fs.mkdirSync("./api");
        if(!fs.existsSync("./js")) fs.mkdirSync("./js");
        fs.writeFileSync("./api/installation_constants.php", readTemplate("installation_constants.template.php"));
        fs.writeFileSync("./api/constants.php", readTemplate("constants.template.php", {composerLine}));
        fs.writeFileSync("./api/main.php", readTemplate("main.template.php"));
        fs.writeFileSync("./api/index.php", readTemplate("index.template.php"));
        fs.writeFileSync("./js/api.js", readTemplate("api.template.js", {functions: ""}));

        if(fs.existsSync("./test.html")) fs.unlinkSync("./test.html");
        fs.writeFileSync("./test.html", readTemplate("test.template.html"));
        spinner.success({text: "Project created"});
    }catch(e){
        spinner.error({text: "Error creating project " + e});
    }
}

async function updateMethods() {
    const spinner = createSpinner("Updating project...").start();
    try{
        if(fs.existsSync("./js/api.js")) fs.unlinkSync("./js/api.js");

        let methods = [];
        const code = fs.readFileSync("./api/main.php", "utf8").split("\n");
        for(let i = 0; i < code.length; i++){
            const line = code[i].trim();
            if(line.startsWith("//*") && line.replace(/\s/g, "").endsWith("*//Method")){
                let method = {};
                const parameters = line.replace("//*", "").replace("*//", "").replace("Method", "").trim().split(",").map(p => p.trim()).filter(p => p.length !== 0);
                for(const parameter of parameters) {
                    let [name, value] = parameter.split(":");
                    switch(name){
                        case "level":
                            method.level = value;
                            break;
                        case "role":
                            while(value.includes("  ")) value = value.replace("  ", " ");
                            method.role = value.split(" ");
                            break;
                        case "rename":
                            method.name = value;
                            break;
                        default:
                            throw new Error("Unknown parameter: "+name+", in line "+i); 
                    }
                }
                const nextLine = code[i+1].trim().replace(" ", "");
                if(nextLine.startsWith("function")){
                    if(!method.name) method.name = nextLine.split("(")[0].replace("function", "").trim();
                    method.parameters = nextLine.split("(")[1].replace(")", "").replace("{", "").trim().split(",").map(p => p.trim().replace("$", ""));
                }else{
                    throw new Error("Method not found in line "+(i+1));
                }
                methods.push(method);
            }
        }

        const functions = methods.map(method => `
function ${method.name}(${method.parameters.join(", ")}) {
    return fetchAPI("${method.name}", {${method.parameters.join(", ")}});
}
        `);

        let actions = {};
        for(const method of methods){
            actions[method.name] = {
                level: method.level,
                role: method.role
            }
        }

        fs.writeFileSync("./js/api.js", readTemplate("api.template.js", {functions}));
        fs.writeFileSync("./api/actions.json", JSON.stringify(actions, null, 4));
        spinner.success({text: "Project updated"});
        //console.log(methods);
    }catch(e){
        spinner.error({text: "Error updating project " + e});
    }
}


if (process.argv.length < 3) {
    showHelp();
} else {
    if (process.argv[3] === 'test') process.chdir("C:\\PROYECTOS\\LMMMOFA\\test");
    switch (process.argv[2]) {
        case "init":
            try {
                await startProject();
                await updateMethods();
            } catch (e) {
                createSpinner("").start().error({ text: "Error creating project: " + e });
                process.exit(1);
            }
            break;
        case "update":
                try {
                    await updateMethods();
                } catch (e) {
                    createSpinner("").start().error({ text: "Error updating project: " + e });
                    process.exit(1);
                }
                break;
        default:
            showHelp();
            break;
    }
}