/*
 * LÝ DO SỬ DỤNG FILE TYPES (WHY?):
 * File này đóng vai trò như "từ điển" định nghĩa toàn bộ cấu trúc dữ liệu giao tiếp với Backend.
 * - Giúp code an toàn, tránh lỗi gõ sai tên biến (typo).
 * - Giúp VSCode tự động gợi ý code (IntelliSense) siêu tốc.
 * Các Interface bắt đầu bằng chữ 'I' (quy ước phổ biến trong TypeScript) để phân biệt với Class.
 */

// 1. Cấu trúc một Danh mục
export interface ICategory {
  _id: string;
  name: string;
  isActive: boolean;
  parentId?: string | null;
  children?: ICategory[]; // Dùng khi render dữ liệu dạng Cây (Hierarchy)
  createdAt?: string;
  updatedAt?: string;
}

// 2. Cấu trúc 1 phần tử URL dùng trong đối thủ
export interface IScrapingUrl {
  categoryId: string | ICategory; // Có thể là chuỗi ID, hoặc đã được populate() thành Object Category
  url: string;
}

// 3. Cấu trúc Đối thủ
export interface ICompetitor {
  _id: string;
  name: string;
  domain: string;
  scrapingUrls: IScrapingUrl[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// 4. (Tuỳ chọn) Interface chuẩn cho kết quả API trả về từ Server Actions
export interface IApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}
