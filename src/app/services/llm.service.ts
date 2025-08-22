import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

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
  private apiKey = environment.openaiApiKey;
  private debugMode = true; // Enable debug logging

  constructor(private http: HttpClient) {}
  getCompletion(prompt: string): Observable<LlmCompletionResponse> {
    // Check if API key is configured
    if (!this.apiKey || this.apiKey.trim() === '') {
      const errorMessage = 'OpenAI API key is not configured. Please add your API key to the environment configuration.';
      console.error('❌ LLM Service:', errorMessage);
      return throwError(() => new Error(errorMessage));
    }

    // Note: Direct calls to OpenAI API from browser may face CORS issues
    // In production, consider using a backend proxy or serverless function
    if (this.debugMode) {
      console.log('🚀 LLM Service: Sending request');
      console.log('📝 Prompt:', prompt);
      console.log('🔗 API URL:', this.apiUrl);
      console.log('🔑 API Key configured:', this.apiKey ? 'Yes' : 'No');
      console.log('🔑 API Key length:', this.apiKey ? this.apiKey.length : 0);
      console.log('⚠️ Note: Browser-based API calls may face CORS restrictions');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    });

    const body = {
      model: 'gpt-3.5-turbo', // Using more cost-effective model
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
