import React, { useState, useRef, useEffect, useCallback } from "react";

interface FilterValue {
  value: string;
  label: string;
}

interface FilterGroup {
  code: string;
  label: string;
  values: FilterValue[];
}

interface FilterDropdownProps {
  filterGroup: FilterGroup;
  onSelectValue: (filterCode: string, value: string | null) => void;
  activeValues: string[];
  // Giữ lại isSingleSelect để tránh lỗi props, nhưng sẽ BỎ QUA trong logic
  isSingleSelect: boolean;
  onApplyFilters?: () => void;
  onClose?: () => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  filterGroup,
  onSelectValue,
  activeValues,
  // Không sử dụng isSingleSelect trong logic này nữa
  // isSingleSelect,
  onApplyFilters,
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isShiftedLeft, setIsShiftedLeft] = useState(false); // State mới để lưu trạng thái căn lề
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Kích thước cố định của dropdown (tương ứng với w-[450px])
  const DROPDOWN_WIDTH = 450;
  // Khoảng cách an toàn tối thiểu từ mép phải (ví dụ 20px)
  const SAFETY_MARGIN = 20;

  // Logic tính toán vị trí
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const buttonRect = dropdownRef.current.getBoundingClientRect();
      // Kích thước viewport
      const viewportWidth = window.innerWidth;

      // Tính toán khoảng cách từ mép phải của nút bấm đến mép phải của viewport
      const spaceRight = viewportWidth - buttonRect.right;

      // Nếu không đủ không gian ở bên phải (DROPDOWN_WIDTH + SAFETY_MARGIN), thì căn trái
      if (spaceRight < DROPDOWN_WIDTH - buttonRect.width / 2) {
        setIsShiftedLeft(true);
      } else {
        // Căn giữa hoặc căn mặc định (theo logic ban đầu)
        setIsShiftedLeft(false);
      }
    }
  }, [isOpen]);

  const isValueActive = useCallback(
    (value: string) => activeValues.includes(value),
    [activeValues],
  );

  const handleValueClick = (value: string) => {
    onSelectValue(filterGroup.code, value);
  };

  const handleCloseClick = () => {
    // Nút ĐÓNG (RESET): Đóng dropdown và hủy các lựa chọn tạm thời
    setIsOpen(false);
    if (onClose) {
      onClose(); // Gọi handleReset trong component cha
    }
    setIsShiftedLeft(false); // Reset trạng thái căn lề khi đóng
  };

  const handleApplyClick = () => {
    // Nút XEM KẾT QUẢ (APPLY): Áp dụng các stagedFilters và đóng dropdown
    setIsOpen(false);
    if (onApplyFilters) {
      onApplyFilters(); // Gọi handleApplyFilters để áp dụng stagedFilters
    }
    setIsShiftedLeft(false); // Reset trạng thái căn lề khi đóng
  };

  // Xử lý sự kiện click ra ngoài (Click Outside)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        // Khi click ra ngoài, ta chỉ đóng dropdown
        setIsOpen(false);
        setIsShiftedLeft(false); // Reset trạng thái căn lề khi đóng
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", () => setIsOpen(false)); // Đóng khi thay đổi kích thước màn hình

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", () => setIsOpen(false));
    };
  }, [isOpen]);

  // Xác định class căn chỉnh vị trí
  const alignmentClasses = isShiftedLeft
    ? "right-0 left-auto" // Căn lề phải của dropdown với lề phải của nút bấm
    : "left-0 right-0 mx-auto"; // Căn giữa theo nút bấm (mặc định)

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-center rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all duration-300 ease-in-out ${
          isOpen || activeValues.length > 0
            ? "border-red-500 bg-red-50 text-red-700"
            : "bg-gray-200"
        }`}
        aria-expanded={isOpen}
      >
        {filterGroup.label}
        <svg
          className={`-mr-1 ml-2 h-5 w-5 transform transition-transform duration-200 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          // Áp dụng lớp căn chỉnh vị trí đã tính toán
          className={`absolute z-20 mt-3 w-[450px] max-w-[calc(100vw-20px)] rounded-lg bg-white p-5 shadow-2xl ring-1 ring-black ring-opacity-10 ${alignmentClasses}`}
          role="dialog"
          aria-labelledby="filter-panel-title"
        >
          <div className="flex flex-wrap gap-3 pb-4">
            {filterGroup.values.map((item) => (
              <button
                key={item.value}
                onClick={() => handleValueClick(item.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition duration-150 ease-in-out ${
                  isValueActive(item.value)
                    ? "border-red-500 bg-red-50 text-red-700 ring-2 ring-red-500"
                    : "border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                aria-pressed={isValueActive(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Nút Đóng (Reset) và Xem kết quả (Apply) */}
          <div className="mt-4 flex justify-between gap-4 border-t pt-4">
            <button
              onClick={handleCloseClick}
              className="w-1/2 rounded-lg border border-gray-300 bg-white py-2 text-base font-semibold text-gray-700 transition duration-150 hover:bg-gray-50"
            >
              Đóng (Hủy thay đổi)
            </button>

            <button
              onClick={handleApplyClick}
              className="w-1/2 rounded-lg bg-red-600 py-2 text-base font-semibold text-white shadow-md transition duration-150 hover:bg-red-700"
            >
              Xem kết quả
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
