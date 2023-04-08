
## createSvgLayer

Get the actual rendering parameters of the current svg tag through the getBoundingClientRect() function,
and integrate json for use by the main function.

```js
/**
 * 获取当前svg的渲染参数
 * @param element
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

Its interface constraint is
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

