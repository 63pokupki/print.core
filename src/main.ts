import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'https://dev.63pokupki.ru',
      'https://devsrv10.dev.63pokupki.ru',
      'https://devsrv12.dev.63pokupki.ru',
      'https://devsrv14.dev.63pokupki.ru',
      'https://devsrv15.dev.63pokupki.ru',
      'https://devsrv16.dev.63pokupki.ru',
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
