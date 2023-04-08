---

order: 3

---



# 总体设计说明书

---

## 设计目标

Envelope 低代码整合平台通过集成三大低代码引擎来满足用户多种多样的低代码需求。其中主要分为：原生引擎、Lowcode-Engine引擎二次开发、AntV图引擎二次开发。

对于原生引擎，需要完成设计器布局，物料的二次开发，低代码核心引擎的开发，对原生UI框架的开发以及测试，对后续文档的编写工作。

对Lowcode-Engine引擎需要完成的是基础工具包集成，再次基础上进行插件开发，实现物料注入，设计器嵌入等功能。

对Antv图设计器需要完成基础引擎集成，再次基础上实现自定义功能，实现流程图、E-R、UML等图形的绘制设计器。

**接下来将着重介绍原生引擎的设计思路，对于Lowcode Engine，我们的开发完全参照阿里开源的Lowcode Engine官网手册，这里不在进行过多展开；对于AntV图引擎，我们调用绘制接口，但是控制器，头部控制栏，状态管理均使用原生引擎的核心部件，因此只着重介绍原生渲染引擎，对于AntV的封装部分，其API接口以及设计思想在AntV X6引擎官网均有介绍，不做过多展开与赘述。**

## 原生低代码引擎

原生引擎的设计理念是针对需求日益增长的移动端设备。与移动端相对于的是大屏幕显示设备，以此为代表的不同规格的PC显示器要求Web应用有良好的响应式布局能力以适应不同规格与尺寸的显示器，而H5移动端，虽然不同型号的手机屏幕尺寸各有不同，但是相较于不同尺寸间的PC显示器，其差异微乎其微，也因此为原生低代码引擎的实现提供了现实支撑。

原生低代码引擎的核心任务是：
- H5移动端应用单页面
- App活动页面
- 富文本排布等场景

因此采用如同搭积木一样的设计方法，其导出的数据格式应该是列表，而不是嵌套类型。原生引擎将不提供类似查询元件Dom层级关系的功能，因为对于静态布局的单页面来说这是没有必要的。

原生低代码引擎应该有两个核心技术，其一是```动态载入```,其二是```渲染引擎```,动态载入依托于umi框架的```dynamic```技术，实现对元件的动态加载，而渲染引擎则对展示再画布的元件进行渲染，将实际样式与控制器联动起来。

但是以上两个核心技术都依托于数据，动态载入必须建立再元件的基础上，渲染引擎必须建立在风格统一的元件数据上，因此必须先规范原生引擎所使用的元件的数据规格。


### 元件数据格式

元件必须通过统一的规范，为了满足渲染引擎必须暴露出的参数有两个，一个是是用于规范用户控制器的约束，另一个是用于存储用户控制器修改后并最终传入给渲染引擎的约束。

**规范用户控制器的约束**指的是用户控制器应该允许用户修改具体哪一个属性的哪些参数，用于决定暴露组件哪些属性给用户操作。

**存储用户控制器修改后并最终传入给渲染器引擎的约束**指的是，组件原本默认的样式以及属性，和用户通过控制器修改具体部分属性或样式后，两者相互整合所生成的最终传递给渲染引擎进行渲染的数据。

同时为了满足**出码**功能，应该通过loader导出对于组件的实际源码，便于出码模块进行处理。


为此对每个元件的约束至少应该如下：

- **editData** 传递给用户控制器的约束，为列表类型
- **config** 存储属性参数以及样式信息，为字典类型（JSON）
- **templateStr** 存储对于实际元件的源代码，为string类型

之后对上述属性进行进一步规范，editData属性中存储为字典类型，但是必须先规范用户可以进行的所有操作类型，这里进行如下列举：

- 文本框输入（Text）
- 富文本输入（RichText）
- 选择（Select，Radio）
- 判断（Switch）
- 输入数字（Number）
- 颜色选择（ColorPicker）
- 录入列表数据（DataList）
- 上传（Upload）


以上操作包含了用户可以进行的所有操作，同时也是元件属性对应的所有类型操作。如Text文本框输入操作、RicheText富文本输入操作属于一类，用于应对需要传递string类型的操作。Select、Radio选择操作，用于在某个属性的多个值中选择一个。如Switch判断组件用于处理布尔类型的属性。

综上所述，上述组件囊括了组件属性的全部操作类型，其中基础类型是Text、RichText、Select、Radio、Switch、Number、ColorPicker，后续DataList、Upload均为组合类型，是使用多个基础类型负责而成，来完成较为复杂的数据录入操作。


其中对于所有属性都必须包括的属性为```key, name, type```，以下将展示所有**基础类型的数据列表**



- **Text**

**ITextConfigType**

| 属性 | 类型 | 备注 |
| --- | --- | --- |
| key | string | 必填 |
| name | string | 必填 |
| type | 'Text' | 必填 |
| placeholder | string | 选填 |




- **RichText**

**IRichTextConfigType**

| 属性 | 类型 | 备注 |
| --- | --- | --- |
| key | string | 必填 |
| name | string | 必填 |
| type | 'RichText' | 必填 |



- **Select, Radio**

**```ISelectConfigType<KeyType>```**, **```IRadioConfigType<KeyType>```**

> **注：** Select和Radio功能完全一样，区别在于显示方式，Select以下拉框展示数据，而Radio以平铺的形式展示数据。如果数据项条目少可以选择Radio，反之选择Select。
> 下述数据字典中type类型应该更具实际组件来编写，如Select那么type就为'Select',反之同理。

| 属性 | 类型 | 备注 |
| --- | --- | --- |
| key | string | 必填 |
| name | string | 必填 |
| type | 'Select' | 'Radio' | 必填 |
| range | Array | 必填 |


