import type { PageParam, PageResult } from '@vben/request';
import type { Dayjs } from 'dayjs';

import { requestClient } from '#/api/request';

export namespace MediaApi {
    /** 媒体信息 */
  export interface Media {
            id: number; // ID
            account?: string; // 账号名
            password?: string; // 密码
            mediaCompanyShort?: string; // 公司简称
            name: string; // 媒体名称
            mediaCompanyName: string; // 公司名称
            mediaCompanyCode: string; // 统一社会信用代码
            mediaCompanyLicense: string; // 营业执照照片
            mediaCompanyAddress: string; // 公司地址
            mediaOwnerName: string; // 法人姓名
            contactName: string; // 联系人
            contactPhone: string; // 联系电话
            contactEmail: string; // 联系邮箱
            accessType: number; // 接入方式
            sspType: number; // 流量类型
            enable?: number; // 媒体状态
      }
}

/** 查询媒体分页 */
export function getMediaPage(params: PageParam) {
  return requestClient.get<PageResult<MediaApi.Media>>('/ssp/media/page', { params });
}

/** 查询媒体详情 */
export function getMedia(id: number) {
  return requestClient.get<MediaApi.Media>(`/ssp/media/get?id=${id}`);
}

/** 新增媒体 */
export function createMedia(data: MediaApi.Media) {
  return requestClient.post('/ssp/media/create', data);
}

/** 修改媒体 */
export function updateMedia(data: MediaApi.Media) {
  return requestClient.put('/ssp/media/update', data);
}

/** 删除媒体 */
export function deleteMedia(id: number) {
  return requestClient.delete(`/ssp/media/delete?id=${id}`);
}

/** 批量删除媒体 */
export function deleteMediaList(ids: number[]) {
  return requestClient.delete(`/ssp/media/delete-list?ids=${ids.join(',')}`)
}

/** 查询媒体精简列表（全部） */
export async function getMediaSimpleList() {
  const res = await requestClient.get<PageResult<MediaApi.Media>>(
    '/ssp/media/page',
    { params: { pageNo: 1, pageSize: 1000 } },
  );
  return res.list ?? [];
}

/** 导出媒体 */
export function exportMedia(params: any) {
  return requestClient.download('/ssp/media/export-excel', { params });
}
