import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: config.get<any>('DB_TYPE'),
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        synchronize: config.get<string>('DB_SYNCHRONIZE') === 'true',
        migrations: ['src/migrations/*{.ts,.js}'],
        autoLoadEntities: true,
        // Supabase requires SSL. `rejectUnauthorized: false` avoids the
        // "self-signed certificate in chain" error managed hosts (Render) hit
        // against the Supabase pooler — matches the FK-sync script.
        ssl: { rejectUnauthorized: false },
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
