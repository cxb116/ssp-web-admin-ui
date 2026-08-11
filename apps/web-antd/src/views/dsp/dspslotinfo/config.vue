<script lang="ts" setup>
import { ref, onMounted, watch, computed, h, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page, useVbenForm } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { getDictOptions } from '@vben/hooks';

import { DICT_TYPE } from '@vben/constants';

import { getSlotInfo, updateSlotInfo, createSlotInfo } from '#/api/dsp/dspslotinfo';
import { getProduct, getProductPage } from '#/api/dsp/product';
import { getCompanyPage } from '#/api/dsp/company';
import { getLaunchDspSlotIdQuery, getLaunchSspSlotList, createLaunch, updateLaunch, deleteLaunch } from '#/api/dsp/launch';
import { getSlotInfoPage as getSspSlotInfoPage } from '#/api/ssp/sspSlotInfo';
import type { SspSlotInfoApi } from '#/api/ssp/sspSlotInfo';

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const slotInfo = ref<any>(null);
const productOptions = ref<any[]>([]);
const companyOptions = ref<any[]>([]);

const id = ref(Number(route.params.id));

const osTypeOptions = getDictOptions(DICT_TYPE.SSP_OS_TYPE, 'number');
const adSceneOptions = getDictOptions(DICT_TYPE.SSP_AD_SCENE, 'number');
const payTypeOptions = getDictOptions(DICT_TYPE.SSP_PAY_TYPE, 'number');
const launchTimeOptions = [
  { label: '全时段', value: 1 },
  { label: '自定义', value: 2 },
];
const pkgTransOptions = [
  { label: '不透传', value: 1 },
  { label: '透传', value: 2 },
];
const isDragging = ref(false);
const dragMode = ref(0);
const currentDspPayType = ref(0);

function updateDspPayType(value: number) {
  nextTick(() => {
    currentDspPayType.value = value;
  });
}

interface SspSlotBinding {
  id: number;
  launchId?: number;
  sspSlotId: number;
  sspSlotName: string;
  sspSlotCode: string;
  osType?: number;
  adScene?: number;
  sspPayType?: number;
  trafficGroup?: number;
  trafficWeight?: number;
  floorPrice?: number;
  dspPayRatio?: number;
  launchTime?: number;
  launchHour?: string;
  logTime?: number;
  req?: number;
  ims?: number;
  clk?: number;
  pkgTrans?: number;
}

const sspSlotBindings = ref<SspSlotBinding[]>([]);

const bindModalVisible = ref(false);
const bindLoading = ref(false);
const bindSlotList = ref<SspSlotInfoApi.SlotInfo[]>([]);
const bindSearchName = ref('');

function getDictLabel(options: any[], value: number | undefined) {
  if (value === undefined || value === null) return '-';
  const item = options.find((opt) => opt.value === value);
  return item?.label || value;
}

function shouldShowFloorPrice(dspPayType: number, sspPayType: number | undefined): boolean {
  if (dspPayType === 1 && sspPayType === 2) {
    return true;
  }
  if (dspPayType === 2 && (sspPayType === 1 || sspPayType === 3)) {
    return true;
  }
  return false;
}

function shouldShowDspPayRatio(dspPayType: number, sspPayType: number | undefined): boolean {
  if (dspPayType === 2 && sspPayType === 2) {
    return true;
  }
  return false;
}

async function loadSspSlotBindings() {
  if (!id.value) return;
  try {
    const launches = await getLaunchDspSlotIdQuery(id.value);
    sspSlotBindings.value = launches.map((launch: any, index: number) => {
      const sspSlotInfoDO = (launch as any).sspSlotInfoDo || [];
      const slotInfo = sspSlotInfoDO.length > 0 ? sspSlotInfoDO[0] : null;
      return {
        id: index + 1,
        launchId: launch.id,
        sspSlotId: launch.sspSlotId,
        sspSlotName: slotInfo?.name || `媒体广告位${launch.sspSlotId}`,
        sspSlotCode: slotInfo?.nameAlise || '',
        osType: slotInfo?.osType,
        adScene: slotInfo?.adScene,
        sspPayType: slotInfo?.sspPayType,
        trafficGroup: launch.trafficGroup,
        trafficWeight: launch.trafficWeight,
        floorPrice: launch.floorPrice,
        dspPayRatio: launch.dspPayRatio,
        launchTime: launch.launchTime,
        launchHour: launch.launchHour,
        logTime: launch.logTime,
        req: launch.req,
        ims: launch.ims,
        clk: launch.clk,
        pkgTrans: launch.pkgTrans,
      };
    });
  } catch {
    console.error('加载绑定的媒体广告位失败');
  }
}

