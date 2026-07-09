<script lang="ts" setup>
import type { SspSlotInfoApi } from '#/api/ssp/sspSlotInfo';
import type { SspAppApi } from '#/api/ssp/app';

import { computed, onMounted, ref, h } from 'vue';

import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { getSlotInfo, updateSlotInfo } from '#/api/ssp/sspSlotInfo';
import { getApp } from '#/api/ssp/app';
import { getDictOptions } from '@vben/hooks';
import { DICT_TYPE } from '@vben/constants';
import { IconifyIcon } from '@vben/icons';
import { getSlotInfoPage } from '#/api/dsp/dspslotinfo';
import type { DspSlotInfoApi } from '#/api/dsp/dspslotinfo';
import { getCompanyPage } from '#/api/dsp/company';
import { getProductPage } from '#/api/dsp/product';
import { getTrafficGroups, createLaunch, updateLaunch, deleteLaunch, getLaunchSspSlotIdQuery } from '#/api/dsp/launch';

// ==================== 路由 & 基础状态 ====================
const router = useRouter();
const loading = ref(false);
const slotInfo = ref<SspSlotInfoApi.SlotInfo>();
const appInfo = ref<SspAppApi.App>();

const slotId = computed(() => {
  return parseInt(router.currentRoute.value.params.id as string);
});

// ==================== 字典选项 ====================
const adSceneOptions = getDictOptions(DICT_TYPE.SSP_AD_SCENE, 'number');
const accessTypeOptions = getDictOptions(DICT_TYPE.SSP_ACCESS_TYPE, 'number');
const osTypeOptions = getDictOptions(DICT_TYPE.SSP_OS_TYPE, 'number');
const payTypeOptions = getDictOptions(DICT_TYPE.SSP_PAY_TYPE, 'number');
const adSizeOptions = getDictOptions(DICT_TYPE.SSP_AD_SIZE, 'number');
const launchTimeOptions = [
  { label: '全时段', value: 1 },
  { label: '自定义', value: 2 },
];
const pkgTransOptions = [
  { label: '不透传', value: 1 },
  { label: '透传', value: 2 },
];

interface TrafficGroupData {
  id: number;
  trafficWeight: number;
  budgets: BudgetInfo[];
}

interface BudgetInfo {
  id: number;
  launchId?: number;
  name: string;
  dspSlotId: number;
  dspSlotCode?: string;
  osType?: number;
  adScene?: number;
  dspPayType?: number;
  dspPayRatio: number;
  company: string;
  reqControl: number;
  reqControlUnit: string;
  imsControl: number;
  imsControlUnit: string;
  clkControl: number;
  clkControlUnit: string;
  price: number;
  launchTime: number;
  launchHours: number[];
  pkgTrans: number;
  logTime: number;
  sizeRatio: string;
  dealType: string;
}

const trafficGroups = ref<TrafficGroupData[]>([]);

function initTrafficGroups() {
  if (trafficGroups.value.length === 0) {
    trafficGroups.value = [{ id: 1, trafficWeight: 100, budgets: [] }];
  }
}

const totalWeight = computed(() => {
  return trafficGroups.value.reduce((sum, group) => sum + (group.trafficWeight || 0), 0);
});

function handleWeightChange(index: number) {
  const group = trafficGroups.value[index];
  if (group.trafficWeight > 100) {
    group.trafficWeight = 100;
  }
  if (group.trafficWeight < 0) {
    group.trafficWeight = 0;
  }
}

function getDictLabel(options: any[], value: number | undefined) {
  if (value === undefined || value === null) return '-';
  const item = options.find((opt) => opt.value === value);
  return item?.label || value;
}

function handlePayTypeChange(value: number) {
  if (!slotInfo.value) return;
  if (value !== 1) slotInfo.value.sspDealRatio = 0;
  if (value !== 3) slotInfo.value.fixedPrice = 0;
  slotInfo.value.sspPayType = value;
}

// 价格模块失去焦点自动保存
async function handlePriceBlur() {
  if (!slotInfo.value) return;
  try {
    await updateSlotInfo({
      id: slotId.value,
      sspPayType: slotInfo.value.sspPayType,
      sspDealRatio: slotInfo.value.sspDealRatio,
      fixedPrice: slotInfo.value.fixedPrice,
    });
    message.success('价格信息已保存');
  } catch (error: any) {
    console.error('保存价格信息失败:', error);
    message.error('保存价格信息失败');
  }
}

