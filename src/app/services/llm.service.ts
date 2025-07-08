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
  private apiUrl = 'https://api.openai.com/v1/chat/completions';
  private apiKey = 
  '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'; // Store securely in env
  private debugMode = true; // Enable debug logging
  constructor(private http: HttpClient) {}
  getCompletion(prompt: string): Observable<LlmCompletionResponse> {
    if (this.debugMode) {
      console.log('🚀 LLM Service: Sending request');
      console.log('📝 Prompt:', prompt);
      console.log('🔗 API URL:', this.apiUrl);
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    });

    const body = {
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    };

    if (this.debugMode) {
      console.log('📦 Request body:', body);
      console.log('🔑 Headers:', headers.keys());
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
