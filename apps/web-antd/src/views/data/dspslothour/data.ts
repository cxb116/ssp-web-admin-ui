import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DspProductApi } from '#/api/dsp/product';
import type { DspCompanyApi } from '#/api/dsp/company';
import type { DspSlotInfoApi } from '#/api/dsp/dspslotinfo';

import { h, ref, watch } from 'vue';

import dayjs from 'dayjs';

import { DatePicker, Select } from 'ant-design-vue';

import { DICT_TYPE } from '@vben/constants';
import { getDictOptions } from '@vben/hooks';

import { getProductPage } from '#/api/dsp/product';
import { getCompanyPage } from '#/api/dsp/company';
import { getSlotInfoPage } from '#/api/dsp/dspslotinfo';

async function getProductOptions(params: { companyId?: number }) {
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

async function getDspSlotOptions() {
  const res = await getSlotInfoPage({ pageNo: 1, pageSize: 1000 });
  return (res.list || []).map((slot: DspSlotInfoApi.SlotInfo) => ({
    label: `${slot.name || ''}/${slot.id}`,
    value: slot.id,
  }));
}

const hourOptions = [
  { label: '全天', value: -1 },
  ...Array.from({ length: 24 }, (_, i) => ({ label: `${i}`, value: i })),
];

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
      fieldName: 'dspSlotId',
      label: '预算位ID',
      rules: 'required',
      component: 'Input',
      componentProps: {
        placeholder: '请输入预算位ID',
      },
    },
    {
      fieldName: 'dspSlotCode',
      label: '预算广告位',
      rules: 'required',
      component: 'Input',
      componentProps: {
        placeholder: '请输入预算广告位',
      },
    },
    {
      fieldName: 'sspSlotId',
      label: 'SSP slot id',
      rules: 'required',
      component: 'Input',
      componentProps: {
        placeholder: '请输入SSP slot id',
      },
    },
    {
      fieldName: 'showPv',
      label: '展示PV',
      component: 'Input',
      componentProps: {
        placeholder: '请输入展示PV',
      },
    },
    {
      fieldName: 'showUv',
      label: '展示UV',
      component: 'Input',
      componentProps: {
        placeholder: '请输入展示UV',
      },
    },
    {
      fieldName: 'clickPv',
      label: '点击PV',
      component: 'Input',
      componentProps: {
        placeholder: '请输入点击PV',
      },
    },
    {
      fieldName: 'clickUv',
      label: '点击UV',
      component: 'Input',
      componentProps: {
        placeholder: '请输入点击UV',
      },
    },
    {
      fieldName: 'reqPv',
      label: '请求PV',
      component: 'Input',
      componentProps: {
        placeholder: '请输入请求PV',
      },
    },
    {
      fieldName: 'reqUv',
      label: '请求UV',
      component: 'Input',
      componentProps: {
        placeholder: '请输入请求UV',
      },
    },
    {
      fieldName: 'discard',
      label: '丢弃请求',
      component: 'Input',
      componentProps: {
        placeholder: '请输入丢弃请求',
      },
    },
    {
      fieldName: 'retPv',
      label: '返回PV',
      component: 'Input',
      componentProps: {
        placeholder: '请输入返回PV',
      },
    },
    {
      fieldName: 'retUv',
      label: '返回UV',
      component: 'Input',
      componentProps: {
        placeholder: '请输入返回UV',
      },
    },
    {
      fieldName: 'spend',
      label: '成本(分)',
      component: 'Input',
      componentProps: {
        placeholder: '请输入成本(分)',
      },
    },
    {
      fieldName: 'income',
      label: '收入(分)',
      component: 'Input',
      componentProps: {
        placeholder: '请输入收入(分)',
      },
    },
    {
      fieldName: 'discountClickPv',
      label: '折后点击',
      component: 'Input',
      componentProps: {
        placeholder: '请输入折后点击',
      },
    },
    {
      fieldName: 'discountShowPv',
      label: '折后展示',
      component: 'Input',
      componentProps: {
        placeholder: '请输入折后展示',
      },
    },
    {
      fieldName: 'dplsuccPv',
      label: '调起成功',
      component: 'Input',
      componentProps: {
        placeholder: '请输入调起成功',
      },
    },
    {
      fieldName: 'completePv',
      label: '完成量',
      component: 'Input',
      componentProps: {
        placeholder: '请输入完成量',
      },
    },
    {
      fieldName: 'installPv',
      label: '安装量',
      component: 'Input',
      componentProps: {
        placeholder: '请输入安装量',
      },
    },
    {
      fieldName: 'activatePv',
      label: '激活量',
      component: 'Input',
      componentProps: {
        placeholder: '请输入激活量',
      },
    },
    {
      fieldName: 'date',
      label: '时间',
      component: 'DatePicker',
      componentProps: {
        showTime: true,
        format: 'YYYY-MM-DD HH:mm:ss',
        valueFormat: 'x',
      },
    },
    {
      fieldName: 'createdAt',
      label: '创建时间戳',
      component: 'Input',
      componentProps: {
        placeholder: '请输入创建时间戳',
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
        filterOption: (input: string, option: any) => {
          return (option?.label ?? '')
            .toLowerCase()
            .includes(input.toLowerCase());
        },
      },
    },
    {
      fieldName: 'osType',
      label: '应用平台',
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: getDictOptions(DICT_TYPE.SSP_OS_TYPE, 'number'),
        placeholder: '请选择应用平台',
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
        dependencies: ['companyId'],
        placeholder: '请选择产品名称',
        showSearch: true,
        filterOption: (input: string, option: any) => {
          return (option?.label ?? '')
            .toLowerCase()
            .includes(input.toLowerCase());
        },
      },
    },
    {
      fieldName: 'dspSlotId',
      label: '预算位名称/ID',
      component: 'ApiSelect',
      componentProps: {
        mode: 'multiple',
        allowClear: true,
        api: getDspSlotOptions,
        placeholder: '请选择预算位',
        showSearch: true,
        filterOption: (input: string, option: any) => {
          return (option?.label ?? '')
            .toLowerCase()
            .includes(input.toLowerCase());
        },
      },
    },
    {
      fieldName: 'dspSlotCode',
      label: '预算方广告位ID',
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '多个用空格分隔',
      },
    },
    // {
    //   fieldName: 'sspSlotId',
    //   label: '媒体方广告位ID',
    //   component: 'Input',
    //   componentProps: {
    //     allowClear: true,
    //     placeholder: '多个用空格分隔',
    //   },
    // },
    {
      fieldName: 'date',
      label: '时间',
      component: {
        props: ['modelValue'],
        emits: ['update:modelValue'],
        setup(props: any, { emit }: any) {
          const dateVal = ref('');
          const hourVal = ref(-1);

          const parse = (val: any) => {
            const v = String(val ?? dayjs().format('YYYYMMDD'));
            if (v.length >= 10) {
              dateVal.value = v.slice(0, 8);
              hourVal.value = parseInt(v.slice(8), 10) || 0;
            } else {
              dateVal.value = v.slice(0, 8);
              hourVal.value = -1;
            }
          };
          parse(props.modelValue);

          watch(() => props.modelValue, parse);

          const emitValue = () => {
            if (hourVal.value === -1) {
              emit('update:modelValue', dateVal.value);
            } else {
              emit('update:modelValue', dateVal.value + String(hourVal.value).padStart(2, '0'));
            }
          };

          return () => h('div', { style: { display: 'flex', gap: '4px', width: '100%' } }, [
            h(DatePicker, {
              value: dayjs(dateVal.value, 'YYYYMMDD'),
              format: 'YYYY-MM-DD',
              style: { flex: '1' },
              onChange: (d: any) => { dateVal.value = d ? d.format('YYYYMMDD') : dayjs().format('YYYYMMDD'); emitValue(); },
            }),
            h(Select, {
              value: hourVal.value,
              options: hourOptions,
              style: { width: '90px' },
              onChange: (v: number) => { hourVal.value = v; emitValue(); },
            }),
          ]);
        },
      },
      defaultValue: dayjs().format('YYYYMMDD'),
    },
  ];
}

