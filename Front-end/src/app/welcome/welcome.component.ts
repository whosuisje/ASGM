import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { StudentService } from '../student.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {
  @ViewChild('name') nameKey!: ElementRef;
  students: any[] = [];

  constructor(private studentService: StudentService, private router: Router) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  startQuiz() {
    const studentName = this.nameKey.nativeElement.value;

    this.studentService.addStudent(studentName).subscribe(
      (response) => {
        console.log('Student added successfully:', response);

        // Vérifie si la réponse contient un _id
        const studentId = response._id || response.id;

        if (!studentId) {
          console.error('Student ID not found in the response:', response);
          return;
        }

        // Stocke l'ID de l'étudiant dans le service et dans le stockage local
        this.studentService.setStudentId(studentId);
        localStorage.setItem('studentId', studentId);

        this.router.navigate(['/question']);
      },
      (error) => {
        console.error('Error adding student:', error);
      }
    );
  }


  private loadStudents() {
    this.studentService.getStudents().subscribe(
      (students) => {
        this.students = students;
      },
      (error) => {
        console.error('Error loading students:', error);
      }
    );
  }
}
