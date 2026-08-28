// ============================================
// 送货单模块种子数据 - 从Excel真实导入
// 50家客户、455条送货产品、164张送货单
// ============================================

export interface DeliveryCustomer {
  id: string;
  name: string;
  address: string;
  contact: string;
  phone: string;
  taxNo: string;
  legalPerson: string;
  email: string;
  paymentTerms: string;
}

export const deliveryCustomers: DeliveryCustomer[] = [
  { id: 'dc1', name: '广东中为导光科技有限公司', address: '中山市港口镇西街路41号二楼仓库', contact: '朱新果', phone: '0760-88498121', taxNo: '914420007962856889', legalPerson: '', email: '', paymentTerms: '现金' },
  { id: 'dc2', name: '深圳市卓仪光电科技有限公司', address: '深圳市龙华区福城街道福民社区福前路96号A栋807厂房', contact: '韦彩艳', phone: '13714621831', taxNo: '', legalPerson: '', email: '', paymentTerms: '现金' },
  { id: 'dc3', name: '珠海市明庆电子有限分司', address: '金鼎科技园金峰西路17号302 B', contact: '曾复招', phone: '13112378734', taxNo: '', legalPerson: '', email: '', paymentTerms: '' },
  { id: 'dc4', name: '珠海市启阳电子有限公司', address: '中山市三乡镇鸦岗三洲工业大街一巷4号二区六楼', contact: '吴朱启', phone: '13326678096', taxNo: '914404003151658460', legalPerson: '', email: '', paymentTerms: '现金' },
  { id: 'dc5', name: '深圳市科录科技有限公司', address: '深圳市福田区梅林街道梅都社区中康路128号卓越梅林中心广场(北区)2号楼701B10', contact: '王淑红', phone: '18503056541', taxNo: '91440300MA5EDU7L8H', legalPerson: '欧阳华', email: '764161155@qq.com', paymentTerms: '首付50%余款月结30天' },
  { id: 'dc6', name: '德铭', address: '', contact: '刘时刚', phone: '', taxNo: '', legalPerson: '', email: '', paymentTerms: '现金' },
  { id: 'dc7', name: '深圳市凯明节能设备有限公司', address: '石岩镇应人石社区创见工业园A栋2楼', contact: '苏小姐', phone: '15323832391', taxNo: '', legalPerson: '', email: '', paymentTerms: '' },
  { id: 'dc8', name: '江门光显电子有限公司', address: '江门市江海区科苑西路2号3栋四楼自编3#厂房', contact: '黄先生', phone: '15118067402', taxNo: '91440704MA51YXDT26', legalPerson: '', email: '', paymentTerms: '' },
  { id: 'dc9', name: '东莞市裕洋钣金制品有限公司', address: '广东省东莞市樟木头镇樟木头东城路1号112', contact: '李伟霞', phone: '13534090890', taxNo: '', legalPerson: '', email: '', paymentTerms: '月结30天' },
  { id: 'dc10', name: '东方一号电子有限公司', address: '广东佛山顺德勒流富安工业区七区富兴一路12-1-4', contact: '任东', phone: '13424395051', taxNo: '', legalPerson: '', email: '', paymentTerms: '现金' },
  { id: 'dc11', name: '深圳市欧恩半导体照明有限公司', address: '深圳市宝安区福海街道新和社区工业南路51号', contact: '张琪', phone: '17607551145', taxNo: '914403005571604155', legalPerson: '', email: '', paymentTerms: '月结' },
  { id: 'dc12', name: '东莞市博旺光电有限公司', address: '广东省 东莞市 常平镇 土塘村第一工业区诚兴工业园1栋101', contact: '刘宇', phone: '18145877032', taxNo: '', legalPerson: '', email: '', paymentTerms: '月结30天' },
  { id: 'dc13', name: '萍乡市博旺实业有限公司', address: '江西省萍乡市芦溪县芦溪工业园伟德实业园内', contact: '曾小姐', phone: '18145874412', taxNo: '', legalPerson: '', email: '', paymentTerms: '月结30天' },
  { id: 'dc14', name: '深圳市乐家乐建筑材料有限公司', address: '深圳市福田区香蜜湖街道竹林社区金众街2号益华综合楼A栋B栋3层-三楼A11号', contact: '李萍', phone: '18028789343', taxNo: '91440300697126083F', legalPerson: '', email: '', paymentTerms: '现金' },
  { id: 'dc15', name: '珠海华炬科技有限公司', address: '珠海市南屏科技园屏东四路五号', contact: '李小姐', phone: '0756-8698139', taxNo: '', legalPerson: '', email: '', paymentTerms: '' },
  { id: 'dc16', name: '江苏镭科照明科技有限公司', address: '盐城市盐都区盐龙街道世钟路1166号', contact: '徐小姐', phone: '', taxNo: '', legalPerson: '', email: '', paymentTerms: '' },
  { id: 'dc17', name: '周祥好', address: '浙江省台州市椒江区前所街道新建街36号', contact: '周祥好', phone: '13857684518', taxNo: '', legalPerson: '', email: '', paymentTerms: '现金' },
  { id: 'dc18', name: '飞科光电有限公司', address: '外海镇金溪工业区冠盈工业园二楼', contact: '梁颖', phone: '18902887867', taxNo: '', legalPerson: '', email: '', paymentTerms: '' },
  { id: 'dc19', name: '深圳华唐锐照明电器有限公司', address: '深圳市南山区西丽镇麻勘路27号7栋南面4楼401-1', contact: '许菲', phone: '18898756270', taxNo: '', legalPerson: '', email: '', paymentTerms: '月结' },
  { id: 'dc20', name: '珠海绿美能电子科技有限公司', address: '珠海市南屏科技工业园屏西五路3号厂房二楼B1', contact: '万真钦', phone: '13751852989', taxNo: '91440400555599790A', legalPerson: '黄映鹏', email: '907623919@qq.com', paymentTerms: '月结30天' },
  { id: 'dc21', name: '深圳美因联电子有限公司', address: '广东省深圳市龙华区观澜街道库坑水围村60号三楼', contact: '张先生', phone: '13570858168', taxNo: '', legalPerson: '', email: '', paymentTerms: '' },
  { id: 'dc22', name: '浙江浦江逸晨母婴用品有限公司', address: '浙江省金华市东阳市南市街道沧江工业区献华木雕厂内', contact: '甘旭', phone: '18657916318', taxNo: '', legalPerson: '', email: '', paymentTerms: '现金' },
  { id: 'dc23', name: '珠海金逸电子科技有限公司', address: '珠海市高新区唐家湾镇科技一路6号一楼6B102室', contact: '汪辉', phone: '13250078818', taxNo: '', legalPerson: '', email: '', paymentTerms: '' },
  { id: 'dc24', name: '深圳富达金技术有限公司', address: '坪山镇汤坑村二路39号', contact: '', phone: '', taxNo: '', legalPerson: '', email: '', paymentTerms: '' },
  { id: 'dc25', name: '东莞市帝旺电器有限公司', address: '广东省东莞市横沥镇恒泉路395号4号楼202室', contact: '杨长发（先生）', phone: '13829935209', taxNo: '91441900MADON97A7G', legalPerson: '', email: '', paymentTerms: '' },
  { id: 'dc26', name: '深圳明仕达电源技术有限公司', address: '深圳观澜黎光村中南港工业\n城G栋5楼', contact: '向岩香', phone: '18162986063', taxNo: '', legalPerson: '', email: '', paymentTerms: '现金' },
  { id: 'dc27', name: '偃师市芯瑞能电子科技有限公司', address: '', contact: '', phone: '', taxNo: '', legalPerson: '', email: '', paymentTerms: '' },
  { id: 'dc28', name: '重庆固高科技长江研究院有限公司', address: '重庆市永川区凤凰湖工业园电子五小区1栋一楼', contact: '苏茜', phone: '17353296600', taxNo: '', legalPerson: '', email: '', paymentTerms: '' },
  { id: 'dc29', name: '深圳市巨磁王科技有限责任公司', address: '深圳市宝安区福永街道白石厦东区美华路68号同心工业园A栋3楼', contact: '', phone: '0755-23725116', taxNo: '', legalPerson: '胡春芳', email: '', paymentTerms: '现金' },
  { id: 'dc30', name: '东莞市莱斯特电源科技有限公司', address: '东莞市黄江镇长洞街23号304室', contact: '', phone: '18098978049', taxNo: '', legalPerson: '何国禄', email: '', paymentTerms: '月结30天' },
  { id: 'dc31', name: '深圳市艾尔依蒂照明电器有限公司', address: '深圳市宝安区福永镇塘尾福源工业区2栋', contact: '尹小姐', phone: '0755-27303850', taxNo: '', legalPerson: '', email: '', paymentTerms: '' },
  { id: 'dc32', name: '深圳富锐吉智能科技有限公司', address: '深圳市坪山区碧岭街道汤坑社区汤坑二路39\n号富达金厂第七栋408', contact: '李先生', phone: '0755-84635699', taxNo: '91440300MA5H44UC37', legalPerson: '', email: '', paymentTerms: '货到7天' },
  { id: 'dc33', name: '丁先生', address: '佛山市南侧海区里水镇', contact: '', phone: '', taxNo: '', legalPerson: '', email: '', paymentTerms: '' },
  { id: 'dc34', name: '深圳市科普睿电子有限公司', address: '广东省 深圳市 光明区 光明街道', contact: '张紫菡', phone: '18938941906', taxNo: '', legalPerson: '', email: '', paymentTerms: '' },
  { id: 'dc35', name: '常州市阿波罗电光源有限公司', address: '广州市白云区石井庆丰广场C座306室', contact: '张建伟', phone: '15018770128', taxNo: '', legalPerson: '', email: '', paymentTerms: '' },
  { id: 'dc36', name: '广州凯佳电子有限公司', address: '广州市番禺区大石街会江江华路3号D栋501', contact: '杨程', phone: '13924150757/020-28988093', taxNo: '91440113304599358C', legalPerson: '', email: '', paymentTerms: '' },
  { id: 'dc37', name: '和鸿电气股份有限公司', address: '安徽省阜阳市颍泉区颖阳路6号', contact: '冯涛', phone: '13567775797', taxNo: '', legalPerson: '', email: '', paymentTerms: '现金' },
  { id: 'dc38', name: '江苏联康电子有限公司', address: '江苏省 宿迁市泗阳县珠海路', contact: '胡苗', phone: '193 0519 1550', taxNo: '', legalPerson: '', email: '', paymentTerms: '' },
  { id: 'dc39', name: '佛山市三水弘美电器配件有限公司', address: '佛山市三水区西南科技工业园创业1路10号', contact: '邓小姐', phone: '0757-87726993', taxNo: '', legalPerson: '', email: '', paymentTerms: '现金' },
  { id: 'dc40', name: '盛世', address: '', contact: '', phone: '', taxNo: '', legalPerson: '', email: '', paymentTerms: '' },
  { id: 'dc41', name: '凯明智汇科技（东莞）有限公司', address: '东莞市大朗镇松木山新永顺科技园4栋6楼', contact: '孙春香', phone: '15323832391', taxNo: '', legalPerson: '', email: '', paymentTerms: '现金' },
  { id: 'dc42', name: '惠州市子阳光电照明有限公司', address: '惠州市惠阳区大亚湾龙海三路西区三小附近日上光电产业园A栋2楼', contact: '刘健平', phone: '15970933060', taxNo: '', legalPerson: '', email: '', paymentTerms: '' },
  { id: 'dc43', name: '开普勒灯具', address: '河北省保定竟秀区南奇乡隆兴路与西堤路交叉口向南1000米路东', contact: '田鹏飞', phone: '13171690616', taxNo: '', legalPerson: '', email: '', paymentTerms: '现金' },
  { id: 'dc44', name: '东莞市百川慧通科技有限公司', address: '地址东莞市凤岗镇凤深大道1号永基工业园5栋103室', contact: '王淑红', phone: '18503056541', taxNo: '', legalPerson: '', email: '', paymentTerms: '首付50%款到发货' },
  { id: 'dc45', name: '江门深华港湾照明有限公司', address: '广东省江门市江海区龙溪路319号3栋9F', contact: '张先生', phone: '0750-3499443', taxNo: '', legalPerson: '', email: '', paymentTerms: '月结30天' },
  { id: 'dc46', name: '玖嘉久电子科技', address: '广东 佛山 顺德区 北滘镇 涛汇家电园6栋804', contact: '罗斌鹏', phone: '18076604614', taxNo: '', legalPerson: '', email: '', paymentTerms: '' },
  { id: 'dc47', name: '佛山市奕旺照明科技有限公司', address: '', contact: '', phone: '', taxNo: '', legalPerson: '', email: '', paymentTerms: '' },
  { id: 'dc48', name: '刘先生', address: '', contact: '', phone: '', taxNo: '', legalPerson: '', email: '', paymentTerms: '' },
  { id: 'dc49', name: '廖先生', address: '', contact: '', phone: '', taxNo: '', legalPerson: '', email: '', paymentTerms: '' },
  { id: 'dc50', name: '合肥智测电子有限公司', address: '合肥市高新区香樟大道168号科技实业园D-7号楼', contact: '李小姐', phone: '0551-65334813', taxNo: '', legalPerson: '', email: '', paymentTerms: '首付50%款到发货' },
];

export interface DeliveryProduct {
  id: string;
  code: string;
  name: string;
  spec: string;
  surface: string;
  unit: string;
  weightPerMeter: number;
  unitPrice: number;
  customer: string;
}

