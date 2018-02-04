//=============================================================================
// PictureChangeLoadStandby.js
// ----------------------------------------------------------------------------
// Copyright (c) 2017 n2naokun(柊菜緒)
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 0.2.0 2018/02/04 処理の変更とバグ修正
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

   var Sprite_Picture_initialize = Sprite_Picture.prototype.initialize;
   Sprite_Picture.prototype.initialize = function () {
      Sprite_Picture_initialize.apply(this, arguments);
      this._standbyBitmap = null; // ロード待ちbitmapオブジェクト
   };

   Sprite_Picture.prototype.update = function () {
      Sprite.prototype.update.call(this);
      this.updateBitmap();
      if (this.visible && !this.isLoading()) { // ロード中の場合各種更新を停止
         this.updateOrigin();
         this.updatePosition();
         this.updateScale();
         this.updateTone();
         this.updateOther();
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

         // ロード完了を確認する処理
         if (this.isLoaded() && this.changePicture()) {
            this.bitmap = this._standbyBitmap;
            this._standbyBitmap = null;
         }


      } else {
         this._pictureName = '';
         this.bitmap = null;
         this._standbyBitmap = null; // ピクチャが消された場合ロード中のオブジェクトを削除
         this.visible = false;
      }
   };

   Sprite_Picture.prototype.loadBitmap = function () {
      this._standbyBitmap = ImageManager.loadPicture(this._pictureName);
   };

   Sprite_Picture.prototype.isLoaded = function () {
      if (this._standbyBitmap && this._standbyBitmap._loadingState === "loaded") {
         return true;
      }
      return false;
   };

   Sprite_Picture.prototype.isLoading = function () {
      if (this._standbyBitmap && this._standbyBitmap._loadingState !== "loaded") {
         return true;
      }
      return false;
   };

   Sprite_Picture.prototype.changePicture = function () {
      if (!this.bitmap || this.bitmap && this._standbyBitmap && this.bitmap.url !== this._standbyBitmap.url) {
         return true;
      }
      return false;
   };

})(this);