import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = 'http://localhost:3000/api/students';

  constructor(private http: HttpClient) {}

  getStudentId(): Observable<string> {
    // Utilisez la route appropriée pour récupérer l'ID de l'étudiant depuis le backend
    return this.http.get<any>(`${this.apiUrl}/latestId`).pipe(
      map(response => response.id as string)
    );
  }


  addAnswer(studentId: string, questionNumber: number, answer: string, points: number): Observable<any> {
    const url = `${this.apiUrl}/answers`;
    const data = { studentId, questionNumber, answer, points };

    return this.http.post(url, data);
  }

  getStudents(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  setStudentId(id: string): void {
    // Implémentez la logique pour définir l'ID de l'étudiant
    console.log('Setting student ID:', id);
    // Vous pouvez stocker l'ID dans le stockage local (localStorage) ici si nécessaire
  }

  addStudent(studentName: string): Observable<any> {
    const body = { name: studentName };
    return this.http.post(this.apiUrl, body);
  }
}
