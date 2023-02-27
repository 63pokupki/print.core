import { Injectable } from '@nestjs/common';
import { PrintR } from './print.route';
import * as QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';
import * as md5 from 'md5';
import * as uuid4 from 'uuid4';
import * as NodePdfPrinter from 'node-pdf-printer';
import * as PDFDocument from 'pdfkit';
import { DeliveryBoxLabelDataI, OrdersBoxLabelDataI, PlaceLabelDataI, ReturnablePackageDataI } from './print.interface';
import { createCanvas, loadImage } from 'canvas';

@Injectable()
export class PrintService {
  /**
   * Печать списка наклеек orders box 58x40
   */
  async printListOrdersBoxLabel(data: PrintR.printListOrdersBoxLabel.RequestI): Promise<void> {
    // Срезать имя и ник
    for (let i = 0; i < data.list_orders_box_label.length; i++) {
      data.list_orders_box_label[i].customer_fullname = data.list_orders_box_label[i].customer_fullname.substr(0, 25);
      data.list_orders_box_label[i].customer_username = data.list_orders_box_label[i].customer_username.substr(0, 25);
    }

    // Сформировать QR
    console.time('QR');
    const aQrDataPromise: Promise<string>[] = [];
    for (let i = 0; i < data.list_orders_box_label.length; i++) {
      const ordersBoxLabel = data.list_orders_box_label[i];
      const qrDataPromise = this.generateQr(ordersBoxLabel.url, 80);
      aQrDataPromise.push(qrDataPromise);
    }
    const aQrData = await Promise.all(aQrDataPromise);
    console.timeEnd('QR');

    // Собрать данные
    console.time('DATA');
    const aData: OrdersBoxLabelDataI[] = [];
    for (let i = 0; i < data.list_orders_box_label.length; i++) {
      aData.push({
        ...data.list_orders_box_label[i],
        qr_data: aQrData[i],
      });
    }
    console.timeEnd('DATA');
    console.log('Количество наклеек на печать :>> ', aData.length);

    // Сформировать PDF
    console.time('PDF');
    const outFilePath = this.generatePdfListOrdersBoxLabel58x60(aData);
    console.timeEnd('PDF');
    console.log('Путь к выходному файлу :>> ', outFilePath);

    // Напечатать
    console.time('PRINTING');
    await NodePdfPrinter.printFiles([path.resolve(outFilePath)], 'MPRINT LP58 LABEL EVA');
    console.timeEnd('PRINTING');

    fs.unlinkSync(path.resolve(outFilePath));
  }

  /**
   * Печать наклейки delivery box 58x40
   */
  async printDeliveryBoxLabel58х40(data: PrintR.printDeliveryBoxLabel58x40.RequestI): Promise<void> {
    // Сформировать QR
    console.time('QR');
    const qrData = await this.generateQr(data.url, 80);
    console.timeEnd('QR');

    // Собрать данные
    console.time('DATA');
    const aData: DeliveryBoxLabelDataI[] = [
      {
        ...data,
        qr_data: qrData,
      },
    ];
    console.timeEnd('DATA');
    console.log('Количество наклеек на печать :>> ', aData.length);

    // Сформировать PDF
    console.time('PDF');
    const outFilePath = this.generatePdfListDeliveryBoxLabel58x40(aData);
    console.timeEnd('PDF');
    console.log('Путь к выходному файлу :>> ', outFilePath);

    // Напечатать
    console.time('PRINTING');
    await NodePdfPrinter.printFiles([path.resolve(outFilePath)], 'MPRINT LP58 LABEL EVA');
    console.timeEnd('PRINTING');

    fs.unlinkSync(path.resolve(outFilePath));

    console.log('END\n');
  }

  /**
   * Печать кода для возвратной тары 58x40
   */
  async printReturnablePackaging40x58(data: PrintR.printReturnablePackaging40x58.RequestI): Promise<void> {
    // Сформировать QR
    console.time('QR');
    const qrData = await this.generateQr(data.url, 80);
    console.timeEnd('QR');

    // Собрать данные
    console.time('DATA');
    const aData: ReturnablePackageDataI[] = [
      {
        ...data,
        qr_data: qrData,
      },
    ];
    console.timeEnd('DATA');
    console.log('Количество наклеек на печать :>> ', aData.length);
    // Сформировать PDF
    console.time('PDF');
    const outFilePath = await this.generatePdfReturnablePackaging40x58(aData);
    console.timeEnd('PDF');
    console.log('Путь к выходному файлу :>> ', outFilePath);

    // Напечатать
    console.time('PRINTING');
    await NodePdfPrinter.printFiles([path.resolve(outFilePath)], 'MPRINT LP58 LABEL EVA');
    console.timeEnd('PRINTING');

    fs.unlinkSync(path.resolve(outFilePath));

    console.log('END\n');
  }

