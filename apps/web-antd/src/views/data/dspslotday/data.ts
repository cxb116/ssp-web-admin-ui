import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DataDspSlotDayApi } from '#/api/data/dspslotday';

import { getDictOptions } from '@vben/hooks';

import { getRangePickerDefaultProps } from '#/utils';

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
      label: '预算广告位ID',
      component: 'Input',
      componentProps: {
        placeholder: '请输入预算广告位ID',
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
      rules: 'required',
      component: 'Input',
      componentProps: {
        placeholder: '请输入创建时间戳',
      },
    },
    {
      fieldName: 'discountClickPv',
      label: '折后点击',
      rules: 'required',
      component: 'Input',
      componentProps: {
        placeholder: '请输入折后点击',
      },
    },
    {
      fieldName: 'discountShowPv',
      label: '折后展示',
      rules: 'required',
      component: 'Input',
      componentProps: {
        placeholder: '请输入折后展示',
      },
    },
    {
      fieldName: 'dplsuccPv',
      label: '调起成功',
      rules: 'required',
      component: 'Input',
      componentProps: {
        placeholder: '请输入调起成功',
      },
    },
    {
      fieldName: 'completePv',
      label: '完成量',
      rules: 'required',
      component: 'Input',
      componentProps: {
        placeholder: '请输入完成量',
      },
    },
    {
      fieldName: 'installPv',
      label: '安装量',
      rules: 'required',
      component: 'Input',
      componentProps: {
        placeholder: '请输入安装量',
      },
    },
    {
      fieldName: 'activatePv',
      label: '激活量',
      rules: 'required',
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
      fieldName: 'dspSlotId',
      label: '预算位ID',
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入预算位ID',
      },
    },
    {
      fieldName: 'dspSlotCode',
      label: '预算广告位ID',
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入预算广告位ID',
      },
    },
    {
      fieldName: 'sspSlotId',
      label: '媒体广告ID',
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入媒体广告ID',
      },
    },
    {
      fieldName: 'date',
      label: '时间',
      component: 'RangePicker',
      componentProps: {
        ...getRangePickerDefaultProps(),
        allowClear: true,
      },
    },
  ];
}

/** 列表的字段 */
export function useGridColumns(): VxeTableGridOptions<DataDspSlotDayApi.DspSlotDay>['columns'] {
  return [
    {
      type: 'expand',
      title: '',
      width: 80,
      align: 'center',
      slots: {
        default: 'expand-cell',
      },
    },
    {
      field: 'date',
      title: '时间',
      minWidth: 150,
    },
    {
      field: 'dspSlotId',
      title: '预算位ID',
      minWidth: 120,
    },
    {
      field: 'dspSlotCode',
      title: '预算广告位ID',
      minWidth: 120,
    },
    {
      field: 'sspSlotId',
      title: '媒体广告ID',
      minWidth: 120,
    },
    {
      field: 'showPv',
      title: '展示PV',
      minWidth: 120,
    },
    {
      field: 'showUv',
      title: '展示UV',
      minWidth: 120,
    },
    {
      field: 'clickPv',
      title: '点击PV',
      minWidth: 120,
    },
    {
      field: 'clickUv',
      title: '点击UV',
      minWidth: 120,
    },
    {
      field: 'reqPv',
      title: '请求PV',
      minWidth: 120,
    },
    {
      field: 'reqUv',
      title: '请求UV',
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
      field: 'retUv',
      title: '返回UV',
      minWidth: 120,
    },
    {
      field: 'spend',
      title: '成本(分)',
      minWidth: 120,
    },
    {
      field: 'income',
      title: '收入(分)',
      minWidth: 120,
    },
    {
      field: 'createdAt',
      title: '创建时间戳',
      minWidth: 120,
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
  ];
}