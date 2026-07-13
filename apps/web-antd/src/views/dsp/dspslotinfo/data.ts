import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DspCompanyApi } from '#/api/dsp/company';
import type { DspSlotInfoApi } from '#/api/dsp/dspslotinfo';
import type { DspProductApi } from '#/api/dsp/product';

import { DICT_TYPE } from '@vben/constants';
import { getDictOptions } from '@vben/hooks';

import { getCompanyPage } from '#/api/dsp/company';
import { getSlotInfoPage } from '#/api/dsp/dspslotinfo';
import { getProductPage } from '#/api/dsp/product';
import { getRangePickerDefaultProps } from '#/utils';

async function getProductOptions() {
  const res = await getProductPage({ pageNo: 1, pageSize: 1000 });
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

async function getDspSlotCodeOptions() {
  const res = await getSlotInfoPage({ pageNo: 1, pageSize: 1000 });
  return (res.list || [])
    .filter((slot: DspSlotInfoApi.SlotInfo) => !!slot.dspSlotCode)
    .map((slot: DspSlotInfoApi.SlotInfo) => ({
      label: `${slot.dspSlotCode || ''}(${slot.id})`,
      value: slot.dspSlotCode,
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
      label: '预算方广告位',
      rules: 'required',
      component: 'Input',
      componentProps: {
        placeholder: '请输入预算方广告位',
      },
    },
    {
      fieldName: 'productId',
      label: '产品名称',
      rules: 'required',
      component: 'ApiSelect',
      componentProps: {
        api: getProductOptions,
        placeholder: '请选择产品名称',
        showSearch: true,
        filterOption: false,
      },
    },
    {
      fieldName: 'companyId',
      label: '公司名称',
      rules: 'required',
      component: 'ApiSelect',
      componentProps: {
        api: getCompanyOptions,
        placeholder: '请选择公司名称',
        showSearch: true,
        filterOption: false,
      },
    },
    {
      fieldName: 'name',
      label: '广告位名称',
      rules: 'required',
      component: 'Input',
      componentProps: {
        placeholder: '请输入广告位名称',
      },
    },
    {
      fieldName: 'osType',
      label: '操作系统',
      rules: 'required',
      component: 'Select',
      componentProps: {
        options: getDictOptions(DICT_TYPE.SSP_OS_TYPE, 'number'),
        placeholder: '请选择操作系统',
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
      fieldName: 'dspAppSecret',
      label: '预算方APPSECRET',
      component: 'Input',
      componentProps: {
        placeholder: '请输入预算方APPSECRET',
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
      fieldName: 'dspAppPkg',
      label: '预算方应用包名',
      component: 'Input',
      componentProps: {
        placeholder: '请输入预算方应用包名',
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
      fieldName: 'dspSlotCode',
      label: '预算方广告位',
      component: 'ApiSelect',
      componentProps: {
        allowClear: true,
        api: getDspSlotCodeOptions,
        filterOption: false,
        placeholder: '请输入预算方广告位',
        showSearch: true,
      },
    },
    {
      fieldName: 'productId',
      label: '产品名称',
      component: 'ApiSelect',
      componentProps: {
        allowClear: true,
        api: getProductOptions,
        placeholder: '请选择产品名称',
        showSearch: true,
        filterOption: false,
      },
    },
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
      fieldName: 'name',
      label: '广告位名称',
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入广告位名称',
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
    {
      fieldName: 'createTime',
      label: '创建时间',
      component: 'RangePicker',
      componentProps: {
        ...getRangePickerDefaultProps(),
        allowClear: true,
      },
    },
    {
      fieldName: 'updateTime',
      label: '更新时间',
      component: 'RangePicker',
      componentProps: {
        ...getRangePickerDefaultProps(),
        allowClear: true,
      },
    },
  ];
}

/** 列表的字段 */
export function useGridColumns(): VxeTableGridOptions<DspSlotInfoApi.SlotInfo>['columns'] {
  return [
  { type: 'checkbox', width: 40 },
    {
      field: 'id',
      title: 'ID',
      minWidth: 120,
    },
    {
      field: 'dspSlotCode',
      title: '预算方广告位',
      minWidth: 120,
    },
    {
      field: 'productName',
      title: '产品名称',
      minWidth: 120,
    },
    {
      field: 'companyName',
      title: '公司名称',
      minWidth: 120,
    },
    {
      field: 'name',
      title: '广告位名称',
      minWidth: 120,
    },
    {
      field: 'osType',
      title: '操作系统',
      minWidth: 120,
      cellRender: {
        name: 'CellDict',
        props: { type: DICT_TYPE.SSP_OS_TYPE },
      },
    },
    {
      field: 'dspPayType',
      title: '结算方式',
      minWidth: 120,
      cellRender: {
        name: 'CellDict',
        props: { type: DICT_TYPE.SSP_PAY_TYPE },
      },
    },
    {
      field: 'adScene',
      title: '广告场景',
      minWidth: 120,
      cellRender: {
        name: 'CellDict',
        props: { type: DICT_TYPE.SSP_AD_SCENE },
      },
    },
    {
      field: 'dspAppKey',
      title: '预算方APPKEY',
      minWidth: 120,
    },
    {
      field: 'dspAppSecret',
      title: '预算方APPSECRET',
      minWidth: 120,
    },
    {
      field: 'dspAppId',
      title: '预算方APPID',
      minWidth: 120,
    },
    {
      field: 'dspAppPkg',
      title: '预算方应用包名',
      minWidth: 120,
    },
    {
      field: 'dspAppVer',
      title: '应用版本号',
      minWidth: 120,
    },
    {
      field: 'dspAppStoreVer',
      title: '应用商店版本号',
      minWidth: 120,
    },
    {
      field: 'priceEncryptKey',
      title: '价格加密KEY',
      minWidth: 120,
    },
    {
      field: 'dspAppStoreLink',
      title: '应用商店地址',
      minWidth: 120,
    },
    {
      field: 'creator',
      title: '创建者',
      minWidth: 120,
    },
    {
      field: 'createTime',
      title: '创建时间',
      minWidth: 120,
      formatter: 'formatDateTime',
    },
    {
      field: 'updater',
      title: '更新者',
      minWidth: 120,
    },
    {
      field: 'updateTime',
      title: '更新时间',
      minWidth: 120,
      formatter: 'formatDateTime',
    },
    {
      title: '操作',
      width: 200,
      fixed: 'right',
      slots: { default: 'actions' },
    },
  ];
}