async function handleBindSspSlot() {
  bindModalVisible.value = true;
  bindSearchName.value = '';
  await loadBindSlotList();
}

async function loadBindSlotList() {
  bindLoading.value = true;
  try {
    const params: any = {
      pageNo: 1,
      pageSize: 1000,
    };
    if (bindSearchName.value) {
      params.name = bindSearchName.value;
    }
    const result = await getSspSlotInfoPage(params);
    bindSlotList.value = result.list || [];
  } catch {
    message.error('加载媒体广告位失败');
  } finally {
    bindLoading.value = false;
  }
}

function isSlotBound(sspSlotId: number): boolean {
  return sspSlotBindings.value.some((b) => b.sspSlotId === sspSlotId);
}

async function handleBindSingle(sspSlotId: number, row: SspSlotInfoApi.SlotInfo) {
  if (isSlotBound(sspSlotId)) {
    message.info('该媒体广告位已绑定');
    return;
  }

  let trafficGroup = 1;
  let trafficWeight = 100;

  if (id.value) {
    const existingLaunches = await getLaunchSspSlotList(row.id!);
    const hasTrafficGroup1 = existingLaunches.some((launch: any) => launch.trafficGroup === 1);

    if (hasTrafficGroup1) {
      const group1Launches = existingLaunches.filter((launch: any) => launch.trafficGroup === 1);
      const totalWeight = group1Launches.reduce((sum: number, launch: any) => sum + (launch.trafficWeight || 0), 0);
      const count = group1Launches.length + 1;
      trafficWeight = Math.floor(totalWeight / count);
      const remaining = totalWeight % count;
      if (remaining > 0) {
        trafficWeight += 1;
      }
      for (const launch of group1Launches) {
        await updateLaunch({
          ...launch,
          trafficWeight: Math.floor(totalWeight / count),
        } as any);
      }
    }
  }

  let launchId: number | undefined;

  if (id.value) {
    const result = await createLaunch({
      sspSlotId: row.id!,
      dspSlotId: id.value,
      trafficWeight,
      trafficGroup,
      floorPrice: 0,
      dspPayRatio: 0,
      launchTime: 1,
      launchHour: '000000000000000000000000',
      logTime: 0,
      req: 0,
      ims: 0,
      clk: 0,
      pkgTrans: 1,
    } as any);
    launchId = result.id;
  }

  sspSlotBindings.value.push({
    id: sspSlotBindings.value.length + 1,
    launchId,
    sspSlotId: row.id!,
    sspSlotName: row.name || '',
    sspSlotCode: row.nameAlise || '',
    osType: row.osType,
    adScene: row.adScene,
    trafficGroup,
    trafficWeight,
    floorPrice: 0,
    dspPayRatio: 0,
    launchTime: 1,
    launchHour: '000000000000000000000000',
    logTime: 0,
    req: 0,
    ims: 0,
    clk: 0,
    pkgTrans: 1,
  });

  bindModalVisible.value = false;
  message.success('绑定成功');
}

async function handleDeleteBinding(binding: SspSlotBinding) {
  if (binding.launchId && binding.launchId > 0) {
    try {
      await deleteLaunch(binding.launchId);
      message.success('删除成功');
    } catch (error: any) {
      message.error('删除失败: ' + (error?.message || '未知错误'));
      return;
    }
  }
  const index = sspSlotBindings.value.findIndex((b) => b.id === binding.id);
  if (index > -1) {
    sspSlotBindings.value.splice(index, 1);
  }
}

