import { Component, OnInit } from '@angular/core';
import { QuestionService } from '../service/question.service';
import { HttpErrorResponse } from '@angular/common/http';
import { StudentService } from '../student.service';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss']
})
export class QuestionComponent implements OnInit {

  answers: string[] = [];
  public name: string = "";
  public questionList: any = [];
  public currentQuestion: number = 0;
  public points: number = 0;
  counter = 60;
  correctAnswer: number = 0;
  inCorrectAnswer: number = 0;
  interval$: any;
  progress: string = "0";
  isQuizCompleted: boolean = false;
  public studentId: string = "";
  hasError: boolean = false;

  constructor(private http: HttpClient, private questionService: QuestionService, private studentService: StudentService) {}

  ngOnInit(): void {
    this.name = localStorage.getItem("name")!;
    this.getAllQuestions();
  }

  getAllQuestions() {
    this.questionService.getQuestionJson().subscribe(
      (res) => {
        this.questionList = res.questions;
      },
      (error) => {
        console.error('Error fetching questions:', error);
        // Gestion des erreurs
      }
    );
  }
  
  nextQuestion() {

    this.currentQuestion++;
  }

  nextQuestion1() {
    const studentAnswer = this.answers[this.currentQuestion];
    const questionNumber = this.currentQuestion;

    // Send the student's answer to Flask API for grading
    const data = { answer: studentAnswer };
    this.http.post<any>('http://localhost:5000/predict_grade', data).subscribe(
      (response) => {
        console.log('Response from Flask API:', response);

        // Assuming the response contains a 'predicted_class' field
        const predictedClass = response.predicted_class;

        // Move to the next question
        this.currentQuestion++;
        console.log('Next question:', this.currentQuestion);
      },
      (error) => {
        console.error('Error from Flask API:', error);
        // Handle API error
      }
    );
  }






  // Fonction de vérification de la réponse correcte
  checkIfAnswerIsCorrect(answer: string): boolean {
    const correctAnswer = this.questionList[this.currentQuestion]?.correctAnswer;
    return answer === correctAnswer;
  }

  previousQuestion() {
    if (this.currentQuestion > 0) {
      this.currentQuestion--;
    }
  }

  resetQuiz() {
    this.studentId = localStorage.getItem("studentId")!;
    this.getAllQuestions();
    this.points = 0;
    this.counter = 60;
    this.currentQuestion = 0;
    this.progress = "0";
    this.answers = [];
  }

  getProgressPercent() {
    this.progress = ((this.currentQuestion / this.questionList.length) * 100).toString();
    return this.progress;
  }

  // Ajoutez la logique de calcul des points selon vos besoins
  calculatePoints(answer: string): number {
    // Logique de calcul des points
    return 0; // Remplacez par votre logique
  }
}
