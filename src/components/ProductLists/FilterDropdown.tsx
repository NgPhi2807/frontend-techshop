import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
// 💡 Import useMemo để kiểm tra trạng thái nút

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
    isSingleSelect: boolean;
    onApplyFilters?: () => void;
    onClose?: () => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
    filterGroup,
    onSelectValue,
    activeValues,
    onApplyFilters,
    onClose,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isShiftedLeft, setIsShiftedLeft] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const DROPDOWN_WIDTH = 450;
    const SAFETY_MARGIN = 20;
    useEffect(() => {
        if (isOpen && dropdownRef.current) {
            const buttonRect = dropdownRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;

            // Tính toán khoảng cách từ mép phải của nút bấm đến mép phải của viewport
            const spaceRight = viewportWidth - buttonRect.right;

            // Nếu không đủ không gian ở bên phải (DROPDOWN_WIDTH + SAFETY_MARGIN), thì căn trái
            // Tôi đã điều chỉnh logic căn lề: nếu khoảng trống bên phải nhỏ hơn độ rộng dropdown, căn lề phải
            // buttonRect.left là vị trí bắt đầu của button
            if (buttonRect.left + DROPDOWN_WIDTH > viewportWidth - SAFETY_MARGIN) {
                setIsShiftedLeft(true);
            } else {
                setIsShiftedLeft(false);
            }
        }
    }, [isOpen]);

    const isValueActive = useCallback(
        (value: string) => activeValues.includes(value),
        [activeValues],
    );

    // 💡 Xác định trạng thái của nút "Xem kết quả"
    const hasActiveSelections = activeValues.length > 0;

    const handleValueClick = (value: string) => {
        onSelectValue(filterGroup.code, value);
    };

    const handleCloseClick = () => {
        // Nút ĐÓNG (RESET): Đóng dropdown và hủy các lựa chọn tạm thời
        setIsOpen(false);
        if (onClose) {
            onClose(); // Gọi handleReset/cancel trong component cha
        }
        setIsShiftedLeft(false); // Reset trạng thái căn lề khi đóng
    };

    const handleApplyClick = () => {
        // Nút XEM KẾT QUẢ (APPLY): Chỉ áp dụng khi có ít nhất 1 lựa chọn
        if (!hasActiveSelections) return; // Ngăn chặn hành động nếu không có lựa chọn

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

        const handleResize = () => setIsOpen(false); // Đóng khi thay đổi kích thước màn hình

        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("resize", handleResize);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("resize", handleResize);
        };
    }, [isOpen]);

    // Xác định class căn chỉnh vị trí
    // Nếu isShiftedLeft = true, căn lề phải (right-0)
    // Nếu isShiftedLeft = false, căn giữa (left-1/2 - translate-x-1/2 HOẶC left-0 right-0 mx-auto)
    const alignmentClasses = isShiftedLeft
        ? "right-0 left-auto"
        : "left-1/2 -translate-x-1/2"; // Căn giữa chính xác hơn

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`inline-flex items-center justify-center rounded-lg  px-4 py-2.5 text-sm font-normal transition-all duration-500 ease-in-out ${
                    isOpen || activeValues.length > 0
                        ? "border-red-500 border-[1px] bg-red-50 text-red-700"
                        : "border-gray-300  bg-white border-[1px] border-transparent text-gray-700 hover:border-red-500 hover:bg-gray-50"
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
                    // Cập nhật lớp căn chỉnh vị trí và căn giữa
                    className={`absolute z-20 mt-3 w-[450px] max-w-[calc(100vw-20px)] rounded-lg bg-white p-5 shadow-2xl ring-1 ring-black ring-opacity-10 ${alignmentClasses}`}
                    style={!isShiftedLeft ? { transform: 'translateX(-50%)' } : {}} // Áp dụng translate-x-1/2
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

                    <div className="flex justify-between gap-4">
                        <button
                            onClick={handleCloseClick}
                            className="w-1/2 rounded-lg border border-gray-300 bg-white py-2 text-sm font-semibold text-gray-700 transition duration-150 hover:bg-gray-50"
                        >
                            Đóng (Hủy thay đổi)
                        </button>

                        <button
                            onClick={handleApplyClick}
                            disabled={!hasActiveSelections}
                            className={`w-1/2 rounded-lg py-2 text-sm font-semibold text-white shadow-md transition duration-150 ${
                                hasActiveSelections
                                    ? "bg-red-600 hover:bg-red-700"
                                    : "bg-red-400 cursor-not-allowed" // Vô hiệu hóa và chuyển sang màu xám
                            }`}
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