import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DspCompanyApi } from '#/api/dsp/company';

import { DICT_TYPE } from '@vben/constants';
import { getDictOptions } from '@vben/hooks';

import { getCompanyPage } from '#/api/dsp/company';

/** 搜索表单用：加载所有公司作为下拉选项 */
async function getCompanyNameOptions() {
  const res = await getCompanyPage({ pageNo: 1, pageSize: 1000 });
  // 去重，value 用 name 字符串，便于后端按名称模糊匹配
  const seen = new Set<string>();
  const options: { label: string; value: string }[] = [];
  (res.list || []).forEach((c: DspCompanyApi.Company) => {
    const name = c.name || '';
    if (name && !seen.has(name)) {
      seen.add(name);
      options.push({ label: `${name}(${c.id})`, value: name });
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
      fieldName: 'name',
      label: '预算公司名称',
      rules: 'required',
      component: 'Input',
      componentProps: {
        placeholder: '请输入预算公司名称',
      },
    },
    {
      fieldName: 'dspCode',
      label: '匹配值',
      component: 'Input',
      componentProps: {
        placeholder: '系统自动生成',
      },
      dependencies: {
        triggerFields: ['id'],
        show: (values) => !!values.id,
        disabled: () => true,
      },
    },
    {
      fieldName: 'url',
      label: '请求地址',
      rules: 'required',
      component: 'Input',
      componentProps: {
        placeholder: '请输入请求地址',
      },
    },
    {
      fieldName: 'method',
      label: '请求方法',
      component: 'Select',
      componentProps: {
        options: getDictOptions(DICT_TYPE.SSP_REQUEST_TYPE, 'number'),
        placeholder: '请选择请求方法',
      },
    },
    {
      fieldName: 'timeout',
      label: '超时时间',
      component: 'Input',
      componentProps: {
        placeholder: '请输入超时时间',
      },
    },
  ];
}

/** 列表的搜索表单 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      fieldName: 'name',
      label: '预算公司名称',
      component: 'ApiSelect',
      componentProps: {
        allowClear: true,
        api: getCompanyNameOptions,
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
      fieldName: 'method',
      label: '请求方法',
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: getDictOptions(DICT_TYPE.SSP_REQUEST_TYPE, 'number'),
        placeholder: '请选择请求方法',
      },
    },
  ];
}

/** 列表的字段 */
export function useGridColumns(): VxeTableGridOptions<DspCompanyApi.Company>['columns'] {
  return [
    { type: 'seq', title: '#', width: 60, align: 'center', headerAlign: 'center' },
    {
      field: 'id',
      title: '预算公司ID',
      minWidth: 120,
      align: 'center',
    },
    {
      field: 'name',
      title: '预算公司名称',
      minWidth: 120,
      align: 'center',
    },
    {
      field: 'dspCode',
      title: '匹配值',
      minWidth: 120,
      align: 'center',
    },
    {
      field: 'url',
      title: '请求地址',
      minWidth: 120,
      align: 'center',
    },
    {
      field: 'method',
      title: '请求方法',
      minWidth: 120,
      align: 'center',
      cellRender: {
        name: 'CellDict',
        props: { type: DICT_TYPE.SSP_REQUEST_TYPE },
      },
    },
    {
      field: 'timeout',
      title: '超时时间',
      minWidth: 120,
      align: 'center',
    },
    {
      field: 'creator',
      title: '创建者',
      minWidth: 120,
      align: 'center',
    },
    {
      field: 'createTime',
      title: '创建时间',
      minWidth: 120,
      align: 'center',
      formatter: 'formatDateTime',
    },
    {
      field: 'updater',
      title: '更新者',
      minWidth: 120,
      align: 'center',
    },
    {
      field: 'updateTime',
      title: '更新时间',
      minWidth: 120,
      align: 'center',
      formatter: 'formatDateTime',
    },
    {
      title: '操作',
      width: 200,
      fixed: 'right',
      align: 'center',
      slots: { default: 'actions' },
    },
  ];
}

