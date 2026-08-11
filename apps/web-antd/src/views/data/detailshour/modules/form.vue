<script lang="ts" setup>
import type { DspSlotHour } from '#/api/data/dspslothour';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { DspSlotHourApi } from '#/api/data/dspslothour';
import { $t } from '#/locales';

const emit = defineEmits(['success']);
const formData = ref<DspSlotHour>();
const getTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', ['DSP预算广告位小时报'])
    : $t('ui.actionTitle.create', ['DSP预算广告位小时报']);
});

const [Form, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
    formItemClass: 'col-span-2',
    labelWidth: 80,
  },
  layout: 'horizontal',
  schema: [],
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }
    modalApi.lock();
    const data = (await formApi.getValues()) as DspSlotHour;
    try {
      await (formData.value?.id ? DspSlotHourApi.updateDspSlotHour(data) : DspSlotHourApi.createDspSlotHour(data));
      await modalApi.close();
      emit('success');
      message.success($t('ui.actionMessage.operationSuccess'));
    } finally {
      modalApi.unlock();
    }
  },
  async onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      formData.value = undefined;
      return;
    }
    const data = modalApi.getData<DspSlotHour>();
    if (!data || !data.id) {
      return;
    }
    modalApi.lock();
    try {
      formData.value = await DspSlotHourApi.getDspSlotHour(data.id);
      await formApi.setValues(formData.value);
    } finally {
      modalApi.unlock();
    }
  },
});
</script>

<template>
  <Modal :title="getTitle">
    <Form class="mx-4" />
  </Modal>
</template>
