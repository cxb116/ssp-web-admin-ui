<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DataDspSlotHourApi } from '#/api/data/dspslothour';

import { useRoute, useRouter } from 'vue-router';

import { Page, useVbenModal } from '@vben/common-ui';
import { buildSortingField } from '@vben/request';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getDspSlotHourPage } from '#/api/data/dspslothour';

import { useGridColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const route = useRoute();
const router = useRouter();

const osTypeMap: Record<number, string> = { 1: 'Android', 2: 'iOS' };
function osTypeLabel(val?: number): string {
  if (val == null) return '';
  return osTypeMap[val] || String(val);
}

const [FormModal] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

/** 从路由 query 读取初始筛选条件 */
function getInitialFormValues() {
  const query = route.query;
  const formValues: Record<string, any> = {};
  if (query.companyId) {
    formValues.companyId = Number(query.companyId);
  }
  if (query.productId) {
    formValues.productId = Number(query.productId);
  }
  if (query.osType) {
    formValues.osType = Number(query.osType);
  }
  if (query.dspSlotId) {
    formValues.dspSlotId = Number(query.dspSlotId);
  }
  if (query.dspSlotCode) {
    formValues.dspSlotCode = String(query.dspSlotCode);
  }
  if (query.sspSlotId) {
    formValues.sspSlotId = Number(query.sspSlotId);
  }
  return formValues;
}

const initialFormValues = getInitialFormValues();

function handleRefresh() {
  gridApi.query();
}

/** 返回日报表（details）：从 details 跳来时返回上一页 */
function handleDayReport() {
  router.back();
}

/** 当前已在小时报表 */
function handleHourReport() {
  // 已在小时报表页
}

function handleSspSlotIdClick(row: any) {
  if (row.sspSlotId) {
    router.push(`/ssp/slot-info/config/${row.sspSlotId}`);
  }
}

function handleDspNameClick(row: any) {
  if (row.dspSlotId) {
    router.push(`/dsp/dspslotinfo/config/${row.dspSlotId}`);
  }
}

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: false,
    ...(Object.keys(initialFormValues).length > 0
      ? { initialValues: initialFormValues }
      : {}),
  },
  gridOptions: {
    columns: useGridColumns(),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      pageSize: 10,
    },
    sortConfig: {
      remote: true,
      multiple: false,
    },
    proxyConfig: {
      sort: true,
      ajax: {
        // 小时报表主表：getDspSlotHourPage
        query: async ({ page, sorts }, formValues) => {
          const params: Record<string, any> = {
            pageNo: page.currentPage,
            pageSize: page.pageSize,
            ...buildSortingField(sorts),
          };
          for (const key of Object.keys(formValues)) {
            if (key === 'date' || key === 'sspSlotId') continue;
            if (!formValues[key]) continue;
            params[key] = formValues[key];
          }
          // sspSlotId：空格分隔字符串转为数组
          if (formValues.sspSlotId) {
            const val = String(formValues.sspSlotId).trim();
            if (val) {
              params.sspSlotId = val.split(/\s+/).map(Number).filter((n: number) => !isNaN(n));
            }
          }
          // date：8位=全天(YYYYMMDD)，10位=指定小时(YYYYMMDDHH)
          if (formValues.date) {
            const dateStr = String(formValues.date);
            if (dateStr.length === 8) {
              // 全天：查询当天 00~23 时
              const dateNum = Number(dateStr);
              params.date = [dateNum * 100, dateNum * 100 + 23];
            } else {
              // 指定小时
              params.date = [Number(dateStr)];
            }
          }
          return await getDspSlotHourPage(params);
        },
      },
    },
    rowConfig: {
      keyField: 'id',
      isHover: true,
    },
    toolbarConfig: {
      refresh: true,
      search: true,
    },
  } as VxeTableGridOptions<DataDspSlotHourApi.DspSlotHour>,
});
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="handleRefresh" />
    <Grid>
      <template #toolbar-actions>
        <div class="flex items-center gap-3">
          <div class="text-[1rem] font-bold">预算广告位报表</div>
          <a-button @click="handleDayReport">日报表</a-button>
          <a-button type="primary" @click="handleHourReport">小时报表</a-button>
        </div>
      </template>
      <template #sspSlotId-slot="{ row }">
        <span style="cursor: pointer; color: #1890ff" @click="handleSspSlotIdClick(row)">
          {{ row.sspSlotId }}
        </span>
      </template>
      <template #dspName-slot="{ row }">
        <span style="cursor: pointer; color: #1890ff" @click="handleDspNameClick(row)">
          {{ row.dspName }}
        </span>
      </template>
      <template #osType-slot="{ row }">
        <span>{{ osTypeLabel(row.osType) }}</span>
      </template>
      <template #spend-slot="{ row }">
        <span>{{ row.spend != null ? (row.spend / 100).toFixed(2) : '-' }}</span>
      </template>
      <template #income-slot="{ row }">
        <span>{{ row.income != null ? (row.income / 100).toFixed(2) : '-' }}</span>
      </template>
      <template #toolbar-tools>
        <a-button type="primary" disabled> 导出 </a-button>
      </template>
    </Grid>
  </Page>
</template>
