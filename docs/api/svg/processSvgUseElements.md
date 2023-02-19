
## processSvgUseElements

It is used to process the use element in the svg tag and replace the current use node with the child tag of the node copied by use. 
Do not operate if the use node does not exist.

```js
export const processSvgUseElements = (element) => {
    //处理使用use标签复制出来的svg https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use
    for (const use of Array.from(element.querySelectorAll("use"))) {
        try {
            //查询出来的use为SVGUseElement
            const symbolSelector = use.href.baseVal;
            const symbol = document.querySelector(symbolSelector);
            //查询复制的节点是否为单标签（有没有children），没用就不操作，有就直接替换use
            if (symbol) {
                use.outerHTML = symbol.innerHTML;
            }
        } catch (err) {
            console.warn("Error querying <use> tag href", err);
        }
    }
};
```
