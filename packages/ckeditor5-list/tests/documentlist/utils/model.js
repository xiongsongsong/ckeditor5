/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import {
	expandListBlocksToCompleteItems,
	getAllListItemBlocks,
	getListItemBlocks,
	getListItems,
	getNestedListBlocks,
	indentBlocks,
	isFirstBlockOfListItem,
	isLastBlockOfListItem,
	isOnlyOneListItemSelected,
	mergeListItemBefore,
	outdentBlocks,
	removeListAttributes,
	splitListItemBefore
} from '../../../src/documentlist/utils/model';
import { modelList } from '../_utils/utils';
import stubUid from '../_utils/uid';

import Model from '@ckeditor/ckeditor5-engine/src/model/model';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { stringify as stringifyModel, parse as parseModel } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'DocumentList - utils - model', () => {
	let model, schema;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		model = new Model();
		schema = model.schema;

		schema.register( 'paragraph', { inheritAllFrom: '$block' } );
		schema.register( 'blockQuote', { inheritAllFrom: '$container' } );
		schema.extend( '$container', { allowAttributes: [ 'listType', 'listIndent', 'listItemId' ] } );
	} );

	describe( 'getAllListItemBlocks()', () => {
		it( 'should return a single item if it meets conditions', () => {
			const input =
				'<paragraph>foo</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0.</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">1.</paragraph>' +
				'<paragraph>bar</paragraph>';

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 1 );
			const foundElements = getAllListItemBlocks( listItem );

			expect( foundElements.length ).to.equal( 1 );
			expect( foundElements[ 0 ] ).to.be.equal( listItem );
		} );

		it( 'should return a items if started looking from the first list item block', () => {
			const input =
				'<paragraph>foo</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0a.</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">1b.</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">1c.</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">2.</paragraph>' +
				'<paragraph>bar</paragraph>';

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 1 );
			const foundElements = getAllListItemBlocks( listItem );

			expect( foundElements.length ).to.equal( 3 );
			expect( foundElements[ 0 ] ).to.be.equal( listItem );
			expect( foundElements[ 1 ] ).to.be.equal( fragment.getChild( 2 ) );
			expect( foundElements[ 2 ] ).to.be.equal( fragment.getChild( 3 ) );
		} );

		it( 'should return a items if started looking from the last list item block', () => {
			const input =
				'<paragraph>foo</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0a.</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">1b.</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">1c.</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">2.</paragraph>' +
				'<paragraph>bar</paragraph>';

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 3 );
			const foundElements = getAllListItemBlocks( listItem );

			expect( foundElements.length ).to.equal( 3 );
			expect( foundElements[ 0 ] ).to.be.equal( fragment.getChild( 1 ) );
			expect( foundElements[ 1 ] ).to.be.equal( fragment.getChild( 2 ) );
			expect( foundElements[ 2 ] ).to.be.equal( listItem );
		} );

		it( 'should return a items if started looking from the middle list item block', () => {
			const input =
				'<paragraph>foo</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0a.</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">1b.</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">1c.</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">2.</paragraph>' +
				'<paragraph>bar</paragraph>';

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 2 );
			const foundElements = getAllListItemBlocks( listItem );

			expect( foundElements.length ).to.equal( 3 );
			expect( foundElements[ 0 ] ).to.be.equal( fragment.getChild( 1 ) );
			expect( foundElements[ 1 ] ).to.be.equal( listItem );
			expect( foundElements[ 2 ] ).to.be.equal( fragment.getChild( 3 ) );
		} );

		it( 'should ignore nested list blocks', () => {
			const input =
				'<paragraph>foo</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">a</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">b1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="1">b1.c</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">b2</paragraph>' +
				'<paragraph listType="bulleted" listItemId="d" listIndent="1">b2.d</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">b3</paragraph>' +
				'<paragraph listType="bulleted" listItemId="e" listIndent="0">e</paragraph>' +
				'<paragraph>bar</paragraph>';

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 4 );
			const foundElements = getAllListItemBlocks( listItem );

			expect( foundElements.length ).to.equal( 3 );
			expect( foundElements[ 0 ] ).to.be.equal( fragment.getChild( 2 ) );
			expect( foundElements[ 1 ] ).to.be.equal( listItem );
			expect( foundElements[ 2 ] ).to.be.equal( fragment.getChild( 6 ) );
		} );
	} );

	describe( 'getListItemBlocks()', () => {
		it( 'should return a single item if it meets conditions', () => {
			const input =
				'<paragraph>foo</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0.</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">1.</paragraph>' +
				'<paragraph>bar</paragraph>';

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 1 );
			const backwardElements = getListItemBlocks( listItem, { direction: 'backward' } );
			const forwardElements = getListItemBlocks( listItem, { direction: 'forward' } );

			expect( backwardElements.length ).to.equal( 0 );
			expect( forwardElements.length ).to.equal( 1 );
			expect( forwardElements[ 0 ] ).to.be.equal( listItem );
		} );

		it( 'should return a items if started looking from the first list item block', () => {
			const input =
				'<paragraph>foo</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0a.</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">1b.</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">1c.</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">2.</paragraph>' +
				'<paragraph>bar</paragraph>';

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 1 );
			const backwardElements = getListItemBlocks( listItem, { direction: 'backward' } );
			const forwardElements = getListItemBlocks( listItem, { direction: 'forward' } );

			expect( backwardElements.length ).to.equal( 0 );
			expect( forwardElements.length ).to.equal( 3 );
			expect( forwardElements[ 0 ] ).to.be.equal( listItem );
			expect( forwardElements[ 1 ] ).to.be.equal( fragment.getChild( 2 ) );
			expect( forwardElements[ 2 ] ).to.be.equal( fragment.getChild( 3 ) );
		} );

		it( 'should return a items if started looking from the last list item block', () => {
			const input =
				'<paragraph>foo</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0a.</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">1b.</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">1c.</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">2.</paragraph>' +
				'<paragraph>bar</paragraph>';

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 3 );
			const backwardElements = getListItemBlocks( listItem, { direction: 'backward' } );
			const forwardElements = getListItemBlocks( listItem, { direction: 'forward' } );

			expect( backwardElements.length ).to.equal( 2 );
			expect( backwardElements[ 0 ] ).to.be.equal( fragment.getChild( 1 ) );
			expect( backwardElements[ 1 ] ).to.be.equal( fragment.getChild( 2 ) );

			expect( forwardElements.length ).to.equal( 1 );
			expect( forwardElements[ 0 ] ).to.be.equal( listItem );
		} );

		it( 'should return a items if started looking from the middle list item block', () => {
			const input =
				'<paragraph>foo</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0a.</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">1b.</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">1c.</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">2.</paragraph>' +
				'<paragraph>bar</paragraph>';

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 2 );
			const backwardElements = getListItemBlocks( listItem, { direction: 'backward' } );
			const forwardElements = getListItemBlocks( listItem, { direction: 'forward' } );

			expect( backwardElements.length ).to.equal( 1 );
			expect( backwardElements[ 0 ] ).to.be.equal( fragment.getChild( 1 ) );

			expect( forwardElements.length ).to.equal( 2 );
			expect( forwardElements[ 0 ] ).to.be.equal( listItem );
			expect( forwardElements[ 1 ] ).to.be.equal( fragment.getChild( 3 ) );
		} );

		it( 'should ignore nested list blocks', () => {
			const input =
				'<paragraph>foo</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">a</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">b1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="1">b1.c</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">b2</paragraph>' +
				'<paragraph listType="bulleted" listItemId="d" listIndent="1">b2.d</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">b3</paragraph>' +
				'<paragraph listType="bulleted" listItemId="e" listIndent="0">e</paragraph>' +
				'<paragraph>bar</paragraph>';

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 4 );
			const backwardElements = getListItemBlocks( listItem, { direction: 'backward' } );
			const forwardElements = getListItemBlocks( listItem, { direction: 'forward' } );

			expect( backwardElements.length ).to.equal( 1 );
			expect( backwardElements[ 0 ] ).to.be.equal( fragment.getChild( 2 ) );

			expect( forwardElements.length ).to.equal( 2 );
			expect( forwardElements[ 0 ] ).to.be.equal( listItem );
			expect( forwardElements[ 1 ] ).to.be.equal( fragment.getChild( 6 ) );
		} );

		it( 'should break if exited nested list', () => {
			const input =
				'<paragraph>foo</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">a</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">b</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">b</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="0">c</paragraph>' +
				'<paragraph>bar</paragraph>';

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 2 );
			const backwardElements = getListItemBlocks( listItem, { direction: 'backward' } );
			const forwardElements = getListItemBlocks( listItem, { direction: 'forward' } );

			expect( backwardElements.length ).to.equal( 0 );

			expect( forwardElements.length ).to.equal( 2 );
			expect( forwardElements[ 0 ] ).to.be.equal( listItem );
			expect( forwardElements[ 1 ] ).to.be.equal( fragment.getChild( 3 ) );
		} );

		it( 'should search backward by default', () => {
			const input =
				'<paragraph>foo</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">a</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">b</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">b</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="0">c</paragraph>' +
				'<paragraph>bar</paragraph>';

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 3 );
			const backwardElements = getListItemBlocks( listItem );

			expect( backwardElements.length ).to.equal( 1 );
			expect( backwardElements[ 0 ] ).to.equal( fragment.getChild( 2 ) );
		} );
	} );

	describe( 'getNestedListBlocks()', () => {
		it( 'should return empty array if there is no nested blocks', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">a</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">b</paragraph>';

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 0 );
			const blocks = getNestedListBlocks( listItem );

			expect( blocks.length ).to.equal( 0 );
		} );

		it( 'should return blocks that have a greater indent than the given item', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">a</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">b</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="2">c</paragraph>' +
				'<paragraph listType="bulleted" listItemId="d" listIndent="2">d</paragraph>' +
				'<paragraph listType="bulleted" listItemId="e" listIndent="0">e</paragraph>';

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 0 );
			const blocks = getNestedListBlocks( listItem );

			expect( blocks.length ).to.equal( 3 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 1 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 2 ) );
			expect( blocks[ 2 ] ).to.equal( fragment.getChild( 3 ) );
		} );

		it( 'should return blocks that have a greater indent than the given item (nested one)', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">a</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">b</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="2">c</paragraph>' +
				'<paragraph listType="bulleted" listItemId="d" listIndent="2">d</paragraph>' +
				'<paragraph listType="bulleted" listItemId="e" listIndent="0">e</paragraph>';

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 1 );
			const blocks = getNestedListBlocks( listItem );

			expect( blocks.length ).to.equal( 2 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 2 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 3 ) );
		} );

		it( 'should not include items from other subtrees', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">a</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">b</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="2">c</paragraph>' +
				'<paragraph listType="bulleted" listItemId="d" listIndent="0">d</paragraph>' +
				'<paragraph listType="bulleted" listItemId="e" listIndent="1">e</paragraph>';

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 0 );
			const blocks = getNestedListBlocks( listItem );

			expect( blocks.length ).to.equal( 2 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 1 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 2 ) );
		} );
	} );

	describe( 'getListItems()', () => {
		it( 'should return all list items for a single flat list (when given the first list item)', () => {
			const input = modelList( [
				'0',
				'* 1',
				'* 2',
				'* 3',
				'4'
			] );

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 1 );

			expect( getListItems( listItem ) ).to.deep.equal( [
				fragment.getChild( 1 ),
				fragment.getChild( 2 ),
				fragment.getChild( 3 )
			] );
		} );

		it( 'should return all list items for a single flat list (when given the last list item)', () => {
			const input = modelList( [
				'0',
				'* 1',
				'* 2',
				'* 3',
				'4'
			] );

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 3 );

			expect( getListItems( listItem ) ).to.deep.equal( [
				fragment.getChild( 1 ),
				fragment.getChild( 2 ),
				fragment.getChild( 3 )
			] );
		} );

		it( 'should return all list items for a single flat list (when given the middle list item)', () => {
			const input = modelList( [
				'0',
				'* 1',
				'* 2',
				'* 3',
				'4'
			] );

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 2 );

			expect( getListItems( listItem ) ).to.deep.equal( [
				fragment.getChild( 1 ),
				fragment.getChild( 2 ),
				fragment.getChild( 3 )
			] );
		} );

		it( 'should return all list items for a nested list', () => {
			const input = modelList( [
				'* 0',
				'  * 1',
				'  * 2',
				'  * 3',
				'* 4'
			] );

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 2 );

			expect( getListItems( listItem ) ).to.deep.equal( [
				fragment.getChild( 1 ),
				fragment.getChild( 2 ),
				fragment.getChild( 3 )
			] );
		} );

		it( 'should return all list items of the same type', () => {
			const input = modelList( [
				'# 0',
				'* 1',
				'* 2',
				'* 3',
				'# 4'
			] );

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 2 );

			expect( getListItems( listItem ) ).to.deep.equal( [
				fragment.getChild( 1 ),
				fragment.getChild( 2 ),
				fragment.getChild( 3 )
			] );
		} );

		it( 'should return all list items and ignore nested lists', () => {
			const input = modelList( [
				'0',
				'* 1',
				'  * 2',
				'* 3',
				'4'
			] );

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 1 );

			expect( getListItems( listItem ) ).to.deep.equal( [
				fragment.getChild( 1 ),
				fragment.getChild( 3 )
			] );
		} );

		it( 'should return all list items with following blocks belonging to the same item', () => {
			const input = modelList( [
				'0',
				'* 1',
				'  2',
				'* 3',
				'  4',
				'5'
			] );

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 2 );

			expect( getListItems( listItem ) ).to.deep.equal( [
				fragment.getChild( 1 ),
				fragment.getChild( 2 ),
				fragment.getChild( 3 ),
				fragment.getChild( 4 )
			] );
		} );
	} );

	describe( 'isFirstBlockOfListItem()', () => {
		it( 'should return true for the first list item', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">a</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">b</paragraph>';

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 0 );

			expect( isFirstBlockOfListItem( listItem ) ).to.be.true;
		} );

		it( 'should return true for the second list item', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">a</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">b</paragraph>';

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 1 );

			expect( isFirstBlockOfListItem( listItem ) ).to.be.true;
		} );

		it( 'should return false for the second block of list item', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">a</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">b</paragraph>';

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 1 );

			expect( isFirstBlockOfListItem( listItem ) ).to.be.false;
		} );

		it( 'should return true if the previous block has smaller indent', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">a</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">b</paragraph>';

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 1 );

			expect( isFirstBlockOfListItem( listItem ) ).to.be.true;
		} );

		it( 'should return false if the previous block has bigger indent but it is a part of bigger list item', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">a</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">b</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">c</paragraph>';

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 2 );

			expect( isFirstBlockOfListItem( listItem ) ).to.be.false;
		} );
	} );

	describe( 'isLastBlockOfListItem()', () => {
		it( 'should return true for the last list item', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">a</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">b</paragraph>';

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 1 );

			expect( isLastBlockOfListItem( listItem ) ).to.be.true;
		} );

		it( 'should return true for the first list item', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">a</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">b</paragraph>';

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 0 );

			expect( isLastBlockOfListItem( listItem ) ).to.be.true;
		} );

		it( 'should return false for the first block of list item', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">a</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">b</paragraph>';

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 0 );

			expect( isLastBlockOfListItem( listItem ) ).to.be.false;
		} );

		it( 'should return true if the next block has smaller indent', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">a</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">b</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="0">c</paragraph>';

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 1 );

			expect( isLastBlockOfListItem( listItem ) ).to.be.true;
		} );

		it( 'should return false if the next block has bigger indent but it is a part of bigger list item', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">a</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">b</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">c</paragraph>';

			const fragment = parseModel( input, schema );
			const listItem = fragment.getChild( 0 );

			expect( isLastBlockOfListItem( listItem ) ).to.be.false;
		} );
	} );

	describe( 'expandListBlocksToCompleteItems()', () => {
		it( 'should not modify list for a single block of a single-block list item', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">a</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">b</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="0">c</paragraph>' +
				'<paragraph listType="bulleted" listItemId="d" listIndent="0">d</paragraph>';

			const fragment = parseModel( input, schema );
			let blocks = [
				fragment.getChild( 0 )
			];

			blocks = expandListBlocksToCompleteItems( blocks );

			expect( blocks.length ).to.equal( 1 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 0 ) );
		} );

		it( 'should include all blocks for single list item', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">2</paragraph>';

			const fragment = parseModel( input, schema );
			let blocks = [
				fragment.getChild( 0 )
			];

			blocks = expandListBlocksToCompleteItems( blocks );

			expect( blocks.length ).to.equal( 3 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 0 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 1 ) );
			expect( blocks[ 2 ] ).to.equal( fragment.getChild( 2 ) );
		} );

		it( 'should include all blocks for only first list item block', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">2</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">3</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="0">3</paragraph>';

			const fragment = parseModel( input, schema );
			let blocks = [
				fragment.getChild( 1 )
			];

			blocks = expandListBlocksToCompleteItems( blocks );

			expect( blocks.length ).to.equal( 3 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 1 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 2 ) );
			expect( blocks[ 2 ] ).to.equal( fragment.getChild( 3 ) );
		} );

		it( 'should include all blocks for only last list item block', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">2</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">3</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="0">3</paragraph>';

			const fragment = parseModel( input, schema );
			let blocks = [
				fragment.getChild( 3 )
			];

			blocks = expandListBlocksToCompleteItems( blocks );

			expect( blocks.length ).to.equal( 3 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 1 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 2 ) );
			expect( blocks[ 2 ] ).to.equal( fragment.getChild( 3 ) );
		} );

		it( 'should include all blocks for only middle list item block', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">2</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">3</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="0">3</paragraph>';

			const fragment = parseModel( input, schema );
			let blocks = [
				fragment.getChild( 2 )
			];

			blocks = expandListBlocksToCompleteItems( blocks );

			expect( blocks.length ).to.equal( 3 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 1 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 2 ) );
			expect( blocks[ 2 ] ).to.equal( fragment.getChild( 3 ) );
		} );

		it( 'should include all blocks in nested list item', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">2</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">3</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="0">3</paragraph>';

			const fragment = parseModel( input, schema );
			let blocks = [
				fragment.getChild( 2 )
			];

			blocks = expandListBlocksToCompleteItems( blocks );

			expect( blocks.length ).to.equal( 3 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 1 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 2 ) );
			expect( blocks[ 2 ] ).to.equal( fragment.getChild( 3 ) );
		} );

		it( 'should include all blocks including nested items (start from first item)', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">2</paragraph>';

			const fragment = parseModel( input, schema );
			let blocks = [
				fragment.getChild( 0 )
			];

			blocks = expandListBlocksToCompleteItems( blocks );

			expect( blocks.length ).to.equal( 3 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 0 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 1 ) );
			expect( blocks[ 2 ] ).to.equal( fragment.getChild( 2 ) );
		} );

		it( 'should include all blocks including nested items (start from last item)', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">2</paragraph>';

			const fragment = parseModel( input, schema );
			let blocks = [
				fragment.getChild( 2 )
			];

			blocks = expandListBlocksToCompleteItems( blocks );

			expect( blocks.length ).to.equal( 3 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 0 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 1 ) );
			expect( blocks[ 2 ] ).to.equal( fragment.getChild( 2 ) );
		} );

		it( 'should expand first and last items', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="x" listIndent="0">x</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">2</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">3</paragraph>' +
				'<paragraph listType="bulleted" listItemId="y" listIndent="0">y</paragraph>';

			const fragment = parseModel( input, schema );
			let blocks = [
				fragment.getChild( 2 ),
				fragment.getChild( 3 )
			];

			blocks = expandListBlocksToCompleteItems( blocks );

			expect( blocks.length ).to.equal( 4 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 1 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 2 ) );
			expect( blocks[ 2 ] ).to.equal( fragment.getChild( 3 ) );
			expect( blocks[ 3 ] ).to.equal( fragment.getChild( 4 ) );
		} );

		it( 'should not include nested items from other item', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="0">2</paragraph>' +
				'<paragraph listType="bulleted" listItemId="d" listIndent="1">3</paragraph>' +
				'<paragraph listType="bulleted" listItemId="e" listIndent="0">4</paragraph>';

			const fragment = parseModel( input, schema );
			let blocks = [
				fragment.getChild( 2 )
			];

			blocks = expandListBlocksToCompleteItems( blocks );

			expect( blocks.length ).to.equal( 2 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 2 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 3 ) );
		} );

		it( 'should include all blocks even if not at the same indent level from the edge block', () => {
			const fragment = parseModel( modelList( [
				'* 0',
				'  * 1',
				'    * 2',
				'    3',
				'  * 4',
				'    * 5',
				'    6',
				'  * 7'
			] ), schema );

			let blocks = [
				fragment.getChild( 2 ),
				fragment.getChild( 3 ),
				fragment.getChild( 4 ),
				fragment.getChild( 5 )
			];

			blocks = expandListBlocksToCompleteItems( blocks );

			expect( blocks.length ).to.equal( 6 );
			expect( blocks[ 0 ] ).to.equal( fragment.getChild( 1 ) );
			expect( blocks[ 1 ] ).to.equal( fragment.getChild( 2 ) );
			expect( blocks[ 2 ] ).to.equal( fragment.getChild( 3 ) );
			expect( blocks[ 3 ] ).to.equal( fragment.getChild( 4 ) );
			expect( blocks[ 4 ] ).to.equal( fragment.getChild( 5 ) );
			expect( blocks[ 5 ] ).to.equal( fragment.getChild( 6 ) );
		} );
	} );

	describe( 'splitListItemBefore()', () => {
		it( 'should replace all blocks ids for first block given', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">a</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">b</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">c</paragraph>';

			const fragment = parseModel( input, schema );

			stubUid();
			model.change( writer => splitListItemBefore( fragment.getChild( 0 ), writer ) );

			expect( stringifyModel( fragment ) ).to.equal(
				'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">a</paragraph>' +
				'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">b</paragraph>' +
				'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">c</paragraph>'
			);
		} );

		it( 'should replace blocks ids for second block given', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">a</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">b</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">c</paragraph>';

			const fragment = parseModel( input, schema );

			stubUid();
			model.change( writer => splitListItemBefore( fragment.getChild( 1 ), writer ) );

			expect( stringifyModel( fragment ) ).to.equal(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
				'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">b</paragraph>' +
				'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">c</paragraph>'
			);
		} );

		it( 'should not modify other items', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="x" listIndent="0">x</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">a</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">b</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">c</paragraph>' +
				'<paragraph listType="bulleted" listItemId="y" listIndent="0">y</paragraph>';

			const fragment = parseModel( input, schema );

			stubUid();
			model.change( writer => splitListItemBefore( fragment.getChild( 2 ), writer ) );

			expect( stringifyModel( fragment ) ).to.equal(
				'<paragraph listIndent="0" listItemId="x" listType="bulleted">x</paragraph>' +
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
				'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">b</paragraph>' +
				'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">c</paragraph>' +
				'<paragraph listIndent="0" listItemId="y" listType="bulleted">y</paragraph>'
			);
		} );

		it( 'should not modify nested items', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">a</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">b</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">c</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">d</paragraph>';

			const fragment = parseModel( input, schema );

			stubUid();
			model.change( writer => splitListItemBefore( fragment.getChild( 1 ), writer ) );

			expect( stringifyModel( fragment ) ).to.equal(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
				'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">b</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="bulleted">c</paragraph>' +
				'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">d</paragraph>'
			);
		} );

		it( 'should not modify parent items', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">a</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">b</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">c</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">d</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">e</paragraph>';

			const fragment = parseModel( input, schema );

			stubUid();
			model.change( writer => splitListItemBefore( fragment.getChild( 2 ), writer ) );

			expect( stringifyModel( fragment ) ).to.equal(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
				'<paragraph listIndent="1" listItemId="e00000000000000000000000000000000" listType="bulleted">c</paragraph>' +
				'<paragraph listIndent="1" listItemId="e00000000000000000000000000000000" listType="bulleted">d</paragraph>' +
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">e</paragraph>'
			);
		} );
	} );

	describe( 'mergeListItemBefore()', () => {
		it( 'should apply parent list attributes to the given list block', () => {
			const input = modelList( [
				'* 0',
				'  # 1',
				'* 2'
			] );

			const fragment = parseModel( input, schema );
			let changedBlocks;

			model.change( writer => {
				changedBlocks = mergeListItemBefore( fragment.getChild( 1 ), fragment.getChild( 0 ), writer );
			} );

			expect( stringifyModel( fragment ) ).to.equalMarkup( modelList( [
				'* 0',
				'  1',
				'* 2'
			] ) );

			expect( changedBlocks ).to.deep.equal( [
				fragment.getChild( 1 )
			] );
		} );

		it( 'should apply parent list attributes to the given list block and all blocks of the same item', () => {
			const input = modelList( [
				'* 0',
				'  # 1',
				'    2',
				'* 3'
			] );

			const fragment = parseModel( input, schema );
			let changedBlocks;

			model.change( writer => {
				changedBlocks = mergeListItemBefore( fragment.getChild( 1 ), fragment.getChild( 0 ), writer );
			} );

			expect( stringifyModel( fragment ) ).to.equalMarkup( modelList( [
				'* 0',
				'  1',
				'  2',
				'* 3'
			] ) );

			expect( changedBlocks ).to.deep.equal( [
				fragment.getChild( 1 ),
				fragment.getChild( 2 )
			] );
		} );

		it( 'should not apply non-list attributes', () => {
			const input =
				'<paragraph alignment="right" listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="bulleted">1</paragraph>' +
				'<paragraph listIndent="0" listItemId="c" listType="bulleted">2</paragraph>';

			const fragment = parseModel( input, schema );
			let changedBlocks;

			model.change( writer => {
				changedBlocks = mergeListItemBefore( fragment.getChild( 1 ), fragment.getChild( 0 ), writer );
			} );

			expect( stringifyModel( fragment ) ).to.equalMarkup(
				'<paragraph alignment="right" listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">1</paragraph>' +
				'<paragraph listIndent="0" listItemId="c" listType="bulleted">2</paragraph>'
			);

			expect( changedBlocks ).to.deep.equal( [
				fragment.getChild( 1 )
			] );
		} );
	} );

	describe( 'indentBlocks()', () => {
		it( 'flat items', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">a</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">b</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">c</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">d</paragraph>';

			const fragment = parseModel( input, schema );
			const blocks = [
				fragment.getChild( 1 ),
				fragment.getChild( 2 )
			];

			stubUid();

			model.change( writer => indentBlocks( blocks, writer ) );

			expect( stringifyModel( fragment ) ).to.equal(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
				'<paragraph listIndent="1" listItemId="a" listType="bulleted">b</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="bulleted">c</paragraph>' +
				'<paragraph listIndent="0" listItemId="b" listType="bulleted">d</paragraph>'
			);
		} );

		it( 'nested lists should keep structure', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">a</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">b</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="2">c</paragraph>' +
				'<paragraph listType="bulleted" listItemId="d" listIndent="1">d</paragraph>' +
				'<paragraph listType="bulleted" listItemId="e" listIndent="0">e</paragraph>';

			const fragment = parseModel( input, schema );
			const blocks = [
				fragment.getChild( 1 ),
				fragment.getChild( 2 ),
				fragment.getChild( 3 )
			];

			stubUid();

			model.change( writer => indentBlocks( blocks, writer ) );

			expect( stringifyModel( fragment ) ).to.equal(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
				'<paragraph listIndent="2" listItemId="b" listType="bulleted">b</paragraph>' +
				'<paragraph listIndent="3" listItemId="c" listType="bulleted">c</paragraph>' +
				'<paragraph listIndent="2" listItemId="d" listType="bulleted">d</paragraph>' +
				'<paragraph listIndent="0" listItemId="e" listType="bulleted">e</paragraph>'
			);
		} );

		it( 'should apply indentation on all blocks of given items (expand = true)', () => {
			const input = modelList( [
				'* 0',
				'* 1',
				'  2',
				'* 3',
				'  4',
				'* 5'
			] );

			const fragment = parseModel( input, schema );
			const blocks = [
				fragment.getChild( 2 ),
				fragment.getChild( 3 )
			];

			model.change( writer => indentBlocks( blocks, writer, { expand: true } ) );

			expect( stringifyModel( fragment ) ).to.equalMarkup( modelList( [
				'* 0',
				'  * 1',
				'    2',
				'  * 3',
				'    4',
				'* 5'
			] ) );
		} );
	} );

	describe( 'outdentBlocks()', () => {
		it( 'should handle outdenting', () => {
			const input = modelList( [
				'* 0',
				'  * 1',
				'    * 2',
				'  * 3',
				'* 4'
			] );

			const fragment = parseModel( input, schema );
			const blocks = [
				fragment.getChild( 1 ),
				fragment.getChild( 2 ),
				fragment.getChild( 3 )
			];

			let changedBlocks;

			model.change( writer => {
				changedBlocks = outdentBlocks( blocks, writer );
			} );

			expect( stringifyModel( fragment ) ).to.equalMarkup( modelList( [
				'* 0',
				'* 1',
				'  * 2',
				'* 3',
				'* 4'
			] ) );

			expect( changedBlocks ).to.deep.equal( blocks );
		} );

		it( 'should remove list attributes if outdented below 0', () => {
			const input = modelList( [
				'* 0',
				'* 1',
				'* 2',
				'  * 3',
				'* 4'
			] );

			const fragment = parseModel( input, schema );
			const blocks = [
				fragment.getChild( 2 ),
				fragment.getChild( 3 ),
				fragment.getChild( 4 )
			];

			let changedBlocks;

			model.change( writer => {
				changedBlocks = outdentBlocks( blocks, writer );
			} );

			expect( stringifyModel( fragment ) ).to.equalMarkup( modelList( [
				'* 0',
				'* 1',
				'2',
				'* 3',
				'4'
			] ) );

			expect( changedBlocks ).to.deep.equal( blocks );
		} );

		it( 'should not remove attributes other than lists if outdented below 0', () => {
			const input =
				'<paragraph listType="bulleted" listItemId="a" listIndent="0" alignment="right">0</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0" alignment="right">1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="1" alignment="right">2</paragraph>' +
				'<paragraph listType="bulleted" listItemId="d" listIndent="0" alignment="right">3</paragraph>' +
				'<paragraph listType="bulleted" listItemId="e" listIndent="1" alignment="right">4</paragraph>';

			const fragment = parseModel( input, schema );
			const blocks = [
				fragment.getChild( 2 ),
				fragment.getChild( 3 ),
				fragment.getChild( 4 )
			];

			let changedBlocks;

			model.change( writer => {
				changedBlocks = outdentBlocks( blocks, writer );
			} );

			expect( stringifyModel( fragment ) ).to.equalMarkup(
				'<paragraph alignment="right" listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
				'<paragraph alignment="right" listIndent="0" listItemId="b" listType="bulleted">1</paragraph>' +
				'<paragraph alignment="right" listIndent="0" listItemId="c" listType="bulleted">2</paragraph>' +
				'<paragraph alignment="right">3</paragraph>' +
				'<paragraph alignment="right" listIndent="0" listItemId="e" listType="bulleted">4</paragraph>'
			);

			expect( changedBlocks ).to.deep.equal( blocks );
		} );

		it( 'should apply indentation on all blocks of given items (expand = true)', () => {
			const input = modelList( [
				'* 0',
				'  * 1',
				'    2',
				'  * 3',
				'    4',
				'  * 5'
			] );

			const fragment = parseModel( input, schema );
			const blocks = [
				fragment.getChild( 2 ),
				fragment.getChild( 3 )
			];

			let changedBlocks;

			model.change( writer => {
				changedBlocks = outdentBlocks( blocks, writer, { expand: true } );
			} );

			expect( stringifyModel( fragment ) ).to.equalMarkup( modelList( [
				'* 0',
				'* 1',
				'  2',
				'* 3',
				'  4',
				'  * 5'
			] ) );

			expect( changedBlocks ).to.deep.equal( [
				fragment.getChild( 1 ),
				fragment.getChild( 2 ),
				fragment.getChild( 3 ),
				fragment.getChild( 4 )
			] );
		} );

		it( 'should merge nested items to the parent item if nested block is not the last block of parent list item', () => {
			const input = modelList( [
				'* 0',
				'  * 1',
				'    2',
				'  3',
				'* 4'
			] );

			const fragment = parseModel( input, schema );
			const blocks = [
				fragment.getChild( 1 )
			];

			let changedBlocks;

			model.change( writer => {
				changedBlocks = outdentBlocks( blocks, writer, { expand: true } );
			} );

			expect( stringifyModel( fragment ) ).to.equalMarkup( modelList( [
				'* 0',
				'  1',
				'  2',
				'  3',
				'* 4'
			] ) );

			expect( changedBlocks ).to.deep.equal( [
				fragment.getChild( 1 ),
				fragment.getChild( 2 )
			] );
		} );

		it( 'should not merge nested items to the parent item if nested block is the last block of parent list item', () => {
			const input = modelList( [
				'* 0',
				'  * 1',
				'    2',
				'* 3',
				'* 4'
			] );

			const fragment = parseModel( input, schema );
			const blocks = [
				fragment.getChild( 1 )
			];

			let changedBlocks;

			model.change( writer => {
				changedBlocks = outdentBlocks( blocks, writer, { expand: true } );
			} );

			expect( stringifyModel( fragment ) ).to.equalMarkup( modelList( [
				'* 0',
				'* 1',
				'  2',
				'* 3',
				'* 4'
			] ) );

			expect( changedBlocks ).to.deep.equal( [
				fragment.getChild( 1 ),
				fragment.getChild( 2 )
			] );
		} );

		it( 'should merge nested items but not deeper nested lists', () => {
			const input = modelList( [
				'* 0',
				'  * 1',
				'    * 2',
				'    * 3',
				'* 4'
			] );

			const fragment = parseModel( input, schema );
			const blocks = [
				fragment.getChild( 1 )
			];

			let changedBlocks;

			model.change( writer => {
				changedBlocks = outdentBlocks( blocks, writer, { expand: true } );
			} );

			expect( stringifyModel( fragment ) ).to.equalMarkup( modelList( [
				'* 0',
				'* 1',
				'  * 2',
				'  * 3',
				'* 4'
			] ) );

			expect( changedBlocks ).to.deep.equal( [
				fragment.getChild( 1 ),
				fragment.getChild( 2 ),
				fragment.getChild( 3 )
			] );
		} );
	} );

	describe( 'removeListAttributes()', () => {
		it( 'should remove all list attributes on a given blocks', () => {
			const input = modelList( [
				'* 0',
				'* 1',
				'  * 2',
				'    3',
				'  * 4',
				'* 5'
			] );

			const fragment = parseModel( input, schema );
			const blocks = [
				fragment.getChild( 2 ),
				fragment.getChild( 3 ),
				fragment.getChild( 4 )
			];

			let changedBlocks;

			model.change( writer => {
				changedBlocks = removeListAttributes( blocks, writer );
			} );

			expect( stringifyModel( fragment ) ).to.equalMarkup( modelList( [
				'* 0',
				'* 1',
				'2',
				'3',
				'4',
				'* 5'
			] ) );

			expect( changedBlocks ).to.deep.equal( blocks );
		} );

		it( 'should not remove non-list attributes', () => {
			const input = modelList( [
				'* 0',
				'* 1',
				'  * <paragraph alignmnent="right">2</paragraph>',
				'    3',
				'  * 4',
				'* 5'
			] );

			const fragment = parseModel( input, schema );
			const blocks = [
				fragment.getChild( 2 ),
				fragment.getChild( 3 ),
				fragment.getChild( 4 )
			];

			let changedBlocks;

			model.change( writer => {
				changedBlocks = removeListAttributes( blocks, writer );
			} );

			expect( stringifyModel( fragment ) ).to.equalMarkup( modelList( [
				'* 0',
				'* 1',
				'<paragraph alignmnent="right">2</paragraph>',
				'3',
				'4',
				'* 5'
			] ) );

			expect( changedBlocks ).to.deep.equal( blocks );
		} );
	} );

	describe( 'isOnlyOneListItemSelected()', () => {
		it( 'should return false if no blocks are given', () => {
			expect( isOnlyOneListItemSelected( [] ) ).to.be.false;
		} );

		it( 'should return false if first block is not a list item', () => {
			const input = modelList( [
				'0',
				'1'
			] );

			const fragment = parseModel( input, schema );
			const blocks = [
				fragment.getChild( 1 )
			];

			expect( isOnlyOneListItemSelected( blocks ) ).to.be.false;
		} );

		it( 'should return false if any block has a different ID', () => {
			const input = modelList( [
				'* 0',
				'  1',
				'* 2'
			] );

			const fragment = parseModel( input, schema );
			const blocks = [
				fragment.getChild( 0 ),
				fragment.getChild( 1 ),
				fragment.getChild( 2 )
			];

			expect( isOnlyOneListItemSelected( blocks ) ).to.be.false;
		} );

		it( 'should return true if all block has the same ID', () => {
			const input = modelList( [
				'* 0',
				'  1',
				'* 2'
			] );

			const fragment = parseModel( input, schema );
			const blocks = [
				fragment.getChild( 0 ),
				fragment.getChild( 1 )
			];

			expect( isOnlyOneListItemSelected( blocks ) ).to.be.true;
		} );
	} );

	describe( 'outdentItemsAfterItemRemoved()', () => {
		// TODO
	} );
} );
