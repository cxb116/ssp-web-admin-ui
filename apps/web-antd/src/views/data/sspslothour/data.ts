import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DataSspSlotHourApi } from '#/api/data/sspslothour';
import type { MediaApi } from '#/api/ssp/media';
import type { SspAppApi } from '#/api/ssp/app';
import type { SspSlotInfoApi } from '#/api/ssp/sspSlotInfo';

import { h, ref, watch } from 'vue';

import dayjs from 'dayjs';

import { DatePicker, Select } from 'ant-design-vue';

import { DICT_TYPE } from '@vben/constants';
import { getDictOptions } from '@vben/hooks';

import { getMediaSimpleList } from '#/api/ssp/media';
import { getAppPage } from '#/api/ssp/app';
import { getSlotInfoPage } from '#/api/ssp/sspSlotInfo';

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

const hourOptions = [
  { label: '全天', value: -1 },
  ...Array.from({ length: 24 }, (_, i) => ({ label: `${i}`, value: i })),
];

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
        placeholder: '请选择媒体广告位名称',
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
export function useGridColumns(): VxeTableGridOptions<DataSspSlotHourApi.SspSlotHour>['columns'] {
  const columns: VxeTableGridOptions<DataSspSlotHourApi.SspSlotHour>['columns'] = [
    {
      type: 'seq',
      title: '#',
      width: 30,
      align: 'center',
      headerAlign: 'center',
    },
    {
      type: 'expand',
      width: 30,
      slots: { content: 'expand_content' },
    },
    {
      field: 'date',
      title: '时间',
      minWidth: 70,
      align: 'left',
      sortable: true,
      formatter: ({ cellValue }) => {
        if (!cellValue) return '';
        const str = String(cellValue);
        // 10位: 2026072411 -> 11:00
        if (str.length === 10 && /^\d{10}$/.test(str)) {
          return `${str.slice(8, 10)}:00`;
        }
        // 8位: 20260724 -> 2026-07-24
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
    //   slots: {
    //     default: 'mediaName-slot',
    //   },
    // },
    {
      field: 'sspName',
      title: '媒体广告位名称',
      minWidth: 160,
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
      minWidth: 150,
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
