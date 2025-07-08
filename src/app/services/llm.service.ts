import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class LlmService {
  private apiUrl = 'https://api.openai.com/v1/chat/completions';
  private apiKey = 
  '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'; // Store securely in env
  constructor(private http: HttpClient) {}
  getCompletion(prompt: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    });
    const body = {
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    };
    return this.http.post(this.apiUrl, body, { headers });
  }
}
