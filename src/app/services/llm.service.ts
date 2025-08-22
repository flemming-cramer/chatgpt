import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

interface LlmCompletionResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class LlmService {
  private apiUrl = '/api/chat'; // Use our backend proxy
  private debugMode = true; // Enable debug logging

  constructor(private http: HttpClient) {}

  getCompletion(prompt: string): Observable<LlmCompletionResponse> {
    if (this.debugMode) {
      console.log('🚀 LLM Service: Sending request');
      console.log('📝 Prompt:', prompt);
      console.log('🔗 API URL:', this.apiUrl);
      console.log('✅ Using backend proxy to avoid CORS issues');
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body = {
      message: prompt
    };

    if (this.debugMode) {
      console.log('📦 Request body:', body);
    }

    return this.http.post<LlmCompletionResponse>(this.apiUrl, body, { headers }).pipe(
      tap((response: LlmCompletionResponse) => {
        if (this.debugMode) {
          console.log('✅ LLM Service: Response received');
          console.log('📨 Response:', response);
          console.log('💬 Assistant reply:', response.choices?.[0]?.message?.content);
        }
      }),
      catchError(error => {
        console.error('❌ LLM Service: Error occurred');
        console.error('🔍 Error details:', error);
        console.error('📊 Error status:', error.status);
        console.error('📄 Error message:', error.message);
        
        if (error.error) {
          console.error('🚨 API Error response:', error.error);
        }
        
        return throwError(() => error);
      })
    );
  }

  toggleDebugMode(): void {
    this.debugMode = !this.debugMode;
    console.log(`🔧 Debug mode ${this.debugMode ? 'enabled' : 'disabled'}`);
  }

  isDebugMode(): boolean {
    return this.debugMode;
  }
}
