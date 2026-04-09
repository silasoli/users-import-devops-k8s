import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { MetricsService } from './metrics.service';

@Injectable()
export class HttpMetricsMiddleware implements NestMiddleware {
  constructor(private readonly metricsService: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const start = process.hrtime.bigint();

    res.on('finish', () => {
      const elapsed = Number(process.hrtime.bigint() - start) / 1_000_000_000;
      const route = req.route?.path ? String(req.route.path) : req.path;

      this.metricsService.observeRequest({
        method: req.method,
        route,
        statusCode: res.statusCode,
        durationSeconds: elapsed,
      });
    });

    next();
  }
}
