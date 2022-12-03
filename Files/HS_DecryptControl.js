//=============================================================================
// HS_DecryptControl.js
// ----------------------------------------------------------------------------
// Copyright (c) 2021 n2naokun(柊菜緒)
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.0.0 2022/03/27 初版
// ----------------------------------------------------------------------------
// [Twitter]: https://twitter.com/n2naokun/
// [GitHub] : https://github.com/n2naokun/
//=============================================================================

/*:
 * @plugindesc セーブスナップショット系のプラグイン使用時にゲームを暗号化すると
 * 画像読み込みエラーが発生する場合にそれを修正する汎用パッチプラグイン。
 * @author n2naokun(柊菜緒)
 *
 * @help 説明
 * 
 * 
 * 
 * 利用規約：
 *  作者に無断で改変、再配布が可能で、利用形態（商用、18禁利用等）
 *  についても制限はありません。
 *  このプラグインはもうあなたのものです。
 */

// ESLint向けグローバル変数宣言
/*global */

"use strict";//厳格なエラーチェック

var Imported = Imported || {};
Imported.HS_DecryptControl = true;
// 他のプラグインとの連携用シンボル

(function (_global) {
   var Decrypter_decryptImg = Decrypter.decryptImg;
   Decrypter.decryptImg = function (url) {
      if (url.slice(0, 10) == 'data:image') {
         return true;
      }
      return Decrypter_decryptImg.call(this, url);
   };
})(this);
