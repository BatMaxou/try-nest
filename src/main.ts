import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle("Game Tournament")
    .setDescription("API de gestion de tournois de jeux vidéo")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap()
  .then(() => {
    console.log(`Listening on port ${process.env.PORT ?? 3000}`);
  })
  .catch((err) => {
    console.error("Error starting server", err);
  });
