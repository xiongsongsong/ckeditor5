# CKEditor 5 for CMS-CENTER

这个编辑器是针对CMS-CENTER单独构建的，对比官方的CKeditor 5，可能已经过时。

## 升级

定期和官方版本保持同步是一种美德。

### 准备工作
1. 复制 /ckeditor5/packages/ckeditor5-build-inline 到桌面。
2. 下载 [CKEditor Stable 分支](https://github.com/ckeditor/ckeditor5/tree/stable)最新代码。
3. 将刚刚复制出的文件夹，再覆盖回来。

### 生成构建

```bash
cd /ckeditor5/packages/ckeditor5-build-inline/
npm install
npm run build
```

## 在CMS-CENTER 中使用

将 build 文件夹构建产物放到OSS或任何网络位置,并修改 index.html 中的 src 地址。

## 为什么要自定义构建CKEditor

* CKEditor的插件列表中，并不包含插入video视频的功能，因此额外使用了 [ckeditor5-video](https://github.com/Technologie-Visao/ckeditor5-video) 这一个库。
* 这一个库的theme文件夹和src文件夹，被手动复制到了 /ckeditor5/packages/ckeditor5-build-inline/src 中，以方便自定义功能。