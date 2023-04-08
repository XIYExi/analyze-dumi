
## getBoundingClientRect

主要对行内（line）布局元素进行重计算，行内布局可能出现部分实际内容超出box模型的情况，如果约束了容器width的情况下，还会有span文字超出容器的情况等。
通过比较实际边界和样式计算得到的边界进行比较，返回所占空间较大的一方，防止样式坍塌。

```js
/**
 * 返回当前节点可能占的最大空间
 * @param element
 */
export function getBoundingClientRect(element) {
    //得到计算后的样式
    const computed = getComputedStyle(element);
    const display = computed.display;
    //处理行内元素
    if (display.includes("inline") && element.children.length) {
        //当前
        const elRect = element.getBoundingClientRect();
        //计算绝对定位
        const aggregateRect = getAggregateRectOfElements(Array.from(element.children));

        //inline可能发生的宽度问题，导致超出了父空气，如span中文字超出浏览器
        if (elRect.width > aggregateRect.width) {
            return {
                ...aggregateRect,
                width: elRect.width,
                left: elRect.left,
                right: elRect.right,
            };
        }
        //反则就用，说明当前元素未能用满空间，但是还是要返回空间大的数据。
        return aggregateRect;
    }
    // 反则说明元素使用的是block或者其余布局，则直接返回数据
    return element.getBoundingClientRect();
}
```
