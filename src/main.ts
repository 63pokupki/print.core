import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'https://dev.63pokupki.ru',
      'https://test1.63pokupki.ru',
      'https://test2.63pokupki.ru',
      'https://test3.63pokupki.ru',
      'https://test4.63pokupki.ru',
      'https://test5.63pokupki.ru',
      'https://test6.63pokupki.ru',
      'https://test7.63pokupki.ru',
      'https://stage.63pokupki.ru',
      'https://release.63pokupki.ru',
      'https://63pokupki.ru',
    ],
    methods: ['POST'],
    allowedHeaders: ['X-Requested-With', 'Content-Type'],
    credentials: true,
  });

  await app.listen(3030);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

  console.log('Принт-сервер работает на 3030 порте.');
}
bootstrap();
