<script lang="ts" setup>
import { computed } from 'vue';
import { useVbenModal } from '@vben/common-ui';
import { Table } from 'ant-design-vue';

const [Modal, modalApi] = useVbenModal();
const fieldLabels: Record<string, string> = { id:'ID', date:'时间', dspName:'DSP预算名称', dspSlotCode:'预算广告位ID', dspSlotId:'预算位ID', companyName:'公司名称', productName:'产品名称', sspSlotId:'媒体广告ID', mediaName:'媒体名称', sspName:'媒体广告位名称', appName:'应用名称', osType:'操作系统', reqPv:'请求PV', reqUv:'请求UV', discard:'丢弃请求', retPv:'返回PV', retUv:'返回UV', showPv:'展示PV', showUv:'展示UV', clickPv:'点击PV', clickUv:'点击UV', fillRate:'填充率', displayRate:'展现率', clickRate:'点击率', discountClickPv:'折后点击', discountShowPv:'折后展示', dplsuccPv:'调起成功', completePv:'完成量', installPv:'安装量', activatePv:'激活量', createdAt:'创建时间戳', mediaEcpm:'媒体ecpm', ecpm:'ecpm', mediaEcprm:'媒体ecprm', ecprm:'ecprm', spend:'成本(分)', income:'收入(分)', proportion:'分成比例' };
const rows = computed(() => {
  const response = modalApi.getData<any>();
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
});
const columns = computed(() => Object.keys(fieldLabels).map((key) => ({ title: fieldLabels[key], dataIndex: key, key, width: 140, ellipsis: true })));
</script>
<template>
  <Modal title="导入结果" class="w-[95vw]" :footer="false">
    <Table :columns="columns" :data-source="rows" :pagination="false" :scroll="{ x: 'max-content', y: '65vh' }" row-key="id" size="small" />
  </Modal>
</template>
