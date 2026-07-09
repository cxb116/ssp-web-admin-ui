import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DataSspSlotDayApi } from '#/api/data/sspslotday';

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
      label: '媒体用户Id',
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入媒体用户Id',
      },
    },
    {
      fieldName: 'appId',
      label: '应用ID',
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入应用ID',
      },
    },
    {
      fieldName: 'sspSlotId',
      label: 'SSP广告位ID',
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入SSP广告位ID',
      },
    },
    {
      fieldName: 'dspSlotId',
      label: 'DSP广告位ID',
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入DSP广告位ID',
      },
    },
    {
      fieldName: 'dspSlotCode',
      label: '预算广告位编号',
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入预算广告位编号',
      },
    },
  ];
}

/** 列表的字段 */
export function useGridColumns(): VxeTableGridOptions<DataSspSlotDayApi.SspSlotDay>['columns'] {
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
      title: '日期 ',
      minWidth: 150,
    },
    {
      field: 'mediaId',
      title: '媒体用户Id',
      minWidth: 120,
    },
    {
      field: 'appId',
      title: '应用ID',
      minWidth: 120,
    },
    {
      field: 'sspSlotId',
      title: 'SSP广告位ID',
      minWidth: 120,
    },
    {
      field: 'dspSlotId',
      title: 'DSP广告位ID',
      minWidth: 120,
    },
    {
      field: 'dspSlotCode',
      title: '预算广告位编号',
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
      field: 'reqCount',
      title: '请求数',
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
      field: 'createdAt',
      title: '创建时间戳',
      minWidth: 120,
    },
  ];
}