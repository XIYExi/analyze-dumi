
## getBoundingClientRect

It mainly recalculates the inline layout elements. Some actual contents of the inline layout may exceed the box model. 
If the width of the container is constrained, there will also be span text exceeding the container. 
By comparing the actual boundary with the boundary calculated by the style,
the larger space is returned to prevent the style from collapsing.

```js
/**
 * 返回当前节点可能占的最大空间
 * @param element
 * @returns {{top: *, left: number, bottom: *, width: number, right: number, height: number}|{top: *, left: *, bottom: *, width: number, right: *, height: number}|DOMRect}
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
