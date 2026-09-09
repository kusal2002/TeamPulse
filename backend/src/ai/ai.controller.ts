import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service.js';
import { IsNotEmpty, IsString } from 'class-validator';

class ChatPromptDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;
}

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(@Body() dto: ChatPromptDto) {
    const response = await this.aiService.askAi(dto.prompt);
    return { response };
  }
}
