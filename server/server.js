const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const redis = require('redis');
const client = redis.createClient();
const redisStore = require("connect-redis").default;

const app = express();
const port = 8081;

app.use(express.json());
app.use(cors());
app.use(cookieParser());

client.connect().then(() => {
  console.log('Connected to Redis server!');
}).catch((err) => {
  console.error('Could not establish a connection with Redis.', err);
});


app.use(session({
  store: new redisStore({ client: client }),
  secret: 'topsecret~!@#$%^&*',
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: false,
    secure: false,
    httpOnly: false,
    maxAge: 1000 * 60 * 10
  }
}))


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
  const sql = "SELECT username, password FROM JAC_users WHERE username = ?;";

  db.query(sql, [username], (err, data) => {
      if (err) {
          console.error("Error:", err);
          return res.json("Login Failed");
      }
      if (data.length > 0) {
          
          const user = data[0];
          if (verifyPassword(password, user.password)) {
              req.session.username = username;
              req.session.save((err) => {
                  if (err) {
                      console.error("Error saving session:", err);
                      return res.json("Login Failed");
                  }

                  return res.json("Login Successful");
              });
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
  //TODO: verify session
  //TODO: get session user
  const user = "asteele";

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
      
          console.log("Course:", course.course_id, "Credits:", credits);
      

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
    });
  });
});

app.get('/plan', (req, res) => {
  //TODO: verify session
  //TODO: Get session user and default plan
  const user = "asteele";
  const plan = "test";

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

            db.query('SELECT MAX(taken_year) AS max_year, term FROM JAC_taken_courses GROUP BY term ORDER BY term DESC LIMIT 1', (error, results) => {
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
  
  db.query('SELECT required_id, type, subgroup, credits_needed FROM JAC_major_req_group WHERE major_name = ?;', [major], (error, requiredRows) => {
    if (error) {
      return res.status(500).send('Internal Server Error');
    }
    console.log(requiredRows);
  });
  //SELECT course_id FROM JAC_major_requirement WHERE required_id = ?;
});







