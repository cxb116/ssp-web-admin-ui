import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SspSlotInfoApi } from '#/api/ssp/sspSlotInfo';
import type { MediaApi } from '#/api/ssp/media';
import type { SspAppApi } from '#/api/ssp/app';

import { DICT_TYPE } from '@vben/constants';
import { getDictOptions } from '@vben/hooks';

import { getMediaSimpleList } from '#/api/ssp/media';
import { getAppPage, getApp } from '#/api/ssp/app';
import { getSlotInfoPage } from '#/api/ssp/sspSlotInfo';

async function getMediaOptions() {
  const list = await getMediaSimpleList();
  return list.map((media: MediaApi.Media) => ({
    label: `${media.mediaCompanyShort || media.name}(${media.id})`,
    value: media.id,
  }));
}

async function getAppOptions(params: { mediaId?: number }) {
  const res = await getAppPage({ pageNo: 1, pageSize: 1000, mediaId: params.mediaId });
  return (res.list || []).map((app: SspAppApi.App) => ({
    label: `${app.name || ''}(${app.id})`,
    value: app.id,
  }));
}

async function getSlotInfoOptions() {
  const res = await getSlotInfoPage({ pageNo: 1, pageSize: 1000 });
  return (res.list || []).map((slot: SspSlotInfoApi.SlotInfo) => ({
    label: `${slot.name || ''}(${slot.id})`,
    value: slot.id,
  }));
}

async function getSlotNameOptions() {
  const res = await getSlotInfoPage({ pageNo: 1, pageSize: 1000 });
  const seen = new Set<string>();
  const options: { label: string; value: string }[] = [];
  (res.list || []).forEach((slot: SspSlotInfoApi.SlotInfo) => {
    const name = slot.name;
    if (name && !seen.has(name)) {
      seen.add(name);
      options.push({ label: name, value: name });
    }
  });
  return options;
}

