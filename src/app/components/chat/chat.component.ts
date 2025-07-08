import { Component } from '@angular/core';
import { LlmService } from '../../services/llm.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {
  userMessage = '';
  chatHistory: { role: string; content: string }[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(private llmService: LlmService) {}

  sendMessage() {
    if (!this.userMessage.trim()) return;

    console.log('🎯 Chat Component: Sending message');
    console.log('💭 User message:', this.userMessage);

    const message = this.userMessage;
    this.chatHistory.push({ role: 'user', content: message });
    this.userMessage = '';
    this.isLoading = true;
    this.errorMessage = '';

    console.log('📊 Chat history length:', this.chatHistory.length);

    this.llmService.getCompletion(message).subscribe({
      next: (response) => {
        console.log('✅ Chat Component: Response received');
        const reply = response.choices[0].message.content;
        this.chatHistory.push({ role: 'assistant', content: reply });
        this.isLoading = false;
        console.log('📊 Updated chat history length:', this.chatHistory.length);
      },
      error: (error) => {
        console.error('❌ Chat Component: Error occurred');
        console.error('🔍 Error details:', error);
        
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error);
        
        // Add error message to chat history for user visibility
        this.chatHistory.push({ 
          role: 'system', 
          content: `Error: ${this.errorMessage}` 
        });
      }
    });
  }

  private getErrorMessage(error: any): string {
    if (error.status === 401) {
      return 'Authentication failed. Please check your API key.';
    } else if (error.status === 429) {
      return 'Rate limit exceeded. Please try again later.';
    } else if (error.status === 0) {
      return 'Network error. Please check your internet connection.';
    } else if (error.error?.error?.message) {
      return error.error.error.message;
    } else {
      return 'An unexpected error occurred. Please try again.';
    }
  }

  toggleDebugMode() {
    this.llmService.toggleDebugMode();
  }

  isDebugMode(): boolean {
    return this.llmService.isDebugMode();
  }

  clearChat() {
    console.log('🧹 Clearing chat history');
    this.chatHistory = [];
    this.errorMessage = '';
  }
}