import type { PageParam, PageResult } from '@vben/request';
import type { Dayjs } from 'dayjs';

import { requestClient } from '#/api/request';

export namespace SspAppApi {
  /** 媒体应用信息 */
  export interface App {
    id: number; // ID
    mediaId?: number; // 媒体Id
    name?: string; // 应用名称
    osType?: number; // 操作系统
    accessType?: number; // 接入方式
    pkg?: string; // 包名
    downloadUrl: string; // 下载地址
    enable?: number; // 应用状态
  }
}

/** 查询媒体应用分页 */
export function getAppPage(params: PageParam) {
  return requestClient.get<PageResult<SspAppApi.App>>(
    '/ssp/app/page',
    { params },
  );
}

/** 查询媒体应用详情 */
export function getApp(id: number) {
  return requestClient.get<SspAppApi.App>(
    `/ssp/app/get?id=${id}`,
  );
}

/** 新增媒体应用 */
export function createApp(data: SspAppApi.App) {
  return requestClient.post('/ssp/app/create', data);
}

/** 修改媒体应用 */
export function updateApp(data: SspAppApi.App) {
  return requestClient.put('/ssp/app/update', data);
}

/** 删除媒体应用 */
export function deleteApp(id: number) {
  return requestClient.delete(`/ssp/app/delete?id=${id}`);
}

/** 批量删除媒体应用 */
export function deleteAppList(ids: number[]) {
  return requestClient.delete(
    `/ssp/app/delete-list?ids=${ids.join(',')}`,
  );
}

/** 导出媒体应用 */
export function exportApp(params: any) {
  return requestClient.download('/ssp/app/export-excel', { params });
}