// 内部广告位名称失去焦点自动保存
async function handleNameAliseBlur() {
  if (!slotInfo.value) return;

  // 如果内部广告位名称为空，自动生成
  if (!slotInfo.value.nameAlise || slotInfo.value.nameAlise.trim() === '') {
    const mediaShort = slotInfo.value?.mediaShortName || '';
    const appName = slotInfo.value?.appName || '';
    const osTypeLabel = getDictLabel(osTypeOptions, slotInfo.value.osType);
    const adSceneLabel = getDictLabel(adSceneOptions, slotInfo.value.adScene);
    slotInfo.value.nameAlise = `${mediaShort}-${appName}-${osTypeLabel}-${adSceneLabel}`;
  }

  try {
    await updateSlotInfo({
      id: slotId.value,
      nameAlise: slotInfo.value.nameAlise,
    });
    message.success('内部广告位名称已保存');
  } catch (error: any) {
    console.error('保存内部广告位名称失败:', error);
    message.error('保存内部广告位名称失败');
  }
}

async function loadSlotInfo() {
  if (!slotId.value) {
    message.error('缺少广告位ID');
    router.back();
    return;
  }
  loading.value = true;
  try {
    slotInfo.value = await getSlotInfo(slotId.value);
    if (slotInfo.value.appId) {
      await loadAppInfo(slotInfo.value.appId);
    }

    // 如果内部广告位名称为空，自动生成
    if (!slotInfo.value.nameAlise || slotInfo.value.nameAlise.trim() === '') {
      const mediaShort = slotInfo.value?.mediaShortName || '';
      const appName = slotInfo.value?.appName || '';
      const osTypeLabel = getDictLabel(osTypeOptions, slotInfo.value.osType);
      const adSceneLabel = getDictLabel(adSceneOptions, slotInfo.value.adScene);
      slotInfo.value.nameAlise = `${mediaShort}-${appName}-${osTypeLabel}-${adSceneLabel}`;

      // 自动保存内部广告位名称
      try {
        await updateSlotInfo({
          id: slotId.value,
          nameAlise: slotInfo.value.nameAlise,
        });
        message.success('内部广告位名称已自动生成');
      } catch {
        console.error('保存内部广告位名称失败');
      }
    }

    // 加载流量组数据
    await loadTrafficGroups();
  } catch (error: any) {
    console.error('加载广告位信息失败:', error);
    message.error('加载广告位信息失败: ' + (error?.message || '未知错误'));
    router.back();
  } finally {
    loading.value = false;
  }
}

async function loadAppInfo(appId: number) {
  try {
    appInfo.value = await getApp(appId);
  } catch {
    console.error('加载应用信息失败');
  }
}

// 加载流量组数据
async function loadTrafficGroups() {
  if (!slotId.value) return;
  try {
    const launchList = await getLaunchSspSlotIdQuery(slotId.value);
    if (launchList && launchList.length > 0) {
      const groupMap = new Map<number, { weight: number; budgets: BudgetInfo[] }>();

      launchList.forEach((launch) => {
        const groupId = launch.trafficGroup;
        if (!groupMap.has(groupId)) {
          groupMap.set(groupId, {
            weight: launch.trafficWeight,
            budgets: [],
          });
        }

        const group = groupMap.get(groupId)!;
        let launchHoursArr: number[] = Array(24).fill(0);
        if (launch.launchHour && launch.launchHour.length === 24) {
          launchHoursArr = launch.launchHour.split('').map((c) => parseInt(c, 10));
        }

        const dspSlotInfoDO = (launch as any).dspSlotInfoDO || [];
        const slotInfo = dspSlotInfoDO.length > 0 ? dspSlotInfoDO[0] : null;

        group.budgets.push({
          id: group.budgets.length + 1,
          launchId: launch.id,
          name: slotInfo?.name || `预算位${launch.dspSlotId}`,
          dspSlotId: launch.dspSlotId,
          dspSlotCode: slotInfo?.dspSlotCode || '',
          osType: slotInfo?.osType,
          adScene: slotInfo?.adScene,
          dspPayType: slotInfo?.dspPayType,
          company: '',
          reqControl: launch.req,
          reqControlUnit: '次/天',
          imsControl: launch.ims,
          imsControlUnit: '次/天',
          clkControl: launch.clk,
          clkControlUnit: '次/天',
          price: launch.floorPrice,
          dspPayRatio: launch.dspPayRatio || 0,
          launchTime: launch.launchTime,
          launchHours: launchHoursArr,
          pkgTrans: launch.pkgTrans,
          logTime: launch.logTime || 0,
          sizeRatio: '',
          dealType: '',
        });
      });

      trafficGroups.value = Array.from(groupMap.entries()).map(([groupId, data]) => ({
        id: groupId,
        trafficWeight: data.weight,
        budgets: data.budgets,
      }));

      trafficGroups.value.sort((a, b) => a.id - b.id);
    } else {
      initTrafficGroups();
    }
  } catch {
    console.error('加载流量组数据失败');
    initTrafficGroups();
  }
}

