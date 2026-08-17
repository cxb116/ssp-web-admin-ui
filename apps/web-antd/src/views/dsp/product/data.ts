import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DspProductApi } from '#/api/dsp/product';
import type { DspCompanyApi } from '#/api/dsp/company';

import { DICT_TYPE } from '@vben/constants';
import { getDictOptions } from '@vben/hooks';

import { getCompanyPage } from '#/api/dsp/company';
import { getProductPage } from '#/api/dsp/product';

async function getCompanyOptions() {
  const res = await getCompanyPage({ pageNo: 1, pageSize: 1000 });
  return (res.list || []).map((company: DspCompanyApi.Company) => ({
    label: `${company.name || ''}(${company.id})`,
    value: company.id,
  }));
}

async function getProductNameOptions() {
  const res = await getProductPage({ pageNo: 1, pageSize: 1000 });
  const seen = new Set<string>();
  const options: { label: string; value: string }[] = [];
  (res.list || []).forEach((product: DspProductApi.Product) => {
    if (product.name && !seen.has(product.name)) {
      seen.add(product.name);
      options.push({ label: `${product.name}(${product.id})`, value: product.name });
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
      fieldName: 'companyId',
      label: '预算公司名称',
      rules: 'required',
      component: 'ApiSelect',
      componentProps: {
        allowClear: true,
        api: getCompanyOptions,
        placeholder: '请选择预算公司名称',
        showSearch: true,
        filterOption: false,
      },
    },
    {
      fieldName: 'name',
      label: '预算产品名称',
      rules: 'required',
      component: 'Input',
      componentProps: {
        placeholder: '请输入预算产品名称',
      },
    },
    {
      fieldName: 'osType',
      label: '操作系统',
      component: 'Select',
      componentProps: {
        options: getDictOptions(DICT_TYPE.SSP_OS_TYPE, 'number'),
        placeholder: '请选择操作系统',
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
        filterOption: false,
      },
    },
    {
      fieldName: 'name',
      label: '预算产品名称',
      component: 'ApiSelect',
      componentProps: {
        mode: 'multiple',
        allowClear: true,
        api: getProductNameOptions,
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
      fieldName: 'osType',
      label: '操作系统',
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: getDictOptions(DICT_TYPE.SSP_OS_TYPE, 'number'),
        placeholder: '请选择操作系统',
      },
    },
  ];
}

/** 列表的字段 */
export function useGridColumns(): VxeTableGridOptions<DspProductApi.Product>['columns'] {
  return [
    { type: 'seq', title: '#', width: 60, align: 'center', headerAlign: 'center' },
    {
      field: 'id',
      title: '预算产品ID',
      minWidth: 120,
      align: 'center',
    },
    {
      field: 'companyName',
      title: '预算公司名称',
      minWidth: 120,
      align: 'center',
    },
    {
      field: 'name',
      title: '预算产品名称',
      minWidth: 120,
      align: 'center',
    },
    {
      field: 'osType',
      title: '操作系统',
      minWidth: 120,
      align: 'center',
      cellRender: {
        name: 'CellDict',
        props: { type: DICT_TYPE.SSP_OS_TYPE },
      },
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