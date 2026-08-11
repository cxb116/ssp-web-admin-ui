import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SspMediaApi } from '#/api/ssp/media';

import { DICT_TYPE } from '@vben/constants';
import { getDictOptions } from '@vben/hooks';

import { getMediaSimpleList } from '#/api/ssp/media';

async function getMediaShortOptions() {
  const list = await getMediaSimpleList();
  const map = new Map<string, number>();
  list.forEach((m) => {
    if (m.mediaCompanyShort && !map.has(m.mediaCompanyShort)) {
      map.set(m.mediaCompanyShort, m.id!);
    }
  });
  return Array.from(map.entries()).map(([name, id]) => ({
    label: `${name}(${id})`,
    value: name,
  }));
}

async function getMediaAccountOptions() {
  const list = await getMediaSimpleList();
  const map = new Map<string, number>();
  list.forEach((m) => {
    if (m.account && !map.has(m.account)) {
      map.set(m.account, m.id!);
    }
  });
  return Array.from(map.entries()).map(([acc, id]) => ({
    label: `${acc}(${id})`,
    value: acc,
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
      fieldName: 'account',
      label: '媒体账号',
      rules: 'required',
      component: 'Input',
      componentProps: {
        placeholder: '请输入媒体账号',
      },
    },
    {
      fieldName: 'password',
      label: '媒体密码',
      rules: 'required',
      component: 'Input',
      componentProps: {
        placeholder: '请输入媒体密码',
      },
    },
    {
      fieldName: 'mediaCompanyShort',
      label: '媒体简称',
      rules: 'required',
      component: 'Input',
      componentProps: {
        placeholder: '请输入媒体简称',
      },
    },
    {
      fieldName: 'mediaOwnerName',
      label: '法人姓名',
      component: 'Input',
      componentProps: {
        placeholder: '请输入法人姓名',
      },
    },
    {
      fieldName: 'contactName',
      label: '联系人',
      component: 'Input',
      componentProps: {
        placeholder: '请输入联系人',
      },
    },
    {
      fieldName: 'contactPhone',
      label: '联系电话',
      component: 'Input',
      componentProps: {
        placeholder: '请输入联系电话',
      },
    },
    {
      fieldName: 'contactEmail',
      label: '联系邮箱',
      component: 'Input',
      componentProps: {
        placeholder: '请输入联系邮箱',
      },
    },
    {
      fieldName: 'accessType',
      label: '接入方式',
      component: 'Select',
      componentProps: {
        options: getDictOptions(DICT_TYPE.SSP_ACCESS_TYPE, 'number'),
        placeholder: '请选择接入方式',
      },
    },
    {
      fieldName: 'trafficType',
      label: '流量类型',
      component: 'Select',
      componentProps: {
        options: getDictOptions(DICT_TYPE.SSP_TRAFFIC_TYPE, 'number'),
        placeholder: '请选择流量类型',
      },
    },
    {
      fieldName: 'enable',
      label: '媒体状态',
      rules: 'required',
      component: 'Select',
      componentProps: {
         options: getDictOptions(DICT_TYPE.SSP_ENABLE, 'number'),
        placeholder: '请输入媒体状态',
      },
    },
  ];
}

/** 列表的搜索表单 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      fieldName: 'mediaCompanyShort',
      label: '媒体简称',
      component: 'ApiSelect',
      componentProps: {
        allowClear: true,
        api: getMediaShortOptions,
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
      fieldName: 'account',
      label: '媒体账号',
      component: 'ApiSelect',
      componentProps: {
        allowClear: true,
        api: getMediaAccountOptions,
        placeholder: '请选择媒体账号',
        showSearch: true,
        filterOption: (input: string, option: any) => {
          return (option?.label ?? '')
            .toLowerCase()
            .includes(input.toLowerCase());
        },
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
      fieldName: 'trafficType',
      label: '流量类型',
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: getDictOptions(DICT_TYPE.SSP_TRAFFIC_TYPE, 'number'),
        placeholder: '请选择流量类型',
      },
    },
    {
      fieldName: 'enable',
      label: '媒体状态',
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: getDictOptions(DICT_TYPE.SSP_ENABLE, 'number'),
        placeholder: '请选择媒体状态',
      },
    },
  ];
}

/** 列表的字段 */
export function useGridColumns(): VxeTableGridOptions<SspMediaApi.Media>['columns'] {
  return [
  // { type: 'checkbox', width: 40 },
    {
      field: 'id',
      title: '媒体ID',
      minWidth: 120,
    },
    {
      field: 'account',
      title: '媒体账号',
      minWidth: 120,
    },
    {
      field: 'mediaCompanyShort',
      title: '媒体简称',
      minWidth: 120,
    },
    {
      field: 'mediaOwnerName',
      title: '法人姓名',
      minWidth: 120,
    },
    {
      field: 'contactName',
      title: '联系人',
      minWidth: 120,
    },
    {
      field: 'contactPhone',
      title: '联系电话',
      minWidth: 120,
    },
    {
      field: 'contactEmail',
      title: '联系邮箱',
      minWidth: 120,
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
      field: 'trafficType',
      title: '流量类型',
      minWidth: 120,
      cellRender: {
        name: 'CellDict',
        props: { type: DICT_TYPE.SSP_TRAFFIC_TYPE },
      },
    },
    {
      field: 'enable',
      title: '媒体状态',
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

