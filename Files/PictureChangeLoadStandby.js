//=============================================================================
// PictureChangeLoadStandby.js
// ----------------------------------------------------------------------------
// Copyright (c) 2017 n2naokun(柊菜緒)
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 0.1.0 2018/02/02 テスト公開
// ----------------------------------------------------------------------------
// [Twitter]: https://twitter.com/n2naokun/
// [GitHub] : https://github.com/n2naokun/
//=============================================================================

/*:
 * @plugindesc ピクチャーの切り替え時ロードを待つプラグイン
 * @author n2naokun(柊菜緒)
 *
 * @help 
 * 強制的な処理の上書きが有るので上の方で読み込む方がいいかも？
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

(function (_global) {

   var Sprite_initialize = Sprite.prototype.initialize;
   Sprite.prototype.initialize = function () {
      Sprite_initialize.apply(this, arguments);
      this._standbyBitmap = null;
   };

   Sprite_Picture.prototype.loadBitmap = function () {
      if (this.bitmap) {
         this._standbyBitmap = ImageManager.loadPicture(this._pictureName);
      } else {
         this.bitmap = ImageManager.loadPicture(this._pictureName);
      }
   };

   Sprite_Picture.prototype.updateBitmap = function () {
      var picture = this.picture();
      if (picture) {
         var pictureName = picture.name();
         if (this._pictureName !== pictureName) {
            this._pictureName = pictureName;
            this.loadBitmap();
         }
         this.visible = true;
         if (this.bitmap && this._standbyBitmap && this.bitmap.url !== this._standbyBitmap.url && this._standbyBitmap._loadingState === "loaded") {
            this.bitmap = this._standbyBitmap;
            this._standbyBitmap = null;
         }
      } else {
         this._pictureName = '';
         this.bitmap = null;
         this.visible = false;
      }
   };

})(this);