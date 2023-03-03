import { Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { PrintR } from './print.route';
import { PrintService } from './print.service';

@Controller()
export class PrintController {
  constructor(private readonly printService: PrintService) {}

  @Post(PrintR.printListOrdersBoxLabel.route)
  async printListOrdersBoxLabel(@Req() req: Request) {
    await this.printService.printListOrdersBoxLabel(req.body);
  }

  @Post(PrintR.printDeliveryBoxLabel58x40.route)
  async printDeliveryBoxLabel58х40(@Req() req: Request) {
    await this.printService.printDeliveryBoxLabel58х40(req.body);
  }

  @Post(PrintR.printListDeliveryBoxLabel58x40.route)
  async printListDeliveryBoxLabel58x40(@Req() req: Request) {
    await this.printService.printListDeliveryBoxLabel58x40(req.body);
  }

  @Post(PrintR.printPlaceLabel58x40.route)
  async printPlaceLabel58x40(@Req() req: Request) {
    await this.printService.printPlaceLabel58x40(req.body);
  }

  @Post(PrintR.printReturnablePackaging40x58.route)
  async printReturnablePackaging40x58(@Req() req: Request) {
    await this.printService.printReturnablePackaging40x58(req.body);
  }
}
