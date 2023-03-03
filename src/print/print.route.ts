import { DeliveryBoxLabelI, OrdersBoxLabelI } from './print.interface';

export namespace PrintR {
  /**
   * Печать списка наклеек orders box
   */
  export namespace printListOrdersBoxLabel {
    export const route = '/print-list-orders-box-label';

    export interface RequestI {
      list_orders_box_label: OrdersBoxLabelI[];
    }
  }

  /**
   * Печать наклейки delivery box 58x40
   */
  export namespace printDeliveryBoxLabel58x40 {
    export const route = '/delivery-box-label-58-40';

    export interface RequestI {
      url: string;
      delivery_box_id: number;
      destination_pvz_name: string;
    }
  }

  /**
   * Печать списка наклеек delivery box 58x40
   */
  export namespace printListDeliveryBoxLabel58x40 {
    export const route = '/print-list-delivery-box-label-58-40';

    export interface RequestI {
      list_delivery_box_info: DeliveryBoxLabelI[];
    }
  }

  /**
   * Печать наклейки места 58x40
   */
  export namespace printPlaceLabel58x40 {
    export const route = '/place';

    export interface RequestI {
      url: string;
      place_name: string;
    }
  }

  /**
   * Печать кода для возвратной тары 58x40
   */
  export namespace printReturnablePackaging40x58 {
    export const route = '/print-returnable-packaging-40-58';

    export interface RequestI {
      url: string;
      returnable_package_id: string;
    }
  }
}
