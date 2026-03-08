import { useRef, useState } from "react";

export const SUBGROUP_COUNT = 50;

export type UseGroupTreePaginationReturn = {
    first: number;
    setFirst: (value: number) => void;
    max: number;
    firstSub: number;
    setFirstSub: (value: number) => void;
    prefFirst: React.MutableRefObject<number>;
    prefMax: React.MutableRefObject<number>;
    /** Computed page count based on total item count */
    getPageInfo: (count: number) => {
        pageCount: number;
        currentPage: number;
        from: number;
        to: number;
    };
    loadMoreSubGroups: () => void;
};

export function useGroupTreePagination(): UseGroupTreePaginationReturn {
    const [max] = useState(20);
    const [first, setFirst] = useState(0);
    const [firstSub, setFirstSub] = useState(0);
    const prefFirst = useRef(0);
    const prefMax = useRef(20);

    const getPageInfo = (count: number) => {
        const pageCount = Math.ceil(count / max) || 1;
        const currentPage = Math.floor(first / max) + 1;
        const from = count === 0 ? 0 : first + 1;
        const to = Math.min(first + max, count);
        return { pageCount, currentPage, from, to };
    };

    const loadMoreSubGroups = () => {
        setFirstSub(prev => prev + SUBGROUP_COUNT);
    };

    return {
        first,
        setFirst,
        max,
        firstSub,
        setFirstSub,
        prefFirst,
        prefMax,
        getPageInfo,
        loadMoreSubGroups
    };
}