const bindTableColumns = [
  {
    title: '媒体广告位ID',
    dataIndex: 'id',
    key: 'id',
    width: 80,
    align: 'center',
  },
  {
    title: '媒体广告位名称',
    dataIndex: 'name',
    key: 'name',
    width: 250,
    customHeaderCell: () => ({ style: { textAlign: 'center' } }),
    customCell: () => ({ style: { textAlign: 'left' } }),
    customRender: ({ text, record }: { text: string; record: SspSlotInfoApi.SlotInfo }) => {
      return `${text || '-'}（ID: ${record.id}）`;
    },
  },
  {
    title: '内部广告位名称',
    dataIndex: 'nameAlise',
    key: 'nameAlise',
    width: 200,
    customHeaderCell: () => ({ style: { textAlign: 'center' } }),
    customCell: () => ({ style: { textAlign: 'left' } }),
  },
  {
    title: '操作系统',
    dataIndex: 'osType',
    key: 'osType',
    width: 100,
    customRender: ({ value }: { value: number }) => getDictLabel(osTypeOptions, value),
  },
  {
    title: '广告场景',
    dataIndex: 'adScene',
    key: 'adScene',
    width: 100,
    customRender: ({ value }: { value: number }) => getDictLabel(adSceneOptions, value),
  },
  {
    title: '操作',
    key: 'action',
    width: 100,
    align: 'center',
    customRender: ({ record }: { record: SspSlotInfoApi.SlotInfo }) => {
      const bound = isSlotBound(record.id!);
      return bound
        ? h('span', { class: 'text-green-500' }, '已绑定')
        : h('a-button', {
            size: 'small',
            type: 'primary',
            onClick: () => handleBindSingle(record.id!, record),
          }, '绑定');
    },
  },
];

function handleHourMouseDown(binding: SspSlotBinding, index: number) {
  isDragging.value = true;
  const launchHours = binding.launchHour ? binding.launchHour.split('').map((c) => parseInt(c, 10)) : Array(24).fill(0);
  dragMode.value = launchHours[index] === 0 ? 1 : 0;
  launchHours[index] = dragMode.value;
  binding.launchHour = launchHours.join('');
}

function handleHourMouseEnter(binding: SspSlotBinding, index: number) {
  if (isDragging.value) {
    const launchHours = binding.launchHour ? binding.launchHour.split('').map((c) => parseInt(c, 10)) : Array(24).fill(0);
    launchHours[index] = dragMode.value;
    binding.launchHour = launchHours.join('');
  }
}

function handleHourMouseUp() {
  isDragging.value = false;
}

onMounted(async () => {
  loading.value = true;
  try {
    const companyRes = await getCompanyPage({ pageNo: 1, pageSize: 1000 });
    companyOptions.value = (companyRes.list || []).map((c: any) => ({
      label: `${c.name || ''}(${c.id})`,
      value: c.id,
    }));
    if (id.value) {
      const res = await getSlotInfo(id.value);
      slotInfo.value = res;
      // 编辑场景：按已有 companyId 加载产品列表
      if (res?.companyId) {
        try {
          const productRes = await getProductPage({ pageNo: 1, pageSize: 1000, companyId: res.companyId });
          productOptions.value = (productRes.list || []).map((p: any) => ({
            label: `${p.name || ''}(${p.id})`,
            value: p.id,
          }));
        } catch {
          // ignore
        }
      }
      await loadSspSlotBindings();
    } else {
      // 复制场景：从路由 query.copyFrom 读取源数据 id
      const copyFrom = route.query.copyFrom;
      if (copyFrom) {
        const sourceId = Number(copyFrom);
        const res = await getSlotInfo(sourceId);
        // 复制时排除预算方APPSECRET、预算方APPID、预算广告位ID
        const { dspAppSecret, dspAppId, dspSlotCode, id: _id, ...rest } = res;
        void dspAppSecret; void dspAppId; void dspSlotCode; void _id;
        slotInfo.value = rest;
        if (rest?.companyId) {
          try {
            const productRes = await getProductPage({ pageNo: 1, pageSize: 1000, companyId: rest.companyId });
            productOptions.value = (productRes.list || []).map((p: any) => ({
              label: `${p.name || ''}(${p.id})`,
              value: p.id,
            }));
          } catch {
            // ignore
          }
        }
      }
    }
  } finally {
    loading.value = false;
  }
});

