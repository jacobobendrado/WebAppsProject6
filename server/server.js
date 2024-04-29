const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt');
const session = require('express-session');
const jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
const jwtd = require('jwt-destroy');

const app = express();
const port = 8081;

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());


app.listen(port, () => {
  console.log("Listening...");
});

const db = mysql.createConnection({
  host: "james.cedarville.edu",
  user: "cs3220_sp24",
  password: "OqagokbAg9DzKZGb",
  database: "cs3220_sp24"
});

const verifyPassword = (password, hash) => {
  return bcrypt.compareSync(password, hash);
};

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = "SELECT username, password, role FROM JAC_users WHERE username = ?;";

    db.query(sql, [username], (err, data) => {
        if (err) {
            console.error("Error:", err);
            return res.json("Login Failed");
        }
        if (data.length > 0) {
            
            const user = data[0];
            if (verifyPassword(password, user.password)) {
                let facultyData = { isFaculty: false };
                if (user.role == 1) {
                    facultyData.isFaculty = true;
                    facultyData.students = [];
                    const studentsSql = "SELECT advisee FROM JAC_advisor WHERE advisor = ?;";
                    db.query(studentsSql, [username], (err, students) => {
                        students.forEach(function(student) {
                            facultyData.students.push(student.advisee);
                        });
              
                        const tokenPayload = {
                          user: username,
                          faculty: facultyData
                        };
                        const accessToken = jwt.sign(tokenPayload, 'SECRET');
        
                        return res.json(accessToken);
                    });
                }
                else {
                    const tokenPayload = {
                        user: username,
                        faculty: facultyData
                    };
                    const accessToken = jwt.sign(tokenPayload, 'SECRET');

                    return res.json(accessToken);
                }
            } else {
                return res.json("Login Failed: Invalid username or password");
            }
        } else {
            return res.json("Login Failed: Invalid username or password");
        }
    });
});

app.get('/catalog', (req, res) => {
  const year = parseInt(req.query.year);

  if (isNaN(year)) {
      return res.status(400).json({ error: "Year is not a valid integer" });
  }

  const sql = "SELECT course_id FROM JAC_catalog WHERE catalog_year = ?";
  db.query(sql, [year], (err, courses) => {
      if (err) {
          console.error("Error:", err);
          return res.status(500).json({ error: "Internal server error" });
      }

      const courseData = {};
      const courseQuery = "SELECT course_id, name, description, credits FROM JAC_course WHERE course_id = ?";
      
      courses.forEach(course => {
          db.query(courseQuery, [course.course_id], (err, catData) => {
              if (err) {
                  console.error("Error:", err);
                  return res.status(500).json({ error: "Internal server error" });
              }

              if (catData.length > 0) {
                  const data = catData[0];
                  courseData[course.course_id] = {
                      id: data.course_id,
                      name: data.name,
                      description: data.description,
                      credits: data.credits
                  };
              }
              if (Object.keys(courseData).length === courses.length) {
                  res.json(courseData);
              }
          });
      });
  });
});

