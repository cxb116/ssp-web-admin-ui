import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DataSspSlotDayApi } from '#/api/data/sspslotday';
import type { MediaApi } from '#/api/ssp/media';
import type { SspAppApi } from '#/api/ssp/app';
import type { SspSlotInfoApi } from '#/api/ssp/sspSlotInfo';

import { DICT_TYPE } from '@vben/constants';
import { getDictOptions } from '@vben/hooks';

import dayjs from 'dayjs';

import { getMediaSimpleList } from '#/api/ssp/media';
import { getAppPage } from '#/api/ssp/app';
import { getSlotInfoPage } from '#/api/ssp/sspSlotInfo';
import { getRangePickerDefaultProps } from '#/utils';

async function getMediaOptions() {
  const list = await getMediaSimpleList();
  return list.map((media: MediaApi.Media) => ({
    label: `${media.mediaCompanyShort || media.name}(${media.id})`,
    value: media.id,
  }));
}

async function getAppOptions(params: { mediaId?: number }) {
  const res = await getAppPage({
    pageNo: 1,
    pageSize: 1000,
    mediaId: params.mediaId,
  });
  return (res.list || []).map((app: SspAppApi.App) => ({
    label: `${app.name || ''}(${app.id})`,
    value: app.id,
  }));
}

async function getSspNameOptions() {
  const res = await getSlotInfoPage({ pageNo: 1, pageSize: 1000 });
  const seen = new Set<string>();
  const options: { label: string; value: string }[] = [];
  (res.list || []).forEach((slot: SspSlotInfoApi.SlotInfo) => {
    const name = slot.sspName;
    if (name && !seen.has(name)) {
      seen.add(name);
      options.push({ label: name, value: name });
    }
  });
  return options;
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
      fieldName: 'mediaId',
      label: '媒体用户Id',
      rules: 'required',
      component: 'Input',
      componentProps: {
        placeholder: '请输入媒体用户Id',
      },
    },
    {
      fieldName: 'appId',
      label: '应用ID',
      rules: 'required',
      component: 'Input',
      componentProps: {
        placeholder: '请输入应用ID',
      },
    },
    {
      fieldName: 'sspSlotId',
      label: 'SSP广告位ID',
      rules: 'required',
      component: 'Input',
      componentProps: {
        placeholder: '请输入SSP广告位ID',
      },
    },
    {
      fieldName: 'dspSlotId',
      label: 'DSP广告位ID',
      rules: 'required',
      component: 'Input',
      componentProps: {
        placeholder: '请输入DSP广告位ID',
      },
    },
    {
      fieldName: 'dspSlotCode',
      label: '预算广告位编号',
      rules: 'required',
      component: 'Input',
      componentProps: {
        placeholder: '请输入预算广告位编号',
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
      fieldName: 'reqCount',
      label: '请求数',
      component: 'Input',
      componentProps: {
        placeholder: '请输入请求数',
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
      label: '日期 ',
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
      fieldName: 'mediaId',
      label: '媒体简称',
      component: 'ApiSelect',
      componentProps: {
        allowClear: true,
        api: getMediaOptions,
        placeholder: '请选择媒体简称',
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
      fieldName: 'appId',
      label: '应用名称',
      component: 'ApiSelect',
      componentProps: {
        mode: 'multiple',
        allowClear: true,
        api: getAppOptions,
        dependencies: ['mediaId'],
        placeholder: '请选择应用名称',
        showSearch: true,
        filterOption: (input: string, option: any) => {
          return (option?.label ?? '')
            .toLowerCase()
            .includes(input.toLowerCase());
        },
      },
    },
    {
      fieldName: 'sspName',
      label: '媒体广告位名称',
      component: 'ApiSelect',
      componentProps: {
        mode: 'multiple',
        allowClear: true,
        api: getSspNameOptions,
        placeholder: '请选择预算位名称',
        showSearch: true,
        filterOption: (input: string, option: any) => {
          return (option?.label ?? '')
            .toLowerCase()
            .includes(input.toLowerCase());
        },
      },
    },
    {
      fieldName: 'sspSlotId',
      label: '媒体广告位ID',
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '多个用空格分隔',
      },
    },
    // {
    //   fieldName: 'dspSlotId',
    //   label: '预算广告ID',
    //   component: 'Input',
    //   componentProps: {
    //     allowClear: true,
    //     placeholder: '多个用空格分隔',
    //   },
    // },
    // {
    //   fieldName: 'dspSlotCode',
    //   label: '预算方广告位ID',
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
export function useGridColumns(): VxeTableGridOptions<DataSspSlotDayApi.SspSlotDay>['columns'] {
  const columns: VxeTableGridOptions<DataSspSlotDayApi.SspSlotDay>['columns'] = [
    {
      type: 'seq',
      title: '#',
      width: 30,
      align: 'center',
      headerAlign: 'center',
    },
    {
      type: 'expand',
      width: 24,
      slots: { content: 'expand_content' },
    },
    {
      field: 'date',
      title: '日期',
      minWidth: 90,
      align: 'left',
      sortable: true,
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
      field: 'mediaName',
      title: '媒体简称',
      minWidth: 120,
      align: 'left',
    },
    // {
    //   field: 'mediaName',
    //   title: '媒体名称',
    //   minWidth: 150,
    //   align: 'left',
    //   slots: {
    //     default: 'mediaName-slot',
    //   },
    // },
    {
      field: 'sspName',
      title: '媒体广告位名称',
      minWidth: 300,
      align: 'left',
    },
    {
      field: 'sspSlotId',
      title: '媒体广告位ID',
      minWidth: 120,
      align: 'left',
      slots: {
        default: 'sspSlotId-slot',
      },
    },
    {
      field: 'appName',
      title: '应用名称',
      minWidth: 180,
      align: 'left',
      slots: {
        default: 'appName-slot',
      },
    },
    {
      field: 'osType',
      title: '操作系统',
      minWidth: 100,
      align: 'left',
      slots: {
        default: 'osType-slot',
      },
    },
    // {
    //   field: 'dspSlotCode',
    //   title: '预算方广告位ID',
    //   minWidth: 140,
    //   align: 'left',
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