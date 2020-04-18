const express = require('express');
const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');

// Create connection
const db = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '557597753323',
    database: 'employeesDB'
});

//Connect
db.connect((error) => {
    if(error) {
        throw error;}
        //console.log("connected as id" + db.threadId + "\n");
    
    start();  
});
    
function start() {
    inquirer
    .prompt([
        {
        type: 'list',
        name: 'action',
        message: "Check what would you like to do?",
        choices: [
            'View employees',
            'View departments',
            'View roles',
            'Add employees',
            'Add departments',
            'Add roles',
            'Update employee role',
            'exit'
        ]
    }
])
    .then(function ({action}) {
        switch (action) {
        case 'View employees':
          employeeSearch();
          break;
  
        case 'View departments':
          departmentSearch();
          break;
  
        case 'View roles':
          roleSearch();
          break;
  
        case 'Add employees':
          employeeAdd();
          break;

        case 'Add departments':
          departmentAdd();
        break;

        case 'Add roles':
          roleAdd();
        break;

        case 'Update department role':
          roleUpdate();
          break;
  
        case "exit":
          connection.end();
          break;
        }
      });
}

//View employees

function employeeSearch() {
    console.log("Viewing employees\n");
  
    var query =
      `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
    FROM employee e
    LEFT JOIN role r
      ON e.role_id = r.id
    LEFT JOIN department d
    ON d.id = r.department_id
    LEFT JOIN employee m
      ON m.id = e.manager_id`
  
    db.query(query, function (err, res) {
      if (err) throw err;
  
      console.table(res);
      console.log("Employees viewed!\n");
  
      start();
    });
  }
  
//View departments

function departmentSearch() {

    console.log("Viewing departments\n");

    var query = "SELECT * FROM department";

        db.query(query, function(err, res) {
            if (err) throw err;
            console.table(res);
            console.log("Department view succeed!\n");
            console.log(`DEPARTMENTS:`)
            res.forEach(department => {
                console.log(`ID: ${department.id} | Name: ${department.name}`)
            })
            start();
            });
};

//View Role

function roleSearch() {

    console.log("Viewing roles\n");

    var query = "SELECT * FROM role";

        db.query(query, function(err, res) {
            if (err) throw err;
            console.table(res);
            console.log("Role view succeed!\n");
            console.log(`ROLES:`)
            res.forEach(role => {
                console.log(`ID: ${role.id} | Title: ${role.title} | Salary: ${role.salary} | Department ID: ${role.department_id}`)
                })
            start();
            });
};

//Add employee

function employeeAdd() {
    console.log("Inserting an employee!")
  
    var query =
      `SELECT r.id, r.title, r.salary 
        FROM role r`
  
    db.query(query, function (err, res) {
      if (err) throw err;
  
      const roleChoices = res.map(({ id, title, salary }) => ({
        value: id, title: `${title}`, salary: `${salary}`
      }));
  
      console.table(res);
      console.log("RoleToInsert!");
  
      promptInsert(roleChoices);
    });
  }

//Prompt for new employee

  function promptInsert(roleChoices) {

    inquirer
      .prompt([
        {
          type: "input",
          name: "first_name",
          message: "What is the employee's first name?"
        },
        {
          type: "input",
          name: "last_name",
          message: "What is the employee's last name?"
        },
        {
          type: "list",
          name: "roleId",
          message: "What is the employee's role?",
          choices: roleChoices
        },
       
      ])
      .then(function (answer) {
        console.log(answer);
  
        var query = `INSERT INTO employee SET ?`
        // when finished prompting, insert a new item into the db with that info
        db.query(query,
          {
            first_name: answer.first_name,
            last_name: answer.last_name,
            role_id: answer.roleId,
            manager_id: answer.managerId,
          },
          function (err, res) {
            if (err) throw err;
  
            console.table(res);
            console.log(res.insertedRows + "Inserted successfully!\n");
  
            start();
          });
       
      });
  }

  //Add department
  //Add role


  


  //Updating employee's role 

  function roleUpdate() {
      employeeArray();
  }

  function employeeArray() {
    console.log("Updating an employee");
  
    var query =
      `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
    FROM employee e
    JOIN role r
      ON e.role_id = r.id
    JOIN department d
    ON d.id = r.department_id
    JOIN employee m
      ON m.id = e.manager_id`
  
    db.query(query, function (err, res) {
      if (err) throw err;
  
      const employeeChoices = res.map(({ id, first_name, last_name }) => ({
        value: id, name: `${first_name} ${last_name}`      
      }));
  
      console.table(res);
      console.log("employeeArray To Update!\n")
  
      roleArray(employeeChoices);
    });
  }
  
  function roleArray(employeeChoices) {
    console.log("Updating an role");
  
    var query =
      `SELECT r.id, r.title, r.salary 
    FROM role r`
    let roleChoices;
  
    db.query(query, function (err, res) {
      if (err) throw err;
  
      roleChoices = res.map(({ id, title, salary }) => ({
        value: id, title: `${title}`, salary: `${salary}`      
      }));
  
      console.table(res);
      console.log("roleArray to Update!\n")
  
      promptEmployeeRole(employeeChoices, roleChoices);
    });
  }
  
  function promptEmployeeRole(employeeChoices, roleChoices) {
  
    inquirer
      .prompt([
        {
          type: "list",
          name: "employeeId",
          message: "Which employee do you want to set with the role?",
          choices: employeeChoices
        },
        {
          type: "list",
          name: "roleId",
          message: "Which role do you want to update?",
          choices: roleChoices
        },
      ])
      .then(function (answer) {
  
        var query = `UPDATE employee SET role_id = ? WHERE id = ?`
        // when finished prompting, insert a new item into the db with that info
        db.query(query,
          [ answer.roleId,  
            answer.employeeId
          ],
          function (err, res) {
            if (err) throw err;
  
            console.table(res);
            console.log(res.affectedRows + "Updated successfully!");
  
            start();
          });
      });
  }
  
  
  

  
  






    