<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SspSlotInfoApi } from '#/api/ssp/sspSlotInfo';

import { ref } from 'vue';

import { useRouter } from 'vue-router';

import { confirm, Page, useVbenModal } from '@vben/common-ui';
import { downloadFileFromBlobPart, isEmpty } from '@vben/utils';

import { message } from 'ant-design-vue';

import { ACTION_ICON, TableAction, useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteSlotInfo,
  deleteSlotInfoList,
  exportSlotInfo,
  getSlotInfoPage,
  updateSlotInfo,
} from '#/api/ssp/sspSlotInfo';
import { $t } from '#/locales';

import { useGridColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const router = useRouter();

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

/** 刷新表格 */
function handleRefresh() {
  gridApi.query();
}

/** 创建媒体广告位 */
function handleCreate() {
  formModalApi.setData(null).open();
}

/** 编辑媒体广告位 */
function handleEdit(row: SspSlotInfoApi.SlotInfo) {
  formModalApi.setData(row).open();
}

/** 配置媒体广告位 */
function handleConfig(row: SspSlotInfoApi.SlotInfo) {
  router.push({
    name: 'SspSlotInfoConfig',
    params: { id: row.id },
  });
}

/** 配置并通过：将审核中状态改为正常后跳转配置页 */
async function handleConfigAndPass(row: SspSlotInfoApi.SlotInfo) {
  const hideLoading = message.loading({
    content: '正在更新状态...',
    duration: 0,
  });
  try {
    await updateSlotInfo({ id: row.id, enable: 1 });
    message.success('状态已更新');
    router.push({
      name: 'SspSlotInfoConfig',
      params: { id: row.id },
    });
  } finally {
    hideLoading();
  }
}

/** 根据行状态生成操作按钮 */
function getRowActions(row: SspSlotInfoApi.SlotInfo) {
  const configAction =
    row.enable === 2
      ? {
          label: '配置并通过',
          type: 'link' as const,
          icon: ACTION_ICON.SETTINGS,
          auth: ['ssp:slot-info:update'],
          onClick: handleConfigAndPass.bind(null, row),
        }
      : {
          label: '配置',
          type: 'link' as const,
          icon: ACTION_ICON.SETTINGS,
          auth: ['ssp:slot-info:update'],
          disabled: row.enable === 0 || row.enable === 3,
          onClick: handleConfig.bind(null, row),
        };

  return [
    {
      label: $t('common.edit'),
      type: 'link',
      icon: ACTION_ICON.EDIT,
      auth: ['ssp:slot-info:update'],
      onClick: handleEdit.bind(null, row),
    },
    configAction,
  ];
}

/** 删除媒体广告位 */
async function handleDelete(row: SspSlotInfoApi.SlotInfo) {
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

/** 批量删除媒体广告位 */
async function handleDeleteBatch() {
  await confirm($t('ui.actionMessage.deleteBatchConfirm'));
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deletingBatch'),
    duration: 0,
  });
  try {
    await deleteSlotInfoList(checkedIds.value);
    checkedIds.value = [];
    message.success($t('ui.actionMessage.deleteSuccess'));
    handleRefresh();
  } finally {
    hideLoading();
  }
}

const checkedIds = ref<number[]>([]);
function handleRowCheckboxChange({
  records,
}: {
  records: SspSlotInfoApi.SlotInfo[];
}) {
  checkedIds.value = records.map((item) => item.id!);
}

/** 导出表格 */
async function handleExport() {
  const data = await exportSlotInfo(await gridApi.formApi.getValues());
  downloadFileFromBlobPart({ fileName: '媒体广告位.xls', source: data });
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
          const params: Record<string, any> = {
            pageNo: page.currentPage,
            pageSize: page.pageSize,
          };
          for (const key of Object.keys(formValues)) {
            if (key === 'id' || key === 'nameAlise') continue;
            if (!formValues[key]) continue;
            params[key] = formValues[key];
          }
          const splitStr = (val: any) => {
            const s = String(val ?? '').trim();
            return s ? s.split(/\s+/) : undefined;
          };
          if (formValues.id) {
            params.id = splitStr(formValues.id);
          }
          if (formValues.nameAlise) {
            params.nameAlise = splitStr(formValues.nameAlise);
          }
          return await getSlotInfoPage(params);
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
  } as VxeTableGridOptions<SspSlotInfoApi.SlotInfo>,
  gridEvents: {
    checkboxAll: handleRowCheckboxChange,
    checkboxChange: handleRowCheckboxChange,
  },
});
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="handleRefresh" />
    <Grid table-title="媒体广告位列表">
      <template #mediaName-slot="{ row }">
        <span>{{ row.mediaName || '' }}{{ row.mediaId ? `(${row.mediaId})` : '' }}</span>
      </template>
      <template #appName-slot="{ row }">
        <span>{{ row.appName || '' }}{{ row.appId ? `(${row.appId})` : '' }}</span>
      </template>
      <template #toolbar-tools>
        <TableAction
          :actions="[
            {
              label: $t('ui.actionTitle.create', ['媒体广告位']),
              type: 'primary',
              icon: ACTION_ICON.ADD,
              auth: ['ssp:slot-info:create'],
              onClick: handleCreate,
            },
            {
              label: $t('ui.actionTitle.export'),
              type: 'primary',
              icon: ACTION_ICON.DOWNLOAD,
              auth: ['ssp:slot-info:export'],
              onClick: handleExport,
            },
          ]"
        />
      </template>
      <template #actions="{ row }">
        <TableAction :actions="getRowActions(row)" />
      </template>
    </Grid>
  </Page>
</template>
