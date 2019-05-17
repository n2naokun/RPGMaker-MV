//=============================================================================
// HS_TimerAutoPause.js
// ----------------------------------------------------------------------------
// Copyright (c) 2018 n2naokun(柊菜緒)
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.0.0 2019/05/17 初版
// ----------------------------------------------------------------------------
// [Twitter]: https://twitter.com/n2naokun/
// [GitHub] : https://github.com/n2naokun/
//=============================================================================

/*:
 * @plugindesc タイマー自動一時停止プラグイン
 * @author n2naokun(柊菜緒)
 *
 * @help メッセージウィンドウが表示中自動的にタイマーを一時停止します。
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
Imported.HS_TimerAutoPause = true;
// 他のプラグインとの連携用シンボル

(function (_global) {

   var Game_Timer_update = Game_Timer.prototype.update;
   Game_Timer.prototype.update = function (sceneActive) {
      Game_Timer_update.call(this, sceneActive && !$gameMessage.isBusy());
   };

})(this);