import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Log l'erreur complète pour debug
    if (!(exception instanceof HttpException)) {
      this.logger.error('Unhandled exception:', exception);
      if (exception instanceof Error) {
        this.logger.error(`Error stack: ${exception.stack}`);
      }
    }

    response.status(status).send({
      status: false,
      message: typeof message === 'string' ? message : message['message'],
      errors: typeof message === 'object' ? message['errors'] : undefined,
    });
  }
}