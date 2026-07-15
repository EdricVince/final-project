import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

function isShowSwagger(app: INestApplication): boolean {
  const configService = app.get(ConfigService);
  return configService.get<string>('NODE_ENV') === 'development';
}

export function setupSwagger(app: INestApplication) {
  if (!isShowSwagger(app)) return;

  const config = new DocumentBuilder()
    .setTitle('Quiz App API')
    .setDescription('API for the Quiz App')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}
