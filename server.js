const { response } = require("express");
const inquirer = require("inquirer");
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "company_db",
  port: 3306,
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log(`You are connected to the company_db database.`);
  init();
});

// Prompt for questions
function init() {
  inquirer
    .prompt([
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
          "Quit",
        ],
      },
    ])
    .then((response) => {
      switch (response.options) {
        case "View all departments":
          viewDepartments();
          break;
        case "View all roles":
          viewRoles();
          break;
        case "View all employees":
          viewEmployees();
          break;
        case "Add a department":
          addDepartment();
          break;
        case "Add a role":
          addRole();
          break;
        case "Add an employee":
          addEmployee();
          break;
        case "Update an employee role":
          updateRole();
          break;
        case "Quit":
          db.end();
          break;

        default:
          break;
      }
    });
}

// To view departments
function viewDepartments() {
  db.query("SELECT * FROM department", (err, res) => {
    if (err) {
      throw err;
    }
    console.table(res);
    init();
  });
}

// To view roles
function viewRoles() {
  db.query("SELECT * FROM role", (err, res) => {
    if (err) {
      throw err;
    }
    console.table(res);
    init();
  });
}

// To view employees
function viewEmployees() {
  db.query("SELECT * FROM employee", (err, res) => {
    if (err) {
      throw err;
    }
    console.table(res);
    init();
  });
}

// To add department
function addDepartment() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "department",
        message: "What department would you like to add?",
      },
    ])
    .then((response) => {
      db.query(
        "INSERT INTO department SET ?",
        {
          name: response.department,
        },
        (err, res) => {
          if (err) {
            throw err;
          }
          console.log("Success! You just added a department!");
          init();
        }
      );
    });
}

// To add a role
function addRole() {
  db.query("SELECT * FROM department", (err, res) => {
    if (err) {
      throw err;
    }
    inquirer
      .prompt([
        {
          type: "input",
          name: "role",
          message: "What will be the new role?",
        },
        {
          type: "input",
          name: "salary",
          message: "What will be the salary for this new role?",
        },
        {
          type: "list",
          name: "department_id",
          message: "What department will this new role work in?",
          choices: res.map((department) => department.name),
        },
      ])
      .then((response) => {
        const chosenDepartment = res.find(
          (department) => department.name === response.department_id
        );
        db.query(
          "INSERT INTO role SET ?",
          {
            title: response.role,
            salary: response.salary,
            department_id: chosenDepartment.id,
          },
          (err, res) => {
            if (err) {
              throw err;
            }
            console.log("Success! You just added a new role!");
            init();
          }
        );
      });
  });
}

// To add an employee
function addEmployee() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "firstName",
        message: "What is the employee's first name?",
      },
      {
        type: "input",
        name: "lastName",
        message: "What is the employee's last name?",
      },
    ])
    .then((response) => {
      const params = [response.firstName, response.lastName];

      const selectRole = "SELECT * FROM role";

      db.query(selectRole, (err, res) => {
        if (err) {
          throw err;
        }
        const employeeRole = res.map(({ id, title }) => ({
          name: title,
          value: id,
        }));
        inquirer
          .prompt([
            {
              type: "list",
              name: "role",
              message: "What is the employee's role?",
              choices: employeeRole,
            },
          ])
          .then((pickedRole) => {
            const role = pickedRole.role;
            params.push(role);

            const selectManager = "SELECT * FROM employee";

            db.query(selectManager, (err, res) => {
              if (err) {
                throw err;
              }
              const employeeManager = res.map(
                ({ id, first_name, last_name }) => ({
                  name: first_name + " " + last_name,
                  value: id,
                })
              );

              inquirer
                .prompt([
                  {
                    type: "list",
                    name: "manager",
                    message: "Who is this employee's manager?",
                    choices: employeeManager,
                  },
                ])
                .then((pickedManager) => {
                  const manager = pickedManager.manager;
                  params.push(manager);

                  const insertNewEmployee =
                    "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)";

                  db.query(insertNewEmployee, params, (err, res) => {
                    if (err) {
                      throw err;
                    }
                    console.log(
                      "\n Success! The new employee has been added! \n"
                    );
                    init();
                  });
                });
            });
          });
      });
    });
}

// To update an employee role
function updateRole() {
  db.query("SELECT * FROM employee", function (err, results) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "updatedRole",
          type: "list",
          message: "Choose which employee's role you would like to update.",
          choices: results.map((item) => item.first_name),
        },
      ])
      .then((answer) => {
        const updatedEmployee = answer.updatedRole;
        db.query("SELECT * FROM role", function (err, results) {
          if (err) throw err;
          inquirer
            .prompt([
              {
                name: "role_id",
                type: "list",
                message: "Select the employee's new role.",
                choices: results.map((item) => item.title),
              },
            ])
            .then((answer) => {
              const roleChosen = results.find(
                (item) => item.title === answer.role_id
              );
              db.query(
                "UPDATE employee SET ? WHERE first_name = " +
                  "'" +
                  updatedEmployee +
                  "'",
                {
                  role_id: "" + roleChosen.id + "",
                },
                function (err) {
                  if (err) throw err;
                  console.log(
                    " \n Success! You updated " +
                      updatedEmployee +
                      "'s role to " +
                      answer.role_id +
                      "! \n"
                  );
                  init();
                }
              );
            });
        });
      });
  });
}
