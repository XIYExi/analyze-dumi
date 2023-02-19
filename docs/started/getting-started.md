
# Basic principle analysis

## Main

In ``` lib\index. js```, the function ```htmlToMastergo``` is the main entry function for parsing.
The parameters are the root label (root node) to be parsed, and whether to convert to Dom structure

After the function starts to run, it will determine whether the node passed in by the selector is an HTML element. 
If it exists, it will be used directly. If it exists, it will be used directly. 
If it does, it will be queried through the document. If it uses logical or in the selector, it will be judged.
If it exists, it will use the selector. Otherwise, it will use the body by default.

> Logical OR ( ```||``` ): If true in the front, return the front, and if false in the front, return the back.

```js
const element = selector instanceof HTMLElement
        ? selector
        : document.querySelector(selector || 'body');
```

## Element exists


First, process the SVG in the queried element.
There are ```<use/>``` tags in ```<svg/>``` in HTML5 standard.
You can get nodes from SVG documents and copy them to other locations. 
What you need to do is replace the use tag and display the copied content. 
For example, [WebApi interface document](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use) Medium
The basic use of use is given.

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

Take the above example, the two use tags copy the data of circle and modify it based on it.
We need to query the use node, traverse each node, and locate the node it copied (```<circle/>```) through the href attribute. 
If the node is not a label, it will directly replace the use tag with its child node, otherwise, we will not operate.

---

The second step is to integrate the dom into a list. 
Each item in the list should be an Element attribute. Finally, a list of Element [] is returned. 
You can query the location of specific nodes through each item.
The main purpose of this step is to query whether the current host node has a ShadowDom.
If it does, it will be added to the list item by recursion, otherwise it will not be processed.

The third step is to traverse the list of integrated elements [], 
and execute ```getLayersForElement``` for each function to get its specific parameters.
The following judgments will be involved when building a Layer:

- Judge whether it is hidden
- Judge whether it is svg and handle it accordingly
- Judge whether it is a picture and handle it accordingly

If it is judged to be a hidden element, it will directly return the empty array end function, otherwise, 
it will continue to judge whether it is svg, and the layer everywhere will be directly added to the collection array through the function judgment.
Continue to determine whether it is a picture label

```html
  <picture>
    <source/>
    <img/>
</picture>
```

For one of the above tags, only the information in img is needed, and all the rest are eliminated 
(if it is picture and source, return the empty array end function, if it is img, continue the process).

Then the final style integration is performed by detecting that the current element is not empty.
Get the border and data of the element through ```getBoundingClientRect```, 
and calculate the border rgb value, line width, shadow, etc. as long as the div is displayed by judging the width and height,
and integrate them into the final result set.

After the above steps are completed, 
the text node is finally parsed and processed to obtain its actual style and some special effects, and then parsed and integrated.
This process is some detailed modification, but it should be expanded.

## Add root node and frame judgment

After the above steps are completed,
the result set layers data is basically completed.
Finally, the actual height and width of the page are obtained through window.innerWidth and document.documentElement.scrollHeight, 
and the outermost node is integrated, 
and unshift is added to the top of the array.

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


Finally, judge the second parameter useFrame of htmlToMastergo. 
If it is true, it will be integrated into a tree through backtracking,
otherwise, it will directly return the layers list, and all the above parsing will be completed.





