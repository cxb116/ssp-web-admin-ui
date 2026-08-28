<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { Page } from '@vben/common-ui';
import { Button, Checkbox, Dropdown, Input, InputNumber, message, Pagination, Table } from 'ant-design-vue';
import { ref, watch } from 'vue';
import { IconifyIcon } from '@vben/icons';
import { updateInputIncome } from '#/api/data/inputexec';

const route = useRoute();
// ID 仅用于提交保存，不在表格中展示。
const hiddenResultFields = ['id'];
const labels: Record<string, string> = { id:'ID', date:'时间', dspName:'DSP预算名称', dspSlotCode:'预算广告位ID', dspSlotId:'预算位ID', companyName:'公司名称', sspSlotId:'媒体广告ID', mediaName:'媒体名称', sspName:'媒体广告位名称', reqPv:'请求PV', retPv:'返回PV', showPv:'展示PV', clickPv:'点击PV', dplsuccPv:'调起成功', completePv:'完成量', installPv:'安装量', activatePv:'激活量', profit:'收益(元)', spend:'成本(元)', income:'收入(元)', proportion:'分成比例' };
labels.dspName = '预算位名称';
labels.dspSlotCode = '预算方广告位ID';
labels.mediaName = '媒体简称';
labels.sspSlotId = '媒体广告位ID';
labels.profit = '收益(元)';
labels.spend = '成本(元)';
labels.income = '收入(元)';
labels.proportion = '分成比例(%)';
const storedResult = computed(() => {
  try {
    return JSON.parse(sessionStorage.getItem('input-exec-import-result') || '{}');
  } catch {
    return {};
  }
});
const title = computed(() => String(storedResult.value.fileName || route.query.fileName || '导入结果'));
const inputExecId = computed(() => storedResult.value.inputExecId);
const importedRows = computed(() => {
  const value = storedResult.value.data;
  if (Array.isArray(value)) return value;
  return Array.isArray(value?.data) ? value.data : [];
});
const editableRows = ref<any[]>([]);
watch(importedRows, (value) => {
  editableRows.value = value.map((row: any) => ({ ...row }));
}, { immediate: true });
const rows = computed(() => editableRows.value);
const currentPage = ref(1);
const pageSize = 15;
const selectedRowKeys = ref<(string | number)[]>([]);
const pagedRows = computed(() => filteredRows.value.slice((currentPage.value - 1) * pageSize, currentPage.value * pageSize));
const dspSlotCode = ref('');
const sspSlotId = ref('');
const filteredRows = computed(() => rows.value.filter((row: any) => {
  const dspMatch = !dspSlotCode.value || String(row.dspSlotCode ?? '').toLowerCase().includes(dspSlotCode.value.toLowerCase());
  const sspMatch = !sspSlotId.value || String(row.sspSlotId ?? '').toLowerCase().includes(sspSlotId.value.toLowerCase());
  return dspMatch && sspMatch;
}));
watch([dspSlotCode, sspSlotId], () => {
  currentPage.value = 1;
});
function showTotal(total: number) {
  return `共 ${total} 条数据`;
}
const columns = computed(() => Object.keys(labels).filter((key) => !hiddenResultFields.includes(key)).map((key) => ({ title: labels[key], dataIndex: key, key, width: 140, ellipsis: true })));
const tableColumns = computed(() => [{ title: '#', dataIndex: '__rowNumber', key: '__rowNumber', width: 60, fixed: 'left' }, ...columns.value]);
const selectedKeys = ref(Object.keys(labels).filter((key) => !hiddenResultFields.includes(key)));
const editingKeys = ref([...selectedKeys.value]);
const headerDropdownOpen = ref(false);
const visibleColumns = computed(() => columns.value.filter((column) => selectedKeys.value.includes(column.key)));
function handleHeaderDropdown(open: boolean) {
  headerDropdownOpen.value = open;
  if (open) {
    editingKeys.value = [...selectedKeys.value];
  } else {
    selectedKeys.value = [...editingKeys.value];
  }
}
function proportionValue(row: any) {
  return Number(row.proportion ?? 0);
}
function updateProportion(row: any, value: number | null) {
  row.proportion = value == null ? 0 : value;
}
function rowKey(row: any) {
  return row.id ?? `${row.dspSlotCode || ''}-${row.dspSlotId || ''}-${row.sspSlotId || ''}-${row.date || ''}`;
}
function handleRowDoubleClick(row: any, index: number) {
  const key = rowKey(row);
  const selected = new Set(selectedRowKeys.value);
  if (selected.has(key)) selected.delete(key); else selected.add(key);
  selectedRowKeys.value = [...selected];
}
function isSelected(row: any, index: number) {
  return selectedRowKeys.value.includes(rowKey(row));
}
function rowClassName(row: any) {
  return selectedRowKeys.value.includes(rowKey(row)) ? 'selected-row' : '';
}
function customRow(record: any) {
  return {
    onDblclick: () => handleRowDoubleClick(record, 0),
  };
}
async function handleSave() {
  const selected = rows.value.filter((row) => selectedRowKeys.value.includes(rowKey(row)));
  if (!selected.length) {
    message.warning('请双击选择需要核对的数据');
    return;
  }
  try {
    const payload = selected.map((row) => {
      const profit = Number(row.profit || 0);
      const spend = profit * proportionValue(row) / 100;
      return {
        id: inputExecId.value,
        dspSlotCode: row.dspSlotCode,
        dspSlotId: row.dspSlotId,
        sspSlotId: row.sspSlotId,
        date: row.date,
        profit: row.profit,
        spend: Math.round(spend),
        income: Math.round(profit - spend),
      };
    });
    await updateInputIncome(payload as any);
    message.success(`已保存 ${selected.length} 条核对数据`);
  } catch (error) {
    console.error(error);
    message.error('核对保存失败');
  }
}
const allSelected = computed(() => filteredRows.value.length > 0 && filteredRows.value.every((row) => selectedRowKeys.value.includes(rowKey(row))));
function toggleSelectAll() {
  if (allSelected.value) {
    const keys = new Set(filteredRows.value.map((row) => rowKey(row)));
    selectedRowKeys.value = selectedRowKeys.value.filter((key) => !keys.has(key));
  } else {
    const keys = new Set(selectedRowKeys.value);
    filteredRows.value.forEach((row) => keys.add(rowKey(row)));
    selectedRowKeys.value = [...keys];
  }
}
function displayAmount(row: any, key: string) {
  const profit = Number(row.profit || 0);
  const spend = profit * proportionValue(row) / 100;
  const amount = key === 'spend' ? spend : profit - spend;
  return (amount / 100).toFixed(4);
}
function formatValue(value: unknown, key: string, row?: any) {
  if (key === 'date' && value != null) {
    const text = String(value);
    if (/^\d{8}$/.test(text)) return `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6)}`;
  }
  if ((key === 'spend' || key === 'income') && row) return displayAmount(row, key);
  if (key === 'profit' && value != null && value !== '') {
    return (Number(value) / 100).toFixed(4);
  }
  return value ?? '-';
}
</script>
<template>
  <Page :title="title" auto-content-height>
    <div class="flex h-full flex-col rounded-lg bg-white p-4 shadow-sm dark:bg-gray-900">
      <div class="mb-4 flex items-center justify-between gap-3 border-b border-gray-100 pb-4 dark:border-gray-700">
        <div class="flex items-center gap-3 whitespace-nowrap">
          <span class="whitespace-nowrap text-sm font-medium text-gray-600 dark:text-gray-300">数据筛选</span>
          <Input v-model:value="dspSlotCode" allow-clear placeholder="预算方广告位ID" class="w-56" />
          <Input v-model:value="sspSlotId" allow-clear placeholder="媒体广告位ID" class="w-56" />
          <Button size="small" @click="toggleSelectAll">{{ allSelected ? '取消全选' : '一键全选' }}</Button>
        </div>
        <Dropdown :open="headerDropdownOpen" :trigger="['click']" placement="bottomRight" @open-change="handleHeaderDropdown">
          <button type="button" class="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-primary dark:hover:bg-gray-800" title="表头设置">
            <IconifyIcon icon="lucide:settings-2" class="text-lg" />
          </button>
          <template #overlay>
            <div class="max-h-80 w-56 overflow-y-auto rounded-md bg-white p-3 shadow-lg dark:bg-gray-800">
              <div class="mb-2 text-sm font-medium">显示字段</div>
              <Checkbox.Group v-model:value="editingKeys" class="flex flex-col gap-2">
                <Checkbox v-for="(label, key) in labels" :key="key" :value="key">{{ label }}</Checkbox>
              </Checkbox.Group>
            </div>
          </template>
        </Dropdown>
      </div>
      <Table class="result-table" :columns="[{ title: '#', dataIndex: '__rowNumber', key: '__rowNumber', width: 60, fixed: 'left' }, ...visibleColumns]" :data-source="pagedRows" :pagination="false" :scroll="{ x: 'max-content', y: 'calc(100vh - 220px)' }" :row-key="rowKey" :row-class-name="rowClassName" :custom-row="customRow" size="middle" bordered>
      <template #bodyCell="{ text, column, record }">
        <span v-if="column.dataIndex === '__rowNumber'">{{ (currentPage - 1) * pageSize + pagedRows.indexOf(record) + 1 }}</span>
        <InputNumber v-else-if="column.dataIndex === 'proportion'" :value="proportionValue(record)" :min="0" :max="100" :precision="2" size="small" class="w-24" @change="updateProportion(record, $event)" />
        <span v-else>{{ formatValue(text, column.dataIndex, record) }}</span>
      </template>
      </Table>
      <div class="mt-4 flex items-center justify-between">
        <Button type="primary" @click="handleSave">核对保存</Button>
        <Pagination v-model:current="currentPage" :page-size="pageSize" :total="filteredRows.length" :show-total="showTotal" :show-size-changer="false" show-less-items />
      </div>
    </div>
  </Page>
</template>

<style scoped>
:deep(.result-table .ant-table-thead > tr > th),
:deep(.result-table .ant-table-tbody > tr > td) {
  text-align: center;
}

:deep(.result-table .selected-row > td) {
  background-color: #e6f4ff !important;
}
</style>
