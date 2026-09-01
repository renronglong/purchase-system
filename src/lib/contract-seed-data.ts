// ============================================
// 购销合同模块种子数据
// ============================================

export interface ContractItem {
  id: string;
  code: string;
  name: string;
  spec: string;
  surface: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  remark: string;
}

export interface ContractData {
  id: string;
  contractNo: string;
  signDate: string;
  signPlace: string;
  customerName: string;
  customerAddress: string;
  customerContact: string;
  customerPhone: string;
  customerTaxNo: string;
  supplierName: string;
  supplierAddress: string;
  supplierContact: string;
  supplierPhone: string;
  supplierFax: string;
  supplierTaxNo: string;
  items: ContractItem[];
  paymentTerms: string;
  deliveryDays: string;
  deliveryPlace: string;
  deliveryMethod: string;
  remark: string;
}

export const contractSeedData: ContractData[] = [
  {
    id: 'ct1',
    contractNo: 'BL20260901',
    signDate: '2026-09-01',
    signPlace: '佛山市南海区',
    customerName: '东莞市百川慧通科技有限公司',
    customerAddress: '东莞市凤岗镇凤深大道1号永基工业园5栋103室',
    customerContact: '王淑红',
    customerPhone: '18503056541',
    customerTaxNo: '',
    supplierName: '佛山市碧利莱照明有限公司',
    supplierAddress: '佛山市南海区里水镇大冲象岗村250号之一',
    supplierContact: '龙任荣',
    supplierPhone: '18925938858',
    supplierFax: '0757-81097385',
    supplierTaxNo: '91440605MACGMXTJ3G',
    items: [
      { id: 'ci1', code: '', name: '电控箱', spec: '300*280*100', surface: '喷涂', quantity: 500, unit: '套', unitPrice: 78, amount: 500 * 78, remark: '' },
      { id: 'ci2', code: 'YL-397', name: '小边框', spec: '49.9*17.9*3000', surface: '砂银', quantity: 2000, unit: '条', unitPrice: 22.3, amount: 2000 * 22.3, remark: '' },
      { id: 'ci3', code: 'YL-396', name: '大边框', spec: '89.3*24.3*3000', surface: '砂银', quantity: 1000, unit: '条', unitPrice: 40, amount: 1000 * 40, remark: '' },
      { id: 'ci4', code: 'YL-054', name: '电源外壳', spec: '30*20*135', surface: '砂银', quantity: 5000, unit: '条', unitPrice: 1.2, amount: 5000 * 1.2, remark: '' },
      { id: 'ci5', code: 'BL-002', name: '小边框', spec: '9.2*52*3000', surface: '高光白', quantity: 2000, unit: '条', unitPrice: 22.5, amount: 2000 * 22.5, remark: '' },
    ],
    paymentTerms: '订金壹万元、余款到发货',
    deliveryDays: '15个工作日',
    deliveryPlace: '甲方公司所在地',
    deliveryMethod: '送货',
    remark: '',
  },
];