app.get('/user', (req, res) => {

  const token = req.headers['authorization'];
  const decoded = jwt.verify(token, 'SECRET');
  let user = decoded.user;

  if (decoded.faculty.isFaculty) {
    user = req.query.username;
    if (decoded.faculty.students.indexOf(user) < 0) {
        return res.redirect("http://localhost:5173/faculty");
    }
  }

  db.query('SELECT name, catalog_year, default_plan FROM JAC_users WHERE username = ?', [user], (error, results) => {
    if (error) {
      console.error('Error fetching user data:', error);
      return res.status(500).send('Internal Server Error 1');
    }

    if (results.length === 0) {
      return res.status(404).send('User not found.');
    }

    const userData = results[0];

    db.query('SELECT course_id, grade FROM JAC_taken_courses WHERE username = ?', [user], (error, courses) => {
      if (error) {
        console.error('Error fetching courses:', error);
        return res.status(500).send('Internal Server Error 2');
      }

      let gradePoints = 0.0;
      let totalCredits = 0;

      var courseIds = courses.map(course => course.course_id);
      const query = 'SELECT credits FROM JAC_course WHERE course_id IN (?)';

      if (courses.length == 0) {
        res.json({
          name: userData.name,
          catalog_year: userData.catalog_year,
          gpa: 0.0,
          default_plan: userData.default_plan
        });
      }
      else {
      
        db.query(query, [courseIds], (error, creditRows) => {
            if (error) {
            console.error('Error fetching credits:', error);
            return res.status(500).send('Internal Server Error 3');
            }
        
            const creditMap = new Map();
            for(var i = 0; i < courseIds.length; i++) {
            creditMap.set(courseIds[i], creditRows[i].credits);
            }

            courses.forEach(course => {
            const credits = creditMap.get(course.course_id);
            if (!credits) {
                console.error('Credits not found for course:', course.course_id);
                return res.status(500).send('Internal Server Error 4');
            }
        
            totalCredits += credits;

            switch (course.grade) {
                case 'A':
                gradePoints += credits * 4.0;
                break;
                case 'A-':
                gradePoints += credits * 3.7;
                break;
                case 'B+':
                gradePoints += credits * 3.3;
                break;
                case 'B':
                gradePoints += credits * 3.0;
                break;
                case 'B-':
                gradePoints += credits * 2.7;
                break;
                case 'C+':
                gradePoints += credits * 2.3;
                break;
                case 'C':
                gradePoints += credits * 2.0;
                break;
                case 'C-':
                gradePoints += credits * 1.7;
                break;
                case 'D+':
                gradePoints += credits * 1.3;
                break;
                case 'D':
                gradePoints += credits * 1.0;
                break;
                case 'D-':
                gradePoints += credits * 0.7;
                break;
                case 'F':
                break;
                default:
                console.error('Invalid grade:', course.grade);
                return res.status(500).send('Internal Server Error 5');
            }
            });

            const gpa = totalCredits ? gradePoints / totalCredits : 0.0;

            res.json({
            name: userData.name,
            catalog_year: userData.catalog_year,
            gpa: gpa,
            default_plan: userData.default_plan
            });
        });
    }
    });

  });
});

app.get('/plan', (req, res) => {
  const token = req.headers['authorization'];
  const decoded = jwt.verify(token, 'SECRET');
  let user = decoded.user;
  const plan = req.query.planId;

  
  if (decoded.faculty.isFaculty) {
    user = req.query.username;
    if (decoded.faculty.students.indexOf(user) < 0) {
        return res.redirect("http://localhost:5173/faculty");
    }
  }

  db.query('SELECT catalog_year FROM JAC_plan WHERE username = ? AND plan_name = ?', [user, plan], (error, results) => {
    if (error) {
      console.error('Error fetching catalog year:', error);
      return res.status(500).send('Internal Server Error');
    }

    if (results.length === 0) {
      return res.status(404).send('Plan and username not found.');
    }

    const catalogYear = results[0].catalog_year;

    db.query('SELECT major_name FROM JAC_plan_major WHERE username = ? AND plan_name = ?', [user, plan], (error, results) => {
      if (error) {
        console.error('Error fetching majors:', error);
        return res.status(500).send('Internal Server Error');
      }

      const majors = results.map(row => row.major_name);

      db.query('SELECT minor_name FROM JAC_plan_minor WHERE username = ? AND plan_name = ?', [user, plan], (error, results) => {
        if (error) {
          console.error('Error fetching minors:', error);
          return res.status(500).send('Internal Server Error');
        }

        const minors = results.map(row => row.minor_name);

        let classes = [];

        db.query('SELECT course_id, taken_year, term FROM JAC_taken_courses WHERE username = ?', [user], (error, results) => {
          if (error) {
            console.error('Error fetching taken courses:', error);
            return res.status(500).send('Internal Server Error');
          }

          classes = results.map(row => ({
            course_id: row.course_id,
            year: row.taken_year,
            term: row.term
          }));

          db.query('SELECT course_id, plan_year, term FROM JAC_planned_courses WHERE username = ? AND plan_name = ?', [user, plan], (error, results) => {
            if (error) {
              console.error('Error fetching planned courses:', error);
              return res.status(500).send('Internal Server Error');
            }

            classes = classes.concat(results.map(row => ({
              course_id: row.course_id,
              year: row.plan_year,
              term: row.term
            })));

            db.query('SELECT MAX(taken_year) AS max_year, term FROM JAC_taken_courses WHERE username = ? and taken_year = (SELECT MAX(taken_year) from JAC_taken_courses) GROUP BY term ORDER BY term DESC LIMIT 1', [user], (error, results) => {
              if (error) {
                console.error('Error fetching current year and term:', error);
                return res.status(500).send('Internal Server Error');
              }

              const currYear = results[0].max_year;
              const currTerm = results[0].term;

              res.json({
                plan_name: plan,
                catalog_year: catalogYear,
                majors: majors,
                minors: minors,
                courses: classes,
                currYear: currYear,
                currTerm: currTerm
              });
            });
          });
        });
      });
    });
  });
});