  /**
   * Печать списка наклеек delivery box 58x40
   */
  async printListDeliveryBoxLabel58x40(data: PrintR.printListDeliveryBoxLabel58x40.RequestI) {
    // Сформировать QR
    console.time('QR');
    const aQrDataPromise: Promise<string>[] = [];
    for (let i = 0; i < data.list_delivery_box_info.length; i++) {
      const deliveryBox = data.list_delivery_box_info[i];
      const qrDataPromise = this.generateQr(deliveryBox.url, 80);
      aQrDataPromise.push(qrDataPromise);
    }
    const aQrData = await Promise.all(aQrDataPromise);
    console.timeEnd('QR');

    // Собрать данные
    console.time('DATA');
    const aData: DeliveryBoxLabelDataI[] = [];
    for (let i = 0; i < data.list_delivery_box_info.length; i++) {
      aData.push({
        ...data.list_delivery_box_info[i],
        qr_data: aQrData[i],
      });
    }
    console.timeEnd('DATA');
    console.log('Количество наклеек на печать :>> ', aData.length);

    // Сформировать PDF
    console.time('PDF');
    const outFilePath = this.generatePdfListDeliveryBoxLabel58x40(aData);
    console.timeEnd('PDF');
    console.log('Путь к выходному файлу :>> ', outFilePath);

    // Напечатать
    console.time('PRINTING');
    await NodePdfPrinter.printFiles([path.resolve(outFilePath)], 'MPRINT LP58 LABEL EVA');
    console.timeEnd('PRINTING');

    fs.unlinkSync(path.resolve(outFilePath));
  }

  /**
   * Печать наклейки места 58x40
   */
  async printPlaceLabel58x40(data: PrintR.printPlaceLabel58x40.RequestI): Promise<void> {
    // Сформировать QR
    console.time('QR');
    const qrData = await this.generateQr(data.url, 80);
    console.timeEnd('QR');

    // Собрать данные
    console.time('DATA');
    const aData: PlaceLabelDataI[] = [
      {
        ...data,
        qr_data: qrData,
      },
    ];
    console.timeEnd('DATA');
    console.log('Количество наклеек на печать :>> ', aData.length);

    // Сформировать PDF
    console.time('PDF');
    const outFilePath = this.generatePdfListPlaceLabel58x40(aData);
    console.timeEnd('PDF');
    console.log('Путь к выходному файлу :>> ', outFilePath);

    // Напечатать
    console.time('PRINTING');
    await NodePdfPrinter.printFiles([path.resolve(outFilePath)], 'MPRINT LP58 LABEL EVA');
    console.timeEnd('PRINTING');

    fs.unlinkSync(path.resolve(outFilePath));

    console.log('END\n');
  }

  /**
   * Сгенерировать QR
   */
  async generateQr(data: string, qrWidthPx: number): Promise<string> {
    const qrData = await QRCode.toDataURL(data, {
      margin: 0, // Отступы QR
      width: qrWidthPx, // Ширина в px
    });

    return qrData;
  }

