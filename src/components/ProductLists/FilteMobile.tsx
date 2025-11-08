import React, { useCallback, useMemo } from "react";

interface FilterValue {
  value: string;
  label: string;
}

interface FilterGroup {
  code: string;
  label: string;
  values: FilterValue[];
}

interface FilterMobileModalProps {
  isOpen: boolean;
  filterGroups: FilterGroup[];
  stagedFilters: Record<string, string[]>;
  onSelectValue: (
    filterCode: string,
    value: string | null,
    filterLabel: string,
  ) => void;
  onApply: () => void;
  onClose: () => void;
}

const FilterMobileModal: React.FC<FilterMobileModalProps> = ({
  isOpen,
  filterGroups,
  stagedFilters,
  onSelectValue,
  onApply,
  onClose,
}) => {
  if (!isOpen) {
    return null;
  }

  const renderFilterContent = useMemo(
    () => (
      <div className="space-y-6">
        {filterGroups.map((filterGroup) => {
          const activeValues = stagedFilters[filterGroup.code] || [];

          return (
            <div key={filterGroup.code} className="border-b border-gray-200 pb-4">
              <h3 className="mb-3 text-sm font-semibold">{filterGroup.label}</h3>
              <div className="flex flex-wrap gap-2">
                {filterGroup.values.map((item) => (
                  <button
                    key={item.value}
                    onClick={() =>
                      onSelectValue(filterGroup.code, item.value, filterGroup.label)
                    }
                    className={`rounded-full px-4 py-2 text-xs font-medium transition duration-150 ease-in-out ${
                      activeValues.includes(item.value)
                        ? "border-red-500 bg-red-50 text-red-700 ring-2 ring-red-500"
                        : "border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    ),
    [filterGroups, stagedFilters, onSelectValue],
  );

  const handleCloseClick = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden transition-opacity duration-300"
      onClick={handleCloseClick}
    >
      <div
        className="fixed inset-x-0 bottom-0 z-50 h-[75vh] overflow-y-auto rounded-t-xl bg-white lg:hidden
                   transform transition-transform duration-300 ease-out
                   translate-y-full
                   animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-bold">Bộ lọc</h2>
          <button onClick={handleCloseClick} aria-label="Đóng bộ lọc">
            <svg
              className="h-6 w-6 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="h-full overflow-y-auto p-4 pb-20">{renderFilterContent}</div>

        {/* Footer Buttons */}
        <div className="fixed inset-x-0 bottom-0 bg-white p-4 shadow-2xl">
          <div className="flex justify-between gap-4">
            <button
              onClick={handleCloseClick}
              className="w-1/2 rounded-lg border border-gray-300 bg-white py-2 text-sm font-semibold text-gray-700"
            >
              Đóng
            </button>
            <button
              onClick={onApply}
              className="w-1/2 rounded-lg bg-red-600 py-2 text-sm font-semibold text-white shadow-md hover:bg-red-700"
            >
              Xem kết quả
            </button>
          </div>
        </div>
      </div>


    </div>
  );
};

export default FilterMobileModal;
