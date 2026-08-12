<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DspSlotInfoApi } from '#/api/dsp/dspslotinfo';

import { useRouter } from 'vue-router';

import { Page, useVbenModal } from '@vben/common-ui';
import { downloadFileFromBlobPart } from '@vben/utils';

import { message } from 'ant-design-vue';

import { ACTION_ICON, TableAction, useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteSlotInfo,
  exportSlotInfo,
  getSlotInfoPage,
} from '#/api/dsp/dspslotinfo';
import { $t } from '#/locales';

import { useGridColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';
import ImportForm from './modules/import-form.vue';

const router = useRouter();

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [ImportModal, importModalApi] = useVbenModal({
  connectedComponent: ImportForm,
  destroyOnClose: true,
});

/** 刷新表格 */
function handleRefresh() {
  gridApi.query();
}

/** 创建预算广告位 */
function handleCreate() {
  router.push('/dsp/dspslotinfo/config');
}

/** 导入预算广告位 */
function handleImport() {
  importModalApi.open();
}

/** 编辑预算广告位 */
function handleEdit(row: DspSlotInfoApi.SlotInfo) {
  formModalApi.setData(row).open();
}

/** 删除预算广告位 */
async function handleDelete(row: DspSlotInfoApi.SlotInfo) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.id]),
    duration: 0,
  });
  try {
    await deleteSlotInfo(row.id!);
    message.success($t('ui.actionMessage.deleteSuccess', [row.id]));
    handleRefresh();
  } finally {
    hideLoading();
  }
}

/** 导出表格 */
async function handleExport() {
  const data = await exportSlotInfo(await gridApi.formApi.getValues());
  downloadFileFromBlobPart({ fileName: '预算广告位.xls', source: data });
}

/** 复制广告位：跳转到新增页面，并通过路由 query 传 copyFrom */
function handleCopy(row: DspSlotInfoApi.SlotInfo) {
  router.push({
    path: '/dsp/dspslotinfo/config',
    query: { copyFrom: String(row.id) },
  });
}

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
  },
  gridOptions: {
    columns: useGridColumns(),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getSlotInfoPage({
            pageNo: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
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
  } as VxeTableGridOptions<DspSlotInfoApi.SlotInfo>,
});
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="handleRefresh" />
    <ImportModal @success="handleRefresh" />
    <Grid table-title="预算位列表">
      <template #toolbar-tools>
        <TableAction
          :actions="[
            {
              label: $t('ui.actionTitle.create', ['预算位']),
              type: 'primary',
              icon: ACTION_ICON.ADD,
              auth: ['dsp:slot-info:create'],
              onClick: handleCreate,
            },
            {
              label: '导入',
              type: 'primary',
              icon: ACTION_ICON.UPLOAD,
              auth: ['dsp:slot-info:import'],
              onClick: handleImport,
            },
            {
              label: '导出',
              type: 'primary',
              icon: ACTION_ICON.EXPORT,
              auth: ['dsp:slot-info:export'],
              onClick: handleExport,
            },
          ]"
        />
      </template>
      <template #actions="{ row }">
        <TableAction
          :actions="[
            {
              label: '配置',
              type: 'link',
              icon: ACTION_ICON.EDIT,
              auth: ['dsp:slot-info:update'],
              onClick: () => router.push(`/dsp/dspslotinfo/config/${row.id}`),
            },
            {
              label: '复制',
              type: 'link',
              icon: ACTION_ICON.COPY,
              auth: ['dsp:slot-info:create'],
              onClick: () => handleCopy(row),
            },
          ]"
        />
      </template>
    </Grid>
  </Page>
</template>