  /**
   * Сгенерировать ПДФ со списком наклеек orders box 58x60
   */
  public generatePdfListOrdersBoxLabel58x60(data: OrdersBoxLabelDataI[]) {
    // Создать папку для выходных файлов
    const outDirPath = './out/';
    if (!fs.existsSync(outDirPath)) {
      fs.mkdirSync(outDirPath);
    }

    // Размеры в пунктах
    const ptWidth = 58 / 0.352777778;
    const ptHeight = 60 / 0.352777778;
    const ptMargin = 1.5 / 0.352777778;
    /** Максимальная длина строки (использовать моно шрифты!!!) */
    const maxStringLength = 21;

    /** Параметры для ПДФ */
    const pdfOptions: PDFKit.PDFDocumentOptions = {
      size: [ptWidth, ptHeight],
      margins: {
        top: 0,
        bottom: 0,
        left: ptMargin,
        right: ptMargin,
      },
    };

    const doc = new PDFDocument(pdfOptions);

    const fileName = md5(uuid4()) + '.pdf';
    doc.pipe(fs.createWriteStream(outDirPath + fileName));

    doc.font('./fonts/RobotoMono-Regular.ttf').fontSize(10);

    for (let i = 0; i < data.length; i++) {
      const warehouse_zone = data[i].pvz_place ? `${data[i].pvz_place.slice(0, 4)} ` : '*';
      // Заменяем запятые без пробелов, на запятые с пробелами, чтобы работал перенос
      const purchase_name = data[i].purchase_name.replace(/,/g, ', ');
      // Ежели, длинна названия закупки не хватает для переноса на вторую строку, добавляем есчо 2 символа
      const purchase_name_spaces = purchase_name.length < 26 ? purchase_name.padEnd(28) : purchase_name;
      if (!data[i].pvz_place) {
        console.error(`
        **********
        !!! Не назначена зона !!!
        **********
        `);
      }
      // Имя пользователя
      doc.font('./fonts/RobotoMono-Bold.ttf').text(data[i].customer_username.substr(0, maxStringLength), {
        align: 'center',
      });

      // ФИО
      doc.font('./fonts/RobotoMono-Regular.ttf').text(data[i].customer_fullname.substr(0, maxStringLength), {
        align: 'center',
      });

      // Номер коробки
      doc.font('./fonts/RobotoMono-Bold.ttf').text(data[i].orders_box_id);

      // Номер заказа
      doc.font('./fonts/RobotoMono-Bold.ttf').text(data[i].invoice_number);

      // Ник организатора
      doc.font('./fonts/RobotoMono-Regular.ttf').text(data[i].org_username.substr(0, 20), { width: 27 / 0.352777778 });

      // Горизонтальная линия 1
      doc
        .moveTo(ptMargin, 38.5 / 0.352777778)
        .lineTo(28 / 0.352777778, 38.5 / 0.352777778)
        .stroke();

      // Наименование закупки
      doc.text(purchase_name_spaces.slice(0, maxStringLength + 17), ptMargin, 39 / 0.352777778, {
        height: 30,
      });

      // Горизонтальная линия 2
      doc
        .moveTo(ptMargin, 49 / 0.352777778)
        .lineTo((58 - 1.5) / 0.352777778, 49 / 0.352777778)
        .stroke();

      // Наименование ПВЗ и место
      doc
        .font('./fonts/RobotoMono-Bold.ttf')
        .text(warehouse_zone, { continued: true, height: 30 })
        .font('./fonts/RobotoMono-Bold.ttf')
        .text(data[i].pvz_name.slice(0, maxStringLength + 17));

      // QR
      // Данные кода / отступ слева / отступ сверху
      // doc.image(data[i].qr_data, 29 / 0.352777778, 11 / 0.352777778);
      doc.image(data[i].qr_data, 28 / 0.352777778, 10 / 0.352777778);

      if (i < data.length - 1) {
        doc.addPage(pdfOptions);
      }
    }

    doc.end();

    return outDirPath + fileName;
  }

  /**
   * Сгенерировать ПДФ для списка delivery box
   */
  generatePdfListDeliveryBoxLabel58x40(data: DeliveryBoxLabelDataI[]) {
    // Создать папку для выходных файлов
    const outDirPath = './out/';
    if (!fs.existsSync(outDirPath)) {
      fs.mkdirSync(outDirPath);
    }

    // Размеры в пунктах
    const ptWidth = 58 / 0.352777778;
    const ptHeight = 40 / 0.352777778;
    const ptMargin = 1.5 / 0.352777778;
    /** Максимальная длина строки (использовать моно шрифты!!!) */
    const maxStringLength = 21;

    /** Параметры для ПДФ */
    const pdfOptions: PDFKit.PDFDocumentOptions = {
      size: [ptWidth, ptHeight],
      margins: {
        top: 0,
        bottom: 0,
        left: ptMargin,
        right: ptMargin,
      },
    };

    const doc = new PDFDocument(pdfOptions);

    const fileName = md5(uuid4()) + '.pdf';
    doc.pipe(fs.createWriteStream(outDirPath + fileName));

    doc.font('./fonts/RobotoMono-Regular.ttf').fontSize(12);

    for (let i = 0; i < data.length; i++) {
      // Наименование ПВЗ (заложено две строки)
      doc.text(data[i].destination_pvz_name?.substr(0, 2 * maxStringLength), {
        align: 'center',
        underline: true,
      });

      // ID мешка
      doc.text(data[i].delivery_box_id.toString(), {
        width: 27 / 0.352777778,
        underline: true,
      });

      // Координаты QR
      let x = 28 / 0.352777778;
      let y = 7 / 0.352777778;
      // Двигаем QR ниже, если наименование ПВЗ не укладывается
      // в одну строку
      if (data[i].destination_pvz_name.length > 21) {
        y = 11.5 / 0.352777778;
      }
      doc.image(data[i].qr_data, x, y);

      if (i < data.length - 1) {
        doc.addPage(pdfOptions);
      }
    }

    doc.end();

    return outDirPath + fileName;
  }

