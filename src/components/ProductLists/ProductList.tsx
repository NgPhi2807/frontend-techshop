import React, { useState, useCallback, useMemo } from "react";
import ProductGrid from "./ProductGrid";
import useProductList from "../../hooks/useProductList";
import FilterDropdown from "./FilterDropdown";
import FilterMobileModal from "./FilteMobile"; // Import component Mobile Modal
// Giả sử ProductGrid được định nghĩa ở trên hoặc trong một file riêng và được import đúng

const BASE_URL = import.meta.env.PUBLIC_API_BASE_URL;

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
  categorySlug: string;
  filter: FilterGroup[];
}

// Giữ nguyên custom hook useAppliedFilterState
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
          // Xử lý logic cho trường hợp là single select (nếu cần), hiện tại là multi-select
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

const ProductList: React.FC<ProductListProps> = ({ categorySlug, filter }) => {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const {
    stagedFilters,
    appliedFilters,
    handleSelectValue,
    handleApply,
    handleReset,
  } = useAppliedFilterState();

  // API_BASE_URL được giữ nguyên nhưng không cần thiết trong logic này
  // vì useProductList đã xử lý việc gọi API với các filters.
  const API_BASE_URL = useMemo(
    () => `${BASE_URL}/api/public/product/filter/${categorySlug}`,
    [categorySlug],
  );

  // useProductList là nơi lấy dữ liệu và cung cấp trạng thái loading
  const { products, loading, error, canLoadMore, countToShow, handleLoadMore } =
    useProductList(categorySlug, appliedFilters);

  const displayedFilterGroups = useMemo(
    () => filter, // Giữ nguyên thứ tự từ prop 'filter'
    [filter],
  );

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  const handleWrapperSelectValue = useCallback(
    (filterCode: string, value: string | null) => {
      handleSelectValue(filterCode, value);
    },
    [handleSelectValue],
  );

  const handleApplyFilters = useCallback(() => {
    handleApply();
    setIsMobileFilterOpen(false);

    // Cập nhật URL với các filter đã áp dụng
    const queryParts: string[] = [];

    Object.entries(stagedFilters).forEach(([code, values]) => {
      if (values.length > 0) {
        const combinedValues = values.join(",");
        queryParts.push(`${encodeURIComponent(code)}=${combinedValues}`);
      }
    });

    const queryString = queryParts.join("&");

    const newUrl = `${window.location.origin}/san-pham/${categorySlug}${
      queryString ? `?${queryString}` : ""
    }`;

    window.history.pushState(null, "", newUrl);
  }, [stagedFilters, handleApply, categorySlug]);

  const handleCloseMobileFilter = useCallback(() => {
    handleReset();
    setIsMobileFilterOpen(false);
  }, [handleReset]);

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
      </div>
    );
  } else {
    content = <ProductGrid products={products} categorySlug={categorySlug} />;
  }

  return (
    <div className="py-4">
      <h2 className="text-base font-bold text-black lg:text-xl">
        Chọn theo tiêu chí
      </h2>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 py-6 lg:hidden">
        <button
          onClick={() => {
            handleReset();
            setIsMobileFilterOpen(true);
          }}
          className="flex items-center rounded-lg border-2 border-red-500 bg-red-50 px-4 py-2 text-sm font-semibold text-red-500"
        >
          <svg
            className="mr-2 h-5 w-5"
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
      </div>

      <div className="hidden flex-wrap gap-2 border-b border-gray-200 py-6 lg:flex">
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
              onApplyFilters={handleApplyFilters}
              onClose={handleReset}
            />
          );
        })}
      </div>

      <FilterMobileModal
        isOpen={isMobileFilterOpen}
        filterGroups={displayedFilterGroups}
        stagedFilters={stagedFilters}
        onSelectValue={handleWrapperSelectValue}
        onApply={handleApplyFilters}
        onClose={handleCloseMobileFilter}
      />

      {content}
      {canLoadMore && !loading && (
        <div className="flex justify-center py-8">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-semibold text-blue-500 transition duration-300 ease-in-out hover:bg-gray-100 disabled:bg-gray-200 disabled:text-gray-400"
          >
            {`Xem thêm ${countToShow} sản phẩm`}
          </button>
        </div>
      )}

    </div>
  );
};

export default ProductList;
