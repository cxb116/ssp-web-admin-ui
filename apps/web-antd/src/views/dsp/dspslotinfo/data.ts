import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DspSlotInfoApi } from '#/api/dsp/dspslotinfo';
import type { DspProductApi } from '#/api/dsp/product';
import type { DspCompanyApi } from '#/api/dsp/company';

import { DICT_TYPE } from '@vben/constants';
import { getDictOptions } from '@vben/hooks';

import { getProduct, getProductPage } from '#/api/dsp/product';
import { getCompanyPage } from '#/api/dsp/company';
import { getSlotInfoPage } from '#/api/dsp/dspslotinfo';

async function getProductOptions() {
  const res = await getProductPage({ pageNo: 1, pageSize: 1000 });
  return (res.list || []).map((product: DspProductApi.Product) => ({
    label: `${product.name || ''}(${product.id})`,
    value: product.id,
  }));
}

// 表单用：接收 ApiComponent 传入的 params（含 companyId），按公司加载产品
async function getFormProductOptions(params: { companyId?: number }) {
  if (!params?.companyId) return [];
  const res = await getProductPage({
    pageNo: 1,
    pageSize: 1000,
    companyId: params.companyId,
  });
  return (res.list || []).map((product: DspProductApi.Product) => ({
    label: `${product.name || ''}(${product.id})`,
    value: product.id,
  }));
}

async function getCompanyOptions() {
  const res = await getCompanyPage({ pageNo: 1, pageSize: 1000 });
  return (res.list || []).map((company: DspCompanyApi.Company) => ({
    label: `${company.name || ''}(${company.id})`,
    value: company.id,
  }));
}

async function getSlotNameOptions() {
  const res = await getSlotInfoPage({ pageNo: 1, pageSize: 1000 });
  const seen = new Set<string>();
  const options: { label: string; value: string }[] = [];
  (res.list || []).forEach((slot: DspSlotInfoApi.SlotInfo) => {
    const name = slot.name;
    if (name && !seen.has(name)) {
      seen.add(name);
      options.push({ label: name, value: name });
    }
  });
  return options;
}

async function getSlotIdOptions() {
  const res = await getSlotInfoPage({ pageNo: 1, pageSize: 1000 });
  return (res.list || []).map((slot: DspSlotInfoApi.SlotInfo) => ({
    label: `${slot.name || ''}(${slot.id})`,
    value: slot.id,
  }));
}