async function handleCaptureLog(budget: BudgetInfo) {
  if (!budget.launchId || budget.launchId <= 0) {
    message.warning('请先保存预算数据，再进行日志捕获');
    return;
  }

  const logTime = Math.floor(Date.now() / 1000) + 180;
  budget.logTime = logTime;

  try {
    await updateLaunch({
      id: budget.launchId,
      sspSlotId: slotId.value,
      dspSlotId: budget.dspSlotId,
      trafficWeight: 0,
      trafficGroup: 0,
      floorPrice: budget.price,
      dspPayRatio: budget.dspPayRatio,
      launchTime: budget.launchTime,
      launchHour: budget.launchHours.join(''),
      logTime: logTime,
      req: budget.reqControl,
      ims: budget.imsControl,
      clk: budget.clkControl,
      pkgTrans: budget.pkgTrans,
    } as any);
    message.success(`日志捕获时间已设置为: ${logTime} (${new Date(logTime * 1000).toLocaleString()})`);
  } catch (error: any) {
    console.error('捕获日志失败:', error);
    message.error('捕获日志失败: ' + (error?.message || '未知错误'));
    budget.logTime = 0;
  }
}

function handleSplitGroup(index: number) {
  const current = trafficGroups.value[index];
  const totalWeight = current.trafficWeight;
  const newWeight = Math.floor(totalWeight / 2);
  current.trafficWeight = newWeight;
  const maxId = Math.max(...trafficGroups.value.map((g) => g.id));
  trafficGroups.value.splice(index + 1, 0, {
    id: maxId + 1,
    trafficWeight: totalWeight - newWeight,
    budgets: [],
  });
}

function handleDeleteGroup(index: number) {
  if (trafficGroups.value.length <= 1) {
    message.error('至少保留一个流量组');
    return;
  }
  trafficGroups.value.splice(index, 1);
}

async function handleDeleteBudget(group: TrafficGroupData, index: number) {
  const budget = group.budgets[index];
  if (!budget) return;

  if (budget.launchId && budget.launchId > 0) {
    try {
      await deleteLaunch(budget.launchId);
      message.success('删除成功');
    } catch (error: any) {
      console.error('删除失败:', error);
      message.error('删除失败: ' + (error?.message || '未知错误'));
      return;
    }
  }

  group.budgets.splice(index, 1);
}

function handleAddBudget(groupId: number) {
  const group = trafficGroups.value.find((g) => g.id === groupId);
  if (!group) return;
  const maxBudgetId =
    group.budgets.length > 0
      ? Math.max(...group.budgets.map((b) => b.id))
      : 0;
  group.budgets.push({
    id: maxBudgetId + 1,
    name: `预算${maxBudgetId + 1}`,
    dspSlotId: 0,
    company: '',
    reqControl: 0,
    reqControlUnit: '次/天',
    imsControl: 0,
    imsControlUnit: '次/天',
    clkControl: 0,
    clkControlUnit: '次/天',
    price: 0,
    dspPayRatio: 0,
    launchTime: 1,
    launchHours: Array(24).fill(0),
    pkgTrans: 1,
    logTime: 0,
    sizeRatio: '',
    dealType: '',
  });
}

const isDragging = ref(false);
const dragMode = ref(0);

// ==================== 绑定预算弹窗 ====================
const bindModalVisible = ref(false);
const bindGroupId = ref(0);
const bindBudgetId = ref(0);
const bindLoading = ref(false);
const bindBudgetList = ref<DspSlotInfoApi.SlotInfo[]>([]);
const selectedBudgetIds = ref<number[]>([]);
// 搜索条件
const bindSearchName = ref('');
const bindSearchDspSlotCode = ref('');
const bindSearchCompanyId = ref<number | undefined>();
const bindSearchProductId = ref<number | undefined>();
// 公司下拉数据
const companyOptions = ref<{ label: string; value: number }[]>([]);
const companySearchKeyword = ref('');
// 产品下拉数据
const productOptions = ref<{ label: string; value: number }[]>([]);
const productSearchKeyword = ref('');

