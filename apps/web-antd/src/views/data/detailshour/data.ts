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

/** 列表的搜索表单 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      fieldName: 'companyId',
      label: '预算公司名称',
      component: 'ApiSelect',
      componentProps: {
        allowClear: true,
        api: getCompanyOptions,
        placeholder: '请选择预算公司名称',
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
      label: '操作系统',
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: getDictOptions(DICT_TYPE.SSP_OS_TYPE, 'number'),
        placeholder: '请选择操作系统',
      },
    },
    {
      fieldName: 'productId',
      label: '预算产品名称',
      component: 'ApiSelect',
      componentProps: {
        mode: 'multiple',
        allowClear: true,
        api: getProductOptions,
        dependencies: ['companyId'],
        placeholder: '请选择预算产品名称',
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
      label: '预算位名称',
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
      label: '预算广告位ID',
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '多个用空格分隔',
      },
    },
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
  const columns: VxeTableGridOptions<any>['columns'] = [
    {
      type: 'seq',
      title: '#',
      width: 30,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'date',
      title: '时间',
      minWidth: 130,
      sortable: true,
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
      minWidth: 180,
      slots: {
        default: 'dspName-slot',
      },
    },
    {
      field: 'dspSlotCode',
      title: '预算广告位ID',
      minWidth: 140,
    },
    {
      field: 'dspSlotId',
      title: '预算位ID',
      minWidth: 120,
    },
    {
      field: 'companyName',
      title: '预算公司名称',
      minWidth: 120,
    },
    {
      field: 'productName',
      title: '预算产品名称',
      minWidth: 120,
    },
    {
      field: 'sspSlotId',
      title: '媒体广告位ID',
      minWidth: 120,
      slots: {
        default: 'sspSlotId-slot',
      },
    },
    {
      field: 'mediaName',
      title: '媒体名称',
      minWidth: 120,
    },
    {
      field: 'sspName',
      title: '媒体广告位名称',
      minWidth: 150,
    },
    {
      field: 'appName',
      title: '应用名称',
      minWidth: 120,
    },
    {
      field: 'osType',
      title: '操作系统',
      minWidth: 100,
      slots: {
        default: 'osType-slot',
      },
    },
    {
      field: 'reqPv',
      title: '请求PV',
      minWidth: 120,
      sortable: true,
    },
    {
      field: 'discard',
      title: '丢弃请求',
      minWidth: 120,
      sortable: true,
    },
    {
      field: 'retPv',
      title: '返回PV',
      minWidth: 120,
      sortable: true,
    },
    {
      field: 'showPv',
      title: '展示PV',
      minWidth: 120,
      sortable: true,
    },
    {
      field: 'clickPv',
      title: '点击PV',
      minWidth: 120,
      sortable: true,
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
      sortable: true,
    },
    {
      field: 'discountShowPv',
      title: '折后展示',
      minWidth: 120,
      sortable: true,
    },
    {
      field: 'dplsuccPv',
      title: '调起成功',
      minWidth: 120,
      sortable: true,
    },
    {
      field: 'completePv',
      title: '完成量',
      minWidth: 120,
      sortable: true,
    },
    {
      field: 'installPv',
      title: '安装量',
      minWidth: 120,
      sortable: true,
    },
    {
      field: 'activatePv',
      title: '激活量',
      minWidth: 120,
      sortable: true,
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
      title: '成本(分)',
      minWidth: 120,
      sortable: true,
      slots: { default: 'spend-slot' },
    },
    {
      field: 'income',
      title: '收入(分)',
      minWidth: 120,
      sortable: true,
      slots: { default: 'income-slot' },
    },
  ];
  // 统一设置表头和数据居中
  columns.forEach((col: any) => {
    col.align = 'center';
    col.headerAlign = 'center';
  });
  return columns;
}
