const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs'); 
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

const users = [
  {
    username: 'alice',
    password: '$2a$10$BQKlV6kXkI7Q4xLl/hTvPO7F5CY6sV5vfWjO5nAMjiO.QhXnqks2O', // Hashed password for "password123"
  },
];

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
  })
);

function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect('/login');
}

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the home page');
});

app.get('/register', (req, res) => {
  res.render('register'); 
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const userExists = users.some((user) => user.username === username);
    if (userExists) {
      return res.send('Username already taken');
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    users.push({ username, password: hashedPassword });
    res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('login'); 
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find((user) => user.username === username);
    if (user && bcrypt.compareSync(password, user.password)) {
      req.session.userId = user.username; 
      res.cookie('sessionId', req.session.id);
      return res.redirect('/protected');
    }
    res.send('Invalid username or password');
});

app.get('/protected', isAuthenticated, (req, res) => {
  res.send('This is a protected route');
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
          console.error(err);
        }
        res.clearCookie('sessionId');
        res.redirect('/');
      });
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
