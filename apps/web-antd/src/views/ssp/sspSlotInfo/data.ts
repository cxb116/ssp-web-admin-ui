import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SspAppApi } from '#/api/ssp/app';
import type { MediaApi } from '#/api/ssp/media';
import type { SspSlotInfoApi } from '#/api/ssp/sspSlotInfo';

import { DICT_TYPE } from '@vben/constants';
import { getDictOptions } from '@vben/hooks';

import { getAppPage } from '#/api/ssp/app';
import { getMediaSimpleList } from '#/api/ssp/media';
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

async function getSlotNameOptions() {
  const res = await getSlotInfoPage({ pageNo: 1, pageSize: 1000 });
  return (res.list || [])
    .filter((slot: SspSlotInfoApi.SlotInfo) => !!slot.name)
    .map((slot: SspSlotInfoApi.SlotInfo) => ({
      label: `${slot.name || ''}(${slot.id})`,
      value: slot.name,
    }));
}

async function getSlotAliasOptions() {
  const res = await getSlotInfoPage({ pageNo: 1, pageSize: 1000 });
  return (res.list || [])
    .filter((slot: SspSlotInfoApi.SlotInfo) => !!slot.nameAlise)
    .map((slot: SspSlotInfoApi.SlotInfo) => ({
      label: `${slot.nameAlise || ''}(${slot.id})`,
      value: slot.nameAlise,
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
      fieldName: 'mediaId',
      label: '媒体名称',
      rules: 'required',
      component: 'ApiSelect',
      componentProps: {
        api: getMediaOptions,
        placeholder: '请选择媒体名称',
        showSearch: true,
        optionFilterProp: 'label',
      },
    },
    {
      fieldName: 'appId',
      label: '应用名称',
      rules: 'required',
      component: 'ApiSelect',
      componentProps: {
        api: getAppOptions,
        dependencies: ['mediaId'],
        placeholder: '请选择应用名称',
        showSearch: true,
        optionFilterProp: 'label',
      },
    },
    {
      fieldName: 'name',
      label: '广告位名称',
      rules: 'required',
      component: 'Input',
      componentProps: {
        placeholder: '请输入广告位名称',
      },
    },
    {
      fieldName: 'nameAlise',
      label: '内部广告位名称',
      component: 'Input',
      dependencies: {
        triggerFields: [''],
        show: () => false,
      },
      componentProps: {
        placeholder: '请输入内部广告位名称',
      },
    },
    {
      fieldName: 'adScene',
      label: '广告场景',
      rules: 'required',
      component: 'Select',
      componentProps: {
        options: getDictOptions(DICT_TYPE.SSP_AD_SCENE, 'number'),
        placeholder: '请选择广告场景',
      },
    },
    {
      fieldName: 'adSize',
      label: '样式尺寸',
      component: 'Select',
      componentProps: {
        options: getDictOptions(DICT_TYPE.SSP_AD_SIZE, 'number'),
        placeholder: '请选择样式尺寸',
      },
    },
    {
      fieldName: 'sspPayType',
      label: '结算方式',
      rules: 'required',
      component: 'Select',
      componentProps: {
        options: getDictOptions(DICT_TYPE.SSP_PAY_TYPE, 'number'),
        placeholder: '请选择结算方式',
      },
    },
    {
      fieldName: 'sspDealRatio',
      label: '分成系数',
      component: 'Input',
      dependencies: {
        triggerFields: ['sspPayType'],
        show: (values) => values.sspPayType === 1,
      },
      componentProps: {
        placeholder: '请输入分成系数',
      },
    },
    {
      fieldName: 'fixedPrice',
      label: '固价',
      component: 'Input',
      dependencies: {
        triggerFields: ['sspPayType'],
        show: (values) => values.sspPayType === 3,
      },
      componentProps: {
        placeholder: '请输入固价',
      },
    },
    {
      fieldName: 'adImage',
      label: '广告位图片',
      component: 'ImageUpload',
    },
    {
      fieldName: 'enable',
      label: '状态',
      rules: 'required',
      component: 'Select',
      componentProps: {
        options: getDictOptions(DICT_TYPE.SSP_ENABLE, 'number'),
        placeholder: '请选择状态',
      },
    },
  ];
}

/** 列表的搜索表单 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      fieldName: 'id',
      label: '广告位ID',
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入广告位ID',
      },
    },
    {
      fieldName: 'mediaId',
      label: '媒体名称',
      component: 'ApiSelect',
      componentProps: {
        allowClear: true,
        api: getMediaOptions,
        placeholder: '请选择媒体名称',
        showSearch: true,
        optionFilterProp: 'label',
      },
    },
    {
      fieldName: 'appId',
      label: '应用名称',
      component: 'ApiSelect',
      componentProps: {
        allowClear: true,
        api: getAppOptions,
        dependencies: ['mediaId'],
        placeholder: '请选择应用名称',
        showSearch: true,
        optionFilterProp: 'label',
      },
    },
    {
      fieldName: 'name',
      label: '广告位名称',
      component: 'ApiSelect',
      componentProps: {
        allowClear: true,
        api: getSlotNameOptions,
        placeholder: '请输入广告位名称',
        showSearch: true,
        optionFilterProp: 'label',
      },
    },
    {
      fieldName: 'nameAlise',
      label: '内部广告位名称',
      component: 'ApiSelect',
      componentProps: {
        allowClear: true,
        api: getSlotAliasOptions,
        placeholder: '请输入内部广告位名称',
        showSearch: true,
        optionFilterProp: 'label',
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
      fieldName: 'sspPayType',
      label: '结算方式',
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: getDictOptions(DICT_TYPE.SSP_PAY_TYPE, 'number'),
        placeholder: '请选择结算方式',
      },
    },
    {
      fieldName: 'enable',
      label: '广告位状态',
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: getDictOptions(DICT_TYPE.SSP_ENABLE, 'number'),
        placeholder: '请选择广告位状态',
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
    {
      fieldName: 'updateTime',
      label: '更新时间',
      component: 'RangePicker',
      componentProps: {
        ...getRangePickerDefaultProps(),
        allowClear: true,
      },
    },
  ];
}

/** 列表的字段 */
export function useGridColumns(): VxeTableGridOptions<SspSlotInfoApi.SlotInfo>['columns'] {
  return [
    { type: 'checkbox', width: 40 },
    {
      field: 'id',
      title: '广告位ID',
      minWidth: 120,
    },
    {
      field: 'name',
      title: '广告位名称',
      minWidth: 120,
    },
    {
      field: 'nameAlise',
      title: '内部广告位名称',
      minWidth: 120,
    },
    {
      field: 'mediaShortName',
      title: '媒体简称',
      minWidth: 120,
    },
    {
      field: 'appName',
      title: '应用名称',
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
      field: 'osType',
      title: '操作系统',
      minWidth: 120,
      cellRender: {
        name: 'CellDict',
        props: { type: DICT_TYPE.SSP_OS_TYPE },
      },
    },
    {
      field: 'adScene',
      title: '广告场景',
      minWidth: 120,
      cellRender: {
        name: 'CellDict',
        props: { type: DICT_TYPE.SSP_AD_SCENE },
      },
    },
    {
      field: 'ls',
      title: '预算绑定',
      minWidth: 120,
    },
    {
      field: 'adSize',
      title: '样式尺寸',
      minWidth: 120,
      cellRender: {
        name: 'CellDict',
        props: { type: DICT_TYPE.SSP_AD_SIZE },
      },
    },
    {
      field: 'sspPayType',
      title: '结算方式',
      minWidth: 120,
      cellRender: {
        name: 'CellDict',
        props: { type: DICT_TYPE.SSP_PAY_TYPE },
      },
    },
    {
      field: 'sspDealRatio',
      title: '分成系数',
      minWidth: 120,
    },
    {
      field: 'fixedPrice',
      title: '固价',
      minWidth: 120,
    },
    {
      field: 'enable',
      title: '广告位状态',
      minWidth: 120,
      cellRender: {
        name: 'CellDict',
        props: { type: DICT_TYPE.SSP_ENABLE },
      },
    },
    {
      field: 'createTime',
      title: '创建时间',
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