async function handleBindBudget(groupId: number, budgetId: number = 0) {
  bindGroupId.value = groupId;
  bindBudgetId.value = budgetId;
  bindSearchName.value = '';
  bindSearchDspSlotCode.value = '';
  bindSearchCompanyId.value = undefined;
  bindSearchProductId.value = undefined;
  selectedBudgetIds.value = [];
  bindModalVisible.value = true;
  await loadCompanyOptions();
  await loadProductOptions();
  await loadBindBudgetList();
}

// 加载公司下拉数据
async function loadCompanyOptions(keyword?: string) {
  try {
    const result = await getCompanyPage({
      pageNo: 1,
      pageSize: 100,
      name: keyword || undefined,
    } as any);
    companyOptions.value = (result.list || []).map((item: any) => ({
      label: item.name,
      value: item.id,
    }));
  } catch {
    console.error('加载公司列表失败');
  }
}

// 加载产品下拉数据
async function loadProductOptions(keyword?: string) {
  try {
    const result = await getProductPage({
      pageNo: 1,
      pageSize: 100,
      name: keyword || undefined,
      companyId: bindSearchCompanyId.value || undefined,
    } as any);
    productOptions.value = (result.list || []).map((item: any) => ({
      label: item.name,
      value: item.id,
    }));
  } catch {
    console.error('加载产品列表失败');
  }
}

// 公司选择变化时，清空产品并重新加载产品列表
function handleCompanyChange() {
  bindSearchProductId.value = undefined;
  productOptions.value = [];
  loadProductOptions();
}

async function loadBindBudgetList() {
  bindLoading.value = true;
  try {
    const params: any = {
      pageNo: 1,
      pageSize: 1000,
    };
    if (slotInfo.value) {
      params.osType = slotInfo.value.osType;
      params.adScene = slotInfo.value.adScene;
    }
    if (bindSearchName.value) {
      params.name = bindSearchName.value;
    }
    if (bindSearchDspSlotCode.value) {
      params.dspSlotCode = bindSearchDspSlotCode.value;
    }
    if (bindSearchCompanyId.value) {
      params.companyId = bindSearchCompanyId.value;
    }
    if (bindSearchProductId.value) {
      params.productId = bindSearchProductId.value;
    }
    const result = await getSlotInfoPage(params);
    bindBudgetList.value = result.list || [];
  } catch {
    message.error('加载预算广告位失败');
  } finally {
    bindLoading.value = false;
  }
}

async function handleConfirmBind() {
  if (selectedBudgetIds.value.length === 0) {
    message.warning('请选择预算广告位');
    return;
  }
  const group = trafficGroups.value.find((g) => g.id === bindGroupId.value);
  if (!group) return;
  const maxBudgetId = group.budgets.length > 0 ? Math.max(...group.budgets.map((b) => b.id)) : 0;
  for (const budgetId of selectedBudgetIds.value) {
    const budgetInfo = bindBudgetList.value.find((b) => b.id === budgetId);
    if (budgetInfo) {
      group.budgets.push({
        id: maxBudgetId + 1,
        name: budgetInfo.name || '',
        dspSlotId: budgetInfo.id,
        dspSlotCode: budgetInfo.dspSlotCode || '',
        osType: budgetInfo.osType,
        adScene: budgetInfo.adScene,
        dspPayType: (budgetInfo as any).dspPayType,
        company: '',
        reqControl: 0,
        reqControlUnit: '次/天',
        imsControl: 0,
        imsControlUnit: '次/天',
        clkControl: 0,
        clkControlUnit: '次/天',
        price: 0,
        dspPayRatio: 0,
        launchTime: 1,
        launchHours: Array(24).fill(0),
        pkgTrans: 1,
        logTime: 0,
        sizeRatio: '',
        dealType: '',
      });
      maxBudgetId++;
    }
  }
  bindModalVisible.value = false;
  message.success('绑定成功');
}

function handleHourMouseDown(budget: BudgetInfo, index: number) {
  isDragging.value = true;
  dragMode.value = budget.launchHours[index] === 0 ? 1 : 0;
  budget.launchHours[index] = dragMode.value;
}

function handleHourMouseEnter(budget: BudgetInfo, index: number) {
  if (isDragging.value) {
    budget.launchHours[index] = dragMode.value;
  }
}

function handleHourMouseUp() {
  isDragging.value = false;
}

// ==================== 绑定预算表格列配置 ====================