// 监听 slotInfo 变化，设置表单值
watch(
  () => slotInfo.value,
  (val) => {
    if (val) {
      formApi.setValues(val);
      currentDspPayType.value = val.dspPayType || 0;
    }
  },
  { immediate: true },
);

const [BaseForm, formApi] = useVbenForm({
  commonConfig: {
    componentProps: { class: 'w-full' },
    formItemClass: 'col-span-1',
    labelWidth: 120,
  },
  layout: 'horizontal',
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2',
  schema: [
    {
    fieldName: 'companyId',
    label: '公司名称',
    component: 'ApiSelect',
    componentProps: (_values: any, formApi: any) => ({
      options: companyOptions.value,
      showSearch: true,
      filterOption: false,
      // 切换公司时：清空产品，按公司重新加载产品列表
      onChange: async (value: number | undefined) => {
        formApi.setFieldValue('productId', undefined);
        formApi.setFieldValue('osType', undefined);
        if (!value) {
          productOptions.value = [];
          return;
        }
        try {
          const res = await getProductPage({ pageNo: 1, pageSize: 1000, companyId: value });
          productOptions.value = (res.list || []).map((p: any) => ({
            label: `${p.name || ''}(${p.id})`,
            value: p.id,
          }));
        } catch {
          productOptions.value = [];
        }
      },
    }),
  },
      {
    fieldName: 'productId',
    label: '产品名称',
    component: 'ApiSelect',
    componentProps: (values: any, formApi: any) => ({
      options: productOptions.value,
      showSearch: true,
      filterOption: false,
      // 选公司前禁用
      disabled: !values.companyId,
      // 选择产品后自动赋值操作系统
      onChange: async (value: number | undefined) => {
        if (!value) return;
        try {
          const product = await getProduct(value);
          if (product?.osType !== undefined) {
            formApi.setFieldValue('osType', product.osType);
          }
        } catch {
          // ignore
        }
      },
    }),
  },
  
{
    fieldName: 'name',
    label: '预算位名称',
    component: 'Input',
  },
{
    fieldName: 'osType',
    label: '操作系统',
    component: 'Select',
    componentProps: {
      options: getDictOptions(DICT_TYPE.SSP_OS_TYPE, 'number'),
    },
  },
{
    fieldName: 'adScene',
    label: '广告场景',
    component: 'Select',
    componentProps: {
      options: getDictOptions(DICT_TYPE.SSP_AD_SCENE, 'number'),
    },
  },
{
    fieldName: 'dspPayType',
    label: '结算方式',
    component: 'Select',
    componentProps: {
      options: getDictOptions(DICT_TYPE.SSP_PAY_TYPE, 'number'),
      onChange: (value: number) => {
        updateDspPayType(value);
      },
    },
  },
  {
    fieldName: 'dspSlotCode',
    label: '预算广告位ID',
    component: 'Input',
  },
  
  {
    fieldName: 'dspAppKey',
    label: '预算方APPKEY',
    component: 'Input',
  },
  {
    fieldName: 'dspAppSecret',
    label: '预算方APPSECRET',
    component: 'Input',
  },
  {
    fieldName: 'dspAppId',
    label: '预算方APPID',
    component: 'Input',
  },
  {
    fieldName: 'dspAppPkg',
    label: '应用包名',
    component: 'Input',
  },
  {
    fieldName: 'dspAppVer',
    label: '应用版本号',
    component: 'Input',
  },
  {
    fieldName: 'dspAppStoreVer',
    label: '应用商店版本号',
    component: 'Input',
  },
  {
    fieldName: 'priceEncryptKey',
    label: '价格加密KEY',
    component: 'Input',
  },
  {
    fieldName: 'dspAppStoreLink',
    label: '应用商店地址',
    component: 'Input',
  },
]
});

