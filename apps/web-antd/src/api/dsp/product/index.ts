import type { PageParam, PageResult } from '@vben/request';
import type { Dayjs } from 'dayjs';

import { requestClient } from '#/api/request';

export namespace DspProductApi {
  /** 预算产品信息 */
  export interface Product {
    id: number; // ID
    name?: string; // 产品名称
    companyId?: number; // 公司id
  }
}

/** 查询预算产品分页 */
export function getProductPage(params: PageParam) {
  return requestClient.get<PageResult<DspProductApi.Product>>(
    '/dsp/product/page',
    { params },
  );
}

/** 查询预算产品详情 */
export function getProduct(id: number) {
  return requestClient.get<DspProductApi.Product>(
    `/dsp/product/get?id=${id}`,
  );
}

/** 新增预算产品 */
export function createProduct(data: DspProductApi.Product) {
  return requestClient.post('/dsp/product/create', data);
}

/** 修改预算产品 */
export function updateProduct(data: DspProductApi.Product) {
  return requestClient.put('/dsp/product/update', data);
}

/** 删除预算产品 */
export function deleteProduct(id: number) {
  return requestClient.delete(`/dsp/product/delete?id=${id}`);
}

/** 批量删除预算产品 */
export function deleteProductList(ids: number[]) {
  return requestClient.delete(
    `/dsp/product/delete-list?ids=${ids.join(',')}`,
  );
}

/** 导出预算产品 */
export function exportProduct(params: any) {
  return requestClient.download('/dsp/product/export-excel', { params });
}