// 检查预算广告位是否已绑定（排除当前正在操作的卡片）
function isBudgetBound(dspSlotId: number): boolean {
  const group = trafficGroups.value.find((g) => g.id === bindGroupId.value);
  if (!group) return false;
  return group.budgets.some((b) => b.dspSlotId === dspSlotId && b.id !== bindBudgetId.value);
}

// 单独绑定一个预算广告位
function handleBindSingle(dspSlotId: number, row: DspSlotInfoApi.SlotInfo) {
  if (isBudgetBound(dspSlotId)) {
    message.info('该预算广告位已绑定');
    return;
  }
  const group = trafficGroups.value.find((g) => g.id === bindGroupId.value);
  if (!group) return;

  if (bindBudgetId.value > 0) {
    // 更新指定的预算卡片
    const budget = group.budgets.find((b) => b.id === bindBudgetId.value);
    if (budget) {
      budget.name = row.name || '';
      budget.dspSlotId = row.id;
      budget.dspSlotCode = (row as any).dspSlotCode || '';
      budget.osType = row.osType;
      budget.adScene = row.adScene;
      budget.dspPayType = (row as any).dspPayType;
    }
  } else {
    // 创建新的预算卡片
    const maxBudgetId = group.budgets.length > 0 ? Math.max(...group.budgets.map((b) => b.id)) : 0;
    group.budgets.push({
      id: maxBudgetId + 1,
      name: row.name || '',
      dspSlotId: row.id,
      dspSlotCode: (row as any).dspSlotCode || '',
      osType: row.osType,
      adScene: row.adScene,
      dspPayType: (row as any).dspPayType,
      company: '',
      reqControl: 0,
      reqControlUnit: '次/天',
      imsControl: 0,
      imsControlUnit: '次/天',
      clkControl: 0,
      clkControlUnit: '次/天',
      price: 0,
      dspPayRatio: 0,
      launchTime: 1,
      launchHours: Array(24).fill(0),
      pkgTrans: 1,
      logTime: 0,
      sizeRatio: '',
      dealType: '',
    });
  }
  bindModalVisible.value = false;
  message.success('绑定成功');
}

const bindTableColumns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80,
  },
  {
    title: '广告位名称',
    dataIndex: 'name',
    key: 'name',
    width: 200,
  },
  {
    title: '预算广告位ID',
    dataIndex: 'dspSlotCode',
    key: 'dspSlotCode',
    width: 180,
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
    title: '结算方式',
    dataIndex: 'dspPayType',
    key: 'dspPayType',
    width: 100,
    customRender: ({ value }: { value: number }) => getDictLabel(payTypeOptions, value),
  },
  {
    title: '操作',
    key: 'action',
    width: 100,
    align: 'center',
    customRender: ({ record }: { record: DspSlotInfoApi.SlotInfo }) => {
      const bound = isBudgetBound(record.id);
      return bound
        ? h('span', { class: 'text-green-500' }, '已绑定')
        : h('a-button', {
            size: 'small',
            type: 'primary',
            onClick: () => handleBindSingle(record.id, record),
          }, '绑定');
    },
  },
];

function handleBack() {
  router.back();
}

async function handleSave() {
  loading.value = true;
  try {
    // 验证流量权重总和
    if (totalWeight.value !== 100 && trafficGroups.value.length > 1) {
      message.error('流量权重总和必须等于100%');
      loading.value = false;
      return;
    }

    // 为每个流量组的每个预算广告位处理 dspLaunch 记录
    const promises: Promise<any>[] = [];
    trafficGroups.value.forEach((group, gi) => {
      const trafficGroup = gi + 1;
      group.budgets.forEach((budget) => {
        if (budget.dspSlotId > 0) {
          const launchData = {
            id: budget.launchId || 0,
            sspSlotId: slotId.value,
            dspSlotId: budget.dspSlotId,
            trafficWeight: group.trafficWeight,
            trafficGroup: trafficGroup,
            floorPrice: budget.price,
            dspPayRatio: budget.dspPayRatio,
            launchTime: budget.launchTime,
            launchHour: budget.launchHours.join(''),
            logTime: budget.logTime,
            req: budget.reqControl,
            ims: budget.imsControl,
            clk: budget.clkControl,
            pkgTrans: budget.pkgTrans,
          };

          if (budget.launchId && budget.launchId > 0) {
            promises.push(updateLaunch(launchData as any));
          } else {
            promises.push(createLaunch(launchData as any));
          }
        }
      });
    });

    if (promises.length > 0) {
      await Promise.all(promises);
    }

    message.success('保存成功');
  } catch (error: any) {
    console.error('保存失败:', error);
    message.error('保存失败: ' + (error?.message || '未知错误'));
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadSlotInfo();
});
</script>

