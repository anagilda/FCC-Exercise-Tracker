const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const cors = require('cors');

// Database config
const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-tracker' , 
                 { useNewUrlParser: true });

const Schema = mongoose.Schema;
const model = mongoose.model;

// User schema
const userSchema = new Schema({
  username: { type: String, required: true }
});
const User = model("User", userSchema);

// Workout schema
const workoutSchema = new Schema({ 
  userId: { type: String, required: true } ,
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: Date
});
const Workout = model("Workout", workoutSchema);

app.use(cors());

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// API endpoint
// POST - Create a new user
app.post("/api/exercise/new-user", function (req, res) { 
  const username = req.body.username.toLowerCase();

  User.countDocuments({ username }, (error, count) => {
    if (error) { 
      return res.send('Error accessing database.'); 
    }
    if (count != 0) { 
      return res.send('Username already taken. Please select a new one.'); 
    }
    
    const newUser = new User({ username });
    newUser.save( (error, data) => {
      if (error) { 
        return res.send('Error saving to database');
      }
      return res.json({ username: data.username, _id: data._id, });
    });
  }); 
});

// GET - Search all users
app.get('/api/exercise/users', (req, res) => {
  User.find({}, function(error, docs) {
    if(error){ 
      return res.send('Error accessing database.');
    }
    return res.json(docs);
  });
});

// POST - Create a new workout
app.post('/api/exercise/add/', function(req, res) {
  const { userId, description, duration } = req.body;
  const date = new Date ( req.body.date || Date.now() );
  
  if ( !(userId && description && duration) ) { 
    return res.send("Necessary information missing. Please fill out all required fields (*)."); 
  }
  
	User.findOne({ _id: userId }, (error, data) => {
    if (error) { 
      if (error.name == "CastError") { 
        return res.send("Unknown userId format. Please check it and try again."); 
      }
      return res.send('Error accessing database.'); 
    }
    
		if ( data == null ) { 
      return res.send("Unknown userId. Please check it and try again."); 
    } 
    
    const newExercise = {
        username: data.username, // just for the output; won't be saved to the db
        userId,
        description,
        duration,
        date
    };
    
    const newWorkout = new Workout( newExercise );
    newWorkout.save( function(error, data) {
      if (error) { 
        return res.send('Error saving to database.');
      }
      return res.json( newExercise );
    });

	});
});

// GET - User's exercise log
app.get('/api/exercise/log', function(req, res) {
	// Query parameters
	const { userId, from, to } = req.query;
  const limit = parseInt(req.query.limit);

  // userId {required}
	if ( !userId ) { 
    return res.send('Please specify a userId (required field).'); 
  }

  User.findOne({ _id: userId }, (error, data) => {
    if (error) { 
      if (error.name == "CastError") { 
        return res.send("Unknown userId format. Please check it and try again."); 
      }
      return res.send('Error accessing database.');
    }
    if ( data == null ) { 
      return res.send("Unknown userId. Please check it and try again."); 
    }
  
    const username = data.username;
    
    // Query
    let query = { userId };
    if (from || to) {
      query.date = {};
      if (from) { query.date["$gte"] = from; }
      if (to) { query.date["$lte"] = to; } 
    }
  
    Workout.find(query , 
                 { _id: 0, description: 1, duration: 1, date: 1 },
                 { limit }, 
                 (error, log) => {
      if (error) { 
        return res.send('Error accessing database.');
      }

      const count = log.length;
      return res.json({userId, username, count, log});
    });
  });
});

// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
