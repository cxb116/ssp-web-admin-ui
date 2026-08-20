import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DataDspSlotDayApi } from '#/api/data/dspslotday';
import type { DspProductApi } from '#/api/dsp/product';
import type { DspCompanyApi } from '#/api/dsp/company';

import { DICT_TYPE } from '@vben/constants';
import { getDictOptions } from '@vben/hooks';

import dayjs from 'dayjs';

import { getProductPage } from '#/api/dsp/product';
import { getCompanyPage } from '#/api/dsp/company';
import { getSlotInfoPage } from '#/api/dsp/dspslotinfo';
import type { DspSlotInfoApi } from '#/api/dsp/dspslotinfo';
import { getRangePickerDefaultProps } from '#/utils';

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
      fieldName: 'dspSlotId',
      label: '预算位ID',
      component: 'Input',
      componentProps: {
        placeholder: '请输入预算位ID',
      },
    },
    {
      fieldName: 'dspSlotCode',
      label: '预算方广告位ID',
      component: 'Input',
      componentProps: {
        placeholder: '请输入预算方广告位ID',
      },
    },
    {
      fieldName: 'sspSlotId',
      label: '媒体广告ID',
      component: 'Input',
      componentProps: {
        placeholder: '请输入媒体广告ID',
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
  ];
}

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
      fieldName: 'productId',
      label: '预算产品名称',
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
    
    
    // {
    //   fieldName: 'dspSlotId',
    //   label: '预算位ID',
    //   component: 'ApiSelect',
    //   componentProps: {
    //     mode: 'multiple',
    //     allowClear: true,
    //     api: getDspSlotOptions,
    //     placeholder: '请选择预算位ID',
    //     showSearch: true,
    //     filterOption: (input: string, option: any) => {
    //       return (option?.label ?? '')
    //         .toLowerCase()
    //         .includes(input.toLowerCase());
    //     },
    //   },
    // },
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
      component: 'RangePicker',
      componentProps: {
        ...getRangePickerDefaultProps(),
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
        showTime: false,
        allowClear: true,
      },
      defaultValue: [
        dayjs().subtract(6, 'day').startOf('day').format('YYYY-MM-DD'),
        dayjs().endOf('day').format('YYYY-MM-DD'),
      ],
    },
  ];
}

/** 列表的字段 */
export function useGridColumns(): VxeTableGridOptions<DataDspSlotDayApi.DspSlotDay>['columns'] {
  const columns: VxeTableGridOptions<DataDspSlotDayApi.DspSlotDay>['columns'] = [
    {
      type: 'seq',
      title: '#',
      width: 30,
      align: 'center',
      headerAlign: 'center',
    },
    {
      type: 'expand',
      title: '',
      width: 30,
      align: 'center',
      slots: {
        content: 'expand_content',
      },
    },
    {
      field: 'date',
      title: '日期',
      minWidth: 110,
      align: 'left',
      formatter: ({ cellValue }) => {
        if (!cellValue) return '';
        const str = String(cellValue);
        // 兼容 20260724 -> 2026-07-24
        if (str.length === 8 && /^\d{8}$/.test(str)) {
          return `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}`;
        }
        return str;
      },
    },
    {
      field: 'companyName',
      title: '预算公司名称',
      minWidth: 120,
      align: 'left',
    },
    {
      field: 'dspName',
      title: '预算位名称',
      minWidth: 200,
      align: 'left',
      slots: {
        default: 'dspName-slot',
      },
    },
    {
      field: 'dspSlotId',
      title: '预算位ID',
      minWidth: 100,
      align: 'left',
    },
    {
      field: 'dspSlotCode',
      title: '预算方广告位ID',
      minWidth: 200,
      align: 'left',
    },
    {
      field: 'productName',
      title: '预算产品名称',
      minWidth: 120,
      align: 'left',
    },
    // {
    //   field: 'osType',
    //   title: '操作系统',
    //   minWidth: 100,
    //   align: 'left',
    //   slots: {
    //     default: 'osType-slot',
    //   },
    // },
    // {
    //   field: 'dspSlotCode',
    //   title: '预算广告位ID',
    //   minWidth: 140,
    //   align: 'left',
    // },
    // {
    //   field: 'sspSlotId',
    //   title: '媒体方广告位ID',
    //   minWidth: 120,
    //   align: 'left',
    //   slots: {
    //     default: 'sspSlotId-slot',
    //   },
    // },
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
      sortable: true,
      formatter: ({ cellValue }) => {
        if (cellValue == null || cellValue === '') return '';
        return `${cellValue}%`;
      },
    },
    {
      field: 'displayRate',
      title: '展现率',
      minWidth: 110,
      sortable: true,
      formatter: ({ cellValue }) => {
        if (cellValue == null || cellValue === '') return '';
        return `${cellValue}%`;
      },
    },
    {
      field: 'clickRate',
      title: '点击率',
      minWidth: 110,
      sortable: true,
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
      sortable: true,
    },
    {
      field: 'ecpm',
      title: 'ecpm',
      minWidth: 120,
      sortable: true,
    },
    {
      field: 'mediaEcprm',
      title: '媒体ecprm',
      minWidth: 130,
      sortable: true,
    },
    {
      field: 'ecprm',
      title: 'ecprm',
      minWidth: 130,
      sortable: true,
    },
    {
      field: 'spend',
      title: '成本(元)',
      minWidth: 120,
      sortable: true,
      slots: { default: 'spend-slot' },
    },
    {
      field: 'income',
      title: '收入(元)',
      minWidth: 120,
      sortable: true,
      slots: { default: 'income-slot' },
    },
  ];
  columns.forEach((col: any) => {
    col.align = 'center';
    col.headerAlign = 'center';
  });
  return columns;
}