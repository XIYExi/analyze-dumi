
## createSvgLayer

通过 getBoundingClientRect() 函数获得当前svg标签的实际渲染参数，并通过整合json供主函数使用。

```js
/**
 * 获取当前svg的渲染参数
 * @param element
 * @returns {{ref, svg: *, x: number, width: number, y: number, type: string, height: number}}
 */
export const createSvgLayer = (element) => {
    //getBoundingClientRect() 返回的是矩形的集合，表示了当前盒子在浏览器中的位置以及自身占据的空间的大小，
    // 除了 width 和 height 以外的属性是相对于 视图窗口的左上角 来计算的
    const rect = element.getBoundingClientRect();
    const layer = {
        type: "SVG",
        ref: element,
        svg: element.outerHTML,
        x: Math.round(rect.left),
        y: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
    };
    return layer;
}
```

其interface约束为
```ts

interface layer {
  type: 'FRAME' | 'RECTANGLE' | 'TEXT' | 'SVG';
  ref: Element;
  svg: string;
  x: number;
  y: number;
  width: number;
  height: number;
}
```