/** 新增/修改的表单 */
export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      fieldName: 'id',
      component: 'Input',
      dependencies: {
        triggerFields: [''],
        show: () => false,
      },
    },
    {
      fieldName: 'dspSlotCode',
      label: '预算方广告位ID',
      rules: 'required',
      component: 'Input',
      componentProps: {
        placeholder: '请输入预算方广告位ID',
      },
    },
    {
      fieldName: 'companyId',
      label: '公司名称',
      rules: 'required',
      component: 'ApiSelect',
      componentProps: (_values: any, formApi: any) => ({
        api: getCompanyOptions,
        placeholder: '请选择公司名称',
        showSearch: true,
        filterOption: false,
        // 切换公司时清空已选产品
        onChange: () => {
          formApi.setFieldValue('productId', undefined);
        },
      }),
    },
    {
      fieldName: 'productId',
      label: '产品名称',
      rules: 'required',
      component: 'ApiSelect',
      componentProps: (values: any, formApi: any) => ({
        api: getFormProductOptions,
        // 通过 params 传入 companyId，ApiComponent 会监听变化自动重新加载
        params: { companyId: values.companyId },
        placeholder: '请选择产品名称',
        showSearch: true,
        filterOption: false,
        disabled: true,
        // 选择产品后自动赋值操作系统
        onChange: async (value: number | undefined) => {
          if (!value) return;
          try {
            const product = await getProduct(value);
            if (product?.osType !== undefined) {
              formApi.setFieldValue('osType', product.osType);
            }
          } catch {
            // ignore
          }
        },
      }),
    },
    {
      fieldName: 'osType',
      label: '操作系统',
      rules: 'required',
      component: 'Select',
      componentProps: {
        options: getDictOptions(DICT_TYPE.SSP_OS_TYPE, 'number'),
        placeholder: '请选择操作系统',
        disabled: true,
      },
    },
    {
      fieldName: 'dspPayType',
      label: '结算方式',
      rules: 'required',
      component: 'Select',
      componentProps: {
        options: getDictOptions(DICT_TYPE.SSP_PAY_TYPE, 'number'),
        placeholder: '请选择结算方式',
      },
    },
    {
      fieldName: 'name',
      label: '预算位名称',
      rules: 'required',
      component: 'Input',
      componentProps: {
        placeholder: '自动拼接生成',
      },
      dependencies: {
        triggerFields: ['companyId', 'productId', 'adScene'],
        async trigger(values: any, formApi: any) {
          if (values.id || !values.companyId || !values.productId || values.adScene === undefined) return;
          let companyLabel = '';
          try {
            const companies = await getCompanyPage({ pageNo: 1, pageSize: 1000 });
            const company = (companies.list || []).find((c: any) => c.id === values.companyId);
            companyLabel = company?.name || '';
          } catch { /* ignore */ }
          let productLabel = '';
          let osTypeLabel = '';
          try {
            const product = await getProduct(values.productId);
            productLabel = product.name || '';
            const osOpts = getDictOptions(DICT_TYPE.SSP_OS_TYPE, 'number');
            const osItem = osOpts.find((o: any) => o.value === product.osType);
            osTypeLabel = osItem?.label || '';
          } catch { /* ignore */ }
          const adOpts = getDictOptions(DICT_TYPE.SSP_AD_SCENE, 'number');
          const adItem = adOpts.find((o: any) => o.value === values.adScene);
          const adSceneLabel = adItem?.label || '';
          const newName = [companyLabel, productLabel, osTypeLabel, adSceneLabel]
            .filter(Boolean)
            .join('-');
          if (newName) {
            formApi.setFieldValue('name', newName);
          }
        },
      },
    },
    {
      fieldName: 'adScene',
      label: '广告场景',
      rules: 'required',
      component: 'Select',
      componentProps: {
        options: getDictOptions(DICT_TYPE.SSP_AD_SCENE, 'number'),
        placeholder: '请选择广告场景',
      },
    },
    {
      fieldName: 'dspAppKey',
      label: '预算方APPKEY',
      component: 'Input',
      componentProps: {
        placeholder: '请输入预算方APPKEY',
      },
    },
    {
      fieldName: 'dspAppId',
      label: '预算方APPID',
      component: 'Input',
      componentProps: {
        placeholder: '请输入预算方APPID',
      },
    },
    {
      fieldName: 'dspAppSecret',
      label: '预算方APPSECRET',
      component: 'Input',
      componentProps: {
        placeholder: '请输入预算方APPSECRET',
      },
    },
    
    {
      fieldName: 'dspAppPkg',
      label: '应用包名',
      component: 'Input',
      componentProps: {
        placeholder: '请输入应用包名',
      },
    },
    {
      fieldName: 'dspAppVer',
      label: '应用版本号',
      component: 'Input',
      componentProps: {
        placeholder: '请输入应用版本号',
      },
    },
    {
      fieldName: 'dspAppStoreVer',
      label: '应用商店版本号',
      component: 'Input',
      componentProps: {
        placeholder: '请输入应用商店版本号',
      },
    },
    {
      fieldName: 'priceEncryptKey',
      label: '价格加密KEY',
      component: 'Input',
      componentProps: {
        placeholder: '请输入价格加密KEY',
      },
    },
    {
      fieldName: 'dspAppStoreLink',
      label: '应用商店地址',
      component: 'Input',
      componentProps: {
        placeholder: '请输入应用商店地址',
      },
    },
  ];
}

