<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DataDspSlotDayApi } from '#/api/data/dspslotday';

import { useRouter } from 'vue-router';

import { Page, useVbenModal } from '@vben/common-ui';
import { buildSortingField } from '@vben/request';
import { downloadFileFromBlobPart } from '@vben/utils';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  exportDspSlotDayDetail,
  getDspSlotDayPage,
} from '#/api/data/dspslotday';

import { useGridColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

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

/** 刷新表格 */
function handleRefresh() {
  gridApi.query();
}

/** 导出表格 */
async function handleExport() {
  const data = await exportDspSlotDayDetail(await gridApi.formApi.getValues());
  downloadFileFromBlobPart({ fileName: 'DSP预算广告位日期报.xls', source: data });
}

function handleSspSlotIdClick(row: DataDspSlotDayApi.DspSlotDay) {
  if (row.sspSlotId) {
    router.push(`/ssp/slot-info/config/${row.sspSlotId}`);
  }
}

function handleDspNameClick(row: DataDspSlotDayApi.DspSlotDay) {
  if (row.dspSlotId) {
    router.push(`/dsp/dspslotinfo/config/${row.dspSlotId}`);
  }
}

/** 收集当前筛选条件 */
async function getFilterQuery() {
  const formValues = await gridApi.formApi.getValues();
  const query: Record<string, string | number> = {};
  if (formValues.companyId) {
    query.companyId = formValues.companyId;
  }
  if (formValues.productId) {
    query.productId = formValues.productId;
  }
  if (formValues.osType) {
    query.osType = formValues.osType;
  }
  if (formValues.dspSlotId) {
    query.dspSlotId = formValues.dspSlotId;
  }
  if (formValues.dspSlotCode) {
    query.dspSlotCode = formValues.dspSlotCode;
  }
  if (formValues.sspSlotId) {
    query.sspSlotId = formValues.sspSlotId;
  }
  return query;
}

/** 当前已在日报表 */
function handleDayReport() {
  // 已在日报表页
}

/** 跳转明细小时报表（detailshour），保留当前筛选条件 */
async function handleHourReport() {
  router.push({
    name: 'DataDetailsHour',
    query: await getFilterQuery(),
  });
}


const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: false,
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
        query: async ({ page, sorts }, formValues) => {
          const params: Record<string, any> = {
            pageNo: page.currentPage,
            pageSize: page.pageSize,
            ...buildSortingField(sorts),
          };
          for (const key of Object.keys(formValues)) {
            if (key === 'sspSlotId') continue;
            if (!formValues[key]) continue;
            params[key] = formValues[key];
          }
          // 空格分隔字符串转为数组
          const splitStr = (val: any) => {
            const s = String(val ?? '').trim();
            return s ? s.split(/\s+/) : undefined;
          };
          if (formValues.sspSlotId) {
            params.sspSlotId = splitStr(formValues.sspSlotId);
          }
          return await getDspSlotDayPage(params);
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
  } as VxeTableGridOptions<DataDspSlotDayApi.DspSlotDay>,
});
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="handleRefresh" />
    <Grid>
      <template #toolbar-actions>
        <div class="flex items-center gap-3">
          <div class="text-[1rem] font-bold">预算广告位报表</div>
          <a-button type="primary" @click="handleDayReport">日报表</a-button>
          <a-button @click="handleHourReport">小时报表</a-button>
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
        <a-button type="primary" @click="handleExport">
          导出
        </a-button>
      </template>
    </Grid>
  </Page>
</template>
