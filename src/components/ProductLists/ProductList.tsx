import React, { useState, useCallback, useMemo } from "react";
import ProductGrid from "./ProductGrid";
import useProductList from "../../hooks/useProductList";
import FilterDropdown from "./FilterDropdown";
import FilterMobileModal from "./FilteMobile";
import { Flame, ArrowUp, ArrowDown, type LucideIcon } from "lucide-react";

interface FilterValue {
  value: string;
  label: string;
}

interface FilterGroup {
  code: string;
  label: string;
  values: FilterValue[];
}

interface ProductListProps {
  categorySlug: string | undefined | null;
  filter: FilterGroup[];
}

interface SortState {
  order: string;
  dir: "asc" | "desc";
}

interface RatingOption {
  label: string;
  value: number;
}

const RATING_OPTIONS: RatingOption[] = [
  { label: "5 Sao (Tốt nhất)", value: 5 },
  { label: "4 Sao trở lên", value: 4 },
  { label: "3 Sao trở lên", value: 3 },
];

const useAppliedFilterState = () => {
  const [stagedFilters, setStagedFilters] = useState<Record<string, string[]>>(
    {},
  );
  const [appliedFilters, setAppliedFilters] = useState<
    Record<string, string[]>
  >({});

  const handleSelectValue = useCallback(
    (filterCode: string, value: string | null) => {
      setStagedFilters((prev) => {
        const currentValues = prev[filterCode] || [];
        const isSelected = currentValues.includes(value || "");

        let newValues: string[];

        if (isSelected) {
          newValues = currentValues.filter((v) => v !== value);
        } else if (value) {
          newValues = [...currentValues, value];
        } else {
          newValues = currentValues;
        }

        if (newValues.length === 0) {
          const { [filterCode]: _, ...rest } = prev;
          return rest;
        }

        return {
          ...prev,
          [filterCode]: newValues,
        };
      });
    },
    [],
  );

  const handleApply = useCallback(() => {
    setAppliedFilters(stagedFilters);
  }, [stagedFilters]);

  const handleReset = useCallback(() => {
    setStagedFilters(appliedFilters);
  }, [appliedFilters]);

  return {
    stagedFilters,
    appliedFilters,
    handleSelectValue,
    handleApply,
    handleReset,
  };
};

const SORT_PILLS: {
  label: string;
  order: string;
  dir: "asc" | "desc";
  code: string;
  Icon: LucideIcon;
}[] = [
  { label: "Phổ biến", order: "id", dir: "desc", code: "popular", Icon: Flame },
  {
    label: "Giá Thấp - Cao",
    order: "price",
    dir: "asc",
    code: "price_asc",
    Icon: ArrowUp,
  },
  {
    label: "Giá Cao - Thấp",
    order: "price",
    dir: "desc",
    code: "price_desc",
    Icon: ArrowDown,
  },
];

