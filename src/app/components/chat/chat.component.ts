import { Component } from '@angular/core';
import { LlmService } from '../../services/llm.service';
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  userMessage = '';
  chatHistory: { role: string; content: string }[] = [];
  constructor(private llmService: LlmService) {}
  sendMessage() {
    if (!this.userMessage.trim()) return;
    const message = this.userMessage;
    this.chatHistory.push({ role: 'user', content: message });
    this.llmService.getCompletion(message).subscribe(response => {
      const reply = response.choices[0].message.content;
      this.chatHistory.push({ role: 'assistant', content: reply });
    });
    this.userMessage = '';
  }
}