//=============================================================================
// SimpleSingleActorMenu.js
// ----------------------------------------------------------------------------
// Copyright (c) 2017 n2naokun(柊菜緒)
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.1.2 2017/10/28 競合が発生しにくいように調整・修正履歴の修正
// 1.1.1 2017/10/25 ステータス画面で余計なキーが反応しないように変更
// 1.1.0 2017/10/22 このプラグインの読み込み状況を他のプラグインからわかるように改修
// 1.0.1 2017/10/21 うっかり並び替えボタンが表示されていたのを修正
// 1.0.0 2017/10/21 初版
// ----------------------------------------------------------------------------
// [Twitter]: https://twitter.com/n2naokun/
// [GitHub] : https://github.com/n2naokun/
//=============================================================================

/*:
 * @plugindesc シンプルなメニュー画面を提供するプラグインです。
 * 恐らく簡易的なシングルアクタープラグインとして動作すると思われます。
 * @author n2naokun(柊菜緒)
 *
 * @help プラグインコマンドなどは有りません。
 * メニューのコマンドのみを画面中央に表示します。
 * 
 * 利用規約：
 *  作者に無断で改変、再配布が可能で、利用形態（商用、18禁利用等）
 *  についても制限はありません。
 *  このプラグインはもうあなたのものです。
 */

"use strict";//厳格なエラーチェック

var Imported = Imported || {};
Imported.SimpleSingleActorMenu = true;

(function (_global) {
   Scene_Menu.prototype.create = function () {
      Scene_MenuBase.prototype.create.call(this);
      this.createCommandWindow();
      this._commandWindow.x = Graphics.boxWidth / 2 - this._commandWindow.width / 2;
      this._commandWindow.y = Graphics.boxHeight / 2 - this._commandWindow.height / 2;
   };

   Window_MenuCommand.prototype.makeCommandList = function () {
      this.addMainCommands();
      this.addOriginalCommands();
      this.addOptionsCommand();
      this.addSaveCommand();
      this.addGameEndCommand();
   };

   Scene_Menu.prototype.createCommandWindow = function () {
      this._commandWindow = new Window_MenuCommand(0, 0);
      this._commandWindow.setHandler("item", this.commandItem.bind(this));
      this._commandWindow.setHandler("skill", this.onPersonalOk.bind(this));
      this._commandWindow.setHandler("equip", this.onPersonalOk.bind(this));
      this._commandWindow.setHandler("status", this.onPersonalOk.bind(this));
      this._commandWindow.setHandler("options", this.commandOptions.bind(this));
      this._commandWindow.setHandler("save", this.commandSave.bind(this));
      this._commandWindow.setHandler("gameEnd", this.commandGameEnd.bind(this));
      this._commandWindow.setHandler("cancel", this.popScene.bind(this));
      this.commandWindowSetHandler(); // ハンドラセット用関数
      this.addWindow(this._commandWindow);
   };

   Scene_Menu.prototype.start = function () {
      Scene_MenuBase.prototype.start.call(this);
   };

   Scene_ItemBase.prototype.determineItem = function () {
      var action = new Game_Action(this.user());
      var item = this.item();
      action.setItemObject(item);
      this.useItem();
      this.activateItemWindow();
   };

   Scene_ItemBase.prototype.itemTargetActors = function () {
      var action = new Game_Action(this.user());
      action.setItemObject(this.item());
      if (!action.isForFriend()) {
         return [];
      } else if (action.isForAll()) {
         return $gameParty.members();
      } else {
         return $gameParty.members();
      }
   };

   Scene_Status.prototype.create = function () {
      Scene_MenuBase.prototype.create.call(this);
      this._statusWindow = new Window_Status();
      this._statusWindow.setHandler("cancel", this.popScene.bind(this));
      this._statusWindow.reserveFaceImages();
      this.addWindow(this._statusWindow);
   };

})(this);

Scene_Menu.prototype.commandWindowSetHandler = function () {
   // ここをオーバーライドして
   // this._commandWindow.setHandler('シンボル', 呼ばれる関数.bind(this));
   // このように処理を追加すると競合なく追加可能
};

Window_MenuCommand.prototype.addOriginalCommands = function () {
   // ここをオーバーライドすることでメニューにコマンドを追加できます。
};
