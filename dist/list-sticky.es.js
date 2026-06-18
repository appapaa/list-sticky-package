// src/List.tsx
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
var some = (values, matches) => {
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
var someReverse = (values, matches) => {
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
var Item = memo(({ data, renderRow }) => {
  return renderRow({
    element: data
  });
});
function List({
  data,
  renderRow,
  rowHeight: rowHeightProp = 50,
  fieldKey = "id",
  targetKey,
  placeholder = "\u041D\u0435\u0442 \u0434\u0430\u043D\u043D\u044B\u0445",
  style,
  autoSize = true
}) {
  const refScroll = useRef(null);
  const refCenter = useRef(null);
  const refTop = useRef(null);
  const refBottom = useRef(null);
  const refFrameId = useRef(null);
  const [rowHeight, setRowHeight] = useState(rowHeightProp);
  const isMeasured = useRef(false);
  const cnt = data.length;
  useEffect(() => {
    if (autoSize) {
      setRowHeight(rowHeightProp);
      isMeasured.current = false;
    } else if (!isMeasured.current && refCenter.current) {
      const h = refCenter.current.offsetHeight;
      if (h > 0) {
        setRowHeight(h);
        isMeasured.current = true;
      }
    }
  }, [autoSize, rowHeightProp]);
  const targetIndex = useMemo(() => {
    if (targetKey === void 0) {
      return void 0;
    }
    const index = data.findIndex((l) => l[fieldKey] === targetKey);
    return index >= 0 ? index : void 0;
  }, [fieldKey, targetKey, data]);
  const [target, setTarget] = useState({
    index: targetIndex || 0,
    top: (targetIndex || 0) * rowHeightProp,
    bottom: rowHeightProp * (data.length - (targetIndex || 0) - 1)
  });
  useEffect(() => {
    setTarget((prev) => ({
      ...prev,
      top: prev.index * rowHeight,
      bottom: rowHeight * (cnt - prev.index - 1)
    }));
  }, [rowHeight, cnt]);
  const [containerHeight, setContainerHeight] = useState(600);
  const [isScrolling, setIsScrolling] = useState(false);
  const timeoutRef = useRef(null);
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
  useEffect(() => {
    if (typeof targetIndex === "number" && refScroll.current) {
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
  const updateTarget = useCallback((newIndex, deltaTop, deltaBottom) => {
    setTarget((prev) => {
      let index = prev.index + newIndex;
      let top = prev.top + deltaTop;
      let bottom = prev.bottom + deltaBottom;
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
    if (!refScroll.current || !refCenter.current || !refTop.current || !refBottom.current) return;
    const rect = refCenter.current.getBoundingClientRect();
    const rectTop = refCenter.current.offsetTop - refScroll.current.scrollTop;
    const rectHeight = refCenter.current.offsetHeight;
    if (rectTop + rectHeight < 0) {
      let i = 1;
      let top = rectHeight;
      const delta = -rectTop;
      const flg = some(refBottom.current.children, (div) => {
        const h = div.offsetHeight;
        if (delta > top + h) {
          i++;
          top += h;
          return false;
        } else {
          return true;
        }
      });
      if (!flg) {
        const _i = Math.ceil((delta - top) / rowHeight);
        i += _i;
        top += _i * rowHeight;
      }
      updateTarget(i, top, -i * rowHeight);
    } else if (rectTop > 0) {
      let i = 0;
      let top = 0;
      const delta = -rectTop;
      const flg = someReverse(refTop.current.children, (div) => {
        const h = div.offsetHeight;
        i--;
        top -= h;
        if (delta > top) {
          return true;
        } else {
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
  }, [refScroll, refCenter, refTop, rowHeight, refBottom, updateTarget]);
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
  const isMastRecalcIndex = !isScrolling && target.index === data.length - 1;
  useEffect(() => {
    if (isMastRecalcIndex) {
      const st = setTimeout(() => {
        autoScrollFrame();
      }, 100);
      return () => clearTimeout(st);
    }
  }, [isMastRecalcIndex, autoScrollFrame]);
  const isMastCheck = refScroll.current && refScroll.current.scrollTop < 200;
  useEffect(() => {
    if (isMastCheck && refTop.current) {
      const parentElement = refTop.current.parentElement;
      if (!parentElement) return;
      const parentHeight = parentElement.offsetHeight;
      const height = refTop.current.offsetHeight;
      const delta = Math.max(target.index - cntElements, 0) * rowHeight;
      const overflow = height + delta - parentHeight;
      if (parentHeight < height) {
        setTarget((t) => ({
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
    const res = [];
    data.forEach((l, i) => {
      if (l.sticky) {
        res.push(i);
      }
    });
    return res;
  }, [data]);
  const lastStickyIndex = useMemo(() => {
    return stickyIdexes.findLast((i) => i <= target.index) ?? -1;
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
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: refScroll,
      onScroll,
      style: {
        height: "100%",
        width: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        position: "relative",
        ...style
      },
      children: [
        data[lastStickyIndex] && /* @__PURE__ */ jsx("div", { style: {
          height: 0,
          width: "100%",
          position: "sticky",
          zIndex: 2,
          top: 0
        }, children: /* @__PURE__ */ jsx(
          Item,
          {
            data: data[lastStickyIndex],
            renderRow
          },
          String(data[lastStickyIndex][fieldKey])
        ) }),
        cnt ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs(
            "div",
            {
              style: {
                height: target.top,
                width: "100%",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                ...target.index <= cntElements ? { maxHeight: "fit-content" } : {}
              },
              children: [
                showTopSpacer && /* @__PURE__ */ jsx("div", { style: { height: rowHeight, width: "100%" } }),
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    ref: refTop,
                    style: {
                      width: "100%",
                      position: "sticky",
                      bottom: 0
                    },
                    children: visibleTopItems.map((l) => /* @__PURE__ */ jsx(
                      Item,
                      {
                        data: l,
                        renderRow
                      },
                      String(l[fieldKey])
                    ))
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsx("div", { ref: refCenter, children: data[target.index] && /* @__PURE__ */ jsx(
            Item,
            {
              data: data[target.index],
              renderRow
            },
            String(data[target.index][fieldKey])
          ) }),
          /* @__PURE__ */ jsxs("div", { style: {
            zIndex: data[target.index + 1]?.sticky ? 2 : 1,
            height: target.bottom,
            width: "100%",
            position: "relative"
          }, children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                ref: refBottom,
                style: {
                  width: "100%",
                  position: "sticky",
                  top: -2 * rowHeight
                },
                children: visibleBottomItems.map((l) => /* @__PURE__ */ jsx(
                  Item,
                  {
                    data: l,
                    renderRow
                  },
                  String(l[fieldKey])
                ))
              }
            ),
            showBottomSpacer && /* @__PURE__ */ jsx("div", { style: { height: rowHeight, width: "100%" } })
          ] })
        ] }) : /* @__PURE__ */ jsx("div", { children: placeholder })
      ]
    }
  );
}
var List_default = List;
export {
  List_default as List,
  List_default as default
};
