## getAggregateRectOfElements

通过计算 Element[] 中四个方向的最大值，从的得出相对的最大区域，形如下图

![pSL75Af.png](https://s1.ax1x.com/2023/02/19/pSL75Af.png)


```js
/**
 * 通过getBoundingClientRect得到四个方向上最大的值，最后计算得出长宽，得到绝对布局（相对来说最大的）
 * @param elements
 * @returns {{top: *, left: *, bottom: *, width: number, right: *, height: number}|null}
 */
function getAggregateRectOfElements(elements){
    if(!elements.length)
        return null;

    const {top} = getBoundingClientRect(
        getDirectionMostOfElements('top', elements)
    );
    const { left } = getBoundingClientRect(
        getDirectionMostOfElements("left", elements)
    );
    const { bottom } = getBoundingClientRect(
        getDirectionMostOfElements("bottom", elements)
    );
    const { right } = getBoundingClientRect(
        getDirectionMostOfElements("right", elements)
    );
    const width = right - left;
    const height = bottom - top;
    return {
        top,
        left,
        bottom,
        right,
        width,
        height,
    };
}
```
