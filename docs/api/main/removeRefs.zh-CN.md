## removeRefs


移除最终返回结果集中的ref属性。

```js
function removeRefs({layers, root,}) {
    layers.concat([root]).forEach((layer) => {
        traverse(layer, (child) => {
            delete child.ref;
        });
    });
}
```