Array对于的字典类型

| 属性 | 类型 | 备注 |
| --- | --- | --- |
| key | ```KeyType``` | 必填 |
| text | string | 必填 |



- **Switch**

| 属性 | 类型 | 备注 |
| --- | --- | --- |
| key | string | 必填 |
| name | string | 必填 |
| type | 'Switch' | 必填 |


- **Number**

**INumberConfigType**

| 属性 | 类型 | 备注 |
| --- | --- | --- |
| key | string | 必填 |
| name | string | 必填 |
| type | 'Number' | 必填 |
|range| [number, number] | 选填| 
|step|number|选填|


- **Color**

**IColorConfigType**

| 属性 | 类型 | 备注 |
| --- | --- | --- |
| key | string | 必填 |
| name | string | 必填 |
| type | 'Color' | 必填 |


- **DataList**

**IDataListConfigType**

| 属性 | 类型 | 备注 |
| --- | --- | --- |
| key | string | 必填 |
| name | string | 必填 |
| type | 'DataList' | 必填 |
| cropRate | number | 选填|

- **Upload**

**IUploadConfigType**

| 属性 | 类型 | 备注 |
| --- | --- | --- |
| key | string | 必填 |
| name | string | 必填 |
| type | 'DataList' | 必填 |
|isCrop|boolean|选填|
| cropRate | number | 选填|

---

以上是对用户控制器的参数约束，应该以可选列表的形式传递给editData属性，而config属性对应的是实际元件需要暴露的属性，应该根据实际需要封装的元件具体分析，这里以下属元件进行分析。

```
interface IProps{
    color: 'white' | 'black';
    size: 'mini' | 'tiny' | 'small' | 'medium' | 'big' | 'large' |'massive';
    danger: boolean;
    text: string;
}

export const Componet = (props:IProps) => {...};
```

假设上述元件接受color、size、danger、text四个属性，那么我们传递给用户控制器的约束应该包含四个参数的具体类型，而分析得来color、size均为枚举类型，应该在Select以及Radio中选择，但是为了必选同类组件多次渲染，这里使用Select（选择Radio会导致size属性需要渲染的子项过多，导致样式坍塌）。而danger为boolean类型因此选择Switch类型约束，而text为string，需要判断是Text还是RichText，这里假设为Text类型约束。

因此最后元件封装后导出的实际约束应该为

```
type TComponentColor = 'white' | 'black';
type TComponentSize = 'mini' | 'tiny' | 'small' | 'medium' | 'big' | 'large' |'massive';

type TComponetEditData = Array<
    ISelectConfigType<TComponentColor> |
    ISelectConfigType<TComponetSize> |
    ISwitchConfigType |
    ITextConfigType
>

interface IComponentConfig {
    color: TComponentColor;
    size: TComponentSize;
    danger: boolean;
    text: string;
}

interface IComponentSchema{
    editData: TComponetEditData;
    config: IComponentConfig;
    [key:string]:any; //用于存储元件源码，对应templateStr
}
```

以上便是最终元件的数据约束，元件的数据分配应该遵循上述接口。并且在实际开发中实现它并暴露出去。

最后我们需要为每一个元件实现一个schema数据，包含完整的用户控制器约束，默认渲染的元件属性参数，以及元件源码。因此上述例子的最终产出的完整JSON数据应该为：

```
type TComponentColor = 'white' | 'black';
type TComponentSize = 'mini' | 'tiny' | 'small' | 'medium' | 'big' | 'large' |'massive';

type TComponetEditData = Array<
    ISelectConfigType<TComponentColor> |
    ISelectConfigType<TComponetSize> |
    ISwitchConfigType |
    ITextConfigType
>

interface IComponentConfig {
    color: TComponentColor;
    size: TComponentSize;
    danger: boolean;
    text: string;
}

interface IComponentSchema{
    editData: TComponetEditData;
    config: IComponentConfig;
    [key:string]:any; //用于存储元件源码，对应templateStr
}

const Componet: IComponentSchema = {
    eidtData: [
        {
            key: 'color',
            name:'颜色',
            type:'Select',
            range:[
                {
                    key:'white',
                    text:'白色'
                },
                {
                    key:'black',
                    text:'黑色'
                }
            ]
        },
        {
            key: 'size',
            name:'尺寸',
            type:'Select',
            range:[
                {
                    key:'mini',
                    text:'mini'
                },
                {
                    key:'tiny',
                    text:'tiny'
                },
                {
                    key:'small',
                    text:'small'
                },
                {
                    key:'medium',
                    text:'medium'
                },
                {
                    key:'big',
                    text:'big'
                },
                {
                    key:'large',
                    text:'large'
                },
                {
                    key:'massive',
                    text:'massive'
                }
            ]
        },
        {
            key:'danger',
            name:'是否为危险样式',
            type:'Switch'
        },
        {
            key:'text',
            name:'输入文本...',
            type:'Text'
        }
    ],
    config:{
        color:'black',
        size:'medium',
        danger: false,
        text: '这是初始文本'
    },
    templateStr
}

export default Component;
```

上述则是一个完整的元件所需要的数据约束，实际导出的文件中editData为用户控制器约束，key值对应需要操作属性的名字，name对应在控制上显示的名字，type则固定为渲染的控制器类型。

而config表示实际传递的接口参数数据，也是当低代码元件第一次被挂载后显示的默认样式。

最后templateStr是通过loader导出的元件源代码，供出码模块使用，以生成最终可以打包导出下载的组件源码。


### 核心技术一： 动态载入

