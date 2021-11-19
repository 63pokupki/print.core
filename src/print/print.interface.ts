/** Наклейка orders box */
export interface OrdersBoxLabelI {
  invoice_number: string; // Номер заказа
  url: string; // URL для QR
  customer_username: string; // Ник получателя
  customer_fullname: string; // ФИО получателя
  purchase_name: string; // Наименование закупки
  pvz_name: string; // Наименование ПВЗ
  orders_box_id: string; // Номер коробки
  org_username: string; // Ник организатора
}

export interface DeliveryBoxLabelI {
  url: string;
  destination_pvz_name: string;
  delivery_box_id: number;
}

export interface PlaceLabelI {
  url: string;
  place_name: string;
}

export interface QrDataI {
  qr_data: string;
}

export type OrdersBoxLabelDataI = OrdersBoxLabelI & QrDataI;
export type DeliveryBoxLabelDataI = DeliveryBoxLabelI & QrDataI;
export type PlaceLabelDataI = PlaceLabelI & QrDataI;
