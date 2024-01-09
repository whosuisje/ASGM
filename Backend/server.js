const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/quizApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB', err);
  });

// Define MongoDB Schema
const studentSchema = new mongoose.Schema({
  name: String,
  studentId: String,
});

const answerSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  questionNumber: Number,
  answer: String,
  points: { type: Number, min: 1, max: 2 },
});

const Student = mongoose.model('Student', studentSchema);
const Answer = mongoose.model('Answer', answerSchema);

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Routes
app.post('/api/students', async (req, res) => {
  try {
    const { name } = req.body;

    const lastStudent = await Student.findOne().sort({ studentId: -1 });
    const newStudentId = lastStudent ? lastStudent.studentId + 1 : 0;

    const newStudent = new Student({ name, studentId: newStudentId });
    const savedStudent = await newStudent.save();

    res.status(201).json(savedStudent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error saving student' });
  }
});


app.post('/api/answers', async (req, res) => {
  try {
    const { studentId, questionNumber, answer, points } = req.body;

    if (!studentId || typeof studentId !== 'string' || studentId.trim() === "") {
      res.status(400).json({ error: 'Invalid studentId', details: 'StudentId must be a non-empty string' });
      return;
    }

    // ...
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error saving answer' });
  }
});

app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error retrieving students' });
  }
});


app.get('/api/students/latestId', async (req, res) => {
  try {
    const lastStudent = await Student.findOne().sort({ studentId: -1 });
    const latestId = lastStudent ? lastStudent.studentId : 0;
    res.json(latestId);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error retrieving latest student ID' });
  }
});



// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