<template>
  <Page auto-content-height>
    <div class="p-4">
      <a-card title="广告位管理-配置" :loading="loading">
        <div v-if="slotInfo" class="space-y-8">
          <!-- 基本信息模块 -->
          <a-card type="inner" title="基本信息" size="small">
            <div class="grid grid-cols-2 gap-x-16 gap-y-4">
              <div class="flex items-center">
                <span class="text-gray-500 w-32 shrink-0">广告位名称（ID）</span>
                <span>{{ slotInfo.name }}（{{ slotInfo.id }}）</span>
              </div>
              <div class="flex items-center">
                <span class="text-gray-500 w-32 shrink-0">应用名称（ID）</span>
                <span>{{ appInfo?.name || '-' }}（{{ slotInfo.appId }}）</span>
              </div>
              <div class="flex items-center">
                <span class="text-gray-500 w-32 shrink-0">广告场景</span>
                <span>{{ getDictLabel(adSceneOptions, slotInfo.adScene) }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-gray-500 w-32 shrink-0">接入方式</span>
                <span>{{ getDictLabel(accessTypeOptions, slotInfo.accessType) }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-gray-500 w-32 shrink-0">操作系统</span>
                <span>{{ getDictLabel(osTypeOptions, slotInfo.osType) }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-gray-500 w-32 shrink-0">内部广告位名称</span>
                <a-input
                  v-model:value="slotInfo.nameAlise"
                  class="flex-1"
                  @blur="handleNameAliseBlur"
                />
              </div>
            </div>
          </a-card>

          <!-- 价格模块 -->
          <a-card type="inner" title="价格" size="small">
            <div class="grid grid-cols-2 gap-x-16 gap-y-4">
              <div class="flex items-center">
                <span class="text-gray-500 w-32 shrink-0">结算方式</span>
                <a-select
                  :value="slotInfo.sspPayType"
                  :options="payTypeOptions"
                  class="flex-1"
                  @change="handlePayTypeChange"
                  @blur="handlePriceBlur"
                />
              </div>
              <template v-if="slotInfo.sspPayType === 1">
                <div class="flex items-center">
                  <span class="text-gray-500 w-32 shrink-0">分成系数</span>
                  <a-input-number
                    v-model:value="slotInfo.sspDealRatio"
                    :min="0"
                    :max="100"
                    class="flex-1"
                    @blur="handlePriceBlur"
                  />
                </div>
              </template>
              <template v-if="slotInfo.sspPayType === 3">
                <div class="flex items-center">
                  <span class="text-gray-500 w-32 shrink-0">固价(CPM/元)</span>
                  <a-input-number
                    v-model:value="slotInfo.fixedPrice"
                    :min="0"
                    class="flex-1"
                    @blur="handlePriceBlur"
                  />
                </div>
              </template>
            </div>
          </a-card>

          <!-- 流量分配模块 -->
          <a-card type="inner" title="流量分配" size="small">
            <div class="space-y-4">
              <!-- 流量拆分行 -->
              <div class="flex items-center gap-4">
                <!-- 流量拆分标签 -->
                <span class="text-gray-600 shrink-0">流量拆分</span>
                <!-- 流量组列表（支持换行） -->
                <div class="flex flex-wrap items-center gap-3">
                  <template v-for="(group, gi) in trafficGroups" :key="group.id">
                    <!-- 流量N -->
                    <span class="text-gray-500">流量{{ gi + 1 }}</span>
                    <!-- 权重输入框 -->
                    <a-input-number
                      v-model:value="group.trafficWeight"
                      :min="0"
                      :max="100"
                      style="width: 80px"
                      @change="handleWeightChange(gi)"
                    />
                    <!-- 百分号 -->
                    <span class="text-gray-400">%</span>
                    <!-- 拆分流量按钮 -->
                    <a-button
                      size="small"
                      @click="handleSplitGroup(gi)"
                    >
                      拆分流量
                    </a-button>
                    <!-- 删除流量组按钮（至少保留一个） -->
                    <a-button
                      v-if="trafficGroups.length > 1"
                      danger
                      @click="handleDeleteGroup(gi)"
                    >
                      删除流量组
                    </a-button>
                  </template>
                </div>
                <!-- 权重总和校验提示 -->
                <span v-if="totalWeight > 100" class="text-red-500 text-sm ml-auto">
                  权重总和不能超过100%，当前：{{ totalWeight }}%
                </span>
              </div>

              <!-- 分隔线 -->
              <!-- <a-divider /> -->

              <!-- 流量分配列表 -->
              <template v-for="(group, gi) in trafficGroups" :key="group.id">
                <!-- 流量N分配标题行 -->
                <div class="flex items-center gap-2">
                  <span class="text-gray-600">流量{{ gi + 1 }}分配</span>
                  <a-button type="primary" @click="handleAddBudget(group.id)">
                    + 添加预算
                  </a-button>
                </div>

                <!-- 预算列表 -->
                <div class="mt-3 space-y-3">
                  <!-- 每个预算卡片 -->
                  <div
                    v-for="(budget, bi) in group.budgets"
                    :key="budget.id"
                    class="flex rounded border border-gray-200 overflow-hidden"
                  >
                    <!-- 预算配置表单（自适应宽度） -->
                    <div class="p-4 space-y-4 flex-1 min-w-0">
                      <!-- 预算信息标题行 -->
                      <div class="flex items-center gap-4 mb-2 pb-2 pt-2 pl-4 pr-4 border-b border-gray-200 bg-gray-800 -mx-4 mt-0">
                        <span class="font-medium text-white">{{ budget.name }}</span>
                        <span class="text-gray-400">|</span>
                        <span class="text-gray-300">广告位ID: {{ budget.dspSlotCode || budget.dspSlotId }}</span>
                        <span class="text-gray-400">|</span>
                        <span class="text-gray-300">操作系统: {{ getDictLabel(osTypeOptions, budget.osType) }}</span>
                        <span class="text-gray-400">|</span>
                        <span class="text-gray-300">广告场景: {{ getDictLabel(adSceneOptions, budget.adScene) }}</span>
                        <span class="text-gray-400">|</span>
                        <span class="text-gray-300">结算方式: {{ getDictLabel(payTypeOptions, budget.dspPayType) }}</span>
                        <span class="text-gray-400">|</span>
                        <a-button
                          size="small"
                          type="primary"
                          @click="handleBindBudget(group.id, budget.id)"
                        >
                          绑定预算
                        </a-button>
                        <a-button
                          size="small"
                          @click="handleCaptureLog(budget)"
                        >
                          捕获日志
                        </a-button>
                      </div>

                      <!-- 配置行：请求控制、展现控制、点击控制、投放时段、包透传、底价/成交系数（一行6个） -->
                      <div class="grid grid-cols-6 gap-4">
                        <div class="flex items-center gap-2">
                          <label class="text-gray-500 w-16 shrink-0">请求控制</label>
                          <a-input-number
                            v-model:value="budget.reqControl"
                            :min="0"
                            class="flex-1"
                          />
                        </div>
                        <div class="flex items-center gap-2">
                          <label class="text-gray-500 w-16 shrink-0">展现控制</label>
                          <a-input-number
                            v-model:value="budget.imsControl"
                            :min="0"
                            class="flex-1"
                          />
                        </div>
                        <div class="flex items-center gap-2">
                          <label class="text-gray-500 w-16 shrink-0">点击控制</label>
                          <a-input-number
                            v-model:value="budget.clkControl"
                            :min="0"
                            class="flex-1"
                          />
                        </div>
                        <div class="flex items-center gap-2">
                          <label class="text-gray-500 w-16 shrink-0">投放时段</label>
                          <a-select
                            v-model:value="budget.launchTime"
                            :options="launchTimeOptions"
                            class="flex-1"
                          />
                        </div>
                        <div class="flex items-center gap-2">
                          <label class="text-gray-500 w-12 shrink-0">包透传</label>
                          <a-select
                            v-model:value="budget.pkgTrans"
                            :options="pkgTransOptions"
                            class="flex-1"
                          />
                        </div>
                        <!-- 底价或成交系数（根据条件显示） -->
                        <div v-if="slotInfo?.sspPayType === 2 && budget.dspPayType === 2" class="flex items-center gap-2">
                          <label class="text-gray-500 w-16 shrink-0">成交系数</label>
                          <a-input-number
                            v-model:value="budget.dspPayRatio"
                            :min="0"
                            :max="100"
                            class="flex-1"
                          />
                          <span class="text-gray-400 text-sm">%</span>
                        </div>
                        <div v-if="(slotInfo?.sspPayType === 2 && budget.dspPayType !== 2) || (slotInfo?.sspPayType !== 2 && budget.dspPayType === 2)" class="flex items-center gap-2">
                          <label class="text-gray-500 w-8 shrink-0">底价</label>
                          <a-input-number
                            v-model:value="budget.price"
                            :min="0"
                            class="flex-1"
                          />
                          <span class="text-gray-400 text-sm">元</span>
                        </div>
                      </div>

                      <!-- 24小时时间选择表格（自定义时显示） -->
                      <div
                        v-if="budget.launchTime === 2"
                        class="mt-4"
                        @mouseup="handleHourMouseUp"
                        @mouseleave="handleHourMouseUp"
                      >
                        <!-- 时间标题行 -->
                        <div class="grid grid-cols-24 gap-1 mb-1">
                          <div
                            v-for="hour in 24"
                            :key="hour"
                            class="text-center text-xs text-gray-500"
                          >
                            {{ hour - 1 }}
                          </div>
                        </div>
                        <!-- 选择单元格 -->
                        <div class="grid grid-cols-24 gap-1">
                          <div
                            v-for="(val, hi) in budget.launchHours"
                            :key="hi"
                            class="h-6 rounded cursor-pointer border border-gray-200 transition-colors"
                            :class="val === 1 ? 'bg-blue-500 border-blue-500' : 'bg-gray-100'"
                            @mousedown="handleHourMouseDown(budget, hi)"
                            @mouseenter="handleHourMouseEnter(budget, hi)"
                          />
                        </div>
                        <!-- 生成的字符串 -->
                        <div class="mt-2 flex items-center gap-2">
                          <label class="text-gray-500">时间字符串：</label>
                          <span class="text-gray-700 font-mono">
                            {{ budget.launchHours.join('') }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- 删除按钮（蓝色背景） -->
                    <div
                      class="w-20 bg-blue-500 hover:bg-blue-600 flex items-center justify-center cursor-pointer transition-colors shrink-0"
                      @click="handleDeleteBudget(group, bi)"
                    >
                      <span class="text-white text-sm font-medium">删除</span>
                    </div>
                  </div>

                  <!-- 无预算时的提示 -->
                  <div
                    v-if="group.budgets.length === 0"
                    class="py-4 text-center text-gray-400"
                  >
                    暂无绑定预算
                  </div>
                </div>
              </template>
            </div>

            <!-- 保存和返回按钮（居中） -->
            <div class="flex justify-center gap-4 pt-4">
              <a-button @click="handleBack">返回</a-button>
              <a-button type="primary" :loading="loading" @click="handleSave">
                保存
              </a-button>
            </div>
          </a-card>
        </div>
      </a-card>
    </div>

    <!-- 绑定预算弹窗 -->
    <a-modal
      title="绑定预算广告位"
      v-model:open="bindModalVisible"
      :width="1200"
      :footer="null"
    >
      <!-- 搜索区域：一行四列 -->
      <div class="mb-4 flex gap-3">
        <!-- 预算广告位名称 -->
        <a-input
          v-model:value="bindSearchName"
          placeholder="广告位名称"
          class="flex-1"
          allow-clear
          @pressEnter="loadBindBudgetList"
        />
        <!-- 预算广告位编码 -->
        <a-input
          v-model:value="bindSearchDspSlotCode"
          placeholder="广告位编码"
          class="flex-1"
          allow-clear
          @pressEnter="loadBindBudgetList"
        />
        <!-- 公司下拉框 -->
        <a-select
          v-model:value="bindSearchCompanyId"
          placeholder="公司"
          class="flex-1"
          show-search
          :options="companyOptions"
          :filter-option="false"
          allow-clear
          @search="(value: string) => loadCompanyOptions(value)"
          @change="handleCompanyChange"
        />
        <!-- 产品下拉框 -->
        <a-select
          v-model:value="bindSearchProductId"
          placeholder="产品"
          class="flex-1"
          show-search
          :options="productOptions"
          :filter-option="false"
          allow-clear
          @search="(value: string) => loadProductOptions(value)"
          @change="loadBindBudgetList"
        />
        <!-- 搜索按钮 -->
        <a-button type="primary" @click="loadBindBudgetList">搜索</a-button>
        <!-- 重置按钮 -->
        <a-button
          @click="() => {
            bindSearchName.value = '';
            bindSearchDspSlotCode.value = '';
            bindSearchCompanyId.value = undefined;
            bindSearchProductId.value = undefined;
            loadBindBudgetList();
          }"
        >
          重置
        </a-button>
      </div>

      <!-- 预算列表表格 -->
      <a-table
        :loading="bindLoading"
        :data-source="bindBudgetList"
        row-key="id"
        :pagination="false"
        :scroll="{ y: 500 }"
        :columns="bindTableColumns"
      />
    </a-modal>
  </Page>
</template>
