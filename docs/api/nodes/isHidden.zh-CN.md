
## isHidden

获取当前节点的样式，通过以下条件判断节点是否被隐藏：
- display:none
- visibility: hidden
- overflow: hidden
- height: 0

```js
export function isHidden(element){
  let el = element;
  do{
    //计算节点样式
    const computed = getComputedStyle(el);

    // 判断节点是否为空
    // 传统方式，display:none || visibility: hidden
    if(computed.display === 'none' || computed.visibility === 'hidden')
      return true;

    // 通过使用overflow:hidden 或者 height:0 来隐藏元素
    if(computed.overflow !== 'visible' && el.getBoundingClientRect().height < 1)
      return true;
  }while((el = el.parentElement))//通过双括号判断，如果el.parentElement存在就会为true然后执行循环
  return false;
}
```


