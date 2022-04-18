import { Injectable } from '@nestjs/common';
import { PrintR } from './print.route';
import * as QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';
import * as md5 from 'md5';
import * as uuid4 from 'uuid4';
import * as NodePdfPrinter from 'node-pdf-printer';
import * as PDFDocument from 'pdfkit';
import { DeliveryBoxLabelDataI, OrdersBoxLabelDataI, PlaceLabelDataI } from './print.interface';

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
      doc.font('./fonts/RobotoMono-Regular.ttf').text(data[i].orders_box_id);

      // Номер заказа
      doc.font('./fonts/RobotoMono-Regular.ttf').text(data[i].invoice_number);

      // Ник организатора
      doc.font('./fonts/RobotoMono-Regular.ttf').text(data[i].org_username.substr(0, 20), { width: 27 / 0.352777778 });

      // Горизонтальная линия 1
      doc
        .moveTo(ptMargin, 38.5 / 0.352777778)
        .lineTo(28 / 0.352777778, 38.5 / 0.352777778)
        .stroke();

      // Наименование закупки
      doc.text(data[i].purchase_name.slice(0, maxStringLength + 17), ptMargin, 39 / 0.352777778, {
        link: '',
        // underline: true,
      });

      // doc.moveDown();

      // Горизонтальная линия 2
      doc
        .moveTo(ptMargin, 49 / 0.352777778)
        .lineTo((58 - 1.5) / 0.352777778, 49 / 0.352777778)
        .stroke();

      // Наименование ПВЗ и место
      doc
        .font('./fonts/RobotoMono-Bold.ttf')
        .text(warehouse_zone, { continued: true })
        .font('./fonts/RobotoMono-Regular.ttf')
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
