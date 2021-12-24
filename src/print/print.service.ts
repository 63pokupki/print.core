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

const PRINTER_NAME = 'MPRINT LP58 LABEL EVA';

@Injectable()
export class PrintService {
  /**
   * Печать списка наклеек orders box
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
    await NodePdfPrinter.printFiles([path.resolve(outFilePath)], PRINTER_NAME);
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
    await NodePdfPrinter.printFiles([path.resolve(outFilePath)], PRINTER_NAME);
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
    await NodePdfPrinter.printFiles([path.resolve(outFilePath)], PRINTER_NAME);
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
    await NodePdfPrinter.printFiles([path.resolve(outFilePath)], PRINTER_NAME);
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

    for (let i = 0; i < data.length; i++) {
      doc.font('./fonts/RobotoMono-Regular.ttf').fontSize(12);

      // Имя пользователя
      doc.text(data[i].customer_username.slice(0, maxStringLength), {
        align: 'center',
      });

      // ФИО
      doc.text(data[i].customer_fullname.slice(0, maxStringLength), {
        align: 'center',
      });

      // Номер коробки
      doc.text(data[i].orders_box_id);

      // Номер заказа
      doc.text(data[i].invoice_number);

      // Ник организатора
      const org_username: string = replacer(data[i].org_username, 30);
      doc.text(org_username, { width: 27 / 0.352777778 });

      // Наименование закупки
      const purchase_name: string = replacer(data[i].purchase_name, 2 * maxStringLength);
      doc.text(purchase_name);

      // Наименование ПВЗ
      const pvz_name: string = replacer(data[i].pvz_name, maxStringLength);
      doc.font('./fonts/RobotoMono-Bold.ttf').fontSize(12);
      doc.text(pvz_name);

      // Горизонтальная линия 1
      doc
        .moveTo(ptMargin, 38.5 / 0.352777778)
        .lineTo(28 / 0.352777778, 38.5 / 0.352777778)
        .stroke();

      // Горизонтальная линия 2
      doc
        .moveTo(ptMargin, 51 / 0.352777778)
        .lineTo((58 - 1.5) / 0.352777778, 51 / 0.352777778)
        .stroke();

      // QR
      doc.image(data[i].qr_data, 29 / 0.352777778, 11 / 0.352777778);

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

/** Замена символов и обрезка */
const replacer = (s: string, n?: number) => {
  let newS = s
    // Заменить пробелы на неразрывные пробелы
    .split(' ')
    .filter((el) => el)
    .join('\u00A0')
    // Заменить тире на неразрывный похожий знак ()
    .split('-')
    .filter((el) => el)
    .join('\u2212');

  if (n) {
    // Обрезать
    newS = newS.slice(0, n);
  }

  return newS;
};
