import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS Ayarı: Frontend'in backend'e veri gönderebilmesi için şarttır
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // ValidationPipe: Formdan gelen verileri (email gibi) kontrol eder
  // Production'da strict mode'u kapatıyoruz ki update işlemleri çalışsın
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false, // Tüm alanları kabul et
      forbidNonWhitelisted: false, // Ekstra alanları reddetme
      transform: true, // Otomatik tip dönüşümü
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Render için dinamik port ayarı
  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();