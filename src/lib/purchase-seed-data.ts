// ============================================
// 采购单模块种子数据
// 2条测试采购单
// ============================================

import type { PurchaseOrder } from "./store";

export const seedPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'cg1',
    orderNo: 'CG-20260625-002',
    company: '佛山市质稳五金有限公司',
    supplierId: 's1',
    supplierName: '佛山市三水凤铝铝业有限公司',
    contact: '梁经理',
    phone: '15602822172',
    address: '佛山市三水区',
    orderDate: '2026-06-25',
    maker: '张仿',
    items: [
      {
        id: 'item1',
        productCode: '6063A-T5',
        productName: '铝型材',
        spec: '25.3*1.5',
        length: 6000,
        quantity: 530,
        unit: '支',
        weightPerMeter: 0.9426,
        totalWeight: 499.57,
        surfaceTreatment: '砂面银白',
        deliveryDate: '2026-07-02',
        remark: ''
      },
      {
        id: 'item2',
        productCode: '6063-T5',
        productName: '铝型材',
        spec: '20*1.2',
        length: 6000,
        quantity: 200,
        unit: '支',
        weightPerMeter: 0.65,
        totalWeight: 130,
        surfaceTreatment: '氧化雾银',
        deliveryDate: '2026-07-05',
        remark: '加急'
      }
    ],
    totalQuantity: 730,
    totalWeight: 629.57,
    createdAt: '2026-06-25T10:00:00.000Z',
    updatedAt: '2026-06-25T10:00:00.000Z'
  },
  {
    id: 'cg2',
    orderNo: 'CG-20260628-001',
    company: '佛山市碧利金属制品有限公司',
    supplierId: 's2',
    supplierName: '广东兴发铝业有限公司',
    contact: '王总',
    phone: '13800138000',
    address: '佛山市南海区',
    orderDate: '2026-06-28',
    maker: '易金兰',
    items: [
      {
        id: 'item3',
        productCode: '6061-T6',
        productName: '工业铝型材',
        spec: '30*30*2.0',
        length: 6000,
        quantity: 100,
        unit: '支',
        weightPerMeter: 1.2,
        totalWeight: 120,
        surfaceTreatment: '本色',
        deliveryDate: '2026-07-10',
        remark: ''
      }
    ],
    totalQuantity: 100,
    totalWeight: 120,
    createdAt: '2026-06-28T09:00:00.000Z',
    updatedAt: '2026-06-28T09:00:00.000Z'
  }
];
