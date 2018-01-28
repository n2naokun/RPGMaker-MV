//=============================================================================
// MapSymbolAutoFreeze.js
// ----------------------------------------------------------------------------
// Copyright (c) 2017 n2naokun(柊菜緒)
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.0.0 2018/01/28 初版
// ----------------------------------------------------------------------------
// [Twitter]: https://twitter.com/n2naokun/
// [GitHub] : https://github.com/n2naokun/
//=============================================================================

/*:
 * @plugindesc マップ上でフェードが行われていたりメッセージが表示されている時に
 * 自動的にイベントシンボルをフリーズさせるプラグイン。
 * @author n2naokun(柊菜緒)
 *
 * @help 一番下の方で読み込むことをおすすめします。
 * また、イベントシンボルがフリーズ中でも状況によってはプレーヤーだけが動けます。
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

   Game_Map.prototype.updateEvents = function () {
      var activeScene = SceneManager._scene;
      if (!((activeScene.constructor === Scene_Map) &&
         (activeScene.isBusy() ||
            (activeScene._fadeSprite && activeScene._fadeSprite.opacity > 0) ||
            $gameMessage.isBusy()))) {
         
         this.events().forEach(function (event) {
            event.update();
         });
      }
      this._commonEvents.forEach(function (event) {
         event.update();
      });
   };

})(this);