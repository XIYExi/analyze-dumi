
# 基本原理解析

## 主入口函数

在 ```lib\index.js``` 中函数 ```htmlToMastergo``` 即为解析的主入口函数，接受参数，分别是需要解析的根标签（根节点），是否需要转换为Dom结构

函数开始运行后将会判断selector传入的节点是否为HTML元素，存在则直接使用，反之则通过document查询选择器，
选择器中使用逻辑或进行判断，selector存在则使用selector反之则默认使用body。

> 逻辑或(```||```): 前面true就返回前面的，前面false就返回后面的。

```js
const element = selector instanceof HTMLElement
        ? selector
        : document.querySelector(selector || 'body');
```

## element存在

先对查询出来的element中的 SVG 进行处理。HTML5标准中 ```<svg/>``` 中存在 ```<use/>``` 标签，可以从 SVG 文档中获取节点，并将它们复制到其他位置.
需要做的是替换use标签，将其拷贝的内容显示表达出来。如 [WebApi接口文档](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use) 中
给出了关于use的一个的基本使用。

```html
<svg viewBox="0 0 30 10" xmlns="http://www.w3.org/2000/svg">
  <circle id="myCircle" cx="5" cy="5" r="4" stroke="blue" />
  <use href="#myCircle" x="10" fill="blue" />
  <use href="#myCircle" x="20" fill="white" stroke="red" />
  <!--
stroke="red" will be ignored here, as stroke was already set on myCircle.
Most attributes defined on <use> (except for `x`, `y`, `width`, `height` and `(xlink:)href)`
have no effect if the corresponding attribute is set in the referenced element.
That's why the circles have different x positions, but the same stroke value.
  -->
</svg>
```

以上述为例，两个use标签copy了circle的数据，并在其基础上进行了修改，我们需要通过查询到use节点，遍历每一个，通过href属性定位到其所复制的节点（```<circle/>```），
如果节点不是但标签的话就直接用其子节点替换use标签，反之则不进行操作。

---

第二步将dom整合成一个list，list中每一项都应该为Element属性，最后返回一个Element[] 的列表，可以通过每一项查询具体节点的位置。
此步骤的主要目的是查询当前宿主节点是否存在ShadowDom，如果存在存在则通过递归的形式将其添加到list项的后面，否则就不处理。

第三步对整合完成的Element[]列表进行遍历，对每一个函数执行 ```getLayersForElement``` ，去得到其具体参数。
在构建Layer的时候会具体涉及到以下几种判断：

- 判断是否被隐藏
- 判断是否为svg，并进行相应处理
- 判断是否为picture，并进行相应处理

如果判断为隐藏元素，则直接返回空数组结束函数，反之则继续判断是否为svg，通过函数判断将其到处的layer直接添加到集合数组中。
继续判断是否为picture标签

```html
  <picture>
    <source/>
    <img/>
</picture>
```

对于一个上述的标签中，只需要img中的信息，其余全部都剔除掉（如果是picture和source就返回空数组结束函数，如果为img继续流程）。

之后通过检测当前元素不为空就进行最终的样式整合。通过```getBoundingClientRect```得到元素的边框和数据，通过判断宽高得到只要div被展示，
就分别计算其边框rgb值、线宽、阴影等，并整合进最终的结果集中。

上述步骤完成后，最后对文字节点解析处理，去获取其实际样式和一些特效，并解析整合，此过程是一些细节性修饰，不过多展开。

## 添加根节点和框架判断

上述步骤完成后，结果集layers数据就基本完成了，最后通过window.innerWidth和document.documentElement.scrollHeight获取页面的实际高度和宽度，整合出最外层节点，
unshift添加到数组顶部。

```js
  const root = {
      type: "FRAME",
      width: Math.round(window.innerWidth),
      height: Math.round(document.documentElement.scrollHeight),
      x: 0,
      y: 0,
      ref: document.body,
  };

  layers.unshift(root);
```

最后对htmlToMastergo第二个参数useFrame进行判断，如果为true则通过回溯将其整合成树，反之则直接返回layers列表，以上则完成所有的解析。