async function getNameAliseOptions() {
  const res = await getSlotInfoPage({ pageNo: 1, pageSize: 1000 });
  const seen = new Set<string>();
  const options: { label: string; value: string }[] = [];
  (res.list || []).forEach((slot: SspSlotInfoApi.SlotInfo) => {
    const name = slot.nameAlise;
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
      label: '媒体名称',
      rules: 'required',
      component: 'ApiSelect',
      componentProps: {
        api: getMediaOptions,
        placeholder: '请选择媒体名称',
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
      fieldName: 'name',
      label: '广告位名称',
      rules: 'required',
      component: 'Input',
      componentProps: {
        placeholder: '自动拼接生成',
      },
      dependencies: {
        triggerFields: ['mediaId', 'appId', 'adScene'],
        async trigger(values: any, _formApi: any, controller: any) {
          if (values.id || !values.mediaId || !values.appId || values.adScene === undefined) return;
          const mediaList = await getMediaSimpleList();
          const media = mediaList.find((m: any) => m.id === values.mediaId);
          const mediaLabel = media?.mediaCompanyShort || media?.name || '';
          let appLabel = '';
          let osTypeLabel = '';
          try {
            const app = await getApp(values.appId);
            appLabel = app.name || '';
            const osOpts = getDictOptions(DICT_TYPE.SSP_OS_TYPE, 'number');
            const osItem = osOpts.find((o: any) => o.value === app.osType);
            osTypeLabel = osItem?.label || '';
          } catch { /* ignore */ }
          const adOpts = getDictOptions(DICT_TYPE.SSP_AD_SCENE, 'number');
          const adItem = adOpts.find((o: any) => o.value === values.adScene);
          const adSceneLabel = adItem?.label || '';
          const newName = [mediaLabel, appLabel, osTypeLabel, adSceneLabel]
            .filter(Boolean)
            .join('-');
          if (newName) {
            controller.setFieldValue('name', newName);
          }
        },
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
    // {
    //   fieldName: 'adSize',
    //   label: '样式尺寸',
    //   component: 'Select',
    //   componentProps: {
    //     options: getDictOptions(DICT_TYPE.SSP_AD_SIZE, 'number'),
    //     placeholder: '请选择样式尺寸',
    //   },
    // },
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
    // {
    //   fieldName: 'adImage',
    //   label: '广告位图片',
    //   component: 'ImageUpload',
    // },
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
      fieldName: 'mediaId',
      label: '媒体名称',
      component: 'ApiSelect',
      componentProps: {
        allowClear: true,
        api: getMediaOptions,
        placeholder: '请选择媒体名称',
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
      fieldName: 'id',
      label: '媒体广告位ID',
      component: 'ApiSelect',
      componentProps: {
        mode: 'multiple',
        allowClear: true,
        api: getSlotInfoOptions,
        placeholder: '请选择媒体广告位',
        showSearch: true,
        filterOption: (input: string, option: any) => {
          return (option?.label ?? '')
            .toLowerCase()
            .includes(input.toLowerCase());
        },
      },
    },
    {
      fieldName: 'name',
      label: '广告位名称',
      component: 'ApiSelect',
      componentProps: {
        mode: 'multiple',
        allowClear: true,
        api: getSlotNameOptions,
        placeholder: '请选择广告位名称',
        showSearch: true,
        filterOption: (input: string, option: any) => {
          return (option?.label ?? '')
            .toLowerCase()
            .includes(input.toLowerCase());
        },
      },
    },
    {
      fieldName: 'nameAlise',
      label: '内部广告位名称',
      component: 'ApiSelect',
      componentProps: {
        mode: 'multiple',
        allowClear: true,
        api: getNameAliseOptions,
        placeholder: '请选择内部广告位名称',
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
  ];
}

/** 列表的字段 */
export function useGridColumns(): VxeTableGridOptions<SspSlotInfoApi.SlotInfo>['columns'] {
  return [
    { type: 'seq', title: '#', width: 60, align: 'center', headerAlign: 'center' },
    {
      field: 'id',
      title: '媒体广告位ID',
      minWidth: 120,
      align: 'center',
    },
    {
      field: 'name',
      title: '广告位名称',
      minWidth: 240,
      align: 'left',
      headerAlign: 'center',
    },
    {
      field: 'nameAlise',
      title: '内部广告位名称',
      minWidth: 240,
      align: 'left',
      headerAlign: 'center',
    },
    {
      field: 'mediaName',
      title: '媒体名称',
      minWidth: 150,
      align: 'center',
      slots: {
        default: 'mediaName-slot',
      },
    },
    {
      field: 'appName',
      title: '应用名称',
      minWidth: 150,
      align: 'center',
      slots: {
        default: 'appName-slot',
      },
    },
    {
      field: 'accessType',
      title: '接入方式',
      minWidth: 120,
      align: 'center',
      cellRender: {
        name: 'CellDict',
        props: { type: DICT_TYPE.SSP_ACCESS_TYPE },
      },
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
      field: 'adScene',
      title: '广告场景',
      minWidth: 120,
      align: 'center',
      cellRender: {
        name: 'CellDict',
        props: { type: DICT_TYPE.SSP_AD_SCENE },
      },
    },
    {
      field: 'reqCount',
      title: '今日请求',
      minWidth: 120,
      align: 'center',
    },
    {
      field: 'ls',
      title: '关联预算位',
      minWidth: 120,
      align: 'center',
    },
    {
      field: 'sspPayType',
      title: '结算方式',
      minWidth: 120,
      align: 'center',
      cellRender: {
        name: 'CellDict',
        props: { type: DICT_TYPE.SSP_PAY_TYPE },
      },
    },
    {
      field: 'enable',
      title: '广告位状态',
      minWidth: 120,
      align: 'center',
      cellRender: {
        name: 'CellDict',
        props: { type: DICT_TYPE.SSP_ENABLE },
      },
    },
    {
      field: 'createTime',
      title: '创建时间',
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

