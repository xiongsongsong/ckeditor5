/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// The editor creator to use.
import InlineEditorBase from '@ckeditor/ckeditor5-editor-inline/src/inlineeditor';

import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat.js';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code.js';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock.js';
import DataFilter from '@ckeditor/ckeditor5-html-support/src/datafilter.js';
import DataSchema from '@ckeditor/ckeditor5-html-support/src/dataschema.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor.js';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor.js';
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily.js';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize.js';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline.js';
import HtmlComment from '@ckeditor/ckeditor5-html-support/src/htmlcomment.js';
import HtmlEmbed from '@ckeditor/ckeditor5-html-embed/src/htmlembed.js';
import Image from '@ckeditor/ckeditor5-image/src/image.js';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption.js';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize.js';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar.js';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload.js';
import Indent from '@ckeditor/ckeditor5-indent/src/indent.js';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic.js';
import Link from '@ckeditor/ckeditor5-link/src/link.js';
import List from '@ckeditor/ckeditor5-list/src/list.js';
import ListProperties from '@ckeditor/ckeditor5-list/src/listproperties.js';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed.js';
import MediaEmbedToolbar from '@ckeditor/ckeditor5-media-embed/src/mediaembedtoolbar.js';
import PageBreak from '@ckeditor/ckeditor5-page-break/src/pagebreak.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice.js';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat.js';
import SimpleUploadAdapter from '@ckeditor/ckeditor5-upload/src/adapters/simpleuploadadapter.js';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough.js';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript.js';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript.js';
import Table from '@ckeditor/ckeditor5-table/src/table.js';
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties';
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar.js';
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation.js';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline.js';

import VideoUpload from './video/videoupload';
import Video from './video/video';
import VideoResize from './video/videoresize';
import VideoToolbar from './video/videotoolbar';
import VideoStyle from './video/videostyle';
import VideoInsert from './video/videoinsert';

export default class InlineEditor extends InlineEditorBase {}

// Plugins to include in the build.
InlineEditor.builtinPlugins = [
	Autoformat,
	Alignment,
	BlockQuote,
	Bold,
	Code,
	CodeBlock,
	DataFilter,
	DataSchema,
	Essentials,
	FontBackgroundColor,
	FontColor,
	FontFamily,
	FontSize,
	GeneralHtmlSupport,
	Heading,
	HorizontalLine,
	HtmlComment,
	HtmlEmbed,
	Image,
	ImageCaption,
	ImageResize,
	ImageToolbar,
	ImageUpload,
	Indent,
	Italic,
	Link,
	List,
	ListProperties,
	MediaEmbed,
	MediaEmbedToolbar,
	PageBreak,
	Paragraph,
	PasteFromOffice,
	RemoveFormat,
	SimpleUploadAdapter,
	Strikethrough,
	Subscript,
	Superscript,
	Table,
	TableCellProperties,
	TableProperties,
	TableToolbar,
	TextTransformation,
	Underline,
	VideoUpload,
	Video,
	VideoResize,
	VideoToolbar,
	VideoStyle,
	VideoInsert
];

// Editor configuration.
InlineEditor.defaultConfig = {
	toolbar: {
		items: [
			'heading',
			'alignment',
			'|',
			'bold',
			'italic',
			'underline',
			'strikethrough',
			'|',
			'fontFamily',
			'fontSize',
			'fontColor',
			'fontBackgroundColor',
			'removeFormat',
			'|',
			'numberedList',
			'bulletedList',
			'outdent',
			'indent',
			'|',
			'link',
			'imageUpload',
			'blockQuote',
			'insertTable',
			'mediaEmbed',
			'-',
			'horizontalLine',
			'pageBreak',
			'superscript',
			'subscript',
			'code',
			'codeBlock',
			'htmlEmbed',
			'undo',
			'redo',
			'videoUpload',
			'videoInsert'
		],
		shouldNotGroupWhenFull: true
	},
	image: {
		toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ]
	},
	video: {
		resizeUnit: '',
		// Configure the available video resize options.
		resizeOptions: [
			{
				name: 'videoResize:original',
				value: '100%',
				label: 'Original'
			},
			{
				name: 'videoResize:20%',
				value: '20%',
				label: '20%'
			},
			{
				name: 'videoResize:30%',
				value: '30%',
				label: '30%'
			},
			{
				name: 'videoResize:40%',
				value: '40%',
				label: '40%'
			},
			{
				name: 'videoResize:50%',
				value: '50%',
				label: '50%'
			},
			{
				name: 'videoResize:60%',
				value: '60%',
				label: '60%'
			},
			{
				name: 'videoResize:70%',
				value: '70%',
				label: '70%'
			},
			{
				name: 'videoResize:80%',
				value: '80%',
				label: '80%'
			},
			{
				name: 'videoResize:90%',
				value: '90%',
				label: '90%'
			}
		],
		toolbar: [
			'videoResize'
		]
	},
	table: {
		contentToolbar: [
			'tableColumn',
			'tableRow',
			'mergeTableCells',
			'tableCellProperties',
			'tableProperties'
		]
	},
	// This value must be kept in sync with the language defined in webpack.config.js.
	language: 'zh-cn'
};
