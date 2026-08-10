import type { PageParam, PageResult } from '@vben/request';
import type { Dayjs } from 'dayjs';

import { requestClient } from '#/api/request';

export namespace DspCompanyApi {
  /** 预算广告信息 */
  export interface Company {
    id: number; // ID
    name?: string; // 公司名称
    dspCode?: number; // 预算映射值
    url?: string; // 请求地址
    method: number; // 请求方法
    timeout: number; // 超时时间
  }
}

/** 查询预算广告分页 */
export function getCompanyPage(params: PageParam) {
  return requestClient.get<PageResult<DspCompanyApi.Company>>(
    '/dsp/company/page',
    { params },
  );
}

/** 查询预算广告详情 */
export function getCompany(id: number) {
  return requestClient.get<DspCompanyApi.Company>(
    `/dsp/company/get?id=${id}`,
  );
}

/** 新增预算广告 */
export function createCompany(data: DspCompanyApi.Company) {
  return requestClient.post('/dsp/company/create', data);
}

/** 修改预算广告 */
export function updateCompany(data: DspCompanyApi.Company) {
  return requestClient.put('/dsp/company/update', data);
}

/** 删除预算广告 */
export function deleteCompany(id: number) {
  return requestClient.delete(`/dsp/company/delete?id=${id}`);
}

/** 批量删除预算广告 */
export function deleteCompanyList(ids: number[]) {
  return requestClient.delete(
    `/dsp/company/delete-list?ids=${ids.join(',')}`,
  );
}

/** 导出预算广告 */
export function exportCompany(params: any) {
  return requestClient.download('/dsp/company/export-excel', { params });
}

/** 下载预算广告导入模板 */
export function importCompanyTemplate() {
  return requestClient.download('/dsp/company/get-import-template');
}

/** 导入预算广告 */
export function importCompany(file: File, updateSupport: boolean) {
  return requestClient.upload('/dsp/company/import', {
    file,
    updateSupport,
  });
}