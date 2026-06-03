import { memo, useCallback, useEffect, useMemo, useRef, useState, type ReactElement, type ReactNode } from "react";

export interface ListItem {
    [key: string]: unknown;
    sticky?: boolean;
}

export interface ListProps<T extends ListItem> {
    data: T[];
    renderRow: (props: { element: T }) => ReactElement;
    rowHeight?: number;
    fieldKey?: string;
    targetKey?: string | number;
    placeholder?: string | ReactNode;
}

const some = (values: HTMLCollection | undefined, matches: (value: Element) => boolean): boolean => {
    const len = values?.length;
    if (!len) {
        return false;
    }
    for (let i = 0; i < len; i++) {
        const value = values[i];
        if (value && matches(value)) {
            return true;
        }
    }
    return false;
};

const someReverse = (values: HTMLCollection | undefined, matches: (value: Element) => boolean): boolean => {
    const len = values?.length;
    if (!len) {
        return false;
    }
    for (let i = len - 1; i >= 0; i--) {
        const value = values[i];
        if (value && matches(value)) {
            return true;
        }
    }
    return false;
};

interface ItemProps<T extends ListItem> {
    data: T;
    renderRow: (props: { element: T }) => ReactElement;
}

const Item = memo(<T extends ListItem>({ data, renderRow }: ItemProps<T>) => {
    return renderRow({
        element: data,
    });
}) as <T extends ListItem>(props: ItemProps<T>) => ReactElement;

