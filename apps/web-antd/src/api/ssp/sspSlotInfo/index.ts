import type { PageParam, PageResult } from '@vben/request';
import type { Dayjs } from 'dayjs';

import { requestClient } from '#/api/request';

export namespace SspSlotInfoApi {
  /** 媒体广告位信息 */
  export interface SlotInfo {
    id: number; // ID
    mediaId?: number; // 媒体id
    appId?: number; // 应用id
    name?: string; // 广告位名称
    nameAlise?: string; // 内部广告位名称
    adScene?: number; // 广告场景
    adSize?: number; // 样式尺寸
    sspPayType?: number; // 结算方式
    sspDealRatio?: number; // 分成系数
    fixedPrice?: number; // 固价
    adImage?: string; // 广告位图片
    enable?: number; // 广告位状态
    osType?: number; // 操作系统
    accessType?: number; // 接入方式
    mediaShortName?: string; // 媒体简称名称
    appName?: string; // 应用名称


  }
}

/** 查询媒体广告位分页 */
export function getSlotInfoPage(params: PageParam) {
  return requestClient.get<PageResult<SspSlotInfoApi.SlotInfo>>(
    '/ssp/slot-info/page',
    { params },
  );
}

/** 查询媒体广告位详情 */
export function getSlotInfo(id: number) {
  return requestClient.get<SspSlotInfoApi.SlotInfo>(
    `/ssp/slot-info/get?id=${id}`,
  );
}

/** 新增媒体广告位 */
export function createSlotInfo(data: SspSlotInfoApi.SlotInfo) {
  return requestClient.post('/ssp/slot-info/create', data);
}

/** 修改媒体广告位 */
export function updateSlotInfo(data: SspSlotInfoApi.SlotInfo) {
  return requestClient.put('/ssp/slot-info/update', data);
}

/** 删除媒体广告位 */
export function deleteSlotInfo(id: number) {
  return requestClient.delete(`/ssp/slot-info/delete?id=${id}`);
}

/** 批量删除媒体广告位 */
export function deleteSlotInfoList(ids: number[]) {
  return requestClient.delete(
    `/ssp/slot-info/delete-list?ids=${ids.join(',')}`,
  );
}

/** 导出媒体广告位 */
export function exportSlotInfo(params: any) {
  return requestClient.download('/ssp/slot-info/export-excel', { params });
}