设计动态载入之前，需要明确Envelope项目的框架，项目采用```umi.js```框架，此框架为阿里开源的React脚手架，其中以通过约定、自动生成代码和解析代码等方式来辅助开发而著名。

在详细介绍动态载入功能之前，需要先了解React框架的组件渲染机制，当页面上某个组件数据发生变动之后，React框架将会对拥有此数据的组件以及此组件中的所有子组件进行重新渲染，也就是从父组件向下渲染。这种渲染方式可以保证页面的数据准确，但也会造成极大的性能开销。特别是低代码页面中，如果用户通过用户控制器修改部分属性参数后，当画布监听到属性改变判断需要执行重新渲染之后，将会导致一系列不必要的渲染，这会导致极大的性能开销，甚至可能导致系统卡死。

分析我们的系统有两处会导致这种大批量的渲染，其一是低代码元件展示标签页，将会一次性展示10余个组件的预览图，如果直接挂载组件，那么一次渲染将会造成恐怖的开销。其二是用户控制器中参数变动导致画布中挂载组件重渲染。

而umi框架中提供了**dynamic**接口，其常见使用场景是：组件体积太大，不适合直接计入 bundle 中，以免影响首屏加载速度。例如：某组件 HugeA 包含巨大的实现 / 依赖了巨大的三方库，且该组件 HugeA 的使用不在首屏显示范围内，可被单独拆出。这时候，dynamic 就该上场了。而dynamic内部封装了使用一个异步组件需要做的状态维护工作，开发者可以更专注于自己的业务组件开发，而不必关心 code spliting、async module loading 等等技术细节。

这种按需导入的方式为我们提供了良好的实现思路，大批量的组件在首屏载入的时候如果发生延时或者阻塞，那么将会以loading加载图表的形式显示，从而减少了首屏打开的开销。

同时为了减少标签页的渲染次数，每个组件展示的时候应该以图片的形式展示。


