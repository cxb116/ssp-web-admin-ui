import type { PageParam, PageResult } from '@vben/request';
import type { Dayjs } from 'dayjs';

import { requestClient } from '#/api/request';

export namespace DataSspSlotHourApi {
  /** DSP-SSP广告位报信息 */
  export interface SspSlotHour {
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
    date: number; // 时间 yyyyMMddHH
    createdAt: number; // 创建时间戳
    mediaName?: string; // 媒体名称（关联查询）
    appName?: string; // 应用名称（关联查询）
    sspName?: string; // SSP名称（关联查询）
    osType?: number; // 操作系统类型（关联查询）
    fillRate?: number; // 填充率
    displayRate?: number; // 展现率
    clickRate?: number; // 点击率
    ecpm?: number; // ecpm
    mediaEcpm?: number; // 媒体ecpm
    ecprm?: number; // ecprm
    mediaEcprm?: number; // 媒体ecprm
  }

  /** 小时报表折线图数据点（单天0~23点按小时聚合） */
  export interface SspSlotHourTrend {
    hour: number; // 小时 0~23
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
export function getSspSlotHourPage(params: PageParam) {
  return requestClient.get<PageResult<DataSspSlotHourApi.SspSlotHour>>(
    '/data/ssp-slot-hour/page',
    { params },
  );
}

/** 查询DSP-SSP广告位报详情 */
export function getSspSlotHour(id: number) {
  return requestClient.get<DataSspSlotHourApi.SspSlotHour>(
    `/data/ssp-slot-hour/get?id=${id}`,
  );
}

/** 点击主表展开时，查询小时子表数据（参数取自主表 date、sspSlotId） */
export function getSSPDspSlotHour(params: {
  sspSlotId?: number;
  date?: number;
}) {
  return requestClient.get(
    '/data/dsp-slot-hour/dsp_ssp_hour',
    { params },
  );
}

/** 小时报表折线图（单天0~23点按小时聚合） */
export function getSspSlotHourTrend(params: any) {
  return requestClient.get<DataSspSlotHourApi.SspSlotHourTrend[]>(
    '/data/ssp-slot-hour/trend',
    { params },
  );
}

/** 新增DSP-SSP广告位报 */
export function createSspSlotHour(data: DataSspSlotHourApi.SspSlotHour) {
  return requestClient.post('/data/ssp-slot-hour/create', data);
}

/** 修改DSP-SSP广告位报 */
export function updateSspSlotHour(data: DataSspSlotHourApi.SspSlotHour) {
  return requestClient.put('/data/ssp-slot-hour/update', data);
}

/** 删除DSP-SSP广告位报 */
export function deleteSspSlotHour(id: number) {
  return requestClient.delete(`/data/ssp-slot-hour/delete?id=${id}`);
}

/** 批量删除DSP-SSP广告位报 */
export function deleteSspSlotHourList(ids: number[]) {
  return requestClient.delete(
    `/data/ssp-slot-hour/delete-list?ids=${ids.join(',')}`,
  );
}

/** 导出DSP-SSP广告位报 */
export function exportSspSlotHour(params: any) {
  return requestClient.download('/data/ssp-slot-hour/export-excel', { params });
}