
# 文件结构

html-to-MasterGo 插件的项目结构（特指解析html部分）：

```
.
├── lib
│   ├── inject.js      # 解析插件主入口
├── html-to-mastergo
│   ├── frames.js      # 构建dom结构所需要依赖
│   ├── images.js      # 处理图片所需依赖
│   ├── index.js       # 插件主函数
│   ├── nodes.js       # 处理Element节点所需依赖
│   ├── object.js      # 工具函数
│   ├── parser.js      # 正则化处理函数
│   ├── styles.js      # 处理样式
│   ├── svg.js         # 处理SVG
│   └── text.js        # 处理文字节点所需依赖
├── layer              # 测试文件
│   └── HomePage.js    # 测试用的展示界面，需要在react环境下使用
├──package.json        
└──README.md

```
