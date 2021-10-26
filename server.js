const inquirer = require('inquirer');
const mysql = require('mysql2');
const { response } = require('express');

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'company_db'
    },
    console.log(`You are connected to the company_db database.`)
);

db.connect(err => {
    if (err) {
        throw err
    }
    connectedMesssage()
})

// Prompt for questions
function init() {
    inquirer.prompt([
        {
            type: "list",
            name: "options",
            message: "What would you like to do?",
            choices: [
                "View all departments",
                "View all roles",
                "View all employees",
                "Add a department",
                "Add a role",
                "Add an employee",
                "Update an employee role",
                "Quit"]
        }

        