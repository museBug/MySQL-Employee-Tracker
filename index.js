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
            'Delete employee',
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

        case 'Delete employee':
          employeeDelete();
          break;
  
        case "exit":
          db.end();
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
  

// View departments 

function departmentSearch () {
    console.log("Viewing departments\n");
    var query = "SELECT * FROM department";
        db.query(query, function(err, res) {
            if (err) throw err;
            console.table(res);
            console.log("Department view succeed!\n");
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

function departmentAdd() {
    inquirer.prompt({
        type: "input",
        name: "addDepartment",
        message: "What is the name of your department?"
    }).then(function (answer) {
        db.query('INSERT INTO department SET ?', { name: answer.addDepartment }, function (err) {
            if (err) throw err;
        });
        console.log("\n Department added to database... \n");
        start();
    });
}

  //Add role 

  function roleAdd(){
    let depCh = [];
    let query = "SELECT * FROM department";
    db.query(query, function(err, result){
        
        for(let i =0; i < result.length; i++){
            depCh.push(result[i].name);
        };
    })
    inquirer.prompt([{
        type: "input",
        name: "role_name",
        message: "Please add a new role name."
    },{
       type: "input",
       name: "role_salary",
       message: "Please enter salary." 
    },{
        type: "list",
        name: "department_list",
        message: "Please select department.",
        choices: depCh
    },
]).then(function(answer){
    let departmentID;
    for(let i =0; i < depCh.length; i++){
        if(depCh[i] === answer.department_list){
            departmentID = i + 1
        }
    };

    let query = "INSERT INTO role(title, salary, department_id) VALUES(?, ?, ?)";
    db.query(query, [answer.role_name, answer.role_salary, departmentID], function(err, res){
        if (err) throw err;
        console.log("Role has been added...");
        start();
    })
})   
};

  //Update employee role

  function roleUpdate() { 

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
  
    db.query(query, function (err, result) {
      if (err) throw err;
  
      const employeeChoices = result.map(({ id, first_name, last_name }) => ({
        value: id, name: `${first_name} ${last_name}`      
      }));
  
      console.table(result);
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
  
    db.query(query, function (err, result) {
      if (err) throw err;
  
      roleChoices = result.map(({ id, title, salary }) => ({
        value: id, title: `${title}`, salary: `${salary}`      
      }));
  
      console.table(result);
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
          function (err, result) {
            if (err) throw err;
  
            console.table(result);
            console.log(res.affectedRows + "Updated successfully!");
  
            start();
          });
      });
  }

//Delete employee

function employeeDelete() {

    inquirer.prompt([
        {
            name: "firstName",
            type: "input",
            message: "What is your Employee's First Name?"
        },
        {
            name: "lastName",
            type: "input",
            message: "What is your Employee's Last Name?"
        }
    ]).then(function (answer) {

        db.query("DELETE FROM employee WHERE first_name = ? and last_name = ?", [answer.firstName, answer.lastName], function (err) {
            if (err) throw err;

            console.log(`\n ${answer.firstName} ${answer.lastName} has been deleted from the database... \n`)
            start();
        })
    });
}

