import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DataInputExecApi } from '#/api/data/inputexec';

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
      fieldName: 'companyId',
      label: '预算公司id',
      rules: 'required',
      component: 'Input',
      componentProps: {
        placeholder: '请输入预算公司id',
      },
    },
    {
      fieldName: 'tables',
      label: '导入条数',
      component: 'Input',
      componentProps: {
        placeholder: '请输入导入条数',
      },
    },
    {
      fieldName: 'inputTime',
      label: '导入时间',
      component: 'DatePicker',
      componentProps: {
        showTime: true,
        format: 'YYYY-MM-DD HH:mm:ss',
        valueFormat: 'x',
      },
    },
  ];
}

/** 列表的搜索表单 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      fieldName: 'companyId',
      label: '预算公司id',
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入预算公司id',
      },
    },
    {
      fieldName: 'inputTime',
      label: '导入时间',
      component: 'RangePicker',
      componentProps: {
        ...getRangePickerDefaultProps(),
        allowClear: true,
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
export function useGridColumns(): VxeTableGridOptions<DataInputExecApi.InputExec>['columns'] {
  return [
    {
      field: 'inputTime',
      title: '导入时间',
      minWidth: 120,
    },
    {
      field: 'companyName',
      title: '公司名称',
      minWidth: 180,
      formatter: ({ row }) => {
        if (row.companyName && row.companyId != null) {
          return `${row.companyName}（${row.companyId}）`;
        }
        return row.companyName || row.companyId || '';
      },
    },
    {
      field: 'tables',
      title: '导入条数',
      minWidth: 120,
    },
    {
      field: 'createTime',
      title: '创建时间',
      minWidth: 120,
      formatter: 'formatDateTime',
    },
    {
      field: 'updateTime',
      title: '更新时间',
      minWidth: 120,
    },
    {
      title: '操作',
      width: 120,
      fixed: 'right',
      slots: { default: 'actions' },
    },
  ];
}
