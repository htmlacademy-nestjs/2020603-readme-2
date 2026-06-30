import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { RabbitRouting } from '../rabbitmq/rabbit-routing.enum';
import { EmailSubscriberService } from './email-subscriber.service';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';

@Controller()
export class EmailSubscriberController {
  constructor(
    private readonly emailSubscriberService: EmailSubscriberService,
  ) {}

  @EventPattern(RabbitRouting.AddSubscriber)
  public async addSubscriber(
    @Payload() dto: CreateSubscriberDto,
  ): Promise<void> {
    await this.emailSubscriberService.addSubscriber(dto);
  }
}