/** 列表的搜索表单 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      fieldName: 'companyId',
      label: '公司名称',
      component: 'ApiSelect',
      componentProps: {
        allowClear: true,
        api: getCompanyOptions,
        placeholder: '请选择公司名称',
        showSearch: true,
        filterOption: false,
      },
    },
    {
      fieldName: 'productId',
      label: '产品名称',
      component: 'ApiSelect',
      componentProps: {
        mode: 'multiple',
        allowClear: true,
        api: getProductOptions,
        placeholder: '请选择产品名称',
        showSearch: true,
        filterOption: false,
      },
    },
    {
      fieldName: 'dspSlotCode',
      label: '预算方广告位ID',
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入预算方广告位ID',
      },
    },
    {
      fieldName: 'id',
      label: '预算位ID',
      component: 'ApiSelect',
      componentProps: {
        mode: 'multiple',
        allowClear: true,
        api: getSlotIdOptions,
        placeholder: '请选择预算位ID',
        showSearch: true,
        filterOption: (input: string, option: any) => {
          return (option?.label ?? '')
            .toLowerCase()
            .includes(input.toLowerCase());
        },
      },
    },
    {
      fieldName: 'name',
      label: '预算位名称',
      component: 'ApiSelect',
      componentProps: {
        mode: 'multiple',
        allowClear: true,
        api: getSlotNameOptions,
        placeholder: '请选择预算位名称',
        showSearch: true,
        filterOption: false,
      },
    },
    {
      fieldName: 'osType',
      label: '操作系统',
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: getDictOptions(DICT_TYPE.SSP_OS_TYPE, 'number'),
        placeholder: '请选择操作系统',
      },
    },
    {
      fieldName: 'dspPayType',
      label: '结算方式',
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: getDictOptions(DICT_TYPE.SSP_PAY_TYPE, 'number'),
        placeholder: '请选择结算方式',
      },
    },
    {
      fieldName: 'adScene',
      label: '广告场景',
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: getDictOptions(DICT_TYPE.SSP_AD_SCENE, 'number'),
        placeholder: '请选择广告场景',
      },
    },
  ];
}

/** 列表的字段 */
export function useGridColumns(): VxeTableGridOptions<DspSlotInfoApi.SlotInfo>['columns'] {
  return [
    { type: 'seq', title: '#', width: 60, align: 'center', headerAlign: 'center' },
    {
      field: 'id',
      title: '预算位ID',
      minWidth: 90,
      align: 'center',
    },
    {
      field: 'name',
      title: '预算位名称',
      minWidth: 190,
      align: 'center',
    },
    {
      field: 'dspSlotCode',
      title: '预算方广告位ID',
      minWidth: 230,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'productName',
      title: '产品名称',
      minWidth: 150,
      align: 'center',
    },
    {
      field: 'companyName',
      title: '公司名称',
      minWidth: 120,
      align: 'center',
    },
    {
      field: 'osType',
      title: '操作系统',
      minWidth: 120,
      align: 'center',
      cellRender: {
        name: 'CellDict',
        props: { type: DICT_TYPE.SSP_OS_TYPE },
      },
    },
    {
      field: 'ls',
      title: '关联广告位',
      minWidth: 120,
      align: 'center',
    },
    {
      field: 'dspPayType',
      title: '结算方式',
      minWidth: 120,
      align: 'center',
      cellRender: {
        name: 'CellDict',
        props: { type: DICT_TYPE.SSP_PAY_TYPE },
      },
    },
    {
      field: 'adScene',
      title: '广告场景',
      minWidth: 120,
      align: 'center',
      cellRender: {
        name: 'CellDict',
        props: { type: DICT_TYPE.SSP_AD_SCENE },
      },
    },
    {
      field: 'dspAppKey',
      title: '预算方APPKEY',
      minWidth: 120,
      align: 'center',
    },
    {
      field: 'dspAppSecret',
      title: '预算方APPSECRET',
      minWidth: 140,
      align: 'center',
    },
    {
      field: 'dspAppId',
      title: '预算方APPID',
      minWidth: 120,
      align: 'center',
    },
    {
      field: 'dspAppPkg',
      title: '应用包名',
      minWidth: 120,
      align: 'center',
    },
    {
      field: 'dspAppVer',
      title: '应用版本号',
      minWidth: 120,
      align: 'center',
    },
    {
      field: 'dspAppStoreVer',
      title: '应用商店版本号',
      minWidth: 120,
      align: 'center',
    },
    {
      field: 'priceEncryptKey',
      title: '价格加密KEY',
      minWidth: 120,
      align: 'center',
    },
    {
      field: 'dspAppStoreLink',
      title: '应用商店地址',
      minWidth: 120,
      align: 'center',
    },
    {
      field: 'creator',
      title: '创建者',
      minWidth: 120,
      align: 'center',
    },
    {
      field: 'createTime',
      title: '创建时间',
      minWidth: 120,
      align: 'center',
      formatter: 'formatDateTime',
    },
    {
      field: 'updater',
      title: '更新者',
      minWidth: 120,
      align: 'center',
    },
    {
      field: 'updateTime',
      title: '更新时间',
      minWidth: 120,
      align: 'center',
      formatter: 'formatDateTime',
    },
    {
      title: '操作',
      width: 200,
      fixed: 'right',
      align: 'center',
      slots: { default: 'actions' },
    },
  ];
}

