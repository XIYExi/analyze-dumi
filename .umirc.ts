import { defineConfig } from 'dumi';

const repo = 'analyze-dumi'

export default defineConfig({
  title: 'analyze-dumi',
  mode: 'site',
  // more config: https://d.umijs.org/config
  devServer: {
    port: 1998 // 自定义端口号
  },
  base: process.env.NODE_ENV === 'production' ? `/${repo}/` : '/',
  publicPath: process.env.NODE_ENV === 'production' ? `/${repo}/` : '/',
});
