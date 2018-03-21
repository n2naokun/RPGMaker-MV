//=============================================================================
// AutoTextFeed.js
// ----------------------------------------------------------------------------
// Copyright (c) 2017 n2naokun(柊菜緒)
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.0.1 2018/03/21 ウィンドウ非表示プラグインと連携
// 1.0.0 2018/03/21 初版
// ----------------------------------------------------------------------------
// [Twitter]: https://twitter.com/n2naokun/
// [GitHub] : https://github.com/n2naokun/
//=============================================================================

/*:
 * @plugindesc テキスト自動送りプラグイン
 * @author n2naokun(柊菜緒)
 *
 * @help テキストウィンドウの表示が完了してから指定時間後
 * 自動的に次のテキストを表示するプラグインです。
 * 
 * プラグインコマンド
 * 自動送りの開始
 * AutoTextFeed Start 時間(×0.1秒)
 * 自動送りの停止
 * AutoTextFeed Stop
 * 
 * 使用例
 * AutoTextFeed Start 10
 * (0.1×10なので1秒待ち)
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
Imported.AutoTextFeed = true;
// 他のプラグインとの連携用シンボル

(function (_global) {

   var nextMessageWait = 60, feedWaitCount = 0, messageAutoFeed = false;

   var Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
   Game_Interpreter.prototype.pluginCommand = function (command, args) {
      Game_Interpreter_pluginCommand.apply(this, arguments);
      if (command == "AutoTextFeed") {
         if (args[0] == "Start") {
            var wait = Number(args[1]);
            if (!isNaN(wait)) {
               nextMessageWait = wait * 6;
            } else {
               nextMessageWait = 60;
            }
            messageAutoFeed = true;
         } else if (args[0] == "Stop") {
            messageAutoFeed = false;
         }
      }
   };

   // 自動送りできるように拡張
   var Window_Message_isTriggered = Window_Message.prototype.isTriggered;
   Window_Message.prototype.isTriggered = function () {
      return Window_Message_isTriggered.call(this) || this.autoFeed();
   };

   // 自動送りするかチェック
   Window_Message.prototype.autoFeed = function () {
      if (messageAutoFeed && (feedWaitCount >= nextMessageWait)) {
         this.feedWaitCountClear();
         return true;
      }
      return false;
   };

   var Window_Message_update = Window_Message.prototype.update;
   Window_Message.prototype.update = function () {
      if (Window_Message_isTriggered.call(this)) {
         this.feedWaitCountClear();
      }
      Window_Message_update.call(this);
      
      // メッセージウィンドウ非表示プラグインが導入されている場合非表示時にウェイトを加算しない
      if (!this.isHidden) {
         if (this.updateInput())
            feedWaitCount++;
      } else {
         if (this.updateInput() && !this.isHidden())
            feedWaitCount++;
      }
   };

   Window_Message.prototype.feedWaitCountClear = function () {
      feedWaitCount = 0;
   };

})(this);