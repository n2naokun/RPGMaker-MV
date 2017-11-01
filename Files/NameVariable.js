//=============================================================================
// NameVariable.js
// ----------------------------------------------------------------------------
// Copyright (c) 2017 n2naokun(柊菜緒)
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.0.0 2017/10/29 初版
// ----------------------------------------------------------------------------
// [Twitter]: https://twitter.com/n2naokun/
// [GitHub] : https://github.com/n2naokun/
//=============================================================================

/*:
 * @plugindesc 名前を付けたスイッチを作れるプラグイン
 * @author n2naokun(柊菜緒)
 *
 * @help 分岐で使用する時はスクリプトから
 * $switches["スイッチの名前"]
 * 
 * スイッチを設定するときはプラグインコマンドから
 * SetSwitch スイッチの名前 ONまたはOFF
 * ON/OFF以外にもTrue/true/有効 または False/false/無効 が使えます
 * 
 * ※イベントの出現条件には使用できません。
 * 
 * 利用規約：
 *  作者に無断で改変、再配布が可能で、利用形態（商用、18禁利用等）
 *  についても制限はありません。
 *  このプラグインはもうあなたのものです。
 */

"use strict";//厳格なエラーチェック

(function (_global) {
   // スイッチを作成
   window.$switches = {};

   var DataManager_createGameObjects = DataManager.createGameObjects;
   DataManager.createGameObjects = function () {
      DataManager_createGameObjects.call(this);
      $switches = new exSwitches();
   };

   var DataManager_makeSaveContents = DataManager.makeSaveContents;
   DataManager.makeSaveContents = function () {
      var contents = DataManager_makeSaveContents.call(this);
      contents.exSwitches = $switches;
      return contents;
   };

   var DataManager_extractSaveContents = DataManager.extractSaveContents;
   DataManager.extractSaveContents = function (contents) {
      DataManager_extractSaveContents.call(this, contents);
      $switches = contents.exSwitches;
   };

   var Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
   Game_Interpreter.prototype.pluginCommand = function (command, args) {
      switch (command) {
         case "SetSwitch":
            $switches[args[0]] = toBoolean(args[1]);
            break;
      }
      Game_Interpreter_pluginCommand.call(this, command, args);
   };

   function toBoolean(str) {
      if (str === "ON" || str === "True" || str === "true" || str === "有効") {
         return true;
      } else if (str === "OFF" || str === "False" || str === "false" || str === "無効") {
         return false;
      } else {
         return false;
      }
   }

   // 空のオブジェクトを定義
   function exSwitches() {

   }

})(this);