async function handleSave() {
  const { valid } = await formApi.validate();
  if (!valid) return;

  const formData = await formApi.getValues();

  try {
    if (id.value) {
      await updateSlotInfo({ id: id.value, ...formData });
    } else {
      const createResult = await createSlotInfo(formData);
      if (createResult && createResult.id) {
        id.value = createResult.id;
      }
    }

    for (const binding of sspSlotBindings.value) {
      if (binding.launchId && binding.launchId > 0) {
        await updateLaunch({
          id: binding.launchId,
          sspSlotId: binding.sspSlotId,
          dspSlotId: id.value!,
          trafficWeight: binding.trafficWeight || 0,
          trafficGroup: binding.trafficGroup || 0,
          floorPrice: binding.floorPrice || 0,
          dspPayRatio: binding.dspPayRatio || 0,
          launchTime: binding.launchTime || 1,
          launchHour: binding.launchHour || '000000000000000000000000',
          logTime: binding.logTime || 0,
          req: binding.req || 0,
          ims: binding.ims || 0,
          clk: binding.clk || 0,
          pkgTrans: binding.pkgTrans || 1,
        } as any);
      } else if (id.value) {
        const result = await createLaunch({
          sspSlotId: binding.sspSlotId,
          dspSlotId: id.value,
          trafficWeight: binding.trafficWeight || 0,
          trafficGroup: binding.trafficGroup || 0,
          floorPrice: binding.floorPrice || 0,
          dspPayRatio: binding.dspPayRatio || 0,
          launchTime: binding.launchTime || 1,
          launchHour: binding.launchHour || '000000000000000000000000',
          logTime: binding.logTime || 0,
          req: binding.req || 0,
          ims: binding.ims || 0,
          clk: binding.clk || 0,
          pkgTrans: binding.pkgTrans || 1,
        } as any);
        binding.launchId = result.id;
      }
    }

    message.success('保存成功');
    router.back();
  } catch {
    message.error('保存失败');
  }
}

function handleBack() {
  router.back();
}
</script>

