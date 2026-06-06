"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/list-sticky.ts
var list_sticky_exports = {};
__export(list_sticky_exports, {
  List: () => List_default,
  default: () => List_default
});
module.exports = __toCommonJS(list_sticky_exports);

// src/List.tsx
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
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
var Item = (0, import_react.memo)(({ data, renderRow }) => {
  return renderRow({
    element: data
  });
});
function List({
  data,
  renderRow,
  rowHeight = 50,
  fieldKey = "id",
  targetKey,
  placeholder = "\u041D\u0435\u0442 \u0434\u0430\u043D\u043D\u044B\u0445",
  style
}) {
  const refScroll = (0, import_react.useRef)(null);
  const refCenter = (0, import_react.useRef)(null);
  const refTop = (0, import_react.useRef)(null);
  const refBottom = (0, import_react.useRef)(null);
  const refFrameId = (0, import_react.useRef)(null);
  const targetIndex = (0, import_react.useMemo)(() => {
    if (targetKey === void 0) {
      return void 0;
    }
    const index = data.findIndex((l) => l[fieldKey] === targetKey);
    return index >= 0 ? index : void 0;
  }, [fieldKey, targetKey, data]);
  const [target, setTarget] = (0, import_react.useState)({
    index: targetIndex || 0,
    top: (targetIndex || 0) * rowHeight,
    bottom: rowHeight * (data.length - (targetIndex || 0) - 1)
  });
  const [containerHeight, setContainerHeight] = (0, import_react.useState)(600);
  const [isScrolling, setIsScrolling] = (0, import_react.useState)(false);
  const timeoutRef = (0, import_react.useRef)(null);
  const cnt = data.length;
  const cntElements = (0, import_react.useMemo)(() => {
    return Math.ceil(containerHeight / rowHeight) + 3;
  }, [rowHeight, containerHeight]);
  (0, import_react.useEffect)(() => {
    if (!refScroll.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      setContainerHeight(entries[0].contentRect.height);
    });
    resizeObserver.observe(refScroll.current);
    return () => resizeObserver.disconnect();
  }, []);
  (0, import_react.useEffect)(() => {
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
  const updateTarget = (0, import_react.useCallback)((newIndex, deltaTop, deltaBottom) => {
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
  const autoScroll = (0, import_react.useCallback)(() => {
    if (!refCenter.current || !refTop.current || !refBottom.current) return;
    const rect = refCenter.current.getBoundingClientRect();
    if (rect.top + rect.height < 0) {
      let i = 1;
      let top = rect.height;
      const delta = -rect.top;
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
    } else if (rect.top > 0) {
      let i = 0;
      let top = 0;
      const delta = -rect.top;
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
  }, [refCenter, refTop, rowHeight, refBottom, updateTarget]);
  const autoScrollFrame = (0, import_react.useCallback)(() => {
    if (refFrameId.current !== null) {
      cancelAnimationFrame(refFrameId.current);
    }
    refFrameId.current = requestAnimationFrame(autoScroll);
  }, [refFrameId, autoScroll]);
  (0, import_react.useEffect)(() => {
    return () => {
      if (refFrameId.current !== null) {
        cancelAnimationFrame(refFrameId.current);
      }
    };
  }, []);
  const isMastRecalcIndex = !isScrolling && target.index === data.length - 1;
  (0, import_react.useEffect)(() => {
    if (isMastRecalcIndex) {
      const st = setTimeout(() => {
        autoScrollFrame();
      }, 100);
      return () => clearTimeout(st);
    }
  }, [isMastRecalcIndex, autoScrollFrame]);
  const isMastCheck = refScroll.current && refScroll.current.scrollTop < 200;
  (0, import_react.useEffect)(() => {
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
  const onScroll = (0, import_react.useCallback)(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsScrolling(true);
    timeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
    autoScrollFrame();
  }, [autoScrollFrame]);
  const stickyIdexes = (0, import_react.useMemo)(() => {
    const res = [];
    data.forEach((l, i) => {
      if (l.sticky) {
        res.push(i);
      }
    });
    return res;
  }, [data]);
  const lastStickyIndex = (0, import_react.useMemo)(() => {
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "div",
    {
      ref: refScroll,
      onScroll,
      style: {
        height: "100%",
        width: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        ...style
      },
      children: [
        data[lastStickyIndex] && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
          height: 0,
          width: "100%",
          position: "sticky",
          zIndex: 2,
          top: 0
        }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          Item,
          {
            data: data[lastStickyIndex],
            renderRow
          },
          String(data[lastStickyIndex][fieldKey])
        ) }),
        cnt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
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
                showTopSpacer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { height: rowHeight, width: "100%" } }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "div",
                  {
                    ref: refTop,
                    style: {
                      width: "100%",
                      position: "sticky",
                      bottom: 0
                    },
                    children: visibleTopItems.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: refCenter, children: data[target.index] && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            Item,
            {
              data: data[target.index],
              renderRow
            },
            String(data[target.index][fieldKey])
          ) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: {
            zIndex: data[target.index + 1]?.sticky ? 2 : 1,
            height: target.bottom,
            width: "100%",
            position: "relative"
          }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "div",
              {
                ref: refBottom,
                style: {
                  width: "100%",
                  position: "sticky",
                  top: -2 * rowHeight
                },
                children: visibleBottomItems.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  Item,
                  {
                    data: l,
                    renderRow
                  },
                  String(l[fieldKey])
                ))
              }
            ),
            showBottomSpacer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { height: rowHeight, width: "100%" } })
          ] })
        ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: placeholder })
      ]
    }
  );
}
var List_default = List;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  List
});
