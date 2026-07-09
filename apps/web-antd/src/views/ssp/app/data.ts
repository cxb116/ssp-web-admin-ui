import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SspAppApi } from '#/api/ssp/app';

import { DICT_TYPE } from '@vben/constants';
import { getDictOptions } from '@vben/hooks';

import { getMediaSimpleList } from '#/api/ssp/media';

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
      label: '媒体名称',
      rules: 'required',
      component: 'ApiSelect',
      componentProps: {
        api: getMediaSimpleList,
        valueField: 'id',
        labelFn: (item: any) => `${item.mediaCompanyShort}（${item.id}）`,
        placeholder: '请选择媒体',
        showSearch: true,
        filterOption: (input: string, option: any) => {
          return (option?.label ?? '').toLowerCase().includes(input.toLowerCase());
        },
      },
    },
    {
      fieldName: 'name',
      label: '应用名称',
      rules: 'required',
      component: 'Input',
      componentProps: {
        placeholder: '请输入应用名称',
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
      fieldName: 'accessType',
      label: '接入方式',
      rules: 'required',
      component: 'Select',
      componentProps: {
        options: getDictOptions(DICT_TYPE.SSP_ACCESS_TYPE, 'number'),
        placeholder: '请选择接入方式',
      },
    },
    {
      fieldName: 'pkg',
      label: '包名',
      rules: 'required',
      component: 'Input',
      componentProps: {
        placeholder: '请输入包名',
      },
    },
    {
      fieldName: 'downloadUrl',
      label: '下载地址',
      component: 'Input',
      componentProps: {
        placeholder: '请输入下载地址',
      },
    },
    {
      fieldName: 'enable',
      label: '应用状态',
      rules: 'required',
      component: 'Select',
      componentProps: {
        options: getDictOptions(DICT_TYPE.SSP_ENABLE, 'number'),
        placeholder: '请选择应用状态',
      },
    },
  ];
}

/** 列表的搜索表单 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      fieldName: 'mediaId',
      label: '媒体名称',
      component: 'ApiSelect',
      componentProps: {
        allowClear: true,
        api: getMediaSimpleList,
        valueField: 'id',
        labelFn: (item: any) => `${item.mediaCompanyShort}（${item.id}）`,
        placeholder: '请选择媒体',
        showSearch: true,
        filterOption: (input: string, option: any) => {
          return (option?.label ?? '').toLowerCase().includes(input.toLowerCase());
        },
      },
    },
    {
      fieldName: 'name',
      label: '应用名称',
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入应用名称',
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
      fieldName: 'accessType',
      label: '接入方式',
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: getDictOptions(DICT_TYPE.SSP_ACCESS_TYPE, 'number'),
        placeholder: '请选择接入方式',
      },
    },
    {
      fieldName: 'enable',
      label: '应用状态',
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: getDictOptions(DICT_TYPE.SSP_ENABLE, 'number'),
        placeholder: '请选择应用状态',
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
  ];
}

/** 列表的字段 */
export function useGridColumns(): VxeTableGridOptions<SspAppApi.App>['columns'] {
  return [
  { type: 'checkbox', width: 40 },
    {
      field: 'id',
      title: 'ID',
      minWidth: 120,
    },
    {
      field: 'mediaId',
      title: '媒体Id',
      minWidth: 120,
    },
    {
      field: 'name',
      title: '应用名称',
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
      field: 'accessType',
      title: '接入方式',
      minWidth: 120,
      cellRender: {
        name: 'CellDict',
        props: { type: DICT_TYPE.SSP_ACCESS_TYPE },
      },
    },
    {
      field: 'pkg',
      title: '包名',
      minWidth: 120,
    },
    {
      field: 'downloadUrl',
      title: '下载地址',
      minWidth: 120,
    },
    {
      field: 'enable',
      title: '应用状态',
      minWidth: 120,
      cellRender: {
        name: 'CellDict',
        props: { type: DICT_TYPE.SSP_ENABLE },
      },
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

