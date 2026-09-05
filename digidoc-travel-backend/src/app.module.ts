import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CustomThrottlerGuard } from './security/guards/throttle.guard.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { RolesModule } from './roles/roles.module.js';
import { AuditModule } from './audit/audit.module.js';
import { PermissionsModule } from './permissions/permissions.module.js';
import { StudentsModule } from './students/students.module.js';
import { CatalogModule } from './catalog/catalog.module.js';
import { DocumentsModule } from './documents/documents.module.js';
import { VisasModule } from './visas/visas.module.js';
import { PaymentsModule } from './payments/payments.module.js';
import { EventsModule } from './events/events.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { ReportsModule } from './reports/reports.module.js';
import { User } from './users/entities/user.entity.js';
import { Role } from './roles/entities/role.entity.js';
import { Permission } from './permissions/entities/permission.entity.js';
import { AuditLog } from './audit/entities/audit-log.entity.js';
import { Student } from './students/entities/student.entity.js';
import { StudentObservation } from './students/entities/student-observation.entity.js';
import { Country } from './catalog/entities/country.entity.js';
import { University } from './catalog/entities/university.entity.js';
import { Document } from './documents/entities/document.entity.js';
import { DocumentHistory } from './documents/entities/document-history.entity.js';
import { Visa } from './visas/entities/visa.entity.js';
import { PaymentPlan } from './payments/entities/payment-plan.entity.js';
import { Installment } from './payments/entities/installment.entity.js';
import { Payment } from './payments/entities/payment.entity.js';
import { Event } from './events/entities/event.entity.js';
import { EventParticipant } from './events/entities/event-participant.entity.js';
import { Notification } from './notifications/entities/notification.entity.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // OWASP A05 - Validate required env vars
      validationOptions: { abortEarly: false },
    }),
    // OWASP A07 - Rate limiting: 100 req/min global
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_NAME', 'digidoc_travel'),
        entities: [
          User,
          Role,
          Permission,
          AuditLog,
          Student,
          StudentObservation,
          Country,
          University,
          Document,
          DocumentHistory,
          Visa,
          PaymentPlan,
          Installment,
          Payment,
          Event,
          EventParticipant,
          Notification,
        ],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        store: 'redis',
        host: configService.get<string>('REDIS_HOST', 'localhost'),
        port: configService.get<number>('REDIS_PORT', 6379),
        ttl: 60000,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    AuditModule,
    StudentsModule,
    CatalogModule,
    DocumentsModule,
    VisasModule,
    PaymentsModule,
    EventsModule,
    NotificationsModule,
    DashboardModule,
    ReportsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {}