  /**
   * Сгенерировать ПДФ для возвратной тары
   */
  async generatePdfReturnablePackaging40x58(data: ReturnablePackageDataI[]) {
    // Создать папку для выходных файлов
    const outDirPath = './out/';
    if (!fs.existsSync(outDirPath)) {
      fs.mkdirSync(outDirPath);
    }

    // Размеры в пунктах
    const ptWidth = 40 / 0.352777778;
    const ptHeight = 58 / 0.352777778;
    const ptMargin = 1.5 / 0.352777778;
    const cwidth = 10 / 0.352777778;
    /** Максимальная длина строки (использовать моно шрифты!!!) */

    /** Параметры для ПДФ */
    const pdfOptions: PDFKit.PDFDocumentOptions = {
      size: [ptWidth, ptHeight],
      margins: {
        top: 0,
        bottom: 0,
        left: ptMargin,
        right: ptMargin,
      },
    };

    const doc = new PDFDocument(pdfOptions);

    const fileName = md5(uuid4()) + '.pdf';
    doc.pipe(fs.createWriteStream(outDirPath + fileName));

    doc.font('./fonts/RobotoMono-Regular.ttf').fontSize(12);

    for (let i = 0; i < data.length; i++) {
      // Наименование ПВЗ (заложено две строки)

      // ID мешка
      doc.text(data[i].returnable_package_id?.toString(), {
        width: ptWidth,
        height: ptHeight / 4,
        underline: true,
      });

      // Координаты QR
      const x = 2 / 0.352777778;
      const y = 21 / 0.352777778;

      const qrCode = await this.generateQRWithCenterIcon(
        data[i].url,
        'data:image/png;base64,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',
        ptWidth,
        cwidth,
      );
      // doc.image(data[i].qr_data, x, y);
      doc.image(qrCode, x, y, { width: 35 / 0.352777778, height: 35 / 0.352777778 });

      if (i < data.length - 1) {
        doc.addPage(pdfOptions);
      }
    }

    doc.end();

    return outDirPath + fileName;
  }

  /**Сгенерировать QR-код с изображением в центре*/
  async generateQRWithCenterIcon(urlForQRcode: string, center_image: string, width: number, cwidth: number) {
    const canvas = createCanvas(width, width);
    QRCode.toCanvas(canvas, urlForQRcode, {
      errorCorrectionLevel: 'H',
      margin: 0,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
    const ctx = canvas.getContext('2d');
    const img = await loadImage(center_image);
    const center = (canvas.width - cwidth) / 2;
    ctx.drawImage(img, center, center, cwidth, cwidth);
    return canvas.toDataURL('image/png');
  }

  /**
   * Сгенерировать ПДФ со списком наклеек мест 58x40
   */
  generatePdfListPlaceLabel58x40(data: PlaceLabelDataI[]) {
    // Создать папку для выходных файлов
    const outDirPath = './out/';
    if (!fs.existsSync(outDirPath)) {
      fs.mkdirSync(outDirPath);
    }

    // Размеры в пунктах
    const ptWidth = 58 / 0.352777778;
    const ptHeight = 40 / 0.352777778;
    const ptMargin = 1.5 / 0.352777778;
    /** Максимальная длина строки (использовать моно шрифты!!!) */
    const maxStringLength = 21;

    /** Параметры для ПДФ */
    const pdfOptions: PDFKit.PDFDocumentOptions = {
      size: [ptWidth, ptHeight],
      margins: {
        top: 0,
        bottom: 0,
        left: ptMargin,
        right: ptMargin,
      },
    };

    const doc = new PDFDocument(pdfOptions);

    const fileName = md5(uuid4()) + '.pdf';
    doc.pipe(fs.createWriteStream(outDirPath + fileName));

    doc.font('./fonts/RobotoMono-Regular.ttf').fontSize(12);

    for (let i = 0; i < data.length; i++) {
      const sPlaceName = data[i].place_name?.substr(0, 2 * maxStringLength)
        .split(' ')
        .join('\u00A0');
      doc.text(sPlaceName, {
        align: 'center',
        underline: true,
      });

      doc.image(data[i].qr_data, {
        fit: [55 / 0.352777778, 27 / 0.352777778],
        align: 'center',
      });

      if (i < data.length - 1) {
        doc.addPage(pdfOptions);
      }
    }

    doc.end();

    return outDirPath + fileName;
  }
}
