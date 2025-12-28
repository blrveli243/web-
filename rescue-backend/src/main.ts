import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS Ayarı: Frontend'in backend'e veri gönderebilmesi için şarttır
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // ValidationPipe: Formdan gelen verileri (email gibi) kontrol eder
  app.useGlobalPipes(new ValidationPipe());

  // Render için dinamik port ayarı
  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();