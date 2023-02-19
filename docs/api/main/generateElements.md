
## generateElements

The main function controls the generation of dom list, completes recursion with the help of reduce, and returns Element []

```js
const generateElements = (el) => {
    //查询是否有shadow-root，如果有就处理。
    const getShadowEls = (el) => Array.from(el.shadowRoot?.querySelectorAll("*") || []).reduce(
        (memo, el) => [...memo, el, ...getShadowEls(el)],
        []);

    //递归生成dom列表，相当于把json一层一层剥开整合成一个list
    const els = Array.from(el.querySelectorAll("*")).reduce(
        (memo, el) => [...memo, el, ...getShadowEls(el)],
        []);
    return els;
}
```
