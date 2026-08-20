import type { PageParam, PageResult } from '@vben/request';
import type { Dayjs } from 'dayjs';

import { requestClient } from '#/api/request';

export namespace DataSspSlotDayApi {
  /** DSP-SSP广告位报信息 */
  export interface SspSlotDay {
    id: number; // 主键
    mediaId?: number; // 媒体用户Id
    appId?: number; // 应用ID
    sspSlotId?: number; // SSP广告位ID
    dspSlotId?: number; // DSP广告位ID
    dspSlotCode?: string; // 预算广告位编号
    showPv: number; // 展示PV
    showUv: number; // 展示UV
    clickPv: number; // 点击PV
    clickUv: number; // 点击UV
    reqPv: number; // 请求PV
    reqCount: number; // 请求数
    reqUv: number; // 请求UV
    discard: number; // 丢弃请求
    retPv: number; // 返回PV
    retUv: number; // 返回UV
    spend: number; // 成本(分)
    income: number; // 收入(分)
    discountClickPv: number; // 折后点击
    discountShowPv: number; // 折后展示
    dplsuccPv: number; // 调起成功
    completePv: number; // 完成量
    installPv: number; // 安装量
    activatePv: number; // 激活量
    date: number; // 日期 
    createdAt: number; // 创建时间戳
    mediaName?: string; // 媒体公司简称
    appName?: string; // 应用名称
    osType?: number; // 操作系统类型
    sspName?: string; // SSP名称
    fillRate?: number; // 填充率
    displayRate?: number; // 展现率
    clickRate?: number; // 点击率
    ecpm?: number; // ecpm
    mediaEcpm?: number; // 媒体ecpm
    ecprm?: number; // ecprm
    mediaEcprm?: number; // 媒体ecprm
  }

  /** 日报表折线图数据点（按天聚合） */
  export interface SspSlotDayTrend {
    date: number; // 日期 yyyyMMdd
    reqPv: number; // 请求数
    retPv: number; // 返回PV
    showPv: number; // 展示PV
    clickPv: number; // 点击PV
    fillRate: number; // 填充率
    displayRate: number; // 展现率
    clickRate: number; // 点击率
    ecpm: number; // ecpm
    mediaEcpm: number; // 媒体ecpm
    ecprm: number; // ecprm
    mediaEcprm: number; // 媒体ecprm
    spend: number; // 成本(分)
    income: number; // 收入(分)
  }
}

/** 查询DSP-SSP广告位报分页 */
export function getSspSlotDayPage(params: PageParam) {
  return requestClient.get<PageResult<DataSspSlotDayApi.SspSlotDay>>(
    '/data/ssp-slot-day/page',
    { params },
  );
}

/** 查询今天数据总和 */
export function getSspSlotDaySum(date: number) {
  return requestClient.get<DataSspSlotDayApi.SspSlotDay>(
    '/data/ssp-slot-day/sum',
    { params: { date } },
  );
}

/** 日报表折线图（按天聚合） */
export function getSspSlotDayTrend(params: any) {
  return requestClient.get<DataSspSlotDayApi.SspSlotDayTrend[]>(
    '/data/ssp-slot-day/trend',
    { params },
  );
}

/** 查询DSP-SSP广告位报分页 子表数据 */
export function getSSPDspSlotDay(params: any) {
  return requestClient.get<DataSspSlotDayApi.SspSlotDay[]>(
    '/data/ssp-slot-day/dsp_ssp_day',
    { params },
  );
}

/** 查询DSP-SSP广告位报详情 */
export function getSspSlotDay(id: number) {
  return requestClient.get<DataSspSlotDayApi.SspSlotDay>(
    `/data/ssp-slot-day/get?id=${id}`,
  );
}

/** 新增DSP-SSP广告位报 */
export function createSspSlotDay(data: DataSspSlotDayApi.SspSlotDay) {
  return requestClient.post('/data/ssp-slot-day/create', data);
}

/** 修改DSP-SSP广告位报 */
export function updateSspSlotDay(data: DataSspSlotDayApi.SspSlotDay) {
  return requestClient.put('/data/ssp-slot-day/update', data);
}

/** 删除DSP-SSP广告位报 */
export function deleteSspSlotDay(id: number) {
  return requestClient.delete(`/data/ssp-slot-day/delete?id=${id}`);
}

/** 批量删除DSP-SSP广告位报 */
export function deleteSspSlotDayList(ids: number[]) {
  return requestClient.delete(
    `/data/ssp-slot-day/delete-list?ids=${ids.join(',')}`,
  );
}

/** 导出DSP-SSP广告位报 */
export function exportSspSlotDay(params: any) {
  return requestClient.download('/data/ssp-slot-day/export-excel', { params });
}