function List<T extends ListItem>({
    data,
    renderRow,
    rowHeight = 50,
    fieldKey = 'id',
    targetKey,
    placeholder = 'Нет данных'
}: ListProps<T>) {
    const refScroll = useRef<HTMLDivElement>(null);
    const refCenter = useRef<HTMLDivElement>(null);
    const refTop = useRef<HTMLDivElement>(null);
    const refBottom = useRef<HTMLDivElement>(null);
    const refFrameId = useRef<number | null>(null);

    const targetIndex = useMemo(() => {
        if (targetKey === undefined) {
            return undefined;
        }
        const index = data.findIndex(l => l[fieldKey] === targetKey);
        return index >= 0 ? index : undefined;
    }, [fieldKey, targetKey, data]);

    const [target, setTarget] = useState({
        index: targetIndex || 0,
        top: (targetIndex || 0) * rowHeight,
        bottom: rowHeight * (data.length - (targetIndex || 0) - 1)
    });
    const [containerHeight, setContainerHeight] = useState(600);
    const [isScrolling, setIsScrolling] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const cnt = data.length;

    const cntElements = useMemo(() => {
        return Math.ceil(containerHeight / rowHeight) + 3;
    }, [rowHeight, containerHeight]);

    useEffect(() => {
        if (!refScroll.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            setContainerHeight(entries[0].contentRect.height);
        });
        resizeObserver.observe(refScroll.current);

        return () => resizeObserver.disconnect();
    }, []);

    //прыжок к выбранному индексу
    useEffect(() => {
        if (typeof targetIndex === 'number' && refScroll.current) {
            setTarget({
                index: targetIndex,
                top: targetIndex * rowHeight,
                bottom: rowHeight * (cnt - targetIndex - 1)
            });
            requestAnimationFrame(() => {
                if (refScroll.current) {
                    refScroll.current.scrollTop = targetIndex * rowHeight;
                }
            });
        }
    }, [targetIndex, cnt, rowHeight]);

    const updateTarget = useCallback((newIndex: number, deltaTop: number, deltaBottom: number) => {
        setTarget(prev => {
            let index = prev.index + newIndex;
            let top = prev.top + deltaTop;
            let bottom = prev.bottom + deltaBottom;

            // Клэмпинг
            if (index <= 0) {
                return { index: 0, top: 0, bottom: rowHeight * (cnt - 1) };
            }
            if (index >= cnt - 1) {
                return { index: cnt - 1, top: rowHeight * (cnt - 1), bottom: 0 };
            }

            return { index, top, bottom };
        });
    }, [cnt, rowHeight]);

    const autoScroll = useCallback(() => {
        if (!refCenter.current || !refTop.current || !refBottom.current) return;
        const rect = refCenter.current.getBoundingClientRect();
        //скролл в низ, ищем элемент, который по центру
        if (rect.top + rect.height < 0) {
            let i = 1;
            let top = rect.height;
            const delta = -rect.top;
            const flg = some(refBottom.current.children, (div) => {
                const h = (div as HTMLElement).offsetHeight;
                if (delta > top + h) {
                    i++;
                    top += h;
                    return false;
                }
                else {
                    return true;
                }
            });
            if (!flg) {
                const _i = Math.ceil((delta - top) / rowHeight);
                i += _i;
                top += _i * rowHeight;
            }
            updateTarget(i, top, -i * rowHeight);
        }
        else if (rect.top > 0) {
            let i = 0;
            let top = 0;
            const delta = -rect.top;
            const flg = someReverse(refTop.current.children, (div) => {
                const h = (div as HTMLElement).offsetHeight;
                i--;
                top -= h;
                if (delta > top) {
                    return true;
                }
                else {
                    return false;
                }
            });
            if (!flg) {
                const _i = Math.ceil((top - delta) / rowHeight);
                i -= _i;
                top -= _i * rowHeight;
            }
            updateTarget(i, top, -i * rowHeight);
        }
    }, [refCenter, refTop, rowHeight, refBottom, updateTarget]);

    const autoScrollFrame = useCallback(() => {
        if (refFrameId.current !== null) {
            cancelAnimationFrame(refFrameId.current);
        }
        refFrameId.current = requestAnimationFrame(autoScroll);
    }, [refFrameId, autoScroll]);

    useEffect(() => {
        return () => {
            if (refFrameId.current !== null) {
                cancelAnimationFrame(refFrameId.current);
            }
        };
    }, []);

    //перерасчет если фокус на элементе в конце
    const isMastRecalcIndex = !isScrolling && target.index === data.length - 1;
    useEffect(() => {
        if (isMastRecalcIndex) {
            const st = setTimeout(() => {
                autoScrollFrame();
            }, 100);
            return () => clearTimeout(st);
        }
    }, [isMastRecalcIndex, autoScrollFrame]);

    const isMastCheck = refScroll.current && (refScroll.current.scrollTop < 200);
    useEffect(() => {
        if (isMastCheck && refTop.current) {
            const parentHeight = refTop.current.parentElement!.offsetHeight;
            const height = refTop.current.offsetHeight;
            const delta = Math.max(target.index - cntElements, 0) * rowHeight;
            const overflow = height + delta - parentHeight;
            if (parentHeight < height) {
                setTarget(t => ({
                    ...t,
                    top: t.top + overflow
                }));
            }
        }
    }, [isMastCheck, rowHeight, cntElements, target.index]);

    const onScroll = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsScrolling(true);

        timeoutRef.current = setTimeout(() => {
            setIsScrolling(false);
        }, 150);
        autoScrollFrame();
    }, [autoScrollFrame]);

    const stickyIdexes = useMemo(() => {
        const res: number[] = [];
        data.forEach((l, i) => {
            if (l.sticky) {
                res.push(i);
            }
        });
        return res;
    }, [data]);

    const lastStickyIndex = useMemo(() => {
        return stickyIdexes.findLast(i => i <= target.index) ?? -1;
    }, [stickyIdexes, target.index]);

    const visibleTopItems = data.slice(
        Math.max(0, target.index - cntElements),
        target.index
    );
    const visibleBottomItems = data.slice(
        target.index + 1,
        target.index + 1 + cntElements
    );
    const showTopSpacer = target.index > cntElements;
    const showBottomSpacer = target.index + cntElements < cnt;

    return (
        <div
            ref={refScroll}
            onScroll={onScroll}
            style={{
                height: '100%',
                width: '100%',
                overflowY: 'auto',
                overflowX: 'hidden',
            }}>
            {data[lastStickyIndex] && (
                <div style={{
                    height: 0,
                    width: '100%',
                    position: 'sticky',
                    zIndex: 2,
                    top: 0
                }}>
                    <Item
                        key={String(data[lastStickyIndex][fieldKey])}
                        data={data[lastStickyIndex]}
                        renderRow={renderRow} />
                </div>
            )}
            {cnt
                ? <>
                    <div
                        style={{
                            height: target.top,
                            width: '100%',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            ...(target.index <= cntElements ? { maxHeight: 'fit-content' } : {})
                        }}>
                        {showTopSpacer && <div style={{ height: rowHeight, width: '100%' }} />}
                        <div
                            ref={refTop}
                            style={{
                                width: '100%',
                                position: 'sticky',
                                bottom: 0
                            }}>
                            {visibleTopItems.map(l => (
                                <Item
                                    key={String(l[fieldKey])}
                                    data={l}
                                    renderRow={renderRow} />
                            ))}
                        </div>
                    </div>
                    <div ref={refCenter}>
                        {data[target.index] && (
                            <Item
                                key={String(data[target.index][fieldKey])}
                                data={data[target.index]}
                                renderRow={renderRow} />
                        )}
                    </div>
                    <div style={{
                        zIndex: data[target.index + 1]?.sticky ? 2 : 1,
                        height: target.bottom,
                        width: '100%',
                        position: 'relative'
                    }}>
                        <div
                            ref={refBottom}
                            style={{
                                width: '100%',
                                position: 'sticky',
                                top: -2 * rowHeight
                            }}>
                            {visibleBottomItems.map(l => (
                                <Item
                                    key={String(l[fieldKey])}
                                    data={l}
                                    renderRow={renderRow} />
                            ))}
                        </div>
                        {showBottomSpacer && <div style={{ height: rowHeight, width: '100%' }} />}
                    </div>
                </>
                : <div>{placeholder}</div>}
        </div>
    );
}

export default List;
