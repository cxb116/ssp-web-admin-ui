import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/ssp/slot-info/config/:id',
    component: () => import('#/views/ssp/sspSlotInfo/config.vue'),
    name: 'SspSlotInfoConfig',
    meta: {
      title: '广告位配置',
      icon: 'ant-design:setting-filled',
      hideInMenu: true,
    },
  },
  {
    path: '/dsp/dspslotinfo/config/:id?',
    component: () => import('#/views/dsp/dspslotinfo/config.vue'),
    name: 'DspSlotInfoConfig',
    meta: {
      title: '预算广告位配置',
      icon: 'ant-design:setting-filled',
      hideInMenu: true,
    },
  },
  {
    path: '/data/ssp-slot-day',
    component: () => import('#/views/data/sspslotday/index.vue'),
    name: 'DataSspSlotDay',
    meta: {
      title: '媒体广告位日报表',
      icon: 'ant-design:calendar-outlined',
      hideInMenu: true,
    },
  },
  {
    path: '/data/ssp-slot-hour',
    component: () => import('#/views/data/sspslothour/index.vue'),
    name: 'DataSspSlotHour',
    meta: {
      title: '媒体广告位小时报表',
      icon: 'ant-design:field-time-outlined',
      hideInMenu: true,
    },
  },
  {
    path: '/data/dsp-slot-day',
    component: () => import('#/views/data/dspslotday/index.vue'),
    name: 'DataDspSlotDay',
    meta: {
      title: '预算广告位日报表',
      icon: 'ant-design:calendar-outlined',
      hideInMenu: true,
    },
  },
  {
    path: '/data/dsp-slot-hour',
    component: () => import('#/views/data/dspslothour/index.vue'),
    name: 'DataDspSlotHour',
    meta: {
      title: '预算广告位小时报表',
      icon: 'ant-design:field-time-outlined',
      hideInMenu: true,
    },
  },
];

export default routes;