app.get('/majorrequirements', (req, res) => {
  const major = req.query.major;

  if (!major) {
      return res.status(400).json({ error: "Major is not set" });
  }

  const sql1 = "SELECT required_id, type, subgroup, credits_needed FROM JAC_major_req_group WHERE major_name = ?;";
  db.query(sql1, [major], (error, requirementGroupsSql) => {
    if (error) {
      return res.status(500).send('Internal Server Error');
    }

    const requirementGroups = {};

    const sql2 = "SELECT course_id FROM JAC_major_requirement WHERE required_id = ?;";
    let processedCount = 0;

    requirementGroupsSql.forEach(row => {
      const required_id = row.required_id;
      const type = row.type;
      const subgroup = row.subgroup || "null";
      const credits_needed = parseFloat(row.credits_needed).toFixed(1);

      if (!requirementGroups[type]) {
        requirementGroups[type] = {};
      }

      db.query(sql2, [required_id], (error, coursesForRequirementsSql) => {
        if (error) {
          return res.status(500).send('Internal Server Error');
        }

        const requirementCourses = coursesForRequirementsSql.map(course => course.course_id);

        requirementGroups[type][subgroup] = {
          courses: requirementCourses,
          credits_needed: credits_needed
        };

        processedCount++;

        if (processedCount === requirementGroupsSql.length) {
          res.json(requirementGroups);
        }
      });
    });
  });
});

app.get('/minorrequirements', (req, res) => {
  const minor = req.query.minor;

  if (!minor) {
      return res.status(400).json({ error: "Minor is not set" });
  }

  const sql1 = "SELECT required_id, subgroup, credits_needed FROM JAC_minor_req_group WHERE minor_name = ?;";
  db.query(sql1, [minor], (error, requiredRows) => {
    if (error) {
      return res.status(500).send('Internal Server Error');
    }

    const requirementGroups = {};
    let processedCount = 0;

    requiredRows.forEach(row => {
      const required_id = row.required_id;
      const subgroup = row.subgroup || "null";
      const credits_needed = parseFloat(row.credits_needed).toFixed(1);

      const sql2 = "SELECT course_id FROM JAC_minor_requirement WHERE required_id = ?;";
      db.query(sql2, [required_id], (error, courses) => {
        if (error) {
          return res.status(500).send('Internal Server Error');
        }

        const requirementCourses = courses.map(course => course.course_id);

        requirementGroups[subgroup] = {
          courses: requirementCourses,
          credits_needed: credits_needed
        };

        processedCount++;

        if (processedCount === requiredRows.length) {
          res.json(requirementGroups);
        }
      });
    });
  });
});

app.post('/save-planned-courses', (req, res) => {
  const token = req.headers['authorization'];
  const decoded = jwt.verify(token, 'SECRET');
  let user = decoded.user;
  const plan = req.body.planid;

  const plannedCourses = req.body.courses;
  const deleteQuery = `DELETE FROM JAC_planned_courses WHERE plan_name = ? AND username = ?`;

  if (decoded.faculty.isFaculty) {
    user = req.body.username;
    if (decoded.faculty.students.indexOf(user) < 0) {
        return res.status(500).send('Not allowed to save for user ' + user);
    }
  }
  const deleteValues = [plan, user];

  db.query(deleteQuery, deleteValues, (error, results, fields) => {
    if (error) {
        console.error('Error deleting existing planned courses:', error);
        return;
    }
    console.log(plannedCourses);
    for (let course_id in plannedCourses) {
      let course = plannedCourses[course_id];
      let query = `INSERT INTO JAC_planned_courses (plan_name, username, course_id, plan_year, term) VALUES (?, ?, ?, ?, ?)`;
      let values = [plan, user, course_id, course.year, course.term];

      
      db.query(query, values, (error, results, fields) => {
          if (error) {
              console.error('Error saving course:', error);
          } else {
              console.log('Course saved successfully:', course_id);
          }
      });
    }
  });
  res.sendStatus(200);
});

