## removeRefs

Remove the ref attribute from the final returned result set.

```js
function removeRefs({layers, root,}) {
    layers.concat([root]).forEach((layer) => {
        traverse(layer, (child) => {
            delete child.ref;
        });
    });
}
```