/** 列表的字段 */
export function useGridColumns(): VxeTableGridOptions<any>['columns'] {
  return [
    {
      type: 'expand',
      width: 48,
      slots: { content: 'expand_content' },
    },
    {
      field: 'date',
      title: '时间',
      minWidth: 130,
      align: 'left',
      formatter: ({ cellValue }) => {
        if (!cellValue) return '';
        const str = String(cellValue);
        // 兼容 2026072411 -> 11:00
        if (str.length === 10 && /^\d{10}$/.test(str)) {
          return `${str.slice(8, 10)}:00`;
        }
        // 兼容 20260724 -> 2026-07-24
        if (str.length === 8 && /^\d{8}$/.test(str)) {
          return `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}`;
        }
        return str;
      },
    },
    {
      field: 'dspName',
      title: '预算位名称',
      minWidth: 140,
    },
    {
      field: 'dspSlotCode',
      title: '预算广告位ID',
      minWidth: 140,
    },
    {
      field: 'productName',
      title: '预算产品名称',
      minWidth: 120,
    },
    {
      field: 'reqPv',
      title: '请求PV',
      minWidth: 120,
    },
    {
      field: 'discard',
      title: '丢弃请求',
      minWidth: 120,
    },
    {
      field: 'retPv',
      title: '返回PV',
      minWidth: 120,
    },
    {
      field: 'showPv',
      title: '展示PV',
      minWidth: 120,
    },
    {
      field: 'clickPv',
      title: '点击PV',
      minWidth: 120,
    },
    {
      field: 'fillRate',
      title: '填充率',
      minWidth: 110,
      formatter: ({ cellValue }) => {
        if (cellValue == null || cellValue === '') return '';
        return `${cellValue}%`;
      },
    },
    {
      field: 'displayRate',
      title: '展现率',
      minWidth: 110,
      formatter: ({ cellValue }) => {
        if (cellValue == null || cellValue === '') return '';
        return `${cellValue}%`;
      },
    },
    {
      field: 'clickRate',
      title: '点击率',
      minWidth: 110,
      formatter: ({ cellValue }) => {
        if (cellValue == null || cellValue === '') return '';
        return `${cellValue}%`;
      },
    },
    {
      field: 'discountClickPv',
      title: '折后点击',
      minWidth: 120,
    },
    {
      field: 'discountShowPv',
      title: '折后展示',
      minWidth: 120,
    },
    {
      field: 'dplsuccPv',
      title: '调起成功',
      minWidth: 120,
    },
    {
      field: 'completePv',
      title: '完成量',
      minWidth: 120,
    },
    {
      field: 'installPv',
      title: '安装量',
      minWidth: 120,
    },
    {
      field: 'activatePv',
      title: '激活量',
      minWidth: 120,
    },
    {
      field: 'mediaEcpm',
      title: '媒体ecpm',
      minWidth: 130,
    },
    {
      field: 'ecpm',
      title: 'ecpm',
      minWidth: 120,
    },
    {
      field: 'mediaEcprm',
      title: '媒体ecprm',
      minWidth: 130,
    },
    {
      field: 'ecprm',
      title: 'ecprm',
      minWidth: 130,
    },
    {
      field: 'spend',
      title: '成本(元)',
      minWidth: 120,
      slots: { default: 'spend-slot' },
    },
    {
      field: 'income',
      title: '收入(元)',
      minWidth: 120,
      slots: { default: 'income-slot' },
    },
  ];
}