export const deliveryProducts: DeliveryProduct[] = [
  { id: 'dp1', code: '4130131', name: '外壳', spec: 'L184*40*22mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 2.5, customer: '' },
  { id: 'dp2', code: '1.04.01.0096', name: 'Q2-45W端盖', spec: '47X29X13mm，Φ10', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp3', code: 'ZWLP1516x170x15ARGB-2', name: '', spec: '1416*10*12.9', surface: '', unit: '1416', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp4', code: 'ZWLP900x112x6ARGB', name: '铝条', spec: '12.9*10*900', surface: '', unit: '650', weightPerMeter: 28, unitPrice: 18.2, customer: '' },
  { id: 'dp5', code: '02.03.01.02.0107', name: '600W10V铝外壳输入侧盖', spec: '122.4*58.4*15T1.5mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp6', code: '02.03.01.02.0113', name: '600W铝外壳上盖(灰色)', spec: '230*122.4*7.05mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp7', code: '02.03.01.02.0114', name: '600W铝外壳下壳(灰色) 主体', spec: '230*122.4*51.6mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp8', code: '02.03.01.02.0115', name: '600W10V铝外壳输出侧盖', spec: '122.4*58.4*15T1.5mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp9', code: '1.04.01.0096', name: 'Q2-45W端盖', spec: '47X29X13mm，Φ10', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '深圳华唐锐照明电器有限公司' },
  { id: 'dp10', code: '1.04.01.0097', name: 'Q2-45W端盖', spec: '47X29X13mm，Φ7.4', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '深圳华唐锐照明电器有限公司' },
  { id: 'dp11', code: '1.04.01.0135', name: 'TODAY 40W端盖', spec: '47X29X13mmΦ10', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '深圳华唐锐照明电器有限公司' },
  { id: 'dp12', code: '1.04.01.0136', name: 'TODAY 40W端盖', spec: '47X29X13mmΦ7.4', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '深圳华唐锐照明电器有限公司' },
  { id: 'dp13', code: '1.04.01.0158.0001', name: 'today 30W电源壳体', spec: '46.6X29X102.5mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '深圳华唐锐照明电器有限公司' },
  { id: 'dp14', code: '1.04.01.0159. 0001', name: 'today 30W电源壳体', spec: '46.6X29X102.5mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '深圳华唐锐照明电器有限公司' },
  { id: 'dp15', code: '1.04.01.1099. 9902', name: 'IGUASSU支架端盖-1', spec: '42.4*47.9*2.0', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '深圳华唐锐照明电器有限公司' },
  { id: 'dp16', code: '1.04.01.1100. 9902', name: 'IGUASSU支架端盖-2', spec: '42.4*47.9*2.0', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '深圳华唐锐照明电器有限公司' },
  { id: 'dp17', code: '1.04.01.1101.0001', name: 'IGUASSU散热器-600', spec: '573*23.5*11.3', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '深圳华唐锐照明电器有限公司' },
  { id: 'dp18', code: '1.04.01.1102. 9901', name: 'IGUASSU支架-600', spec: '496*48*43', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '深圳华唐锐照明电器有限公司' },
  { id: 'dp19', code: '1.04.01.1103. 9901', name: 'IGUASSU双灯主体-600', spec: '595.5*166*43', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '深圳华唐锐照明电器有限公司' },
  { id: 'dp20', code: '1.04.01.1110. 0001', name: 'TURBO-40-600-\n型材', spec: 'φ 37X21.5X540m', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '深圳华唐锐照明电器有限公司' },
  { id: 'dp21', code: '1.04.01.1111. 0001', name: 'TURBO-40-900-\n型材', spec: 'φ 37X21.5X840m', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '深圳华唐锐照明电器有限公司' },
  { id: 'dp22', code: '1.04.01.1112. 0001', name: 'TURBO-40-1200-\n型材', spec: 'φ 37X21.5X1140m', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '深圳华唐锐照明电器有限公司' },
  { id: 'dp23', code: '1.04.01.1113. 0001', name: 'TURBO-40-1500-\n型材', spec: 'φ 37X21.5X1440m', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '深圳华唐锐照明电器有限公司' },
  { id: 'dp24', code: '1.04.01.1114. 0001', name: 'TURBO-75-600-型材', spec: 'φ 70.8X34.2X540mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '深圳华唐锐照明电器有限公司' },
  { id: 'dp25', code: '1.04.01.1115. 0001', name: 'TURBO-75-900-型材', spec: 'φ 70.8X34.2X840mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '深圳华唐锐照明电器有限公司' },
  { id: 'dp26', code: '1.04.01.1116. 0001', name: 'TURBO-75-1200-型材', spec: 'φ 70.8X34.2X1140mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '深圳华唐锐照明电器有限公司' },
  { id: 'dp27', code: '1.04.01.1117. 0001', name: 'TURBO-75-1500-型材', spec: 'φ 70.8X34.2X1440mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '深圳华唐锐照明电器有限公司' },
  { id: 'dp28', code: '1.04.01.1128. 9903', name: 'IGUASSU单灯主体端盖-1', spec: '42.4*99.5*2.0', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '深圳华唐锐照明电器有限公司' },
  { id: 'dp29', code: '1.04.01.1129. 9903', name: 'IGUASSU单灯主体端盖-2', spec: '42.4*99.5*2.0', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '深圳华唐锐照明电器有限公司' },
  { id: 'dp30', code: '1.04.01.1130. 9901', name: 'IGUASSU主体600-Ⅰ', spec: '595.5*116*43', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '深圳华唐锐照明电器有限公司' },
  { id: 'dp31', code: '1.04.01.1197. 9901', name: 'IGUASSU双灯主体端盖-1', spec: '42.4*149.2*2.0', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '深圳华唐锐照明电器有限公司' },
  { id: 'dp32', code: '1.04.01.1198. 9901', name: 'IGUASSU双灯主体端盖-2', spec: '42.4*149.2*2.0', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '深圳华唐锐照明电器有限公司' },
  { id: 'dp33', code: '1.04.01.1210. 9901', name: 'IGUASSU主体900-Ⅰ', spec: '895.5*116*43', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '深圳华唐锐照明电器有限公司' },
  { id: 'dp34', code: '1.04.01.1211. 9901', name: 'IGUASSU主体1200-Ⅰ', spec: '1195.5*116*43', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '深圳华唐锐照明电器有限公司' },
  { id: 'dp35', code: '1.04.01.1212. 9901', name: 'IGUASSU主体1800-Ⅰ', spec: '1795.5*116*43', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '深圳华唐锐照明电器有限公司' },
  { id: 'dp36', code: '1.04.01.1213. 9901', name: 'IGUASSU双灯主体-900', spec: '895.5*166*43', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '深圳华唐锐照明电器有限公司' },
  { id: 'dp37', code: '1.04.01.1214. 9901', name: 'IGUASSU双灯主体-1200', spec: '1195.5*166*43', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '深圳华唐锐照明电器有限公司' },
  { id: 'dp38', code: '1.04.01.1215. 9901', name: 'IGUASSU双灯主体-1800', spec: '1795.5*166*43', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '深圳华唐锐照明电器有限公司' },
  { id: 'dp39', code: '1.04.01.1216.0001', name: 'IGUASSU散热器-900', spec: '873*23.5*11.3', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '深圳华唐锐照明电器有限公司' },
  { id: 'dp40', code: '1.04.01.1217.0001', name: 'IGUASSU散热器-1200', spec: '1173*23.5*11.3', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '深圳华唐锐照明电器有限公司' },
  { id: 'dp41', code: '1.04.01.1218.0001', name: 'IGUASSU散热器-1800', spec: '1773*23.5*11.3', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '深圳华唐锐照明电器有限公司' },
  { id: 'dp42', code: '1.04.01.1219. 9901', name: 'IGUASSU支架-900', spec: '896*48*43', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '深圳华唐锐照明电器有限公司' },
  { id: 'dp43', code: '1.04.01.1220. 9901', name: 'IGUASSU支架-1200', spec: '1196*48*43', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '深圳华唐锐照明电器有限公司' },
  { id: 'dp44', code: '1.04.01.1221. 9901', name: 'IGUASSU支架-1800', spec: '1796*48*43', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '深圳华唐锐照明电器有限公司' },
  { id: 'dp45', code: '1.04.01.1260. 9901', name: '滑轨', spec: '60x23x6.3mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '深圳华唐锐照明电器有限公司' },
  { id: 'dp46', code: '1.04.01.1282.9901', name: 'IGUASSU支架端盖-1', spec: '42.4*1.8*47.9', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '深圳华唐锐照明电器有限公司' },
  { id: 'dp47', code: '1.04.01.1283.9901', name: 'IGUASSU支架端盖-2', spec: '42.4*1.8*47.9', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '深圳华唐锐照明电器有限公司' },
  { id: 'dp48', code: '12.5*6.1*16.7', name: '散热片', spec: '12.5*6.1*16.7', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp49', code: '12.5*6.1*20', name: '散热片', spec: '12.5*6.1*20', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp50', code: '1486-100', name: '散热器', spec: '21*100*2600', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp51', code: '2.03.04.343', name: 'M9P-灯体0.3米', spec: '64*22*247', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp52', code: '2.03.04.344', name: 'M9P-灯体0.4米', spec: '64*22*347', surface: '', unit: '', weightPerMeter: 0, unitPrice: 12.56, customer: '' },
  { id: 'dp53', code: '2.03.04.345', name: 'M9P-型材', spec: '64*22*547', surface: '', unit: '', weightPerMeter: 0, unitPrice: 18.32, customer: '' },
  { id: 'dp54', code: '2.03.04.446', name: 'M9P-灯体0.8米', spec: '64*22*747', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp55', code: '3001-1170', name: '吊柜上横板', spec: '554.2*111*24mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 31.76, customer: '' },
  { id: 'dp56', code: '3001-1172', name: '吊柜下横板', spec: '554.2*111*24mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 30.51, customer: '' },
  { id: 'dp57', code: '3001-1174', name: '吊柜左侧板', spec: '811*111*16.4mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 43, customer: '' },
  { id: 'dp58', code: '3001-1176', name: '吊柜右侧板', spec: '811*111*16.4mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 43, customer: '' },
  { id: 'dp59', code: '3001-1180', name: '柜门上下铝型板', spec: '582.94*66.64*4.5mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 10.66, customer: '' },
  { id: 'dp60', code: '3001-1182', name: '柜门左铝型板', spec: '806.94*66.64*4.5mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 19.02, customer: '' },
  { id: 'dp61', code: '3001-1184', name: '柜门右铝型板', spec: '806.94*66.64*4.5mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 12.77, customer: '' },
  { id: 'dp62', code: '5.5.000026', name: 'ZWLP880x343x4AW-铝合金', spec: '879.5*34.8*0.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp63', code: '5.5.000080', name: '铝条', spec: 'ZWLP443.2X58X3CW/57*10*9', surface: '氧化雾银', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp64', code: '5.5.000087', name: 'ZWLP950x159x4AW', spec: '948*34.8*0.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 6, customer: '' },
  { id: 'dp65', code: '5.5.000121', name: 'ZWLP950x112x6ARGB', spec: '12.9*10*950', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '950' },
  { id: 'dp66', code: '5.5.000122', name: 'ZWLP370x65x6ARGB', spec: '370*10*12.9mm', surface: '', unit: '370', weightPerMeter: 10, unitPrice: 3.7, customer: '' },
  { id: 'dp67', code: '5.5.000123', name: 'ZWLP1300x112x6ARGB', spec: '1300*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp68', code: '5.5.000124', name: 'ZWLP1010x112x6ARGB', spec: '1010*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp69', code: '5.5.000125', name: '铝条', spec: '12.9*10*440', surface: '', unit: '440', weightPerMeter: 4, unitPrice: 1.76, customer: '' },
  { id: 'dp70', code: '5.5.000126', name: '铝条', spec: '12.9*10*900', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp71', code: '5.5.000127', name: 'ZWLP1100x112x6ARGB', spec: '1100*10*12.9mm', surface: '', unit: '1100', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp72', code: '5.5.000128', name: 'ZWLP650x112x6BRGB', spec: '650*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp73', code: '5.5.000129', name: '铝条', spec: '12.9*10*875', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp74', code: '5.5.000130', name: 'ZWLP2030x112x6ARGB', spec: '12.9*10*2030', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '2030' },
  { id: 'dp75', code: '5.5.000131', name: '铝条', spec: '12.9*10*440', surface: '', unit: '440', weightPerMeter: 2, unitPrice: 0.88, customer: '' },
  { id: 'dp76', code: '5.5.000132', name: 'ZWLP730x90x6ARGB', spec: '730*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp77', code: '5.5.000133', name: 'ZWLP460x112x6ARGB', spec: '460*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '460' },
  { id: 'dp78', code: '5.5.000134', name: 'ZWLP515x435x6ARGB', spec: '515*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp79', code: '5.5.000135', name: 'ZWLP300x70x6ARGB', spec: '300*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp80', code: '5.5.000136', name: '铝条', spec: '12.9*10*740', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '740' },
  { id: 'dp81', code: '5.5.000140', name: 'ZWLP590x100x6ARGB', spec: '590*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp82', code: '5.5.000141', name: 'ZWLP450x442.1x6ARGB', spec: '250*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp83', code: '5.5.000142', name: 'ZWLP450x442.1x6ARGB', spec: '450*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp84', code: '5.5.000143', name: 'ZWLP1915x105x6ARGB', spec: '1840*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp85', code: '5.5.000144', name: 'ZWLP590x112x6BRGB', spec: '590*10*12.9mm', surface: '590', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp86', code: '5.5.000145', name: 'ZWLP300x45x6ARGB', spec: '300*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp87', code: '5.5.000146', name: 'ZWLP650x112x6ARGB', spec: '650*10*12.9mm', surface: '650', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp88', code: '5.5.000147', name: 'ZWLP380x343x6ARGB', spec: '380*10*12.9mm', surface: '380', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp89', code: '5.5.000148', name: 'ZWLP380x343x6ARGB', spec: '180*10*12.9mm', surface: '180', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp90', code: '5.5.000149', name: 'ZWLG740x165x6BRGB', spec: '736.4*10*12.9mm', surface: '736.4', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp91', code: '5.5.000150', name: 'ZWLG740x165x6BRGB', spec: '520.4*10*12.9mm', surface: '520.4', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp92', code: '5.5.000151', name: 'ZWLP596x165x6ARGB', spec: '596*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp93', code: '5.5.000152', name: 'ZWLP812x165x6ARGB-1', spec: '560.9* 10*12 9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp94', code: '5.5.000153', name: 'ZWLP812x165x6ARGB-2', spec: '812*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp95', code: '5.5.000154', name: 'ZWLP1460x165x6ARGB-1', spec: '560.86*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp96', code: '5.5.000155', name: 'ZWLP1460x165x6ARGB-2', spec: '1460*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp97', code: '5.5.000156', name: 'ZWL1300x100x33ARGB-侧边挡边-V1', spec: '100*33*2.0', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp98', code: '5.5.000156-3700', name: '100x33ARGB', spec: '100x33*3700', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp99', code: '5.5.000156-4000', name: '100x33ARGB', spec: '100x33*4000', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp100', code: '5.5.000157', name: 'ZWL700*100x33ARGB', spec: '100*33*700', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp101', code: '5.5.000158', name: 'ZWL600*100x33ARGB', spec: '100*33*600', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp102', code: '5.5.000162', name: 'ZWLP513x112x6ARGB', spec: '513*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp103', code: '5.5.000163', name: 'ZWLP380x81x6ARGB', spec: '380*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp104', code: '5.5.000164', name: 'ZWL500*100x33ARGB', spec: '100*33*500', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp105', code: '5.5.000178', name: 'ZWLP520x112x6ARGB', spec: '520*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp106', code: '5.5.000179', name: 'ZWLP380x102x6ARGB', spec: '380*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp107', code: '5.5.000180', name: 'ZWLP520x102x6ARGB', spec: '520*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp108', code: '5.5.000181', name: '铝条', spec: '12.9*10*2700', surface: '', unit: '', weightPerMeter: 0, unitPrice: 3.8, customer: '江门光显电子有限公司' },
  { id: 'dp109', code: '5.5.000182', name: 'ZWLP869.2x277x4AW-铝合金', spec: '869.2*34.8*0.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp110', code: '5.5.000183', name: 'ZWLP1255x215x4AW-铝合金', spec: '1254.7*34.8*09mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp111', code: '5.5.000184', name: 'ZWLP1885x215x4AW-铝合金', spec: '1884.7*34.8*0.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp112', code: '5.5.000185', name: 'ZWLP900x170x15ARGB', spec: '740*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp113', code: '5.5.000187', name: 'ZWLP300x135x6ARGB', spec: '300*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp114', code: '5.5.000188', name: 'ZWLP1562x50x15ARGB', spec: '1460*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp115', code: '5.5.000189', name: 'ZWLP1237x170x15ARGB-V2', spec: '1100*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp116', code: '5.5.000190', name: 'ZWLP756x170x15ARGB-1', spec: '668*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp117', code: '5.5.000191', name: 'ZWLP756x50x15ARGB', spec: '596*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp118', code: '5.5.000192', name: 'ZWLP756x170x15ARGB-2', spec: '524*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp119', code: '5.5.000193', name: 'ZWLF1180x351.2x4AW-V1铝合金', spec: '1179.8*34.8*0.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp120', code: '5.5.000194', name: 'WLF580x351.2x4AW-V1铝合金', spec: '579.8*34.8*0.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp121', code: '5.5.000198', name: '1071.5x170x15ARGB-铝条-1', spec: '543*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp122', code: '5.5.000199', name: '1136.5x170x15ARGB-铝条-2', spec: '1021*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp123', code: '5.5.000200', name: '1071.5x170x15BRGB铝条-1', spec: '554*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp124', code: '5.5.000201', name: '1010x170x15BRGB', spec: '882*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp125', code: '5.5.000202', name: '648x170x15ARGB', spec: '520*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp126', code: '5.5.000203', name: '1336x170x15ARGB', spec: '1208*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp127', code: '5.5.000204', name: '1071.5x170x15ARGB-铝条-2', spec: '956*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp128', code: '5.5.000205', name: '656x170x15ARGB-铝条', spec: '528*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp129', code: '5.5.000206', name: '1080x170x15ARGB', spec: '952*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp130', code: '5.5.000207', name: '668x170x15BRGB', spec: '540*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp131', code: '5.5.000209', name: 'ZWLP1792x170x15ARGB', spec: '1664*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp132', code: '5.5.000210', name: 'ZWLP400x100x33ARGB', spec: '400*100*33mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp133', code: '5.5.000214', name: 'ZWLP1050x112x6ARGB', spec: '1050*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp134', code: '5.5.000215', name: 'ZWLP370x112x6BRGB', spec: '370*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp135', code: '5.5.000216', name: 'ZWLP1450x395x4AW/0.9厚', spec: '1450*34.8*0.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 8.74, customer: '' },
  { id: 'dp136', code: '5.5.000217', name: 'ZWLP1300x112x6ARGB', spec: '12.9*10*1300', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp137', code: '5090000044-1', name: '主体', spec: '68*36*175', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp138', code: '5090000044-2', name: '盖板', spec: '68*6*175', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp139', code: '5090000044-3', name: '左端盖', spec: '68*40*13', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp140', code: '5090000044-4', name: '右端盖', spec: '68*40*13', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp141', code: '9150-0749', name: '新款F1支架_型材', spec: '36.9*10.5', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp142', code: '9150-1056', name: '铝型材1', spec: '53*70*2460', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp143', code: '9150-1058', name: '铝型材2', spec: '53*70*3070', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp144', code: 'A122-054-100铆钉', name: '拉管机壳', spec: '28.8*20.1*100', surface: '', unit: '', weightPerMeter: 0, unitPrice: 8.74, customer: '' },
  { id: 'dp145', code: 'A款堵头加工', name: '', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp146', code: 'BL-002', name: '小边框', spec: '9.2*52*3000', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp147', code: 'BL-021-3100', name: '主体', spec: '102*56*3100', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp148', code: 'BL-024-4000', name: '盖板', spec: '4.3*28*4000', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp149', code: 'BL-025-4000', name: '主体', spec: '17*26.3*4000', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp150', code: 'BL-029-01', name: '3000W侧防水垫', spec: '39.6*2*355.2', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp151', code: 'BL-029-02', name: '3000W防水垫', spec: '7*5.5*800', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp152', code: 'BL-029-03', name: '挂墙支架', spec: '56*50*95', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp153', code: 'BL-029-04', name: '主体机架', spec: '38*22*199', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp154', code: 'BL-029-1', name: '2000W端盖1', spec: '12.5*43.4*208.4', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp155', code: 'BL-029-120', name: '边框', spec: '40*18*120', surface: '', unit: '', weightPerMeter: 0, unitPrice: 2.1, customer: '' },
  { id: 'dp156', code: 'BL-029-1200', name: '4000W边框', spec: '40*18*1200', surface: '', unit: '', weightPerMeter: 0, unitPrice: 26.8, customer: '' },
  { id: 'dp157', code: 'BL-029-2', name: '2000W端盖2', spec: '12.5*43.4*208.4', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp158', code: 'BL-029-3', name: '2000W隔热板', spec: '185*5.5*600', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp159', code: 'BL-029-4', name: '2000W后壳', spec: '198*4.25*600', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp160', code: 'BL-029-5', name: '后壳', spec: '198*4.25*120', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp161', code: 'BL-029-6', name: '3000W端盖', spec: '12.5*43.4*359', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp162', code: 'BL-029-600', name: '2000W边框', spec: '40*18*600', surface: '', unit: '', weightPerMeter: 0, unitPrice: 16.3, customer: '' },
  { id: 'dp163', code: 'BL-029-7', name: '3000W隔热板', spec: '335*9*800', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp164', code: 'BL-029-8', name: '3000W后壳', spec: '348*4.25*800', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp165', code: 'BL-029-800', name: '3000W边框', spec: '40*18*800', surface: '', unit: '', weightPerMeter: 0, unitPrice: 20, customer: '' },
  { id: 'dp166', code: 'BL-029-9', name: '4000W后壳', spec: '198*4.25*1200', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp167', code: 'CT4-01-158', name: '散热器_(CT4-01)', spec: '86*66*158', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp168', code: 'CT4-01-515', name: '散热器_(CT4-01)', spec: '86*66*515', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp169', code: 'CT4-01-769', name: '散热器_(CT4-01)', spec: '86*66*769', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp170', code: 'CT4-02-31', name: '滑块_（CT4-02）', spec: '31*20*31', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp171', code: 'E240041', name: '拉布灯箱型材', spec: '70*53*3000mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp172', code: 'GXY-001-150W', name: '电源主体', spec: '63.6*38*3010', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp173', code: 'LC-005', name: '拉手', spec: '33.2*20.8', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp174', code: 'YL-00152', name: '冷轧板吸顶盘', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 8, customer: '江门光显电子有限公司' },
  { id: 'dp175', code: 'YL-00152.', name: '弹片', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0.5, customer: '江门光显电子有限公司' },
  { id: 'dp176', code: 'YL-014-202', name: '电源外壳', spec: '71.5*41.7*202', surface: '', unit: '', weightPerMeter: 0, unitPrice: 7.5, customer: '' },
  { id: 'dp177', code: 'YL-014-123', name: '电源外壳', spec: '71.5*41.7*123', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp178', code: 'yl-014-13', name: '堵头', spec: '72*42*13', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp179', code: 'yl-014-13地线孔', name: '堵头', spec: '72*42*13', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp180', code: 'YL-014-95', name: '电源外壳', spec: '71.5*41.7*95', surface: '', unit: '', weightPerMeter: 0, unitPrice: 6, customer: '' },
  { id: 'dp181', code: 'yl-015-123', name: '盖板', spec: '62.7*1.5*123', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp182', code: 'yl-015-95', name: '盖板', spec: '62.7*1.5*95', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp183', code: 'YL-036-133', name: '电源外壳', spec: '69.8*42.6*133', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp184', code: 'YL-036-210', name: '电源外壳', spec: '69.8*42.6*210', surface: '', unit: '', weightPerMeter: 0, unitPrice: 11, customer: '珠海市启阳电子有限公司' },
  { id: 'dp185', code: 'YL-054-100', name: '电源外壳', spec: '28.8*20.1*100', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp186', code: 'YL-054-117', name: '电源外壳', spec: '28.8*20.1*117', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0.65, customer: '' },
  { id: 'dp187', code: 'YL-054-120', name: '电源外壳', spec: '28.8*20.1*120', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp188', code: 'YL-054-130', name: '电源外壳', spec: '28.8*20.1*130', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp189', code: 'YL-054-137', name: '电源外壳铆钉', spec: '28.8*20.1*137', surface: '', unit: '', weightPerMeter: 0, unitPrice: 1, customer: '' },
  { id: 'dp190', code: 'YL-054-140', name: '电源外壳铆钉', spec: '28.8*20.1*140', surface: '', unit: '', weightPerMeter: 0, unitPrice: 1, customer: '珠海华炬科技有限公司' },
  { id: 'dp191', code: 'YL-054-146', name: '电源外壳', spec: '28.8*20.1*146', surface: '', unit: '', weightPerMeter: 0, unitPrice: 1.16, customer: '珠海绿美能电子科技有限公司' },
  { id: 'dp192', code: 'YL-054-160', name: '电源外壳', spec: '28.8*20.1*160', surface: '', unit: '', weightPerMeter: 0, unitPrice: 1.3, customer: '' },
  { id: 'dp193', code: 'YL-054-198', name: '电源外壳', spec: '28.8*20.1*198', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp194', code: 'YL-054-200', name: '电源外壳', spec: '28.8*20.1*200', surface: '', unit: '', weightPerMeter: 0, unitPrice: 1.5, customer: '珠海市启阳电子有限公司' },
  { id: 'dp195', code: 'YL-054-230', name: '电源外壳', spec: '28.8*20.1*230', surface: '', unit: '', weightPerMeter: 0, unitPrice: 1.9, customer: '' },
  { id: 'dp196', code: 'YL-054-240', name: '电源外壳', spec: '28.8*20.1*240', surface: '', unit: '', weightPerMeter: 0, unitPrice: 1.9, customer: '' },
  { id: 'dp197', code: 'YL-054-255', name: '电源外壳', spec: '28.8*20.1*255', surface: '', unit: '', weightPerMeter: 0, unitPrice: 1.85, customer: '' },
  { id: 'dp198', code: 'YL-054-280', name: '电源外壳', spec: '28.8*20.1*280', surface: '', unit: '', weightPerMeter: 0, unitPrice: 2.1, customer: '' },
  { id: 'dp199', code: 'YL-054-45', name: '电源外壳', spec: '28.8*20.1*45', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0.32, customer: '' },
  { id: 'dp200', code: 'YL-054-48', name: '电源外壳', spec: '28.8*20.1*48', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0.41, customer: '珠海市明庆电子有限分司' },
  { id: 'dp201', code: 'YL-054-55', name: '电源外壳', spec: '28.8*20.1*55', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0.45, customer: '' },
  { id: 'dp202', code: 'YL-054-50', name: '电源外壳', spec: '28.8*20.1*50', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0.43, customer: '' },
  { id: 'dp203', code: 'YL-054-6.2', name: '堵头', spec: '30*20*8.0', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp204', code: 'yl-054-60', name: '电源外壳', spec: '28.8*20.1*60', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0.6, customer: '' },
  { id: 'dp205', code: 'YL-054-7.0', name: '堵头', spec: '30*20*8.0', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp206', code: 'YL-054-70', name: '电源外壳', spec: '28.8*20.1*70', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0.65, customer: '' },
  { id: 'dp207', code: 'YL-054-75', name: '电源外壳', spec: '28.8*20.1*75', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0.65, customer: '' },
  { id: 'dp208', code: 'YL-054-85', name: '电源外壳', spec: '28.8*20.1*85', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0.7, customer: '' },
  { id: 'dp209', code: 'YL-054-90', name: '电源外壳', spec: '28.8*20.1*90', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0.7, customer: '珠海市启阳电子有限公司' },
  { id: 'dp210', code: 'YL-054-95', name: '电源外壳', spec: '28.8*20.1*95', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0.6, customer: '珠海金逸电子科技有限公司' },
  { id: 'dp211', code: 'YL-054-96', name: '电源外壳', spec: '28.8*20.1*96', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0.88, customer: '珠海绿美能电子科技有限公司' },
  { id: 'dp212', code: 'YL-054-97', name: '电源外壳', spec: '28.8*20.1*97', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0.88, customer: '' },
  { id: 'dp213', code: 'YL-054堵头6.2', name: '', spec: '28.8*20.1*10', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp214', code: 'yl-074-46', name: '散热器', spec: '25.95*7.9*46', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp215', code: 'YL-107-201.6', name: '电源外壳', spec: '95*50*201.6mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 7.5, customer: '' },
  { id: 'dp216', code: 'YL-107-260', name: '电源外壳', spec: '95*50*260mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 26, customer: '' },
  { id: 'dp217', code: 'YL-144-203', name: '盖板', spec: '32.87*1.17*203', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp218', code: 'yl-175-110', name: '外壳1', spec: '122×110×52mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp219', code: 'yl-176-110', name: '外壳2', spec: '122×110×7mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp220', code: 'YL-225-11堵头', name: '堵头', spec: '23.4*34.5*11', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp221', code: 'YL-225-203', name: '电源外壳', spec: '23.4*34.5*203', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp222', code: 'yl-255-110', name: '电源外壳套件', spec: '51.5*37.5*110', surface: '', unit: '', weightPerMeter: 0, unitPrice: 6.5, customer: '飞科光电有限公司' },
  { id: 'dp223', code: 'yl-255-130', name: '电源外壳', spec: '51.7*32', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp224', code: 'yl-255-80', name: '电源外壳套件', spec: '51.5*37.5*80', surface: '', unit: '', weightPerMeter: 0, unitPrice: 6.5, customer: '飞科光电有限公司' },
  { id: 'dp225', code: 'yl-270-95', name: '电源外壳', spec: '40*22*95', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0.9, customer: '' },
  { id: 'dp226', code: 'yl-270-100', name: '电源外壳', spec: '40*22*100', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0.9, customer: '' },
  { id: 'dp227', code: 'yl-270-105', name: '电源外壳', spec: '40*22*105', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0.9, customer: '' },
  { id: 'dp228', code: 'yl-270-130', name: '电源外壳', spec: '40*22*130', surface: '', unit: '', weightPerMeter: 0, unitPrice: 1, customer: '' },
  { id: 'dp229', code: 'yl-270-184', name: '电源外壳', spec: '40*22*184', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp230', code: 'yl-270-200', name: '电源外壳', spec: '40*22*200', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp231', code: 'yl-270-230', name: '电源主体', spec: '40*22*230', surface: '', unit: '', weightPerMeter: 0, unitPrice: 2.1, customer: '东方一号电子有限公司' },
  { id: 'dp232', code: 'yl-270-80', name: '电源外壳', spec: '40*22*80', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '东方一号电子有限公司' },
  { id: 'dp233', code: 'yl-270堵头', name: '堵头', spec: '40*22*20', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp234', code: 'YL-298', name: '铝杆头86.21x55.73MM', spec: '86.21*55.73*1510', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp235', code: 'yl-397', name: '小边框', spec: '49.9*17.9*3000', surface: '', unit: '', weightPerMeter: 0, unitPrice: 22.3, customer: '深圳市科录科技有限公司' },
  { id: 'dp236', code: 'yl-399-110', name: '', spec: '50*22*110', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp237', code: 'yl-399-149.5', name: '', spec: '50*22*149.5', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp238', code: 'yl-399-169.4', name: '', spec: '50*22*169.4', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp239', code: 'yl-411-140', name: '电源主体', spec: '40*13*140', surface: '', unit: '', weightPerMeter: 0, unitPrice: 1.7, customer: '' },
  { id: 'dp240', code: 'yl-411-160', name: '电源主体', spec: '40*13*160', surface: '', unit: '', weightPerMeter: 0, unitPrice: 1.9, customer: '' },
  { id: 'dp241', code: 'yl-411-180', name: '电源主体', spec: '40*13*180', surface: '', unit: '', weightPerMeter: 0, unitPrice: 2.1, customer: '' },
  { id: 'dp242', code: 'yl-411-200', name: '电源主体', spec: '40*13*200', surface: '', unit: '', weightPerMeter: 0, unitPrice: 2.3, customer: '' },
  { id: 'dp243', code: 'YL-442-3600', name: '盖板', spec: '70.5*7.7*3600', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp244', code: 'YL-443-3600', name: '电源主体', spec: '87*49.3*3600', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp245', code: 'yl-662', name: '小门灯盖板', spec: '87*131.7*1.6', surface: '', unit: '', weightPerMeter: 0, unitPrice: 3, customer: '江门光显电子有限公司' },
  { id: 'dp246', code: 'YW-0927', name: '弹片', spec: '27*9*8.6*0.5mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0.7, customer: '' },
  { id: 'dp247', code: 'yw-16-1168', name: '灯管铝材', spec: '18*26*558', surface: '', unit: '', weightPerMeter: 0, unitPrice: 3.8, customer: '江门光显电子有限公司' },
  { id: 'dp248', code: 'yw-16-2337', name: '灯管铝材', spec: '18*26*2337', surface: '', unit: '', weightPerMeter: 0, unitPrice: 7.6, customer: '江门光显电子有限公司' },
  { id: 'dp249', code: 'yw-16-558', name: '灯管铝材', spec: '18*26*558', surface: '', unit: '', weightPerMeter: 0, unitPrice: 1.9, customer: '江门光显电子有限公司' },
  { id: 'dp250', code: 'yw-16-864', name: '灯管铝材', spec: '18*26*864', surface: '', unit: '', weightPerMeter: 0, unitPrice: 2.8, customer: '江门光显电子有限公司' },
  { id: 'dp251', code: 'YW-3022', name: '卡簧', spec: '30*21.5*2.0mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0.3, customer: '' },
  { id: 'dp252', code: 'zw-06-1265', name: '样品', spec: '1265*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp253', code: 'zw-06-1515', name: '样品', spec: '1515*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp254', code: 'ZWL100x33ARGB-3700', name: '', spec: '100*33*3700', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp255', code: 'ZWL100x33ARGB-4000', name: '', spec: '100*33*4000', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp256', code: 'ZWLP1010x112x6ARGB', name: '铝条', spec: '12.9*10*1010', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp257', code: 'ZWLP1010x170x15ARGB-1', name: '', spec: '952*10*12.9', surface: '', unit: '952', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp258', code: 'ZWLP1010x170x15ARGB-2', name: '', spec: '952*10*12.9', surface: '', unit: '952', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp259', code: 'ZWLP1094x170x15ARGB', name: '', spec: '1028*10*12.9', surface: '', unit: '1028', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp260', code: 'ZWLP1100x112x6ARGB', name: '铝条', spec: '12.9*10*1100', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp261', code: 'ZWLP1100x170x15ARGB-1', name: '', spec: '1028*10*12.9', surface: '', unit: '1028', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp262', code: 'ZWLP1100x170x15ARGB-2', name: '', spec: '1028*10*12.9', surface: '', unit: '1028', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp263', code: 'ZWLP1208x170x15ARGB-1', name: '', spec: '1100*10*12.9', surface: '', unit: '1100', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp264', code: 'ZWLP1208x170x15ARGB-2', name: '', spec: '1100*10*12.9', surface: '', unit: '1100', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp265', code: 'ZWLP1237x170x15ARGB', name: '', spec: '1100*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp266', code: 'ZWLP1300x112x6ARGB', name: '铝条', spec: '12.9*10*1300', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp267', code: 'ZWLP1516x170x15ARGB-1', name: '', spec: '561*10*12.9', surface: '', unit: '561', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp268', code: 'ZWLP1562x50x15ARGB', name: '', spec: '1460*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp269', code: 'ZWLP370x65x6ARGB', name: '铝条', spec: '12.9*10*370', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp270', code: 'ZWLP520x112x6ARGB', name: '', spec: '520*10*12.9', surface: '', unit: '520', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp271', code: 'ZWLP590x80x6ARGB', name: '样品费', spec: '590*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp272', code: 'ZWLP650x112x6BRGB', name: '铝条', spec: '12.9*10*650', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp273', code: 'ZWLP735x170x15ARGB', name: '', spec: '668*10*12.9', surface: '', unit: '668', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp274', code: 'ZWLP750x170x15ARGB', name: '', spec: '668*10*12.9', surface: '', unit: '668', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp275', code: 'ZWLP756x170x15ARGB-1', name: '', spec: '668*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp276', code: 'ZWLP756x170x15ARGB-2', name: '', spec: '524*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp277', code: 'ZWLP756x50x15ARGB', name: '', spec: '596*10*12.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp278', code: 'ZWLP816x170x15ARGB-1', name: '', spec: '740*10*12.9', surface: '', unit: '740', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp279', code: 'ZWLP816x170x15ARGB-2', name: '', spec: '740*10*12.9', surface: '', unit: '740', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp280', code: 'ZWLP950x112x6ARGB', name: '铝条', spec: '12.9*10*950', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp281', code: '弹片夹具', name: '', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp282', code: '电源盒', name: '', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp283', code: '胶条改模费', name: '', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp284', code: '铝脚-763', name: '', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp285', code: '铝脚-777', name: '', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp286', code: '铝脚-795', name: '', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp287', code: '模具费', name: '', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp288', code: '上机费', name: '', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp289', code: '上铝框', name: '', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp290', code: '弯角BL-006-2380', name: '弯角', spec: '80*80*2380', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp291', code: '弯角BL-006-2600', name: '弯角', spec: '80*80*2600', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp292', code: '弯角BL-006-2450', name: '弯角', spec: '80*80*2450', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp293', code: '弯角BL-006-2375', name: '弯角', spec: '80*80*2375', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp294', code: '弯角BL-006-2525', name: '弯角', spec: '80*80*2525', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp295', code: '弯角BL-006-2575', name: '弯角', spec: '80*80*2575', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp296', code: '弯角BL-006-2675', name: '弯角', spec: '80*80*2675', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp297', code: '弯角BL-006-2750', name: '弯角', spec: '80*80*2750', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp298', code: '弯角BL-006-2850', name: '弯角', spec: '80*80*2850', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp299', code: '下铝框', name: '', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp300', code: '压铸件', name: '钻孔攻牙', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp301', code: '运费', name: '', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp302', code: '左右铝框', name: '', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp303', code: '5.5.000159', name: 'U型铝条', spec: '3700*100*33mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 148, customer: '广东中为导光科技有限公司' },
  { id: 'dp304', code: '5.5.000160', name: 'U型铝条', spec: '4000*100*33mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 160, customer: '广东中为导光科技有限公司' },
  { id: 'dp305', code: '5.5.000221', name: '铝片', spec: '100*33*2mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 3, customer: '广东中为导光科技有限公司' },
  { id: 'dp306', code: '5.5.000223', name: 'ZWLF1197x475x4AW-铝合金', spec: '1197*34.8*0.9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp307', code: '58*58*R28', name: '弯角', spec: '58*58*R28mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp308', code: '58*58*R28-3150', name: '', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp309', code: '58*58*R28-2450', name: '', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp310', code: '58*58*R28-2300', name: '', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp311', code: '58*58*R28-1700', name: '', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp312', code: '58*58*R28-2490', name: '', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp313', code: 'YL-231-240', name: '机箱外款', spec: '138*76.2*240mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp314', code: '10W20W支架', name: '样品费', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp315', code: '30W支架', name: '样品费', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp316', code: 'BL-126-140', name: '底板', spec: '52*1.5*140mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 1.2, customer: '' },
  { id: 'dp317', code: 'YL-079-80', name: '电源外壳', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 3.9, customer: '' },
  { id: 'dp318', code: 'YL-079-70', name: '电源外壳', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 2.8, customer: '' },
  { id: 'dp319', code: '1021772', name: 'D7散热片', spec: '56*25*4mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0.95, customer: '' },
  { id: 'dp320', code: '1021773', name: 'MOS散热片', spec: '52*25*4mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0.85, customer: '' },
  { id: 'dp321', code: '08120-0527', name: '主体型材', spec: '61*25', surface: '', unit: '', weightPerMeter: 0.483, unitPrice: 13.5777096, customer: '深圳富达金技术有限公司' },
  { id: 'dp322', code: '08120-0526', name: '半圆型材', spec: '39.5*34.5', surface: '', unit: '', weightPerMeter: 0.326, unitPrice: 9.1642512, customer: '深圳富达金技术有限公司' },
  { id: 'dp323', code: '08120-0528', name: '电气仓盖型材', spec: '47.5*5.06', surface: '', unit: '', weightPerMeter: 0.185, unitPrice: 5.200572, customer: '深圳富达金技术有限公司' },
  { id: 'dp324', code: '550095-B00', name: '散热片', spec: '143*3*25', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp325', code: '550096-B00', name: '散热片', spec: '143*3*25', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp326', code: '550188', name: '散热片A', spec: '116*25*3', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp327', code: '550189', name: '散热片B', spec: '116*25*3', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp328', code: '550186-A00', name: '散热片上盖', spec: '107.4*57.8*29', surface: '', unit: '', weightPerMeter: 0, unitPrice: 1.6, customer: '' },
  { id: 'dp329', code: '550099', name: '散热片', spec: '64*21*1.5', surface: '', unit: '', weightPerMeter: 0, unitPrice: 1.2, customer: '' },
  { id: 'dp330', code: '550100', name: '散热片', spec: '91.7*21*1.5', surface: '', unit: '', weightPerMeter: 0, unitPrice: 1.6, customer: '' },
  { id: 'dp331', code: '5.5.000233', name: 'ZWLF420x130x3BW 铝条', spec: '129.7*21*9mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp332', code: 'YG25.3*1.15', name: '铝管6063', spec: '25.3*23*4000', surface: '本色', unit: '', weightPerMeter: 0, unitPrice: 35, customer: '佛山市三水弘美电器配件有限公司' },
  { id: 'dp333', code: '405-00731', name: '铝管6063', spec: 'ø32.7*ø29.5*4000', surface: '本色', unit: '', weightPerMeter: 0, unitPrice: 35, customer: '佛山市三水弘美电器配件有限公司' },
  { id: 'dp334', code: 'JG25*1.0', name: '铝管6063', spec: 'ø25*ø23*4000', surface: '本色', unit: '', weightPerMeter: 0, unitPrice: 35, customer: '佛山市三水弘美电器配件有限公司' },
  { id: 'dp335', code: 'JG-Φ31.25×Φ27.95', name: '铝管6063', spec: 'Φ31.25*Φ27.95*4000', surface: '本色', unit: '', weightPerMeter: 0, unitPrice: 35, customer: '佛山市三水弘美电器配件有限公司' },
  { id: 'dp336', code: 'YL-036-151', name: '电源外壳', spec: '69.8*42.6*151', surface: '', unit: '', weightPerMeter: 0, unitPrice: 11, customer: '江苏镭科照明科技有限公司' },
  { id: 'dp337', code: 'YL-036-139', name: '电源外壳', spec: '69.8*42.6*139', surface: '', unit: '', weightPerMeter: 0, unitPrice: 9, customer: '' },
  { id: 'dp338', code: '1.04.01.1112.0002', name: 'TURBO-40-1200-型材', spec: 'ø37X21.5X1140mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp339', code: '1.04.01.1116.0002', name: 'TURBO-75-1200-型材', spec: 'ø71X34.3X1140mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp340', code: '1.04.01.1334.0001', name: 'TURBO-75-1200-小角度-型材', spec: 'ø71X34.3X1112mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp341', code: '1.04.01.1108.5302', name: 'TURBO-40-左-免螺丝端盖', spec: 'ø40.3X30.2mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp342', code: '1.04.01.1109.5302', name: 'TURBO-40-右端盖', spec: 'ø40.3X30.2mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp343', code: '车费', name: '', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp344', code: 'D8150-0814', name: '铝型材上机费', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp345', code: '9150-1136', name: '半圆型材', spec: '40*24.5*2450', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp346', code: '9150-1140', name: '主体型材', spec: '61*25*2450', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp347', code: '9150-1144', name: '电气仓盖型材', spec: '47.5*5.06*2450', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp348', code: 'LZ-001-00', name: '铝支撑', spec: '500*80*160', surface: '', unit: '', weightPerMeter: 0, unitPrice: 32, customer: '' },
  { id: 'dp349', code: 'LZ-002', name: 'L型特殊铝块', spec: '70*70*20.4', surface: '', unit: '', weightPerMeter: 0, unitPrice: 3.17, customer: '' },
  { id: 'dp350', code: 'LZ-003', name: '铝板3.0mm', spec: '180*80*3.0', surface: '', unit: '', weightPerMeter: 0, unitPrice: 4.23, customer: '' },
  { id: 'dp351', code: 'LZ-004', name: '方铝片2.3mm', spec: '178*82*2.3', surface: '', unit: '', weightPerMeter: 0, unitPrice: 3.2, customer: '' },
  { id: 'dp352', code: 'LZ-005', name: 'U型铝', spec: '70*36*30', surface: '', unit: '', weightPerMeter: 0, unitPrice: 2.9, customer: '' },
  { id: 'dp353', code: '100*100*R50*3200', name: '100*100弯角', spec: '100*100*R50*3200', surface: '', unit: '', weightPerMeter: 0, unitPrice: 3200, customer: '' },
  { id: 'dp354', code: '100*100*R50*3050', name: '100*100弯角', spec: '100*100*R50*3050', surface: '', unit: '', weightPerMeter: 0, unitPrice: 3050, customer: '' },
  { id: 'dp355', code: '100*100*R50*3000', name: '100*100弯角', spec: '100*100*R50*3000', surface: '', unit: '', weightPerMeter: 0, unitPrice: 3000, customer: '' },
  { id: 'dp356', code: '100*100*R50*2850', name: '100*100弯角', spec: '100*100*R50*2850', surface: '', unit: '', weightPerMeter: 0, unitPrice: 2850, customer: '' },
  { id: 'dp357', code: '80*80*R28*2380', name: '80*80*R28弯角', spec: '80*80*R28*2380', surface: '', unit: '', weightPerMeter: 0, unitPrice: 2380, customer: '' },
  { id: 'dp358', code: '80*80*R28*3850', name: '80*80*R28弯角', spec: '80*80*R28*3850', surface: '', unit: '', weightPerMeter: 0, unitPrice: 3850, customer: '' },
  { id: 'dp359', code: '80*80*R28*4050', name: '80*80*R28弯角', spec: '80*80*R28*4050', surface: '', unit: '', weightPerMeter: 0, unitPrice: 4050, customer: '' },
  { id: 'dp360', code: '80*80*R28*5050', name: '80*80*R28弯角', spec: '80*80*R28*5050', surface: '', unit: '', weightPerMeter: 0, unitPrice: 5050, customer: '' },
  { id: 'dp361', code: '80*80*R28*3500', name: '80*80*R28弯角', spec: '80*80*R28*3500', surface: '', unit: '', weightPerMeter: 0, unitPrice: 3500, customer: '' },
  { id: 'dp362', code: '80*80*R28*2450', name: '80*80*R28弯角', spec: '80*80*R28*2450', surface: '', unit: '', weightPerMeter: 0, unitPrice: 2450, customer: '' },
  { id: 'dp363', code: '80*80*R28*3000', name: '80*80*R28弯角', spec: '80*80*R28*3000', surface: '', unit: '', weightPerMeter: 0, unitPrice: 3000, customer: '' },
  { id: 'dp364', code: '80*80*R28*1250', name: '80*80*R28弯角', spec: '80*80*R28*1250', surface: '', unit: '', weightPerMeter: 0, unitPrice: 1250, customer: '' },
  { id: 'dp365', code: '80*80*R28*1350', name: '80*80*R28弯角', spec: '80*80*R28*1350', surface: '', unit: '', weightPerMeter: 0, unitPrice: 1350, customer: '' },
  { id: 'dp366', code: '80*80*R28*1450', name: '80*80*R28弯角', spec: '80*80*R28*1450', surface: '', unit: '', weightPerMeter: 0, unitPrice: 1450, customer: '' },
  { id: 'dp367', code: '80*80*R28*1650', name: '80*80*R28弯角', spec: '80*80*R28*1650', surface: '', unit: '', weightPerMeter: 0, unitPrice: 1650, customer: '' },
  { id: 'dp368', code: '80*80*R28*1750', name: '80*80*R28弯角', spec: '80*80*R28*1750', surface: '', unit: '', weightPerMeter: 0, unitPrice: 1750, customer: '' },
  { id: 'dp369', code: '80*80*R28*1950', name: '80*80*R28弯角', spec: '80*80*R28*1950', surface: '', unit: '', weightPerMeter: 0, unitPrice: 1950, customer: '' },
  { id: 'dp370', code: '80*80*R28*2150', name: '80*80*R28弯角', spec: '80*80*R28*2150', surface: '', unit: '', weightPerMeter: 0, unitPrice: 2150, customer: '' },
  { id: 'dp371', code: '80*80*R28*2250', name: '80*80*R28弯角', spec: '80*80*R28*2250', surface: '', unit: '', weightPerMeter: 0, unitPrice: 2250, customer: '' },
  { id: 'dp372', code: '80*80*R28*2350', name: '80*80*R28弯角', spec: '80*80*R28*2350', surface: '', unit: '', weightPerMeter: 0, unitPrice: 2350, customer: '' },
  { id: 'dp373', code: '80*80*R28*2550', name: '80*80*R28弯角', spec: '80*80*R28*2550', surface: '', unit: '', weightPerMeter: 0, unitPrice: 2550, customer: '' },
  { id: 'dp374', code: '80*80*R28*4450', name: '80*80*R28弯角', spec: '80*80*R28*4450', surface: '', unit: '', weightPerMeter: 0, unitPrice: 4450, customer: '' },
  { id: 'dp375', code: '100*100*R50*3500', name: '100*100*R50弯角', spec: '100*100*R50*3500', surface: '', unit: '', weightPerMeter: 0, unitPrice: 3500, customer: '' },
  { id: 'dp376', code: '100*100*R50*3400', name: '100*100*R50弯角', spec: '100*100*R50*3400', surface: '', unit: '', weightPerMeter: 0, unitPrice: 3400, customer: '' },
  { id: 'dp377', code: '100*100*R50*3300', name: '100*100*R50弯角', spec: '100*100*R50*3300', surface: '', unit: '', weightPerMeter: 0, unitPrice: 3300, customer: '' },
  { id: 'dp378', code: '100*100*R50*2950', name: '100*100*R50弯角', spec: '100*100*R50*2950', surface: '', unit: '', weightPerMeter: 0, unitPrice: 2950, customer: '' },
  { id: 'dp379', code: '100*100*R50*2900', name: '100*100*R50弯角', spec: '100*100*R50*2900', surface: '', unit: '', weightPerMeter: 0, unitPrice: 2900, customer: '' },
  { id: 'dp380', code: '100*100*R50*2750', name: '100*100*R50弯角', spec: '100*100*R50*2750', surface: '', unit: '', weightPerMeter: 0, unitPrice: 2750, customer: '' },
  { id: 'dp381', code: '100*100*R50*2700', name: '100*100*R50弯角', spec: '100*100*R50*2700', surface: '', unit: '', weightPerMeter: 0, unitPrice: 2700, customer: '' },
  { id: 'dp382', code: '100*100*R50*2650', name: '100*100*R50弯角', spec: '100*100*R50*2650', surface: '', unit: '', weightPerMeter: 0, unitPrice: 2650, customer: '' },
  { id: 'dp383', code: '100*100*R50*2600', name: '100*100*R50弯角', spec: '100*100*R50*2600', surface: '', unit: '', weightPerMeter: 0, unitPrice: 2600, customer: '' },
  { id: 'dp384', code: '100*100*R50*3100', name: '100*100*R50弯角', spec: '100*100*R50*3100', surface: '', unit: '', weightPerMeter: 0, unitPrice: 3100, customer: '' },
  { id: 'dp385', code: '100*100*R50*2800', name: '100*100*R50弯角', spec: '100*100*R50*2800', surface: '', unit: '', weightPerMeter: 0, unitPrice: 2800, customer: '' },
  { id: 'dp386', code: 'BL-126-144', name: '底板', spec: '55*1.5*144mm', surface: '', unit: '', weightPerMeter: 0, unitPrice: 1.2, customer: '' },
  { id: 'dp387', code: 'YL-014-200', name: '电源外壳', spec: '71.5*41.7*200', surface: '', unit: '', weightPerMeter: 0, unitPrice: 7, customer: '' },
  { id: 'dp388', code: '25*3*45', name: '散热片', spec: '25*3*45', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp389', code: '25*3*55', name: '散热片', spec: '25*3*55', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp390', code: '25*3*65', name: '散热片', spec: '25*3*65', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp391', code: '5.5.000229', name: '铝合金', spec: '34.8*0.9*580', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp392', code: 'ZW-849', name: '', spec: '80*80*4050', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp393', code: '2400626', name: 'F0铝支架0623', spec: '36.9*10.5', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp394', code: '45*22*4', name: '散热片', spec: '45*22*4', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp395', code: '85*25*4', name: '散热片', spec: '85*25*4', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp396', code: 'YL-107-201.6', name: '', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp397', code: 'BL-003', name: '小边框', spec: '51.8*11.1*3000', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp398', code: '预付款', name: '', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp399', code: 'YL-869-1', name: '上盖板', spec: '116*22.9*174.5', surface: '', unit: '', weightPerMeter: 0, unitPrice: 35.54, customer: '玖嘉久电子科技' },
  { id: 'dp400', code: 'YL-869-2', name: '下盖板', spec: '107*6.2*173.4', surface: '', unit: '', weightPerMeter: 0, unitPrice: 31.33, customer: '玖嘉久电子科技' },
  { id: 'dp401', code: 'YL-869-3', name: '按键', spec: '4*3*26.4', surface: '', unit: '', weightPerMeter: 0, unitPrice: 2.98, customer: '玖嘉久电子科技' },
  { id: 'dp402', code: '方铝管25*25*2.0', name: '铝管6063', spec: '25*25*4040', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '江苏镭科照明科技有限公司' },
  { id: 'dp403', code: '51.04.01.1418.0002', name: 'Reach型材', spec: '18*3.4*1122.6', surface: '', unit: '', weightPerMeter: 0, unitPrice: 2.8, customer: '江门深华港湾照明有限公司' },
  { id: 'dp404', code: '51.04.01.1480.0001', name: 'LIRO光源支架', spec: '1080.7X67X6.9', surface: '', unit: '', weightPerMeter: 0, unitPrice: 7.8, customer: '江门深华港湾照明有限公司' },
  { id: 'dp405', code: '304 -16不锈钢', name: '十字圆头半牙螺钉', spec: 'M5X 16', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0.14, customer: '佛山市奕旺照明科技有限公司' },
  { id: 'dp406', code: '304 -17不锈钢', name: '十字圆头半牙螺钉', spec: 'M5X 17', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0.14, customer: '佛山市奕旺照明科技有限公司' },
  { id: 'dp407', code: '27.8*68', name: '', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 8.5, customer: '' },
  { id: 'dp408', code: '25.8*68', name: '', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 7, customer: '' },
  { id: 'dp409', code: '31*21', name: '', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 2, customer: '' },
  { id: 'dp410', code: '48*35', name: '', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 9, customer: '' },
  { id: 'dp411', code: '48*58', name: '', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 6.8, customer: '' },
  { id: 'dp412', code: '48*60', name: '', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 9, customer: '' },
  { id: 'dp413', code: '31*58', name: '', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 5.5, customer: '' },
  { id: 'dp414', code: '31*55', name: '', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 6.5, customer: '' },
  { id: 'dp415', code: '31*35', name: '', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 8, customer: '' },
  { id: 'dp416', code: '36*21', name: '', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 3, customer: '' },
  { id: 'dp417', code: '33.8*78.1', name: '', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 10.5, customer: '' },
  { id: 'dp418', code: '36*52', name: '', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 6, customer: '' },
  { id: 'dp419', code: '27.8*78.1样品', name: '', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp420', code: '36*21样品', name: '', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp421', code: 'LZ-010', name: 'U型制动钳', spec: '33.3*8.3*18', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0.7, customer: '江苏镭科照明科技有限公司' },
  { id: 'dp422', code: 'YL-872', name: '带挂钩的铝块', spec: '20.4*20.2*99.6', surface: '', unit: '', weightPerMeter: 0, unitPrice: 4.98, customer: '江苏镭科照明科技有限公司' },
  { id: 'dp423', code: 'LZ-012', name: '卡箍用卡扣', spec: '42*20.8*10', surface: '', unit: '', weightPerMeter: 0, unitPrice: 125, customer: '江苏镭科照明科技有限公司' },
  { id: 'dp424', code: 'YL-874', name: '只型铝板', spec: '70*49.4*100.2', surface: '', unit: '', weightPerMeter: 0, unitPrice: 9.6, customer: '江苏镭科照明科技有限公司' },
  { id: 'dp425', code: 'YL-874-46', name: '铝支架', spec: '70*49.4*46', surface: '', unit: '', weightPerMeter: 0, unitPrice: 9.25, customer: '江苏镭科照明科技有限公司' },
  { id: 'dp426', code: 'LZ-008', name: '快速固定支架1孔', spec: '35*35*200', surface: '', unit: '', weightPerMeter: 0, unitPrice: 5.78, customer: '江苏镭科照明科技有限公司' },
  { id: 'dp427', code: 'LZ-009', name: '快速固定支架2孔', spec: '35*35*200', surface: '', unit: '', weightPerMeter: 0, unitPrice: 5.67, customer: '江苏镭科照明科技有限公司' },
  { id: 'dp428', code: 'BL-003-2000', name: '小边框', spec: '51.8*11.1*2000', surface: '', unit: '', weightPerMeter: 0, unitPrice: 10, customer: '东莞市百川慧通科技有限公司' },
  { id: 'dp429', code: 'YL-107-1', name: '堵头+地线孔', spec: '95*13*50', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '东莞市莱斯特电源科技有限公司' },
  { id: 'dp430', code: 'YL-107-2', name: '堵头', spec: '95*13*50', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '东莞市莱斯特电源科技有限公司' },
  { id: 'dp431', code: 'YL-108-260', name: '盖板', spec: '260*80*3', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '东莞市莱斯特电源科技有限公司' },
  { id: 'dp432', code: '外径46.80*59.30（7.8内孔）', name: '碗', spec: 'ø46.8*59.3', surface: '', unit: '', weightPerMeter: 0, unitPrice: 11, customer: '廖先生' },
  { id: 'dp433', code: '外径46.80*59.30（9.0内孔）', name: '碗', spec: 'ø46.8*59.3', surface: '', unit: '', weightPerMeter: 0, unitPrice: 11, customer: '' },
  { id: 'dp434', code: '外径50*40（9.0孔）', name: '碗', spec: 'ø50*40', surface: '', unit: '', weightPerMeter: 0, unitPrice: 14.6, customer: '' },
  { id: 'dp435', code: '外径50*40（7.8孔）', name: '碗', spec: 'ø50*40', surface: '', unit: '', weightPerMeter: 0, unitPrice: 14.6, customer: '' },
  { id: 'dp436', code: '外径50*13', name: '大接头', spec: 'ø50*13', surface: '', unit: '', weightPerMeter: 0, unitPrice: 8.6, customer: '' },
  { id: 'dp437', code: '外径50*147.5', name: '长管', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 19, customer: '' },
  { id: 'dp438', code: '外径50*127.5', name: '短管', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 18, customer: '' },
  { id: 'dp439', code: '外径28.9*67', name: '接头', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 13, customer: '' },
  { id: 'dp440', code: '外径31*21', name: '堵头', spec: 'ø31*21', surface: '', unit: '', weightPerMeter: 0, unitPrice: 3.5, customer: '' },
  { id: 'dp441', code: 'LZ-006', name: '铝架配件', spec: '54.5*27.3*50', surface: '', unit: '', weightPerMeter: 0, unitPrice: 2.8, customer: '江苏镭科照明科技有限公司' },
  { id: 'dp442', code: '51.04.01.1524.0001', name: '黄灯管-铝型材', spec: '1135x23.8x11', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '江门深华港湾照明有限公司' },
  { id: 'dp443', code: '外径28.9*59', name: '接头', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 13, customer: '' },
  { id: 'dp444', code: '外径39*59.30（7.8内孔）', name: '碗', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 10, customer: '' },
  { id: 'dp445', code: '外径42*40（7.8孔）', name: '', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 13.4, customer: '' },
  { id: 'dp446', code: '外径42*13', name: '小接头', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 7.5, customer: '' },
  { id: 'dp447', code: '外径42*145.70', name: '小长管', spec: '', surface: '', unit: '', weightPerMeter: 0, unitPrice: 16, customer: '' },
  { id: 'dp448', code: 'YL-871-200', name: '电源外壳', spec: '39.6*21.33*200', surface: '', unit: '', weightPerMeter: 0, unitPrice: 1.91, customer: '' },
  { id: 'dp449', code: 'YL-054-65', name: '电源外壳', spec: '20.3*29.3*65', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0.59, customer: '' },
  { id: 'dp450', code: 'YL-871-堵头', name: '堵头', spec: '39.6*21.33*13', surface: '', unit: '', weightPerMeter: 0, unitPrice: 0.1, customer: '' },
  { id: 'dp451', code: 'YL-876-72', name: '带底盖电源盒', spec: '40*23*72', surface: '', unit: '', weightPerMeter: 0, unitPrice: 2.05, customer: '' },
  { id: 'dp452', code: '51.04.01.1522.0001', name: 'LIFA-4OW滑轨', spec: '60x23x7.2mm,', surface: '氧化雾银', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp453', code: '51.04.01.1523.0001', name: 'LIFA一15OW滑轨', spec: '80x23x7.2mm,', surface: '氧化雾银', unit: '', weightPerMeter: 0, unitPrice: 0, customer: '' },
  { id: 'dp454', code: 'yl-424', name: '散热器', spec: '130.7*38.4*219', surface: '氧化砂银', unit: '', weightPerMeter: 0, unitPrice: 97.5, customer: '' },
  { id: 'dp455', code: 'YL-054-220', name: '电源外壳', spec: '20.3*29.3*220', surface: '', unit: '', weightPerMeter: 0, unitPrice: 3, customer: '' },
];

export interface DeliveryItem {
  id: string;
  materialCode: string;
  productName: string;
  spec: string;
  unit: string;
  qty: number;
  surface: string;
  unitPrice: number;
  amount: number;
  remark: string;
}

export interface DeliveryNote {
  id: string;
  noteNo: string;
  date: string;
  customer: string;
  orderNo: string;
  items: DeliveryItem[];
  reconciled: string;
  company: string;
  maker?: string;
}

export const deliveryNotes: DeliveryNote[] = [
  { id: 'dn1', noteNo: 'BL45670003', date: '2025-01-13', customer: '佛山市三水弘美电器配件有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di1', materialCode: 'YG25.3*1.15', productName: '铝管6063', spec: '25.3*23*4000', unit: 'kg', qty: 841, surface: '本色', unitPrice: 32, amount: 26912, remark: '' }
  ]},
  { id: 'dn2', noteNo: 'BL45670004', date: '2025-01-13', customer: '深圳市凯明节能设备有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di2', materialCode: 'YL-014-95', productName: '电源外壳', spec: '71.5*41.7*95', unit: 'pcs', qty: 1155, surface: '铁灰', unitPrice: 6, amount: 6930, remark: '' }
  ]},
  { id: 'dn3', noteNo: 'BL45668005', date: '2025-01-11', customer: '东莞市莱斯特电源科技有限公司', orderNo: '', reconciled: '已对帐', company: '佛山市质稳五金有限公司', items: [
    { id: 'di3', materialCode: 'YL-054-160', productName: '电源外壳', spec: '28.8*20.1*160', unit: 'pcs', qty: 400, surface: '铁灰', unitPrice: 1.3, amount: 520, remark: '' }
  ]},
  { id: 'dn4', noteNo: 'BL45671006', date: '2025-01-14', customer: '深圳市乐家乐建筑材料有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di4', materialCode: '弯角BL-006-2380', productName: '弯角', spec: '80*80*2380', unit: 'kg', qty: 1841.4535, surface: '', unitPrice: 25.66, amount: 47251.69681, remark: '84*10+1' },
    { id: 'di5', materialCode: '弯角BL-006-2600', productName: '弯角', spec: '80*80*2600', unit: '', qty: 0, surface: '', unitPrice: 0, amount: 0, remark: '1*5' },
    { id: 'di6', materialCode: '弯角BL-006-2450', productName: '弯角', spec: '80*80*2450', unit: '', qty: 0, surface: '', unitPrice: 0, amount: 0, remark: '1*6' }
  ]},
  { id: 'dn5', noteNo: 'BL45672009', date: '2025-01-15', customer: '深圳华唐锐照明电器有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di7', materialCode: '1.04.01.0135', productName: 'TODAY 40W端盖', spec: '47X29X13mmΦ10', unit: 'pcs', qty: 660, surface: '氧化黑色', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di8', materialCode: '1.04.01.0136', productName: 'TODAY 40W端盖', spec: '47X29X13mmΦ7.4', unit: 'pcs', qty: 660, surface: '氧化黑色', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di9', materialCode: '1.04.01.0159. 0001', productName: 'today 30W电源壳体', spec: '46.6X29X102.5mm', unit: 'pcs', qty: 261, surface: '氧化黑色', unitPrice: 0, amount: 0, remark: '' }
  ]},
  { id: 'dn6', noteNo: 'BL456750012', date: '2025-01-18', customer: '深圳华唐锐照明电器有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di10', materialCode: '1.04.01.0135', productName: 'TODAY 40W端盖', spec: '47X29X13mmΦ10', unit: 'pcs', qty: 719, surface: '氧化黑色', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di11', materialCode: '1.04.01.0136', productName: 'TODAY 40W端盖', spec: '47X29X13mmΦ7.4', unit: 'pcs', qty: 428, surface: '氧化黑色', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di12', materialCode: '1.04.01.0159. 0001', productName: 'today 30W电源壳体', spec: '46.6X29X102.5mm', unit: 'pcs', qty: 768, surface: '氧化黑色', unitPrice: 0, amount: 0, remark: '' }
  ]},
  { id: 'dn7', noteNo: 'BL456750015', date: '2025-01-18', customer: '深圳华唐锐照明电器有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di13', materialCode: '1.04.01.1112.0002', productName: 'TURBO-40-1200-型材', spec: 'ø37X21.5X1140mm', unit: 'pcs', qty: 68, surface: '银白', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di14', materialCode: '1.04.01.1116.0002', productName: 'TURBO-75-1200-型材', spec: 'ø71X34.3X1140mm', unit: 'pcs', qty: 118, surface: '银白', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di15', materialCode: '1.04.01.1334.0001', productName: 'TURBO-75-1200-小角度-型材', spec: 'ø71X34.3X1112mm', unit: 'pcs', qty: 120, surface: '银白', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di16', materialCode: '1.04.01.1108.5302', productName: 'TURBO-40-左-免螺丝端盖', spec: 'ø40.3X30.2mm', unit: 'pcs', qty: 60, surface: '氧化雾银', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di17', materialCode: '1.04.01.1109.5302', productName: 'TURBO-40-右端盖', spec: 'ø40.3X30.2mm', unit: 'pcs', qty: 65, surface: '氧化雾银', unitPrice: 0, amount: 0, remark: '' }
  ]},
  { id: 'dn8', noteNo: 'BL456750020', date: '2025-01-18', customer: '广州凯佳电子有限公司', orderNo: '', reconciled: '已对帐', company: '佛山市质稳五金有限公司', items: [
    { id: 'di18', materialCode: 'BL-126-140', productName: '底板', spec: '52*1.5*140mm', unit: 'pcs', qty: 5548, surface: '氧化雾银', unitPrice: 1.2, amount: 6657.6, remark: '' }
  ]},
  { id: 'dn9', noteNo: 'BL457070021', date: '2025-02-19', customer: '广东中为导光科技有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di19', materialCode: '5.5.000233', productName: 'ZWLF420x130x3BW 铝条', spec: '129.7*21*9mm', unit: 'pcs', qty: 3400, surface: '本色', unitPrice: 0.2, amount: 680, remark: '' },
    { id: 'di20', materialCode: '车费', productName: '', spec: '', unit: '趟', qty: 1, surface: '', unitPrice: 58, amount: 58, remark: '' }
  ]},
  { id: 'dn10', noteNo: 'BL457150023', date: '2025-02-27', customer: '深圳华唐锐照明电器有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di21', materialCode: '1.04.01.1099. 9903', productName: '', spec: '', unit: 'pcs', qty: 100, surface: '氧化雾银', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di22', materialCode: '1.04.01.1100. 9903', productName: '', spec: '', unit: 'pcs', qty: 100, surface: '氧化雾银', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di23', materialCode: '1.04.01.1128. 9903', productName: 'IGUASSU单灯主体端盖-1', spec: '42.4*99.5*2.0', unit: 'pcs', qty: 100, surface: '氧化雾银', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di24', materialCode: '1.04.01.1129. 9903', productName: 'IGUASSU单灯主体端盖-2', spec: '42.4*99.5*2.0', unit: 'pcs', qty: 100, surface: '氧化雾银', unitPrice: 0, amount: 0, remark: '' }
  ]},
  { id: 'dn11', noteNo: 'BL457160027', date: '2025-02-28', customer: '佛山市三水弘美电器配件有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di25', materialCode: 'YG25.3*1.15', productName: '铝管6063', spec: '25.3*23*4000', unit: 'KG', qty: 543, surface: '本色', unitPrice: 32, amount: 17376, remark: '516支' }
  ]},
  { id: 'dn12', noteNo: 'BL457200028', date: '2025-03-04', customer: '深圳市卓仪光电科技有限公司', orderNo: '', reconciled: '已对帐', company: '佛山市质稳五金有限公司', items: [
    { id: 'di26', materialCode: 'YL-054-160', productName: '电源外壳', spec: '28.8*20.1*160', unit: 'pcs', qty: 971, surface: '氧化雾银', unitPrice: 1.3, amount: 1262.3, remark: '' }
  ]},
  { id: 'dn13', noteNo: 'BL457200029', date: '2025-03-04', customer: '江苏联康电子有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di27', materialCode: '550186-A00', productName: '散热片上盖', spec: '107.4*57.8*29', unit: 'pcs', qty: 2976, surface: '砂白', unitPrice: 1.6, amount: 4761.6, remark: '' }
  ]},
  { id: 'dn14', noteNo: 'BL457200030', date: '2025-03-04', customer: '江苏联康电子有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di28', materialCode: '550188', productName: '', spec: '', unit: 'pcs', qty: 1000, surface: '砂白', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di29', materialCode: '550189', productName: '', spec: '', unit: 'pcs', qty: 1000, surface: '砂白', unitPrice: 0, amount: 0, remark: '' }
  ]},
  { id: 'dn15', noteNo: 'BL457210032', date: '2025-03-05', customer: '东莞市莱斯特电源科技有限公司', orderNo: '', reconciled: '已对帐', company: '佛山市质稳五金有限公司', items: [
    { id: 'di30', materialCode: 'yl-270-130', productName: '电源外壳', spec: '40*22*130', unit: 'pcs', qty: 2244, surface: '铁灰', unitPrice: 1, amount: 2244, remark: '' }
  ]},
  { id: 'dn16', noteNo: 'BL457230033', date: '2025-03-07', customer: '东莞市莱斯特电源科技有限公司', orderNo: '', reconciled: '已对帐', company: '佛山市质稳五金有限公司', items: [
    { id: 'di31', materialCode: 'YL-054-160', productName: '电源外壳', spec: '28.8*20.1*160', unit: 'pcs', qty: 885, surface: '铁灰', unitPrice: 1.3, amount: 1150.5, remark: '' }
  ]},
  { id: 'dn17', noteNo: 'BL457250034', date: '2025-03-09', customer: '东莞市莱斯特电源科技有限公司', orderNo: '', reconciled: '已对帐', company: '佛山市质稳五金有限公司', items: [
    { id: 'di32', materialCode: 'YL-054-130', productName: '电源外壳', spec: '28.8*20.1*130', unit: 'pcs', qty: 655, surface: '铁灰', unitPrice: 1, amount: 655, remark: '' }
  ]},
  { id: 'dn18', noteNo: 'BL457280035', date: '2025-03-12', customer: '江苏联康电子有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di33', materialCode: '550188', productName: '', spec: '', unit: 'pcs', qty: 1835, surface: '砂白', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di34', materialCode: '550189', productName: '', spec: '', unit: 'pcs', qty: 1056, surface: '砂白', unitPrice: 0, amount: 0, remark: '' }
  ]},
  { id: 'dn19', noteNo: 'BL457280037', date: '2025-03-12', customer: '深圳市卓仪光电科技有限公司', orderNo: '', reconciled: '已对帐', company: '佛山市质稳五金有限公司', items: [
    { id: 'di35', materialCode: 'YL-054-160', productName: '电源外壳', spec: '28.8*20.1*160', unit: 'pcs', qty: 1000, surface: '铁灰', unitPrice: 1.3, amount: 1300, remark: '' }
  ]},
  { id: 'dn20', noteNo: 'BL457290038', date: '2025-03-13', customer: '东莞市莱斯特电源科技有限公司', orderNo: '', reconciled: '已对帐', company: '佛山市质稳五金有限公司', items: [
    { id: 'di36', materialCode: 'yl-270-130', productName: '电源外壳', spec: '40*22*130', unit: 'pcs', qty: 5984, surface: '铁灰', unitPrice: 1, amount: 5984, remark: '' },
    { id: 'di37', materialCode: 'YL-054-160', productName: '电源外壳', spec: '28.8*20.1*160', unit: 'pcs', qty: 1593, surface: '铁灰', unitPrice: 1.3, amount: 2070.9, remark: '' }
  ]},
  { id: 'dn21', noteNo: 'BL457330040', date: '2025-03-17', customer: '深圳富达金技术有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di38', materialCode: '9150-1136', productName: '半圆型材', spec: '40*24.5*2450', unit: 'kg', qty: 285, surface: '本色', unitPrice: 0, amount: 0, remark: '391支' },
    { id: 'di39', materialCode: '9150-1140', productName: '主体型材', spec: '61*25*2450', unit: 'kg', qty: 331, surface: '本色', unitPrice: 0, amount: 0, remark: '275支' },
    { id: 'di40', materialCode: '9150-1144', productName: '电气仓盖型材', spec: '47.5*5.06*2450', unit: 'kg', qty: 135, surface: '本色', unitPrice: 0, amount: 0, remark: '318支' }
  ]},
  { id: 'dn22', noteNo: 'BL457330043', date: '2025-03-17', customer: '深圳富达金技术有限公司', orderNo: 'PO925030021', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di41', materialCode: 'D8150-0814', productName: '铝型材上机费', spec: '', unit: '次', qty: 1, surface: '', unitPrice: 0, amount: 0, remark: '' }
  ]},
  { id: 'dn23', noteNo: 'BL457340044', date: '2025-03-18', customer: '江苏镭科照明科技有限公司', orderNo: '002090/002136/002168', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di42', materialCode: 'LZ-001-00', productName: '铝支撑', spec: '500*80*160', unit: '套', qty: 1480, surface: '本色', unitPrice: 32, amount: 47360, remark: '20个*74箱' },
    { id: 'di43', materialCode: 'LZ-002', productName: 'L型特殊铝块', spec: '70*70*20.4', unit: 'pcs', qty: 12740, surface: '本色', unitPrice: 3.17, amount: 40385.8, remark: '196个*65箱' },
    { id: 'di44', materialCode: 'LZ-003', productName: '铝板3.0mm', spec: '180*80*3.0', unit: 'pcs', qty: 7400, surface: '本色', unitPrice: 4.23, amount: 31302, remark: '200个*37箱' },
    { id: 'di45', materialCode: 'LZ-004', productName: '方铝片2.3mm', spec: '178*82*2.3', unit: 'pcs', qty: 2870, surface: '本色', unitPrice: 3.82, amount: 10963.4, remark: '200个*19箱' },
    { id: 'di46', materialCode: 'LZ-004', productName: '方铝片2.3mm', spec: '178*82*2.3', unit: 'pcs', qty: 930, surface: '本色', unitPrice: 3.2, amount: 2976, remark: '' },
    { id: 'di47', materialCode: 'LZ-004', productName: '方铝片2.3mm', spec: '178*82*2.3', unit: 'pcs', qty: -101, surface: '本色', unitPrice: 3.2, amount: -323.2, remark: '25*25方管磅差' }
  ]},
  { id: 'dn24', noteNo: 'BL457340050', date: '2025-03-18', customer: '佛山市三水弘美电器配件有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di48', materialCode: '405-00731', productName: '铝管6063', spec: 'ø32.7*ø29.5*4000', unit: 'kg', qty: 525, surface: '本色', unitPrice: 32, amount: 16800, remark: '' }
  ]},
  { id: 'dn25', noteNo: 'BL457350051', date: '2025-03-19', customer: '深圳华唐锐照明电器有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di49', materialCode: '1.04.01.0158.0001', productName: 'today 30W电源壳体', spec: '46.6X29X102.5mm', unit: 'pcs', qty: 2730, surface: '氧化雾银', unitPrice: 0, amount: 0, remark: '' }
  ]},
  { id: 'dn26', noteNo: 'BL457350052', date: '2025-03-19', customer: '东方一号电子有限公司', orderNo: '', reconciled: '已对帐', company: '佛山市质稳五金有限公司', items: [
    { id: 'di50', materialCode: 'yl-270-230', productName: '电源主体', spec: '40*22*230', unit: 'pcs', qty: 1050, surface: '氧化雾银', unitPrice: 2.1, amount: 2205, remark: '' }
  ]},
  { id: 'dn27', noteNo: 'BL457370053', date: '2025-03-21', customer: '深圳市乐家乐建筑材料有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di51', materialCode: '100*100*R50*3500', productName: '100*100*R50弯角', spec: '100*100*R50*3500', unit: '支', qty: 1, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di52', materialCode: '100*100*R50*3400', productName: '100*100*R50弯角', spec: '100*100*R50*3400', unit: '支', qty: 5, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di53', materialCode: '100*100*R50*3300', productName: '100*100*R50弯角', spec: '100*100*R50*3300', unit: '支', qty: 26, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di54', materialCode: '100*100*R50*3200', productName: '100*100弯角', spec: '100*100*R50*3200', unit: '支', qty: 4, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di55', materialCode: '100*100*R50*3050', productName: '100*100弯角', spec: '100*100*R50*3050', unit: '支', qty: 3, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di56', materialCode: '100*100*R50*3000', productName: '100*100弯角', spec: '100*100*R50*3000', unit: '支', qty: 3, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di57', materialCode: '100*100*R50*2900', productName: '100*100*R50弯角', spec: '100*100*R50*2900', unit: '支', qty: 13, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di58', materialCode: '100*100*R50*2850', productName: '100*100弯角', spec: '100*100*R50*2850', unit: '支', qty: 5, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di59', materialCode: '100*100*R50*2700', productName: '100*100*R50弯角', spec: '100*100*R50*2700', unit: '支', qty: 14, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di60', materialCode: '100*100*R50*2650', productName: '100*100*R50弯角', spec: '100*100*R50*2650', unit: '支', qty: 5, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di61', materialCode: '100*100*R50*2600', productName: '100*100*R50弯角', spec: '100*100*R50*2600', unit: '支', qty: 7, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di62', materialCode: '80*80*R28*2380', productName: '80*80*R28弯角', spec: '80*80*R28*2380', unit: '支', qty: 328, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di63', materialCode: '80*80*R28*3850', productName: '80*80*R28弯角', spec: '80*80*R28*3850', unit: '支', qty: 30, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di64', materialCode: '80*80*R28*4050', productName: '80*80*R28弯角', spec: '80*80*R28*4050', unit: '支', qty: 1, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di65', materialCode: '80*80*R28*5050', productName: '80*80*R28弯角', spec: '80*80*R28*5050', unit: '支', qty: 7, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di66', materialCode: '80*80*R28*3500', productName: '80*80*R28弯角', spec: '80*80*R28*3500', unit: '支', qty: 20, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di67', materialCode: '80*80*R28*2550', productName: '80*80*R28弯角', spec: '80*80*R28*2550', unit: '支', qty: 4, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di68', materialCode: '80*80*R28*2450', productName: '80*80*R28弯角', spec: '80*80*R28*2450', unit: '支', qty: 6, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di69', materialCode: '100*100*R50*2800', productName: '100*100*R50弯角', spec: '100*100*R50*2800', unit: '支', qty: 53, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di70', materialCode: '100*100*R50*3100', productName: '100*100*R50弯角', spec: '100*100*R50*3100', unit: '支', qty: 46, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di71', materialCode: '100*100*R50*4000', productName: '', spec: '', unit: '支', qty: 1, surface: '', unitPrice: 0, amount: 0, remark: '' }
  ]},
  { id: 'dn28', noteNo: 'BL457370074', date: '2025-03-21', customer: '深圳市乐家乐建筑材料有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di72', materialCode: '80*80*R28*3000', productName: '80*80*R28弯角', spec: '80*80*R28*3000', unit: '支', qty: 22, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di73', materialCode: '80*80*R28*1250', productName: '80*80*R28弯角', spec: '80*80*R28*1250', unit: '支', qty: 172, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di74', materialCode: '80*80*R28*1350', productName: '80*80*R28弯角', spec: '80*80*R28*1350', unit: '支', qty: 2, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di75', materialCode: '80*80*R28*1450', productName: '80*80*R28弯角', spec: '80*80*R28*1450', unit: '支', qty: 6, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di76', materialCode: '80*80*R28*1650', productName: '80*80*R28弯角', spec: '80*80*R28*1650', unit: '支', qty: 144, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di77', materialCode: '80*80*R28*1750', productName: '80*80*R28弯角', spec: '80*80*R28*1750', unit: '支', qty: 27, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di78', materialCode: '80*80*R28*1950', productName: '80*80*R28弯角', spec: '80*80*R28*1950', unit: '支', qty: 26, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di79', materialCode: '80*80*R28*2150', productName: '80*80*R28弯角', spec: '80*80*R28*2150', unit: '支', qty: 3, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di80', materialCode: '80*80*R28*2250', productName: '80*80*R28弯角', spec: '80*80*R28*2250', unit: '支', qty: 8, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di81', materialCode: '80*80*R28*2350', productName: '80*80*R28弯角', spec: '80*80*R28*2350', unit: '支', qty: 2, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di82', materialCode: '80*80*R28*2550', productName: '80*80*R28弯角', spec: '80*80*R28*2550', unit: '支', qty: 25, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di83', materialCode: '80*80*R28*4450', productName: '80*80*R28弯角', spec: '80*80*R28*4450', unit: '支', qty: 2, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di84', materialCode: '100*100*R50*3500', productName: '100*100*R50弯角', spec: '100*100*R50*3500', unit: '支', qty: 42, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di85', materialCode: '100*100*R50*3400', productName: '100*100*R50弯角', spec: '100*100*R50*3400', unit: '支', qty: 3, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di86', materialCode: '100*100*R50*3300', productName: '100*100*R50弯角', spec: '100*100*R50*3300', unit: '支', qty: 21, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di87', materialCode: '100*100*R50*3100', productName: '100*100*R50弯角', spec: '100*100*R50*3100', unit: '支', qty: 1, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di88', materialCode: '100*100*R50*2950', productName: '100*100*R50弯角', spec: '100*100*R50*2950', unit: '支', qty: 112, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di89', materialCode: '100*100*R50*2900', productName: '100*100*R50弯角', spec: '100*100*R50*2900', unit: '支', qty: 125, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di90', materialCode: '100*100*R50*2800', productName: '100*100*R50弯角', spec: '100*100*R50*2800', unit: '支', qty: 3, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di91', materialCode: '100*100*R50*2750', productName: '100*100*R50弯角', spec: '100*100*R50*2750', unit: '支', qty: 41, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di92', materialCode: '100*100*R50*2700', productName: '100*100*R50弯角', spec: '100*100*R50*2700', unit: '支', qty: 70, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di93', materialCode: '100*100*R50*2650', productName: '100*100*R50弯角', spec: '100*100*R50*2650', unit: '支', qty: 3, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di94', materialCode: '100*100*R50*2600', productName: '100*100*R50弯角', spec: '100*100*R50*2600', unit: '支', qty: 18, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di95', materialCode: '100*100*R50*2800', productName: '100*100*R50弯角', spec: '100*100*R50*2800', unit: '支', qty: 96, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di96', materialCode: '100*100*R50*3100', productName: '100*100*R50弯角', spec: '100*100*R50*3100', unit: '支', qty: 195, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di97', materialCode: '100*100*R50*2800', productName: '100*100*R50弯角', spec: '100*100*R50*2800', unit: '支', qty: 9, surface: '', unitPrice: 0, amount: 0, remark: '' }
  ]},
  { id: 'dn29', noteNo: 'BL4573700100', date: '2025-03-21', customer: '江苏联康电子有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di98', materialCode: '550188', productName: '散热片A', spec: '116*25*3', unit: 'pcs', qty: 1500, surface: '砂白', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di99', materialCode: '550189', productName: '散热片B', spec: '116*25*3', unit: 'pcs', qty: 1500, surface: '砂白', unitPrice: 0, amount: 0, remark: '' }
  ]},
  { id: 'dn30', noteNo: 'BL4572100102', date: '2025-03-05', customer: '东莞市莱斯特电源科技有限公司', orderNo: '', reconciled: '已对帐', company: '佛山市质稳五金有限公司', items: [
    { id: 'di100', materialCode: 'yl-270堵头', productName: '堵头', spec: '40*22*20', unit: 'pcs', qty: 20000, surface: '白色', unitPrice: 0.1, amount: 2000, remark: '' }
  ]},
  { id: 'dn31', noteNo: 'BL4574600103', date: '2025-03-30', customer: '深圳美因联电子有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di101', materialCode: 'YL-079-85', productName: '', spec: '', unit: '套', qty: 1200, surface: '氧化黑色', unitPrice: 3.7, amount: 4440, remark: '' }
  ]},
  { id: 'dn32', noteNo: 'BL4574100104', date: '2025-03-25', customer: '东莞市莱斯特电源科技有限公司', orderNo: '', reconciled: '已对帐', company: '佛山市质稳五金有限公司', items: [
    { id: 'di102', materialCode: 'yl-270-100', productName: '电源外壳', spec: '40*22*100', unit: 'pcs', qty: 883, surface: '铁灰', unitPrice: 0.9, amount: 794.7, remark: '' }
  ]},
  { id: 'dn33', noteNo: 'BL4574100105', date: '2025-03-25', customer: '江苏联康电子有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di103', materialCode: '550188', productName: '散热片A', spec: '116*25*3', unit: 'pcs', qty: 1200, surface: '砂白', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di104', materialCode: '550189', productName: '散热片B', spec: '116*25*3', unit: 'pcs', qty: 450, surface: '砂白', unitPrice: 0, amount: 0, remark: '' }
  ]},
  { id: 'dn34', noteNo: 'BL4574500107', date: '2025-03-29', customer: '佛山市三水弘美电器配件有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di105', materialCode: 'JG-Φ31.25×Φ27.95', productName: '铝管6063', spec: 'Φ31.25*Φ27.95*4000', unit: 'kg', qty: 303, surface: '本色', unitPrice: 32, amount: 9696, remark: '195支' }
  ]},
  { id: 'dn35', noteNo: 'BL4574400108', date: '2025-03-28', customer: '广东中为导光科技有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di106', materialCode: '5.5.000164', productName: 'ZWL500*100x33ARGB', spec: '100*33*500', unit: 'pcs', qty: 4, surface: '氧化雾银', unitPrice: 5.4, amount: 21.6, remark: '' },
    { id: 'di107', materialCode: '5.5.000158', productName: 'ZWL600*100x33ARGB', spec: '100*33*600', unit: 'pcs', qty: 32, surface: '氧化雾银', unitPrice: 5.4, amount: 172.8, remark: '' },
    { id: 'di108', materialCode: '5.5.000210', productName: 'ZWLP400x100x33ARGB', spec: '400*100*33mm', unit: 'pcs', qty: 4, surface: '氧化雾银', unitPrice: 5.4, amount: 21.6, remark: '' }
  ]},
  { id: 'dn36', noteNo: 'BL4574700111', date: '2025-03-31', customer: '深圳市凯明节能设备有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di109', materialCode: 'YL-014-95', productName: '电源外壳', spec: '71.5*41.7*95', unit: 'pcs', qty: 1000, surface: '铁灰', unitPrice: 6, amount: 6000, remark: '欠档板' }
  ]},
  { id: 'dn37', noteNo: 'BL4574700112', date: '2025-03-31', customer: '深圳市巨磁王科技有限责任公司', orderNo: 'PO20250320007', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di110', materialCode: '4130131', productName: '外壳', spec: 'L184*40*22mm', unit: '套', qty: 100, surface: '氧化雾银', unitPrice: 2.2, amount: 220, remark: '' }
  ]},
  { id: 'dn38', noteNo: 'BL4574900113', date: '2025-04-02', customer: '江苏镭科照明科技有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di111', materialCode: 'LZ-001-00', productName: '铝支撑', spec: '500*80*160', unit: '套', qty: 1520, surface: '本色', unitPrice: 32, amount: 48640, remark: '' },
    { id: 'di112', materialCode: 'LZ-002', productName: 'L型特殊铝块', spec: '70*70*20.4', unit: 'pcs', qty: 12260, surface: '本色', unitPrice: 3.17, amount: 38864.2, remark: '' },
    { id: 'di113', materialCode: 'LZ-003', productName: '铝板3.0mm', spec: '180*80*3.0', unit: 'pcs', qty: 7590, surface: '本色', unitPrice: 4.23, amount: 32105.7, remark: '' }
  ]},
  { id: 'dn39', noteNo: 'BL00116', date: '', customer: '', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di114', materialCode: 'LZ-004', productName: '方铝片2.3mm', spec: '178*82*2.3', unit: 'pcs', qty: 160, surface: '本色', unitPrice: 0, amount: 0, remark: '' }
  ]},
  { id: 'dn40', noteNo: 'BL00117', date: '', customer: '', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di115', materialCode: 'LZ-005', productName: 'U型铝', spec: '70*36*30', unit: 'pcs', qty: 5000, surface: '本色', unitPrice: 0, amount: 0, remark: '' }
  ]},
  { id: 'dn41', noteNo: 'BL4575700118', date: '2025-04-10', customer: '广州凯佳电子有限公司', orderNo: '', reconciled: '已对帐', company: '佛山市质稳五金有限公司', items: [
    { id: 'di116', materialCode: 'BL-126-144', productName: '底板', spec: '55*1.5*144mm', unit: 'pcs', qty: 3000, surface: '砂白', unitPrice: 1.2, amount: 3600, remark: '' }
  ]},
  { id: 'dn42', noteNo: 'BL4575700119', date: '2025-04-10', customer: '丁先生', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di117', materialCode: 'YL-014-200', productName: '电源外壳', spec: '71.5*41.7*200', unit: 'pcs', qty: 122, surface: '铁灰', unitPrice: 7, amount: 854, remark: '' }
  ]},
  { id: 'dn43', noteNo: 'BL4575800120', date: '2025-04-11', customer: '佛山市三水弘美电器配件有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di118', materialCode: 'YG25.3*1.15', productName: '铝管6063', spec: '25.3*23*4000', unit: 'kg', qty: 854.5, surface: '本色', unitPrice: 32, amount: 27344, remark: '' }
  ]},
  { id: 'dn44', noteNo: 'BL4576500121', date: '2025-04-18', customer: '珠海金逸电子科技有限公司', orderNo: '', reconciled: '已对帐', company: '佛山市质稳五金有限公司', items: [
    { id: 'di119', materialCode: 'yl-270-130', productName: '电源外壳', spec: '40*22*130', unit: 'pcs', qty: 4465, surface: '氧化雾银', unitPrice: 1.1, amount: 4911.5, remark: '' }
  ]},
  { id: 'dn45', noteNo: 'BL4576500122', date: '2025-04-18', customer: '江苏镭科照明科技有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di120', materialCode: 'LZ-005', productName: 'U型铝', spec: '70*36*30', unit: 'pcs', qty: 5000, surface: '本色', unitPrice: 2.9, amount: 14500, remark: '' },
    { id: 'di121', materialCode: 'LZ-004', productName: '方铝片2.3mm', spec: '178*82*2.3', unit: 'pcs', qty: 190, surface: '本色', unitPrice: 3.2, amount: 608, remark: '' }
  ]},
  { id: 'dn46', noteNo: 'BL4576600124', date: '2025-04-19', customer: '广州凯佳电子有限公司', orderNo: '', reconciled: '已对帐', company: '佛山市质稳五金有限公司', items: [
    { id: 'di122', materialCode: 'BL-126-140', productName: '底板', spec: '52*1.5*140mm', unit: 'pcs', qty: 2660, surface: '氧化雾银', unitPrice: 1.5, amount: 3990, remark: '' }
  ]},
  { id: 'dn47', noteNo: 'BL4589700125', date: '2025-08-28', customer: '深圳市凯明节能设备有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di123', materialCode: 'YL-014-95', productName: '电源外壳', spec: '71.5*41.7*95', unit: '套', qty: 2000, surface: '铁灰', unitPrice: 5.5, amount: 11000, remark: '' }
  ]},
  { id: 'dn48', noteNo: 'BL4575700126', date: '2025-04-10', customer: '和鸿电气股份有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di124', materialCode: '25*3*45', productName: '散热片', spec: '25*3*45', unit: 'pcs', qty: 20, surface: '本色', unitPrice: 2.5, amount: 50, remark: '' },
    { id: 'di125', materialCode: '25*3*55', productName: '散热片', spec: '25*3*55', unit: 'pcs', qty: 20, surface: '本色', unitPrice: 3.5, amount: 70, remark: '' },
    { id: 'di126', materialCode: '25*3*65', productName: '散热片', spec: '25*3*65', unit: 'pcs', qty: 20, surface: '本色', unitPrice: 4, amount: 80, remark: '' }
  ]},
  { id: 'dn49', noteNo: 'BL4577200129', date: '2025-04-25', customer: '东方一号电子有限公司', orderNo: '', reconciled: '已对帐', company: '佛山市质稳五金有限公司', items: [
    { id: 'di127', materialCode: 'YL-054-280', productName: '电源外壳', spec: '28.8*20.1*280', unit: 'pcs', qty: 273, surface: '白色', unitPrice: 2.1, amount: 573.3, remark: '' }
  ]},
  { id: 'dn50', noteNo: 'BL4577200130', date: '2025-04-25', customer: '广州凯佳电子有限公司', orderNo: '', reconciled: '已对帐', company: '佛山市质稳五金有限公司', items: [
    { id: 'di128', materialCode: 'BL-126-140', productName: '底板', spec: '52*1.5*140mm', unit: 'pcs', qty: 250, surface: '砂白', unitPrice: 1.5, amount: 375, remark: '' }
  ]},
  { id: 'dn51', noteNo: 'BL4577200131', date: '2025-04-25', customer: '广东中为导光科技有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di129', materialCode: '5.5.000229', productName: '铝合金', spec: '34.8*0.9*580', unit: 'pcs', qty: 155, surface: '本色', unitPrice: 3, amount: 465, remark: '' },
    { id: 'di130', materialCode: '运费', productName: '', spec: '', unit: '趟', qty: 1, surface: '', unitPrice: 62, amount: 62, remark: '' }
  ]},
  { id: 'dn52', noteNo: 'BL4577600133', date: '2025-04-29', customer: '佛山市三水弘美电器配件有限公司', orderNo: 'HM202503310003', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di131', materialCode: '405-00731', productName: '铝管6063', spec: 'ø32.7*ø29.5*4000', unit: 'kg', qty: 320, surface: '本色', unitPrice: 32, amount: 10240, remark: '' }
  ]},
  { id: 'dn53', noteNo: 'BL4578300134', date: '2025-05-06', customer: '珠海金逸电子科技有限公司', orderNo: '', reconciled: '已对帐', company: '佛山市质稳五金有限公司', items: [
    { id: 'di132', materialCode: 'yl-270-130', productName: '电源外壳', spec: '40*22*130', unit: 'pcs', qty: 2254, surface: '氧化雾银', unitPrice: 1.1, amount: 2479.4, remark: '' }
  ]},
  { id: 'dn54', noteNo: 'BL4578700135', date: '2025-05-10', customer: '深圳华唐锐照明电器有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di133', materialCode: '1.04.01.1260. 9901', productName: '滑轨', spec: '60x23x6.3mm', unit: 'pcs', qty: 2000, surface: '氧化雾银', unitPrice: 0, amount: 0, remark: '' }
  ]},
  { id: 'dn55', noteNo: 'BL4578900136', date: '2025-05-12', customer: '广州凯佳电子有限公司', orderNo: '', reconciled: '已对帐', company: '佛山市质稳五金有限公司', items: [
    { id: 'di134', materialCode: 'BL-126-140', productName: '底板', spec: '52*1.5*140mm', unit: 'pcs', qty: 3652, surface: '氧化雾银', unitPrice: 1.5, amount: 5478, remark: '' }
  ]},
  { id: 'dn56', noteNo: 'BL4576900137', date: '2025-04-22', customer: '广州凯佳电子有限公司', orderNo: '', reconciled: '已对帐', company: '佛山市质稳五金有限公司', items: [
    { id: 'di135', materialCode: 'BL-126-144', productName: '底板', spec: '55*1.5*144mm', unit: 'pcs', qty: -270, surface: '', unitPrice: 1.2, amount: -324, remark: '' }
  ]},
  { id: 'dn57', noteNo: 'BL4579500139', date: '2025-05-18', customer: '东莞市莱斯特电源科技有限公司', orderNo: '', reconciled: '已对帐', company: '佛山市质稳五金有限公司', items: [
    { id: 'di136', materialCode: 'YL-054-160', productName: '电源外壳', spec: '28.8*20.1*160', unit: 'pcs', qty: 2097, surface: '铁灰', unitPrice: 1.3, amount: 2726.1, remark: '' }
  ]},
  { id: 'dn58', noteNo: 'BL4579500140', date: '2025-05-18', customer: '深圳市卓仪光电科技有限公司', orderNo: '', reconciled: '已对帐', company: '佛山市质稳五金有限公司', items: [
    { id: 'di137', materialCode: 'YL-054-160', productName: '电源外壳', spec: '28.8*20.1*160', unit: 'pcs', qty: 1025, surface: '氧化雾银', unitPrice: 1.3, amount: 1332.5, remark: '' }
  ]},
  { id: 'dn59', noteNo: 'BL4580200141', date: '2025-05-25', customer: '东莞市莱斯特电源科技有限公司', orderNo: '', reconciled: '已对帐', company: '佛山市质稳五金有限公司', items: [
    { id: 'di138', materialCode: 'YL-054堵头6.2', productName: '', spec: '28.8*20.1*10', unit: 'pcs', qty: 8000, surface: '白色', unitPrice: 0.08, amount: 640, remark: '' },
    { id: 'di139', materialCode: 'YL-054-130', productName: '电源外壳', spec: '28.8*20.1*130', unit: 'pcs', qty: 2000, surface: '铁灰', unitPrice: 1, amount: 2000, remark: '' }
  ]},
  { id: 'dn60', noteNo: 'BL4611200143', date: '2026-03-31', customer: '深圳市凯明节能设备有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di140', materialCode: 'YL-014-95', productName: '电源外壳', spec: '71.5*41.7*95', unit: '套', qty: 808, surface: '铁灰', unitPrice: 5.7, amount: 4605.6, remark: '' }
  ]},
  { id: 'dn61', noteNo: 'BL4579500144', date: '2025-05-18', customer: '盛世', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di141', materialCode: 'ZW-849', productName: '', spec: '80*80*4050', unit: 'kg', qty: 578.5, surface: '本色', unitPrice: 21.98, amount: 12715.43, remark: '38支' },
    { id: 'di142', materialCode: 'ZW-849', productName: '', spec: '80*80*4050', unit: 'kg', qty: -552.6, surface: '本色', unitPrice: 21.98, amount: -12146.148, remark: '36支' }
  ]},
  { id: 'dn62', noteNo: 'BL4581500146', date: '2025-06-07', customer: '广东中为导光科技有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di143', materialCode: '5.5.000158', productName: 'ZWL600*100x33ARGB', spec: '100*33*600', unit: 'pcs', qty: 28, surface: '氧化雾银', unitPrice: 30, amount: 840, remark: '' },
    { id: 'di144', materialCode: '5.5.000210', productName: 'ZWLP400x100x33ARGB', spec: '400*100*33mm', unit: 'pcs', qty: 3, surface: '氧化雾银', unitPrice: 22, amount: 66, remark: '' }
  ]},
  { id: 'dn63', noteNo: 'BL4582600148', date: '2025-06-18', customer: '东莞市莱斯特电源科技有限公司', orderNo: '', reconciled: '已对帐', company: '佛山市质稳五金有限公司', items: [
    { id: 'di145', materialCode: 'yl-270-130', productName: '电源外壳', spec: '40*22*130', unit: 'pcs', qty: 1400, surface: '铁灰', unitPrice: 1, amount: 1400, remark: '' }
  ]},
  { id: 'dn64', noteNo: 'BL4583000149', date: '2025-06-22', customer: '深圳华唐锐照明电器有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di146', materialCode: '1.04.01.0096', productName: 'Q2-45W端盖', spec: '47X29X13mm，Φ10', unit: 'pcs', qty: 1800, surface: '氧化雾银', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di147', materialCode: '1.04.01.0097', productName: 'Q2-45W端盖', spec: '47X29X13mm，Φ7.4', unit: 'pcs', qty: 275, surface: '氧化雾银', unitPrice: 0, amount: 0, remark: '' }
  ]},
  { id: 'dn65', noteNo: 'BL4583000151', date: '2025-06-22', customer: '东莞市莱斯特电源科技有限公司', orderNo: '', reconciled: '已对帐', company: '佛山市质稳五金有限公司', items: [
    { id: 'di148', materialCode: 'yl-270-130', productName: '电源外壳', spec: '40*22*130', unit: 'pcs', qty: 4150, surface: '铁灰', unitPrice: 1, amount: 4150, remark: '' }
  ]},
  { id: 'dn66', noteNo: 'BL4580300152', date: '2025-05-26', customer: '广州凯佳电子有限公司', orderNo: '', reconciled: '已对帐', company: '佛山市质稳五金有限公司', items: [
    { id: 'di149', materialCode: 'BL-126-140', productName: '底板', spec: '52*1.5*140mm', unit: 'pcs', qty: -1845, surface: '', unitPrice: 1.5, amount: -2767.5, remark: '' }
  ]},
  { id: 'dn67', noteNo: 'BL4586600153', date: '2025-07-28', customer: '珠海金逸电子科技有限公司', orderNo: '', reconciled: '已对帐', company: '佛山市质稳五金有限公司', items: [
    { id: 'di150', materialCode: 'yl-270-130', productName: '电源外壳', spec: '40*22*130', unit: 'pcs', qty: 3035, surface: '银白', unitPrice: 1.1, amount: 3338.5, remark: '' }
  ]},
  { id: 'dn68', noteNo: 'BL4586600154', date: '2025-07-28', customer: '广州凯佳电子有限公司', orderNo: '', reconciled: '已对帐', company: '佛山市质稳五金有限公司', items: [
    { id: 'di151', materialCode: 'BL-126-144', productName: '底板', spec: '55*1.5*144mm', unit: 'pcs', qty: 2100, surface: '银白', unitPrice: 0, amount: 0, remark: '' }
  ]},
  { id: 'dn69', noteNo: 'BL4586600155', date: '2025-07-28', customer: '东方一号电子有限公司', orderNo: '', reconciled: '已对帐', company: '佛山市质稳五金有限公司', items: [
    { id: 'di152', materialCode: 'yl-270-230', productName: '电源主体', spec: '40*22*230', unit: 'pcs', qty: 1000, surface: '银白', unitPrice: 2.1, amount: 2100, remark: '' },
    { id: 'di153', materialCode: 'yl-270-230', productName: '电源主体', spec: '40*22*230', unit: 'pcs', qty: 380, surface: '银白', unitPrice: 2.1, amount: 798, remark: '' },
    { id: 'di154', materialCode: 'YL-054-280', productName: '电源外壳', spec: '28.8*20.1*280', unit: 'pcs', qty: -42, surface: '银白', unitPrice: 2.1, amount: -88.2, remark: '' }
  ]},
  { id: 'dn70', noteNo: 'BL4587300158', date: '2025-08-04', customer: '深圳市科普睿电子有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di155', materialCode: 'YL-054-97', productName: '电源外壳', spec: '28.8*20.1*97', unit: 'pcs', qty: 1050, surface: '银白', unitPrice: 0.88, amount: 924, remark: '' }
  ]},
  { id: 'dn71', noteNo: 'BL4587400159', date: '2025-08-05', customer: '珠海市明庆电子有限分司', orderNo: '', reconciled: '已对帐', company: '佛山市质稳五金有限公司', items: [
    { id: 'di156', materialCode: 'YL-054-48', productName: '电源外壳', spec: '28.8*20.1*48', unit: 'pcs', qty: 10000, surface: '银白', unitPrice: 0.36, amount: 3600, remark: '' }
  ]},
  { id: 'dn72', noteNo: 'BL4588300160', date: '2025-08-14', customer: '佛山市三水弘美电器配件有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di157', materialCode: '405-00731', productName: '铝管6063', spec: 'ø32.7*ø29.5*4000', unit: 'kg', qty: 580, surface: '本色', unitPrice: 32, amount: 18560, remark: '' }
  ]},
  { id: 'dn73', noteNo: 'BL4588400161', date: '2025-08-15', customer: '凯明智汇科技（东莞）有限公司', orderNo: 'CG20250731048', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di158', materialCode: 'YL-014-95', productName: '电源外壳', spec: '71.5*41.7*95', unit: '套', qty: 1000, surface: '铁灰', unitPrice: 5.5, amount: 5500, remark: '' }
  ]},
  { id: 'dn74', noteNo: 'BL4589000162', date: '2025-08-21', customer: '东方一号电子有限公司', orderNo: '', reconciled: '已对帐', company: '佛山市质稳五金有限公司', items: [
    { id: 'di159', materialCode: 'yl-270-230', productName: '电源主体', spec: '40*22*230', unit: '套', qty: 640, surface: '白色', unitPrice: 2.1, amount: 1344, remark: '8/17发320' }
  ]},
  { id: 'dn75', noteNo: 'BL4588900163', date: '2025-08-20', customer: '珠海金逸电子科技有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di160', materialCode: 'yl-270-130', productName: '电源外壳', spec: '40*22*130', unit: '套', qty: 1012, surface: '铁灰', unitPrice: 1.1, amount: 1113.2, remark: '' },
    { id: 'di161', materialCode: 'yl-270-130', productName: '电源外壳', spec: '40*22*130', unit: '套', qty: 2968, surface: '银白', unitPrice: 1.1, amount: 3264.8, remark: '' }
  ]},
  { id: 'dn76', noteNo: 'BL458890165', date: '2025-08-20', customer: '东莞市莱斯特电源科技有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di162', materialCode: 'yl-270-100', productName: '电源外壳', spec: '', unit: 'pcs', qty: 2000, surface: '铁灰', unitPrice: 0.9, amount: 1800, remark: '' },
    { id: 'di163', materialCode: 'yl-270堵头', productName: '堵头', spec: '40*22*20', unit: 'pcs', qty: 5000, surface: '白色', unitPrice: 0.1, amount: 500, remark: 'ø5.7' },
    { id: 'di164', materialCode: 'yl-270堵头', productName: '堵头', spec: '40*22*20', unit: 'pcs', qty: 10000, surface: '白色', unitPrice: 0.1, amount: 1000, remark: 'ø6.1' },
    { id: 'di165', materialCode: 'yl-270堵头', productName: '堵头', spec: '40*22*20', unit: 'pcs', qty: 3900, surface: '白色', unitPrice: 0.1, amount: 390, remark: 'ø4.7' }
  ]},
  { id: 'dn77', noteNo: 'BL459070169', date: '2025-09-07', customer: '惠州市子阳光电照明有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di166', materialCode: '2400626', productName: 'F0铝支架0623', spec: '36.9*10.5', unit: '次', qty: 1, surface: '氧化黑色', unitPrice: 600, amount: 600, remark: '样品' }
  ]},
  { id: 'dn78', noteNo: 'BL459130170', date: '2025-09-13', customer: '东方一号电子有限公司', orderNo: '', reconciled: '已对帐', company: '佛山市质稳五金有限公司', items: [
    { id: 'di167', materialCode: 'yl-270-230', productName: '电源主体', spec: '40*22*230', unit: 'pcs', qty: 1000, surface: '氧化雾银', unitPrice: 2.1, amount: 2100, remark: '' }
  ]},
  { id: 'dn79', noteNo: 'BL459170171', date: '2025-09-17', customer: '佛山市三水弘美电器配件有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di168', materialCode: 'JG-Φ31.25×Φ27.95', productName: '铝管6063', spec: 'Φ31.25*Φ27.95*4000', unit: 'kg', qty: 344, surface: '本色', unitPrice: 32, amount: 11008, remark: '222支' },
    { id: 'di169', materialCode: 'YG25.3*1.15', productName: '铝管6063', spec: '25.3*23*4000', unit: 'kg', qty: 432, surface: '本色', unitPrice: 32, amount: 13824, remark: '423支' }
  ]},
  { id: 'dn80', noteNo: 'BL458960173', date: '2025-08-27', customer: '和鸿电气股份有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di170', materialCode: '45*22*4', productName: '散热片', spec: '45*22*4', unit: 'pcs', qty: 80, surface: '本色', unitPrice: 1.5, amount: 120, remark: '' },
    { id: 'di171', materialCode: '85*25*4', productName: '散热片', spec: '85*25*4', unit: 'pcs', qty: 80, surface: '本色', unitPrice: 2, amount: 160, remark: '' }
  ]},
  { id: 'dn81', noteNo: 'BL459260175', date: '2025-09-26', customer: '深圳市卓仪光电科技有限公司', orderNo: '', reconciled: '已对帐', company: '佛山市质稳五金有限公司', items: [
    { id: 'di172', materialCode: 'YL-054-160', productName: '电源外壳', spec: '28.8*20.1*160', unit: 'pcs', qty: 1000, surface: '氧化雾银', unitPrice: 1.3, amount: 1300, remark: '' }
  ]},
  { id: 'dn82', noteNo: 'BL459260176', date: '2025-09-26', customer: '珠海金逸电子科技有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di173', materialCode: 'yl-270-130', productName: '电源外壳', spec: '40*22*130', unit: '套', qty: 1586, surface: '氧化雾银', unitPrice: 1.1, amount: 1744.6, remark: '' }
  ]},
  { id: 'dn83', noteNo: 'BL459270177', date: '2025-09-27', customer: '江苏联康电子有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di174', materialCode: '550186-A00', productName: '散热片上盖', spec: '107.4*57.8*29', unit: 'pcs', qty: 5000, surface: '氧化雾银', unitPrice: 1.8, amount: 9000, remark: '' }
  ]},
  { id: 'dn84', noteNo: 'BL459280178', date: '2025-09-28', customer: '东莞市莱斯特电源科技有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di175', materialCode: 'YL-107-260', productName: '电源外壳', spec: '95*50*260mm', unit: 'pcs', qty: 323, surface: '铁灰', unitPrice: 26, amount: 8398, remark: '' }
  ]},
  { id: 'dn85', noteNo: 'BL459440179', date: '2025-10-14', customer: '开普勒灯具', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di176', materialCode: 'yl-270-95', productName: '电源外壳', spec: '40*22*95', unit: 'pcs', qty: 500, surface: '铁灰', unitPrice: 1.2, amount: 600, remark: '' }
  ]},
  { id: 'dn86', noteNo: 'BL459530180', date: '2025-10-23', customer: '珠海市明庆电子有限分司', orderNo: '', reconciled: '已对帐', company: '佛山市质稳五金有限公司', items: [
    { id: 'di177', materialCode: 'YL-054-48', productName: '电源外壳', spec: '28.8*20.1*48', unit: 'pcs', qty: 9980, surface: '氧化雾银', unitPrice: 0.36, amount: 3592.8, remark: '' }
  ]},
  { id: 'dn87', noteNo: 'BL459530181', date: '2025-10-23', customer: '东莞市百川慧通科技有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di178', materialCode: 'BL-003', productName: '小边框', spec: '51.8*11.1*3000', unit: '支', qty: 1701, surface: '砂纹白', unitPrice: 12.5, amount: 21262.5, remark: '' },
    { id: 'di179', materialCode: '预付款', productName: '', spec: '', unit: '', qty: 1, surface: '', unitPrice: -3000, amount: -3000, remark: '' }
  ]},
  { id: 'dn88', noteNo: 'BL459540183', date: '2025-10-24', customer: '佛山市三水弘美电器配件有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di180', materialCode: 'YG25.3*1.15', productName: '铝管6063', spec: '25.3*23*4000', unit: 'kg', qty: 190, surface: '本色', unitPrice: 32, amount: 6080, remark: '' },
    { id: 'di181', materialCode: '405-00731', productName: '铝管6063', spec: 'ø32.7*ø29.5*4000', unit: 'kg', qty: 535, surface: '本色', unitPrice: 32, amount: 17120, remark: '' }
  ]},
  { id: 'dn89', noteNo: 'BL459800185', date: '2025-11-19', customer: '江门深华港湾照明有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di182', materialCode: '1.04.01.0136', productName: 'TODAY 40W端盖', spec: '47X29X13mmΦ7.4', unit: 'pcs', qty: 1000, surface: '氧化黑色', unitPrice: 0.7, amount: 700, remark: '' },
    { id: 'di183', materialCode: '1.04.01.0159. 0001', productName: 'today 30W电源壳体', spec: '46.6X29X102.5mm', unit: 'pcs', qty: 1000, surface: '氧化黑色', unitPrice: 2.8, amount: 2800, remark: '' },
    { id: 'di184', materialCode: '1.04.01.0097', productName: 'Q2-45W端盖', spec: '47X29X13mm，Φ7.4', unit: 'pcs', qty: 1150, surface: '银白', unitPrice: 0.7, amount: 805, remark: '' },
    { id: 'di185', materialCode: '1.04.01.0158.0001', productName: 'today 30W电源壳体', spec: '46.6X29X102.5mm', unit: 'pcs', qty: 1250, surface: '银白', unitPrice: 2, amount: 2500, remark: '' }
  ]},
  { id: 'dn90', noteNo: 'BL459800189', date: '2025-11-19', customer: '江门深华港湾照明有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di186', materialCode: '1.04.01.0136', productName: 'TODAY 40W端盖', spec: '47X29X13mmΦ7.4', unit: 'pcs', qty: 324, surface: '氧化黑色', unitPrice: 0.7, amount: 226.8, remark: '' },
    { id: 'di187', materialCode: '1.04.01.0159. 0001', productName: 'today 30W电源壳体', spec: '46.6X29X102.5mm', unit: 'pcs', qty: 351, surface: '氧化黑色', unitPrice: 2.8, amount: 982.8, remark: '' },
    { id: 'di188', materialCode: '1.04.01.0097', productName: 'Q2-45W端盖', spec: '47X29X13mm，Φ7.4', unit: 'pcs', qty: 450, surface: '银白', unitPrice: 0.7, amount: 315, remark: '' },
    { id: 'di189', materialCode: '1.04.01.0158.0001', productName: 'today 30W电源壳体', spec: '46.6X29X102.5mm', unit: 'pcs', qty: 763, surface: '银白', unitPrice: 2, amount: 1526, remark: '' }
  ]},
  { id: 'dn91', noteNo: 'BL459790193', date: '2025-11-18', customer: '佛山市三水弘美电器配件有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di190', materialCode: 'JG-Φ31.25×Φ27.95', productName: '铝管6063', spec: 'Φ31.25*Φ27.95*4000', unit: 'kg', qty: 205.5, surface: '', unitPrice: 32, amount: 6576, remark: '' },
    { id: 'di191', materialCode: 'YG25.3*1.15', productName: '铝管6063', spec: '25.3*23*4000', unit: 'kg', qty: 278.5, surface: '', unitPrice: 32, amount: 8912, remark: '' }
  ]},
  { id: 'dn92', noteNo: 'BL459810195', date: '2025-11-20', customer: '珠海金逸电子科技有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di192', materialCode: 'YL-054-75', productName: '电源外壳', spec: '28.8*20.1*75', unit: 'pcs', qty: 220, surface: '', unitPrice: 0.5, amount: 110, remark: '' },
    { id: 'di193', materialCode: 'yl-270-130', productName: '电源外壳', spec: '40*22*130', unit: '套', qty: 2399, surface: '', unitPrice: 1.1, amount: 2638.9, remark: '' },
    { id: 'di194', materialCode: 'yl-270-130', productName: '电源外壳', spec: '40*22*130', unit: '套', qty: 604, surface: '', unitPrice: 1.1, amount: 664.4, remark: '补11-16单' }
  ]},
  { id: 'dn93', noteNo: 'BL459810198', date: '2025-11-20', customer: '玖嘉久电子科技', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di195', materialCode: 'YL-869-1', productName: '上盖板', spec: '116*22.9*174.5', unit: '', qty: 109, surface: '', unitPrice: 35.54, amount: 3873.86, remark: '' },
    { id: 'di196', materialCode: 'YL-869-2', productName: '下盖板', spec: '107*6.2*173.4', unit: '', qty: 109, surface: '', unitPrice: 31.33, amount: 3414.97, remark: '' },
    { id: 'di197', materialCode: 'YL-869-3', productName: '按键', spec: '4*3*26.4', unit: '', qty: 109, surface: '', unitPrice: 2.98, amount: 324.82, remark: '' }
  ]},
  { id: 'dn94', noteNo: 'BL459850201', date: '2025-11-24', customer: '佛山市三水弘美电器配件有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di198', materialCode: 'JG-Φ31.25×Φ27.95', productName: '铝管6063', spec: 'Φ31.25*Φ27.95*4000', unit: 'kg', qty: 0, surface: '', unitPrice: 32, amount: 0, remark: '' }
  ]},
  { id: 'dn95', noteNo: 'BL459840202', date: '2025-11-23', customer: '江门深华港湾照明有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di199', materialCode: '1.04.01.0096', productName: 'Q2-45W端盖', spec: '47X29X13mm，Φ10', unit: 'pcs', qty: 1000, surface: '银白', unitPrice: 2, amount: 2000, remark: '' }
  ]},
  { id: 'dn96', noteNo: 'BL459880203', date: '2025-11-27', customer: '东方一号电子有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di200', materialCode: 'yl-270-230', productName: '电源主体', spec: '40*22*230', unit: 'pcs', qty: 1650, surface: '氧化雾银', unitPrice: 2.1, amount: 3465, remark: '' }
  ]},
  { id: 'dn97', noteNo: 'BL459880204', date: '2025-11-27', customer: '和鸿电气股份有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di201', materialCode: '1021772', productName: 'D7散热片', spec: '56*25*4mm', unit: 'pcs', qty: 200, surface: '本色', unitPrice: 0.95, amount: 190, remark: '' },
    { id: 'di202', materialCode: '1021773', productName: 'MOS散热片', spec: '52*25*4mm', unit: 'pcs', qty: 200, surface: '本色', unitPrice: 0.85, amount: 170, remark: '' }
  ]},
  { id: 'dn98', noteNo: 'BL460030206', date: '2025-12-12', customer: '佛山市三水弘美电器配件有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di203', materialCode: 'JG-Φ31.25×Φ27.95', productName: '铝管6063', spec: 'Φ31.25*Φ27.95*4000', unit: 'kg', qty: 990, surface: '本色', unitPrice: 35, amount: 34650, remark: '' }
  ]},
  { id: 'dn99', noteNo: 'BL460100207', date: '2025-12-19', customer: '深圳市卓仪光电科技有限公司', orderNo: '', reconciled: '已对帐', company: '佛山市质稳五金有限公司', items: [
    { id: 'di204', materialCode: 'YL-054-160', productName: '电源外壳', spec: '28.8*20.1*160', unit: '套', qty: 1000, surface: '银白', unitPrice: 1.3, amount: 1300, remark: '' },
    { id: 'di205', materialCode: 'YL-054-95', productName: '电源外壳', spec: '28.8*20.1*95', unit: '套', qty: 300, surface: '银白', unitPrice: 1, amount: 300, remark: '' }
  ]},
  { id: 'dn100', noteNo: 'BL460000209', date: '2025-12-09', customer: '东方一号电子有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di206', materialCode: 'YL-054-198', productName: '电源外壳', spec: '28.8*20.1*198', unit: 'pcs', qty: 529, surface: '银白', unitPrice: 1, amount: 529, remark: '' },
    { id: 'di207', materialCode: '模具费', productName: '', spec: '', unit: '套', qty: 1, surface: '', unitPrice: 1000, amount: 1000, remark: '' }
  ]},
  { id: 'dn101', noteNo: 'BL460210211', date: '2025-12-30', customer: '佛山市三水弘美电器配件有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di208', materialCode: '405-00731', productName: '铝管6063', spec: 'ø32.7*ø29.5*4000', unit: 'kg', qty: 540, surface: '', unitPrice: 35, amount: 18900, remark: '' }
  ]},
  { id: 'dn102', noteNo: 'BL460340212', date: '2026-01-12', customer: '佛山市三水弘美电器配件有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di209', materialCode: '405-00731', productName: '铝管6063', spec: 'ø32.7*ø29.5*4000', unit: 'kg', qty: 495, surface: '', unitPrice: 35, amount: 17325, remark: '' },
    { id: 'di210', materialCode: 'YG25.3*1.15', productName: '铝管6063', spec: '25.3*23*4000', unit: 'kg', qty: 685, surface: '', unitPrice: 35, amount: 23975, remark: '' }
  ]},
  { id: 'dn103', noteNo: 'BL460380214', date: '2026-01-16', customer: '江苏镭科照明科技有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di211', materialCode: '方铝管25*25*2.0', productName: '铝管6063', spec: '25*25*4040', unit: 'kg', qty: 2436, surface: '本色', unitPrice: 28.4, amount: 69182.4, remark: '1256支' }
  ]},
  { id: 'dn104', noteNo: 'BL460400215', date: '2026-01-18', customer: '江门深华港湾照明有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di212', materialCode: '1.04.01.0096', productName: 'Q2-45W端盖', spec: '47X29X13mm，Φ10', unit: 'pcs', qty: 1000, surface: '氧化雾银', unitPrice: 0, amount: 0, remark: '' }
  ]},
  { id: 'dn105', noteNo: 'BL460420216', date: '2026-01-20', customer: '珠海金逸电子科技有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di213', materialCode: 'YL-054-45', productName: '电源外壳', spec: '28.8*20.1*45', unit: 'pcs', qty: 5000, surface: '银白', unitPrice: 0.32, amount: 1600, remark: '' },
    { id: 'di214', materialCode: 'yl-270-130', productName: '电源外壳', spec: '40*22*130', unit: 'pcs', qty: 470, surface: '银白', unitPrice: 1.1, amount: 517, remark: '' }
  ]},
  { id: 'dn106', noteNo: 'BL460430218', date: '2026-01-21', customer: '凯明智汇科技（东莞）有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di215', materialCode: 'YL-014-95', productName: '电源外壳', spec: '71.5*41.7*95', unit: '套', qty: 1000, surface: '铁灰', unitPrice: 5.5, amount: 5500, remark: '' }
  ]},
  { id: 'dn107', noteNo: 'BL460460219', date: '2026-01-24', customer: '江门深华港湾照明有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di216', materialCode: '51.04.01.1418.0002', productName: 'Reach型材', spec: '18*3.4*1122.6', unit: '支', qty: 32, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di217', materialCode: '51.04.01.1480.0001', productName: 'LIRO光源支架', spec: '1080.7X67X6.9', unit: '支', qty: 36, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di218', materialCode: '上机费', productName: '', spec: '', unit: '次', qty: 2, surface: '', unitPrice: 0, amount: 0, remark: '' }
  ]},
  { id: 'dn108', noteNo: 'BL460460222', date: '2026-01-24', customer: '深圳美因联电子有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di219', materialCode: 'YL-079-80', productName: '电源外壳', spec: '', unit: '套', qty: 1000, surface: '', unitPrice: 3.9, amount: 3900, remark: '' }
  ]},
  { id: 'dn109', noteNo: 'XK-1-T-2026-2-5-12', date: '2026-02-05', customer: '佛山市奕旺照明科技有限公司', orderNo: '', reconciled: '', company: '佛山市碧利莱照明有限公司', items: [
    { id: 'di220', materialCode: '304 -16不锈钢', productName: '十字圆头半牙螺钉', spec: 'M5X 16', unit: 'pcs', qty: 50578, surface: '', unitPrice: 0.14, amount: 7080.92, remark: '' },
    { id: 'di221', materialCode: '304 -17不锈钢', productName: '十字圆头半牙螺钉', spec: 'M5X 17', unit: 'pcs', qty: 51969, surface: '', unitPrice: 0.14, amount: 7275.66, remark: '' }
  ]},
  { id: 'dn110', noteNo: 'BL460590225', date: '2026-02-06', customer: '江苏镭科照明科技有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di222', materialCode: 'LZ-001-00', productName: '铝支撑', spec: '500*80*160', unit: '', qty: 2000, surface: '', unitPrice: 35, amount: 70000, remark: '' },
    { id: 'di223', materialCode: 'LZ-002', productName: 'L型特殊铝块', spec: '70*70*20.4', unit: '', qty: 25000, surface: '', unitPrice: 3.17, amount: 79250, remark: '' },
    { id: 'di224', materialCode: 'LZ-003', productName: '铝板3.0mm', spec: '180*80*3.0', unit: '', qty: 2000, surface: '', unitPrice: 4.23, amount: 8460, remark: '' },
    { id: 'di225', materialCode: 'LZ-004', productName: '方铝片2.3mm', spec: '178*82*2.3', unit: '', qty: 2150, surface: '', unitPrice: 3.2, amount: 6880, remark: '' }
  ]},
  { id: 'dn111', noteNo: 'BL0229', date: '', customer: '刘先生', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di226', materialCode: '48*35', productName: '', spec: '', unit: '', qty: 400, surface: '', unitPrice: 9, amount: 3600, remark: '' },
    { id: 'di227', materialCode: '48*58', productName: '', spec: '', unit: '', qty: 400, surface: '', unitPrice: 9.5, amount: 3800, remark: '' },
    { id: 'di228', materialCode: '48*60', productName: '', spec: '', unit: '', qty: 2000, surface: '', unitPrice: 10, amount: 20000, remark: '' },
    { id: 'di229', materialCode: '31*58', productName: '', spec: '', unit: '', qty: 300, surface: '', unitPrice: 7, amount: 2100, remark: '' },
    { id: 'di230', materialCode: '31*55', productName: '', spec: '', unit: '', qty: 1800, surface: '', unitPrice: 7, amount: 12600, remark: '' },
    { id: 'di231', materialCode: '31*35', productName: '', spec: '', unit: '', qty: 300, surface: '', unitPrice: 7, amount: 2100, remark: '' },
    { id: 'di232', materialCode: '36*21', productName: '', spec: '', unit: '', qty: 500, surface: '', unitPrice: 3, amount: 1500, remark: '' },
    { id: 'di233', materialCode: '33.8*78.1', productName: '', spec: '', unit: '', qty: 500, surface: '', unitPrice: 11, amount: 5500, remark: '' },
    { id: 'di234', materialCode: '36*52', productName: '', spec: '', unit: '', qty: 100, surface: '', unitPrice: 6.5, amount: 650, remark: '' },
    { id: 'di235', materialCode: '27.8*78.1样品', productName: '', spec: '', unit: '', qty: 10, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di236', materialCode: '36*21样品', productName: '', spec: '', unit: '', qty: 10, surface: '', unitPrice: 0, amount: 0, remark: '' }
  ]},
  { id: 'dn112', noteNo: 'BL0240', date: '', customer: '', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di237', materialCode: '48*35', productName: '', spec: '', unit: '', qty: 400, surface: '', unitPrice: 9, amount: 3600, remark: '' },
    { id: 'di238', materialCode: '48*58', productName: '', spec: '', unit: '', qty: 400, surface: '', unitPrice: 6.8, amount: 2720, remark: '' },
    { id: 'di239', materialCode: '48*60', productName: '', spec: '', unit: '', qty: 2000, surface: '', unitPrice: 9, amount: 18000, remark: '' },
    { id: 'di240', materialCode: '31*58', productName: '', spec: '', unit: '', qty: 300, surface: '', unitPrice: 5.5, amount: 1650, remark: '' },
    { id: 'di241', materialCode: '31*55', productName: '', spec: '', unit: '', qty: 1800, surface: '', unitPrice: 6.5, amount: 11700, remark: '' },
    { id: 'di242', materialCode: '31*35', productName: '', spec: '', unit: '', qty: 300, surface: '', unitPrice: 8, amount: 2400, remark: '' },
    { id: 'di243', materialCode: '36*21', productName: '', spec: '', unit: '', qty: 500, surface: '', unitPrice: 3, amount: 1500, remark: '' },
    { id: 'di244', materialCode: '33.8*78.1', productName: '', spec: '', unit: '', qty: 500, surface: '', unitPrice: 10.5, amount: 5250, remark: '' },
    { id: 'di245', materialCode: '36*52', productName: '', spec: '', unit: '', qty: 100, surface: '', unitPrice: 6, amount: 600, remark: '' }
  ]},
  { id: 'dn113', noteNo: 'BL460970249', date: '2026-03-16', customer: '江苏镭科照明科技有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di246', materialCode: 'LZ-001-00', productName: '铝支撑', spec: '500*80*160', unit: 'pcs', qty: 2000, surface: '', unitPrice: 0, amount: 0, remark: '3月12日发100个' },
    { id: 'di247', materialCode: 'LZ-002', productName: 'L型特殊铝块', spec: '70*70*20.4', unit: 'pcs', qty: 25000, surface: '', unitPrice: 0, amount: 0, remark: '3月12日发200个' },
    { id: 'di248', materialCode: 'LZ-003', productName: '铝板3.0mm', spec: '180*80*3.0', unit: 'pcs', qty: 2000, surface: '', unitPrice: 0, amount: 0, remark: '3月12日发200个' }
  ]},
  { id: 'dn114', noteNo: 'BL0252', date: '', customer: '江苏镭科照明科技有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di249', materialCode: 'LZ-004', productName: '方铝片2.3mm', spec: '178*82*2.3', unit: 'pcs', qty: 2150, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di250', materialCode: 'yl-872', productName: '带挂钩的铝块', spec: '20.4*20.2*99.6', unit: '', qty: 100, surface: '拉丝', unitPrice: 4.98, amount: 498, remark: '' }
  ]},
  { id: 'dn115', noteNo: 'BL460980254', date: '2026-03-17', customer: '佛山市三水弘美电器配件有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di251', materialCode: 'YG25.3*1.15', productName: '铝管6063', spec: '25.3*23*4000', unit: '', qty: 440, surface: '', unitPrice: 35, amount: 15400, remark: '' }
  ]},
  { id: 'dn116', noteNo: 'BL460970255', date: '2026-03-16', customer: '江苏镭科照明科技有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di252', materialCode: 'YL-036-151', productName: '电源外壳', spec: '69.8*42.6*151', unit: '', qty: 100, surface: '氧化雾银', unitPrice: 11, amount: 1100, remark: '' }
  ]},
  { id: 'dn117', noteNo: 'BL460990256', date: '2026-03-18', customer: '江门深华港湾照明有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di253', materialCode: '1.04.01.1099. 9902', productName: 'IGUASSU支架端盖-1', spec: '42.4*47.9*2.0', unit: '个', qty: 100, surface: '砂白', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di254', materialCode: '1.04.01.1100. 9902', productName: 'IGUASSU支架端盖-2', spec: '42.4*47.9*2.0', unit: '个', qty: 100, surface: '砂白', unitPrice: 0, amount: 0, remark: '' }
  ]},
  { id: 'dn118', noteNo: 'BL461060258', date: '2026-03-25', customer: '珠海市明庆电子有限分司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di255', materialCode: 'YL-054-48', productName: '电源外壳', spec: '28.8*20.1*48', unit: '个', qty: 3032, surface: '', unitPrice: 0.41, amount: 1243.12, remark: '2026/3/24发848' }
  ]},
  { id: 'dn119', noteNo: 'BL461070259', date: '2026-03-26', customer: '深圳市卓仪光电科技有限公司', orderNo: '', reconciled: '已对帐', company: '佛山市质稳五金有限公司', items: [
    { id: 'di256', materialCode: 'YL-054-160', productName: '电源外壳', spec: '28.8*20.1*160', unit: '套', qty: 1000, surface: '铁灰', unitPrice: 1.4, amount: 1400, remark: '' },
    { id: 'di257', materialCode: 'YL-054-160', productName: '电源外壳', spec: '28.8*20.1*160', unit: '套', qty: 1000, surface: '氧化雾银', unitPrice: 1.4, amount: 1400, remark: '' }
  ]},
  { id: 'dn120', noteNo: 'BL461140261', date: '2026-04-02', customer: '江苏镭科照明科技有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di258', materialCode: 'yl-872', productName: '带挂钩的铝块', spec: '20.4*20.2*99.6', unit: '套', qty: 100, surface: '拉丝', unitPrice: 4.98, amount: 498, remark: '' },
    { id: 'di259', materialCode: 'YL-036-151', productName: '电源外壳', spec: '69.8*42.6*151', unit: '套', qty: 100, surface: '氧化雾银', unitPrice: 11, amount: 1100, remark: '' },
    { id: 'di260', materialCode: 'LZ-012', productName: '卡箍用卡扣', spec: '42*20.8*10', unit: '套', qty: 150, surface: '镀白锌', unitPrice: 125, amount: 18750, remark: '' },
    { id: 'di261', materialCode: 'YL-874', productName: '只型铝板', spec: '70*49.4*100.2', unit: 'pcs', qty: 3000, surface: '', unitPrice: 9.6, amount: 28800, remark: '' },
    { id: 'di262', materialCode: 'YL-874-46', productName: '铝支架', spec: '70*49.4*46', unit: 'pcs', qty: 200, surface: '', unitPrice: 9.25, amount: 1850, remark: '' },
    { id: 'di263', materialCode: 'LZ-010', productName: 'U型制动钳', spec: '33.3*8.3*18', unit: 'pcs', qty: 15000, surface: '镀彩锌', unitPrice: 0.7, amount: 10500, remark: '' },
    { id: 'di264', materialCode: 'LZ-002', productName: 'L型特殊铝块', spec: '70*70*20.4', unit: 'pcs', qty: 5000, surface: '', unitPrice: 3.17, amount: 15850, remark: '' }
  ]},
  { id: 'dn121', noteNo: 'BL461120268', date: '2026-03-31', customer: '凯明智汇科技（东莞）有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di265', materialCode: 'YL-014-95', productName: '电源外壳', spec: '71.5*41.7*95', unit: '套', qty: 808, surface: '铁灰', unitPrice: 5.7, amount: 4605.6, remark: '欠主体192个' },
    { id: 'di266', materialCode: 'YL-014-95', productName: '主体', spec: '71.5*41.7*95', unit: 'pcs', qty: 808, surface: '铁灰', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di267', materialCode: 'yl-015-95', productName: '盖板', spec: '62.7*1.5*95', unit: 'pcs', qty: 1035, surface: '铁灰', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di268', materialCode: 'yl-014-13地线孔', productName: '堵头', spec: '72*42*13', unit: 'pcs', qty: 1079, surface: '铁灰', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di269', materialCode: 'yl-014-13', productName: '堵头', spec: '72*42*13', unit: 'pcs', qty: 1022, surface: '铁灰', unitPrice: 0, amount: 0, remark: '' }
  ]},
  { id: 'dn122', noteNo: 'BL461140273', date: '2026-04-02', customer: '广州凯佳电子有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di270', materialCode: 'BL-126-144', productName: '底板', spec: '55*1.5*144mm', unit: 'pcs', qty: 800, surface: '银白', unitPrice: 2.3, amount: 1840, remark: '' }
  ]},
  { id: 'dn123', noteNo: 'BL461130274', date: '2026-04-01', customer: '珠海市明庆电子有限分司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di271', materialCode: 'YL-054-48', productName: '电源外壳', spec: '28.8*20.1*48', unit: 'pcs', qty: 4368, surface: '氧化雾银', unitPrice: 0.41, amount: 1790.88, remark: '' }
  ]},
  { id: 'dn124', noteNo: 'BL461140275', date: '2026-04-02', customer: '珠海市明庆电子有限分司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di272', materialCode: 'YL-054-48', productName: '电源外壳', spec: '28.8*20.1*48', unit: 'pcs', qty: 2184, surface: '氧化雾银', unitPrice: 0.41, amount: 895.44, remark: '' }
  ]},
  { id: 'dn125', noteNo: 'BL461160276', date: '2026-04-04', customer: '江苏镭科照明科技有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di273', materialCode: 'LZ-010', productName: 'U型制动钳', spec: '33.3*8.3*18', unit: 'pcs', qty: 15000, surface: '镀彩锌', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di274', materialCode: 'YL-874', productName: '只型铝板', spec: '70*49.4*100.2', unit: 'pcs', qty: 3000, surface: '', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di275', materialCode: 'YL-036-151', productName: '电源外壳', spec: '69.8*42.6*151', unit: '套', qty: 100, surface: '氧化雾银', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di276', materialCode: 'YL-872', productName: '带挂钩的铝块', spec: '20.4*20.2*99.6', unit: '套', qty: 100, surface: '拉丝', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di277', materialCode: 'LZ-002', productName: 'L型特殊铝块', spec: '70*70*20.4', unit: 'pcs', qty: 5000, surface: '', unitPrice: 0, amount: 0, remark: '' }
  ]},
  { id: 'dn126', noteNo: 'BL461200281', date: '2026-04-08', customer: '珠海金逸电子科技有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di278', materialCode: 'YL-054-95', productName: '电源外壳', spec: '28.8*20.1*95', unit: 'pcs', qty: 1020, surface: '氧化雾银', unitPrice: 0.6, amount: 612, remark: '' }
  ]},
  { id: 'dn127', noteNo: 'BL461260282', date: '2026-04-14', customer: '珠海市明庆电子有限分司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di279', materialCode: 'YL-054-48', productName: '电源外壳', spec: '28.8*20.1*48', unit: 'pcs', qty: 10586, surface: '氧化雾银', unitPrice: 0.41, amount: 4340.26, remark: '' }
  ]},
  { id: 'dn128', noteNo: 'BL0283', date: '', customer: '东莞市百川慧通科技有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di280', materialCode: 'BL-003-2000', productName: '小边框', spec: '51.8*11.1*2000', unit: '支', qty: 3095, surface: '喷涂', unitPrice: 10, amount: 30950, remark: '' }
  ]},
  { id: 'dn129', noteNo: 'BL461330284', date: '2026-04-21', customer: '东莞市莱斯特电源科技有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di281', materialCode: 'YL-107-260', productName: '电源外壳', spec: '95*50*260mm', unit: 'pcs', qty: 255, surface: '铁灰', unitPrice: 28, amount: 7140, remark: '' },
    { id: 'di282', materialCode: 'YL-107-1', productName: '堵头+地线孔', spec: '95*13*50', unit: 'pcs', qty: 153, surface: '铁灰', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di283', materialCode: 'YL-107-2', productName: '堵头', spec: '95*13*50', unit: 'pcs', qty: 153, surface: '铁灰', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di284', materialCode: 'YL-108-260', productName: '盖板', spec: '260*80*3', unit: 'pcs', qty: 233, surface: '铁灰', unitPrice: 0, amount: 0, remark: '' }
  ]},
  { id: 'dn130', noteNo: 'BL461350288', date: '2026-04-23', customer: '江苏镭科照明科技有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di285', materialCode: '方铝管25*25*2.0', productName: '铝管6063', spec: '25*25*4040', unit: 'KG', qty: 1514, surface: '本色', unitPrice: 29.15, amount: 44133.1, remark: '' }
  ]},
  { id: 'dn131', noteNo: 'BL461350289', date: '2026-04-23', customer: '廖先生', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di286', materialCode: '外径46.80*59.30（7.8内孔）', productName: '碗', spec: 'ø46.8*59.3', unit: '', qty: 20, surface: '', unitPrice: 11, amount: 220, remark: '4月19日发' },
    { id: 'di287', materialCode: '外径46.80*59.30（7.8内孔）', productName: '碗', spec: 'ø46.8*59.3', unit: '', qty: 1680, surface: '', unitPrice: 11, amount: 18480, remark: '' },
    { id: 'di288', materialCode: '外径31*21', productName: '堵头', spec: 'ø31*21', unit: '', qty: 1007, surface: '', unitPrice: 3.5, amount: 3524.5, remark: '' }
  ]},
  { id: 'dn132', noteNo: 'BL461370292', date: '2026-04-25', customer: '广州凯佳电子有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di289', materialCode: 'BL-126-144', productName: '底板', spec: '55*1.5*144mm', unit: 'pcs', qty: 5920, surface: '', unitPrice: 1.5, amount: 8880, remark: '' }
  ]},
  { id: 'dn133', noteNo: 'BL461420293', date: '2026-04-30', customer: '佛山市三水弘美电器配件有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di290', materialCode: '405-00731', productName: '铝管6063', spec: 'ø32.7*ø29.5*4000', unit: 'kg', qty: 525, surface: '', unitPrice: 35, amount: 18375, remark: '' }
  ]},
  { id: 'dn134', noteNo: 'BL461480294', date: '2026-05-06', customer: '廖先生', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di291', materialCode: '外径46.80*59.30（7.8内孔）', productName: '碗', spec: 'ø46.8*59.3', unit: '', qty: 700, surface: '', unitPrice: 11, amount: 7700, remark: '' },
    { id: 'di292', materialCode: '外径46.80*59.30（9.0内孔）', productName: '碗', spec: 'ø46.8*59.3', unit: '', qty: 750, surface: '', unitPrice: 11, amount: 8250, remark: '' }
  ]},
  { id: 'dn135', noteNo: 'BL461480298', date: '2026-05-06', customer: '江门深华港湾照明有限公司', orderNo: '5PO-2026-03-0246', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di293', materialCode: '1.04.01.1099. 9902', productName: 'IGUASSU支架端盖-1', spec: '42.4*47.9*2.0', unit: 'pcs', qty: 500, surface: '砂白', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di294', materialCode: '1.04.01.1100. 9902', productName: 'IGUASSU支架端盖-2', spec: '42.4*47.9*2.0', unit: 'pcs', qty: 500, surface: '砂白', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di295', materialCode: '1.04.01.1128. 9903', productName: 'IGUASSU单灯主体端盖-1', spec: '42.4*99.5*2.0', unit: 'pcs', qty: 400, surface: '砂白', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di296', materialCode: '1.04.01.1129. 9903', productName: 'IGUASSU单灯主体端盖-2', spec: '42.4*99.5*2.0', unit: 'pcs', qty: 400, surface: '砂白', unitPrice: 0, amount: 0, remark: '' }
  ]},
  { id: 'dn136', noteNo: 'BL461500302', date: '2026-05-08', customer: '江门深华港湾照明有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di297', materialCode: '51.04.01.1524.0001', productName: '黄灯管-铝型材', spec: '1135x23.8x11', unit: 'pcs', qty: 80, surface: '本色', unitPrice: 0, amount: 0, remark: '' }
  ]},
  { id: 'dn137', noteNo: 'BL461540303', date: '2026-05-12', customer: '江苏镭科照明科技有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di298', materialCode: 'LZ-006', productName: '铝架配件', spec: '54.5*27.3*50', unit: 'pcs', qty: 2330, surface: '', unitPrice: 2.8, amount: 6524, remark: '' }
  ]},
  { id: 'dn138', noteNo: 'BL457930304', date: '2025-05-16', customer: '东莞市希迈精密制造有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di299', materialCode: 'LZ-006', productName: '铝架配件', spec: '54.5*27.3*50', unit: 'pcs', qty: 800, surface: '本色', unitPrice: 2.8, amount: 2240, remark: '' }
  ]},
  { id: 'dn139', noteNo: 'BL461550306', date: '2026-05-13', customer: '廖先生', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di300', materialCode: '外径50*127.5', productName: '短管', spec: '', unit: 'pcs', qty: 204, surface: '', unitPrice: 18, amount: 3672, remark: '' },
    { id: 'di301', materialCode: '外径28.9*67', productName: '接头', spec: '', unit: 'pcs', qty: 500, surface: '', unitPrice: 13, amount: 6500, remark: '旧款6槽' },
    { id: 'di302', materialCode: '外径50*147.5', productName: '长管', spec: '', unit: 'pcs', qty: 150, surface: '', unitPrice: 19, amount: 2850, remark: '' },
    { id: 'di303', materialCode: '外径50*13', productName: '大接头', spec: 'ø50*13', unit: 'pcs', qty: 750, surface: '', unitPrice: 8.6, amount: 6450, remark: '' }
  ]},
  { id: 'dn140', noteNo: 'BL461590310', date: '2026-05-17', customer: '廖先生', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di304', materialCode: '外径50*40（7.8孔）', productName: '碗', spec: 'ø50*40', unit: 'pcs', qty: 114, surface: '', unitPrice: 14.6, amount: 1664.4, remark: '' },
    { id: 'di305', materialCode: '外径28.9*59', productName: '接头', spec: '', unit: 'pcs', qty: 500, surface: '', unitPrice: 13, amount: 6500, remark: '' },
    { id: 'di306', materialCode: '外径42*13', productName: '小接头', spec: '', unit: 'pcs', qty: 600, surface: '', unitPrice: 7.5, amount: 4500, remark: '' }
  ]},
  { id: 'dn141', noteNo: 'BL461600313', date: '2026-05-18', customer: '佛山市三水弘美电器配件有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di307', materialCode: 'YG25.3*1.15', productName: '铝管6063', spec: '25.3*23*4000', unit: 'kg', qty: 463, surface: '', unitPrice: 35, amount: 16205, remark: '' }
  ]},
  { id: 'dn142', noteNo: 'BL461600314', date: '2026-05-18', customer: '珠海市启阳电子有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di308', materialCode: 'YL-871-200', productName: '电源外壳', spec: '39.6*21.33*200', unit: 'pcs', qty: 232, surface: '氧化雾银', unitPrice: 1.91, amount: 443.12, remark: '' },
    { id: 'di309', materialCode: 'YL-054-65', productName: '电源外壳', spec: '20.3*29.3*65', unit: 'pcs', qty: 1238, surface: '氧化雾银', unitPrice: 0.59, amount: 730.42, remark: '' }
  ]},
  { id: 'dn143', noteNo: 'BL461630316', date: '2026-05-21', customer: '江门深华港湾照明有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di310', materialCode: '51.04.01.1522.0001', productName: 'LIFA-4OW滑轨', spec: '60x23x7.2mm,', unit: 'pcs', qty: 991, surface: '氧化雾银', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di311', materialCode: '51.04.01.1523.0001', productName: 'LIFA一15OW滑轨', spec: '80x23x7.2mm,', unit: 'pcs', qty: 1000, surface: '氧化雾银', unitPrice: 0, amount: 0, remark: '' }
  ]},
  { id: 'dn144', noteNo: 'BL461650318', date: '2026-05-23', customer: '廖先生', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di312', materialCode: '外径50*127.5', productName: '短管', spec: '', unit: 'pcs', qty: 183, surface: '', unitPrice: 0, amount: 0, remark: '补退货' },
    { id: 'di313', materialCode: '外径39*59.30（7.8内孔）', productName: '碗', spec: '', unit: 'pcs', qty: 384, surface: '', unitPrice: 10, amount: 3840, remark: '' },
    { id: 'di314', materialCode: '外径42*145.70', productName: '小长管', spec: '', unit: 'pcs', qty: 600, surface: '', unitPrice: 16, amount: 9600, remark: '' },
    { id: 'di315', materialCode: '外径42*40（7.8孔）', productName: '', spec: '', unit: 'pcs', qty: 600, surface: '', unitPrice: 13.4, amount: 8040, remark: '' },
    { id: 'di316', materialCode: '外径50*40（7.8孔）', productName: '碗', spec: 'ø50*40', unit: 'pcs', qty: 600, surface: '', unitPrice: 14.6, amount: 8760, remark: '' },
    { id: 'di317', materialCode: '外径50*40（9.0孔）', productName: '碗', spec: 'ø50*40', unit: 'pcs', qty: 150, surface: '', unitPrice: 14.6, amount: 2190, remark: '' }
  ]},
  { id: 'dn145', noteNo: 'BL461750324', date: '2026-06-02', customer: '凯明智汇科技（东莞）有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di318', materialCode: 'YL-014-95', productName: '电源外壳', spec: '71.5*41.7*95', unit: '套', qty: 1192, surface: '铁灰', unitPrice: 5.7, amount: 6794.4, remark: '' },
    { id: 'di319', materialCode: 'YL-014-123', productName: '电源外壳', spec: '71.5*41.7*123', unit: '套', qty: 500, surface: '铁灰', unitPrice: 7.5, amount: 3750, remark: '' }
  ]},
  { id: 'dn146', noteNo: 'BL461740326', date: '2026-06-01', customer: '廖先生', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di320', materialCode: '外径39*59.30（7.8内孔）', productName: '碗', spec: '', unit: '', qty: 2632, surface: '', unitPrice: 10, amount: 26320, remark: '' }
  ]},
  { id: 'dn147', noteNo: 'BL461530327', date: '2026-05-11', customer: '江苏联康电子有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di321', materialCode: '550186-A00', productName: '散热片上盖', spec: '107.4*57.8*29', unit: 'pcs', qty: 2000, surface: '砂白', unitPrice: 0, amount: 0, remark: '' }
  ]},
  { id: 'dn148', noteNo: 'BL461780328', date: '2026-06-05', customer: '江苏联康电子有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di322', materialCode: '550186-A00', productName: '散热片上盖', spec: '107.4*57.8*29', unit: 'pcs', qty: 1936, surface: '砂白', unitPrice: 0, amount: 0, remark: '' }
  ]},
  { id: 'dn149', noteNo: 'BL461830329', date: '2026-06-10', customer: '江苏联康电子有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di323', materialCode: '550186-A00', productName: '散热片上盖', spec: '107.4*57.8*29', unit: 'pcs', qty: 3048, surface: '砂白', unitPrice: 0, amount: 0, remark: '' }
  ]},
  { id: 'dn150', noteNo: 'BL461830330', date: '2026-06-10', customer: '佛山市三水弘美电器配件有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di324', materialCode: 'YG25.3*1.15', productName: '铝管6063', spec: '25.3*23*4000', unit: 'pcs', qty: 650, surface: '', unitPrice: 35, amount: 22750, remark: '' }
  ]},
  { id: 'dn151', noteNo: 'BL461830331', date: '2026-06-10', customer: '江门深华港湾照明有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di325', materialCode: '51.04.01.1524.0001', productName: '黄灯管-铝型材', spec: '1135x23.8x11', unit: '支', qty: 1050, surface: '本色', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di326', materialCode: '51.04.01.1524.0001', productName: '黄灯管-铝型材', spec: '1135x23.8x11', unit: '支', qty: 75, surface: '本色', unitPrice: 0, amount: 0, remark: '' }
  ]},
  { id: 'dn152', noteNo: 'BL461830333', date: '2026-06-10', customer: '广州凯佳电子有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di327', materialCode: 'BL-126-140', productName: '底板', spec: '52*1.5*140mm', unit: 'pcs', qty: -673, surface: '氧化雾银', unitPrice: 1.5, amount: -1009.5, remark: '2846364' }
  ]},
  { id: 'dn153', noteNo: 'BL461840334', date: '2026-06-11', customer: '江门深华港湾照明有限公司', orderNo: '5PO-2026-04-0175', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di328', materialCode: '1.04.01.0097', productName: 'Q2-45W端盖', spec: '47X29X13mm，Φ7.4', unit: 'pcs', qty: 1000, surface: '氧化雾银', unitPrice: 0.7, amount: 700, remark: '' },
    { id: 'di329', materialCode: '1.04.01.0135', productName: 'TODAY 40W端盖', spec: '47X29X13mmΦ10', unit: 'pcs', qty: 1000, surface: '氧化黑色', unitPrice: 0.7, amount: 700, remark: '' }
  ]},
  { id: 'dn154', noteNo: 'BL461910336', date: '2026-06-18', customer: '佛山市三水弘美电器配件有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di330', materialCode: '405-00731', productName: '铝管6063', spec: 'ø32.7*ø29.5*4000', unit: 'kg', qty: 495.5, surface: '本色', unitPrice: 35, amount: 17342.5, remark: '' }
  ]},
  { id: 'dn155', noteNo: 'BL461780337', date: '2026-06-05', customer: '合肥智测电子有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di331', materialCode: 'yl-424', productName: '散热器', spec: '130.7*38.4*219', unit: 'pcs', qty: 100, surface: '砂银', unitPrice: 97.5, amount: 9750, remark: '' }
  ]},
  { id: 'dn156', noteNo: 'BL461550338', date: '2026-05-13', customer: '珠海金逸电子科技有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di332', materialCode: 'yl-270-130', productName: '电源外壳', spec: '40*22*130', unit: 'pcs', qty: 3116, surface: '氧化雾银', unitPrice: 1.1, amount: 3427.6, remark: '' }
  ]},
  { id: 'dn157', noteNo: 'BL462090339', date: '2026-07-06', customer: '东莞市莱斯特电源科技有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di333', materialCode: 'YL-107-260', productName: '电源外壳', spec: '95*50*260mm', unit: 'pcs', qty: 599, surface: '铁灰', unitPrice: 28, amount: 16772, remark: '' },
    { id: 'di334', materialCode: 'YL-108-260', productName: '盖板', spec: '260*80*3', unit: 'pcs', qty: 506, surface: '铁灰', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di335', materialCode: 'YL-107-1', productName: '堵头+地线孔', spec: '95*13*50', unit: 'pcs', qty: 722, surface: '铁灰', unitPrice: 0, amount: 0, remark: '' },
    { id: 'di336', materialCode: 'YL-107-2', productName: '堵头', spec: '95*13*50', unit: 'pcs', qty: 696, surface: '铁灰', unitPrice: 0, amount: 0, remark: '' }
  ]},
  { id: 'dn158', noteNo: 'BL462260343', date: '2026-07-23', customer: '江门深华港湾照明有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di337', materialCode: '51.04.01.1480.0001', productName: 'LIRO光源支架', spec: '1080.7X67X6.9', unit: '条', qty: 555, surface: '本色', unitPrice: 8.5, amount: 4717.5, remark: '' }
  ]},
  { id: 'dn159', noteNo: 'BL462280344', date: '2026-07-25', customer: '东方一号电子有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di338', materialCode: 'yl-270-230', productName: '电源主体', spec: '40*22*230', unit: '套', qty: 1620, surface: '本色', unitPrice: 2.1, amount: 3402, remark: '' }
  ]},
  { id: 'dn160', noteNo: 'BL462450345', date: '2026-08-11', customer: '珠海金逸电子科技有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di339', materialCode: 'YL-054-117', productName: '电源外壳', spec: '28.8*20.1*117', unit: 'pcs', qty: 6047, surface: '氧化雾银', unitPrice: 0.75, amount: 4535.25, remark: '' }
  ]},
  { id: 'dn161', noteNo: 'BL462510346', date: '2026-08-17', customer: '东方一号电子有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di340', materialCode: 'YL-054-280', productName: '电源外壳', spec: '28.8*20.1*280', unit: 'pcs', qty: 274, surface: '氧化雾银', unitPrice: 2.1, amount: 575.4, remark: '' }
  ]},
  { id: 'dn162', noteNo: 'BL462530347', date: '2026-08-19', customer: '东莞市莱斯特电源科技有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di341', materialCode: 'YL-054-220', productName: '电源外壳', spec: '20.3*29.3*220', unit: 'pcs', qty: 102, surface: '氧化黑色', unitPrice: 3, amount: 306, remark: '' },
    { id: 'di342', materialCode: 'YL-108-260', productName: '盖板', spec: '260*80*3', unit: 'pcs', qty: 219, surface: '铁灰', unitPrice: 0, amount: 0, remark: '' }
  ]},
  { id: 'dn163', noteNo: 'BL462610349', date: '2026-08-27', customer: '佛山市三水弘美电器配件有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di343', materialCode: '405-00731', productName: '铝管6063', spec: 'ø32.7*ø29.5*4000', unit: 'KG', qty: 347, surface: '', unitPrice: 35, amount: 12145, remark: '' },
    { id: 'di344', materialCode: '405-00731', productName: '铝管6063', spec: 'ø32.7*ø29.5*4000', unit: 'KG', qty: -45, surface: '', unitPrice: 35, amount: -1575, remark: '' }
  ]},
  { id: 'dn164', noteNo: 'BL462610352', date: '2026-08-27', customer: '珠海金逸电子科技有限公司', orderNo: '', reconciled: '', company: '佛山市质稳五金有限公司', items: [
    { id: 'di345', materialCode: 'yl-270-130', productName: '电源外壳', spec: '40*22*130', unit: '套', qty: 1006, surface: '氧化雾银', unitPrice: 1.1, amount: 1106.6, remark: '' },
    { id: 'di346', materialCode: '1.04.01.1260. 9901', productName: '', spec: '', unit: 'pcs', qty: 2000, surface: '氧化雾银', unitPrice: 2000, amount: 0, remark: '' }
  ]},
];

// 发货公司
export const deliveryCompanies = [
  "佛山市质稳五金有限公司",
  "佛山市碧利莱照明有限公司",
];
