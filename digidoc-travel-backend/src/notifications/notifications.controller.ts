import { Controller, Get, Patch, Param, Query, UseGuards, Req, ParseUUIDPipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notifService: NotificationsService) {}

  @Get()
  async findAll(@Req() req: any, @Query() query: any) {
    return this.notifService.findAll(req.user.id, query);
  }

  @Get('unread')
  async unread(@Req() req: any) {
    return this.notifService.countUnread(req.user.id);
  }

  @Patch('read-all')
  async markAll(@Req() req: any) {
    return this.notifService.markAllAsRead(req.user.id);
  }

  @Patch(':id/read')
  async markRead(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.notifService.markAsRead(id, req.user.id);
  }
}
