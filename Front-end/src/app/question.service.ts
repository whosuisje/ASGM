// question.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  private apiUrl = 'http://localhost:3000/api'; // Remplacez cela par l'URL de votre backend

  constructor(private http: HttpClient) {}

  getQuestionJson(): Observable<any> {
    return this.http.get(`${this.apiUrl}/questions`);
  }

  saveAnswer(studentId: string, questionNumber: number, answer: string, points: number): Observable<any> {
    const data = {
      studentId,
      questionNumber,
      answer,
      points,
    };
    return this.http.post(`${this.apiUrl}/answers`, data);
  }
}