app.get('/getnotes', (req, res) => {
  const token = req.headers['authorization'];
  const decoded = jwt.verify(token, 'SECRET');
  const isFaculty = decoded.faculty.isFaculty;

  if (isFaculty) {
    const facultyUsername = decoded.user;
    const studentUsername = req.query.username;

    const facultyNotesQuery = 'SELECT note FROM JAC_notes WHERE username = ?';
    const studentNotesQuery = 'SELECT note FROM JAC_notes WHERE username = ?';

    db.query(facultyNotesQuery, [facultyUsername], (error, facultyResults) => {
      if (error) {
        console.error('Error fetching faculty notes:', error);
        return res.status(500).send('Failed to fetch faculty notes');
      }

      const facultyNotes = facultyResults.map(result => result.note);

      db.query(studentNotesQuery, [studentUsername], (error, studentResults) => {
        if (error) {
          console.error('Error fetching student notes:', error);
          return res.status(500).send('Failed to fetch student notes');
        }

        const studentNotes = studentResults.map(result => result.note);

        const response = {
          faculty: facultyUsername,
          student: studentUsername,
          facultyNotes: facultyNotes,
          studentNotes: studentNotes
        };

        res.json(response);
      });
    });
  } else {
    const user = decoded.user;
    const query = 'SELECT note FROM JAC_notes WHERE username = ?';

    db.query(query, [user], (error, results) => {
      if (error) {
        console.error('Error fetching notes:', error);
        return res.status(500).send('Failed to fetch notes');
      }

      const userNotes = results.map(result => result.note);

      const response = {
        user: user,
        notes: userNotes
      };

      res.json(response);
    });
  }
});

app.get('/getplans', (req, res) => {
  const token = req.headers['authorization'];
  const decoded = jwt.verify(token, 'SECRET');
  const isFaculty = decoded.faculty.isFaculty;
  let username = decoded.user;

  if (isFaculty) {
    username = req.query.username;
  }

  const studentPlansQuery = 'SELECT plan_name FROM JAC_plan WHERE username = ?';

    db.query(studentPlansQuery, [username], (error, planResults) => {
      if (error) {
        console.error('Error fetching faculty notes:', error);
        return res.status(500).send('Failed to fetch faculty notes');
      }

      const plans = planResults.map(plan => plan.plan_name);
      const response = {
        studentplans: plans,
      };

        res.json(response);
      });

});

app.post('/save-notes', (req, res) => {
  const token = req.headers['authorization'];
  const decoded = jwt.verify(token, 'SECRET');
  const isFaculty = decoded.faculty.isFaculty;
  if (!req.body.usrNotes || req.body.usrNotes == 'undefined') {
    return res.status(400).send('No notes to save');
  }
  const notes = JSON.parse(req.body.usrNotes);


  if (isFaculty) {
    const facultyUsername = decoded.user;
    const studentUsername = req.body.username;

    const facultyNotes = notes.facultyNotes || [];
    const studentNotes = notes.studentNotes || [];

    const deleteFacultyQuery = `DELETE FROM JAC_notes WHERE username = ?`;
    db.query(deleteFacultyQuery, [facultyUsername], (error, results, fields) => {
      if (error) {
        console.error('Error deleting existing faculty notes:', error);
        return res.status(500).send('Failed to delete existing faculty notes');
      }

      const facultyValues = facultyNotes.map(note => [facultyUsername, note]);
      const insertFacultyQuery = 'INSERT INTO JAC_notes (username, note) VALUES ?';
      db.query(insertFacultyQuery, [facultyValues], (error, results) => {
        if (error) {
          console.error('Error saving faculty notes:', error);
          return res.status(500).send('Failed to save faculty notes');
        }
        console.log('Faculty notes saved successfully');
      });
    });

    const deleteStudentQuery = `DELETE FROM JAC_notes WHERE username = ?`;
    db.query(deleteStudentQuery, [studentUsername], (error, results, fields) => {
      if (error) {
        console.error('Error deleting existing student notes:', error);
        return res.status(500).send('Failed to delete existing student notes');
      }

      const studentValues = studentNotes.map(note => [studentUsername, note]);
      const insertStudentQuery = 'INSERT INTO JAC_notes (username, note) VALUES ?';
      db.query(insertStudentQuery, [studentValues], (error, results) => {
        if (error) {
          console.error('Error saving student notes:', error);
          return res.status(500).send('Failed to save student notes');
        }
        console.log('Student notes saved successfully');
        res.sendStatus(200);
      });
    });
  } else {
    const user = decoded.user;
    const query = 'INSERT INTO JAC_notes (username, note) VALUES ?';
    const values = notes.map(note => [user, note]);

    const deleteQuery = `DELETE FROM JAC_notes WHERE username = ?`;
    db.query(deleteQuery, [user], (error, results, fields) => {
      if (error) {
        console.error('Error deleting existing notes:', error);
        return res.status(500).send('Failed to delete existing notes');
      }

      db.query(query, [values], (error, results) => {
        if (error) {
          console.error('Error saving notes:', error);
          return res.status(500).send('Failed to save notes');
        }
        console.log('Notes saved successfully');
        res.sendStatus(200);
      });
    });
  }
});
