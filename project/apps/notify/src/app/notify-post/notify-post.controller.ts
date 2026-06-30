import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { RabbitRouting } from '../rabbitmq/rabbit-routing.enum';
import { NotifyPostService } from './notify-post.service';
import { CreatePostNotificationDto } from './dto/create-post-notification.dto';

@Controller()
export class NotifyPostController {
  constructor(private readonly notifyPostService: NotifyPostService) {}

  @EventPattern(RabbitRouting.AddPost)
  public async addPost(
    @Payload() dto: CreatePostNotificationDto,
  ): Promise<void> {
    await this.notifyPostService.addPost(dto);
  }
}