const ProductList: React.FC<ProductListProps> = ({ categorySlug, filter }) => {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  // Trạng thái sắp xếp chung. Mặc định là 'Phổ biến'
  const [sortState, setSortState] = useState<SortState>({
    order: "id",
    dir: "desc",
  });

  // Trạng thái cho Rating (số sao), dùng để LỌC VÀ SẮP XẾP ƯU TIÊN
  const [ratingOrder, setRatingOrder] = useState<number | null>(null);

  const {
    stagedFilters,
    appliedFilters,
    handleSelectValue,
    handleApply,
    handleReset,
  } = useAppliedFilterState();

  // Truyền sortState VÀ ratingOrder vào hook useProductList (Giả định hook đã được cập nhật)
  const { products, loading, error, canLoadMore, countToShow, handleLoadMore } =
    useProductList(categorySlug, appliedFilters, sortState, ratingOrder);

  const displayedFilterGroups = useMemo(() => filter, [filter]);

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  const handleWrapperSelectValue = useCallback(
    (filterCode: string, value: string | null) => {
      handleSelectValue(filterCode, value);
    },
    [handleSelectValue],
  );

  // KHAI BÁO 1: Hàm áp dụng bộ lọc và sắp xếp (SỬ DỤNG GIÁ TRỊ MỚI NHẤT TRUYỀN VÀO)
  const handleApplyFilters = useCallback(
    (newSortState: SortState, newRatingOrder: number | null) => {
      handleApply();
      setIsMobileFilterOpen(false);

      const queryParts: string[] = [];

      // 1. Thêm tham số lọc (filters)
      Object.entries(stagedFilters).forEach(([code, values]) => {
        if (values.length > 0) {
          const combinedValues = values.join(",");
          queryParts.push(`${encodeURIComponent(code)}=${combinedValues}`);
        }
      });

      // 2. Thêm tham số sắp xếp (sort)
      if (newRatingOrder !== null) {
        // TRƯỜNG HỢP 1: Ưu tiên Rating (order={số sao})
        queryParts.push(`order=${newRatingOrder}`);
        // Bỏ qua dir
      } else if (newSortState.order && newSortState.dir) {
        // TRƯỜNG HỢP 2: Sử dụng Sắp xếp thông thường
        queryParts.push(`order=${newSortState.order}`);
        queryParts.push(`dir=${newSortState.dir}`);
      } else {
        // Trường hợp mặc định nếu không có gì được chọn
        queryParts.push(`order=id`);
        queryParts.push(`dir=desc`);
      }

      const queryString = queryParts.join("&");

      const newUrl = `${window.location.origin}/${categorySlug}${
        queryString ? `?${queryString}` : ""
      }`;

      // Sử dụng replaceState để tránh spam lịch sử trình duyệt
      window.history.replaceState(null, "", newUrl);
    },
    [stagedFilters, handleApply, categorySlug],
  ); // Giữ dependencies tối thiểu

  // KHAI BÁO 2: Hàm xử lý khi chọn một nút sắp xếp (Bỏ chọn rating nếu có)
  const handleSortChange = useCallback(
    (order: string, dir: "asc" | "desc") => {
      const newSortState = { order, dir };
      setSortState(newSortState);
      setRatingOrder(null); // <-- Xóa Rating Order

      // Truyền giá trị mới nhất (newRatingOrder=null) vào hàm cập nhật URL
      handleApplyFilters(newSortState, null);
    },
    [handleApplyFilters],
  );

  // Hàm xử lý khi chọn Rating (FIX LỖI TIMING)
  const handleRatingChange = useCallback(
    (value: number | null) => {
      const newRatingOrder = value;
      setRatingOrder(newRatingOrder);

      let newSortState: SortState;
      if (newRatingOrder) {
        // Gán tạm order='rating' để đảm bảo highlight dropdown Rating được chuẩn
        newSortState = { order: "rating", dir: "desc" };
      } else {
        newSortState = { order: "id", dir: "desc" };
      }
      setSortState(newSortState);

      // TRUYỀN GIÁ TRỊ MỚI NHẤT VÀO HÀM CẬP NHẬT URL
      handleApplyFilters(newSortState, newRatingOrder);
    },
    [handleApplyFilters],
  );

  const handleCloseMobileFilter = useCallback(() => {
    handleReset();
    setIsMobileFilterOpen(false);
  }, [handleReset]);

  // Tìm code của tùy chọn sắp xếp hiện tại để highlight button
  const currentSortCode = useMemo(() => {
    if (ratingOrder) return "rating_order";

    const activePill = SORT_PILLS.find(
      (opt) => opt.order === sortState.order && opt.dir === sortState.dir,
    );
    return activePill ? activePill.code : "popular";
  }, [sortState, ratingOrder]);

  // --- LOGIC HIỂN THỊ ĐÃ TỐI ƯU ---
  let content;
  if (loading) {
    content = (
      <div className="flex h-60 items-center justify-center py-8">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
        </div>
      </div>
    );
  } else if (!products || products.length === 0) {
    content = (
      <div className="flex h-60 items-center justify-center py-8">
        <p className="text-lg font-medium text-gray-500">
          Không tìm thấy sản phẩm theo tiêu chí này! 😔
        </p>
        <p className="mt-2 text-sm font-medium text-gray-400">
          (Hãy thử thay đổi tiêu chí lọc hoặc sắp xếp.)
        </p>
      </div>
    );
  } else {
    content = <ProductGrid products={products} categorySlug={categorySlug} />;
  }
  // ---------------------------------

  return (
    <div className="py-4">
      <div className="">
        <div className="flex flex-wrap items-center gap-2 pb-4 lg:pb-0">
          {/* Nút Bộ lọc (MOBILE: Giữ nguyên cho mobile) */}
          <button
            onClick={() => {
              handleReset();
              setIsMobileFilterOpen(true);
            }}
            className="flex items-center rounded-lg border border-red-500 bg-red-50 p-2 text-xs font-semibold text-red-500 lg:hidden"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707v5.88l-2 2v-5.88a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Bộ lọc
          </button>

          {/* Dropdowns Lọc (DESKTOP) */}
          <div className="hidden flex-wrap gap-2 lg:flex">
            {displayedFilterGroups.map((filterGroup) => {
              const activeValues = stagedFilters[filterGroup.code] || [];
              const isSingleSelect = false;

              return (
                <FilterDropdown
                  key={filterGroup.code}
                  filterGroup={filterGroup}
                  onSelectValue={handleWrapperSelectValue}
                  activeValues={activeValues}
                  isSingleSelect={isSingleSelect}
                  onApplyFilters={() =>
                    handleApplyFilters(sortState, ratingOrder)
                  }
                  onClose={handleReset}
                />
              );
            })}
          </div>
        </div>
      </div>
      {/* Phần Sắp xếp đã được sửa đổi */}
      <div className="flex flex-col gap-2 overflow-x-auto whitespace-nowrap py-0 lg:flex-row lg:items-center lg:justify-between lg:pt-8">
        <h2 className="mr-4 shrink-0 text-base font-bold text-black lg:text-xl">
          Sắp xếp theo:
        </h2>

        {/* Đã xóa w-full và thêm lg:ml-auto để căn lề phải trên màn hình lớn */}
        <div className="flex flex-wrap gap-2 lg:ml-auto">
          <div className="relative">
            <select
              value={ratingOrder || ""}
              onChange={(e) => {
                const value = e.target.value ? parseInt(e.target.value) : null;
                handleRatingChange(value);
              }}
              className={`flex shrink-0 cursor-pointer appearance-none items-center rounded-full py-2 pl-4 pr-8 text-xs font-semibold outline-none transition duration-200 ease-in-out lg:text-sm ${ratingOrder ? "border border-blue-500 bg-blue-100/30 text-blue-500" : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"} `}
            >
              <option
                value=""
                disabled={!!ratingOrder}
                className="text-gray-500"
              >
                Đánh giá (1-5)
              </option>
              {RATING_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
              {ratingOrder && (
                <option value="" className="text-red-500">
                  {" "}
                  Xóa chọn
                </option>
              )}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg
                className="h-4 w-4 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>

          {SORT_PILLS.map((pill) => {
            const isActive = !ratingOrder && pill.code === currentSortCode;
            const IconComponent = pill.Icon;

            const baseClass =
              "flex items-center rounded-full px-4 py-2 text-xs lg:text-sm font-semibold transition duration-200 ease-in-out shrink-0";
            const activeClass =
              "bg-blue-100/30 text-blue-500 border border-blue-500";
            const inactiveClass =
              "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100";

            return (
              <button
                key={pill.code}
                onClick={() => handleSortChange(pill.order, pill.dir)}
                className={`${baseClass} ${isActive ? activeClass : inactiveClass}`}
              >
                <IconComponent className="mr-2 h-4 w-4" />
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>
      <FilterMobileModal
        isOpen={isMobileFilterOpen}
        filterGroups={displayedFilterGroups}
        stagedFilters={stagedFilters}
        onSelectValue={handleWrapperSelectValue}
        onApply={() => handleApplyFilters(sortState, ratingOrder)}
        onClose={handleCloseMobileFilter}
      />

      {content}

      {canLoadMore && !loading && (
        <div className="flex justify-center py-8">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-semibold text-red-500 transition duration-300 ease-in-out hover:bg-gray-100 disabled:bg-gray-200 disabled:text-gray-400"
          >
            {`Xem thêm ${countToShow} sản phẩm`}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductList;