<template>
  <Page :loading="loading">
    <div class="mb-4">
      <h2 class="text-xl font-semibold">基本信息</h2>
    </div>
    <a-card>
      <BaseForm />
    </a-card>

    <div class="mt-4">
      <div class="mb-4">
        <h2 class="text-xl font-semibold">投放配置</h2>
      </div>
      <a-card>
        <div class="flex justify-between items-center mb-4">
          <span class="text-gray-600">已绑定媒体广告位</span>
          <a-button type="primary" @click="handleBindSspSlot">+ 添加广告位</a-button>
        </div>

        <div v-if="sspSlotBindings.length > 0" class="space-y-3">
          <div
            v-for="binding in sspSlotBindings"
            :key="binding.id"
            class="flex rounded border border-gray-200 overflow-hidden"
          >
            <div class="p-4 flex-1 min-w-0">
              <div class="flex items-center gap-4 mb-2 pb-2 pt-2 pl-4 pr-4 border-b border-gray-200 bg-gray-800 -mx-4 mt-0">
                <span class="font-medium text-white">{{ binding.sspSlotName }}（ID: {{ binding.sspSlotId }}）</span>
                <span class="text-gray-400">|</span>
                <span class="text-gray-300">内部广告位名称: {{ binding.sspSlotCode || '-' }}</span>
                <span class="text-gray-400">|</span>
                <span class="text-gray-300">操作系统: {{ getDictLabel(osTypeOptions, binding.osType) }}</span>
                <span class="text-gray-400">|</span>
                <span class="text-gray-300">广告场景: {{ getDictLabel(adSceneOptions, binding.adScene) }}</span>
                <span class="text-gray-400">|</span>
                <span class="text-gray-300">结算方式: {{ getDictLabel(payTypeOptions, binding.sspPayType) }}</span>
                <span class="text-gray-400">|</span>
                <span class="text-gray-300">流量组: {{ binding.trafficGroup || '-' }}</span>
                <span class="text-gray-400">|</span>
                <span class="text-gray-300">流量权重: {{ binding.trafficWeight || 0 }}%</span>
              </div>

              <div class="grid grid-cols-6 gap-4 mt-4">
                <div class="flex items-center gap-2">
                  <label class="text-gray-500 w-16 shrink-0">请求控制</label>
                  <a-input-number
                    v-model:value="binding.req"
                    :min="0"
                    class="flex-1"
                  />
                </div>
                <div class="flex items-center gap-2">
                  <label class="text-gray-500 w-16 shrink-0">展现控制</label>
                  <a-input-number
                    v-model:value="binding.ims"
                    :min="0"
                    class="flex-1"
                  />
                </div>
                <div class="flex items-center gap-2">
                  <label class="text-gray-500 w-16 shrink-0">点击控制</label>
                  <a-input-number
                    v-model:value="binding.clk"
                    :min="0"
                    class="flex-1"
                  />
                </div>
                <div class="flex items-center gap-2">
                  <label class="text-gray-500 w-16 shrink-0">投放时段</label>
                  <a-select
                    v-model:value="binding.launchTime"
                    :options="launchTimeOptions"
                    class="flex-1"
                  />
                </div>
                <div class="flex items-center gap-2">
                  <label class="text-gray-500 w-12 shrink-0">包透传</label>
                  <a-select
                    v-model:value="binding.pkgTrans"
                    :options="pkgTransOptions"
                    class="flex-1"
                  />
                </div>
                <div v-if="currentDspPayType === 2 && binding.sspPayType === 2" class="flex items-center gap-2">
                  <label class="text-gray-500 w-20 shrink-0 whitespace-nowrap">成交系数</label>
                  <a-input-number
                    v-model:value="binding.dspPayRatio"
                    :min="0"
                    class="flex-1"
                  />
                </div>
                <div v-if="currentDspPayType === 2 && binding.sspPayType !== 2" class="flex items-center gap-2">
                  <label class="text-gray-500 w-20 shrink-0 whitespace-nowrap">底价</label>
                  <a-input-number
                    v-model:value="binding.floorPrice"
                    :min="0"
                    class="flex-1"
                  />
                  <span class="text-gray-400 text-sm">元</span>
                </div>
              </div>

              <div
                v-if="binding.launchTime === 2"
                class="mt-4"
                @mouseup="handleHourMouseUp"
                @mouseleave="handleHourMouseUp"
              >
                <div class="grid grid-cols-24 gap-1">
                  <div
                    v-for="hour in 24"
                    :key="hour"
                    class="text-center text-xs text-gray-500"
                  >
                    {{ hour - 1 }}
                  </div>
                </div>
                <div class="grid grid-cols-24 gap-1 mt-1">
                  <div
                    v-for="(val, hi) in (binding.launchHour || '000000000000000000000000').split('')"
                    :key="hi"
                    class="h-6 rounded cursor-pointer border border-gray-200 transition-colors"
                    :class="val === '1' ? 'bg-blue-500 border-blue-500' : 'bg-gray-100'"
                    @mousedown="handleHourMouseDown(binding, hi)"
                    @mouseenter="handleHourMouseEnter(binding, hi)"
                  />
                </div>
              </div>

              
            </div>
            <div
              class="w-20 bg-blue-500 hover:bg-blue-600 flex items-center justify-center cursor-pointer transition-colors shrink-0"
              @click="handleDeleteBinding(binding)"
            >
              <span class="text-white text-sm font-medium">删除</span>
            </div>
          </div>
        </div>

        <div v-else class="py-4 text-center text-gray-400">
          暂无绑定媒体广告位
        </div>
      </a-card>
    </div>

    <div class="flex justify-center gap-4 mt-4">
      <a-button @click="handleBack">取消</a-button>
      <a-button type="primary" @click="handleSave">保存</a-button>
    </div>

    <a-modal
      title="绑定媒体广告位"
      v-model:open="bindModalVisible"
      :width="1300"
      :footer="null"
    >
      <div class="mb-4 flex gap-3">
        <a-input
          v-model:value="bindSearchName"
          placeholder="广告位名称"
          class="flex-1"
          allow-clear
          @pressEnter="loadBindSlotList"
        />
        <a-button type="primary" @click="loadBindSlotList">搜索</a-button>
        <a-button
          @click="() => {
            bindSearchName.value = '';
            loadBindSlotList();
          }"
        >
          重置
        </a-button>
      </div>

      <a-table
        :loading="bindLoading"
        :data-source="bindSlotList"
        row-key="id"
        :pagination="false"
        :scroll="{ y: 500 }"
        :columns="bindTableColumns"
      />
    </a-modal>
  </Page>
</template>
