## getDepth


DFS search current dom tree depth

```js
export function getParents(node) {
    let el = node instanceof Node && node.nodeType === Node.TEXT_NODE
            ? node.parentElement
            : node;

    const parents = [];
    while (el && (el = el.parentElement)) {
        parents.push(el);
    }
    return parents;
}

export function getDepth(node) {
    return getParents(node).length;
}
```