[![ppouMm4.md.png](https://s1.ax1x.com/2023/04/06/ppouMm4.md.png)](https://imgse.com/i/ppouMm4)


上述流程分析中，当用户拖拽后调用动态引擎中的DynamicFunc方法，从而按条件生成组件。这里面有两个核心思路：一是**按需加载**，只加载当前画布需要展示的组件的样式，减少载入以及开销；二是**监听参数变化，减少渲染次数**，DynamicFunc方法使用钩子函数memo包裹，让钩子函数去监听组件中是否有值发生变化，如果没有变动，那么父组件重新渲染的时候就不进行没有必要的渲染。

核心难点按需加载需要使用es6的新特性```import()```,并且函数是```await async```关键字进行异步编程的，当组件没有准备好的时候就会显示加载logo，这样在载入如video等重型组件的时候也不会显得突兀。

以此为了满足动态导入的需求，应该对二次封装的组件文件夹进行规范。以下是动态载入的一段示例代码：

```
const { default: Graph } = await import(
        `@/materials/absolute-${ui}/${componentsType}/${type}`
      );
```

上述代码表示，所有的组件都应该存在src下的materials中，并且以```absolute-*```的形式存储，而absolute-*文件夹下是不同元件的种类，以componentType表示，而type表示具体载入的元件的名称。

Envelope封装Antd、Semantic以及原生组件，那么以Antd组件库为例子，一个规范的二次封装组件包结构应该如下：

```
- src
  - materials
    - absolute-antd
      - base 基础组件
        - Alert
        - Carousel
        - ...
      - control 控制组件
      - media 媒体组件
      - social 社交组件
    - absolute-semantic
      - ...
    - ...
  - layout
  - pages
  - ...
```

综上，其核心的DynamicFunc方法最终应该为：

```
const DynamicFunc = (type: string, componentsType: string, ui: string) => {
  return dynamic({
    loader: async function () {
      const { default: Graph } = await import(
        `@/materials/absolute-${ui}/${componentsType}/${type}`
      );
      const Component = Graph;
      return (props: DynamicType) => {
        const { config, isTpl } = props;
        return <Component {...config} isTpl={isTpl} />;
      };
    },
    loading: () => (
      <div>
        <Loader active inline="centered">
          组件载入中，请稍等...
        </Loader>
      </div>
    ),
  });
};
```
其中参数ui对应materials下一级包名absolute-*中对应的具体名称，absolute-antd就为antd，absolute-semantic就为semantic。而componentsType为二级包名，如base基础组件类型下的组件就传递base，而type自然就是三级包名，如Alert、Carousel等。三个参数的传递均有DynamicEngine控制，触发时机为用户点击拖拽元件标签栏到画布上时触发。


### 核心技术二：渲染引擎


一个成熟的低代码引擎在人机界面上至少需要包括以下几个部分：**组件展示标签栏，用户控制器，画布**。其上三个部分可以统称为**设计器部分**，之后对于数据变化的监听、数据的整合、数据的处理部分，我们称之为**数据模型部分**。以上两个是一个低代码引擎最基础的核心功能，也是必须具备的能力。下图是Envelope的用例图，一定程度上也反映了渲染引擎的工作原理。

[![pp7zpY4.md.png](https://s1.ax1x.com/2023/04/08/pp7zpY4.md.png)](https://imgse.com/i/pp7zpY4)


接下来将对设计器以及数据模型设计进行详细讲解。下图是设计器部分的简单布局，设计器主页面为上-中-下布局，分为标头栏和设计器容器，标头栏中存放 重做、撤销、导出JSON数据、出码、预览、保存模板 功能。设计器容器内部为左-中-右布局，从左到右依次为 **组件展示标签栏**，**画布**，**用户控制器**


[![ppo1FJA.md.png](https://s1.ax1x.com/2023/04/06/ppo1FJA.md.png)](https://imgse.com/i/ppo1FJA)



可以了解到，Envelope原生引擎的核心组件一共有以下几个部分：**负责控制组件渲染的ViewRender**、**负责校准的Calibration**、**负责基础操作的HeadComponet**、以及**负责用户控制器逻辑的FormEditor**。


- **ViewRender**

ViewRender的实现并不困难，但关键是需要整合动态载入技术并且完成对组件的拖拽以及自动布局。这里选择的技术是 ```react-grid-layout```, 这是非常优秀的React组件库，通过hook函数实现挂载节点的拖拽交互。使用```<ReactLayout/>```标签包裹需要展示的组件，并且将配置中config数据注入到元件中，将ui、componentType和type注入到DynamicEngine中。

同时为了减少不必要的开销，组件的封装必须按照以下规范：

```
interface IComponentProps extend IComponentConfig{
  isTpl: boolean;
}

export const Component = (props: IComponentProps) => {
  return(
    <>
    {isTpl && <Image src={...}/>}
    {!isTpl && <div>{children}</div>}
    </>
  )
}
```

其中IComponentConfig为组件schema约束中config属性的具体约束，也就是当前暴露出去的组件的实际属性约束，再次基础上添加isTpl属性，用于判断当前组件是预览模板还是实际渲染的组件。当isTpl为false表示在组件预览标签栏中，则显示预览图片；当isTpl为true，则表示组件以及挂载在画布上，或组件处于展示状态，则需要加载实际的真实元件。

回到ViewRender，ViewRender应该接受关于拖拽逻辑，以及需要渲染的组件数据，这里使用pointData表示，pointData是决定传递给动态引擎渲染的数据，而ViewRender接受的其他数据最后都是传递给ReactGridLayout属性来支撑拖拽功能。


```
 return (
  <ItemWrapper key={value.id} data-grid={value.point}>
    <DynamicEngine isTpl={false} {...(value.item as any)} ui={ui} />
  </ItemWrapper>
);
```

上述是ViewRender最终返回的代码，这里对动态引擎的赋值应该约束为false，因为默认是给画布展示使用，ui赋值给当前ui，因为是后续添加，所以并没有设计在value的值中。其余属性通过可变参数的形式统一传递给动态引擎。


对于ViewRender最好的使用就是**组件展示标签栏SourceBox**和**画布实际渲染者TargetBox**， 解析SourceBox和TargetBox之前，必须先理解其实现原理，ViewRender其数据模型中存储两个必须的值为pstate和cstate，cstate存储当前挂载在画布上的节点信息，而pstate表示上一步操作时存储的节点信息，这么做的目的时实现撤销以及重做逻辑。

两个state的数据格式应该一致，都存储点数据集（列表），以及当前选中节点信息。其数据字典如下：

| 名称 | 类型 | 备注 |
| ---|---|---|
|pointData|Array|必填|
|curPoint|any|必填|

pointData数据字典约束为：

| 名称 | 类型 | 备注 |
| ---|---|---|
|id|string|必填|
|item|any|必填|
|point|any|必填|
|isMenu|boolean|可选|


pointData中id表示当前挂载元件的key值，为uuid自动分配，item为需要传递给当前元件的实际属性值，point为当前元件在画布上的相对位置信息，isMenu用于判断此时元件是否为预览状态，也就是对应元件的isTpl，用于判断是元件是用于组件展示标签栏显示预览图片，还是用于画布渲染真实组件。


之后应该传递给ViewRender中拖拽组件需要的数据，如画布信息、画布缩放大小、拖拽状态、拖拽执行的逻辑函数等，以及数据仓库的操作函数等。

ViewRender完整的约束如下：

| 名称 | 类型 | 备注 |作用|
| ---|---|---|---|
| pstate | object | 必填|上一状态存储的元件数据|
|cstate|object|必填|当前状态存储的元件数据|
|scaleNum|number|必填|当前画布的缩放大小|
|canvasId|string|必填|当前画布索引，用于匹配模板|
|allType|string[]|必填|元件四大类型，用于传递给动态引擎的componentType|
|dispatch|Dispatch|必填|dva数据操作|
|dragState|{x:number,y:number}|必填|拖拽节点的位置信息|
|setDragState|any|必填|当拖拽节点时的回调函数|
|ui|string|必填|当前ui框架名称，用于传递给动态引擎的ui属性|

其中pstate和cstate供dva使用，用于控制撤销重做等操作，同时保证元件数据的准确性。scaleNum、canvasId、dragState、setDragState应该传递给拖拽组件，而allType、ui用于传递给ViewRender，并由ViewRender自动注入到动态引擎中实现动态导入。

来到TargetBox和SourceBox，两者分工明确，SourceBox控制侧边栏渲染，其应该是渲染图片，因此传递给组件的isTpl均为true；而TargetBox控制画布中实际挂载的组件渲染，那么它传递给组件的isTpl均为false，两者均由动态引擎（Dynamic Engine）自动注入。


在SourceBox中，必须提供菜单供用户预览组件，所以Menu是必须的，但是对于Web端低代码而言，必须屏蔽用户不必要的操作，或者用户误操作，如鼠标右键点击。这里使用```react-contexify```中的Menu组件来实现，提供Menu菜单预览，同时屏蔽用户鼠标操作，防止用户误操作导致系统产生意想不到的进程。

SourceBox中每一个元件的最终层次结构应该为：

```
<Draggable>
  <div className='canvasBox'>
    <MenuProvider id="menu_id">
      <div ref={ref}>
        <ViewRender />
      </div>
    </MenuProvider>
  </div>
</Draggable>
```

最外层的Draggable是```react-draggable```中导出的可拖拽组件，通过组件包裹的形式实现组件的拖拽，名为canvasBox的div标签是显示盒子，组件将以Box的形式展示出来，这里的canvasBox就是调整展示盒子的样式，MenuProvider是```react-contexify```的组件，用于控制Menu的行为，ViewRender外层的的div必须挂载ref属性，这是组件本身的回调，React框架通过ref找到当前元件在画布上挂载后的真实节点，从而调整其数据以及位置。

需要注意ViewRender本质上只是一个壳，从上述核心代码中我们可以知道，最后ViewRender返回的HTML标签最内部是一个```DynamicEngine```,而从动态引擎组件中可知，动态引擎调用```DynamicFunc```最后返回的是当前组件的实例。所以上述代码在**逻辑**上最后应该呈现为：

```
<Draggable>
  <div className='canvasBox'>
    <MenuProvider id="menu_id">
      <div ref={ref}>
        <DynamicEngine>
          <DynamicFunc>
            <Component isTpl={true} {...attr}>
          </DynamicFunc>
        </DynamicEngine>
      </div>
    </MenuProvider>
  </div>
</Draggable>
```

而在实际HTML结构中```<DynamicEngine>```和```<DynamicFunc>```是不存在的，而是一系列异步操作，最后返回的就是当前的整合后的Component组件的实际Dom数据，那么拿到挂载ref的div真实数据后，就等于拿到了当前组件的真实数据值，那么所有的拖拽回调、数据仓库的订阅以及数据修改都可以通过ref作用到实际组件Component中。

而在具体的SourceBox中，只需要控制组件展示栏的渲染，那么isTpl就会统一赋值为true，这样在实际组件渲染中就会渲染Image图片，从而减少一定的开销。

理解了SourceBox，来到画布实际渲染者TargetBox，那么理解TargetBox就会很简单，这是大同小异的东西，实质上就是isTpl自动配置为false。唯独指的注意的时候是，在TargetBox中需要完成对拖拽执行逻辑函数的具体逻辑，因为挂载在TargetBox上的组件必然是应该被拖拽到画布上的组件，所以在画布上新添组件或者拖拽组件实现换位，都会导致节点位置信息发生变动。所以这里需要对之前提到的pointData中的具体item信息进行解析。

上述表格中说到item就是实际节点信息，其具体来自于schema文件，约束如下：

|名称|属性|备注|
|---|---|---|
|type|string|当前元件的名称，如Alert、Carousel等|
|h|number|当前元件的高度|
|config|object|元件的实际属性值，schema中的config值|
|editDataEl|Array|用户控制器的约束，schema中的editData值|
|templateStr|string|出码模块使用的元件源码，schema中的templateStr值|
|category|string|元件的种类，如base，control等|
|x|number|画布相对位置左上角点的位置|

上述数据为item的具体类型，因为是传递进去的值都是确定的，所以不存在缺省的情况，也就没有必要进行数据约束。

之后最重要的是将从父组件Container中取得数据（props）解析后拟合初始值，并传递给```react-draggable```中的钩子函数useDrag来实现拖拽的逻辑操作。

其核心代码为：

```
const [{ isDragging }, drag] = useDrag({
  item: {
    type: item.type,
    // @ts-ignore
    config: antdSchema[item.type as keyof typeof antdSchema].config,
    h: item.h,
    // @ts-ignore
    editableEl: antdSchema[item.type as keyof typeof antdSchema].editData,
    templateStr: antdSchema[item.type as keyof typeof antdSchema].templateStr,
    category: item.category,
    x: item.x || 0,
  },
  collect: (monitor) => ({
    isDragging: monitor.isDragging(),
  }),
});
```

最后将其挂载在ref上实现对画布节点的实时监听，并通过dva实现数据的上报以及修改，打到各个系统之间的数据联动，实现一致性、准确性。

- **Calibration**

Calibration是校准模块，负责对画布中挂载的模块进行位置校验以及调整。具体场景为：

- 当组件拖拽到屏幕上后，提供红色预览框显示部署后位置
- 当两个组件贴近时，自动吸附
- 当单个组件长度不满时，自动居中


校准类的核心功能是生成一个预览div，在拖拽组件还没有完全部署在画布上时提供位置信息的预览，对于预览的时机则为**鼠标放置在画布上，还没有松开的时候**。这段时间组件在画布上会有一个淡粉的预览边框，显示其渲染出来的位置大小，以及边框距离，此时的信息也是组件最终会渲染在画布上的最终位置。当组件处于被拖拽时，就会显示这个位置预览框。

**位置预览框**的实现思路是通过document的createElement动态创建的，这里就需要用到之前传递给元件的ref属性，当ref真实节点中current为true时候则判断组件位于画布上，组件被渲染，此时动态创建预览框div，命名为```createSpan```，创建成功后将对createSpan提供一些默认的样式，如background-color、display、justify-content，用于传递默认的样式属性，其后为其动态赋予classname，以通过全局样式调整其额外的样式。

Calibration校准模块中最核心的功能是监听当前用户鼠标动作，当用户鼠标长按具体元件后，当前元件的拖拽回调被触发，自动监听三种动作（鼠标长按拖拽中元件的移动方向direction）：

- left
- right
- up

其中up为基础操作，当用户控制下的元件预览框高度超过上一个元件的一半时，触发拖拽监听函数，触发useDrag回调，先将当前cstate数据存储到pstate中，并开始修改cstate中curPoint中数据的信息，调整当前控制节点curPoint到当前超过节点的前面。更具修改完成的cstate数据更新画布。当用户鼠标抬起，则拖拽监听函数结束，自动销毁createSpan。

当direction的值为left和right时，两类操作的处理几乎一致，均表示监听到用户控制下的拖拽元件在水平方向左右移动，一般是控制元件的左右留白位置，则使用内边距padding控制，因为是在行内移动，所以此时生成的createSpan则是**span**标签，并且其动画表现通过transform控制。


- **HeadComponent**

负责基础操作的HeadComponet是对设计器的补充，提供了很多基础和拓展操作，如导出JSON schema数据，撤销操作，重做操作，预览操作，出码操作。其布局和设计器整体成上-中-下排列，通过对cstate操作达到控制画布或者产出文件的功能。

这里必须先提到我们的数据处理模块，也就是我们的数据仓库dva。dva是一个基于```react```和```react-saga```的数据流方案，为了简化开发流程体验，dva还额外内置了```react-router```和```fetch```。

dva本质上十redux的升级版，提供了更加模块化，更加全面的数据管理功能。本质上还是提供了数据仓库，并通过组件上报以及组件订阅的方式实现数据流动。

[![ppTDmtI.jpg](https://s1.ax1x.com/2023/04/07/ppTDmtI.jpg)](https://imgse.com/i/ppTDmtI)

上图是redux的流程图，也可以认为是dva的流程图。必要的组件是ActionType操作的类型、Action操作的具体执行逻辑、Store数据仓库。如在一个数据流的操作中，组件A中某一个参数值发生变化，需要传递给组件B进行更新，react的节点MVC结构，在不同层级下的组件必须一级一级上传通过父组件传递，这会导致代码臃肿，可读性差、可维护性差。

但是通过Redux，则可以越过这种父子组件中的消息传递机制，直接通过数据仓库上报与订阅，实时拿到最新的值。在上述例子中，传统方法下假使组件A和组件B挂载在父组件C下，那么A的值必须通过父组件C传递给A的方法中上报，并通过父组件C再次转发给组件B，这样不但流程臃肿，同样A的信息传递给C的时候，导致C的值变化，即有可能导致父组件C也进行了一次不必要的渲染。

而在Redux下，组件A的值假设发生UPDATE操作，那么封装json，传递类型与当前值，在数据仓库store监听到数据操作请求的时候就其打包传递给Reducers，根据ActionType类型，对数据执行相对于的操作，并将修改好的数据重新存储进数据仓库。此时组件B通过getState函数监听数据仓库变化，当自己需要的值变动时，就从仓库中订阅新的值。


[![pp7bKE9.md.png](https://s1.ax1x.com/2023/04/08/pp7bKE9.md.png)](https://imgse.com/i/pp7bKE9)


在一个dva项目中以下几个概念尤为重要：

**model** 是 DVA 中最重要的概念,其中有namespace命名空间，用于表示当前初始值的state，处理同步操作的reducers，用于处理异步操作和逻辑业务操作的effects，以及触发器action。

在实际react项目中，状态管理一致都是一个十分困难事情，但是dva允许把state上提到所有的React子组件中，其过程类似：
- 页面通过调用 dispatch 函数来驱动 dva model state 的改变；
- 改变后的 dva model state通过 connect 方法注入页面。

而这里就是用dva中**connnect**将两者连接起来，dva中的connect采用的是装饰器写法，所谓装饰器，就是给装饰对象赋予它本来不具备的能力。而connect的存在，就是为了让组件获取两样东西：model中的数据，驱动model改变的方法。
connect 接收两个参数，做的就是这两件事：
- mapStateToProps：获取model中的数据
- mapDispatchToProps：驱动model改变的方法

**dispatch** 函数就是和 dva model 打交道的唯一途径。 dispatch 函数接受一个 对象 作为入参，在概念上我们称它为 action，唯一强制要包含的是 type 字段，string 类型，用来告诉 dva 我们想要干什么。

我们把想做的事情通过 **action** 描述出来，并通过 dispatch 告诉 dva model，随后又dva对其进行数据操作。
dva model 中可以定义一个叫做 **reducers** 的成员用来响应 action 并修改 state。每一个 reducer 都是一个 function，action 派发后，通过 action.type 被唯一地匹配到，随后执行函数体逻辑，返回值被 dva 使用作为新的 state。state 的改变随后会被 connect 注入到组件中，触发视图改变。


而Envelope低代码整合平台严格参照上述思想，使用dva进行状态管理，定义```editorModal```作为我们的dva数据模型，其state默认值也就是我们提到的当前数据cstate中的pointData和curPoint。在具体的reducers中定义具体的增删改查操作。

以修改画布中元件数据为例:

```
export default{
  namespace:'editorModal',
  state:{
    pointData: JSON.parse(pointData),
    curPoint: null
  },
  reducers: {
    modPointData(state, { payload }) {
      const { id } = payload;
      const pointData = state.pointData.map((item) => {
        if (item.id === id) {
          return payload;
        }
        return { ...item };
      });
      overSave('userData', pointData);
      return {
        ...state,
        pointData,
        curPoint: payload,
      };
    },
  }
}
```

上述dva modal定义中在分发函数reducers中添加modePointData函数，**当用户从组件预览侧边栏中选择具体组件，并且通过鼠标左键点击拖拽到画布上直至抬起鼠标后，组件最外层的useDrag钩子函数被触发，通过dispatch上报dva进行数据处理操作。**

在useDrag钩子函数中

```
const dragStop: ItemCallback = useMemo(() => {
    return (layout, oldItem, newItem, placeholder, e, element) => {
      const curPointData = pointData.filter((item) => item.id === newItem.i)[0];
      dispatch({
        type: 'editorModal/modPointData',
        payload: { ...curPointData, point: newItem, status: 'inToCanvas' },
      });
    };
  }, [cpointData, dispatch, pointData]);
```

当监听停止时，从当前pointData中整合出需要的数据curPointData，并通过disptach上报，类型为命名空间editorModal中reducers触发器中的modPointData函数，并将curPointData以及其余数据通过payload传递过去。

当reducers中对应方法接受到请求后，则通过数据中当前元件的id找到curPoint列表中对应的数据项，对齐修改后重新整合进curPoint并返回给cstate保存最新值。

介绍完状态管理系统，就可以很好的理解HeadComponent进行的操作，通过dispatch上报请求和数据，在dva modal中进行修改，完成后再通过connect通路返回给需要的组件，以保证HeadComponet中按钮和画布数据的实时联动。


[![pp7OYuT.md.png](https://s1.ax1x.com/2023/04/08/pp7OYuT.md.png)](https://imgse.com/i/pp7OYuT)

上图展示HeadComponent组件，从左到右以此通过保存模板，撤销操作，重做操作，导出JSON，上传模板，舍弃模板，清空模板，预览操作，导出代码以及登录功能。之后将对主要的操作进行dva上报设计。

**保存表单**：
```
dispatch({
  type: 'editorModal/modPointData',
  payload: { ...curPoint, item: { ...curPoint.item, config: data } },
});
```

**清空数据**
```
dispatch({ type: 'editorModal/clearAll' });
```

**删除组件**
```
dispatch({
  type: 'editorModal/delPointData',
  payload: { id },
});
```

**导入模板**
```
dispatch({
  type: 'editorModal/importTplData',
  payload: data,
});
```

**复制组件**
```
 dispatch({
  type: 'editorModal/copyPointData',
  payload: { id: pstate.curPoint.id },
});
```

**拖拽**
```
dispatch({
  type: 'editorModal/modPointData',
  payload: { ...curPointData, point: newItem, status: 'inToCanvas' },
});
```

其中dva部分核心代码，如reducers分发函数如下：

```
reducers: {
    addPointData(state, { payload }) {
      let pointData = [...state.pointData, payload];
      overSave('userData', pointData);
      return {
        ...state,
        pointData,
        curPoint: payload,
      };
    },
    modPointData(state, { payload }) {
      const { id } = payload;
      const pointData = state.pointData.map((item) => {
        if (item.id === id) {
          return payload;
        }
        return { ...item };
      });
      overSave('userData', pointData);
      return {
        ...state,
        pointData,
        curPoint: payload,
      };
    },
    importTplData(state, { payload }) {
      overSave('userData', payload);
      return {
        ...state,
        pointData: payload,
        curPoint: null,
      };
    },
    copyPointData(state, { payload }) {
      const { id } = payload;
      const pointData = [];
      state.pointData.forEach((item) => {
        pointData.push({ ...item });
        if (item.id === id) {
          pointData.push({ ...item, id: uuid(6, 10) });
        }
      });
      overSave('userData', pointData);

      return {
        ...state,
        pointData,
      };
    },
    delPointData(state, { payload }) {
      const { id } = payload;
      const pointData = state.pointData.filter((item) => item.id !== id);
      overSave('userData', pointData);
      return {
        ...state,
        pointData,
        curPoint: null,
      };
    },
    keyboardCopyPointData(state) {
      if (state.curPoint) {
        const { id } = state.curPoint;
        const pointData = [];
        state.pointData.forEach((item) => {
          pointData.push({ ...item });
          if (item.id === id) {
            pointData.push({ ...item, id: uuid(6, 10) });
          }
        });
        overSave('userData', pointData);

        return {
          ...state,
          pointData,
        };
      }
      return state;
    },
    keyboardDelPointData(state) {
      if (state.curPoint) {
        const { id } = state.curPoint;
        const pointData = state.pointData.filter((item) => item.id !== id);
        overSave('userData', pointData);
        return {
          ...state,
          pointData,
          curPoint: null,
        };
      }
      return state;
    },
    clearAll(state) {
      overSave('userData', []);
      return {
        ...state,
        pointData: [],
        curPoint: null,
      };
    },
  },
```

- **FormRender**

用户控制栏的核心FormRender相比之下其实并不难实现，并没有太多的算法以及设计要点，主要是对解析出来的schema数据进行匹配，通过type渲染对应的组件。我们封装的Ant Design的一些基础组件，作为核心的通用样式，这些组件不会暴露出去，只能在Envelope内部作为基础组件使用，其组件类型对应先前封装的editData类型。

- card-picker 选择器
- color-picker 色彩选择器
- data-list 列表编辑器
- editable-table 表格编辑器
- form-item 表单编辑器
- multi-text 文本输入框
- picture-wall 图片墙
- pos 点选择器
- x-editor 富文本编辑器

当Envelope被启动后，会读取本地的数据，此后保存到cstate和dva作为初始数据，当前的cstate会被分别送进ViewRender做画布渲染以及FormRender进行用户控制器渲染，用户控制器的渲染则由具体元件的editData约束决定，列如当前选择组件Component，那么则渲染对应组件Componet的schema文件中的类只想，将config送进ViewRender渲染画布，将editData送进FormRender渲染控制器，如editData中存在color属性，允许用户输入rgb值，那么FormRender根据editData中type值```'Color'```将渲染color-picker色彩选择器。

此后用户通过控制器修改属性，或者直接拖拽画布元件修改位置，都将通过dva保证数据和状态的一致性。

---

最后展示Envelope 原生渲染引擎的项目类图，


[![pp7XYRI.md.png](https://s1.ax1x.com/2023/04/08/pp7XYRI.md.png)](https://imgse.com/i/pp7XYRI)



### 主要技术：出码

Envelope 低代码整合平台的设计理念是低代码简化开发，并不是无代码，所以项目支持也推荐将低代码元件导出源码进行二次开发以及调整。

Envelope 的出码模块只要依赖以下三种技术：

- raw-loader导出源码
- 规范统一的二次封装格式
- 正则处理技术

先前提到schema时提到最后一个属性```templateStr```，这是一个string类型的属性，保存当前schema对应的元件的源码，而元件源码通过```raw-loader```直接导出，这是由loader自动完成的，并没有太多需要介绍的，唯独要说的时，此后必须将templateStr完全存储在cstate中，这种做法虽然会导致存储的数据过大，dva的处理后复制对象的开销变大，但是并不会产生额外依赖，而且不会有遗漏。

后续修改中我们将在组件的源码单独保存进了一个列表，当元件发生删减的时候才对此列表进行修改，通过对应的类型删除当前元件的源码，此列表正常保存在localStorage中，当用户点击出码按钮后才会尝试取出当前列表中的源码。

回到源码导出模块，出码模块作为低代码引擎的核心功能，被单独保存在```engine-core/code```包中，由主文件```saveJSCode.tsx```文件控制。

当用户点击出码后，引擎即刻调用saveJsZip函数，并传递当前cstate中的画布信息，由saveJsZip的templateStrObj参数接受。参数接收后进入出码流程，将对数据进行一系列正则处理。首先整合导出文件中主文件的属性，将其统一防止在datasource.js文件中。

其命名规则统一为```当前元件类型+当前元件id+DataSource```,由于id由uuid生成，所以可以保证即使是同类型的元件可不会重名，如当前传递的数据中存在两个同类型元件Button，其id分别为001和002，那么生成的属性名分别为 ```Button001DataSource``` 和 ```Button002DataSource``` 。

之后将最终属性样式config的值提取出来，通过```JSON.stringfy```操作直接转换为字符串，并通过一系列正则处理，传递对应的容器中，如上述Button001中存在属性color和size，那么生成的**导出属性**应该为：

```
export const Button0001DataSource = {
  color: 'red',
  size:' big'
}
```

上述操作则生成了datasource.js中所有元件的导出属性，以及主入口文件中对datasource中导出属性的导入，在对应主入口文件中最后会生成类似如下的导入：

```
import {
  Button001DataSource,
  Button002DataSource
} from './datasource.js';
```

之后将对元件源码进行处理，这里先提取之前存储的源码列表，此列表在存储前会对相同元素去重，所以可以保证列表中每子项的唯一性。下述源码范例：

```
import React, { FC, memo } from 'react';
import { IAlertConfig } from '@/materials/absolute-antd/base/Alert/schema';
import { Alert, Image } from 'antd';
import logo from '../../../../assets/absolute/Logo.png';

export interface IAlertPropConfig extend IAlertConfig {
  isTpl: boolean;
};

const AAlert: FC<IAlertPropConfig> = (props) => {
  const { isTpl, ...restProps } = props;
  const { message } = props;
  return (
    <React.Fragment>
      {isTpl && (<Image src={logo} alt="" />
      )}
      {!isTpl && (<Alert message={message} {...restProps} />)}
    </React.Fragment>
  );
};

export default memo(AAlert);
```

上述代码使用ts编写，但是打包文件后需要转换为js格式，所以对于ts中特有的特性写法必须删除，如interface约束，如FC，同时在组件内部```<Image/>```组件的src属性传递的logo是本地文件，当用户导出后并不存在，而打包的时候将本地图片文件打包进压缩包会导致压缩包体谅剧增，可能会造成传输压力，所以这里将统一改成显示默认的在线图片。

对源码的修改思路为，删除导入头中的schema文件导入以及logo图片导入，因为js文件没有类型约束，也没有非空校验，所以可以并不需要IAlertConfig约束，同时```:FC<IAlertPropConfig>```也是没有必要的，以此为基础```interface IAlertPropConfig extend IAlertConfig```就没有存在的必要。

对于schema、logo以及FC可以直接通过字符串匹配删除，但是interface接口约束却无法使用正则直接匹配，因为不同文件中约束编写不同，有的是interface，有的是extend继承写法，而且部分组件中为了满足特殊需求，可能不止isTpl一个属性，所以无法直接匹配，这里通过在所有的接口约束的头尾加上特殊字符做匹配,如：

``` ts
/*begin to delete*/
export interface IAlertPropConfig extend IAlertConfig {
  isTpl: boolean;
};
/*end to delete*/
```

此时通过正则匹配注释即可正确的删除接口约束。值得注意，上述代码是按顺序执行的同步代码，此后只需要在修改Image标签中的src属性为默认的在线图片url即可，由于代码顺序执行，所以到达这一步时，使用正则匹配logo后只会有这里一处，所以可以直接替换。

最后，修改完成的一个元件源码范例应该如下：
```
import React, { FC, memo } from 'react';
import { Alert, Image } from 'antd';

const AAlert = (props) => {
  const { isTpl, ...restProps } = props;
  const { message } = props;
  return (
    <React.Fragment>
      {isTpl && (<Image src={'......'} alt="" />
      )}
      {!isTpl && (<Alert message={message} {...restProps} />)}
    </React.Fragment>
  );
};

export default memo(AAlert);
```

最后按照画布数据的列表顺序，将其进行整合，使用```jszip```模块进行打包即可。下图为出码模块的流程图：

[![pp7xTYQ.md.png](https://s1.ax1x.com/2023/04/08/pp7xTYQ.md.png)](https://imgse.com/i/pp7xTYQ)
