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
      doc.text(data[i].destination_pvz_name.substr(0, 2 * maxStringLength), {
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
    const cwidth = 12 / 0.352777778;
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
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC8AAAApCAYAAAClfnCxAAAACXBIWXMAAA7EAAAOxAGVKw4bAAABhUlEQVRYhe2YMY6FIBRFL5OpiIt2KSzBBZBgbeMStNRKG0rCVJgJA4J+QP1/TkIjIEd4PFSitdZ4KF9XC7zC+8u3bQtCSLEyjmOcvQ4wDIMGULzEEGx15GYpUEppAFoIEWxLtN7PNoQQSClBKY1bygQQQgAAAbX9mGeMAUBRcQBQSgEA1nXdb7i3LFVV6a7rkoTDURARrt7avu+LxrqNif1lWbxtvHYANGMsi1gsodl31pj0KKXMJhaDEGJX3pltYnd7CfZcvNlGSpnP6ACcc3+lvRR1XV9yooYK5zwcNmaZ7ogdOt+xDa/EN6Hv/0p8Vz5b/uwGT5EYXpI3AkdFzvazOS1vBjaHWazI2X4uTsnP87wJUEo3kbZts/Tz4c3zIaZp2j5SKKWYpilrPxfeE/aOh5Tt9Nmp8kqSy5sfR6FrKUguL4RwXm+aJvVQeTasa5ZT3K/IhrUHyZW5Tuf5ECVS7X+2uYpHy3tj/s4f4oY/M3+nd5rfuLycM3/XB7B5dMw/Wv4HlXm0Y2bnxREAAAAASUVORK5CYII=',
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
      const sPlaceName = data[i].place_name
        .substr(0, 2 * maxStringLength)
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
